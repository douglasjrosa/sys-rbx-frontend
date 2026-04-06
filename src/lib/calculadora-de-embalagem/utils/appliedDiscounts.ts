import type { DiscountPolicyRow } from "./discountPolicyData";
import { POLICY_ROWS } from "./discountPolicyData";

/** Single enabled discount line (payload-friendly for the next step / backend). */
export type AppliedDiscountLine = {
  name: string;
  title: string;
  /** Policy coefficient (e.g. 0.03), same as JSON. */
  percentage: number;
  /** BRL amount for this line (vFinal * percentage when price is valid). */
  value: number;
};

/**
 * Aggregate of user discount toggles; mirrors policy rows and computed totals.
 * totalPercentage is the sum of percentage coefficients (e.g. 0.03 + 0.05 = 0.08).
 */
export type AppliedDiscounts = {
  totalPercentage: number;
  totalValue: number;
  discounts: AppliedDiscountLine[];
};

export function buildAppliedDiscounts(
  enabledByName: Record<string, boolean>,
  hasValidPrice: boolean,
  vFinal: number,
  policyRows: readonly DiscountPolicyRow[] = POLICY_ROWS,
): AppliedDiscounts {
  const discounts: AppliedDiscountLine[] = [];
  let totalPercentage = 0;
  let totalValue = 0;
  for (const row of policyRows) {
    if (enabledByName[row.name]) {
      const value = hasValidPrice ? vFinal * row.percentage : 0;
      totalPercentage += row.percentage;
      totalValue += value;
      discounts.push({
        name: row.name,
        title: row.title,
        percentage: row.percentage,
        value,
      });
    }
  }
  return { totalPercentage, totalValue, discounts };
}
