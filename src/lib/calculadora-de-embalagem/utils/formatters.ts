import type { PackagingFormData } from "./packagingCalculator";

export const CNPJ_INPUT_MAX_DIGITS = 14;

/** Masks digits to xx.xxx.xxx/xxxx-xx as the user types. */
export function formatCnpjMaskInput(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, CNPJ_INPUT_MAX_DIGITS);
  if (digits.length <= 2) return digits;
  if (digits.length <= 5) {
    return `${digits.slice(0, 2)}.${digits.slice(2)}`;
  }
  if (digits.length <= 8) {
    return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5)}`;
  }
  if (digits.length <= 12) {
    return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${
      digits.slice(8)}`;
  }
  return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${
    digits.slice(8, 12)}-${digits.slice(12)}`;
}

export function formatMoneyBrlPtBr(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

/** Formats a fraction (e.g. 0.03) as a percent label for pt-BR. */
export function formatPercentFraction(fraction: number): string {
  return `${(fraction * 100).toLocaleString("pt-BR", {
    maximumFractionDigits: 2,
  })}%`;
}

export function formatTemplateModelLabel(templateKey: string): string {
  return templateKey
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/** L x W [x H unit (alt.)] matching user unit (mm/cm); same rules as summary. */
export function formatSimulationDimensionsLine(
  formData: Partial<PackagingFormData>,
): string | null {
  if (!formData.length || !formData.width) return null;
  const u = formData.unit ?? "mm";
  const hasHeight =
    formData.packType !== "pallet" &&
    formData.height != null &&
    formData.height > 0;
  if (hasHeight) {
    return (
      `${formData.length} x ${formData.width} x ${formData.height} ${u} (alt.)`
    );
  }
  return `${formData.length} x ${formData.width} ${u}`;
}
