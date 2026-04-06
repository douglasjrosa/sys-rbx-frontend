import {
  Badge,
  Box,
  Flex,
  Heading,
  Switch,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Tr,
  useColorModeValue,
  useMediaQuery,
  VStack,
} from "@chakra-ui/react";
import { useCallback, type Dispatch, type SetStateAction } from "react";
import { buildAppliedDiscounts } from "@/lib/calculadora-de-embalagem/utils/appliedDiscounts";
import type { DiscountPolicyRow } from "@/lib/calculadora-de-embalagem/utils/discountPolicyData";
import { POLICY_ROWS } from "@/lib/calculadora-de-embalagem/utils/discountPolicyData";
import {
  formatMoneyBrlPtBr,
  formatPercentFraction,
} from "@/lib/calculadora-de-embalagem/utils/formatters";

export type { DiscountPolicyRow } from "@/lib/calculadora-de-embalagem/utils/discountPolicyData";

type DiscountPolicyDiscountCardProps = {
  vFinal: number;
  textColor: string;
  headingColor: string;
  bgCard: string;
  borderColor: string;
  enabledByName: Record<string, boolean>;
  onEnabledByNameChange: Dispatch<
    SetStateAction<Record<string, boolean>>
  >;
};

const MOBILE_MQ = "(max-width: 768px)";

const ROW_TEXT_WRAP = {
  wordBreak: "break-word" as const,
  overflowWrap: "anywhere" as const,
};

/** Table cells default to min-width:auto; this allows wrapping inside fixed columns. */
const TABLE_CELL_SHRINK = {
  minWidth: 0,
  maxWidth: "100%",
} as const;

const DESCRIPTION_TD_SX = {
  ...ROW_TEXT_WRAP,
  ...TABLE_CELL_SHRINK,
};

function DescriptionBlock({
  row,
  headingColor,
  textColor,
}: {
  row: DiscountPolicyRow;
  headingColor: string;
  textColor: string;
}) {
  return (
    <VStack align="start" spacing={1} w="100%" minW={0} maxW="100%">
      <Text
        as="p"
        fontWeight="medium"
        color={textColor}
        opacity={0.62}
        fontSize="sm"
        w="100%"
        maxW="100%"
        m={0}
        whiteSpace="normal"
        sx={ROW_TEXT_WRAP}
      >
        {row.title}
      </Text>
      <Text
        as="p"
        fontWeight="bold"
        fontSize="md"
        color={headingColor}
        w="100%"
        maxW="100%"
        m={0}
        whiteSpace="normal"
        sx={ROW_TEXT_WRAP}
      >
        {row.description}
      </Text>
      <Text
        as="p"
        fontSize="xs"
        color={textColor}
        opacity={0.92}
        w="100%"
        maxW="100%"
        m={0}
        whiteSpace="normal"
        sx={ROW_TEXT_WRAP}
      >
        {row.sub_description}
      </Text>
      <Text
        as="p"
        fontSize="xs"
        color={textColor}
        opacity={0.78}
        w="100%"
        maxW="100%"
        m={0}
        whiteSpace="normal"
        sx={ROW_TEXT_WRAP}
      >
        {row.valid_for}
      </Text>
    </VStack>
  );
}

function discountBadgeVariant(enabled: boolean): "solid" | "subtle" {
  return enabled ? "solid" : "subtle";
}

function PercentValueBadges({
  percentLabel,
  valueLabel,
  enabled,
}: {
  percentLabel: string;
  valueLabel: string;
  enabled: boolean;
}) {
  const scheme = enabled ? "blue" : "gray";
  const variant = discountBadgeVariant(enabled);

  return (
    <Flex
      pt={1}
      w="100%"
      maxW="100%"
      minW={0}
      justify="space-between"
      align="center"
      gap={3}
    >
      <Badge
        colorScheme={scheme}
        variant={variant}
        fontSize="sm"
        px={2}
        py={0.5}
        flex="1 1 0"
        minW={0}
        maxW="50%"
        whiteSpace="normal"
        sx={ROW_TEXT_WRAP}
      >
        {percentLabel}
      </Badge>
      <Badge
        colorScheme={scheme}
        variant={variant}
        fontSize="sm"
        px={2}
        py={0.5}
        flex="1 1 0"
        minW={0}
        maxW="50%"
        whiteSpace="normal"
        sx={ROW_TEXT_WRAP}
        textAlign="center"
      >
        {valueLabel}
      </Badge>
    </Flex>
  );
}

