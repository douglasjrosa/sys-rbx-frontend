import { Box, Heading, Text } from "@chakra-ui/react";
import type { PackagingFormData } from "../utils/packagingCalculator";
import type { ElegibleTemplateResult } from "../utils/types";
import {
  ResultTemplateCard,
  type ResultTemplateCardTheme,
} from "./ResultTemplateCard";

type DiscountPolicySelectedModelSectionProps = {
  chosenRow: ElegibleTemplateResult | undefined;
  form: Partial<PackagingFormData>;
  /** Sum of enabled discount policy amounts (shown as “Descontos” on the card). */
  discountsTotalBrl?: number;
  /** Shared with `ResultTemplateCard` variant `discount` (price block, borders, etc.). */
  cardTheme: ResultTemplateCardTheme;
  /** Outer panel (heading + padding) uses the same surface tokens as the rest of the wizard. */
  surfaceBg: string;
  borderColor: string;
  headingColor: string;
  textColor: string;
};

/**
 * Política de descontos: painel “Modelo selecionado” + card de resumo do modelo.
 * Reutiliza {@link ResultTemplateCard} (`variant="discount"`) — mesma base visual da lista
 * de resultados, com coluna de preço detalhada (fumigação/montagem).
 */
export function DiscountPolicySelectedModelSection({
  chosenRow,
  form,
  discountsTotalBrl,
  cardTheme,
  surfaceBg,
  borderColor,
  headingColor,
  textColor,
}: DiscountPolicySelectedModelSectionProps) {
  if (!chosenRow) {
    return (
      <Text fontSize="sm" color={textColor} textAlign="center">
        Nenhum modelo selecionado.
      </Text>
    );
  }

  return (
    <Box
      bg={surfaceBg}
      borderRadius="xl"
      borderWidth="1px"
      borderColor={borderColor}
      p={{ base: 5, md: 8 }}
      shadow="md"
      w="100%"
    >
      <Heading
        size="md"
        color={headingColor}
        textAlign="center"
        mb={4}
      >
        Modelo selecionado
      </Heading>
      <ResultTemplateCard
        variant="discount"
        row={chosenRow}
        form={form}
        theme={cardTheme}
        discountsTotalBrl={discountsTotalBrl}
      />
    </Box>
  );
}
