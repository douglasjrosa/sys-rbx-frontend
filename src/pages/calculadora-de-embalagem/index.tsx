import {
  Box,
  Button,
  Collapse,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Icon,
  IconButton,
  Image,
  Input,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Radio,
  RadioGroup,
  SimpleGrid,
  Stack,
  Text,
  useColorMode,
  useColorModeValue,
  useToast,
  VStack,
} from "@chakra-ui/react";
import { ArrowBackIcon, MoonIcon, SunIcon } from "@chakra-ui/icons";
import { FaWeightHanging } from "react-icons/fa";
import { AnimatePresence, motion } from "framer-motion";
import { NextPage } from "next";
import Head from "next/head";
import { FormEvent, useCallback, useRef, useState } from "react";
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

const PACK_TYPE_IMAGES: Record<PackType, string> = {
  box: "/img/box.jpg",
  crate: "/img/crate.jpg",
  pallet: "/img/pallet.jpg",
  any: "/img/any.jpg",
};

const WEIGHT_RANGE_OPTIONS: { value: number; label: string }[] = [
  { value: 30, label: "Menos de 30 Kg" },
  { value: 100, label: "Entre 30 e 100 Kg" },
  { value: 500, label: "Entre 100 e 500 Kg" },
  { value: 1000, label: "Entre 500 e 1.000 Kg" },
  { value: 2000, label: "Entre 1.000 e 2.000 Kg" },
  { value: 2500, label: "Acima de 2.000 Kg" },
];

const PRODUCT_TYPE_IMAGES: Record<number, string | null> = {
  1: "/img/prodType-1.jpeg",
  2: "/img/prodType-2.webp",
  3: "/img/prodType-3.jpg",
  4: "/img/prodType-4.webp",
  5: "/img/prodType-5.png",
  6: "/img/prodType-6.jpg",
  7: "/img/prodType-7.jpg",
  8: "/img/prodType-8.jpg",
  9: "/img/prodType-9.jpg",
  10: "/img/prodType-10.jpg",
  11: "/img/prodType-11.webp",
};

const STEP_TELA1 = 1;
const STEP_TELA2 = 2;
const STEP_TELA3 = 3;
const STEP_TELA4 = 4;
const STEP_TELA5 = 5;
const STEP_TELA6 = 6;
const STEP_RESULT = 7;

