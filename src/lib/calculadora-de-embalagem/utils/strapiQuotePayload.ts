import type { ContactChannel } from "./contactChannel";
import type { CalculadoraSubmissionPayload } from "./calculadoraSubmissionPayload";
import type { AppliedDiscountLine } from "./appliedDiscounts";

/**
 * Strapi `quote` attributes (flat). Only `discounts` is JSON (array of lines).
 */
export type StrapiQuoteCreateBody = {
  data: StrapiQuoteFlatData;
};

export type StrapiQuoteFlatData = {
  status: "Na fila" | "Em andamento" | "Concluído";
  turnedIntoBusiness: boolean;
  submittedAt: string;
  customerClarity: "clear" | "doubt";
  contactChannel: ContactChannel;
  customerCnpj?: string;
  emailNfe?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  message?: string;
  assemblyCost: number;
  basePrice: number;
  totalDiscount: number;
  exportTreatmentCost: number;
  totalValue: number;
  qty: number;
  prodName?: string;
  prodCode?: string;
  packType?: "box" | "crate" | "pallet" | "any";
  prodType?: number;
  isExport?: boolean;
  weight?: number;
  measuresOf?: "internal" | "product";
  unit?: "mm" | "cm";
  length?: number;
  width?: number;
  height?: number;
  clearance?: number;
  isUnitizedContent?: boolean;
  isDistributedWeight?: boolean;
  template?: string;
  assembly?: string;
  discounts: AppliedDiscountLine[];
  vendedor?: number;
};

export function buildStrapiQuoteFlatData(
  payload: CalculadoraSubmissionPayload,
  options?: { vendedorId?: number },
): StrapiQuoteFlatData {
  const { customer, pricing, packaging } = payload;
  const { appliedDiscounts, prodName, prodCode, ...packRest } = packaging;

  const flat: StrapiQuoteFlatData = {
    status: "Na fila",
    turnedIntoBusiness: false,
    submittedAt: payload.submittedAt,
    customerClarity: customer.customerClarity,
    contactChannel: customer.contactChannel,
    assemblyCost: pricing.assemblyCost,
    basePrice: pricing.basePrice,
    totalDiscount: pricing.totalDiscount,
    exportTreatmentCost: pricing.exportTreatmentCost,
    totalValue: pricing.totalValue,
    qty: pricing.qty,
    discounts: appliedDiscounts.discounts,
  };

  const prodNameTrim = prodName?.trim();
  if (prodNameTrim) {
    flat.prodName = prodNameTrim;
  }
  const prodCodeTrim = prodCode?.trim();
  if (prodCodeTrim) {
    flat.prodCode = prodCodeTrim;
  }

  if (customer.customerCnpj) {
    flat.customerCnpj = customer.customerCnpj;
  }
  const emailNfeTrim = customer.emailNfe?.trim();
  if (emailNfeTrim) {
    flat.emailNfe = emailNfeTrim;
  }
  if (customer.customerName) {
    flat.customerName = customer.customerName;
  }
  if (customer.customerEmail) {
    flat.customerEmail = customer.customerEmail;
  }
  if (customer.customerPhone) {
    flat.customerPhone = customer.customerPhone;
  }
  if (customer.message !== "") {
    flat.message = customer.message;
  }

  if (packRest.packType != null) {
    flat.packType = packRest.packType;
  }
  if (packRest.prodType != null) {
    flat.prodType = packRest.prodType;
  }
  if (packRest.isExport != null) {
    flat.isExport = packRest.isExport;
  }
  if (packRest.weight != null && Number.isFinite(packRest.weight)) {
    flat.weight = packRest.weight;
  }
  if (packRest.measuresOf != null) {
    flat.measuresOf = packRest.measuresOf;
  }
  if (packRest.unit != null) {
    flat.unit = packRest.unit;
  }
  if (packRest.length != null && Number.isFinite(packRest.length)) {
    flat.length = packRest.length;
  }
  if (packRest.width != null && Number.isFinite(packRest.width)) {
    flat.width = packRest.width;
  }
  if (packRest.height != null && Number.isFinite(packRest.height)) {
    flat.height = packRest.height;
  }
  if (packRest.clearance != null && Number.isFinite(packRest.clearance)) {
    flat.clearance = packRest.clearance;
  }
  if (packRest.isUnitizedContent != null) {
    flat.isUnitizedContent = packRest.isUnitizedContent;
  }
  if (packRest.isDistributedWeight === true || packRest.isDistributedWeight === false) {
    flat.isDistributedWeight = packRest.isDistributedWeight;
  }
  if (packRest.template) {
    flat.template = packRest.template;
  }
  if (packRest.assembly != null) {
    flat.assembly = packRest.assembly;
  }

  if (
    options?.vendedorId != null &&
    Number.isFinite(options.vendedorId) &&
    options.vendedorId > 0
  ) {
    flat.vendedor = Math.floor(options.vendedorId);
  }

  return flat;
}

export function buildStrapiQuoteCreateBody(
  payload: CalculadoraSubmissionPayload,
  options?: { vendedorId?: number },
): StrapiQuoteCreateBody {
  const flat = buildStrapiQuoteFlatData(payload, options);
  const data = Object.fromEntries(
    Object.entries(flat).filter(([, v]) => v !== undefined),
  ) as StrapiQuoteFlatData;
  return { data };
}
