import type { PackType } from "./packagingCalculator";
import type { ElegibleTemplateResult } from "./types";
import { packTypeForTemplateName } from "./templateMeta";

/** Cheapest eligible model that is not a pallet (never recommend pallet). */
export function getRecommendedTemplateName(
  sortedResults: ElegibleTemplateResult[],
  packTypeForName: (name: string) => PackType | undefined = packTypeForTemplateName,
): string | undefined {
  for (const item of sortedResults) {
    if (packTypeForName(item.name) !== "pallet") {
      return item.name;
    }
  }
  return undefined;
}
