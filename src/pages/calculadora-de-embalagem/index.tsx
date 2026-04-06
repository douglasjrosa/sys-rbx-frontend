import {
  Box,
  Button,
  Collapse,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  HStack,
  Icon,
  Image,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalOverlay,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Radio,
  RadioGroup,
  SimpleGrid,
  Spinner,
  Text,
  useColorMode,
  useColorModeValue,
  useToast,
  VStack,
} from "@chakra-ui/react";
import { ArrowBackIcon, CheckIcon } from "@chakra-ui/icons";
import { FaWeightHanging } from "react-icons/fa";
import { BsArrowsAngleExpand } from "react-icons/bs";
import { AnimatePresence } from "framer-motion";
import { NextPage } from "next";
import Head from "next/head";
import {
  FormEvent,
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ASK_CONTENT_PROD_TYPES,
  FRACTIONED_PROD_TYPES,
  AssemblyType,
  getElegibleTemplates,
  resolveInternalPackageDimensions,
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
} from "@/lib/calculadora-de-embalagem/utils/packagingCalculator";
import { PackagingProgressTrack } from "@/lib/calculadora-de-embalagem/components/PackagingProgressTrack";
import {
  TypewriterBlock,
  TypewriterCardText,
} from "@/lib/calculadora-de-embalagem/components/TypewriterCardText";
import { DiscountPolicyDiscountCard } from "@/lib/calculadora-de-embalagem/components/DiscountPolicyDiscountTable";
import type { AppliedDiscounts } from "@/lib/calculadora-de-embalagem/utils/appliedDiscounts";
import { buildAppliedDiscounts } from "@/lib/calculadora-de-embalagem/utils/appliedDiscounts";
import { DiscountPolicySelectedModelSection } from "@/lib/calculadora-de-embalagem/components/DiscountPolicySelectedModelSection";
import { ResultTemplateCard } from "@/lib/calculadora-de-embalagem/components/ResultTemplateCard";
import { SimulationSummaryPanel } from "@/lib/calculadora-de-embalagem/components/SimulationSummaryPanel";
import { StepConferirContent } from "@/lib/calculadora-de-embalagem/components/StepConferirContent";
import type { ElegibleTemplateResult } from "@/lib/calculadora-de-embalagem/utils/types";
import {
  DEFAULT_PRODTYPE_FOR_PALLET,
  PROGRESS_STEPS,
  STEP_CONFERIR,
  STEP_DISCOUNT,
  STEP_RESULT,
  STEP_TELA1,
  STEP_TELA2,
  STEP_TELA3,
  STEP_TELA4,
  STEP_TELA5,
  STEP_TELA6,
  STEP_TELA7,
  TELA1_SUB_EXPORT,
  TELA1_SUB_PACK,
  TELA1_SUB_PROD,
  TELA1_SUB_WEIGHT,
} from "@/lib/calculadora-de-embalagem/utils/wizardSteps";
import {
  ASSEMBLY_OPTIONS,
  CLEARANCE_OPTIONS_CM,
  CLEARANCE_OPTIONS_MM,
  initialForm,
  PACK_TYPE_IMAGES,
  PACK_TYPE_OPTIONS,
  PRODUCT_TYPE_IMAGES,
  WEIGHT_RANGE_OPTIONS,
} from "@/lib/calculadora-de-embalagem/utils/formOptions";
import {
  TELA1_TW_EXPORT_BOX,
  TELA1_TW_EXPORT_PALLET,
  TELA1_TW_PACK,
  TELA1_TW_PROD,
  TELA1_TW_WEIGHT_BOX,
  TELA1_TW_WEIGHT_PALLET,
  TELA4_TW_U_FALSE_HEAD,
  TELA4_TW_U_FALSE_PARA,
  TELA4_TW_U_TRUE_HEAD,
  TELA4_TW_U_TRUE_OPT0,
  TELA4_TW_U_TRUE_OPT1,
  TELA6_TW_BULLET_1,
  TELA6_TW_BULLET_2,
  TELA6_TW_TITLE,
  TELA7_TW_CNPJ_LABEL,
  TELA7_TW_INTRO,
  TW_SEQ_TELA2,
  TW_SEQ_TELA3,
  TW_SEQ_TELA4,
  TW_SEQ_TELA5,
  TW_SEQ_TELA6,
  TW_SEQ_TELA7,
} from "@/lib/calculadora-de-embalagem/utils/typewriterConstants";
import {
  formatCnpjMaskInput,
  formatMoneyBrlPtBr,
  formatSimulationDimensionsLine,
  formatTemplateModelLabel,
} from "@/lib/calculadora-de-embalagem/utils/formatters";
import {
  ASSEMBLY_SURCHARGE_FRACTION_OF_VFINAL,
  sortTemplateResultsByPriceAsc,
} from "@/lib/calculadora-de-embalagem/utils/pricing";
import {
  assemblyIllustrationSrc,
  boxTemplatesList,
  packTypeForTemplateName,
} from "@/lib/calculadora-de-embalagem/utils/templateMeta";
import {
  CONTACT_CHANNEL_OPTIONS,
  contactChannelShowsEmail,
  contactChannelShowsPhone,
  isContactPreferencesStepComplete,
  type ContactChannel,
} from "@/lib/calculadora-de-embalagem/utils/contactChannel";
import {
  hydrateInitialFormFromCustomerStorage,
  mergeCalculadoraCustomerStorage,
  readCalculadoraCustomerStored,
} from "@/lib/calculadora-de-embalagem/utils/customerStorage";
import {
  buildCalculadoraSubmissionPayload,
  type CalculadoraSubmissionPayload,
  type CustomerClarity,
} from "@/lib/calculadora-de-embalagem/utils/calculadoraSubmissionPayload";
import { getStrapiErrorDescription } from "@/lib/strapiApiError";
import { buildCalculadoraPricingQuote } from "@/lib/calculadora-de-embalagem/utils/pricing";
import { isProgressStepUnlocked as checkProgressUnlocked } from "@/lib/calculadora-de-embalagem/utils/progressNavigation";
import { getRecommendedTemplateName } from "@/lib/calculadora-de-embalagem/utils/recommendedTemplate";
import { MotionBox } from "@/lib/calculadora-de-embalagem/components/motionPrimitives";
import { CalculadoraPageChrome } from "@/lib/calculadora-de-embalagem/components/CalculadoraPageChrome";
import {
  useCalculadoraSimulationSummaryItems,
  useCalculadoraThemeTokens,
} from "@/lib/calculadora-de-embalagem/hooks/useCalculadoraWizard";

