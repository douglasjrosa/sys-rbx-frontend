import { ChevronDownIcon, EditIcon } from "@chakra-ui/icons";
import {
  Box,
  Collapse,
  Flex,
  Heading,
  IconButton,
  SimpleGrid,
  Text,
  VStack,
} from "@chakra-ui/react";
import type { AppliedDiscounts } from "../utils/appliedDiscounts";
import {
  formatMoneyBrlPtBr,
  formatPercentFraction,
} from "../utils/formatters";
import type { CalculadoraPricingQuote } from "../utils/pricing";
import type {
  SimulationSummaryEditTarget,
  SimulationSummaryItemModel,
} from "../utils/simulationSummaryItems";

type SimulationSummaryPanelProps = {
  simulationSummaryOpen: boolean;
  onToggleOpen: () => void;
  items: SimulationSummaryItemModel[];
  onEditItem: (target: SimulationSummaryEditTarget) => void;
  bgCard: string;
  borderColor: string;
  headingColor: string;
  textColor: string;
  /** User discount selections (result + discount steps); for next screen / persistence. */
  appliedDiscounts?: AppliedDiscounts | null;
  /** When set, shown after discounts (same logic as result card). */
  pricingQuote?: CalculadoraPricingQuote | null;
  /** Total line color (e.g. green from theme). */
  totalPriceColor?: string;
};

