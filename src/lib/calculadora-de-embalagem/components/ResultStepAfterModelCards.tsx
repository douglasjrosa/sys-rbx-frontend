import {
  Box,
  Flex,
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
  Heading,
  Input,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  Text,
  VStack,
} from "@chakra-ui/react";
import type { PackType } from "../utils/packagingCalculator";
import {
  PRE_SEND_TITLE,
  QTY_COLUMN_WIDTH_PX,
  QTY_FIELD_ID,
  conferirQtyQuestionLabel,
} from "../utils/conferirQtyLabels";

const NAMING_TITLE = "Esta etapa é importante.";
const NAMING_LEAD = "Dê um nome a esta embalagem";
const PROD_NAME_FIELD_ID = "calculadora-result-prod-name";
const PROD_CODE_FIELD_ID = "calculadora-result-prod-code";
const PROD_NAME_MAX_LEN = 255;
const PROD_CODE_MAX_LEN = 255;
const PROD_NAME_LABEL = "Nome";
const PROD_NAME_PLACEHOLDER = "Ex.: Prensa Vertical XYZ";
const PROD_NAME_LEGEND = "Nome do que será embalado.";
const PROD_NAME_REQUIRED_MSG = "Informe o nome do que será embalado.";
const PROD_CODE_LABEL = "Código";
const PROD_CODE_PLACEHOLDER = "XYZ-123";
const PROD_CODE_LEGEND = "Seu código interno se houver.";

const DECISION_TITLE =
  "Você vai precisar de mais alguma embalagem além dessa?";
const DECISION_BODY =
  "Em pedidos com mais de uma medida ou modelo, nosso time consegue avaliar " +
  "condições comerciais e descontos de forma conjunta antes de fechar o pedido.";
const DECISION_NO_MORE =
  "Não tenho mais nenhuma medida para calcular agora.";
const DECISION_ADD_ANOTHER = "Ainda tenho mais uma medida para calcular.";

type Theme = {
  bgCard: string;
  borderColor: string;
  headingColor: string;
  textColor: string;
};

export function ResultStepNamingCard(props: {
  theme: Theme;
  prodName: string;
  prodCode: string;
  onProdNameChange: (v: string) => void;
  onProdCodeChange: (v: string) => void;
  onProdNameBlur: () => void;
  showNameError: boolean;
}) {
  const { theme, prodName, prodCode, onProdNameChange, onProdCodeChange } =
    props;
  return (
    <Box
      bg={theme.bgCard}
      borderRadius="xl"
      borderWidth="1px"
      borderColor={theme.borderColor}
      p={{ base: 5, md: 8 }}
      shadow="md"
      w="100%"
    >
      <VStack align="stretch" spacing={5} w="100%">
        <Heading
          size="md"
          color={theme.headingColor}
          textAlign="center"
        >
          {NAMING_TITLE}
        </Heading>
        <Text
          fontSize="md"
          color={theme.textColor}
          textAlign="center"
          lineHeight="tall"
        >
          {NAMING_LEAD}
        </Text>
        <VStack align="stretch" spacing={5} w="100%" maxW="lg" mx="auto" pt={1}>
          <FormControl isRequired isInvalid={props.showNameError}>
            <FormLabel
              htmlFor={PROD_NAME_FIELD_ID}
              color={theme.headingColor}
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
              onBlur={props.onProdNameBlur}
              borderColor={theme.borderColor}
              color={theme.textColor}
              _placeholder={{ color: theme.textColor, opacity: 0.55 }}
            />
            <FormHelperText color={theme.textColor} opacity={0.85}>
              {PROD_NAME_LEGEND}
            </FormHelperText>
            <FormErrorMessage>{PROD_NAME_REQUIRED_MSG}</FormErrorMessage>
          </FormControl>
          <FormControl>
            <FormLabel
              htmlFor={PROD_CODE_FIELD_ID}
              color={theme.headingColor}
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
              borderColor={theme.borderColor}
              color={theme.textColor}
              _placeholder={{ color: theme.textColor, opacity: 0.55 }}
            />
            <FormHelperText color={theme.textColor} opacity={0.85}>
              {PROD_CODE_LEGEND}
            </FormHelperText>
          </FormControl>
        </VStack>
      </VStack>
    </Box>
  );
}

export function ResultStepQtyCard(props: {
  theme: Theme;
  packTypeForQty: Exclude<PackType, "any">;
  qty: number | "";
  onQtyChange: (v: number | "") => void;
}) {
  const { theme, packTypeForQty, qty, onQtyChange } = props;
  return (
    <Box
      bg={theme.bgCard}
      borderRadius="xl"
      borderWidth="1px"
      borderColor={theme.borderColor}
      p={{ base: 5, md: 8 }}
      shadow="md"
      w="100%"
    >
      <VStack align="stretch" spacing={6} w="100%">
        <Heading
          size="sm"
          color={theme.headingColor}
          textAlign="center"
          fontWeight="bold"
        >
          {PRE_SEND_TITLE}
        </Heading>
        <Text
          fontSize="md"
          color={theme.textColor}
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
                color={theme.textColor}
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
                  borderColor={theme.borderColor}
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
      </VStack>
    </Box>
  );
}

export function MorePackagingDecisionCard(props: {
  theme: Theme;
  onNoMore: () => void;
  onAddAnother: () => void;
}) {
  const { theme, onNoMore, onAddAnother } = props;
  return (
    <Box
      bg={theme.bgCard}
      borderRadius="xl"
      borderWidth="1px"
      borderColor={theme.borderColor}
      p={{ base: 5, md: 8 }}
      shadow="md"
      w="100%"
    >
      <VStack align="stretch" spacing={5} w="100%">
        <Heading
          size="md"
          color={theme.headingColor}
          textAlign="center"
        >
          {DECISION_TITLE}
        </Heading>
        <Text
          fontSize="md"
          color={theme.textColor}
          textAlign="center"
          lineHeight="tall"
        >
          {DECISION_BODY}
        </Text>
        <VStack align="stretch" spacing={3} w="100%" pt={2}>
          <Box
            as="button"
            type="button"
            w="100%"
            p={4}
            borderRadius="lg"
            borderWidth="1px"
            borderColor={theme.borderColor}
            bg="transparent"
            cursor="pointer"
            textAlign="left"
            transition="border-color 0.15s ease"
            _hover={{ borderColor: "blue.300" }}
            onClick={onNoMore}
          >
            <Text fontSize="md" fontWeight="bold" color={theme.headingColor}>
              {DECISION_NO_MORE}
            </Text>
          </Box>
          <Box
            as="button"
            type="button"
            w="100%"
            p={4}
            borderRadius="lg"
            borderWidth="1px"
            borderColor={theme.borderColor}
            bg="transparent"
            cursor="pointer"
            textAlign="left"
            transition="border-color 0.15s ease"
            _hover={{ borderColor: "blue.300" }}
            onClick={onAddAnother}
          >
            <Text fontSize="md" fontWeight="bold" color={theme.headingColor}>
              {DECISION_ADD_ANOTHER}
            </Text>
          </Box>
        </VStack>
      </VStack>
    </Box>
  );
}
