import type { ContactChannel } from "./contactChannel";
import type { PackagingFormData } from "./packagingCalculator";
import { formatCnpjMaskInput } from "./formatters";
import { initialForm } from "./formOptions";
import { CUSTOMER_STORAGE_KEY } from "./layoutConstants";

export type CalculadoraCustomerStored = {
  customerName?: string;
  customerEmail?: string;
  customerCnpj?: string;
  /** E-mail for NF-e delivery. */
  emailNfe?: string;
  customerPhone?: string;
  /** Preferred contact channel (Tela 2). */
  contactChannel?: ContactChannel;
};

export function readCalculadoraCustomerStored(): CalculadoraCustomerStored {
  if (typeof window === "undefined") {
    return {};
  }
  try {
    const raw = localStorage.getItem(CUSTOMER_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as CalculadoraCustomerStored;
    return typeof parsed === "object" && parsed != null ? parsed : {};
  } catch {
    return {};
  }
}

/**
 * Fresh wizard form merged with persisted customer fields (same rules as mount hydrate).
 */
export function hydrateInitialFormFromCustomerStorage(): Partial<PackagingFormData> {
  const parsed = readCalculadoraCustomerStored();
  return {
    ...initialForm,
    ...(parsed.contactChannel
      ? { contactChannel: parsed.contactChannel }
      : {}),
    ...(parsed.customerName ? { customerName: parsed.customerName } : {}),
    ...(parsed.customerEmail ? { customerEmail: parsed.customerEmail } : {}),
    ...(parsed.customerCnpj
      ? { customerCnpj: formatCnpjMaskInput(parsed.customerCnpj) }
      : {}),
    ...(parsed.emailNfe ? { emailNfe: parsed.emailNfe } : {}),
    ...(parsed.customerPhone ? { customerPhone: parsed.customerPhone } : {}),
  };
}

export function mergeCalculadoraCustomerStorage(
  patch: Partial<CalculadoraCustomerStored>,
) {
  if (typeof window === "undefined") {
    return;
  }
  try {
    const next = { ...readCalculadoraCustomerStored(), ...patch };
    localStorage.setItem(CUSTOMER_STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Ignore quota / private mode
  }
}