export function SimulationSummaryPanel({
  simulationSummaryOpen,
  onToggleOpen,
  items,
  onEditItem,
  bgCard,
  borderColor,
  headingColor,
  textColor,
  appliedDiscounts = null,
  pricingQuote = null,
  totalPriceColor = headingColor,
}: SimulationSummaryPanelProps) {
  const showDiscountBlock =
    appliedDiscounts != null &&
    (appliedDiscounts.discounts.length > 0 ||
      appliedDiscounts.totalPercentage > 0);
  const hasPricingBreakdown =
    pricingQuote != null &&
    (pricingQuote.fumigationBrl > 0 ||
      pricingQuote.assemblyBrl > 0 ||
      pricingQuote.discountsTotalBrl > 0);
  const hasDiscountSection = Boolean(showDiscountBlock && appliedDiscounts);
  const hasPricingSection = pricingQuote != null;
  const showBothBottomSections = hasDiscountSection && hasPricingSection;
  return (
    <Box
      bg={bgCard}
      borderRadius="xl"
      borderWidth="1px"
      borderColor={borderColor}
      p={5}
      shadow="md"
      w="100%"
    >
      <Flex align="center" justify="space-between" gap={3}>
        <Heading
          size="md"
          color={headingColor}
          flex={1}
          textAlign="center"
        >
          Resumo da sua simulação
        </Heading>
        <IconButton
          type="button"
          border="1px solid"
          borderColor={borderColor}
          borderRadius="md"
          p={2}
          aria-expanded={simulationSummaryOpen}
          aria-label={
            simulationSummaryOpen
              ? "Recolher resumo da simulação"
              : "Expandir resumo da simulação"
          }
          icon={<ChevronDownIcon />}
          variant="ghost"
          size="sm"
          transform={
            simulationSummaryOpen ? "rotate(180deg)" : undefined
          }
          transition="transform 0.2s ease"
          onClick={onToggleOpen}
        />
      </Flex>
      <Collapse in={simulationSummaryOpen} animateOpacity>
        <SimpleGrid
          columns={{ base: 1, sm: 2, md: 3 }}
          spacing={3}
          fontSize="sm"
          my={5}
        >
          {items.map((item) => (
            <Box
              key={item.label}
              role="group"
              textAlign="left"
              w="100%"
              p={3}
              borderRadius="lg"
              borderWidth="1px"
              borderColor={borderColor}
              cursor="pointer"
              bg="transparent"
              _hover={{
                borderColor: "blue.400",
                borderWidth: "2px",
                "& .summary-edit-btn": { opacity: 1 },
              }}
              onClick={() =>
                item.editTarget && onEditItem(item.editTarget)
              }
            >
              <Flex justify="space-between" align="flex-start" gap={2}>
                <Box flex={1} minW={0}>
                  <Text
                    color={textColor}
                    fontWeight="medium"
                    fontSize="xs"
                  >
                    {item.label}
                  </Text>
                  <Text color={headingColor} noOfLines={2}>
                    {item.value}
                  </Text>
                </Box>
                {item.editTarget ? (
                  <IconButton
                    aria-label="Editar"
                    icon={<EditIcon />}
                    size="xs"
                    variant="ghost"
                    opacity={0.4}
                    minW={6}
                    minH={6}
                    flexShrink={0}
                    className="summary-edit-btn"
                    _groupHover={{ opacity: 1 }}
                  />
                ) : null}
              </Flex>
            </Box>
          ))}
        </SimpleGrid>
        {hasDiscountSection || hasPricingSection ? (
          <SimpleGrid
            columns={{ base: 1, md: showBothBottomSections ? 2 : 1 }}
            spacing={{ base: 4, md: 6 }}
            mt={4}
            pt={4}
            borderTopWidth="1px"
            borderTopColor={borderColor}
            w="100%"
            alignItems="stretch"
          >
            {showDiscountBlock && appliedDiscounts ? (
              <Box
                minW={0}
                w="100%"
                maxW={{ base: "100%", md: "min(100%, 420px)" }}
                mx={{ md: "auto" }}
                display="flex"
                flexDirection="column"
                h="100%"
                p={3}
                borderRadius="lg"
                borderWidth="1px"
                borderColor={borderColor}
                bg="transparent"
              >
                <Heading size="sm" color={headingColor} mb={3} textAlign="center">
                  Descontos aplicados
                </Heading>
                <Flex
                  flex="1"
                  direction="column"
                  justify="space-between"
                  gap={3}
                  minH={0}
                >
                  <Box>
                    <Flex
                      justify="space-between"
                      align="center"
                      gap={3}
                      flexWrap="wrap"
                      mb={3}
                      fontSize="sm"
                    >
                      <Text color={textColor} fontWeight="medium">
                        Total percentual
                      </Text>
                      <Text color={headingColor} fontWeight="semibold">
                        {formatPercentFraction(appliedDiscounts.totalPercentage)}
                      </Text>
                    </Flex>
                    <Flex
                      justify="space-between"
                      align="center"
                      gap={3}
                      flexWrap="wrap"
                      fontSize="sm"
                    >
                      <Text color={textColor} fontWeight="medium">
                        Total em valores
                      </Text>
                      <Text color={headingColor} fontWeight="semibold">
                        {formatMoneyBrlPtBr(appliedDiscounts.totalValue)}
                      </Text>
                    </Flex>
                  </Box>
                  <VStack align="stretch" spacing={2}>
                    {appliedDiscounts.discounts.map((d) => (
                      <Flex
                        key={d.name}
                        justify="space-between"
                        align="flex-start"
                        gap={3}
                        fontSize="xs"
                        flexWrap="wrap"
                      >
                        <Text color={textColor} flex={1} minW={0}>
                          {d.title}
                        </Text>
                        <Text
                          color={headingColor}
                          textAlign="end"
                          whiteSpace="nowrap"
                        >
                          {formatPercentFraction(d.percentage)} ·{" "}
                          {formatMoneyBrlPtBr(d.value)}
                        </Text>
                      </Flex>
                    ))}
                  </VStack>
                </Flex>
              </Box>
            ) : null}
            {pricingQuote != null ? (
              <Box
                minW={0}
                w="100%"
                maxW={{ base: "100%", md: "min(100%, 420px)" }}
                mx={{ md: "auto" }}
                display="flex"
                flexDirection="column"
                h="100%"
                p={3}
                borderRadius="lg"
                borderWidth="1px"
                borderColor={borderColor}
                bg="transparent"
              >
                <Heading size="sm" color={headingColor} mb={3} textAlign="center">
                  Valor final
                </Heading>
                <Flex
                  flex="1"
                  direction="column"
                  justify="space-between"
                  gap={2}
                  minH={0}
                >
                  <VStack align="stretch" spacing={1}>
                    {hasPricingBreakdown ? (
                      <>
                        <Flex
                          justify="space-between"
                          gap={3}
                          flexWrap="wrap"
                          fontSize="sm"
                        >
                          <Text color={textColor} fontWeight="bold">
                            Preço
                          </Text>
                          <Text color={headingColor} fontWeight="semibold">
                            {formatMoneyBrlPtBr(pricingQuote.basePriceBrl)}
                          </Text>
                        </Flex>
                        {pricingQuote.fumigationBrl > 0 ? (
                          <Flex
                            justify="space-between"
                            gap={3}
                            flexWrap="wrap"
                            fontSize="sm"
                          >
                            <Text color={textColor}>Fumigação</Text>
                            <Text color={headingColor}>
                              + {formatMoneyBrlPtBr(pricingQuote.fumigationBrl)}
                            </Text>
                          </Flex>
                        ) : null}
                        {pricingQuote.assemblyBrl > 0 ? (
                          <Flex
                            justify="space-between"
                            gap={3}
                            flexWrap="wrap"
                            fontSize="sm"
                          >
                            <Text color={textColor}>Montagem</Text>
                            <Text color={headingColor}>
                              + {formatMoneyBrlPtBr(pricingQuote.assemblyBrl)}
                            </Text>
                          </Flex>
                        ) : null}
                        {pricingQuote.discountsTotalBrl > 0 ? (
                          <Flex
                            justify="space-between"
                            gap={3}
                            flexWrap="wrap"
                            fontSize="sm"
                          >
                            <Text color={textColor}>Descontos</Text>
                            <Text color={headingColor}>
                              − {formatMoneyBrlPtBr(pricingQuote.discountsTotalBrl)}
                            </Text>
                          </Flex>
                        ) : null}
                      </>
                    ) : null}
                  </VStack>
                  <Text
                    fontSize="2xl"
                    fontWeight="extrabold"
                    color={totalPriceColor}
                    pt={hasPricingBreakdown ? 2 : 0}
                    textAlign="center"
                    mt="auto"
                  >
                    {formatMoneyBrlPtBr(pricingQuote.totalBrl)}
                  </Text>
                </Flex>
              </Box>
            ) : null}
          </SimpleGrid>
        ) : null}
      </Collapse>
    </Box>
  );
}
