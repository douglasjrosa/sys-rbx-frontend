import { cnpj } from "cpf-cnpj-validator";

export type PackType = "box" | "crate" | "pallet" | "any";
export type Unit = "mm" | "cm";
export type IsExportable = "yes" | "no" | "optional";

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

export interface BoxTemplate {
  name: string;
  packType: PackType;
  prodTypes: number[];
  sizeLimit: number;
  weightLimit: number;
  isExportable: IsExportable;
}

export interface PackagingFormData {
  packType: PackType;
  prodType: number;
  isExport: boolean;
  weight: number;
  unit: Unit;
  length: number;
  width: number;
  height?: number;
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
  sizeLimit: number
): boolean {
  const baseAndLidM2 = length * width;
  const sideM2 = length * height;
  const endM2 = width * height;
  const biggestM2 = Math.max(baseAndLidM2, sideM2, endM2);
  const boxM3 = length * width * height;
  const biggestMeasure = Math.max(length, width, height);
  return (
    baseAndLidM2 > sizeLimit ||
    sideM2 > sizeLimit ||
    endM2 > sizeLimit ||
    biggestM2 > sizeLimit ||
    boxM3 > sizeLimit ||
    biggestMeasure > sizeLimit
  );
}

export function isOverweight(weight: number, weightLimit: number): boolean {
  return weight > weightLimit;
}

export function isEligible(
  oversized: boolean,
  overweight: boolean
): boolean {
  return !oversized && !overweight;
}

function isExportMatch(formIsExport: boolean, templateIsExportable: IsExportable): boolean {
  if (templateIsExportable === "optional") return true;
  if (formIsExport) return templateIsExportable === "yes";
  return templateIsExportable === "no";
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
    const prodTypeMatch = template.prodTypes.includes(formData.prodType);
    const exportMatch = isExportMatch(formData.isExport, template.isExportable);

    if (!packTypeMatch || !prodTypeMatch || !exportMatch) continue;

    const oversized = isOversized(
      lengthM,
      widthM,
      heightM,
      template.sizeLimit
    );
    const overweight = isOverweight(formData.weight, template.weightLimit);

    if (isEligible(oversized, overweight)) {
      eligible.push(template.name);
    }
  }

  return eligible;
}
