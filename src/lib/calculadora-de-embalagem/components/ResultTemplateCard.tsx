import { CheckIcon } from "@chakra-ui/icons";
import {
  Badge,
  Box,
  Button,
  Flex,
  Image,
  ListItem,
  SimpleGrid,
  Text,
  UnorderedList,
  VStack,
} from "@chakra-ui/react";
import type { ReactNode } from "react";
import {
  resolveInternalPackageDimensions,
  type PackagingFormData,
} from "@/lib/calculadora-de-embalagem/utils/packagingCalculator";
import {
  assemblyMontageChargeFromVFinal,
  EXPORT_FUMIGATION_FRACTION_OF_VFINAL,
} from "@/lib/calculadora-de-embalagem/utils/pricing";
import { formatMoneyBrlPtBr } from "@/lib/calculadora-de-embalagem/utils/formatters";
import { isPositiveDimension } from "@/lib/calculadora-de-embalagem/utils/dimensions";
import {
  DESCRIPTION_LINES_BY_TEMPLATE_NAME,
  packTypeForTemplateName,
} from "@/lib/calculadora-de-embalagem/utils/templateMeta";
import { getTemplateImageSrc } from "@/lib/calculadora-de-embalagem/utils/templateImages";
import { getResultRankCaption } from "@/lib/calculadora-de-embalagem/utils/resultCardCopy";
import type { ElegibleTemplateResult } from "@/lib/calculadora-de-embalagem/utils/types";
import {
  RESULT_CARD_ILLUSTRATION_DISCLAIMER,
  RESULT_CARD_IMAGE_HEIGHT_MOBILE_PX,
  RESULT_CARD_IMAGE_SIDE_TABLET_PX,
  RESULT_DIM_PRICE_CELL_MIN_WIDTH_PX,
  RESULT_DIM_PRICE_GRID_WRAP_MIN_WIDTH_PX,
} from "@/lib/calculadora-de-embalagem/utils/layoutConstants";

function brlPlus(value: number): string {
  return `+ ${formatMoneyBrlPtBr(value)}`;
}

function brlMinus(value: number): string {
  return `- ${formatMoneyBrlPtBr(value)}`;
}

export type ResultTemplateCardTheme = {
  bgCard: string;
  borderColor: string;
  headingColor: string;
  textColor: string;
  recommendedCardBorderColor: string;
  resultRankCaptionBgOther: string;
  resultListingPriceColor: string;
};

type ListingProps = {
  variant: "listing";
  row: ElegibleTemplateResult;
  theme: ResultTemplateCardTheme;
  cardIndex: number;
  visibleCount: number;
  recommendedTemplateName: string | undefined;
  form: Partial<PackagingFormData>;
  onChooseModel: (payload: { templateKey: string; label: string }) => void;
};

type DiscountProps = {
  variant: "discount";
  row: ElegibleTemplateResult;
  theme: ResultTemplateCardTheme;
  form: Partial<PackagingFormData>;
  /** Sum of enabled policy discount amounts (vFinal × percentage). */
  discountsTotalBrl?: number;
};

export type ResultTemplateCardProps = ListingProps | DiscountProps;

function displayTitleForRow(row: ElegibleTemplateResult): string {
  return (
    row.priceResult?.info?.titulo ??
    row.name.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
  );
}

type TemplateCardDimensionsColumnProps = {
  form: Partial<PackagingFormData>;
  borderColor: string;
  headingColor: string;
  textColor: string;
  /** Renders below dimension rows (e.g. total caption on discount step). */
  belowDimensions?: ReactNode;
};

