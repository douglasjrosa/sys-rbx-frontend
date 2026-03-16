import {
  Box,
  Button,
  Collapse,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  IconButton,
  Input,
  InputGroup,
  InputRightAddon,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Radio,
  RadioGroup,
  Select,
  Stack,
  Text,
  useColorMode,
  useColorModeValue,
  useToast,
  VStack,
} from "@chakra-ui/react";
import { MoonIcon, SunIcon } from "@chakra-ui/icons";
import { AnimatePresence, motion } from "framer-motion";
import { NextPage } from "next";
import Head from "next/head";
import { FormEvent, useCallback, useState } from "react";
import {
  ASK_CONTENT_PROD_TYPES,
  FRACTIONED_PROD_TYPES,
  getElegibleTemplates,
  PackagingFormData,
  PackType,
  PRODUCT_TYPE_LABELS,
  toMeters,
  validateCnpj,
  validateEmail,
  WEIGHT_THRESHOLD_KG,
  LENGTH_THRESHOLD_M,
  WIDTH_THRESHOLD_M,
} from "@/utils/packagingCalculator";
import boxTemplates from "@/data/box-templates.json";

const PACK_TYPE_OPTIONS: { value: PackType; label: string }[] = [
  { value: "box", label: "Caixa Fechada" },
  { value: "crate", label: "Engradado" },
  { value: "pallet", label: "Palete" },
  { value: "any", label: "Ajude-me a escolher" },
];

const STEP_TELA1 = 1;
const STEP_TELA2 = 2;
const STEP_TELA3 = 3;
const STEP_TELA4 = 4;
const STEP_TELA5 = 5;
const STEP_TELA6 = 6;
const STEP_RESULT = 7;

const initialForm: Partial<PackagingFormData> = {
  packType: "any",
  prodType: 0,
  isExport: false,
  weight: 0,
  unit: "cm",
  length: 0,
  width: 0,
  height: 0,
  isUnitizedContent: undefined,
  isDistributedWeight: undefined,
  customerCnpj: "",
  customerName: "",
  customerEmail: "",
  customerPhone: "",
};

const MotionBox = motion( Box );

const TELA1_SUB_PACK = 0;
const TELA1_SUB_PROD = 1;
const TELA1_SUB_EXPORT = 2;
const TELA1_SUB_WEIGHT = 3;

const DEFAULT_PRODTYPE_FOR_PALLET = 11;