const initialForm: Partial<PackagingFormData> = {
  prodType: 0,
  weight: 0,
  unit: "mm",
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

  const sectionProdTypeRef = useRef<HTMLDivElement>( null );
  const sectionIsExportRef = useRef<HTMLDivElement>( null );
  const sectionWeightRef = useRef<HTMLDivElement>( null );

  const scrollToSection = useCallback( ( ref: React.RefObject<HTMLDivElement | null> ) => {
    setTimeout( () => {
      ref.current?.scrollIntoView( { behavior: "smooth", block: "start" } );
    }, 280 );
  }, [] );

  const isPallet = form.packType === "pallet";
  const showProdType = !!form.packType;

  const bgPage = useColorModeValue( "gray.50", "gray.900" );
  const bgCard = useColorModeValue( "white", "gray.800" );
  const borderColor = useColorModeValue( "gray.200", "gray.600" );
  const headingColor = useColorModeValue( "gray.800", "white" );
  const textColor = useColorModeValue( "gray.600", "gray.300" );
  const preBg = useColorModeValue( "gray.100", "gray.700" );
  const unitToggleHoverBg = useColorModeValue( "gray.300", "gray.600" );

  const updateForm = useCallback( ( updates: Partial<PackagingFormData> ) => {
    setForm( ( prev ) => ( { ...prev, ...updates } ) );
  }, [] );

  const goToStep = useCallback( ( next: number ) => {
    setStep( next );
  }, [] );

  const handlePackTypeChange = useCallback( ( v: string ) => {
    const packType = v as PackType;
    updateForm( { packType } );
    if ( packType === "pallet" ) {
      updateForm( { prodType: DEFAULT_PRODTYPE_FOR_PALLET } );
      setTela1SubStep( ( s ) => Math.max( s, TELA1_SUB_EXPORT ) );
      scrollToSection( sectionIsExportRef );
    } else {
      setTela1SubStep( ( s ) => Math.max( s, TELA1_SUB_PROD ) );
      scrollToSection( sectionProdTypeRef );
    }
  }, [ updateForm, scrollToSection ] );

  const handleProdTypeChange = useCallback( ( value: number ) => {
    updateForm( { prodType: value } );
    setTela1SubStep( ( s ) => Math.max( s, TELA1_SUB_EXPORT ) );
    scrollToSection( sectionIsExportRef );
  }, [ updateForm, scrollToSection ] );

  const handleIsExportChange = useCallback( ( value: boolean ) => {
    updateForm( { isExport: value } );
    setTela1SubStep( ( s ) => Math.max( s, TELA1_SUB_WEIGHT ) );
    scrollToSection( sectionWeightRef );
  }, [ updateForm, scrollToSection ] );

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
    const unit = ( form.unit || "mm" ) as "mm" | "cm";
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
      const unitVal = ( form.unit || "mm" ) as "mm" | "cm";
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
        bg={bgPage}
        color={textColor}
        py={{ base: 6, md: 10 }}
        px={{ base: 4, md: 6 }}
        display="flex"
        justifyContent="center"
        alignItems="flex-start"
      >
        <Flex
          maxW="960px"
          w="100%"
          direction="column"
          gap={{ base: 6, md: 8 }}
          align="center"
        >
          <Flex
            justify="space-between"
            align="center"
            w="100%"
            gap={4}
          >
            <Button
              as="a"
              href="https://ribermax.com.br"
              variant="ghost"
              size="sm"
              leftIcon={<ArrowBackIcon />}
            >
              Voltar
            </Button>
            <Heading
              size={{ base: "lg", md: "xl" }}
              color={headingColor}
              fontWeight="bold"
              textAlign="center"
              flex="1"
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
                p={{ base: 5, md: 8 }}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
              >
                <VStack align="center" spacing={{ base: 6, md: 8 }} w="100%">
                  <FormControl as="fieldset" isRequired alignItems="center">
                    <FormLabel
                      as="legend"
                      fontSize="lg"
                      fontWeight="semibold"
                      color={headingColor}
                      mb={3}
                    >
                      O que você quer calcular hoje?
                    </FormLabel>
                    <SimpleGrid
                      columns={{ base: 1, md: 2, lg: 4 }}
                      spacing={{ base: 4, md: 5 }}
                      w="100%"
                      justifyItems="center"
                    >
                      {PACK_TYPE_OPTIONS.map( ( opt ) => {
                        const isActive = form.packType === opt.value;
                        const isDimmed = form.packType && !isActive;
                        return (
                          <Box
                            key={opt.value}
                            as="button"
                            type="button"
                            onClick={() => handlePackTypeChange( opt.value )}
                            borderWidth={isActive ? "2px" : "1px"}
                            borderColor={
                              isActive ? "blue.400" : borderColor
                            }
                            borderRadius="lg"
                            p={3}
                            boxShadow="md"
                            w="100%"
                            maxW="260px"
                            minH="220px"
                            bg={useColorModeValue( "white", "gray.700" )}
                            _hover={{ borderColor: "blue.400" }}
                            textAlign="center"
                            opacity={isDimmed ? 0.6 : 1}
                            filter={isDimmed ? "grayscale(100%)" : "none"}
                          >
                            <Image
                              src={PACK_TYPE_IMAGES[ opt.value ]}
                              alt={opt.label}
                              borderRadius="md"
                              objectFit="contain"
                              w="100%"
                              h="140px"
                              mb={2}
                            />
                            <Text
                              fontSize="md"
                              fontWeight={isActive ? "extrabold" : "semibold"}
                            >
                              {opt.label}
                            </Text>
                          </Box>
                        );
                      } )}
                    </SimpleGrid>
                  </FormControl>

                  <Collapse in={showProdType && !isPallet && tela1SubStep >= TELA1_SUB_PROD}>
                    <FormControl as="fieldset" isRequired w="full" ref={sectionProdTypeRef}>
                      <FormLabel
                        as="legend"
                        fontSize="lg"
                        fontWeight="semibold"
                        color={headingColor}
                        mb={3}
                      >
                        Que tipo de produto você precisa embalar?
                      </FormLabel>
                      <Box
                        w="100%"
                        opacity={isPallet ? 0.4 : 1}
                        pointerEvents={isPallet ? "none" : "auto"}
                      >
                        <SimpleGrid
                          columns={{ base: 1, md: 2, lg: 4 }}
                          spacing={{ base: 4, md: 5 }}
                          w="100%"
                          justifyItems="center"
                        >
                          {Object.entries( PRODUCT_TYPE_LABELS ).map(
                            ( [ key, label ] ) => {
                              const id = parseInt( key, 10 );
                              const isActive = form.prodType === id;
                              const imgSrc = PRODUCT_TYPE_IMAGES[ id ];
                              const isDimmed = form.prodType && !isActive;
                              return (
                                <Box
                                  key={id}
                                  as="button"
                                  type="button"
                                  onClick={() => handleProdTypeChange( id )}
                                  borderWidth={isActive ? "2px" : "1px"}
                                  borderColor={
                                    isActive ? "blue.400" : borderColor
                                  }
                                  borderRadius="lg"
                                  p={3}
                                  boxShadow="md"
                                  w="100%"
                                  maxW="260px"
                                  minH="220px"
                                  bg={useColorModeValue(
                                    "white",
                                    "gray.700"
                                  )}
                                  _hover={{ borderColor: "blue.400" }}
                                  textAlign="left"
                                  opacity={isDimmed ? 0.6 : 1}
                                  filter={isDimmed ? "grayscale(100%)" : "none"}
                                >
                                  {imgSrc && (
                                    <Image
                                      src={imgSrc}
                                      alt={label}
                                      borderRadius="md"
                                      objectFit="cover"
                                      w="100%"
                                      h="140px"
                                      mb={2}
                                    />
                                  )}
                                  <Text
                                    fontSize="sm"
                                    fontWeight={
                                      isActive ? "extrabold" : "semibold"
                                    }
                                  >
                                    {label}
                                  </Text>
                                </Box>
                              );
                            }
                          )}
                        </SimpleGrid>
                      </Box>
                    </FormControl>
                  </Collapse>

                  <Collapse in={tela1SubStep >= TELA1_SUB_EXPORT}>
                    <FormControl as="fieldset" isRequired w="full" ref={sectionIsExportRef}>
                      <FormLabel
                        as="legend"
                        fontSize="lg"
                        fontWeight="semibold"
                        color={headingColor}
                        mb={3}
                      >
                        Para onde vai a embalagem? É exportação?
                      </FormLabel>
                      <SimpleGrid
                        columns={{ base: 1, md: 2 }}
                        spacing={{ base: 4, md: 5 }}
                        w="100%"
                        justifyItems="center"
                      >
                        {[
                          { value: true, label: "Sim, é exportação", img: "/img/isExport.avif" },
                          { value: false, label: "Não, apenas Brasil", img: "/img/noExport.jpg" },
                        ].map( ( option ) => {
                          const isActive = form.isExport === option.value;
                          const hasSelection = form.isExport !== undefined;
                          const isDimmed = hasSelection && !isActive;
                          return (
                            <Box
                              key={String( option.value )}
                              as="button"
                              type="button"
                              onClick={() => handleIsExportChange( option.value )}
                              borderWidth={isActive ? "2px" : "1px"}
                              borderColor={isActive ? "blue.400" : borderColor}
                              borderRadius="lg"
                              p={3}
                              boxShadow="md"
                              w="100%"
                              maxW="260px"
                              minH="220px"
                              bg={useColorModeValue( "white", "gray.700" )}
                              _hover={{ borderColor: "blue.400" }}
                              textAlign="center"
                              opacity={isDimmed ? 0.6 : 1}
                              filter={isDimmed ? "grayscale(100%)" : "none"}
                            >
                              <Image
                                src={option.img}
                                alt={option.label}
                                borderRadius="md"
                                objectFit="cover"
                                w="100%"
                                h="140px"
                                mb={2}
                              />
                              <Text
                                fontSize="md"
                                fontWeight={isActive ? "extrabold" : "semibold"}
                              >
                                {option.label}
                              </Text>
                            </Box>
                          );
                        } )}
                      </SimpleGrid>
                    </FormControl>
                  </Collapse>

                  <Collapse in={tela1SubStep >= TELA1_SUB_WEIGHT}>
                    <FormControl as="fieldset" isRequired w="full" ref={sectionWeightRef}>
                      <FormLabel
                        as="legend"
                        fontSize="lg"
                        fontWeight="semibold"
                        color={headingColor}
                        mb={3}
                      >
                        Qual é o peso aproximado do que você precisa embalar?
                      </FormLabel>
                      <SimpleGrid
                        columns={{ base: 1, sm: 2, md: 3 }}
                        spacing={{ base: 3, md: 4 }}
                        w="100%"
                      >
                        {WEIGHT_RANGE_OPTIONS.map( ( opt ) => {
                          const isActive = form.weight === opt.value;
                          const hasSelection = form.weight && form.weight > 0;
                          const isDimmed = hasSelection && !isActive;
                          return (
                            <Box
                              key={opt.value}
                              as="button"
                              type="button"
                              onClick={() => updateForm( { weight: opt.value } )}
                              borderWidth={isActive ? "2px" : "1px"}
                              borderColor={
                                isActive ? "blue.400" : borderColor
                              }
                              borderRadius="lg"
                              p={4}
                              boxShadow="sm"
                              w="100%"
                              bg={bgCard}
                              _hover={{ borderColor: "blue.400" }}
                              textAlign="left"
                              opacity={isDimmed ? 0.6 : 1}
                              filter={isDimmed ? "grayscale(100%)" : "none"}
                              display="flex"
                              alignItems="center"
                              gap={3}
                            >
                              <Icon
                                as={FaWeightHanging}
                                boxSize={6}
                                color={isActive ? "blue.500" : "gray.500"}
                              />
                              <Text
                                fontSize="sm"
                                fontWeight={isActive ? "extrabold" : "semibold"}
                              >
                                {opt.label}
                              </Text>
                            </Box>
                          );
                        } )}
                      </SimpleGrid>
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
                <VStack align="center" spacing={{ base: 6, md: 8 }} w="100%">
                  <Text fontSize="lg" fontWeight="semibold" color={headingColor} textAlign="center">
                    {dimensionsIntro()}
                  </Text>

                  <SimpleGrid
                    columns={{ base: 1, md: 2, lg: 4 }}
                    spacing={{ base: 4, md: 5 }}
                    w="100%"
                  >
                    <FormControl isRequired>
                      <FormLabel textAlign="center" mr={0}>Unidade de medida</FormLabel>
                      <Flex
                        minH="44px"
                        w="full"
                        maxW="120px"
                        mx="auto"
                        borderRadius="lg"
                        overflow="hidden"
                        borderWidth="1px"
                        borderColor={borderColor}
                        bg={preBg}
                      >
                        <Box
                          as="button"
                          type="button"
                          flex={1}
                          py={2}
                          textAlign="center"
                          fontSize="md"
                          fontWeight="semibold"
                          bg={form.unit === "mm" ? "blue.500" : "transparent"}
                          color={form.unit === "mm" ? "white" : textColor}
                          onClick={() => updateForm( { unit: "mm" } )}
                          _hover={{
                            bg: form.unit === "mm" ? "blue.500" : unitToggleHoverBg,
                            color: "white",
                          }}
                        >
                          mm
                        </Box>
                        <Box
                          as="button"
                          type="button"
                          flex={1}
                          py={2}
                          textAlign="center"
                          fontSize="md"
                          fontWeight="semibold"
                          bg={form.unit === "cm" ? "blue.500" : "transparent"}
                          color={form.unit === "cm" ? "white" : textColor}
                          onClick={() => updateForm( { unit: "cm" } )}
                          _hover={{
                            bg: form.unit === "cm" ? "blue.500" : unitToggleHoverBg,
                            color: "white",
                          }}
                        >
                          cm
                        </Box>
                      </Flex>
                    </FormControl>

                    <FormControl isRequired>
                      <FormLabel textAlign="center" mr={0}>Comprimento</FormLabel>
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
                      <FormLabel textAlign="center" mr={0}>Largura</FormLabel>
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
                        <FormLabel textAlign="center" mr={0}>Altura</FormLabel>
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
                  </SimpleGrid>

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
                <VStack align="center" spacing={{ base: 6, md: 8 }} w="100%">
                  <Text fontSize="lg" fontWeight="semibold" color={headingColor} textAlign="center">
                    Como vai ficar o conteúdo da embalagem?
                  </Text>
                  <RadioGroup>
                    <Stack direction="column" spacing={4}>
                      <Box
                        as="label"
                        p={4}
                        borderWidth={form.isUnitizedContent === true ? "2px" : "1px"}
                        borderColor={
                          form.isUnitizedContent === true ? "blue.400" : borderColor
                        }
                        borderRadius="lg"
                        cursor="pointer"
                        _hover={{ borderColor: "blue.400" }}
                        onClick={() => handleTela3Choice( true )}
                        minH="44px"
                        display="flex"
                        alignItems="center"
                        opacity={
                          form.isUnitizedContent !== undefined &&
                          form.isUnitizedContent !== true
                            ? 0.6
                            : 1
                        }
                        filter={
                          form.isUnitizedContent !== undefined &&
                          form.isUnitizedContent !== true
                            ? "grayscale(100%)"
                            : "none"
                        }
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
                        borderWidth={form.isUnitizedContent === false ? "2px" : "1px"}
                        borderColor={
                          form.isUnitizedContent === false ? "blue.400" : borderColor
                        }
                        borderRadius="lg"
                        cursor="pointer"
                        _hover={{ borderColor: "blue.400" }}
                        onClick={() => handleTela3Choice( false )}
                        minH="44px"
                        display="flex"
                        alignItems="center"
                        opacity={
                          form.isUnitizedContent !== undefined &&
                          form.isUnitizedContent !== false
                            ? 0.6
                            : 1
                        }
                        filter={
                          form.isUnitizedContent !== undefined &&
                          form.isUnitizedContent !== false
                            ? "grayscale(100%)"
                            : "none"
                        }
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
                <VStack align="center" spacing={{ base: 6, md: 8 }} w="100%">
                  <Text fontSize="lg" fontWeight="semibold" color={headingColor} textAlign="center">
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
                      opacity={
                        form.isDistributedWeight !== undefined &&
                        form.isDistributedWeight !== true
                          ? 0.6
                          : 1
                      }
                      filter={
                        form.isDistributedWeight !== undefined &&
                        form.isDistributedWeight !== true
                          ? "grayscale(100%)"
                          : "none"
                      }
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
                      opacity={
                        form.isDistributedWeight !== undefined &&
                        form.isDistributedWeight !== false
                          ? 0.6
                          : 1
                      }
                      filter={
                        form.isDistributedWeight !== undefined &&
                        form.isDistributedWeight !== false
                          ? "grayscale(100%)"
                          : "none"
                      }
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
                <VStack align="center" spacing={{ base: 6, md: 8 }} w="100%">
                  <Text fontSize="lg" fontWeight="semibold" color={headingColor} textAlign="center">
                    Recomendações
                  </Text>
                  <Box as="ul" pl={6}>
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
                <VStack align="center" spacing={{ base: 6, md: 8 }} w="100%">
                  <Text fontSize="lg" color={headingColor} textAlign="center">
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
                <VStack align="center" spacing={4} w="100%">
                  <Heading size="md" color={headingColor} textAlign="center">
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
