import type { AppliedDiscounts } from "./appliedDiscounts";
import { validateEmail, type PackagingFormData } from "./packagingCalculator";
import type { ContactChannel } from "./contactChannel";
import {
  buildCalculadoraPricingQuote,
  type CalculadoraPricingQuote,
} from "./pricing";
import type { ElegibleTemplateResult } from "./types";

/** User clarity about the chosen product before contacting sales. */
export type CustomerClarity = "clear" | "doubt";

/** Pricing snapshot for persistence (field names aligned with backend). */
export type CalculadoraSubmissionPricing = {
  assemblyCost: number;
  basePrice: number;
  totalDiscount: number;
  exportTreatmentCost: number;
  totalValue: number;
  qty: number;
};

export type CalculadoraSubmissionCustomer = {
  customerClarity: CustomerClarity;
  contactChannel: ContactChannel;
  customerCnpj?: string;
  /** E-mail for NF-e delivery. */
  emailNfe?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  /** Note to the sales rep (Conferir step); empty string when omitted by user. */
  message: string;
};

/*
 * Phase 2 (multi-line cart): discount policy and Strapi quote payload may aggregate
 * several CalculadoraCartLine rows from localStorage; this builder stays single-line
 * until the backend accepts an array of packaging items per submission.
 */

type PackagingFormFieldsWithoutCustomer = Omit<
  Partial<PackagingFormData>,
  | "customerCnpj"
  | "emailNfe"
  | "customerName"
  | "customerEmail"
  | "customerPhone"
  | "contactChannel"
>;

export type CalculadoraSubmissionPackaging = PackagingFormFieldsWithoutCustomer & {
  appliedDiscounts: AppliedDiscounts;
  /** Product label collected on the price step before Conferir. */
  prodName?: string;
  /** Product code collected on the price step before Conferir. */
  prodCode?: string;
};

/**
 * Snapshot for future persistence (Strapi / DB). Built on submit from wizard state.
 * Top-level fields: submittedAt, customer, pricing, packaging.
 */
export type CalculadoraSubmissionPayload = {
  submittedAt: string;
  customer: CalculadoraSubmissionCustomer;
  pricing: CalculadoraSubmissionPricing;
  packaging: CalculadoraSubmissionPackaging;
};

function mapPricingQuoteToSubmission(
  quote: CalculadoraPricingQuote,
  qty: number,
): CalculadoraSubmissionPricing {
  return {
    assemblyCost: quote.assemblyBrl,
    basePrice: quote.basePriceBrl,
    totalDiscount: quote.discountsTotalBrl,
    exportTreatmentCost: quote.fumigationBrl,
    totalValue: quote.totalBrl,
    qty,
  };
}

export function buildCalculadoraSubmissionPayload(params: {
  form: Partial<PackagingFormData>;
  chosenRow: ElegibleTemplateResult | undefined;
  appliedDiscounts: AppliedDiscounts;
  customerClarity: CustomerClarity;
  qty: number;
  message?: string;
  prodName?: string;
  prodCode?: string;
}): CalculadoraSubmissionPayload | null {
  const {
    form,
    chosenRow,
    appliedDiscounts,
    customerClarity,
    qty,
    message,
    prodName,
    prodCode,
  } = params;
  const raw = chosenRow?.priceResult?.info?.vFinal;
  const vFinal = raw == null ? NaN : Number(raw);
  if (!Number.isFinite(vFinal)) {
    return null;
  }
  if (!Number.isInteger(qty) || qty < 1) {
    return null;
  }
  if (form.contactChannel == null) {
    return null;
  }
  const {
    customerCnpj,
    emailNfe,
    customerName,
    customerEmail,
    customerPhone,
    contactChannel,
    ...formRest
  } = form;
  const emailNfeTrim = (emailNfe ?? "").trim();
  if (!emailNfeTrim || !validateEmail(emailNfeTrim)) {
    return null;
  }
  const pricingQuote = buildCalculadoraPricingQuote({
    vFinal,
    isExport: form.isExport === true,
    assembly: form.assembly,
    discountsTotalBrl: appliedDiscounts.totalValue,
  });
  const messageForPayload = (message ?? "").trim();
  const prodNameTrim = (prodName ?? "").trim();
  const prodCodeTrim = (prodCode ?? "").trim();
  return {
    submittedAt: new Date().toISOString(),
    customer: {
      customerClarity,
      contactChannel,
      customerCnpj,
      emailNfe: emailNfeTrim,
      customerName,
      customerEmail,
      customerPhone,
      message: messageForPayload,
    },
    pricing: mapPricingQuoteToSubmission(pricingQuote, qty),
    packaging: {
      ...formRest,
      appliedDiscounts,
      ...(prodNameTrim !== "" ? { prodName: prodNameTrim } : {}),
      ...(prodCodeTrim !== "" ? { prodCode: prodCodeTrim } : {}),
    },
  };
}
