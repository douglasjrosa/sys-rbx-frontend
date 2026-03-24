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
  Progress,
  SimpleGrid,
  Stack,
  Text,
  Tooltip,
  useColorMode,
  useColorModeValue,
  useToast,
  VStack,
} from "@chakra-ui/react";
import { ArrowBackIcon, EditIcon, MoonIcon, SunIcon } from "@chakra-ui/icons";
import { FaWeightHanging } from "react-icons/fa";
import { BsArrowsAngleExpand } from "react-icons/bs";
import { AnimatePresence, motion } from "framer-motion";
import { NextPage } from "next";
import Head from "next/head";
import { FormEvent, Fragment, useCallback, useEffect, useRef, useState } from "react";
import {
  ASK_CONTENT_PROD_TYPES,
  FRACTIONED_PROD_TYPES,
  getElegibleTemplates,
  PackagingFormData,
  PackType,
  MeasuresOf,
  PRODUCT_TYPE_LABELS,
  toMeters,
  validateCnpj,
  validateEmail,
  WEIGHT_THRESHOLD_KG,
  LENGTH_THRESHOLD_M,
  WIDTH_THRESHOLD_M,
  BoxTemplate,
} from "@/utils/packagingCalculator";
import boxTemplates from "@/data/box-templates.json";

export interface ElegibleTemplateResult {
  name: string;
  priceResult?: {
    info?: { vFinal?: number; titulo?: string; preco?: number };
    error?: string;
  };
}

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

const CLEARANCE_OPTIONS_MM: {
  value: number;
  label: string;
  suffix: string;
  iconSize: number;
}[] = [
  { value: 10, label: "Mínima", suffix: "(10mm)", iconSize: 3 },
  { value: 30, label: "Média", suffix: "(30mm)", iconSize: 5 },
  { value: 50, label: "Grande", suffix: "(50mm)", iconSize: 7 },
  { value: 100, label: "Extra grande", suffix: "(100mm)", iconSize: 9 },
];