const CalculadoraEmbalagem: NextPage = () => {
  const { colorMode, toggleColorMode } = useColorMode();
  const toast = useToast();
  const [ step, setStep ] = useState( STEP_TELA1 );
  const [ tela1SubStep, setTela1SubStep ] = useState( TELA1_SUB_PACK );
  const [ form, setForm ] = useState<Partial<PackagingFormData>>( initialForm );
  const [ elegibleTemplates, setElegibleTemplates ] = useState<string[]>( [] );

  const isPallet = form.packType === "pallet";
  const showProdType = form.packType && !isPallet;

  const bgPage = useColorModeValue( "gray.50", "gray.900" );
  const bgCard = useColorModeValue( "white", "gray.800" );
  const borderColor = useColorModeValue( "gray.200", "gray.600" );
  const headingColor = useColorModeValue( "gray.800", "white" );
  const textColor = useColorModeValue( "gray.600", "gray.300" );
  const preBg = useColorModeValue( "gray.100", "gray.700" );

  const updateForm = useCallback( ( updates: Partial<PackagingFormData> ) => {
    setForm( ( prev ) => ( { ...prev, ...updates } ) );
  }, [] );

  const goToStep = useCallback( ( next: number ) => {
    setStep( next );
  }, [] );

  const handlePackTypeChange = useCallback( ( v: string ) => {
    const packType = v as PackType;
    updateForm( { packType } );
    if ( tela1SubStep === TELA1_SUB_PACK ) {
      if ( packType === "pallet" ) {
        updateForm( { prodType: DEFAULT_PRODTYPE_FOR_PALLET } );
        setTela1SubStep( TELA1_SUB_EXPORT );
      } else {
        setTela1SubStep( TELA1_SUB_PROD );
      }
    }
  }, [ tela1SubStep, updateForm ] );

  const handleProdTypeChange = useCallback( ( value: number ) => {
    updateForm( { prodType: value } );
    if ( tela1SubStep === TELA1_SUB_PROD ) setTela1SubStep( TELA1_SUB_EXPORT );
  }, [ tela1SubStep, updateForm ] );

  const handleIsExportChange = useCallback( ( value: boolean ) => {
    updateForm( { isExport: value } );
    if ( tela1SubStep === TELA1_SUB_EXPORT ) setTela1SubStep( TELA1_SUB_WEIGHT );
  }, [ tela1SubStep, updateForm ] );

  const handleTela1Continue = ( e: FormEvent ) => {
    e.preventDefault();
    const hasProdType = isPallet || ( form.prodType && form.prodType > 0 );
    if (
      !form.packType ||
      !hasProdType ||
      form.isExport === undefined ||
      !form.weight
    ) {
      toast( {
        title: "Preencha todos os campos",
        status: "warning",
        duration: 3000,
      } );
      return;
    }
    goToStep( STEP_TELA2 );
  };

  const advanceFromTela4Check = useCallback(
    ( weightVal: number, lengthVal: number, widthVal: number, unitVal: "mm" | "cm" ) => {
      const lengthM = toMeters( lengthVal, unitVal );
      const widthM = toMeters( widthVal, unitVal );
      const skipCondition =
        weightVal < WEIGHT_THRESHOLD_KG ||
        ( lengthM < LENGTH_THRESHOLD_M && widthM < WIDTH_THRESHOLD_M );
      if ( skipCondition ) {
        updateForm( { isDistributedWeight: null } );
        goToStep( STEP_TELA6 );
      } else {
        goToStep( STEP_TELA4 );
      }
    },
    [ updateForm, goToStep ]
  );

  const handleTela2Continue = ( e: FormEvent ) => {
    e.preventDefault();
    const unit = ( form.unit || "cm" ) as "mm" | "cm";
    const length = Number( form.length ) || 0;
    const width = Number( form.width ) || 0;
    const height = form.packType === "pallet" ? 0 : ( Number( form.height ) || 0 );
    if ( !length || !width || ( form.packType !== "pallet" && !height ) ) {
      toast( {
        title: "Preencha todas as medidas",
        status: "warning",
        duration: 3000,
      } );
      return;
    }
    updateForm( { length, width, height: form.packType === "pallet" ? undefined : height } );
    const prodType = form.prodType!;
    const weightVal = Number( form.weight ) || 0;
    if ( FRACTIONED_PROD_TYPES.includes( prodType ) ) {
      updateForm( { isUnitizedContent: false } );
      goToStep( STEP_TELA6 );
    } else if ( ASK_CONTENT_PROD_TYPES.includes( prodType ) ) {
      goToStep( STEP_TELA3 );
    } else {
      updateForm( { isUnitizedContent: true } );
      advanceFromTela4Check( weightVal, length, width, unit );
    }
  };

  const handleTela3Choice = ( unitized: boolean ) => {
    updateForm( { isUnitizedContent: unitized } );
    if ( unitized ) {
      const weightVal = Number( form.weight ) || 0;
      const lengthVal = Number( form.length ) || 0;
      const widthVal = Number( form.width ) || 0;
      const unitVal = ( form.unit || "cm" ) as "mm" | "cm";
      advanceFromTela4Check( weightVal, lengthVal, widthVal, unitVal );
    } else {
      goToStep( STEP_TELA6 );
    }
  };

  const handleTela4Choice = ( distributed: boolean ) => {
    updateForm( { isDistributedWeight: distributed } );
    if ( distributed ) {
      goToStep( STEP_TELA6 );
    } else {
      goToStep( STEP_TELA5 );
    }
  };

  const handleTela5Continue = () => {
    goToStep( STEP_TELA6 );
  };

  const handleTela6Submit = ( e: FormEvent ) => {
    e.preventDefault();
    const cnpj = ( form.customerCnpj || "" ).trim();
    const email = ( form.customerEmail || "" ).trim();
    if ( !cnpj || !form.customerName || !email || !form.customerPhone ) {
      toast( {
        title: "Preencha todos os campos de contato",
        status: "warning",
        duration: 3000,
      } );
      return;
    }
    if ( !validateCnpj( cnpj ) ) {
      toast( {
        title: "CNPJ inválido",
        status: "error",
        duration: 3000,
      } );
      return;
    }
    if ( !validateEmail( email ) ) {
      toast( {
        title: "E-mail inválido",
        status: "error",
        duration: 3000,
      } );
      return;
    }
    const fullForm: PackagingFormData = {
      packType: form.packType!,
      prodType: form.prodType!,
      isExport: form.isExport!,
      weight: Number( form.weight ) || 0,
      unit: form.unit!,
      length: Number( form.length ) || 0,
      width: Number( form.width ) || 0,
      height: form.packType === "pallet" ? undefined : ( Number( form.height ) || 0 ),
      isUnitizedContent: form.isUnitizedContent,
      isDistributedWeight: form.isDistributedWeight ?? null,
      customerCnpj: cnpj,
      customerName: form.customerName || "",
      customerEmail: email,
      customerPhone: form.customerPhone || "",
    };
    const templates = getElegibleTemplates(
      fullForm,
      boxTemplates as import( "@/utils/packagingCalculator" ).BoxTemplate[]
    );
    setElegibleTemplates( templates );
    goToStep( STEP_RESULT );
  };

  const dimensionsIntro = () => {
    const pt = form.packType;
    if ( pt === "pallet" ) return "Informe as medidas que você precisa que o palete tenha.";
    if ( pt === "box" ) return "Informe as medidas finais que você precisa que tenha dentro da Caixa.";
    if ( pt === "crate" ) return "Informe as medidas finais que você precisa que tenha dentro do Engradado.";
    return "Informe as medidas que você precisa que tenha dentro da embalagem ou palete que vamos calcular.";
  };

  return (
    <>
      <Head>
        <title>Calculadora de Embalagem | Ribermax</title>
        <meta
          name="description"
          content="Calcule o modelo ideal de embalagem para sua necessidade."
        />
      </Head>

      <Box
        minH="100vh"
        minW="100vw"
        bg={bgPage}
        color={textColor}
        py={{ base: 4, md: 8 }}
        px={{ base: 4, md: 6 }}
      >
        <Flex
          maxW="640px"
          mx="auto"
          direction="column"
          gap={{ base: 6, md: 8 }}
          align="stretch"
        >
          <Flex justify="space-between" align="center" wrap="wrap" gap={2}>
            <Heading
              size={{ base: "lg", md: "xl" }}
              color={headingColor}
              fontWeight="bold"
            >
              Calculadora de Embalagem
            </Heading>
            <IconButton
              aria-label="Alternar tema"
              icon={colorMode === "light" ? <MoonIcon /> : <SunIcon />}
              onClick={toggleColorMode}
              variant="ghost"
              size="lg"
              fontSize="xl"
              color={headingColor}
            />
          </Flex>

          <AnimatePresence mode="wait">
            {step === STEP_TELA1 && (
              <MotionBox
                key="tela1"
                as="form"
                onSubmit={handleTela1Continue}
                bg={bgCard}
                borderRadius="xl"
                borderWidth="1px"
                borderColor={borderColor}
                p={{ base: 5, md: 8 }}
                shadow="md"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
              >
                <VStack align="stretch" spacing={{ base: 6, md: 8 }}>
                  <FormControl as="fieldset" isRequired>
                    <FormLabel
                      as="legend"
                      fontSize="lg"
                      fontWeight="semibold"
                      color={headingColor}
                      mb={3}
                    >
                      O que você quer calcular hoje?
                    </FormLabel>
                    <RadioGroup
                      value={form.packType || ""}
                      onChange={handlePackTypeChange}
                    >
                      <Stack
                        direction={{ base: "column", sm: "row" }}
                        spacing={{ base: 3, sm: 4 }}
                        flexWrap="wrap"
                      >
                        {PACK_TYPE_OPTIONS.map( ( opt ) => (
                          <Radio
                            key={opt.value}
                            value={opt.value}
                            colorScheme="blue"
                            size={{ base: "md", md: "lg" }}
                          >
                            {opt.label}
                          </Radio>
                        ) )}
                      </Stack>
                    </RadioGroup>
                  </FormControl>

                  <Collapse in={showProdType && tela1SubStep >= TELA1_SUB_PROD}>
                    <FormControl as="fieldset" isRequired w="full">
                      <FormLabel
                        as="legend"
                        fontSize="lg"
                        fontWeight="semibold"
                        color={headingColor}
                        mb={3}
                      >
                        Que tipo de produto você precisa embalar?
                      </FormLabel>
                      <Select
                        placeholder="Selecione o tipo de produto"
                        value={form.prodType ? String( form.prodType ) : ""}
                        onChange={( e ) =>
                          handleProdTypeChange(
                            e.target.value ? parseInt( e.target.value, 10 ) : 0
                          )
                        }
                        size="lg"
                        borderColor={borderColor}
                        minH="44px"
                      >
                        {Object.entries( PRODUCT_TYPE_LABELS ).map( ( [ k, label ] ) => (
                          <option key={k} value={k}>
                            {k} - {label}
                          </option>
                        ) )}
                      </Select>
                    </FormControl>
                  </Collapse>

                  <Collapse in={tela1SubStep >= TELA1_SUB_EXPORT}>
                    <FormControl as="fieldset" isRequired w="full">
                      <FormLabel
                        as="legend"
                        fontSize="lg"
                        fontWeight="semibold"
                        color={headingColor}
                        mb={3}
                      >
                        Para onde vai a embalagem? É exportação?
                      </FormLabel>
                      <RadioGroup
                        value={
                          form.isExport === undefined ? "" : form.isExport ? "yes" : "no"
                        }
                        onChange={( v ) => handleIsExportChange( v === "yes" )}
                      >
                        <Stack direction="column" spacing={3}>
                          <Radio
                            value="yes"
                            colorScheme="blue"
                            size={{ base: "md", md: "lg" }}
                          >
                            Sim. A embalagem transportará meu produto para outro país
                            (Exportação)
                          </Radio>
                          <Radio value="no" colorScheme="blue" size={{ base: "md", md: "lg" }}>
                            Não. A embalagem transportará meu produto somente dentro do Brasil
                          </Radio>
                        </Stack>
                      </RadioGroup>
                    </FormControl>
                  </Collapse>

                  <Collapse in={tela1SubStep >= TELA1_SUB_WEIGHT}>
                    <FormControl as="fieldset" isRequired w="full">
                      <FormLabel
                        as="legend"
                        fontSize="lg"
                        fontWeight="semibold"
                        color={headingColor}
                        mb={3}
                      >
                        Qual é o peso aproximado do que você precisa embalar?
                      </FormLabel>
                      <InputGroup
                        size="lg"
                        maxW={{ base: "100%", sm: "200px" }}
                        minH="44px"
                      >
                        <NumberInput
                          value={form.weight || ""}
                          onChange={( _, v ) => updateForm( { weight: v } )}
                          min={0}
                          w="full"
                        >
                          <NumberInputField
                            placeholder="0"
                            borderColor={borderColor}
                          />
                          <NumberInputStepper>
                            <NumberIncrementStepper />
                            <NumberDecrementStepper />
                          </NumberInputStepper>
                        </NumberInput>
                        <InputRightAddon>kg</InputRightAddon>
                      </InputGroup>
                      <Text mt={2} fontSize="sm" color={textColor}>
                        Informe o peso em quilogramas
                      </Text>
                    </FormControl>
                  </Collapse>

                  <Collapse in={tela1SubStep >= TELA1_SUB_WEIGHT}>
                    <Button
                      type="submit"
                      colorScheme="blue"
                      size="lg"
                      w={{ base: "full", sm: "auto" }}
                      minW="160px"
                      minH="44px"
                      alignSelf={{ base: "stretch", sm: "flex-start" }}
                    >
                      Continuar
                    </Button>
                  </Collapse>
                </VStack>
              </MotionBox>
            )}

            {step === STEP_TELA2 && (
              <MotionBox
                key="tela2"
                as="form"
                onSubmit={handleTela2Continue}
                bg={bgCard}
                borderRadius="xl"
                borderWidth="1px"
                borderColor={borderColor}
                p={{ base: 5, md: 8 }}
                shadow="md"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
              >
                <VStack align="stretch" spacing={{ base: 6, md: 8 }}>
                  <Text fontSize="lg" fontWeight="semibold" color={headingColor}>
                    {dimensionsIntro()}
                  </Text>

                  <FormControl isRequired>
                    <FormLabel>Unidade de medida</FormLabel>
                    <Select
                      value={form.unit || "cm"}
                      onChange={( e ) =>
                        updateForm( {
                          unit: e.target.value as "mm" | "cm",
                        } )
                      }
                      size="lg"
                      borderColor={borderColor}
                      minH="44px"
                    >
                      <option value="mm">mm</option>
                      <option value="cm">cm</option>
                    </Select>
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel>Comprimento</FormLabel>
                    <NumberInput
                      value={form.length || ""}
                      onChange={( _, v ) => updateForm( { length: v } )}
                      min={0}
                      step={0.1}
                    >
                      <NumberInputField borderColor={borderColor} minH="44px" />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel>Largura</FormLabel>
                    <NumberInput
                      value={form.width || ""}
                      onChange={( _, v ) => updateForm( { width: v } )}
                      min={0}
                      step={0.1}
                    >
                      <NumberInputField borderColor={borderColor} minH="44px" />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                  </FormControl>

                  {!isPallet && (
                    <FormControl isRequired>
                      <FormLabel>Altura</FormLabel>
                      <NumberInput
                        value={form.height ?? ""}
                        onChange={( _, v ) => updateForm( { height: v } )}
                        min={0}
                        step={0.1}
                      >
                        <NumberInputField borderColor={borderColor} minH="44px" />
                        <NumberInputStepper>
                          <NumberIncrementStepper />
                          <NumberDecrementStepper />
                        </NumberInputStepper>
                      </NumberInput>
                    </FormControl>
                  )}

                  <Button
                    type="submit"
                    colorScheme="blue"
                    size="lg"
                    minH="44px"
                  >
                    Continuar
                  </Button>
                </VStack>
              </MotionBox>
            )}

            {step === STEP_TELA3 && (
              <MotionBox
                key="tela3"
                bg={bgCard}
                borderRadius="xl"
                borderWidth="1px"
                borderColor={borderColor}
                p={{ base: 5, md: 8 }}
                shadow="md"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
              >
                <VStack align="stretch" spacing={{ base: 6, md: 8 }}>
                  <Text fontSize="lg" fontWeight="semibold" color={headingColor}>
                    Como vai ficar o conteúdo da embalagem?
                  </Text>
                  <RadioGroup>
                    <Stack direction="column" spacing={4}>
                      <Box
                        as="label"
                        p={4}
                        borderWidth="2px"
                        borderColor={borderColor}
                        borderRadius="lg"
                        cursor="pointer"
                        _hover={{ borderColor: "blue.400" }}
                        onClick={() => handleTela3Choice( true )}
                        minH="44px"
                        display="flex"
                        alignItems="center"
                      >
                        <Radio value="1" colorScheme="blue" size="lg" mr={3} />
                        <Text>
                          Meu produto vai sozinho dentro da caixa, talvez com alguns pequenos
                          acessórios. As laterais da embalagem podem ser mais econômicas porque
                          elas não serão pressionadas de dentro para fora.
                        </Text>
                      </Box>
                      <Box
                        as="label"
                        p={4}
                        borderWidth="2px"
                        borderColor={borderColor}
                        borderRadius="lg"
                        cursor="pointer"
                        _hover={{ borderColor: "blue.400" }}
                        onClick={() => handleTela3Choice( false )}
                        minH="44px"
                        display="flex"
                        alignItems="center"
                      >
                        <Radio value="2" colorScheme="blue" size="lg" mr={3} />
                        <Text>
                          Meus produtos serão vários e vão ficar todos soltos dentro da caixa.
                          As laterais precisam ser reforçadas para aguentar.
                        </Text>
                      </Box>
                    </Stack>
                  </RadioGroup>
                </VStack>
              </MotionBox>
            )}

            {step === STEP_TELA4 && (
              <MotionBox
                key="tela4"
                bg={bgCard}
                borderRadius="xl"
                borderWidth="1px"
                borderColor={borderColor}
                p={{ base: 5, md: 8 }}
                shadow="md"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
              >
                <VStack align="stretch" spacing={{ base: 6, md: 8 }}>
                  <Text fontSize="lg" fontWeight="semibold" color={headingColor}>
                    O peso do produto vai ficar bem distribuído sobre o palete, ou concentrado
                    em alguns pontos?
                  </Text>
                  <Text fontSize="sm" color={textColor}>
                    Exemplo: uma geladeira deitada distribui seu peso ao longo da base. Uma
                    geladeira em pé concentra seu peso nos pontos da base onde vão estar os 4
                    pés da geladeira.
                  </Text>
                  <Stack direction="column" spacing={3}>
                    <Button
                      colorScheme="blue"
                      variant="outline"
                      size="lg"
                      minH="44px"
                      onClick={() => handleTela4Choice( true )}
                      justifyContent="flex-start"
                      textAlign="left"
                    >
                      Sim. O peso vai ficar distribuído em toda a área da base.
                    </Button>
                    <Button
                      colorScheme="blue"
                      variant="outline"
                      size="lg"
                      minH="44px"
                      onClick={() => handleTela4Choice( false )}
                      justifyContent="flex-start"
                      textAlign="left"
                    >
                      Não. O peso vai se concentrar em alguns pontos sobre a base.
                    </Button>
                  </Stack>
                </VStack>
              </MotionBox>
            )}

            {step === STEP_TELA5 && (
              <MotionBox
                key="tela5"
                bg={bgCard}
                borderRadius="xl"
                borderWidth="1px"
                borderColor={borderColor}
                p={{ base: 5, md: 8 }}
                shadow="md"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
              >
                <VStack align="stretch" spacing={{ base: 6, md: 8 }}>
                  <Text fontSize="lg" fontWeight="semibold" color={headingColor}>
                    Recomendações
                  </Text>
                  <Box as="ul" pl={6} spacing={2}>
                    <Text as="li" mb={2}>
                      Recomendamos prender o produto na base
                    </Text>
                    <Text as="li" mb={2}>
                      Recomendamos considerar a inclusão de peças avulsas para calçar o
                      produto na base
                    </Text>
                  </Box>
                  <Button
                    colorScheme="blue"
                    size="lg"
                    minH="44px"
                    onClick={handleTela5Continue}
                  >
                    Continuar
                  </Button>
                </VStack>
              </MotionBox>
            )}

            {step === STEP_TELA6 && (
              <MotionBox
                key="tela6"
                as="form"
                onSubmit={handleTela6Submit}
                bg={bgCard}
                borderRadius="xl"
                borderWidth="1px"
                borderColor={borderColor}
                p={{ base: 5, md: 8 }}
                shadow="md"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
              >
                <VStack align="stretch" spacing={{ base: 6, md: 8 }}>
                  <Text fontSize="lg" color={headingColor}>
                    A Ribermax vende somente para empresas. Para calcular sua embalagem,
                    palete ou embalagem, informe seu CNPJ e seus dados para contato.
                  </Text>

                  <FormControl isRequired>
                    <FormLabel>CNPJ</FormLabel>
                    <Input
                      value={form.customerCnpj || ""}
                      onChange={( e ) => updateForm( { customerCnpj: e.target.value } )}
                      placeholder="00.000.000/0000-00"
                      size="lg"
                      borderColor={borderColor}
                      minH="44px"
                    />
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel>Nome</FormLabel>
                    <Input
                      value={form.customerName || ""}
                      onChange={( e ) => updateForm( { customerName: e.target.value } )}
                      placeholder="Nome ou razão social"
                      size="lg"
                      borderColor={borderColor}
                      minH="44px"
                    />
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel>E-mail</FormLabel>
                    <Input
                      type="email"
                      value={form.customerEmail || ""}
                      onChange={( e ) => updateForm( { customerEmail: e.target.value } )}
                      placeholder="seu@email.com"
                      size="lg"
                      borderColor={borderColor}
                      minH="44px"
                    />
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel>Telefone</FormLabel>
                    <Input
                      value={form.customerPhone || ""}
                      onChange={( e ) => updateForm( { customerPhone: e.target.value } )}
                      placeholder="(00) 00000-0000"
                      size="lg"
                      borderColor={borderColor}
                      minH="44px"
                    />
                  </FormControl>

                  <Button
                    type="submit"
                    colorScheme="blue"
                    size="lg"
                    minH="44px"
                  >
                    Solicitar cálculo
                  </Button>
                </VStack>
              </MotionBox>
            )}

            {step === STEP_RESULT && (
              <MotionBox
                key="result"
                bg={bgCard}
                borderRadius="xl"
                borderWidth="1px"
                borderColor={borderColor}
                p={{ base: 5, md: 8 }}
                shadow="md"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
              >
                <VStack align="stretch" spacing={4}>
                  <Heading size="md" color={headingColor}>
                    Resultado
                  </Heading>
                  <Text fontSize="sm" color={textColor}>
                    elegibleTemplates
                  </Text>
                  <Box
                    as="pre"
                    p={4}
                    bg={preBg}
                    borderRadius="md"
                    overflow="auto"
                    fontSize="sm"
                    fontFamily="mono"
                  >
                    {JSON.stringify( elegibleTemplates, null, 2 )}
                  </Box>
                </VStack>
              </MotionBox>
            )}
          </AnimatePresence>
        </Flex>
      </Box>
    </>
  );
};

export default CalculadoraEmbalagem;
