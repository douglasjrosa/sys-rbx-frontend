import { ArrowBackIcon } from "@chakra-ui/icons";
import {
  Box,
  Button,
  Collapse,
  Flex,
  FormControl,
  FormHelperText,
  FormLabel,
  Heading,
  Icon,
  Input,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  SimpleGrid,
  Text,
  Textarea,
  VStack,
} from "@chakra-ui/react";
import { useEffect, useRef } from "react";
import type { IconType } from "react-icons";
import { FaExclamationCircle, FaQuestionCircle } from "react-icons/fa";
import type { AppliedDiscounts } from "../utils/appliedDiscounts";
import type { CustomerClarity } from "../utils/calculadoraSubmissionPayload";
import type { CalculadoraPricingQuote } from "../utils/pricing";
import { SimulationSummaryPanel } from "./SimulationSummaryPanel";
import type {
  SimulationSummaryEditTarget,
  SimulationSummaryItemModel,
} from "../utils/simulationSummaryItems";
import type { PackType } from "../utils/packagingCalculator";

type StepConferirContentProps = {
  bgCard: string;
  borderColor: string;
  headingColor: string;
  textColor: string;
  simulationSummaryOpen: boolean;
  onToggleSummaryOpen: () => void;
  summaryItems: SimulationSummaryItemModel[];
  onEditSummaryItem: (target: SimulationSummaryEditTarget) => void;
  appliedDiscounts: AppliedDiscounts;
  pricingQuote: CalculadoraPricingQuote | null;
  totalPriceColor: string;
  customerClarity: CustomerClarity | null;
  onClarityChange: (value: CustomerClarity) => void;
  packTypeForQty: Exclude<PackType, "any">;
  qty: number | "";
  onQtyChange: (value: number | "") => void;
  prodName: string;
  onProdNameChange: (value: string) => void;
  prodCode: string;
  onProdCodeChange: (value: string) => void;
  message: string;
  onMessageChange: (value: string) => void;
  onBack: () => void;
  onSubmit: () => void;
};

const QTY_COLUMN_WIDTH_PX = 100;
const CONFERIR_MESSAGE_MAX_LEN = 4000;

const INTRO_TITLE = "Pronto, agora é só conferir e enviar!";
const INTRO_BODY =
  "Em seguida, um dos nossos vendedores vai entrar em contato com você " +
  "para sanar qualquer dúvida e finalizar o seu pedido.";
const OPTIONS_TITLE = "Escolha uma das opções";
const PRE_SEND_TITLE = "Antes de enviar, só mais umas perguntinhas...";
const OPTIONAL_MESSAGE_LABEL =
  "Faltou algum detalhe? Escreva aqui. (opcional)";
const MESSAGE_PLACEHOLDER =
  "Envie aqui uma mensagem para o vendedor, ou vendedora que vai te atender.";
const QTY_FIELD_ID = "calculadora-conferir-qty";
const PROD_NAME_FIELD_ID = "calculadora-conferir-prod-name";
const PROD_CODE_FIELD_ID = "calculadora-conferir-prod-code";
const MESSAGE_FIELD_ID = "calculadora-conferir-message";
const PROD_NAME_MAX_LEN = 255;
const PROD_CODE_MAX_LEN = 255;
const PROD_NAME_LABEL = "Nome do produto (opcional)";
const PROD_NAME_PLACEHOLDER = "Ex.: Freezer vertical XYZ";
const PROD_NAME_LEGEND =
  "Chamar a embalagem pelo nome do produto ajuda a se referir a esta caixa no futuro.";
const PROD_CODE_LABEL = "Código do produto (opcional)";
const PROD_CODE_PLACEHOLDER = "Ex.: XYZ-6543-21";
const PROD_CODE_LEGEND =
  "Se o seu produto tem um código, isso pode ser útil no futuro.";

function conferirQtyQuestionLabel(packType: Exclude<PackType, "any">): string {
  switch (packType) {
    case "box":
      return "Se tudo der certo, de quantas caixas você vai precisar?";
    case "crate":
      return "Se tudo der certo, de quantos engradados você vai precisar?";
    case "pallet":
      return "Se tudo der certo, de quantos paletes você vai precisar?";
    default:
      return "Se tudo der certo, de quantas unidades você vai precisar?";
  }
}

const OPTION_CLEAR_LEAD = "Acho que tudo está certo.";
const OPTION_CLEAR_REST =
  "Agora só quero falar com alguém do comercial para alinhar os detalhes " +
  "e seguir com o meu pedido.";

const OPTION_DOUBT_LEAD =
  "Ainda não tenho certeza de que este é o produto certo para o meu caso.";
const OPTION_DOUBT_REST =
  "Quero falar com alguém do comercial antes de seguir com o pedido.";