function TemplateCardDimensionsColumn(p: TemplateCardDimensionsColumnProps) {
  const { form, borderColor, headingColor, textColor, belowDimensions } = p;
  const dimensionUnit = form.unit ?? "mm";
  const dims = resolveInternalPackageDimensions(form);
  const showLengthDim = dims != null && isPositiveDimension(dims.length);
  const showWidthDim = dims != null && isPositiveDimension(dims.width);
  const showHeightDim =
    form.packType !== "pallet" &&
    dims != null &&
    isPositiveDimension(dims.height);
  const hasDimensionBox = showLengthDim || showWidthDim || showHeightDim;

  return (
    <Flex
      direction="column"
      justify="center"
      minW={`${RESULT_DIM_PRICE_CELL_MIN_WIDTH_PX}px`}
      borderBottomWidth="1px"
      borderBottomColor={borderColor}
      px={3}
      py={2}
      textAlign="right"
      minH={{ md: "112px" }}
      h="100%"
      sx={{
        [`@container (min-width: ${RESULT_DIM_PRICE_GRID_WRAP_MIN_WIDTH_PX}px)`]: {
          borderBottomWidth: 0,
          borderRightWidth: "1px",
          borderRightColor: borderColor,
        },
      }}
    >
      {hasDimensionBox ? (
        <VStack align="stretch" justify="center" spacing={1.5} w="100%">
          <Text
            fontSize="xs"
            fontWeight="bold"
            color={headingColor}
            w="100%"
          >
            Medidas Internas:
          </Text>
          {showLengthDim ? (
            <Flex
              w="100%"
              justify="flex-end"
              align="baseline"
              gap={2}
              flexWrap="wrap"
            >
              <Text fontSize="xs" color={textColor} opacity={0.75}>
                Comprimento
              </Text>
              <Text
                fontSize="md"
                fontWeight="semibold"
                color={headingColor}
                lineHeight="short"
              >
                {dims.length} {dimensionUnit}
              </Text>
            </Flex>
          ) : null}
          {showWidthDim ? (
            <Flex
              w="100%"
              justify="flex-end"
              align="baseline"
              gap={2}
              flexWrap="wrap"
            >
              <Text fontSize="xs" color={textColor} opacity={0.75}>
                Largura
              </Text>
              <Text
                fontSize="md"
                fontWeight="semibold"
                color={headingColor}
                lineHeight="short"
              >
                {dims.width} {dimensionUnit}
              </Text>
            </Flex>
          ) : null}
          {showHeightDim ? (
            <Flex
              w="100%"
              justify="flex-end"
              align="baseline"
              gap={2}
              flexWrap="wrap"
            >
              <Text fontSize="xs" color={textColor} opacity={0.75}>
                Altura
              </Text>
              <Text
                fontSize="md"
                fontWeight="semibold"
                color={headingColor}
                lineHeight="short"
              >
                {dims.height} {dimensionUnit}
              </Text>
            </Flex>
          ) : null}
        </VStack>
      ) : (
        <Text fontSize="xs" color={textColor} opacity={0.45}>
          —
        </Text>
      )}
      {belowDimensions ? (
        <Box
          w="100%"
          pt={2}
          mt={2}
          borderTopWidth="1px"
          borderTopColor={borderColor}
          textAlign="center"
        >
          {belowDimensions}
        </Box>
      ) : null}
    </Flex>
  );
}

