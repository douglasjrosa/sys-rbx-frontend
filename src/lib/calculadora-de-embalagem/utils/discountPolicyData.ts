import discountPolicyImport from "@/pages/calculadora-de-embalagem/_data/discount_policy.json";

export type DiscountPolicyRow = {
  name: string;
  title: string;
  description: string;
  sub_description: string;
  valid_for: string;
  percentage: number;
  /** Same id = mutually exclusive toggles (radio behavior). */
  radio_group?: string;
};

function normalizeDiscountPolicyImport(raw: unknown): DiscountPolicyRow[] {
  if (Array.isArray(raw)) {
    return raw as DiscountPolicyRow[];
  }
  if (
    raw != null &&
    typeof raw === "object" &&
    "default" in raw &&
    Array.isArray((raw as { default: unknown }).default)
  ) {
    return (raw as { default: DiscountPolicyRow[] }).default;
  }
  return [];
}

export const POLICY_ROWS = normalizeDiscountPolicyImport(discountPolicyImport);