function ClarityOptionCard(props: {
  isSelected: boolean;
  borderColor: string;
  headingColor: string;
  textColor: string;
  icon: IconType;
  lead: string;
  rest: string;
  onSelect: () => void;
}) {
  const {
    isSelected,
    borderColor,
    headingColor,
    textColor,
    icon: IconComponent,
    lead,
    rest,
    onSelect,
  } = props;
  return (
    <Box
      as="button"
      type="button"
      w="100%"
      h="100%"
      display="flex"
      flexDirection="column"
      maxW="100%"
      p={4}
      borderRadius="xl"
      borderWidth={isSelected ? "2px" : "1px"}
      borderColor={isSelected ? "blue.400" : borderColor}
      bg="transparent"
      cursor="pointer"
      textAlign="left"
      transition="border-color 0.15s ease"
      _hover={{ borderColor: "blue.300" }}
      onClick={onSelect}
    >
      <VStack
        align="stretch"
        spacing={3}
        flex="1"
        justify="flex-start"
        w="100%"
      >
        <Icon as={IconComponent} boxSize={9} color="blue.500" aria-hidden />
        <Text fontSize="md" fontWeight="extrabold" color={headingColor} lineHeight="short">
          {lead}
        </Text>
        <Text fontSize="sm" color={textColor} lineHeight="tall" opacity={0.92}>
          {rest}
        </Text>
      </VStack>
    </Box>
  );
}