const CalculadoraEmbalagem: NextPage = () => {
  const { colorMode, toggleColorMode } = useColorMode();
  const toast = useToast();
  const [step, setStep] = useState(STEP_TELA1);
  const [tela1SubStep, setTela1SubStep] = useState(TELA1_SUB_PACK);
  const [form, setForm] = useState<Partial<PackagingFormData>>(initialForm);
  const [elegibleTemplates, setElegibleTemplates] = useState<
    ElegibleTemplateResult[]
  >([]);
  const [isCalculatingPrices, setIsCalculatingPrices] = useState(false);
  const [pricingModalNames, setPricingModalNames] = useState<string[]>([]);
  const [pricingModalActiveIndex, setPricingModalActiveIndex] = useState(0);
  const [recommendationsAcknowledged, setRecommendationsAcknowledged] = useState(false);
  const [simulationSummaryOpen, setSimulationSummaryOpen] = useState(true);
  const [customerClarity, setCustomerClarity] = useState<CustomerClarity | null>(
    null,
  );
  const [conferirQty, setConferirQty] = useState<number | "">(1);
  const [conferirProdName, setConferirProdName] = useState("");
  const [conferirProdCode, setConferirProdCode] = useState("");
  const [conferirMessage, setConferirMessage] = useState("");
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const lastSubmissionRef = useRef<CalculadoraSubmissionPayload | null>(null);
  const sectionPackTypeRef = useRef<HTMLDivElement>(null);
  const sectionProdTypeRef = useRef<HTMLDivElement>(null);
  const sectionIsExportRef = useRef<HTMLDivElement>(null);
  const sectionWeightRef = useRef<HTMLDivElement>(null);
  const sectionMeasuresRef = useRef<HTMLDivElement>(null);
  const sectionClearanceRef = useRef<HTMLDivElement>(null);
  const sectionMeasuresOfRef = useRef<HTMLDivElement>(null);
  const sectionTela2Ref = useRef<HTMLDivElement>(null);
  const sectionTela3Ref = useRef<HTMLDivElement>(null);
  const sectionTela2ContinuarRef = useRef<HTMLDivElement>(null);
  const sectionTela1ContinuarRef = useRef<HTMLDivElement>(null);
  const sectionTela4Ref = useRef<HTMLDivElement>(null);
  const sectionTela5Ref = useRef<HTMLDivElement>(null);
  const sectionTela5ContinuarRef = useRef<HTMLDivElement>(null);
  const sectionTela6Ref = useRef<HTMLDivElement>(null);
  const sectionTela7Ref = useRef<HTMLDivElement>(null);
  const sectionAssemblyRef = useRef<HTMLDivElement>(null);
  const sectionAssemblyContinueRef = useRef<HTMLDivElement>(null);
  const sectionResultModelsRef = useRef<HTMLDivElement>(null);
  const isFirstStepEffect = useRef(true);

  const scrollToSection = useCallback((ref: React.RefObject<HTMLDivElement | null>) => {
    setTimeout(() => {
      ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 280);
  }, []);

  const handleEditSummaryItem = useCallback(
    (target: {
      step: number;
      tela1SubStep?: number;
      ref: React.RefObject<HTMLDivElement | null>;
    }) => {
      setStep(target.step);
      if (target.tela1SubStep != null) {
        setTela1SubStep(target.tela1SubStep);
      }
      setTimeout(() => scrollToSection(target.ref), 400);
    },
    [scrollToSection]
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
    (isPallet || !!form.height) &&
    (form.measuresOf !== "product" || !!form.clearance);

  const showTela1Continuar =
    tela1SubStep >= TELA1_SUB_WEIGHT &&
    !!form.packType &&
    (isPallet || (form.prodType && form.prodType > 0)) &&
    form.isExport !== undefined &&
    !!form.weight;

  const showTela5Continuar = form.isDistributedWeight !== undefined;

  const contactFormComplete = useMemo(
    () => isContactPreferencesStepComplete(form, validateEmail),
    [
      form.contactChannel,
      form.customerName,
      form.customerEmail,
      form.customerPhone,
    ],
  );

  const tela7NfeFieldsValid = useMemo(() => {
    const nfe = (form.emailNfe || "").trim();
    return nfe !== "" && validateEmail(nfe);
  }, [form.emailNfe]);

  const prevShowTela1ContinuarRef = useRef(showTela1Continuar);
  const prevShowTela2ContinuarRef = useRef(showTela2Continuar);
  const prevShowTela5ContinuarRef = useRef(showTela5Continuar);

  const currentProgressStep = step <= 1 ? 1
    : step <= 2 ? 2
      : step <= 6 ? 3
        : step <= 7 ? 4
          : step <= STEP_RESULT ? 5
            : step <= STEP_DISCOUNT ? 6
              : 7;

  const {
    bgPage,
    bgCard,
    borderColor,
    headingColor,
    textColor,
    preBg,
    unitToggleHoverBg,
    clearanceBadgeBgActive,
    placeholderColor,
    progressTrackInactiveBg,
    resultListingPriceColor,
    recommendedCardBorderColor,
    resultRankCaptionBgOther,
    assemblyOptionCardBg,
  } = useCalculadoraThemeTokens();

  const successModalToastBg = useColorModeValue("green.50", "green.900");
  const successModalToastBorder = useColorModeValue("green.200", "green.700");
  const successModalToastAccent = useColorModeValue("green.500", "green.400");
  const ganheTempoTitleColor = useColorModeValue("blue.500", "blue.300");

  const resultTemplatesSortedByPrice = useMemo(
    () => sortTemplateResultsByPriceAsc(elegibleTemplates),
    [elegibleTemplates],
  );

  const tela1TypewriterSequenceKey = useMemo(
    () => `tela1-${form.template || "none"}`,
    [form.template],
  );

  const resultTypewriterSequenceKey = useMemo(
    () => `result-${form.template || "none"}`,
    [form.template],
  );

  const tela4DimensionsIntroLineIndex = useMemo(() => {
    if (isPallet) return 0;
    if (form.isUnitizedContent === true) return 3;
    if (form.isUnitizedContent === false) return 2;
    return 0;
  }, [isPallet, form.isUnitizedContent]);

  const tela4ClearanceLineBase = useMemo(
    () => tela4DimensionsIntroLineIndex + 1,
    [tela4DimensionsIntroLineIndex],
  );

  const tela4MeasuresBlockResetKey = useMemo(
    () =>
      `${TW_SEQ_TELA4}-${form.packType ?? "none"}-u${String(
        form.isUnitizedContent,
      )}`,
    [form.packType, form.isUnitizedContent],
  );

  const visibleResultTemplates = useMemo(() => {
    if (!form.template) return resultTemplatesSortedByPrice;
    return resultTemplatesSortedByPrice.filter((t) => t.name === form.template);
  }, [form.template, resultTemplatesSortedByPrice]);

  const recommendedTemplateName = useMemo(
    () => getRecommendedTemplateName(resultTemplatesSortedByPrice),
    [resultTemplatesSortedByPrice],
  );

  const chosenTemplateRow = useMemo(
    () =>
      form.template
        ? elegibleTemplates.find((t) => t.name === form.template)
        : undefined,
    [form.template, elegibleTemplates],
  );

  const conferirPackTypeForQty = useMemo((): Exclude<PackType, "any"> => {
    const fromTemplate = (name: string | undefined): Exclude<PackType, "any"> => {
      const p = name ? packTypeForTemplateName(name) : undefined;
      if (p === "box" || p === "crate" || p === "pallet") {
        return p;
      }
      return "box";
    };
    if (form.packType === "any") {
      return fromTemplate(form.template);
    }
    if (
      form.packType === "box" ||
      form.packType === "crate" ||
      form.packType === "pallet"
    ) {
      return form.packType;
    }
    return fromTemplate(form.template);
  }, [form.packType, form.template]);

  const selectedTemplatePackType = useMemo((): PackType | undefined => {
    if (!form.template) return undefined;
    return packTypeForTemplateName(form.template);
  }, [form.template]);

  const assemblyAssetFolder = useMemo((): "box" | "crate" | null => {
    if (selectedTemplatePackType === "box") return "box";
    if (selectedTemplatePackType === "crate") return "crate";
    return null;
  }, [selectedTemplatePackType]);

  const showAssemblySection =
    Boolean(form.template) && assemblyAssetFolder !== null;

  const selectedTemplateVFinal = useMemo(() => {
    if (!form.template) return NaN;
    const row = elegibleTemplates.find((t) => t.name === form.template);
    const raw = row?.priceResult?.info?.vFinal;
    const n = raw == null ? NaN : Number(raw);
    return Number.isFinite(n) ? n : NaN;
  }, [form.template, elegibleTemplates]);

  const [discountEnabledByName, setDiscountEnabledByName] = useState<
    Record<string, boolean>
  >({});

  const appliedDiscounts = useMemo((): AppliedDiscounts => {
    const hasValidPrice =
      Number.isFinite(selectedTemplateVFinal) && selectedTemplateVFinal > 0;
    return buildAppliedDiscounts(
      discountEnabledByName,
      hasValidPrice,
      selectedTemplateVFinal,
    );
  }, [discountEnabledByName, selectedTemplateVFinal]);

  const conferirPricingQuote = useMemo(() => {
    const v = selectedTemplateVFinal;
    if (!Number.isFinite(v)) return null;
    return buildCalculadoraPricingQuote({
      vFinal: v,
      isExport: form.isExport === true,
      assembly: form.assembly,
      discountsTotalBrl: appliedDiscounts.totalValue,
    });
  }, [
    selectedTemplateVFinal,
    form.isExport,
    form.assembly,
    appliedDiscounts.totalValue,
  ]);

  useEffect(() => {
    if (step < STEP_RESULT) {
      setDiscountEnabledByName({});
    }
  }, [step]);

  useEffect(() => {
    if (step !== STEP_CONFERIR) {
      setCustomerClarity(null);
      setConferirQty(1);
      setConferirProdName("");
      setConferirProdCode("");
      setConferirMessage("");
    }
  }, [step]);

  const canContinueFromResultToDiscount = useMemo(
    () =>
      Boolean(form.template) &&
      (!showAssemblySection || form.assembly != null),
    [form.template, showAssemblySection, form.assembly],
  );

  const simulationSummaryItems = useCalculadoraSimulationSummaryItems({
    form,
    isPallet,
    showAssemblySection,
    elegibleTemplates,
    refs: {
      sectionPackTypeRef,
      sectionProdTypeRef,
      sectionIsExportRef,
      sectionWeightRef,
      sectionTela3Ref,
      sectionMeasuresRef,
      sectionMeasuresOfRef,
      sectionClearanceRef,
      sectionTela5Ref,
      sectionTela2Ref,
      sectionTela7Ref,
      sectionResultModelsRef,
      sectionAssemblyRef,
    },
  });

  useEffect(() => {
    if (
      step === STEP_RESULT ||
      step === STEP_DISCOUNT ||
      step === STEP_CONFERIR
    ) {
      return;
    }
    setForm((prev) => {
      if (prev.template === undefined && prev.assembly == null) {
        return prev;
      }
      return { ...prev, template: undefined, assembly: null };
    });
  }, [step]);

  useEffect(() => {
    const parsed = readCalculadoraCustomerStored();
    setForm((prev) => ({
      ...prev,
      ...(parsed.contactChannel
        ? { contactChannel: parsed.contactChannel }
        : {}),
      ...(parsed.customerName ? { customerName: parsed.customerName } : {}),
      ...(parsed.customerEmail ? { customerEmail: parsed.customerEmail } : {}),
      ...(parsed.customerCnpj
        ? { customerCnpj: formatCnpjMaskInput(parsed.customerCnpj) }
        : {}),
      ...(parsed.emailNfe ? { emailNfe: parsed.emailNfe } : {}),
      ...(parsed.customerPhone ? { customerPhone: parsed.customerPhone } : {}),
    }));
  }, []);

  useEffect(() => {
    if (isFirstStepEffect.current) {
      isFirstStepEffect.current = false;
      return;
    }
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
  }, [step]);

  useEffect(() => {
    if (showClearance) {
      setTimeout(() => {
        sectionClearanceRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 320);
    }
  }, [showClearance]);

  useEffect(() => {
    const prev = prevShowTela2ContinuarRef.current;
    if (
      step === STEP_TELA4 &&
      showTela2Continuar &&
      !prev
    ) {
      setTimeout(() => {
        sectionTela2ContinuarRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 320);
    }
    prevShowTela2ContinuarRef.current = showTela2Continuar;
  }, [step, showTela2Continuar]);

  useEffect(() => {
    if (
      step === STEP_TELA4 &&
      (form.isUnitizedContent === false || isPallet)
    ) {
      updateForm({ measuresOf: "internal" });
    }
  }, [step, form.isUnitizedContent, isPallet]);

  useEffect(() => {
    const prev = prevShowTela1ContinuarRef.current;
    if (
      step === STEP_TELA1 &&
      showTela1Continuar &&
      !prev
    ) {
      setTimeout(() => {
        sectionTela1ContinuarRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 320);
    }
    prevShowTela1ContinuarRef.current = showTela1Continuar;
  }, [step, showTela1Continuar]);

  useEffect(() => {
    const prev = prevShowTela5ContinuarRef.current;
    if (
      step === STEP_TELA5 &&
      showTela5Continuar &&
      !prev
    ) {
      setTimeout(() => {
        sectionTela5ContinuarRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 320);
    }
    prevShowTela5ContinuarRef.current = showTela5Continuar;
  }, [step, showTela5Continuar]);

  useEffect(() => {
    if (step === STEP_TELA6) setRecommendationsAcknowledged(false);
  }, [step]);

  useEffect(() => {
    if (step === STEP_TELA7 || step === STEP_CONFERIR) {
      setSimulationSummaryOpen(true);
    } else if (step === STEP_RESULT || step === STEP_DISCOUNT) {
      setSimulationSummaryOpen(false);
    }
  }, [step]);

  const updateForm = useCallback((updates: Partial<PackagingFormData>) => {
    setForm((prev) => ({ ...prev, ...updates }));
  }, []);

  const handleAssemblyOptionClick = useCallback(
    (value: AssemblyType) => {
      updateForm({ assembly: value });
      setTimeout(() => scrollToSection(sectionAssemblyContinueRef), 280);
    },
    [scrollToSection, updateForm],
  );

  useEffect(() => {
    if (
      (step !== STEP_RESULT &&
        step !== STEP_DISCOUNT &&
        step !== STEP_CONFERIR) ||
      !form.template
    ) {
      return;
    }
    const pt = packTypeForTemplateName(form.template ?? "");
    if (pt === "pallet" && form.assembly != null) {
      updateForm({ assembly: null });
    }
  }, [step, form.template, form.assembly, updateForm]);

  const goToStep = useCallback((next: number) => {
    setStep(next);
  }, []);

  /** Footer link only after the user has reached that checkpoint’s first screen. */
  const isProgressStepUnlocked = useCallback(
    (progressId: number) => checkProgressUnlocked(step, progressId),
    [step],
  );

  /** Maps footer progress checkpoint → first wizard screen in that group. */
  const handleProgressStepNavigate = useCallback(
    (progressId: number) => {
      if (!isProgressStepUnlocked(progressId)) return;
      const meta = PROGRESS_STEPS.find((s) => s.id === progressId);
      if (!meta) return;
      if ("comingSoon" in meta && meta.comingSoon) return;

      let nextStep: number;
      switch (progressId) {
        case 1:
          setTela1SubStep(TELA1_SUB_PACK);
          nextStep = STEP_TELA1;
          break;
        case 2:
          nextStep = STEP_TELA2;
          break;
        case 3:
          nextStep = ASK_CONTENT_PROD_TYPES.includes(form.prodType ?? 0)
            ? STEP_TELA3
            : STEP_TELA4;
          break;
        case 4:
          nextStep = STEP_TELA7;
          break;
        case 5:
          nextStep = STEP_RESULT;
          break;
        case 6:
          nextStep = STEP_DISCOUNT;
          break;
        case 7:
          nextStep = STEP_CONFERIR;
          break;
        default:
          return;
      }
      setStep(nextStep);
      window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
    },
    [form.prodType, isProgressStepUnlocked],
  );

  const goBack = useCallback(() => {
    setStep((s) => {
      if (
        s === STEP_TELA4 &&
        !ASK_CONTENT_PROD_TYPES.includes(form.prodType ?? 0)
      ) {
        return STEP_TELA2;
      }
      return Math.max(STEP_TELA1, s - 1);
    });
  }, [form.prodType]);

  const handleConferirSubmit = useCallback(async () => {
    if (customerClarity == null) return;
    if (
      typeof conferirQty !== "number" ||
      !Number.isInteger(conferirQty) ||
      conferirQty < 1
    ) {
      return;
    }
    const payload = buildCalculadoraSubmissionPayload({
      form,
      chosenRow: chosenTemplateRow,
      appliedDiscounts,
      customerClarity,
      qty: conferirQty,
      message: conferirMessage,
      prodName: conferirProdName,
      prodCode: conferirProdCode,
    });
    if (!payload) {
      toast({
        title: "Não foi possível enviar",
        description: "Verifique o preço do modelo e tente novamente.",
        status: "warning",
        duration: 5000,
      });
      return;
    }

    try {
      const res = await fetch("/api/calculadora/submit-quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ payload }),
      });
      if (!res.ok) {
        const errBody = (await res.json().catch(() => null)) as unknown;
        const desc =
          getStrapiErrorDescription(errBody) ??
          `Erro ${String(res.status)} ao salvar a cotação.`;
        toast({
          title: "Não foi possível enviar",
          description: desc,
          status: "error",
          duration: 7000,
        });
        return;
      }
    } catch {
      toast({
        title: "Não foi possível enviar",
        description: "Falha de rede. Tente novamente.",
        status: "error",
        duration: 7000,
      });
      return;
    }

    lastSubmissionRef.current = payload;

    setStep(STEP_TELA1);
    setTela1SubStep(TELA1_SUB_PACK);
    setForm(hydrateInitialFormFromCustomerStorage());
    setElegibleTemplates([]);
    setDiscountEnabledByName({});
    setSimulationSummaryOpen(true);
    setRecommendationsAcknowledged(false);
    setIsCalculatingPrices(false);
    setPricingModalNames([]);
    setPricingModalActiveIndex(0);
    setSuccessModalOpen(true);
  }, [
    customerClarity,
    conferirQty,
    conferirProdName,
    conferirProdCode,
    conferirMessage,
    form,
    chosenTemplateRow,
    appliedDiscounts,
    toast,
  ]);

  const handleChooseResultModel = useCallback(
    (payload: { templateKey: string; label: string }) => {
      const isPalletModel =
        packTypeForTemplateName(payload.templateKey) === "pallet";
      updateForm({
        template: payload.templateKey,
        assembly: null,
      });
      if (!isPalletModel) {
        setTimeout(() => scrollToSection(sectionAssemblyRef), 280);
      }
    },
    [scrollToSection, updateForm],
  );

  const handlePackTypeChange = useCallback((v: string) => {
    const packType = v as PackType;
    updateForm({ packType });
    if (packType === "pallet") {
      updateForm({ prodType: DEFAULT_PRODTYPE_FOR_PALLET });
      setTela1SubStep((s) => Math.max(s, TELA1_SUB_EXPORT));
      scrollToSection(sectionIsExportRef);
    } else {
      setTela1SubStep((s) => Math.max(s, TELA1_SUB_PROD));
      scrollToSection(sectionProdTypeRef);
    }
  }, [updateForm, scrollToSection]);

  const handleProdTypeChange = useCallback((value: number) => {
    updateForm({ prodType: value });
    setTela1SubStep((s) => Math.max(s, TELA1_SUB_EXPORT));
    scrollToSection(sectionIsExportRef);
  }, [updateForm, scrollToSection]);

  const handleIsExportChange = useCallback((value: boolean) => {
    updateForm({ isExport: value });
    setTela1SubStep((s) => Math.max(s, TELA1_SUB_WEIGHT));
    scrollToSection(sectionWeightRef);
  }, [updateForm, scrollToSection]);

  const handleMeasuresOfChange = useCallback((value: MeasuresOf) => {
    updateForm({ measuresOf: value });
    scrollToSection(sectionMeasuresRef);
  }, [updateForm, scrollToSection]);

  const handleTela1Continue = (e: FormEvent) => {
    e.preventDefault();
    const hasProdType = isPallet || (form.prodType && form.prodType > 0);
    if (
      !form.packType ||
      !hasProdType ||
      form.isExport === undefined ||
      !form.weight
    ) {
      toast({
        title: "Preencha todos os campos",
        status: "warning",
        duration: 3000,
      });
      return;
    }
    if (isPallet) updateForm({ measuresOf: "internal" });
    goToStep(STEP_TELA2);
  };

  const handleTela2NameEmailSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!isContactPreferencesStepComplete(form, validateEmail)) {
      toast({
        title: "Preencha os campos de contato",
        description: "Escolha um canal e preencha os dados exibidos.",
        status: "warning",
        duration: 4000,
      });
      return;
    }
    const ch = form.contactChannel!;
    const name = (form.customerName || "").trim();
    const emailTrim = (form.customerEmail || "").trim();
    const phoneTrim = (form.customerPhone || "").trim();
    mergeCalculadoraCustomerStorage({
      customerName: name,
      contactChannel: ch,
      customerEmail: emailTrim,
      customerPhone: phoneTrim,
    });
    updateForm({
      customerName: name,
      customerEmail: emailTrim,
      customerPhone: phoneTrim,
    });
    const prodType = form.prodType ?? 0;
    if (FRACTIONED_PROD_TYPES.includes(prodType)) {
      updateForm({ isUnitizedContent: false, measuresOf: "internal" });
      goToStep(STEP_TELA4);
    } else if (ASK_CONTENT_PROD_TYPES.includes(prodType)) {
      goToStep(STEP_TELA3);
    } else {
      updateForm({ isUnitizedContent: true });
      goToStep(STEP_TELA4);
    }
  };

  const advanceFromTela5Check = useCallback(
    (weightVal: number, lengthVal: number, widthVal: number, unitVal: "mm" | "cm") => {
      const lengthM = toMeters(lengthVal, unitVal);
      const widthM = toMeters(widthVal, unitVal);
      const skipCondition =
        weightVal < WEIGHT_THRESHOLD_KG ||
        (lengthM < LENGTH_THRESHOLD_M && widthM < WIDTH_THRESHOLD_M);
      if (skipCondition) {
        updateForm({ isDistributedWeight: null });
        goToStep(STEP_TELA7);
      } else {
        goToStep(STEP_TELA5);
      }
    },
    [updateForm, goToStep]
  );

  const handleTela3Continue = (e: FormEvent) => {
    e.preventDefault();
    const measuresOfVal = isPallet ? "internal" : form.measuresOf;
    if (!measuresOfVal) {
      toast({
        title: "Selecione se as medidas são internas ou do produto",
        status: "warning",
        duration: 3000,
      });
      return;
    }
    const unit = (form.unit || "mm") as "mm" | "cm";
    const length = Number(form.length) || 0;
    const width = Number(form.width) || 0;
    const height = form.packType === "pallet" ? 0 : (Number(form.height) || 0);
    if (measuresOfVal === "product") {
      const clearanceVal = Number(form.clearance) ?? 0;
      if (!clearanceVal) {
        toast({
          title: "Preencha o campo Folga",
          status: "warning",
          duration: 3000,
        });
        return;
      }
    }
    if (!length || !width || (form.packType !== "pallet" && !height)) {
      toast({
        title: "Preencha todas as medidas",
        status: "warning",
        duration: 3000,
      });
      return;
    }
    updateForm({ length, width, height: form.packType === "pallet" ? undefined : height });
    const weightVal = Number(form.weight) || 0;
    if (form.isUnitizedContent === true) {
      advanceFromTela5Check(weightVal, length, width, unit);
    } else {
      goToStep(STEP_TELA7);
    }
  };

  const handleTela3ContentChoice = (unitized: boolean) => {
    updateForm({ isUnitizedContent: unitized });
    if (unitized && !isPallet) {
      updateForm({ measuresOf: undefined });
    } else {
      updateForm({ measuresOf: "internal" });
    }
    goToStep(STEP_TELA4);
  };

  const handleTela5Choice = (distributed: boolean) => {
    updateForm({ isDistributedWeight: distributed });
  };

  const handleTela5Continue = () => {
    if (form.isDistributedWeight === true) {
      goToStep(STEP_TELA7);
    } else {
      goToStep(STEP_TELA6);
    }
  };

  const handleTela6Continue = () => {
    goToStep(STEP_TELA7);
  };

  const handleTela7Submit = async (e: FormEvent) => {
    e.preventDefault();
    const cnpj = (form.customerCnpj || "").trim();
    const email = (form.customerEmail || "").trim();
    if (!cnpj || !form.customerName) {
      toast({
        title: "Preencha todos os campos de contato",
        status: "warning",
        duration: 3000,
      });
      return;
    }
    if (!isContactPreferencesStepComplete(form, validateEmail)) {
      toast({
        title: "Preencha os campos de contato",
        description: "Revise nome e os canais escolhidos na etapa anterior.",
        status: "warning",
        duration: 4000,
      });
      return;
    }
    if (!validateCnpj(cnpj)) {
      toast({
        title: "CNPJ inválido",
        status: "error",
        duration: 3000,
      });
      return;
    }
    const ch = form.contactChannel!;
    const emailNfeTrim = (form.emailNfe || "").trim();
    if (!emailNfeTrim || !validateEmail(emailNfeTrim)) {
      toast({
        title: "E-mail para NF-e inválido",
        description: "Informe um e-mail válido para envio da nota fiscal.",
        status: "error",
        duration: 4000,
      });
      return;
    }
    const phoneTrim = (form.customerPhone || "").trim();
    mergeCalculadoraCustomerStorage({
      customerName: form.customerName || "",
      customerCnpj: cnpj,
      emailNfe: emailNfeTrim,
      contactChannel: ch,
      customerEmail: email,
      customerPhone: phoneTrim,
    });
    const fullForm: PackagingFormData = {
      packType: form.packType!,
      prodType: form.prodType!,
      isExport: form.isExport!,
      weight: Number(form.weight) || 0,
      measuresOf: form.measuresOf!,
      unit: form.unit!,
      length: Number(form.length) || 0,
      width: Number(form.width) || 0,
      height: form.packType === "pallet" ? undefined : (Number(form.height) || 0),
      clearance: form.measuresOf === "product" ? Number(form.clearance) || 0 : undefined,
      isUnitizedContent: form.isUnitizedContent,
      isDistributedWeight: form.isDistributedWeight ?? null,
      customerCnpj: cnpj,
      emailNfe: emailNfeTrim,
      customerName: form.customerName || "",
      customerEmail: email,
      customerPhone: phoneTrim,
      contactChannel: ch,
      template: undefined,
      assembly: undefined,
    };
    const templateNames = getElegibleTemplates(fullForm, boxTemplatesList);
    const initial: ElegibleTemplateResult[] = templateNames.map((n) => ({
      name: n,
    }));
    setElegibleTemplates(initial);
    setSimulationSummaryOpen(false);
    goToStep(STEP_RESULT);

    if (templateNames.length === 0) return;

    setPricingModalNames([...templateNames]);
    setPricingModalActiveIndex(0);
    setIsCalculatingPrices(true);
    const internalDims = resolveInternalPackageDimensions(fullForm);
    if (!internalDims) {
      setIsCalculatingPrices(false);
      setPricingModalNames([]);
      return;
    }
    const unit = fullForm.unit || "mm";
    const toCm = (v: number) => (unit === "mm" ? v / 10 : v);
    const compCm = toCm(internalDims.length);
    const largCm = toCm(internalDims.width);
    const altCm =
      fullForm.packType !== "pallet" && internalDims.height > 0
        ? toCm(internalDims.height)
        : 0;
    const cnpjDigits = cnpj.replace(/\D/g, "");

    const fetchPrice = async (modelo: string) => {
      try {
        const body: Record<string, string | boolean | undefined> = {
          modelo,
          comprimento: String(compCm),
          largura: String(largCm),
          empresa: cnpjDigits,
          pesoProd: String(fullForm.weight),
          export: fullForm.isExport,
        };
        if (fullForm.packType !== "pallet" && altCm > 0) {
          body.altura = String(altCm);
        }
        const res = await fetch("/api/calculadora/calcular", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        const data = await res.json();
        if (data.error) {
          return { name: modelo, priceResult: { error: data.error } };
        }
        const info = data.info ?? data;
        return {
          name: modelo,
          priceResult: { info },
        };
      } catch (err) {
        return {
          name: modelo,
          priceResult: {
            error: (err as Error)?.message || "Erro ao calcular",
          },
        };
      }
    };

    const results: ElegibleTemplateResult[] = [];
    for (let i = 0; i < templateNames.length; i++) {
      setPricingModalActiveIndex(i);
      results.push(await fetchPrice(templateNames[i]));
    }
    setElegibleTemplates(results);
    setIsCalculatingPrices(false);
    setPricingModalNames([]);
  };

  const dimensionsIntro = () => {
    const pt = form.packType;
    if (pt === "pallet") return "Informe as medidas que você precisa que o palete tenha.";
    if (pt === "box") return "Informe as medidas finais que você precisa que tenha dentro da Caixa.";
    if (pt === "crate") return "Informe as medidas finais que você precisa que tenha dentro do Engradado.";
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
          <CalculadoraPageChrome
            headingColor={headingColor}
            colorMode={colorMode}
            onToggleColorMode={toggleColorMode}
          />

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
                <TypewriterBlock
                  blockVisible={step === STEP_TELA1}
                  resetKey={tela1TypewriterSequenceKey}
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
                          textAlign="left"
                          w="100%"
                        >
                          <TypewriterCardText
                            as="span"
                            lineIndex={TELA1_TW_PACK}
                            text="O que você quer calcular hoje?"
                            isVisible
                          />
                        </FormLabel>
                        <SimpleGrid
                          columns={{ base: 1, md: 2, lg: 4 }}
                          spacing={{ base: 4, md: 5 }}
                          w="100%"
                          justifyItems="center"
                        >
                          {PACK_TYPE_OPTIONS.map((opt) => {
                            const isActive = form.packType === opt.value;
                            const isDimmed = form.packType && !isActive;
                            return (
                              <Box
                                key={opt.value}
                                as="button"
                                type="button"
                                onClick={() => handlePackTypeChange(opt.value)}
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
                                bg={useColorModeValue("white", "gray.700")}
                                _hover={{ borderColor: "blue.400" }}
                                textAlign="center"
                                opacity={isDimmed ? 0.6 : 1}
                                filter={isDimmed ? "grayscale(100%)" : "none"}
                              >
                                <Image
                                  src={PACK_TYPE_IMAGES[opt.value]}
                                  alt={opt.label}
                                  borderRadius="md"
                                  objectFit="contain"
                                  w="100%"
                                  h="140px"
                                  mb={2}
                                  bg="white"
                                />
                                <Text
                                  fontSize="md"
                                  fontWeight={isActive ? "extrabold" : "semibold"}
                                >
                                  {opt.label}
                                </Text>
                              </Box>
                            );
                          })}
                        </SimpleGrid>
                      </FormControl>

                      <Collapse
                        in={showProdType && !isPallet && tela1SubStep >= TELA1_SUB_PROD}
                        unmountOnExit
                      >
                        <FormControl as="fieldset" isRequired w="full" ref={sectionProdTypeRef}>
                          <FormLabel
                            as="legend"
                            fontSize="lg"
                            fontWeight="semibold"
                            color={headingColor}
                            my={3}
                            textAlign="left"
                            w="100%"
                            pt={3}
                          >
                            <TypewriterCardText
                              as="span"
                              lineIndex={TELA1_TW_PROD}
                              text="Que tipo de produto você precisa embalar?"
                              isVisible={showProdType && !isPallet && tela1SubStep >= TELA1_SUB_PROD}
                            />
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
                              {Object.entries(PRODUCT_TYPE_LABELS).map(
                                ([key, label]) => {
                                  const id = parseInt(key, 10);
                                  const isActive = form.prodType === id;
                                  const imgSrc = PRODUCT_TYPE_IMAGES[id];
                                  const isDimmed = form.prodType && !isActive;
                                  return (
                                    <Box
                                      key={id}
                                      as="button"
                                      type="button"
                                      onClick={() => handleProdTypeChange(id)}
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

                      <Collapse in={tela1SubStep >= TELA1_SUB_EXPORT} unmountOnExit>
                        <FormControl as="fieldset" isRequired w="full" ref={sectionIsExportRef}>
                          <FormLabel
                            as="legend"
                            fontSize="lg"
                            fontWeight="semibold"
                            color={headingColor}
                            mb={3}
                          >
                            <TypewriterCardText
                              as="span"
                              lineIndex={
                                isPallet
                                  ? TELA1_TW_EXPORT_PALLET
                                  : TELA1_TW_EXPORT_BOX
                              }
                              text="Para onde vai a embalagem? É exportação?"
                              isVisible={tela1SubStep >= TELA1_SUB_EXPORT}
                            />
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
                            ].map((option) => {
                              const isActive = form.isExport === option.value;
                              const hasSelection = form.isExport !== undefined;
                              const isDimmed = hasSelection && !isActive;
                              return (
                                <Box
                                  key={String(option.value)}
                                  as="button"
                                  type="button"
                                  onClick={() => handleIsExportChange(option.value)}
                                  borderWidth={isActive ? "2px" : "1px"}
                                  borderColor={isActive ? "blue.400" : borderColor}
                                  borderRadius="lg"
                                  p={3}
                                  boxShadow="md"
                                  w="100%"
                                  maxW="260px"
                                  minH="220px"
                                  bg={useColorModeValue("white", "gray.700")}
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
                            })}
                          </SimpleGrid>
                        </FormControl>
                      </Collapse>

                      <Collapse in={tela1SubStep >= TELA1_SUB_WEIGHT} unmountOnExit>
                        <FormControl as="fieldset" isRequired w="full" ref={sectionWeightRef}>
                          <FormLabel
                            as="legend"
                            fontSize="lg"
                            fontWeight="semibold"
                            color={headingColor}
                            mb={3}
                            w="100%"
                          >
                            <TypewriterCardText
                              as="span"
                              lineIndex={
                                isPallet
                                  ? TELA1_TW_WEIGHT_PALLET
                                  : TELA1_TW_WEIGHT_BOX
                              }
                              text="Qual é o peso aproximado do que você precisa embalar?"
                              isVisible={tela1SubStep >= TELA1_SUB_WEIGHT}
                            />
                          </FormLabel>
                          <SimpleGrid
                            columns={{ base: 1, sm: 2, md: 3 }}
                            spacing={{ base: 3, md: 4 }}
                            w="100%"
                          >
                            {WEIGHT_RANGE_OPTIONS.map((opt) => {
                              const isActive = form.weight === opt.value;
                              const hasSelection = form.weight && form.weight > 0;
                              const isDimmed = hasSelection && !isActive;
                              return (
                                <Box
                                  key={opt.value}
                                  as="button"
                                  type="button"
                                  onClick={() => updateForm({ weight: opt.value })}
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
                            })}
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
                </TypewriterBlock>
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
                <TypewriterBlock
                  blockVisible={step === STEP_TELA2}
                  resetKey={TW_SEQ_TELA2}
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
                    <TypewriterCardText
                      lineIndex={0}
                      text="Antes de seguir com a simulação, o que você prefere?"
                      fontSize="lg"
                      fontWeight="semibold"
                      color={headingColor}
                    />
                    <FormControl>
                      <FormLabel color={headingColor} fontWeight="semibold">
                        É assim que eu gosto que falem comigo:
                      </FormLabel>
                      <RadioGroup
                        value={form.contactChannel ?? ""}
                        onChange={(v) => {
                          updateForm({ contactChannel: v as ContactChannel });
                        }}
                      >
                        <VStack align="stretch" spacing={3}>
                          {CONTACT_CHANNEL_OPTIONS.map((opt) => (
                            <Radio
                              key={opt.value}
                              value={opt.value}
                              colorScheme="blue"
                              borderColor={borderColor}
                            >
                              <Text
                                as="span"
                                fontSize="sm"
                                color={textColor}
                                lineHeight="tall"
                              >
                                {opt.label}
                              </Text>
                            </Radio>
                          ))}
                        </VStack>
                      </RadioGroup>
                    </FormControl>
                    <Collapse in={form.contactChannel != null} animateOpacity>
                      {form.contactChannel != null ? (
                        <SimpleGrid
                          columns={{ base: 1, md: 3 }}
                          spacing={4}
                          w="100%"
                        >
                          <FormControl isRequired>
                            <FormLabel color={headingColor}>Nome</FormLabel>
                            <Input
                              value={form.customerName || ""}
                              onChange={(e) =>
                                updateForm({ customerName: e.target.value })
                              }
                              placeholder="Seu nome"
                              size="lg"
                              borderColor={borderColor}
                              minH="44px"
                              autoComplete="name"
                            />
                          </FormControl>
                          <FormControl
                            isRequired={contactChannelShowsEmail(
                              form.contactChannel,
                            )}
                          >
                            <FormLabel color={headingColor}>
                              E-mail
                              {!contactChannelShowsEmail(form.contactChannel)
                                ? " (opcional)"
                                : ""}
                            </FormLabel>
                            <Input
                              type="email"
                              value={form.customerEmail || ""}
                              onChange={(e) =>
                                updateForm({ customerEmail: e.target.value })
                              }
                              placeholder="seu@email.com"
                              size="lg"
                              borderColor={borderColor}
                              minH="44px"
                              autoComplete="email"
                              color={textColor}
                            />
                          </FormControl>
                          <FormControl
                            isRequired={contactChannelShowsPhone(
                              form.contactChannel,
                            )}
                          >
                            <FormLabel color={headingColor}>
                              Telefone
                              {!contactChannelShowsPhone(form.contactChannel)
                                ? " (opcional)"
                                : ""}
                            </FormLabel>
                            <Input
                              type="tel"
                              inputMode="tel"
                              value={form.customerPhone || ""}
                              onChange={(e) =>
                                updateForm({ customerPhone: e.target.value })
                              }
                              placeholder="(00) 00000-0000"
                              size="lg"
                              borderColor={borderColor}
                              minH="44px"
                              autoComplete="tel"
                              color={textColor}
                            />
                          </FormControl>
                        </SimpleGrid>
                      ) : null}
                    </Collapse>
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
                    isDisabled={!contactFormComplete}
                  >
                    Continuar
                  </Button>
                </Flex>
                </TypewriterBlock>
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
                <TypewriterBlock
                  blockVisible={step === STEP_TELA3}
                  resetKey={TW_SEQ_TELA3}
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
                    ).map((opt, optIndex) => {
                      const isActive = form.isUnitizedContent === opt.value;
                      const hasSelection = form.isUnitizedContent !== undefined;
                      const isDimmed = hasSelection && !isActive;
                      return (
                        <Box
                          key={String(opt.value)}
                          as="button"
                          type="button"
                          onClick={() =>
                            updateForm({ isUnitizedContent: opt.value })
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
                          <TypewriterCardText
                            lineIndex={optIndex}
                            text={opt.label}
                            fontSize="sm"
                            fontWeight="semibold"
                            p={2}
                          />
                        </Box>
                      );
                    })}
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
                      handleTela3ContentChoice(form.isUnitizedContent)
                    }
                  >
                    Continuar
                  </Button>
                </Flex>
                </TypewriterBlock>
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
                <TypewriterBlock
                  blockVisible={step === STEP_TELA4}
                  resetKey={tela4MeasuresBlockResetKey}
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
                    <TypewriterCardText
                      lineIndex={TELA4_TW_U_TRUE_HEAD}
                      text="Quais medidas você tem?"
                      isVisible
                      fontSize="lg"
                      fontWeight="semibold"
                      color={headingColor}
                      mb={4}
                    />
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
                      ).map((opt, measureOptIndex) => {
                        const isActive = form.measuresOf === opt.value;
                        const hasSelection = !!form.measuresOf;
                        const isDimmed = hasSelection && !isActive;
                        return (
                          <Box
                            key={opt.value}
                            as="button"
                            type="button"
                            onClick={() => handleMeasuresOfChange(opt.value)}
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
                            <TypewriterCardText
                              lineIndex={
                                TELA4_TW_U_TRUE_OPT0 + measureOptIndex
                              }
                              text={opt.label}
                              fontSize="sm"
                              fontWeight="semibold"
                              p={2}
                            />
                          </Box>
                        );
                      })}
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
                    mb={4}
                  >
                    <TypewriterCardText
                      lineIndex={TELA4_TW_U_FALSE_HEAD}
                      fontSize="lg"
                      fontWeight="semibold"
                      color={headingColor}
                      mb={4}
                      text="Informe as medidas internas da embalagem"
                    />
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
                        <TypewriterCardText
                          lineIndex={TELA4_TW_U_FALSE_PARA}
                          text="As medidas que você informar aqui serão exatamente as
                        medidas que a embalagem terá por dentro, então, considere
                        já a medida dos seus produtos e da folga que você quer
                        que tenha."
                          fontSize="sm"
                          color={textColor}
                          fontWeight="semibold"
                          display="block"
                          mb={2}
                        />
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
                  unmountOnExit
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
                        <TypewriterCardText
                          lineIndex={tela4DimensionsIntroLineIndex}
                          fontSize="lg"
                          w="100%"
                          fontWeight="semibold"
                          color={headingColor}
                          text={dimensionsIntro()}
                        />

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
                                  updateForm({
                                    unit: "mm",
                                    clearance:
                                      form.measuresOf === "product"
                                        ? undefined
                                        : form.clearance,
                                  })
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
                                  updateForm({
                                    unit: "cm",
                                    clearance:
                                      form.measuresOf === "product"
                                        ? undefined
                                        : form.clearance,
                                  })
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
                              onChange={(_, v) =>
                                updateForm({
                                  length: v === undefined || Number.isNaN(v)
                                    ? undefined
                                    : v,
                                })
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
                              onChange={(_, v) =>
                                updateForm({
                                  width: v === undefined || Number.isNaN(v)
                                    ? undefined
                                    : v,
                                })
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
                                onChange={(_, v) =>
                                  updateForm({
                                    height: v === undefined || Number.isNaN(v)
                                      ? undefined
                                      : v,
                                  })
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

                    <Collapse in={showClearance} unmountOnExit>
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
                            w="100%"
                          >
                            Quanto de folga você quer que tenha entre o produto e a embalagem?
                          </FormLabel>
                          <SimpleGrid
                            columns={{ base: 1, sm: 2, md: 3, lg: 5 }}
                            spacing={{ base: 3, md: 4 }}
                            w="100%"
                          >
                            {(
                              form.unit === "cm"
                                ? CLEARANCE_OPTIONS_CM
                                : CLEARANCE_OPTIONS_MM
                            ).map((opt, clearanceIndex) => {
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
                                    updateForm({ clearance: opt.value })
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
                                    <TypewriterCardText
                                      lineIndex={
                                        tela4ClearanceLineBase + clearanceIndex
                                      }
                                      text={opt.label}
                                      fontSize="sm"
                                      fontWeight={
                                        isActive ? "extrabold" : "semibold"
                                      }
                                    />
                                    <Text fontSize="xs" color={textColor}>
                                      {opt.suffix}
                                    </Text>
                                  </VStack>
                                </Box>
                              );
                            })}
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
                </TypewriterBlock>
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
                <TypewriterBlock
                  blockVisible={step === STEP_TELA5}
                  resetKey={TW_SEQ_TELA5}
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
                  <VStack spacing={{ base: 6, md: 8 }} w="100%">
                  <TypewriterCardText
                      lineIndex={0}
                      text="O peso do produto será bem distribuído sobre a base da embalagem?"
                      fontSize="lg"
                      fontWeight="semibold"
                      color={headingColor}
                      w="100%"
                    />
                    <SimpleGrid
                      columns={{ base: 1, md: 2 }}
                      spacing={{ base: 4, md: 6 }}
                      w="100%"
                      justifyItems="center"
                    >
                      {[
                        {
                          value: false as const,
                          label: "",
                          suffix: "",
                          img: "",
                        },
                        {
                          value: true as const,
                          label: "Sim. O peso vai ficar distribuído sobre a base.",
                          suffix: "Exemplo: Uma mesa deitada distribui seu peso ao longo da base.",
                          img: "/img/weight-evenly-distributed.jpg",
                        },
                        {
                          value: false as const,
                          label: "",
                          suffix: "",
                          img: "",
                        },
                        {
                          value: false as const,
                          label:
                            "Não. O peso vai se concentrar em alguns pontos.",
                          suffix:
                            "Exemplo: Uma mesa em pé concentra seu peso em 4 pontos da base.",
                          img: "/img/weight-concentrated.jpg",
                        },
                      ].map((opt, lineIndex) => {
                        if(!opt.label) return null;
                        const isActive = form.isDistributedWeight === opt.value;
                        const hasSelection =
                          form.isDistributedWeight !== undefined;
                        const isDimmed = hasSelection && !isActive;
                        return (
                          <Box
                            key={String(opt.value)}
                            as="button"
                            type="button"
                            onClick={() => updateForm({ isDistributedWeight: opt.value })}
                            borderRadius="xl"
                            borderWidth={isActive ? "2px" : "1px"}
                            borderColor={isActive ? "blue.400" : borderColor}
                            p="15px"
                            w="fit-content"
                            bg={bgCard}
                            _hover={{ borderColor: "blue.400" }}
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
                              <TypewriterCardText
                                lineIndex={lineIndex}
                                text={opt.label}
                                fontSize="sm"
                                fontWeight="semibold"
                                w="100%"
                              />
                              <TypewriterCardText
                                lineIndex={lineIndex+1}
                                fontSize="xs"
                                color={textColor}
                                text={opt.suffix}
                                w="100%"
                              />
                            </VStack>
                          </Box>
                        );
                      })}
                    </SimpleGrid>
                  </VStack>
                </MotionBox>
                <Flex
                  ref={sectionTela5ContinuarRef}
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
                    isDisabled={!showTela5Continuar}
                    onClick={handleTela5Continue}
                  >
                    Continuar
                  </Button>
                </Flex>
                </TypewriterBlock>
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
                  <TypewriterBlock
                    blockVisible={step === STEP_TELA6}
                    resetKey={TW_SEQ_TELA6}
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
                          <TypewriterCardText
                            lineIndex={TELA6_TW_TITLE}
                            text="Nossas Recomendações"
                            fontSize="xl"
                            fontWeight="semibold"
                            color={headingColor}
                            mb={4}
                          />
                          <Box as="ul" pl={6}>
                            <TypewriterCardText
                              as="li"
                              lineIndex={TELA6_TW_BULLET_1}
                              text="Recomendamos prender o produto na base"
                              mb={2}
                              fontSize="lg"
                              display="list-item"
                            />
                            <TypewriterCardText
                              as="li"
                              lineIndex={TELA6_TW_BULLET_2}
                              text="Considere a inclusão de tábuas avulsas para calçar o produto na base"
                              mb={2}
                              fontSize="lg"
                              display="list-item"
                            />
                          </Box>
                        </Box>
                      </Flex>
                      {!recommendationsAcknowledged ? (
                        <Button
                          colorScheme="blue"
                          size="lg"
                          minH="44px"
                          onClick={() => setRecommendationsAcknowledged(true)}
                        >
                          Entendi
                        </Button>
                      ) : null}
                    </VStack>
                  </TypewriterBlock>
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

            {(step === STEP_TELA7 ||
              step === STEP_RESULT ||
              step === STEP_DISCOUNT ||
              step === STEP_CONFERIR) && (
              <MotionBox
                key={
                  step === STEP_TELA7
                    ? "tela7-group"
                    : step === STEP_RESULT
                      ? "result-group"
                      : step === STEP_DISCOUNT
                        ? "discount-group"
                        : "conferir-group"
                }
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
                w="100%"
              >
                <VStack spacing={6} w="100%">
                  {step === STEP_TELA7 && (
                    <SimulationSummaryPanel
                      simulationSummaryOpen={simulationSummaryOpen}
                      onToggleOpen={() =>
                        setSimulationSummaryOpen((open) => !open)
                      }
                      items={simulationSummaryItems}
                      onEditItem={handleEditSummaryItem}
                      bgCard={bgCard}
                      borderColor={borderColor}
                      headingColor={headingColor}
                      textColor={textColor}
                      appliedDiscounts={appliedDiscounts}
                    />
                  )}

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
                        <TypewriterBlock
                          blockVisible={step === STEP_TELA7}
                          resetKey={TW_SEQ_TELA7}
                        >
                        <VStack align="center" spacing={{ base: 6, md: 8 }} w="100%">
                          <TypewriterCardText
                            lineIndex={TELA7_TW_INTRO}
                            fontSize="lg"
                            color={headingColor}
                            text="A Ribermax vende somente para empresas. Para calcular sua embalagem, informe seu CNPJ."
                            w="100%"
                          />

                          <SimpleGrid
                            columns={{ base: 1, md: 2 }}
                            spacing={4}
                            w="100%"
                            alignItems="start"
                          >
                            <FormControl isRequired>
                              <FormLabel htmlFor="calculadora-cnpj-input">
                                <TypewriterCardText
                                  as="span"
                                  lineIndex={TELA7_TW_CNPJ_LABEL}
                                  text="CNPJ"
                                />
                              </FormLabel>
                              <Input
                                id="calculadora-cnpj-input"
                                value={form.customerCnpj || ""}
                                onChange={(e) =>
                                  updateForm({
                                    customerCnpj: formatCnpjMaskInput(
                                      e.target.value,
                                    ),
                                  })
                                }
                                placeholder="00.000.000/0000-00"
                                inputMode="numeric"
                                autoComplete="off"
                                maxLength={18}
                                size="lg"
                                borderColor={borderColor}
                                minH="44px"
                              />
                            </FormControl>
                            <FormControl isRequired>
                              <FormLabel
                                htmlFor="calculadora-email-nfe-input"
                                color={headingColor}
                              >
                                E-mail para NF-e
                              </FormLabel>
                              <Input
                                id="calculadora-email-nfe-input"
                                type="email"
                                value={form.emailNfe || ""}
                                onChange={(e) =>
                                  updateForm({ emailNfe: e.target.value })
                                }
                                placeholder="nf-e@empresa.com.br"
                                autoComplete="email"
                                size="lg"
                                borderColor={borderColor}
                                minH="44px"
                                color={textColor}
                              />
                            </FormControl>
                          </SimpleGrid>
                        </VStack>
                        </TypewriterBlock>
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
                            !(form.customerCnpj || "").trim() ||
                            !tela7NfeFieldsValid ||
                            !contactFormComplete
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
                      <TypewriterBlock
                        blockVisible={step === STEP_RESULT}
                        resetKey={resultTypewriterSequenceKey}
                      >
                      <VStack align="stretch" spacing={6} w="100%">
                        {isCalculatingPrices ? null : elegibleTemplates.length === 0 ? (
                          <Text fontSize="sm" color={textColor} textAlign="center">
                            Nenhum modelo viável para as características informadas.
                          </Text>
                        ) : (
                          <Fragment>
                            <Heading
                              size="md"
                              color={headingColor}
                              textAlign="center"
                            >
                              Modelos viáveis para o seu caso
                            </Heading>
                            <SimpleGrid
                              ref={sectionResultModelsRef}
                              columns={1}
                              spacing={4}
                              w="100%"
                            >
                              {visibleResultTemplates.map((t, cardIndex) => (
                                <ResultTemplateCard
                                  key={t.name}
                                  variant="listing"
                                  row={t}
                                  cardIndex={cardIndex}
                                  visibleCount={visibleResultTemplates.length}
                                  recommendedTemplateName={recommendedTemplateName}
                                  form={form}
                                  onChooseModel={handleChooseResultModel}
                                  theme={{
                                    bgCard,
                                    borderColor,
                                    headingColor,
                                    textColor,
                                    recommendedCardBorderColor,
                                    resultRankCaptionBgOther,
                                    resultListingPriceColor,
                                  }}
                                />
                              ))}

                            </SimpleGrid>
                            <Box w="100%" mt={6}>
                              <SimulationSummaryPanel
                                simulationSummaryOpen={simulationSummaryOpen}
                                onToggleOpen={() =>
                                  setSimulationSummaryOpen((open) => !open)
                                }
                                items={simulationSummaryItems}
                                onEditItem={handleEditSummaryItem}
                                bgCard={bgCard}
                                borderColor={borderColor}
                                headingColor={headingColor}
                                textColor={textColor}
                                appliedDiscounts={appliedDiscounts}
                              />
                            </Box>
                            <Collapse
                              in={showAssemblySection}
                              animateOpacity
                              unmountOnExit
                            >
                              <MotionBox
                                ref={sectionAssemblyRef}
                                key="assembly-choice"
                                initial={{ opacity: 0, y: 16 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 16 }}
                                transition={{ duration: 0.28 }}
                                w="100%"
                                mt={6}
                                bg={bgCard}
                                borderRadius="xl"
                                borderWidth="1px"
                                borderColor={borderColor}
                                p={{ base: 5, md: 8 }}
                                shadow="md"
                              >
                                <VStack align="stretch" spacing={5} w="100%">
                                  <Heading
                                    size="md"
                                    color={headingColor}
                                    textAlign="center"
                                  >
                                    Como deve ser a montagem e as aberturas?
                                  </Heading>
                                  <SimpleGrid
                                    columns={{ base: 1, sm: 2, md: 3 }}
                                    spacing={{ base: 3, md: 4 }}
                                    w="100%"
                                  >
                                    {ASSEMBLY_OPTIONS.map((opt) => {
                                      const isActive = form.assembly === opt.value;
                                      const hasPick = form.assembly != null;
                                      const isDimmed = hasPick && !isActive;
                                      const imgSrc =
                                        assemblyAssetFolder != null
                                          ? assemblyIllustrationSrc(
                                            assemblyAssetFolder,
                                            opt.value,
                                          )
                                          : "";
                                      const surchargeAmount =
                                        selectedTemplateVFinal *
                                        ASSEMBLY_SURCHARGE_FRACTION_OF_VFINAL;
                                      const footnote =
                                        opt.value === "disassembled"
                                          ? "* Sem custo extra"
                                          : Number.isFinite(selectedTemplateVFinal)
                                            ? `* Acréscimo de ${formatMoneyBrlPtBr(
                                              surchargeAmount,
                                            )} ao valor total`
                                            : "* Acréscimo de 10% ao valor total";
                                      return (
                                        <Box
                                          key={opt.value}
                                          as="button"
                                          type="button"
                                          onClick={() =>
                                            handleAssemblyOptionClick(opt.value)
                                          }
                                          borderWidth={isActive ? "2px" : "1px"}
                                          borderColor={
                                            isActive ? "blue.400" : borderColor
                                          }
                                          borderRadius="lg"
                                          p={3}
                                          boxShadow="md"
                                          w="100%"
                                          bg={assemblyOptionCardBg}
                                          _hover={{ borderColor: "blue.400" }}
                                          textAlign="left"
                                          opacity={isDimmed ? 0.6 : 1}
                                          filter={isDimmed ? "grayscale(100%)" : "none"}
                                          transition="opacity 0.2s ease, filter 0.2s ease"
                                        >
                                          <VStack align="stretch" spacing={3}>
                                            <Box
                                              h="120px"
                                              w="100%"
                                              borderRadius="md"
                                              bg="white"
                                              boxShadow="md"
                                              flexShrink={0}
                                              overflow="hidden"
                                              display="flex"
                                              alignItems="center"
                                              justifyContent="center"
                                            >
                                              {imgSrc ? (
                                                <Image
                                                  src={imgSrc}
                                                  alt=""
                                                  aria-hidden
                                                  w="100%"
                                                  h="100%"
                                                  objectFit="contain"
                                                />
                                              ) : null}
                                            </Box>
                                            <Text
                                              fontSize="sm"
                                              fontWeight={
                                                isActive ? "extrabold" : "semibold"
                                              }
                                              color={headingColor}
                                              lineHeight="short"
                                            >
                                              {opt.label}
                                            </Text>
                                            <Text
                                              fontSize="xs"
                                              color={textColor}
                                              lineHeight="short"
                                              opacity={0.9}
                                            >
                                              {footnote}
                                            </Text>
                                          </VStack>
                                        </Box>
                                      );
                                    })}
                                  </SimpleGrid>
                                  <Flex
                                    ref={sectionAssemblyContinueRef}
                                    w="100%"
                                    justify="flex-end"
                                    mt={4}
                                  >
                                    <Button
                                      colorScheme="blue"
                                      size="lg"
                                      minH="44px"
                                      minW="160px"
                                      isDisabled={!canContinueFromResultToDiscount}
                                      onClick={() => goToStep(STEP_DISCOUNT)}
                                    >
                                      Continuar
                                    </Button>
                                  </Flex>
                                </VStack>
                              </MotionBox>
                            </Collapse>
                            {!showAssemblySection && form.template ? (
                              <Flex w="100%" justify="flex-end" mt={6}>
                                <Button
                                  colorScheme="blue"
                                  size="lg"
                                  minH="44px"
                                  minW="160px"
                                  onClick={() => goToStep(STEP_DISCOUNT)}
                                >
                                  Continuar
                                </Button>
                              </Flex>
                            ) : null}
                          </Fragment>
                        )}
                      </VStack>
                      </TypewriterBlock>
                    </Box>
                  )}

                  {step === STEP_DISCOUNT && (
                    <VStack align="stretch" spacing={6} w="100%">
                      <DiscountPolicyDiscountCard
                        vFinal={selectedTemplateVFinal}
                        bgCard={bgCard}
                        borderColor={borderColor}
                        headingColor={headingColor}
                        textColor={textColor}
                        enabledByName={discountEnabledByName}
                        onEnabledByNameChange={setDiscountEnabledByName}
                      />

                      <DiscountPolicySelectedModelSection
                        chosenRow={chosenTemplateRow}
                        form={form}
                        discountsTotalBrl={appliedDiscounts.totalValue}
                        surfaceBg={bgCard}
                        borderColor={borderColor}
                        headingColor={headingColor}
                        textColor={textColor}
                        cardTheme={{
                          bgCard,
                          borderColor,
                          headingColor,
                          textColor,
                          recommendedCardBorderColor,
                          resultRankCaptionBgOther,
                          resultListingPriceColor,
                        }}
                      />

                      <Box w="100%">
                        <SimulationSummaryPanel
                          simulationSummaryOpen={simulationSummaryOpen}
                          onToggleOpen={() =>
                            setSimulationSummaryOpen((open) => !open)
                          }
                          items={simulationSummaryItems}
                          onEditItem={handleEditSummaryItem}
                          bgCard={bgCard}
                          borderColor={borderColor}
                          headingColor={headingColor}
                          textColor={textColor}
                          appliedDiscounts={appliedDiscounts}
                        />
                      </Box>

                      <Flex w="100%" justify="space-between" align="center" gap={4}>
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
                          onClick={() => goToStep(STEP_CONFERIR)}
                        >
                          Continuar
                        </Button>
                      </Flex>
                    </VStack>
                  )}

                  {step === STEP_CONFERIR && (
                    <StepConferirContent
                      bgCard={bgCard}
                      borderColor={borderColor}
                      headingColor={headingColor}
                      textColor={textColor}
                      simulationSummaryOpen={simulationSummaryOpen}
                      onToggleSummaryOpen={() =>
                        setSimulationSummaryOpen((open) => !open)
                      }
                      summaryItems={simulationSummaryItems}
                      onEditSummaryItem={handleEditSummaryItem}
                      appliedDiscounts={appliedDiscounts}
                      pricingQuote={conferirPricingQuote}
                      totalPriceColor={resultListingPriceColor}
                      customerClarity={customerClarity}
                      onClarityChange={setCustomerClarity}
                      packTypeForQty={conferirPackTypeForQty}
                      qty={conferirQty}
                      onQtyChange={setConferirQty}
                      prodName={conferirProdName}
                      onProdNameChange={setConferirProdName}
                      prodCode={conferirProdCode}
                      onProdCodeChange={setConferirProdCode}
                      message={conferirMessage}
                      onMessageChange={setConferirMessage}
                      onBack={goBack}
                      onSubmit={handleConferirSubmit}
                    />
                  )}
                </VStack>
              </MotionBox>
            )}
          </AnimatePresence>

          <Box w="100%" mt={8} pt={6} borderTopWidth="1px" borderColor={borderColor}>
            <PackagingProgressTrack
              steps={PROGRESS_STEPS}
              currentProgressStep={currentProgressStep}
              textColor={textColor}
              progressTrackInactiveBg={progressTrackInactiveBg}
              surfaceBg={bgPage}
              onProgressStepNavigate={handleProgressStepNavigate}
              isProgressStepEnabled={isProgressStepUnlocked}
            />
          </Box>
        </Flex>
      </Box>

      <Modal
        isOpen={isCalculatingPrices && pricingModalNames.length > 0}
        onClose={() => { }}
        closeOnOverlayClick={false}
        closeOnEsc={false}
        isCentered
        motionPreset="scale"
        scrollBehavior="inside"
      >
        <ModalOverlay
          bg="blackAlpha.600"
          backdropFilter="blur(8px)"
        />
        <ModalContent
          bg={bgCard}
          borderWidth="1px"
          borderColor={borderColor}
          borderRadius="xl"
          shadow="xl"
          mx={4}
        >
          <ModalBody py={{ base: 6, md: 8 }} px={{ base: 5, md: 8 }}>
            <Text
              fontWeight="semibold"
              color={headingColor}
              fontSize={{ base: "md", md: "lg" }}
              mb={5}
              lineHeight="snug"
            >
              {pricingModalNames.length === 1
                ? "Encontramos 1 modelo viável para o seu caso."
                : `Encontramos ${pricingModalNames.length} modelos viáveis para o seu caso.`}
            </Text>
            <VStack align="stretch" spacing={3} as="ul" listStyleType="none" m={0} p={0}>
              {pricingModalNames.map((name, idx) => {
                const label = formatTemplateModelLabel(name);
                const isDone = idx < pricingModalActiveIndex;
                const isCurrent = idx === pricingModalActiveIndex;
                return (
                  <MotionBox
                    as="li"
                    key={name}
                    initial={{ opacity: 0, x: -14 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                      duration: 0.3,
                      delay: idx * 0.07,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                  >
                    <HStack align="flex-start" spacing={3}>
                      <Flex
                        w="22px"
                        h="22px"
                        flexShrink={0}
                        align="center"
                        justify="center"
                        pt="2px"
                      >
                        {isDone ? (
                          <Icon as={CheckIcon} color="green.500" boxSize={4} />
                        ) : null}
                        {isCurrent ? (
                          <Spinner size="sm" color="blue.500" thickness="3px" />
                        ) : null}
                      </Flex>
                      <Text
                        fontSize="sm"
                        color={isCurrent ? headingColor : textColor}
                        fontWeight={isCurrent ? "semibold" : "normal"}
                        pt="1px"
                        lineHeight="tall"
                      >
                        {isDone
                          ? `${label} — concluído.`
                          : isCurrent
                            ? `Calculando modelo ${label}...`
                            : `Aguardando modelo ${label}...`}
                      </Text>
                    </HStack>
                  </MotionBox>
                );
              })}
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>

      <Modal
        isOpen={successModalOpen}
        onClose={() => setSuccessModalOpen(false)}
        isCentered
        motionPreset="scale"
      >
        <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(6px)" />
        <ModalContent
          bg={bgCard}
          borderWidth="1px"
          borderColor={borderColor}
          borderRadius="xl"
          mx={4}
        >
          <ModalBody py={{ base: 6, md: 8 }} px={{ base: 5, md: 8 }}>
            <VStack spacing={5} align="stretch">
              <Box
                bg={successModalToastBg}
                borderRadius="lg"
                borderWidth="1px"
                borderColor={successModalToastBorder}
                borderLeftWidth="4px"
                borderLeftColor={successModalToastAccent}
                py={4}
                px={4}
                boxShadow="sm"
              >
              <Text
                color={"green.500"}
                fontSize="md"
                lineHeight="tall"
                textAlign="center"
                fontWeight="bold"
              >
                Suas informações foram enviadas com sucesso.
              </Text>
                <Text
                  color={headingColor}
                  fontSize="sm"
                  lineHeight="tall"
                  textAlign="center"
                >
                  Agora é só aguardar, pois um de nossos vendedores entrará em
                  contato para seguir com o seu pedido.
                </Text>
              </Box>
              <Box
                pt={2}
                borderTopWidth="1px"
                borderTopColor={borderColor}
              />
              <VStack spacing={2} align="stretch">
                <Heading
                  as="h3"
                  fontSize={{ base: "xl", md: "2xl" }}
                  fontWeight="bold"
                  color={ganheTempoTitleColor}
                  textAlign="center"
                >
                  Ganhe tempo!
                </Heading>
                <Text
                  color={textColor}
                  fontSize="md"
                  lineHeight="tall"
                  textAlign="center"
                >
                  Se você tem mais de uma medida de embalagem, faça agora uma
                  nova simulação e envie.<br/>Assim o vendedor poderá tratar de
                  todas elas com você de uma só vez.
                </Text>
                <Text
                  color={"orange.500"}
                  fontSize="md"
                  lineHeight="tall"
                  textAlign="center"
                  fontWeight="bold"
                >
                  Não será necessário preencher seus dados de novo.
                </Text>
              </VStack>
            </VStack>
          </ModalBody>
          <ModalFooter justifyContent="center" pb={6}>
            <Button
              colorScheme="blue"
              size="lg"
              minH="44px"
              onClick={() => setSuccessModalOpen(false)}
            >
              OK
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

    </Fragment>
  );
};

export default CalculadoraEmbalagem;
