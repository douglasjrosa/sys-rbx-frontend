import type { AssemblyType } from "./packagingCalculator";
import type { ElegibleTemplateResult } from "./types";

export const ASSEMBLY_SURCHARGE_FRACTION_OF_VFINAL = 0.1;

/** Export fumigation line matches pricing card (10% of vFinal). */
export const EXPORT_FUMIGATION_FRACTION_OF_VFINAL = 0.1;

export function assemblyMontageChargeFromVFinal(
  vFinal: number,
  assembly: AssemblyType | null | undefined,
): number {
  if (assembly == null || assembly === "disassembled") return 0;
  return vFinal * ASSEMBLY_SURCHARGE_FRACTION_OF_VFINAL;
}

export function numericPriceForSort(item: ElegibleTemplateResult): number {
  const raw = item.priceResult?.info?.vFinal;
  const n = raw == null ? NaN : Number(raw);
  if (Number.isFinite(n)) return n;
  return Number.POSITIVE_INFINITY;
}

export function sortTemplateResultsByPriceAsc(
  items: ElegibleTemplateResult[],
): ElegibleTemplateResult[] {
  return [...items].sort((a, b) => {
    const na = numericPriceForSort(a);
    const nb = numericPriceForSort(b);
    if (na !== nb) return na - nb;
    return a.name.localeCompare(b.name);
  });
}

/** Line items matching result card: Preço + Fumigação + Montagem − Descontos. */
export type CalculadoraPricingQuote = {
  basePriceBrl: number;
  fumigationBrl: number;
  assemblyBrl: number;
  discountsTotalBrl: number;
  totalBrl: number;
};

export function buildCalculadoraPricingQuote(params: {
  vFinal: number;
  isExport: boolean;
  assembly: AssemblyType | null | undefined;
  discountsTotalBrl: number;
}): CalculadoraPricingQuote {
  const basePriceBrl = params.vFinal;
  const fumigationBrl = params.isExport
    ? basePriceBrl * EXPORT_FUMIGATION_FRACTION_OF_VFINAL
    : 0;
  const assemblyBrl = assemblyMontageChargeFromVFinal(
    basePriceBrl,
    params.assembly,
  );
  const discountsTotalBrl = Math.max(0, params.discountsTotalBrl);
  const totalBrl = Math.max(
    0,
    basePriceBrl + fumigationBrl + assemblyBrl - discountsTotalBrl,
  );
  return {
    basePriceBrl,
    fumigationBrl,
    assemblyBrl,
    discountsTotalBrl,
    totalBrl,
  };
}