export function StepConferirContent({
  bgCard,
  borderColor,
  headingColor,
  textColor,
  simulationSummaryOpen,
  onToggleSummaryOpen,
  summaryItems,
  onEditSummaryItem,
  appliedDiscounts,
  pricingQuote,
  totalPriceColor,
  customerClarity,
  onClarityChange,
  packTypeForQty,
  qty,
  onQtyChange,
  prodName,
  onProdNameChange,
  prodCode,
  onProdCodeChange,
  message,
  onMessageChange,
  onBack,
  onSubmit,
}: StepConferirContentProps) {
  const qtyBlockRef = useRef<HTMLDivElement | null>(null);
  const messageBlockRef = useRef<HTMLDivElement | null>(null);
  const prevClarityRef = useRef<CustomerClarity | null>(null);
  const prevQtyValidRef = useRef(false);

  const qtyValid =
    typeof qty === "number" && Number.isInteger(qty) && qty >= 1;
  const canSubmit = customerClarity != null && qtyValid;

  useEffect(() => {
    const prev = prevClarityRef.current;
    prevClarityRef.current = customerClarity;
    if (prev != null || customerClarity == null) {
      return;
    }
    const id = window.setTimeout(() => {
      qtyBlockRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }, 280);
    return () => window.clearTimeout(id);
  }, [customerClarity]);

  useEffect(() => {
    if (!qtyValid) {
      prevQtyValidRef.current = false;
      return;
    }
    if (prevQtyValidRef.current) {
      return;
    }
    prevQtyValidRef.current = true;
    const id = window.setTimeout(() => {
      messageBlockRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }, 220);
    return () => window.clearTimeout(id);
  }, [qtyValid]);

  return (
    <VStack align="stretch" spacing={6} w="100%">
      <Box
        bg={bgCard}
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
          {INTRO_TITLE}
        </Heading>
        <Text
          fontSize="md"
          color={textColor}
          textAlign="center"
          lineHeight="tall"
        >
          {INTRO_BODY}
        </Text>
      </Box>

      <SimulationSummaryPanel
        simulationSummaryOpen={simulationSummaryOpen}
        onToggleOpen={onToggleSummaryOpen}
        items={summaryItems}
        onEditItem={onEditSummaryItem}
        bgCard={bgCard}
        borderColor={borderColor}
        headingColor={headingColor}
        textColor={textColor}
        appliedDiscounts={appliedDiscounts}
        pricingQuote={pricingQuote}
        totalPriceColor={totalPriceColor}
      />

      <Box
        bg={bgCard}
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
          mb={5}
        >
          {OPTIONS_TITLE}
        </Heading>
        <SimpleGrid
          columns={{ base: 1, md: 2 }}
          spacing={4}
          w="100%"
          alignItems="stretch"
        >
          <ClarityOptionCard
            isSelected={customerClarity === "clear"}
            borderColor={borderColor}
            headingColor={headingColor}
            textColor={textColor}
            icon={FaExclamationCircle}
            lead={OPTION_CLEAR_LEAD}
            rest={OPTION_CLEAR_REST}
            onSelect={() => onClarityChange("clear")}
          />
          <ClarityOptionCard
            isSelected={customerClarity === "doubt"}
            borderColor={borderColor}
            headingColor={headingColor}
            textColor={textColor}
            icon={FaQuestionCircle}
            lead={OPTION_DOUBT_LEAD}
            rest={OPTION_DOUBT_REST}
            onSelect={() => onClarityChange("doubt")}
          />
        </SimpleGrid>

        <Collapse in={customerClarity != null} animateOpacity>
          <Box ref={qtyBlockRef} w="100%" mt={8} pt={4}>
            <VStack align="stretch" spacing={6} w="100%">
              <Heading
                size="sm"
                color={headingColor}
                textAlign="center"
                fontWeight="bold"
              >
                {PRE_SEND_TITLE}
              </Heading>
              <Text
                fontSize="md"
                color={textColor}
                textAlign="center"
                lineHeight="tall"
              >
                {conferirQtyQuestionLabel(packTypeForQty)}
              </Text>
              <Flex w="100%" justify="center">
                <Box
                  w={`${QTY_COLUMN_WIDTH_PX}px`}
                  maxW={`${QTY_COLUMN_WIDTH_PX}px`}
                  flexShrink={0}
                >
                  <FormControl isRequired>
                    <FormLabel
                      htmlFor={QTY_FIELD_ID}
                      color={textColor}
                      textAlign="center"
                      mr={0}
                    >
                      Quantidade
                    </FormLabel>
                    <NumberInput
                      min={1}
                      step={1}
                      size="sm"
                      w="100%"
                      maxW="100%"
                      value={qty === "" ? "" : qty}
                      onChange={(_, n) => {
                        if (Number.isNaN(n)) {
                          onQtyChange("");
                        } else {
                          onQtyChange(Math.max(1, Math.floor(n)));
                        }
                      }}
                      sx={{
                        "& .chakra-numberinput__field": {
                          minW: 0,
                          px: 1,
                        },
                      }}
                    >
                      <NumberInputField
                        id={QTY_FIELD_ID}
                        inputMode="numeric"
                        placeholder="1"
                        aria-required
                        borderColor={borderColor}
                        minH="44px"
                        textAlign="center"
                      />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                  </FormControl>
                </Box>
              </Flex>

              <VStack
                align="stretch"
                spacing={5}
                w="100%"
                maxW="lg"
                mx="auto"
                pt={1}
              >
                <FormControl>
                  <FormLabel
                    htmlFor={PROD_NAME_FIELD_ID}
                    color={headingColor}
                    fontWeight="semibold"
                    mb={1}
                  >
                    {PROD_NAME_LABEL}
                  </FormLabel>
                  <Input
                    id={PROD_NAME_FIELD_ID}
                    value={prodName}
                    placeholder={PROD_NAME_PLACEHOLDER}
                    onChange={(e) => {
                      const next = e.target.value;
                      if (next.length <= PROD_NAME_MAX_LEN) {
                        onProdNameChange(next);
                      }
                    }}
                    borderColor={borderColor}
                    color={textColor}
                    _placeholder={{ color: textColor, opacity: 0.55 }}
                  />
                  <FormHelperText color={textColor} opacity={0.85}>
                    {PROD_NAME_LEGEND}
                  </FormHelperText>
                </FormControl>
                <FormControl>
                  <FormLabel
                    htmlFor={PROD_CODE_FIELD_ID}
                    color={headingColor}
                    fontWeight="semibold"
                    mb={1}
                  >
                    {PROD_CODE_LABEL}
                  </FormLabel>
                  <Input
                    id={PROD_CODE_FIELD_ID}
                    value={prodCode}
                    placeholder={PROD_CODE_PLACEHOLDER}
                    onChange={(e) => {
                      const next = e.target.value;
                      if (next.length <= PROD_CODE_MAX_LEN) {
                        onProdCodeChange(next);
                      }
                    }}
                    borderColor={borderColor}
                    color={textColor}
                    _placeholder={{ color: textColor, opacity: 0.55 }}
                  />
                  <FormHelperText color={textColor} opacity={0.85}>
                    {PROD_CODE_LEGEND}
                  </FormHelperText>
                </FormControl>
              </VStack>

              <Collapse in={qtyValid} animateOpacity>
                <Box ref={messageBlockRef} w="100%" pt={8}>
                  <FormControl>
                    <FormLabel
                      htmlFor={MESSAGE_FIELD_ID}
                      color={headingColor}
                      fontWeight="semibold"
                      textAlign="center"
                      mb={3}
                    >
                      {OPTIONAL_MESSAGE_LABEL}
                    </FormLabel>
                    <Textarea
                      id={MESSAGE_FIELD_ID}
                      value={message}
                      placeholder={MESSAGE_PLACEHOLDER}
                      onChange={(e) => {
                        const next = e.target.value;
                        if (next.length <= CONFERIR_MESSAGE_MAX_LEN) {
                          onMessageChange(next);
                        }
                      }}
                      rows={4}
                      resize="vertical"
                      borderColor={borderColor}
                      color={textColor}
                      _placeholder={{ color: textColor, opacity: 0.55 }}
                    />
                  </FormControl>
                </Box>
              </Collapse>
            </VStack>
          </Box>
        </Collapse>
      </Box>

      <Flex
        w="100%"
        justify="space-between"
        align="center"
        gap={4}
        flexWrap="wrap"
      >
        <Button
          type="button"
          variant="ghost"
          size="lg"
          leftIcon={<ArrowBackIcon />}
          onClick={onBack}
        >
          Voltar
        </Button>
        <Button
          type="button"
          colorScheme="blue"
          size="lg"
          minH="44px"
          isDisabled={!canSubmit}
          onClick={onSubmit}
        >
          Enviar
        </Button>
      </Flex>
    </VStack>
  );
}
