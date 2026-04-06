import axios from "axios";
import type { NextApiRequest, NextApiResponse } from "next";
import type { CalculadoraSubmissionPayload } from "@/lib/calculadora-de-embalagem/utils/calculadoraSubmissionPayload";
import { buildStrapiQuoteCreateBody } from "@/lib/calculadora-de-embalagem/utils/strapiQuotePayload";
import { getStrapiRestBaseUrl } from "@/lib/strapiRestBaseUrl";

type SubmitQuoteRequestBody = {
  payload: CalculadoraSubmissionPayload;
  /** Optional Strapi users-permissions user id (vendedor). */
  vendedorId?: number;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Only POST is allowed" });
  }

  const baseUrl = getStrapiRestBaseUrl();
  const token = process.env.ATORIZZATION_TOKEN;

  if (!baseUrl || !token) {
    return res.status(500).json({
      message:
        "Server misconfiguration: STRAPI_API_URL / NEXT_PUBLIC_STRAPI_API_URL or ATORIZZATION_TOKEN",
    });
  }

  const { payload, vendedorId } = req.body as SubmitQuoteRequestBody;
  if (!payload || typeof payload !== "object") {
    return res.status(400).json({ message: "payload is required" });
  }

  const defaultVendedorRaw = process.env.CALCULADORA_QUOTE_VENDEDOR_ID;
  const defaultVendedorId =
    defaultVendedorRaw != null && defaultVendedorRaw !== ""
      ? Number(defaultVendedorRaw)
      : undefined;

  const resolvedVendedorId =
    vendedorId != null && Number.isFinite(vendedorId)
      ? Math.floor(vendedorId)
      : defaultVendedorId != null && Number.isFinite(defaultVendedorId)
        ? Math.floor(defaultVendedorId)
        : undefined;

  try {
    const strapiBody = buildStrapiQuoteCreateBody(payload, {
      vendedorId: resolvedVendedorId,
    });

    const response = await axios.post(
      `${baseUrl}/quotes`,
      strapiBody,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        validateStatus: () => true,
      },
    );

    if (response.status >= 400) {
      return res.status(response.status).json(response.data);
    }

    return res.status(200).json(response.data);
  } catch (error: unknown) {
    const err = error as { response?: { status?: number; data?: unknown } };
    const status = err.response?.status ?? 500;
    const data = err.response?.data ?? { message: "Internal Server Error" };
    return res.status(status).json(data);
  }
}