const CLEARANCE_OPTIONS_CM: {
  value: number;
  label: string;
  suffix: string;
  iconSize: number;
}[] = [
  { value: 1, label: "Folga Mínima", suffix: "(1cm)", iconSize: 3 },
  { value: 3, label: "Folga Média", suffix: "(3cm)", iconSize: 5 },
  { value: 5, label: "Folga Grande", suffix: "(5cm)", iconSize: 7 },
  { value: 10, label: "Folga Extra Grande", suffix: "(10cm)", iconSize: 9 },
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
const STEP_TELA7 = 7;
const STEP_RESULT = 8;

const PROGRESS_STEPS = [
  { id: 1, label: "Sobre a embalagem", telas: [ 1 ] },
  { id: 2, label: "E-mail", telas: [ 2 ] },
  { id: 3, label: "Medidas e detalhes", telas: [ 3, 4, 5, 6 ] },
  { id: 4, label: "CNPJ", telas: [ 7 ] },
  { id: 5, label: "Preço", telas: [ 8 ] },
  { id: 6, label: "Política de descontos", telas: [ 9 ], comingSoon: true },
  { id: 7, label: "Comprar", telas: [ 10 ], comingSoon: true },
] as const;

const initialForm: Partial<PackagingFormData> = {
  prodType: 0,
  weight: 0,
  measuresOf: undefined,
  unit: "mm",
  length: undefined,
  width: undefined,
  height: undefined,
  clearance: undefined,
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

const CUSTOMER_STORAGE_KEY = "calculadora-embalagem-customer";

const CalculadoraEmbalagem: NextPage = () => {
  const { colorMode, toggleColorMode } = useColorMode();
  const toast = useToast();
  const [ step, setStep ] = useState( STEP_TELA1 );
  const [ tela1SubStep, setTela1SubStep ] = useState( TELA1_SUB_PACK );
  const [ form, setForm ] = useState<Partial<PackagingFormData>>( initialForm );
  const [ elegibleTemplates, setElegibleTemplates ] = useState<
    ElegibleTemplateResult[]
  >( [] );
  const [ isCalculatingPrices, setIsCalculatingPrices ] = useState( false );
  const [ recommendationsAcknowledged, setRecommendationsAcknowledged ] = useState( false );
  const sectionPackTypeRef = useRef<HTMLDivElement>( null );
  const sectionProdTypeRef = useRef<HTMLDivElement>( null );
  const sectionIsExportRef = useRef<HTMLDivElement>( null );
  const sectionWeightRef = useRef<HTMLDivElement>( null );
  const sectionMeasuresRef = useRef<HTMLDivElement>( null );
  const sectionClearanceRef = useRef<HTMLDivElement>( null );
  const sectionMeasuresOfRef = useRef<HTMLDivElement>( null );
  const sectionTela2Ref = useRef<HTMLDivElement>( null );
  const sectionTela3Ref = useRef<HTMLDivElement>( null );
  const sectionTela2ContinuarRef = useRef<HTMLDivElement>( null );
  const sectionTela1ContinuarRef = useRef<HTMLDivElement>( null );
  const sectionTela4Ref = useRef<HTMLDivElement>( null );
  const sectionTela5Ref = useRef<HTMLDivElement>( null );
  const sectionTela6Ref = useRef<HTMLDivElement>( null );
  const sectionTela7Ref = useRef<HTMLDivElement>( null );

  const scrollToSection = useCallback( ( ref: React.RefObject<HTMLDivElement | null> ) => {
    setTimeout( () => {
      ref.current?.scrollIntoView( { behavior: "smooth", block: "start" } );
    }, 280 );
  }, [] );

  const handleEditSummaryItem = useCallback(
    ( target: {
      step: number;
      tela1SubStep?: number;
      ref: React.RefObject<HTMLDivElement | null>;
    } ) => {
      setStep( target.step );
      if ( target.tela1SubStep != null ) {
        setTela1SubStep( target.tela1SubStep );
      }
      setTimeout( () => scrollToSection( target.ref ), 400 );
    },
    [ scrollToSection ]
  );

  const isPallet = form.packType === "pallet";
  const showProdType = !!form.packType;
  const showClearance =
    form.measuresOf === "product" &&
    !isPallet &&
    !!form.length &&
    !!form.width &&
    !!form.height;

  const showTela2Continuar =
    !!form.length &&
    !!form.width &&
    ( isPallet || !!form.height ) &&
    ( form.measuresOf !== "product" || !!form.clearance );

  const showTela1Continuar =
    tela1SubStep >= TELA1_SUB_WEIGHT &&
    !!form.packType &&
    ( isPallet || ( form.prodType && form.prodType > 0 ) ) &&
    form.isExport !== undefined &&
    !!form.weight;

  const currentProgressStep = step <= 1 ? 1
    : step <= 2 ? 2
    : step <= 6 ? 3
    : step <= 7 ? 4
    : 5;

  const bgPage = useColorModeValue( "gray.50", "gray.900" );
  const bgCard = useColorModeValue( "white", "gray.800" );
  const borderColor = useColorModeValue( "gray.200", "gray.600" );
  const headingColor = useColorModeValue( "gray.800", "white" );
  const textColor = useColorModeValue( "gray.600", "gray.300" );
  const preBg = useColorModeValue( "gray.100", "gray.700" );
  const unitToggleHoverBg = useColorModeValue( "gray.300", "gray.600" );
  const clearanceBadgeBgActive = useColorModeValue( "blue.50", "blue.900" );
  const placeholderColor = useColorModeValue( "gray.500", "gray.400" );

  useEffect( () => {
    try {
      const stored = localStorage.getItem( CUSTOMER_STORAGE_KEY );
      if ( stored ) {
        const parsed = JSON.parse( stored ) as { customerName?: string; customerEmail?: string };
        if ( parsed.customerName && parsed.customerEmail ) {
          setForm( ( prev ) => ( {
            ...prev,
            customerName: parsed.customerName,
            customerEmail: parsed.customerEmail,
          } ) );
        }
      }
    } catch {
      // Ignore parse errors
    }
  }, [] );

  useEffect( () => {
    if ( showClearance ) {
      setTimeout( () => {
        sectionClearanceRef.current?.scrollIntoView( {
          behavior: "smooth",
          block: "start",
        } );
      }, 320 );
    }
  }, [ showClearance ] );

  useEffect( () => {
    if ( step === STEP_TELA4 && showTela2Continuar ) {
      setTimeout( () => {
        sectionTela2ContinuarRef.current?.scrollIntoView( {
          behavior: "smooth",
          block: "start",
        } );
      }, 320 );
    }
  }, [ step, showTela2Continuar ] );

  useEffect( () => {
    if (
      step === STEP_TELA4 &&
      ( form.isUnitizedContent === false || isPallet )
    ) {
      updateForm( { measuresOf: "internal" } );
    }
  }, [ step, form.isUnitizedContent, isPallet ] );

  useEffect( () => {
    if ( step === STEP_TELA1 && showTela1Continuar ) {
      setTimeout( () => {
        sectionTela1ContinuarRef.current?.scrollIntoView( {
          behavior: "smooth",
          block: "start",
        } );
      }, 320 );
    }
  }, [ step, showTela1Continuar ] );

  useEffect( () => {
    if ( step === STEP_TELA6 ) setRecommendationsAcknowledged( false );
  }, [ step ] );

  const updateForm = useCallback( ( updates: Partial<PackagingFormData> ) => {
    setForm( ( prev ) => ( { ...prev, ...updates } ) );
  }, [] );

  const goToStep = useCallback( ( next: number ) => {
    setStep( next );
  }, [] );

  const goBack = useCallback( () => {
    setStep( ( s ) => {
      if (
        s === STEP_TELA4 &&
        !ASK_CONTENT_PROD_TYPES.includes( form.prodType ?? 0 )
      ) {
        return STEP_TELA2;
      }
      return Math.max( STEP_TELA1, s - 1 );
    } );
  }, [ form.prodType ] );

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

  const handleMeasuresOfChange = useCallback( ( value: MeasuresOf ) => {
    updateForm( { measuresOf: value } );
    scrollToSection( sectionMeasuresRef );
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
    if ( isPallet ) updateForm( { measuresOf: "internal" } );
    goToStep( STEP_TELA2 );
  };

  const handleTela2NameEmailSubmit = ( e: FormEvent ) => {
    e.preventDefault();
    const name = ( form.customerName || "" ).trim();
    const email = ( form.customerEmail || "" ).trim();
    if ( !name || !email ) {
      toast( {
        title: "Preencha nome e e-mail",
        status: "warning",
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
    try {
      localStorage.setItem(
        CUSTOMER_STORAGE_KEY,
        JSON.stringify( { customerName: name, customerEmail: email } )
      );
    } catch {
      // Ignore
    }
    updateForm( { customerName: name, customerEmail: email } );
    const prodType = form.prodType ?? 0;
    if ( FRACTIONED_PROD_TYPES.includes( prodType ) ) {
      updateForm( { isUnitizedContent: false, measuresOf: "internal" } );
      goToStep( STEP_TELA4 );
    } else if ( ASK_CONTENT_PROD_TYPES.includes( prodType ) ) {
      goToStep( STEP_TELA3 );
    } else {
      updateForm( { isUnitizedContent: true } );
      goToStep( STEP_TELA4 );
    }
  };

  const advanceFromTela5Check = useCallback(
    ( weightVal: number, lengthVal: number, widthVal: number, unitVal: "mm" | "cm" ) => {
      const lengthM = toMeters( lengthVal, unitVal );
      const widthM = toMeters( widthVal, unitVal );
      const skipCondition =
        weightVal < WEIGHT_THRESHOLD_KG ||
        ( lengthM < LENGTH_THRESHOLD_M && widthM < WIDTH_THRESHOLD_M );
      if ( skipCondition ) {
        updateForm( { isDistributedWeight: null } );
        goToStep( STEP_TELA7 );
      } else {
        goToStep( STEP_TELA5 );
      }
    },
    [ updateForm, goToStep ]
  );

  const handleTela3Continue = ( e: FormEvent ) => {
    e.preventDefault();
    const measuresOfVal = isPallet ? "internal" : form.measuresOf;
    if ( !measuresOfVal ) {
      toast( {
        title: "Selecione se as medidas são internas ou do produto",
        status: "warning",
        duration: 3000,
      } );
      return;
    }
    const unit = ( form.unit || "mm" ) as "mm" | "cm";
    const length = Number( form.length ) || 0;
    const width = Number( form.width ) || 0;
    const height = form.packType === "pallet" ? 0 : ( Number( form.height ) || 0 );
    if ( measuresOfVal === "product" ) {
      const clearanceVal = Number( form.clearance ) ?? 0;
      if ( !clearanceVal ) {
        toast( {
          title: "Preencha o campo Folga",
          status: "warning",
          duration: 3000,
        } );
        return;
      }
    }
    if ( !length || !width || ( form.packType !== "pallet" && !height ) ) {
      toast( {
        title: "Preencha todas as medidas",
        status: "warning",
        duration: 3000,
      } );
      return;
    }
    updateForm( { length, width, height: form.packType === "pallet" ? undefined : height } );
    const weightVal = Number( form.weight ) || 0;
    if ( form.isUnitizedContent === true ) {
      advanceFromTela5Check( weightVal, length, width, unit );
    } else {
      goToStep( STEP_TELA7 );
    }
  };

  const handleTela3ContentChoice = ( unitized: boolean ) => {
    updateForm( { isUnitizedContent: unitized } );
    if ( unitized && !isPallet ) {
      updateForm( { measuresOf: undefined } );
    } else {
      updateForm( { measuresOf: "internal" } );
    }
    goToStep( STEP_TELA4 );
  };

  const handleTela5Choice = ( distributed: boolean ) => {
    updateForm( { isDistributedWeight: distributed } );
  };

  const handleTela5Continue = () => {
    if ( form.isDistributedWeight === true ) {
      goToStep( STEP_TELA7 );
    } else {
      goToStep( STEP_TELA6 );
    }
  };

  const handleTela6Continue = () => {
    goToStep( STEP_TELA7 );
  };

  const handleTela7Submit = async ( e: FormEvent ) => {
    e.preventDefault();
    const cnpj = ( form.customerCnpj || "" ).trim();
    const email = ( form.customerEmail || "" ).trim();
    if ( !cnpj || !form.customerName || !email ) {
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
      measuresOf: form.measuresOf!,
      unit: form.unit!,
      length: Number( form.length ) || 0,
      width: Number( form.width ) || 0,
      height: form.packType === "pallet" ? undefined : ( Number( form.height ) || 0 ),
      clearance: form.measuresOf === "product" ? Number( form.clearance ) || 0 : undefined,
      isUnitizedContent: form.isUnitizedContent,
      isDistributedWeight: form.isDistributedWeight ?? null,
      customerCnpj: cnpj,
      customerName: form.customerName || "",
      customerEmail: email,
      customerPhone: "",
    };
    const templateNames = getElegibleTemplates(
      fullForm,
      boxTemplates as BoxTemplate[]
    );
    const initial: ElegibleTemplateResult[] = templateNames.map( ( n ) => ( {
      name: n,
    } ) );
    setElegibleTemplates( initial );
    goToStep( STEP_RESULT );

    if ( templateNames.length === 0 ) return;

    setIsCalculatingPrices( true );
    const unit = fullForm.unit || "mm";
    const toCm = ( v: number ) => ( unit === "mm" ? v / 10 : v );
    const compCm = toCm( fullForm.length );
    const largCm = toCm( fullForm.width );
    const altCm =
      fullForm.height !== undefined ? toCm( fullForm.height ) : 0;
    const cnpjDigits = cnpj.replace( /\D/g, "" );

    const fetchPrice = async ( modelo: string ) => {
      try {
        const params = new URLSearchParams( {
          calcular: "1",
          modelo,
          comprimento: String( compCm ),
          largura: String( largCm ),
          empresa: cnpjDigits,
          pesoProd: String( fullForm.weight ),
        } );
        if (
          fullForm.packType !== "pallet" &&
          altCm > 0
        )
          params.set( "altura", String( altCm ) );
        const res = await fetch(
          `/api/calculadora/calcular?${ params.toString() }`
        );
        const data = await res.json();
        if ( data.error ) {
          return { name: modelo, priceResult: { error: data.error } };
        }
        const info = data.info ?? data;
        return {
          name: modelo,
          priceResult: { info },
        };
      } catch ( err ) {
        return {
          name: modelo,
          priceResult: {
            error: ( err as Error )?.message || "Erro ao calcular",
          },
        };
      }
    };

    const results = await Promise.all(
      templateNames.map( ( t ) => fetchPrice( t ) )
    );
    setElegibleTemplates( results );
    setIsCalculatingPrices( false );
  };

  const dimensionsIntro = () => {
    const pt = form.packType;
    if ( pt === "pallet" ) return "Informe as medidas que você precisa que o palete tenha.";
    if ( pt === "box" ) return "Informe as medidas finais que você precisa que tenha dentro da Caixa.";
    if ( pt === "crate" ) return "Informe as medidas finais que você precisa que tenha dentro do Engradado.";
    return "Informe as medidas que você precisa que tenha dentro da embalagem ou palete que vamos calcular.";
  };

  return (
    <Fragment>
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
          <Box w="100%">
            <Flex
              display={{ base: "flex", md: "none" }}
              direction="column"
              gap={4}
            >
              <Flex justify="space-between" align="center" w="100%">
                <Button
                  as="a"
                  href="https://ribermax.com.br"
                  variant="ghost"
                  size="sm"
                  leftIcon={<ArrowBackIcon />}
                >
                  Voltar para o site
                </Button>
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
              <Heading
                size="lg"
                color={headingColor}
                fontWeight="bold"
                textAlign="center"
                w="100%"
              >
                Calculadora de Embalagem
              </Heading>
            </Flex>
            <Flex
              display={{ base: "none", md: "flex" }}
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
                Voltar para o site
              </Button>
              <Heading
                size="xl"
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
          </Box>

          <AnimatePresence mode="wait">
            {step === STEP_TELA1 && (
              <MotionBox
                key="tela1"
                as="form"
                onSubmit={handleTela1Continue}
                w="100%"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
              >
                <VStack align="center" spacing={6} w="100%">
                  <MotionBox
                    bg={bgCard}
                    borderRadius="xl"
                    borderWidth="1px"
                    borderColor={borderColor}
                    p={{ base: 5, md: 8 }}
                    shadow="md"
                    w="100%"
                  >
                    <VStack align="center" spacing={{ base: 6, md: 8 }} w="100%">
                      <FormControl as="fieldset" isRequired alignItems="center" ref={sectionPackTypeRef}>
                        <FormLabel
                          as="legend"
                          fontSize="lg"
                          fontWeight="semibold"
                          color={headingColor}
                          mb={3}
                          textAlign="center"
                          w="100%"
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
                            textAlign="center"
                            w="100%"
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
                            textAlign="center"
                            w="100%"
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
                                  bg={isActive ? clearanceBadgeBgActive : bgCard}
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
                    </VStack>
                  </MotionBox>
                  <Flex
                    ref={sectionTela1ContinuarRef}
                    w="100%"
                    justify="flex-end"
                    align="center"
                    gap={4}
                    mt={4}
                  >
                    <Button
                      type="submit"
                      colorScheme="blue"
                      size="lg"
                      minW="160px"
                      minH="44px"
                      isDisabled={!showTela1Continuar}
                    >
                      Continuar
                    </Button>
                  </Flex>
                </VStack>
              </MotionBox>
            )}

            {step === STEP_TELA2 && (
              <MotionBox
                key="tela2"
                as="form"
                onSubmit={handleTela2NameEmailSubmit}
                w="100%"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
              >
                <MotionBox
                  ref={sectionTela2Ref}
                  bg={bgCard}
                  borderRadius="xl"
                  borderWidth="1px"
                  borderColor={borderColor}
                  p={{ base: 5, md: 6 }}
                  shadow="md"
                  w="100%"
                >
                  <VStack align="stretch" spacing={4} w="100%">
                    <Text
                      fontSize="lg"
                      fontWeight="semibold"
                      color={headingColor}
                      textAlign="center"
                    >
                      Para receber esta cotação, informe seu nome e e-mail.
                    </Text>
                    <FormControl isRequired>
                      <FormLabel color={headingColor}>Nome</FormLabel>
                      <Input
                        value={form.customerName || ""}
                        onChange={( e ) =>
                          updateForm( { customerName: e.target.value } )
                        }
                        placeholder="Seu nome"
                        size="lg"
                        borderColor={borderColor}
                        minH="44px"
                      />
                    </FormControl>
                    <FormControl isRequired>
                      <FormLabel color={headingColor}>E-mail</FormLabel>
                      <Input
                        type="email"
                        value={form.customerEmail || ""}
                        onChange={( e ) =>
                          updateForm( { customerEmail: e.target.value } )
                        }
                        placeholder="seu@email.com"
                        size="lg"
                        borderColor={borderColor}
                        minH="44px"
                      />
                    </FormControl>
                  </VStack>
                </MotionBox>
                <Flex
                  w="100%"
                  justify="space-between"
                  align="center"
                  gap={4}
                  mt={4}
                >
                  <Button
                    type="button"
                    variant="ghost"
                    size="lg"
                    leftIcon={<ArrowBackIcon />}
                    onClick={goBack}
                  >
                    Voltar
                  </Button>
                  <Button
                    type="submit"
                    colorScheme="blue"
                    size="lg"
                    minH="44px"
                    isDisabled={
                      !( form.customerName || "" ).trim() ||
                      !( form.customerEmail || "" ).trim()
                    }
                  >
                    Continuar
                  </Button>
                </Flex>
              </MotionBox>
            )}

            {step === STEP_TELA3 && (
              <MotionBox
                key="tela3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
                w="100%"
              >
                <MotionBox
                  ref={sectionTela3Ref}
                  bg={bgCard}
                  borderRadius="xl"
                  borderWidth="1px"
                  borderColor={borderColor}
                  p={{ base: 5, md: 6 }}
                  shadow="md"
                  w="100%"
                >
                  <Text
                    fontSize="lg"
                    fontWeight="semibold"
                    color={headingColor}
                    textAlign="center"
                    mb={4}
                  >
                    Como vai ficar o conteúdo da embalagem?
                  </Text>
                  <SimpleGrid
                    columns={{ base: 1, md: 2 }}
                    spacing={{ base: 4, md: 6 }}
                    w="100%"
                    justifyItems="center"
                  >
                    {(
                      [
                        {
                          value: true,
                          label: "Produto único na embalagem",
                          img: "/img/unitized.jpg",
                        },
                        {
                          value: false,
                          label: "Vários produtos soltos",
                          img: "/img/not-unitized.jpg",
                        },
                      ] as const
                    ).map( ( opt ) => {
                      const isActive = form.isUnitizedContent === opt.value;
                      const hasSelection = form.isUnitizedContent !== undefined;
                      const isDimmed = hasSelection && !isActive;
                      return (
                        <Box
                          key={String( opt.value )}
                          as="button"
                          type="button"
                          onClick={() =>
                            updateForm( { isUnitizedContent: opt.value } )
                          }
                          borderRadius="xl"
                          borderWidth={isActive ? "2px" : "1px"}
                          borderColor={isActive ? "blue.400" : borderColor}
                          p="15px"
                          w="fit-content"
                          bg={bgCard}
                          _hover={{ borderColor: "blue.400" }}
                          textAlign="center"
                          opacity={isDimmed ? 0.6 : 1}
                          filter={isDimmed ? "grayscale(100%)" : "none"}
                        >
                          <Box overflow="hidden" borderRadius="lg" w="fit-content">
                            <Image
                              src={opt.img}
                              alt={opt.label}
                              w="200px"
                              h="200px"
                              objectFit="contain"
                            />
                          </Box>
                          <Text
                            fontSize="sm"
                            fontWeight="semibold"
                            p={2}
                          >
                            {opt.label}
                          </Text>
                        </Box>
                      );
                    } )}
                  </SimpleGrid>
                </MotionBox>
                <Flex
                  w="100%"
                  justify="space-between"
                  align="center"
                  gap={4}
                  mt={4}
                >
                  <Button
                    variant="ghost"
                    size="lg"
                    leftIcon={<ArrowBackIcon />}
                    onClick={goBack}
                  >
                    Voltar
                  </Button>
                  <Button
                    colorScheme="blue"
                    size="lg"
                    minH="44px"
                    isDisabled={form.isUnitizedContent === undefined}
                    onClick={() =>
                      form.isUnitizedContent !== undefined &&
                      handleTela3ContentChoice( form.isUnitizedContent )
                    }
                  >
                    Continuar
                  </Button>
                </Flex>
              </MotionBox>
            )}

            {step === STEP_TELA4 && (
              <MotionBox
                key="tela4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
                w="100%"
              >
                {form.isUnitizedContent === true && !isPallet && (
                  <MotionBox
                    key="tela3-measuresOf"
                    ref={sectionMeasuresOfRef}
                    bg={bgCard}
                    borderRadius="xl"
                    borderWidth="1px"
                    borderColor={borderColor}
                    p={{ base: 5, md: 6 }}
                    shadow="md"
                    w="100%"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.25 }}
                  >
                    <Text
                      fontSize="lg"
                      fontWeight="semibold"
                      color={headingColor}
                      textAlign="center"
                      mb={4}
                    >
                      Quais medidas você tem?
                    </Text>
                    <SimpleGrid
                      columns={{ base: 1, md: 2 }}
                      spacing={{ base: 4, md: 6 }}
                      w="100%"
                      justifyItems="center"
                    >
                      {(
                        [
                          {
                            value: "internal" as MeasuresOf,
                            label: "Medidas internas da caixa",
                            img: "/img/internal-measures.jpg",
                          },
                          {
                            value: "product" as MeasuresOf,
                            label: "Medidas do produto",
                            img: "/img/product-measures.jpg",
                          },
                        ] as const
                      ).map( ( opt ) => {
                        const isActive = form.measuresOf === opt.value;
                        const hasSelection = !!form.measuresOf;
                        const isDimmed = hasSelection && !isActive;
                        return (
                          <Box
                            key={opt.value}
                            as="button"
                            type="button"
                            onClick={() => handleMeasuresOfChange( opt.value )}
                            borderRadius="xl"
                            borderWidth={isActive ? "2px" : "1px"}
                            borderColor={isActive ? "blue.400" : borderColor}
                            p="15px"
                            w="fit-content"
                            bg={bgCard}
                            _hover={{ borderColor: "blue.400" }}
                            textAlign="center"
                            opacity={isDimmed ? 0.6 : 1}
                            filter={isDimmed ? "grayscale(100%)" : "none"}
                          >
                            <Box overflow="hidden" borderRadius="lg" w="fit-content">
                              <Image
                                src={opt.img}
                                alt={opt.label}
                                w="200px"
                                h="200px"
                                objectFit="contain"
                              />
                            </Box>
                            <Text
                              fontSize="sm"
                              fontWeight="semibold"
                              p={2}
                            >
                              {opt.label}
                            </Text>
                          </Box>
                        );
                      } )}
                    </SimpleGrid>
                  </MotionBox>
                )}

                {form.isUnitizedContent === false && !isPallet && (
                  <MotionBox
                    key="tela3-internal-only"
                    bg={bgCard}
                    borderRadius="xl"
                    borderWidth="1px"
                    borderColor={borderColor}
                    p={{ base: 5, md: 6 }}
                    shadow="md"
                    w="100%"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.25 }}
                  >
                    <Text
                      fontSize="lg"
                      fontWeight="semibold"
                      color={headingColor}
                      textAlign="center"
                      mb={4}
                    >
                      Informe as medidas internas da embalagem
                    </Text>
                    <Flex
                      direction={{ base: "column", md: "row" }}
                      align={{ base: "center", md: "flex-start" }}
                      gap={{ base: 4, md: 6 }}
                      w="100%"
                    >
                      <Box overflow="hidden" borderRadius="lg" flexShrink={0}>
                        <Image
                          src="/img/internal-measures.jpg"
                          alt="Medidas internas"
                          w="200px"
                          h="200px"
                          objectFit="contain"
                        />
                      </Box>
                      <Text
                        fontSize="sm"
                        color={textColor}
                        flex={1}
                        alignSelf={{ base: "stretch", md: "center" }}
                      >
                        <Text as="span" fontWeight="bold" display="block" mb={2}>
                          ATENÇÃO:
                        </Text>
                        As medidas que você informar aqui serão exatamente as
                        medidas que a embalagem terá por dentro, então, considere
                        já a medida dos seus produtos e da folga que você quer
                        que tenha.
                      </Text>
                    </Flex>
                  </MotionBox>
                )}

                <Collapse
                  in={
                    isPallet ||
                    form.measuresOf === "internal" ||
                    form.measuresOf === "product" ||
                    form.isUnitizedContent === false
                  }
                >
                  <Box ref={sectionMeasuresRef} w="100%" as="form" id="tela4-form" onSubmit={handleTela3Continue}>
                    <MotionBox
                      key="tela2-measures"
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
                    <FormControl>
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
                          onClick={() =>
                            updateForm( {
                              unit: "mm",
                              clearance:
                                form.measuresOf === "product"
                                  ? undefined
                                  : form.clearance,
                            } )
                          }
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
                          onClick={() =>
                            updateForm( {
                              unit: "cm",
                              clearance:
                                form.measuresOf === "product"
                                  ? undefined
                                  : form.clearance,
                            } )
                          }
                          _hover={{
                            bg: form.unit === "cm" ? "blue.500" : unitToggleHoverBg,
                            color: "white",
                          }}
                        >
                          cm
                        </Box>
                      </Flex>
                    </FormControl>

                    <FormControl>
                      <FormLabel textAlign="center" mr={0}>Comprimento</FormLabel>
                      <NumberInput
                        value={form.length ?? ""}
                        onChange={( _, v ) =>
                          updateForm( {
                            length: v === undefined || Number.isNaN( v )
                              ? undefined
                              : v,
                          } )
                        }
                        min={form.unit === "mm" ? 60 : 6}
                        step={form.unit === "mm" ? 1 : 0.1}
                      >
                        <NumberInputField
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

                    <FormControl>
                      <FormLabel textAlign="center" mr={0}>Largura</FormLabel>
                      <NumberInput
                        value={form.width ?? ""}
                        onChange={( _, v ) =>
                          updateForm( {
                            width: v === undefined || Number.isNaN( v )
                              ? undefined
                              : v,
                          } )
                        }
                        min={form.unit === "mm" ? 60 : 6}
                        step={form.unit === "mm" ? 1 : 0.1}
                      >
                        <NumberInputField
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

                    {!isPallet && (
                      <FormControl>
                        <FormLabel textAlign="center" mr={0}>Altura</FormLabel>
                        <NumberInput
                          value={form.height ?? ""}
                          onChange={( _, v ) =>
                            updateForm( {
                              height: v === undefined || Number.isNaN( v )
                                ? undefined
                                : v,
                            } )
                          }
                          min={form.unit === "mm" ? 60 : 6}
                          step={form.unit === "mm" ? 1 : 0.1}
                        >
                          <NumberInputField
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
                    )}
                        </SimpleGrid>
                      </VStack>
                    </MotionBox>

                    <Collapse in={showClearance}>
                      <MotionBox
                        ref={sectionClearanceRef}
                        w="100%"
                        mt={6}
                        mb={6}
                        bg={bgCard}
                        borderRadius="xl"
                        borderWidth="1px"
                        borderColor={borderColor}
                        p={{ base: 5, md: 6 }}
                        shadow="md"
                      >
                        <FormControl as="fieldset" w="full">
                          <FormLabel
                            as="legend"
                            fontSize="lg"
                            fontWeight="semibold"
                            color={headingColor}
                            mb={4}
                            textAlign="center"
                            w="100%"
                          >
                            Quanto de folga você quer que tenha entre o produto e a embalagem?
                          </FormLabel>
                          <SimpleGrid
                            columns={{ base: 1, sm: 2, md: 4 }}
                            spacing={{ base: 3, md: 4 }}
                            w="100%"
                          >
                            {(
                              form.unit === "cm"
                                ? CLEARANCE_OPTIONS_CM
                                : CLEARANCE_OPTIONS_MM
                            ).map( ( opt ) => {
                              const isActive = form.clearance === opt.value;
                              const hasSelection =
                                form.clearance !== undefined &&
                                form.clearance !== null;
                              const isDimmed = hasSelection && !isActive;
                              return (
                                <Box
                                  key={opt.value}
                                  as="button"
                                  type="button"
                                  onClick={() =>
                                    updateForm( { clearance: opt.value } )
                                  }
                                  borderWidth={isActive ? "2px" : "1px"}
                                  borderColor={
                                    isActive ? "blue.400" : borderColor
                                  }
                                  borderRadius="lg"
                                  p={4}
                                  boxShadow="sm"
                                  w="100%"
                                  bg={isActive ? clearanceBadgeBgActive : bgCard}
                                  _hover={{ borderColor: "blue.400" }}
                                  textAlign="left"
                                  opacity={isDimmed ? 0.6 : 1}
                                  filter={isDimmed ? "grayscale(100%)" : "none"}
                                  display="flex"
                                  alignItems="center"
                                  gap={3}
                                >
                                  <Icon
                                    as={BsArrowsAngleExpand}
                                    boxSize={opt.iconSize}
                                    color={
                                      isActive ? "blue.500" : "gray.500"
                                    }
                                  />
                                  <VStack align="flex-start" spacing={0}>
                                    <Text
                                      fontSize="sm"
                                      fontWeight={
                                        isActive ? "extrabold" : "semibold"
                                      }
                                    >
                                      {opt.label}
                                    </Text>
                                    <Text fontSize="xs" color={textColor}>
                                      {opt.suffix}
                                    </Text>
                                  </VStack>
                                </Box>
                              );
                            } )}
                          </SimpleGrid>
                        </FormControl>
                      </MotionBox>
                    </Collapse>
                  </Box>
                </Collapse>
                <Flex
                  ref={sectionTela2ContinuarRef}
                  w="100%"
                  justify="space-between"
                  align="center"
                  gap={4}
                  mt={4}
                >
                  <Button
                    type="button"
                    variant="ghost"
                    size="lg"
                    leftIcon={<ArrowBackIcon />}
                    onClick={goBack}
                  >
                    Voltar
                  </Button>
                  <Button
                    type="submit"
                    form="tela4-form"
                    colorScheme="blue"
                    size="lg"
                    minH="44px"
                    isDisabled={!showTela2Continuar}
                  >
                    Continuar
                  </Button>
                </Flex>
              </MotionBox>
            )}

            {step === STEP_TELA5 && (
              <MotionBox
                key="tela5"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
                w="100%"
              >
                <MotionBox
                  ref={sectionTela5Ref}
                  bg={bgCard}
                  borderRadius="xl"
                  borderWidth="1px"
                  borderColor={borderColor}
                  p={{ base: 5, md: 8 }}
                  shadow="md"
                >
                  <VStack align="center" spacing={{ base: 6, md: 8 }} w="100%">
                    <Text
                      fontSize="lg"
                      fontWeight="semibold"
                      color={headingColor}
                      textAlign="center"
                    >
                      O peso do produto será bem distribuído sobre a base da embalagem?
                    </Text>
                    <SimpleGrid
                      columns={{ base: 1, md: 2 }}
                      spacing={{ base: 4, md: 6 }}
                      w="100%"
                      justifyItems="center"
                    >
                      {[
                        {
                          value: true as const,
                          label: "Sim. O peso vai ficar distribuído em toda a área da base.",
                          suffix: "Exemplo: Uma mesa deitada distribui seu peso ao longo da base.",
                          img: "/img/weight-evenly-distributed.jpg",
                        },
                        {
                          value: false as const,
                          label:
                            "Não. O peso vai se concentrar em alguns pontos sobre a base.",
                          suffix:
                            "Exemplo: Uma mesa em pé concentra seu peso em 4 pontos da base, " +
                            "exatamente onde vão estar os 4 pés da mesa.",
                          img: "/img/weight-concentrated.jpg",
                        },
                      ].map( ( opt ) => {
                        const isActive = form.isDistributedWeight === opt.value;
                        const hasSelection =
                          form.isDistributedWeight !== undefined;
                        const isDimmed = hasSelection && !isActive;
                        return (
                          <Box
                            key={String( opt.value )}
                            as="button"
                            type="button"
                            onClick={() => updateForm( { isDistributedWeight: opt.value } )}
                            borderRadius="xl"
                            borderWidth={isActive ? "2px" : "1px"}
                            borderColor={isActive ? "blue.400" : borderColor}
                            p="15px"
                            w="fit-content"
                            bg={bgCard}
                            _hover={{ borderColor: "blue.400" }}
                            textAlign="center"
                            display="flex"
                            flexDirection="column"
                            alignItems="center"
                            opacity={isDimmed ? 0.6 : 1}
                            filter={isDimmed ? "grayscale(100%)" : "none"}
                          >
                            <Box
                              overflow="hidden"
                              borderRadius="lg"
                              w="fit-content"
                            >
                              <Image
                                src={opt.img}
                                alt={opt.label}
                                w="200px"
                                h="200px"
                                objectFit="contain"
                              />
                            </Box>
                            <VStack align="center" spacing={0} textAlign="center" w="100%">
                              <Text fontSize="sm" fontWeight="semibold">
                                {opt.label}
                              </Text>
                              <Text fontSize="xs" color={textColor}>
                                {opt.suffix}
                              </Text>
                            </VStack>
                          </Box>
                        );
                      } )}
                    </SimpleGrid>
                  </VStack>
                </MotionBox>
                <Flex
                  w="100%"
                  justify="space-between"
                  align="center"
                  gap={4}
                  mt={4}
                >
                  <Button
                    variant="ghost"
                    size="lg"
                    leftIcon={<ArrowBackIcon />}
                    onClick={goBack}
                  >
                    Voltar
                  </Button>
                  <Button
                    colorScheme="blue"
                    size="lg"
                    minH="44px"
                    isDisabled={form.isDistributedWeight === undefined}
                    onClick={handleTela5Continue}
                  >
                    Continuar
                  </Button>
                </Flex>
              </MotionBox>
            )}

            {step === STEP_TELA6 && (
              <MotionBox
                key="tela6"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
                w="100%"
              >
                <MotionBox
                  bg={bgCard}
                  borderRadius="xl"
                  borderWidth="1px"
                  borderColor={borderColor}
                  p={{ base: 5, md: 8 }}
                  shadow="md"
                >
                  <VStack align="center" spacing={{ base: 6, md: 8 }} w="100%">
                    <Flex
                      w="100%"
                      direction={{ base: "column", md: "row" }}
                      align={{ base: "center", md: "flex-start" }}
                      gap={{ base: 8, md: 10 }}
                    >
                      <Image
                        src="/img/recommended-securing.png"
                        alt="Nossas Recomendações"
                        w="300px"
                        flexShrink={0}
                        objectFit="contain"
                        borderRadius="xl"
                      />
                      <Box flex={1}>
                        <Text
                          fontSize="xl"
                          fontWeight="semibold"
                          color={headingColor}
                          mb={4}
                        >
                          Nossas Recomendações
                        </Text>
                        <Box as="ul" pl={6}>
                          <Text as="li" mb={2} fontSize="lg">
                            Recomendamos prender o produto na base
                          </Text>
                          <Text as="li" mb={2} fontSize="lg">
                            Considere a inclusão de tábuas avulsas para calçar o
                            produto na base
                          </Text>
                        </Box>
                      </Box>
                    </Flex>
                    <Button
                      colorScheme="blue"
                      size="lg"
                      minH="44px"
                      onClick={() => setRecommendationsAcknowledged( true )}
                    >
                      Entendi
                    </Button>
                  </VStack>
                </MotionBox>
                <Flex
                  w="100%"
                  justify="space-between"
                  align="center"
                  gap={4}
                  mt={4}
                >
                  <Button
                    variant="ghost"
                    size="lg"
                    leftIcon={<ArrowBackIcon />}
                    onClick={goBack}
                  >
                    Voltar
                  </Button>
                  <Button
                    colorScheme="blue"
                    size="lg"
                    minH="44px"
                    isDisabled={!recommendationsAcknowledged}
                    onClick={handleTela6Continue}
                  >
                    Continuar
                  </Button>
                </Flex>
              </MotionBox>
            )}

            {( step === STEP_TELA7 || step === STEP_RESULT ) && (
              <MotionBox
                key={step === STEP_TELA7 ? "tela7-group" : "result-group"}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
                w="100%"
              >
                <VStack spacing={6} w="100%">
                  <Box
                    bg={bgCard}
                    borderRadius="xl"
                    borderWidth="1px"
                    borderColor={borderColor}
                    p={{ base: 5, md: 8 }}
                    shadow="md"
                    w="100%"
                  >
                    <Heading size="sm" color={headingColor} mb={4}>
                      Resumo da sua simulação
                    </Heading>
                    <SimpleGrid
                      columns={{ base: 1, sm: 2, md: 3 }}
                      spacing={3}
                      fontSize="sm"
                    >
                      {(
                        [
                          {
                            label: "Tipo de embalagem",
                            value: PACK_TYPE_OPTIONS.find(
                              ( o ) => o.value === form.packType
                            )?.label ?? form.packType,
                            editTarget: {
                              step: STEP_TELA1,
                              tela1SubStep: TELA1_SUB_PACK,
                              ref: sectionPackTypeRef,
                            },
                          },
                          form.prodType && form.prodType > 0
                            ? {
                                label: "Segmento de mercado",
                                value: PRODUCT_TYPE_LABELS[form.prodType] ?? "",
                                editTarget: {
                                  step: STEP_TELA1,
                                  tela1SubStep: TELA1_SUB_PROD,
                                  ref: sectionProdTypeRef,
                                },
                              }
                            : null,
                          form.isExport !== undefined
                            ? {
                                label: "Exportação",
                                value: form.isExport ? "Sim" : "Não",
                                editTarget: {
                                  step: STEP_TELA1,
                                  tela1SubStep: TELA1_SUB_EXPORT,
                                  ref: sectionIsExportRef,
                                },
                              }
                            : null,
                          form.weight
                            ? {
                                label: "Peso",
                                value: WEIGHT_RANGE_OPTIONS.find(
                                  ( o ) => o.value === form.weight
                                )?.label ?? `${form.weight} kg`,
                                editTarget: {
                                  step: STEP_TELA1,
                                  tela1SubStep: TELA1_SUB_WEIGHT,
                                  ref: sectionWeightRef,
                                },
                              }
                            : null,
                          form.isUnitizedContent !== undefined
                            ? {
                                label: "Disposição do conteúdo",
                                value: form.isUnitizedContent
                                  ? "Produto único"
                                  : "Vários produtos",
                                editTarget: {
                                  step: STEP_TELA3,
                                  ref: sectionTela3Ref,
                                },
                              }
                            : null,
                          form.measuresOf
                            ? {
                                label: "Medidas referentes ao",
                                value:
                                  form.measuresOf === "internal"
                                    ? "Interior da embalagem"
                                    : "Produto a ser embalado",
                                editTarget: {
                                  step: STEP_TELA4,
                                  ref:
                                    form.isUnitizedContent === true && !isPallet
                                      ? sectionMeasuresOfRef
                                      : sectionMeasuresRef,
                                },
                              }
                            : null,
                          form.length && form.width
                            ? {
                                label:
                                  form.measuresOf === "product"
                                    ? "Dimensões do produto"
                                    : "Dimensões internas da embalagem",
                                value: (() => {
                                  const u = form.unit ?? "mm";
                                  const hasH =
                                    form.packType !== "pallet" &&
                                    form.height != null &&
                                    form.height > 0;
                                  const dims = hasH
                                    ? `${form.length} x ${form.width} x ${form.height} ${u} (alt.)`
                                    : `${form.length} x ${form.width} ${u}`;
                                  return dims;
                                })(),
                                editTarget: { step: STEP_TELA4, ref: sectionMeasuresRef },
                              }
                            : null,
                          form.measuresOf === "product" && form.clearance != null
                            ? {
                                label: "Folga",
                                value:
                                  ( form.unit === "cm"
                                    ? CLEARANCE_OPTIONS_CM
                                    : CLEARANCE_OPTIONS_MM
                                  ).find( ( o ) => o.value === form.clearance )
                                    ?.label ?? String( form.clearance ),
                                editTarget: {
                                  step: STEP_TELA4,
                                  ref: sectionClearanceRef,
                                },
                              }
                            : null,
                          form.isDistributedWeight !== undefined &&
                          form.packType !== "pallet" &&
                          form.isUnitizedContent === true
                            ? {
                                label: "Peso distribuído",
                                value: form.isDistributedWeight ? "Sim" : "Não",
                                editTarget: {
                                  step: STEP_TELA5,
                                  ref: sectionTela5Ref,
                                },
                              }
                            : null,
                          form.customerName
                            ? {
                                label: "Nome",
                                value: form.customerName,
                                editTarget: { step: STEP_TELA2, ref: sectionTela2Ref },
                              }
                            : null,
                          form.customerEmail
                            ? {
                                label: "E-mail",
                                value: form.customerEmail,
                                editTarget: { step: STEP_TELA2, ref: sectionTela2Ref },
                              }
                            : null,
                          form.customerCnpj
                            ? {
                                label: "CNPJ",
                                value: form.customerCnpj.replace( /\D/g, "" ).replace(
                                  /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
                                  "$1.$2.$3/$4-$5"
                                ),
                                editTarget: { step: STEP_TELA7, ref: sectionTela7Ref },
                              }
                            : null,
                        ] as ( {
                          label: string;
                          value: string;
                          editTarget?: {
                            step: number;
                            tela1SubStep?: number;
                            ref: React.RefObject<HTMLDivElement | null>;
                          };
                        } | null )[]
                      )
                        .filter( ( i ): i is NonNullable<typeof i> =>
                          i != null && i.value !== ""
                        )
                        .map( ( item ) => (
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
                              item.editTarget &&
                              handleEditSummaryItem( item.editTarget )
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
                              {item.editTarget && (
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
                              )}
                            </Flex>
                          </Box>
                        ) )}
                    </SimpleGrid>
                  </Box>

                  {step === STEP_TELA7 && (
                    <Box
                      as="form"
                      onSubmit={handleTela7Submit}
                      w="100%"
                    >
                      <MotionBox
                        ref={sectionTela7Ref}
                        bg={bgCard}
                        borderRadius="xl"
                        borderWidth="1px"
                        borderColor={borderColor}
                        p={{ base: 5, md: 8 }}
                        shadow="md"
                        w="100%"
                      >
                        <VStack align="center" spacing={{ base: 6, md: 8 }} w="100%">
                          <Text fontSize="lg" color={headingColor} textAlign="center">
                            A Ribermax vende somente para empresas. Para calcular sua
                            embalagem, informe seu CNPJ.
                          </Text>

                          <FormControl isRequired>
                            <FormLabel>CNPJ</FormLabel>
                            <Input
                              value={form.customerCnpj || ""}
                              onChange={( e ) =>
                                updateForm( { customerCnpj: e.target.value } )
                              }
                              placeholder="00.000.000/0000-00"
                              size="lg"
                              borderColor={borderColor}
                              minH="44px"
                            />
                          </FormControl>
                        </VStack>
                      </MotionBox>
                      <Flex
                        w="100%"
                        justify="space-between"
                        align="center"
                        gap={4}
                        mt={4}
                      >
                        <Button
                          type="button"
                          variant="ghost"
                          size="lg"
                          leftIcon={<ArrowBackIcon />}
                          onClick={goBack}
                        >
                          Voltar
                        </Button>
                        <Button
                          type="submit"
                          colorScheme="blue"
                          size="lg"
                          minH="44px"
                          isDisabled={
                            !( form.customerCnpj || "" ).trim() ||
                            !( form.customerName || "" ).trim() ||
                            !( form.customerEmail || "" ).trim()
                          }
                        >
                          Calcular agora
                        </Button>
                      </Flex>
                    </Box>
                  )}

                  {step === STEP_RESULT && (
                    <Box
                      bg={bgCard}
                      borderRadius="xl"
                      borderWidth="1px"
                      borderColor={borderColor}
                      p={{ base: 5, md: 8 }}
                      shadow="md"
                      w="100%"
                    >
                      <VStack align="stretch" spacing={6} w="100%">
                        <Heading size="md" color={headingColor} textAlign="center">
                          Resultado
                        </Heading>
                        {isCalculatingPrices ? (
                          <Flex justify="center" py={8}>
                            <Text color={textColor}>
                              Calculando preços...
                            </Text>
                          </Flex>
                        ) : elegibleTemplates.length === 0 ? (
                          <Text fontSize="sm" color={textColor} textAlign="center">
                            Nenhum modelo elegível para as medidas informadas.
                          </Text>
                        ) : (
                          <VStack align="stretch" spacing={3}>
                            {elegibleTemplates.map( ( t ) => (
                              <Flex
                                key={t.name}
                                p={4}
                                bg={preBg}
                                borderRadius="lg"
                                justify="space-between"
                                align="center"
                                flexWrap="wrap"
                                gap={2}
                              >
                                <Text fontWeight="semibold" color={headingColor}>
                                  {t.priceResult?.info?.titulo ??
                                    t.name.replace( /_/g, " " ).replace(
                                      /\b\w/g,
                                      ( c ) => c.toUpperCase()
                                    )}
                                </Text>
                                {t.priceResult?.error ? (
                                  <Text fontSize="sm" color="red.500">
                                    {t.priceResult.error}
                                  </Text>
                                ) : t.priceResult?.info?.vFinal != null ? (
                                  <Text fontSize="lg" fontWeight="bold" color="green.600">
                                    R$ {Number( t.priceResult.info.vFinal ).toFixed( 2 )}
                                  </Text>
                                ) : null}
                              </Flex>
                            ) )}
                          </VStack>
                        )}
                        <Box
                          as="pre"
                          p={4}
                          bg={preBg}
                          borderRadius="md"
                          overflow="auto"
                          fontSize="xs"
                          fontFamily="mono"
                          maxH="200px"
                        >
                          {JSON.stringify( elegibleTemplates, null, 2 )}
                        </Box>
                      </VStack>
                    </Box>
                  )}
                </VStack>
              </MotionBox>
            )}
          </AnimatePresence>

          <Box w="100%" mt={8} pt={6} borderTopWidth="1px" borderColor={borderColor}>
            <Progress
              value={( currentProgressStep / 5 ) * 100}
              size="sm"
              colorScheme="blue"
              borderRadius="full"
              mb={4}
              max={100}
            />
            <SimpleGrid
              columns={{ base: 2, sm: 4, md: 7 }}
              spacing={2}
              w="100%"
            >
              {PROGRESS_STEPS.map( ( prog ) => {
                const isCompleted = prog.id < currentProgressStep;
                const isCurrent = prog.id === currentProgressStep;
                const isComingSoon = prog.comingSoon === true;
                const stepColor = isComingSoon
                  ? "gray.400"
                  : isCompleted
                    ? "green.500"
                    : isCurrent
                      ? "blue.500"
                      : "gray.300";
                return (
                  <Tooltip
                    key={prog.id}
                    label={
                      isComingSoon
                        ? "Em breve"
                        : `${prog.id}. ${prog.label}`
                    }
                    placement="top"
                    hasArrow
                  >
                    <Flex
                      direction="column"
                      align="center"
                      gap={1}
                      opacity={isComingSoon ? 0.6 : 1}
                    >
                      <Box
                        w={8}
                        h={8}
                        borderRadius="full"
                        borderWidth="2px"
                        borderColor={stepColor}
                        bg={isCompleted ? stepColor : "transparent"}
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        flexShrink={0}
                      >
                        {isCompleted && !isComingSoon ? (
                          <Text color="white" fontSize="xs" fontWeight="bold">
                            ✓
                          </Text>
                        ) : (
                          <Text
                            fontSize="xs"
                            fontWeight="bold"
                            color={
                              isCurrent && !isComingSoon
                                ? "blue.500"
                                : isComingSoon
                                  ? "gray.400"
                                  : stepColor
                            }
                          >
                            {prog.id}
                          </Text>
                        )}
                      </Box>
                      <Text
                        fontSize="xs"
                        color={isComingSoon ? "gray.400" : textColor}
                        textAlign="center"
                        noOfLines={2}
                      >
                        {prog.label}
                      </Text>
                    </Flex>
                  </Tooltip>
                );
              } )}
            </SimpleGrid>
          </Box>
        </Flex>
      </Box>

    </Fragment>
  );
};

export default CalculadoraEmbalagem;
