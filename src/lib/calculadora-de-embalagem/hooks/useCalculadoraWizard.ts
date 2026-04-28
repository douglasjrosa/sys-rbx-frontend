import { useColorModeValue } from "@chakra-ui/react";
import { useMemo } from "react";
import type { PackagingFormData } from "../utils/packagingCalculator";
import type { ElegibleTemplateResult } from "../utils/types";
import {
  buildSimulationSummaryItems,
  type SimulationSummarySectionRefs,
} from "../utils/simulationSummaryItems";

export function useCalculadoraThemeTokens() {
  const bgPage = useColorModeValue("gray.50", "gray.900");
  const bgCard = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const headingColor = useColorModeValue("gray.800", "white");
  const textColor = useColorModeValue("gray.600", "gray.300");
  const clearanceBadgeBgActive = useColorModeValue("blue.50", "blue.900");
  const placeholderColor = useColorModeValue("gray.500", "gray.400");
  const progressTrackInactiveBg = useColorModeValue("gray.200", "gray.600");
  const resultListingPriceColor = useColorModeValue("green.500", "green.300");
  const recommendedCardBorderColor = useColorModeValue(
    "orange.400",
    "orange.500",
  );
  const resultRankCaptionBgOther = useColorModeValue(
    "gray.600",
    "gray.500",
  );
  const assemblyOptionCardBg = useColorModeValue("white", "gray.700");

  return {
    bgPage,
    bgCard,
    borderColor,
    headingColor,
    textColor,
    clearanceBadgeBgActive,
    placeholderColor,
    progressTrackInactiveBg,
    resultListingPriceColor,
    recommendedCardBorderColor,
    resultRankCaptionBgOther,
    assemblyOptionCardBg,
  };
}

export function useCalculadoraSimulationSummaryItems(params: {
  form: Partial<PackagingFormData>;
  isPallet: boolean;
  showAssemblySection: boolean;
  elegibleTemplates: ElegibleTemplateResult[];
  refs: SimulationSummarySectionRefs;
}) {
  const { form, isPallet, showAssemblySection, elegibleTemplates, refs } =
    params;

  return useMemo(
    () =>
      buildSimulationSummaryItems({
        form,
        isPallet,
        showAssemblySection,
        elegibleTemplates,
        refs,
      }),
    [form, isPallet, showAssemblySection, elegibleTemplates],
  );
}