type RowsInnerProps = {
  vFinal: number;
  textColor: string;
  headingColor: string;
  hasValidPrice: boolean;
  enabledByName: Record<string, boolean>;
  toggle: (name: string, value: boolean) => void;
  isMobile: boolean;
  rowDividerColor: string;
};

function DiscountPolicyRowsInner({
  vFinal,
  textColor,
  headingColor,
  hasValidPrice,
  enabledByName,
  toggle,
  isMobile,
  rowDividerColor,
}: RowsInnerProps) {
  const valueTextForRow = (
    row: DiscountPolicyRow,
  ): string => {
    if (!hasValidPrice) return "—";
    return formatMoneyBrlPtBr(vFinal * row.percentage);
  };

  if (isMobile) {
    return (
      <VStack align="stretch" spacing={0} w="100%" minW={0} maxW="100%">
        {POLICY_ROWS.map((row, idx) => {
          const enabled = enabledByName[row.name] ?? false;

          return (
            <Flex
              key={row.name}
              align="flex-start"
              gap={3}
              py={3}
              borderBottomWidth={
                idx < POLICY_ROWS.length - 1 ? "1px" : 0
              }
              borderColor={rowDividerColor}
              w="100%"
              maxW="100%"
              minW={0}
            >
              <Flex flexShrink={0} align="center" justify="center" pt={0.5}>
                <Switch
                  colorScheme="blue"
                  isChecked={enabled}
                  onChange={(e) => toggle(row.name, e.target.checked)}
                  aria-label={row.title}
                />
              </Flex>
              <VStack
                align="stretch"
                spacing={0}
                flex="1 1 0"
                minW={0}
                maxW="100%"
                overflow="hidden"
              >
                <DescriptionBlock
                  row={row}
                  headingColor={headingColor}
                  textColor={textColor}
                />
                <PercentValueBadges
                  percentLabel={formatPercentFraction(row.percentage)}
                  valueLabel={valueTextForRow(row)}
                  enabled={enabled}
                />
              </VStack>
            </Flex>
          );
        })}
      </VStack>
    );
  }

  return (
    <TableContainer w="100%" maxW="100%" overflowX="auto">
      <Table size="sm" variant="simple" layout="fixed" w="100%">
        <Tbody>
          {POLICY_ROWS.map((row) => {
            const enabled = enabledByName[row.name] ?? false;
            const displayValue = valueTextForRow(row);

            return (
              <Tr key={row.name}>
                <Td verticalAlign="middle" w="12%">
                  <Flex justify="center" align="center" py={1}>
                    <Switch
                      colorScheme="blue"
                      isChecked={enabled}
                      onChange={(e) => toggle(row.name, e.target.checked)}
                      aria-label={row.title}
                    />
                  </Flex>
                </Td>
                <Td verticalAlign="middle" w="52%" sx={DESCRIPTION_TD_SX}>
                  <Box py={1} minW={0} w="100%" maxW="100%">
                    <DescriptionBlock
                      row={row}
                      headingColor={headingColor}
                      textColor={textColor}
                    />
                  </Box>
                </Td>
                <Td verticalAlign="middle" w="16%" sx={TABLE_CELL_SHRINK}>
                  <Flex justify="center" align="center" py={0.5}>
                    <Badge
                      colorScheme={enabled ? "blue" : "gray"}
                      variant={discountBadgeVariant(enabled)}
                      fontSize="sm"
                      px={2}
                      py={0.5}
                      whiteSpace="normal"
                      sx={ROW_TEXT_WRAP}
                    >
                      {formatPercentFraction(row.percentage)}
                    </Badge>
                  </Flex>
                </Td>
                <Td verticalAlign="middle" w="20%" sx={TABLE_CELL_SHRINK}>
                  <Flex justify="flex-end" align="center" py={0.5}>
                    <Badge
                      colorScheme={enabled ? "blue" : "gray"}
                      variant={discountBadgeVariant(enabled)}
                      fontSize="sm"
                      px={2}
                      py={0.5}
                      whiteSpace="normal"
                      sx={ROW_TEXT_WRAP}
                    >
                      {displayValue}
                    </Badge>
                  </Flex>
                </Td>
              </Tr>
            );
          })}
        </Tbody>
      </Table>
    </TableContainer>
  );
}

