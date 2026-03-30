import { cnpj } from "cpf-cnpj-validator";

export type PackType = "box" | "crate" | "pallet" | "any";
export type MeasuresOf = "internal" | "product";
export type Unit = "mm" | "cm";
export type IsExportable = "yes" | "no" | "optional";

/** Maps calculadora templates to RBX $cx defaults (vs PackagingCalculator::addInfo all-on). */
export type CalcProfile =
  | "boxWithElevatedPallet"
  | "boxNoPallet"
  | "crateWithElevatedPallet"
  | "crateNoPallet"
  | "palletOnly";

export const UNITIZED_PROD_TYPES = [1, 2, 3, 4];
export const FRACTIONED_PROD_TYPES = [5, 6, 7];
export const ASK_CONTENT_PROD_TYPES = [8, 9, 10, 11];

export const WEIGHT_THRESHOLD_KG = 200;
export const LENGTH_THRESHOLD_M = 1.2;
export const WIDTH_THRESHOLD_M = 1;

export const PRODUCT_TYPE_LABELS: Record<number, string> = {
  1: "Equipamento Médico / Odontológico",
  2: "Equipamentos p/ Açougue, Restaurante, Sorveteria, etc.",
  3: "Painél Elétrico",
  4: "Equipamento Industrial",
  5: "Alimentos e Bebidas",
  6: "Calçados e Vestuário",
  7: "Peças de Fundição ou Siderurgia",
  8: "Peças / Equipamentos da linha SUCRO e AGRO Indústria",
  9: "Peças / Componentes Náuticos ou Aeronáuticos",
  10: "Peças / Componentes p/ Indústria Automobilística",
  11: "Outro tipo de produto",
};

/** Limits for one commercial context (local vs export). */
export interface TemplateContextRule {
  prodTypes: number[];
  maxSizeLimit: number;
  minSizeLimit: number;
  weightLimit: number;
}

export interface BoxTemplate {
  name: string;
  packType: PackType;
  /** Marketing / spec bullets shown on result cards */
  description?: string[];
  /** When set, pricing proxy merges RBX calcular overrides for this commercial intent. */
  calcProfile?: CalcProfile;
  exportable: IsExportable;
  context: {
    localDelivery?: TemplateContextRule;
    exportation?: TemplateContextRule;
  };
}

export interface PackagingFormData {
  packType: PackType;
  prodType: number;
  isExport: boolean;
  weight: number;
  measuresOf: MeasuresOf;
  unit: Unit;
  length: number;
  width: number;
  height?: number;
  clearance?: number;
  isUnitizedContent?: boolean;
  isDistributedWeight?: boolean | null;
  customerCnpj: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
}

export function toMeters(value: number, unit: Unit): number {
  return unit === "mm" ? value / 1000 : value / 100;
}

export function isOversized(
  length: number,
  width: number,
  height: number,
  maxSizeLimit: number
): boolean {
  const baseAndLidM2 = length * width;
  const sideM2 = length * height;
  const endM2 = width * height;
  const biggestM2 = Math.max(baseAndLidM2, sideM2, endM2);
  const boxM3 = length * width * height;
  const biggestMeasure = Math.max(length, width, height);
  return (
    baseAndLidM2 > maxSizeLimit ||
    sideM2 > maxSizeLimit ||
    endM2 > maxSizeLimit ||
    biggestM2 > maxSizeLimit ||
    boxM3 > maxSizeLimit ||
    biggestMeasure > maxSizeLimit
  );
}

/**
 * Inverse of isOversized for minimum limits. Metrics that are 0 (e.g. side areas
 * when height is 0 for pallets) are ignored so behavior matches isOversized.
 */
export function isUndersized(
  length: number,
  width: number,
  height: number,
  minSizeLimit: number
): boolean {
  const baseAndLidM2 = length * width;
  const sideM2 = length * height;
  const endM2 = width * height;
  const biggestM2 = Math.max(baseAndLidM2, sideM2, endM2);
  const boxM3 = length * width * height;
  const biggestMeasure = Math.max(length, width, height);

  const belowMinimum = (metric: number) => metric > 0 && metric < minSizeLimit;

  return (
    belowMinimum(baseAndLidM2) ||
    belowMinimum(sideM2) ||
    belowMinimum(endM2) ||
    belowMinimum(biggestM2) ||
    belowMinimum(boxM3) ||
    belowMinimum(biggestMeasure)
  );
}

export function isOverweight(weight: number, weightLimit: number): boolean {
  return weight > weightLimit;
}

export function isEligible(
  oversized: boolean,
  undersized: boolean,
  overweight: boolean
): boolean {
  return !oversized && !undersized && !overweight;
}

function isExportMatch(
  formIsExport: boolean,
  templateExportable: IsExportable,
): boolean {
  if (templateExportable === "optional") return true;
  if (formIsExport) return templateExportable === "yes";
  return templateExportable === "no";
}

function resolveContextRule(
  template: BoxTemplate,
  formIsExport: boolean,
): TemplateContextRule | null {
  const { context } = template;
  if (formIsExport) {
    return context.exportation ?? null;
  }
  return context.localDelivery ?? null;
}

export function validateCnpj(cnpjStr: string): boolean {
  const cleaned = cnpjStr.replace(/\D/g, "");
  return cnpj.isValid(cleaned);
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export function validateEmail(email: string): boolean {
  return EMAIL_REGEX.test(email);
}

export function getElegibleTemplates(
  formData: PackagingFormData,
  templates: BoxTemplate[]
): string[] {
  const lengthM = toMeters(formData.length, formData.unit);
  const widthM = toMeters(formData.width, formData.unit);
  const heightM =
    formData.height !== undefined
      ? toMeters(formData.height, formData.unit)
      : 0;

  const eligible: string[] = [];

  for (const template of templates) {
    const packTypeMatch =
      formData.packType === "any" || template.packType === formData.packType;
    const exportMatch = isExportMatch(formData.isExport, template.exportable);

    if (!packTypeMatch || !exportMatch) continue;

    const rule = resolveContextRule(template, formData.isExport);
    if (!rule) continue;

    const prodTypeMatch = rule.prodTypes.includes(formData.prodType);
    if (!prodTypeMatch) continue;

    const oversized = isOversized(
      lengthM,
      widthM,
      heightM,
      rule.maxSizeLimit
    );
    const undersized = isUndersized(
      lengthM,
      widthM,
      heightM,
      rule.minSizeLimit
    );
    const overweight = isOverweight(formData.weight, rule.weightLimit);

    if (isEligible(oversized, undersized, overweight)) {
      eligible.push(template.name);
    }
  }

  return eligible;
}
