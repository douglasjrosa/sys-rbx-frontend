import { ArrowBackIcon } from "@chakra-ui/icons";
import {
  Box,
  Button,
  Collapse,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Icon,
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
  /** Quantity was set on the price step; required to enable submit. */
  lineQtyValid: boolean;
  message: string;
  onMessageChange: (value: string) => void;
  onBack: () => void;
  onSubmit: () => void;
};

const CONFERIR_MESSAGE_MAX_LEN = 4000;

const INTRO_TITLE = "Pronto, agora é só conferir e enviar!";
const INTRO_BODY =
  "Em seguida, um dos nossos vendedores vai entrar em contato com você " +
  "para sanar qualquer dúvida e finalizar o seu pedido.";
const OPTIONS_TITLE = "Escolha uma das opções";
const OPTIONAL_MESSAGE_LABEL =
  "Faltou algum detalhe? Escreva aqui. (opcional)";
const MESSAGE_PLACEHOLDER =
  "Envie aqui uma mensagem para o vendedor, ou vendedora que vai te atender.";
const MESSAGE_FIELD_ID = "calculadora-conferir-message";

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
        <Text
          fontSize="md"
          fontWeight="extrabold"
          color={headingColor}
          lineHeight="short"
        >
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
  lineQtyValid,
  message,
  onMessageChange,
  onBack,
  onSubmit,
}: StepConferirContentProps) {
  const messageBlockRef = useRef<HTMLDivElement | null>(null);
  const prevClarityRef = useRef<CustomerClarity | null>(null);

  const canSubmit = customerClarity != null && lineQtyValid;

  useEffect(() => {
    const prev = prevClarityRef.current;
    prevClarityRef.current = customerClarity;
    if (prev != null || customerClarity == null) {
      return;
    }
    const id = window.setTimeout(() => {
      messageBlockRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }, 280);
    return () => window.clearTimeout(id);
  }, [customerClarity]);

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
          <Box ref={messageBlockRef} w="100%" mt={8} pt={4}>
            <VStack align="stretch" spacing={6} w="100%">
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