function ResultTemplateCardListing(p: ListingProps) {
  const {
    row: t,
    theme,
    cardIndex,
    visibleCount,
    recommendedTemplateName,
    form,
    onChooseModel,
  } = p;
  const {
    bgCard,
    borderColor,
    headingColor,
    textColor,
    recommendedCardBorderColor,
    resultRankCaptionBgOther,
    resultListingPriceColor,
  } = theme;

  const displayTitle = displayTitleForRow(t);
  const descriptionLines = DESCRIPTION_LINES_BY_TEMPLATE_NAME.get(t.name) ?? [];
  const templatePackType = packTypeForTemplateName(t.name);
  const isRecommendedCard =
    recommendedTemplateName !== undefined && t.name === recommendedTemplateName;
  const isExportCard = form.isExport === true;
  const priceError = t.priceResult?.error;
  const priceValue = t.priceResult?.info?.vFinal;
  const numericPriceValue = priceValue == null ? NaN : Number(priceValue);
  const hasValidPrice = Number.isFinite(numericPriceValue);
  const fumigationValue = hasValidPrice
    ? numericPriceValue * EXPORT_FUMIGATION_FRACTION_OF_VFINAL
    : NaN;
  const totalWithFumigation = hasValidPrice
    ? numericPriceValue + fumigationValue
    : NaN;
  const isLastVisibleCard = cardIndex === visibleCount - 1;
  const rankCaption = getResultRankCaption({
    templatePackType,
    isRecommendedCard,
    isLastVisibleCard,
  });

  return (
    <Box
      as="article"
      role="group"
      position="relative"
      borderWidth={isRecommendedCard ? "3px" : "1px"}
      borderColor={
        isRecommendedCard ? recommendedCardBorderColor : borderColor
      }
      borderRadius="xl"
      bg={bgCard}
      overflow={isRecommendedCard ? "visible" : "hidden"}
      boxShadow="sm"
      transition="box-shadow 0.2s ease, border-color 0.2s ease"
      _hover={{ boxShadow: "md" }}
    >
      {isRecommendedCard ? (
        <Badge
          position="absolute"
          top={0}
          right={45}
          zIndex={3}
          transform="translate(42%, -48%)"
          bg={recommendedCardBorderColor}
          color="white"
          fontSize="xs"
          fontWeight="bold"
          letterSpacing="0.06em"
          borderRadius="md"
          px={2.5}
          py={1}
          borderWidth="0"
          textTransform="none"
          boxShadow="sm"
        >
          RECOMENDADO
        </Badge>
      ) : null}
      <Flex
        direction={{ base: "column", md: "row" }}
        align="stretch"
        overflow="hidden"
        borderRadius="9px"
      >
        <VStack
          flexShrink={0}
          align="stretch"
          justify="center"
          spacing={1}
          w={{
            base: "100%",
            md: `${RESULT_CARD_IMAGE_SIDE_TABLET_PX}px`,
          }}
          bg="white"
          border="3px solid"
          borderColor="white"
        >
          <Box
            h={{
              base: `${RESULT_CARD_IMAGE_HEIGHT_MOBILE_PX}px`,
              md: `${RESULT_CARD_IMAGE_SIDE_TABLET_PX}px`,
            }}
            position="relative"
            p={4}
            mt={{ base: 5, md: 0 }}
          >
            <Image
              src={getTemplateImageSrc(t.name)}
              alt={displayTitle}
              w="100%"
              h="100%"
              objectFit="contain"
              transition="transform 0.25s ease"
              _groupHover={{ transform: "scale(1.1)" }}
            />
          </Box>
          <Text
            fontSize="xs"
            color="gray.600"
            opacity={0.8}
            textAlign="center"
            lineHeight="short"
            px={2}
            pb={2}
          >
            {RESULT_CARD_ILLUSTRATION_DISCLAIMER}
          </Text>
        </VStack>
        <Flex
          direction="column"
          flex="1"
          minW={0}
          p={4}
          justify="space-between"
          gap={3}
        >
          <Box>
            <Text
              fontWeight="semibold"
              color={headingColor}
              fontSize="md"
              lineHeight="snug"
              noOfLines={2}
            >
              {displayTitle}
            </Text>
            {descriptionLines.length > 0 ? (
              <UnorderedList
                fontSize="xs"
                color={textColor}
                opacity={0.88}
                mt={2}
                spacing={1}
                pl={1}
                ml={4}
                lineHeight="short"
              >
                {descriptionLines.map((line, lineIdx) => (
                  <ListItem key={`${t.name}-desc-${lineIdx}`}>{line}</ListItem>
                ))}
              </UnorderedList>
            ) : null}
          </Box>
          <Box pt={1} w="100%" mt="auto">
            {priceError ? (
              <Text fontSize="sm" color="red.500">
                {priceError}
              </Text>
            ) : hasValidPrice ? (
              <VStack align="stretch" spacing={3} w="100%">
                {rankCaption ? (
                  <Box
                    textAlign="start"
                    px={3}
                    py={2}
                    borderRadius="md"
                    bg={
                      isRecommendedCard
                        ? recommendedCardBorderColor
                        : resultRankCaptionBgOther
                    }
                  >
                    <Text
                      fontSize={isRecommendedCard ? "xl" : "md"}
                      fontWeight="bold"
                      lineHeight="short"
                      color="white"
                    >
                      {rankCaption}
                    </Text>
                  </Box>
                ) : null}
                <Box
                  w="100%"
                  borderWidth="1px"
                  borderColor={borderColor}
                  borderRadius="md"
                  overflow="hidden"
                  sx={{ containerType: "inline-size" }}
                >
                  <SimpleGrid
                    minChildWidth={`${RESULT_DIM_PRICE_CELL_MIN_WIDTH_PX}px`}
                    spacing={0}
                    w="100%"
                  >
                    <TemplateCardDimensionsColumn
                      form={form}
                      borderColor={borderColor}
                      headingColor={headingColor}
                      textColor={textColor}
                    />
                    <Flex
                      direction="column"
                      justify="flex-start"
                      position="relative"
                      minW={`${RESULT_DIM_PRICE_CELL_MIN_WIDTH_PX}px`}
                      px={3}
                      py={2}
                      textAlign="right"
                      minH={{ md: "112px" }}
                      h="100%"
                      overflow="hidden"
                    >
                      {isExportCard ? (
                        <Image
                          src="/img/stamp-export.webp"
                          alt="Selo de exportação"
                          position="absolute"
                          top={3}
                          left={2}
                          w="35%"
                          transform="rotate(-9deg)"
                          pointerEvents="none"
                        />
                      ) : null}
                      <VStack
                        align="stretch"
                        justify="center"
                        spacing={0.5}
                        position="relative"
                        zIndex={1}
                        w="100%"
                        flex="1"
                      >
                        {isExportCard ? (
                          <Text
                            fontSize="sm"
                            color={textColor}
                            fontWeight="bold"
                          >
                            Preço: {formatMoneyBrlPtBr(numericPriceValue)}
                          </Text>
                        ) : null}
                        {isExportCard ? (
                          <Text fontSize="sm" color={textColor}>
                            Fumigação: {brlPlus(fumigationValue)}
                          </Text>
                        ) : null}
                        <Text
                          pt={1}
                          fontSize="2xl"
                          fontWeight="extrabold"
                          color={resultListingPriceColor}
                        >
                          {formatMoneyBrlPtBr(
                            isExportCard ? totalWithFumigation : numericPriceValue,
                          )}
                        </Text>
                      </VStack>
                    </Flex>
                  </SimpleGrid>
                </Box>
                {!form.template ? (
                  <Flex justify="flex-end" mt={2}>
                    <Button
                      type="button"
                      size="sm"
                      colorScheme="blue"
                      onClick={() =>
                        onChooseModel({
                          templateKey: t.name,
                          label: displayTitle,
                        })
                      }
                      alignSelf={{
                        base: "stretch",
                        md: "flex-end",
                      }}
                    >
                      Escolher este Modelo
                    </Button>
                  </Flex>
                ) : (
                  <Flex justify="flex-end" align="center" gap={2} mt={2}>
                    <CheckIcon color="green.500" />
                    <Text
                      fontSize="sm"
                      fontWeight="medium"
                      color={headingColor}
                    >
                      Modelo selecionado
                    </Text>
                  </Flex>
                )}
              </VStack>
            ) : (
              <Text fontSize="xs" color={textColor}>
                —
              </Text>
            )}
          </Box>
        </Flex>
      </Flex>
    </Box>
  );
}

