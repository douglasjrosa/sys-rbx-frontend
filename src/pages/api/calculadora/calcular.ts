import type { NextApiRequest, NextApiResponse } from "next";

import boxTemplates from "@/pages/calculadora-de-embalagem/_data/box-templates.json";
import type { BoxTemplate } from "@/lib/calculadora-de-embalagem/utils/packagingCalculator";
import {
  CALC_CX_QUERY_ALLOWLIST,
  findBoxTemplateByName,
  mergeCalcCxPatches,
} from "@/lib/calculadora-de-embalagem/utils/templateCalcParams";

const FETCH_TIMEOUT_MS = 30000;

/** mLucro for RBX table "Vip" (must match getTabelas in WP RBX.php). */
const CALCULADORA_DEFAULT_TABELA_MLUCRO = "0.3";

function firstQueryValue(
  v: string | string[] | undefined,
): string | undefined {
  if (v === undefined) return undefined;
  const s = Array.isArray(v) ? v[0] : v;
  return s === "" ? undefined : s;
}

function parseExportFlag(
  exportVal: unknown,
  isExportVal: unknown,
): boolean {
  const truthy = (x: unknown) =>
    x === true ||
    x === 1 ||
    (typeof x === "string" &&
      (x === "1" || x.toLowerCase() === "true" || x.toLowerCase() === "on"));
  return truthy(exportVal) || truthy(isExportVal);
}

type CalcBody = {
  modelo?: unknown;
  comprimento?: unknown;
  largura?: unknown;
  altura?: unknown;
  pesoProd?: unknown;
  empresa?: unknown;
  export?: unknown;
  isExport?: unknown;
};

/**
 * Proxies packaging price calculation to the WordPress/RBX API.
 * GET (legacy) or POST JSON; does not save.
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "GET" && req.method !== "POST") {
    res.setHeader("Allow", "GET, POST");
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const rbxApiUrl = (process.env.RIBERMAX_API_URL || "").replace(/\/$/, "");
  const rbxApiToken = process.env.RIBERMAX_API_TOKEN as string;
  const calcEmail =
    process.env.CALCULADORA_API_EMAIL || "calculadora@ribermax.com.br";

  if (!rbxApiUrl || !rbxApiToken) {
    res.status(500).json({
      error: "Server configuration missing (RIBERMAX_API_URL/TOKEN)",
    });
    return;
  }

  let modelo: string | undefined;
  let comprimento: string | undefined;
  let largura: string | undefined;
  let altura: string | undefined;
  let pesoProd: string | undefined;
  let empresa: string | undefined;
  let isExport = false;
  const restFromClient: Record<string, string | string[] | undefined> = {};

  if (req.method === "POST") {
    const b = req.body as CalcBody | undefined;
    if (!b || typeof b !== "object") {
      res.status(400).json({ error: "Expected JSON body" });
      return;
    }
    modelo = typeof b.modelo === "string" ? b.modelo : undefined;
    comprimento =
      b.comprimento !== undefined && b.comprimento !== null
        ? String(b.comprimento)
        : undefined;
    largura =
      b.largura !== undefined && b.largura !== null
        ? String(b.largura)
        : undefined;
    altura =
      b.altura !== undefined && b.altura !== null
        ? String(b.altura)
        : undefined;
    pesoProd =
      b.pesoProd !== undefined && b.pesoProd !== null
        ? String(b.pesoProd)
        : undefined;
    empresa =
      b.empresa !== undefined && b.empresa !== null
        ? String(b.empresa)
        : undefined;
    isExport = parseExportFlag(b.export, b.isExport);
  } else {
    const q = req.query;
    modelo = firstQueryValue(q.modelo);
    comprimento = firstQueryValue(q.comprimento);
    largura = firstQueryValue(q.largura);
    altura = firstQueryValue(q.altura);
    pesoProd = firstQueryValue(q.pesoProd);
    empresa = firstQueryValue(q.empresa);
    isExport = parseExportFlag(q.export, q.isExport);
    const skip = new Set([
      "modelo",
      "comprimento",
      "largura",
      "altura",
      "pesoProd",
      "empresa",
      "export",
      "isExport",
    ]);
    Object.keys(q).forEach((k) => {
      if (!skip.has(k)) restFromClient[k] = q[k];
    });
  }

  if (!modelo || !comprimento || !largura || !empresa) {
    res.status(400).json({
      error: "Missing required params: modelo, comprimento, largura, empresa",
    });
    return;
  }

  const template = findBoxTemplateByName(
    boxTemplates as unknown as BoxTemplate[],
    modelo,
  );
  const cxPatches = mergeCalcCxPatches(
    template?.calcProfile,
    isExport,
    template?.packType,
  );

  const params = new URLSearchParams({
    calcular: "1",
    modelo,
    comprimento,
    largura,
    empresa,
    Token: rbxApiToken,
  });

  if (altura !== undefined && altura !== "") {
    params.set("altura", altura);
  }
  if (pesoProd !== undefined && pesoProd !== "") {
    params.set("pesoProd", pesoProd);
  }

  Object.entries(cxPatches).forEach(([k, v]) => {
    params.set(k, v);
  });

  Object.entries(restFromClient).forEach(([k, v]) => {
    if (!CALC_CX_QUERY_ALLOWLIST.has(k)) return;
    if (v === undefined || v === "") return;
    params.set(k, Array.isArray(v) ? v[0] : String(v));
  });

  params.set("tabela", CALCULADORA_DEFAULT_TABELA_MLUCRO);
  params.set("fields", "vFinal,titulo,error");

  const queryStr = params.toString();
  const urlsToTry = [
    `${rbxApiUrl}/produtos?${queryStr}`,
    rbxApiUrl.endsWith("/api")
      ? `${rbxApiUrl.replace(/\/api$/, "")}/produtos?${queryStr}`
      : null,
  ].filter(Boolean) as string[];

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  let lastError: string | null = null;
  let lastRaw: string | null = null;
  let lastStatus = 0;

  for (const externalUrl of urlsToTry) {
    try {
      const response = await fetch(externalUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Token: rbxApiToken,
          Email: calcEmail,
        },
        signal: controller.signal,
      });

      const text = await response.text();
      lastStatus = response.status;
      lastRaw = text.substring(0, 500);

      let data: unknown;
      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        lastError = `Invalid JSON at ${externalUrl}`;
        continue;
      }

      clearTimeout(timeout);

      if (!response.ok) {
        const errMsg =
          (data as { message?: string })?.message ||
          (data as { error?: string })?.error ||
          response.statusText;
        res.status(response.status).json({ error: errMsg });
        return;
      }

      res.status(200).json(data);
      return;
    } catch (err: unknown) {
      lastError = (err as Error)?.message || "Fetch failed";
    }
  }

  clearTimeout(timeout);
  res.status(502).json({
    error: lastError || "Invalid JSON from pricing API",
    raw: lastRaw,
    status: lastStatus,
    hint:
      "Check RIBERMAX_API_URL (try http://localhost/produtos or " +
      "http://localhost/api/produtos)",
  });
}