export function DiscountPolicyDiscountCard({
  vFinal,
  textColor,
  headingColor,
  bgCard,
  borderColor,
  enabledByName,
  onEnabledByNameChange,
}: DiscountPolicyDiscountCardProps) {
  const hasValidPrice = Number.isFinite(vFinal) && vFinal > 0;
  const [isMobile] = useMediaQuery(MOBILE_MQ, {
    ssr: true,
    fallback: false,
  });
  const rowDividerColor = useColorModeValue("gray.200", "whiteAlpha.200");
  const footerBorder = useColorModeValue("gray.200", "whiteAlpha.300");

  const toggle = useCallback(
    (name: string, value: boolean) => {
      onEnabledByNameChange((prev) => {
        const row = POLICY_ROWS.find((r) => r.name === name);
        const next: Record<string, boolean> = { ...prev, [name]: value };
        if (value && row?.radio_group) {
          for (const other of POLICY_ROWS) {
            if (other.name !== name && other.radio_group === row.radio_group) {
              next[other.name] = false;
            }
          }
        }
        return next;
      });
    },
    [onEnabledByNameChange],
  );

  const footerApplied = buildAppliedDiscounts(
    enabledByName,
    hasValidPrice,
    vFinal,
  );
  const pctLabel = formatPercentFraction(footerApplied.totalPercentage);
  const valLabel = hasValidPrice
    ? formatMoneyBrlPtBr(footerApplied.totalValue)
    : "—";

  return (
    <Box
      h="75vh"
      maxH="75vh"
      display="flex"
      flexDirection="column"
      bg={bgCard}
      borderRadius="xl"
      borderWidth="1px"
      borderColor={borderColor}
      p={{ base: 5, md: 8 }}
      shadow="md"
      w="100%"
      maxW="100%"
      minW={0}
      minH={0}
    >
      <Heading
        size="md"
        color={headingColor}
        textAlign="center"
        mb={4}
        flexShrink={0}
      >
        Política de descontos
      </Heading>
      <Box
        flex="1"
        minH={0}
        minW={0}
        maxW="100%"
        w="100%"
        overflowY="auto"
        overflowX="hidden"
      >
        <DiscountPolicyRowsInner
          vFinal={vFinal}
          textColor={textColor}
          headingColor={headingColor}
          hasValidPrice={hasValidPrice}
          enabledByName={enabledByName}
          toggle={toggle}
          isMobile={isMobile}
          rowDividerColor={rowDividerColor}
        />
      </Box>
      <Box
        flexShrink={0}
        pt={4}
        mt={3}
        borderTopWidth="1px"
        borderTopColor={footerBorder}
      >
        <Flex
          justify="space-between"
          align="center"
          gap={4}
          flexWrap="wrap"
        >
          <Text
            fontSize="md"
            fontWeight="bold"
            color={headingColor}
            letterSpacing="tight"
          >
            Total percentual: {pctLabel}
          </Text>
          <Text
            fontSize="md"
            fontWeight="bold"
            color={headingColor}
            textAlign="end"
            letterSpacing="tight"
          >
            Total em valores: {valLabel}
          </Text>
        </Flex>
      </Box>
    </Box>
  );
}
