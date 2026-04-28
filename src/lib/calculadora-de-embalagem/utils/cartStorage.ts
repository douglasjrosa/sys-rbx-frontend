import type { AssemblyType, PackagingFormData } from "./packagingCalculator";
import { CALCULADORA_CART_STORAGE_KEY } from "./layoutConstants";
import type { ElegibleTemplateResult } from "./types";

export const CALCULADORA_CART_STORAGE_VERSION = 1;

const CART_FORM_SNAPSHOT_KEYS: (keyof PackagingFormData)[] = [
  "packType",
  "prodType",
  "isExport",
  "weight",
  "measuresOf",
  "unit",
  "length",
  "width",
  "height",
  "clearance",
  "isUnitizedContent",
  "isDistributedWeight",
  "customerCnpj",
  "emailNfe",
  "customerName",
  "customerEmail",
  "customerPhone",
  "contactChannel",
  "template",
  "assembly",
];

export type CalculadoraCartLine = {
  id: string;
  savedAt: string;
  prodName: string;
  prodCode: string;
  qty: number;
  template: string;
  assembly: AssemblyType | null;
  formSnapshot: Partial<PackagingFormData>;
  priceRow: ElegibleTemplateResult;
};

export type CalculadoraCartStored = {
  version: number;
  lines: CalculadoraCartLine[];
};

function newLineId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `line-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

export function pickCalculadoraCartFormSnapshot(
  form: Partial<PackagingFormData>,
): Partial<PackagingFormData> {
  const out: Partial<PackagingFormData> = {};
  for (const key of CART_FORM_SNAPSHOT_KEYS) {
    const v = form[key];
    if (v !== undefined) {
      (out as Record<string, unknown>)[key] = v;
    }
  }
  return out;
}

export function readCalculadoraCart(): CalculadoraCartStored {
  if (typeof window === "undefined") {
    return { version: CALCULADORA_CART_STORAGE_VERSION, lines: [] };
  }
  try {
    const raw = window.localStorage.getItem(CALCULADORA_CART_STORAGE_KEY);
    if (!raw) {
      return { version: CALCULADORA_CART_STORAGE_VERSION, lines: [] };
    }
    const parsed = JSON.parse(raw) as unknown;
    if (
      parsed &&
      typeof parsed === "object" &&
      "version" in parsed &&
      "lines" in parsed &&
      Array.isArray((parsed as CalculadoraCartStored).lines)
    ) {
      return parsed as CalculadoraCartStored;
    }
  } catch {
    /* ignore */
  }
  return { version: CALCULADORA_CART_STORAGE_VERSION, lines: [] };
}

export function writeCalculadoraCart(data: CalculadoraCartStored): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      CALCULADORA_CART_STORAGE_KEY,
      JSON.stringify(data),
    );
  } catch {
    /* quota or private mode */
  }
}

export function appendCalculadoraCartLine(line: Omit<CalculadoraCartLine, "id" | "savedAt"> & {
  id?: string;
  savedAt?: string;
}): void {
  const prev = readCalculadoraCart();
  const full: CalculadoraCartLine = {
    id: line.id ?? newLineId(),
    savedAt: line.savedAt ?? new Date().toISOString(),
    prodName: line.prodName,
    prodCode: line.prodCode,
    qty: line.qty,
    template: line.template,
    assembly: line.assembly,
    formSnapshot: line.formSnapshot,
    priceRow: line.priceRow,
  };
  writeCalculadoraCart({
    version: CALCULADORA_CART_STORAGE_VERSION,
    lines: [...prev.lines, full],
  });
}