function ResultTemplateCardDiscount(p: DiscountProps) {
  const { row: t, theme, form, discountsTotalBrl = 0 } = p;
  const {
    borderColor,
    headingColor,
    textColor,
    bgCard,
    resultListingPriceColor,
  } = theme;

  const displayTitle = displayTitleForRow(t);
  const descriptionLines = DESCRIPTION_LINES_BY_TEMPLATE_NAME.get(t.name) ?? [];
  const isExportCard = form.isExport === true;
  const priceValue = t.priceResult?.info?.vFinal;
  const basePrice = priceValue == null ? NaN : Number(priceValue);
  const hasValidPrice = Number.isFinite(basePrice);
  const fumigationAmt =
    hasValidPrice && isExportCard
      ? basePrice * EXPORT_FUMIGATION_FRACTION_OF_VFINAL
      : 0;
  const montageAmt = hasValidPrice
    ? assemblyMontageChargeFromVFinal(basePrice, form.assembly)
    : 0;
  const grossBeforeDiscounts = basePrice + fumigationAmt + montageAmt;
  const discountDeduction = Number.isFinite(discountsTotalBrl)
    ? Math.max(0, discountsTotalBrl)
    : 0;
  const totalDiscountStep = hasValidPrice
    ? Math.max(0, grossBeforeDiscounts - discountDeduction)
    : NaN;
  const priceError = t.priceResult?.error;
  let totalCaption = !!isExportCard || form.assembly != 'disassembled' || !!discountsTotalBrl ? "Valor total = Preço" : "";
  if (isExportCard) {
    totalCaption += " + Fumigação";
  }
  if (form.assembly && form.assembly !== "disassembled") {
    totalCaption += " + Montagem";
  }
  if (discountsTotalBrl) {
    totalCaption += " - Descontos";
  }

  return (
    <Box
      as="article"
      borderWidth="1px"
      borderColor={borderColor}
      borderRadius="xl"
      bg={bgCard}
      overflow="hidden"
      boxShadow="sm"
    >
      <Flex direction={{ base: "column", md: "row" }} align="stretch">
        <VStack
          flexShrink={0}
          align="stretch"
          justify="center"
          spacing={1}
          w={{
            base: "100%",
            md: `${RESULT_CARD_IMAGE_SIDE_TABLET_PX}px`,
          }}
          bg="white"
          border="3px solid"
          borderColor="white"
        >
          <Box
            h={{
              base: `${RESULT_CARD_IMAGE_HEIGHT_MOBILE_PX}px`,
              md: `${RESULT_CARD_IMAGE_SIDE_TABLET_PX}px`,
            }}
            position="relative"
            p={4}
            mt={{ base: 5, md: 0 }}
          >
            <Image
              src={getTemplateImageSrc(t.name)}
              alt={displayTitle}
              w="100%"
              h="100%"
              objectFit="contain"
            />
          </Box>
          <Text
            fontSize="xs"
            color="gray.600"
            opacity={0.8}
            textAlign="center"
            lineHeight="short"
            px={2}
            pb={2}
          >
            {RESULT_CARD_ILLUSTRATION_DISCLAIMER}
          </Text>
        </VStack>
        <Flex
          direction="column"
          flex="1"
          minW={0}
          p={4}
          justify="space-between"
          gap={3}
        >
          <Box>
            <Text
              fontWeight="semibold"
              color={headingColor}
              fontSize="md"
              lineHeight="snug"
              noOfLines={2}
            >
              {displayTitle}
            </Text>
            {descriptionLines.length > 0 ? (
              <UnorderedList
                fontSize="xs"
                color={textColor}
                opacity={0.88}
                mt={2}
                spacing={1}
                pl={1}
                ml={4}
                lineHeight="short"
              >
                {descriptionLines.map((line, lineIdx) => (
                  <ListItem key={`disc-${t.name}-${lineIdx}`}>{line}</ListItem>
                ))}
              </UnorderedList>
            ) : null}
          </Box>
          <Box pt={1} w="100%" mt="auto">
            <Box
              w="100%"
              borderWidth="1px"
              borderColor={borderColor}
              borderRadius="md"
              overflow="hidden"
              sx={{ containerType: "inline-size" }}
              position="relative"
            >
              <SimpleGrid
                minChildWidth={`${RESULT_DIM_PRICE_CELL_MIN_WIDTH_PX}px`}
                spacing={0}
                w="100%"
              >
                <TemplateCardDimensionsColumn
                  form={form}
                  borderColor={borderColor}
                  headingColor={headingColor}
                  textColor={textColor}
                  belowDimensions={
                    hasValidPrice && !priceError && !!totalCaption ? (
                      <Text fontSize="xs" color={textColor} opacity={0.85}>
                        {totalCaption}
                      </Text>
                    ) : null
                  }
                />
                <Flex
                  direction="column"
                  justify="flex-start"
                  position="relative"
                  minW={`${RESULT_DIM_PRICE_CELL_MIN_WIDTH_PX}px`}
                  px={3}
                  py={2}
                  textAlign="right"
                  minH={{ md: "112px" }}
                  h="100%"
                  overflow="hidden"
                >
                  {hasValidPrice && isExportCard ? (
                    <Image
                      src="/img/stamp-export.webp"
                      alt="Selo de exportação"
                      position="absolute"
                      top={3}
                      left={2}
                      w="35%"
                      transform="rotate(-9deg)"
                      pointerEvents="none"
                    />
                  ) : null}
                  {priceError ? (
                    <Text fontSize="sm" color="red.500">
                      {priceError}
                    </Text>
                  ) : hasValidPrice ? (
                    <VStack
                      align="stretch"
                      justify="center"
                      spacing={1}
                      position="relative"
                      zIndex={1}
                      w="100%"
                      flex="1"
                    >
                      {isExportCard ? (
                        <Text
                          fontSize="sm"
                          color={textColor}
                          fontWeight="bold"
                        >
                          Preço: {formatMoneyBrlPtBr(basePrice)}
                        </Text>
                      ) : null}
                      {isExportCard ? (
                        <Text fontSize="sm" color={textColor}>
                          Fumigação: {brlPlus(fumigationAmt)}
                        </Text>
                      ) : null}
                      {form.assembly && form.assembly !== "disassembled" && <Text fontSize="sm" color={textColor}>
                        Montagem: {brlPlus(montageAmt)}
                      </Text>}
                      {discountsTotalBrl && <Text fontSize="sm" color={textColor}>
                        Descontos:{" "}
                        {hasValidPrice ? brlMinus(discountsTotalBrl) : "—"}
                      </Text>}
                      <Text
                        fontSize="2xl"
                        fontWeight="extrabold"
                        color={resultListingPriceColor}
                      >
                        {formatMoneyBrlPtBr(totalDiscountStep)}
                      </Text>
                    </VStack>
                  ) : (
                    <Text fontSize="xs" color={textColor}>
                      —
                    </Text>
                  )}
                </Flex>
              </SimpleGrid>
            </Box>
          </Box>
        </Flex>
      </Flex>
    </Box>
  );
}

export function ResultTemplateCard(props: ResultTemplateCardProps) {
  if (props.variant === "listing") {
    return <ResultTemplateCardListing {...props} />;
  }
  return <ResultTemplateCardDiscount {...props} />;
}
