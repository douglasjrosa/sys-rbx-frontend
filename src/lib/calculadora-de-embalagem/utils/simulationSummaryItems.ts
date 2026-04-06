import type { RefObject } from "react";
import type { PackagingFormData } from "./packagingCalculator";
import { PRODUCT_TYPE_LABELS } from "./packagingCalculator";
import {
  ASSEMBLY_OPTIONS,
  CLEARANCE_OPTIONS_CM,
  CLEARANCE_OPTIONS_MM,
  PACK_TYPE_OPTIONS,
  WEIGHT_RANGE_OPTIONS,
} from "./formOptions";
import { formatSimulationDimensionsLine, formatTemplateModelLabel } from "./formatters";
import {
  STEP_RESULT,
  STEP_TELA1,
  STEP_TELA2,
  STEP_TELA3,
  STEP_TELA4,
  STEP_TELA5,
  STEP_TELA7,
  TELA1_SUB_EXPORT,
  TELA1_SUB_PACK,
  TELA1_SUB_PROD,
  TELA1_SUB_WEIGHT,
} from "./wizardSteps";
import type { ElegibleTemplateResult } from "./types";

export type SimulationSummarySectionRefs = {
  sectionPackTypeRef: RefObject<HTMLDivElement | null>;
  sectionProdTypeRef: RefObject<HTMLDivElement | null>;
  sectionIsExportRef: RefObject<HTMLDivElement | null>;
  sectionWeightRef: RefObject<HTMLDivElement | null>;
  sectionTela3Ref: RefObject<HTMLDivElement | null>;
  sectionMeasuresRef: RefObject<HTMLDivElement | null>;
  sectionMeasuresOfRef: RefObject<HTMLDivElement | null>;
  sectionClearanceRef: RefObject<HTMLDivElement | null>;
  sectionTela5Ref: RefObject<HTMLDivElement | null>;
  sectionTela2Ref: RefObject<HTMLDivElement | null>;
  sectionTela7Ref: RefObject<HTMLDivElement | null>;
  sectionResultModelsRef: RefObject<HTMLDivElement | null>;
  sectionAssemblyRef: RefObject<HTMLDivElement | null>;
};

export type SimulationSummaryEditTarget = {
  step: number;
  tela1SubStep?: number;
  ref: RefObject<HTMLDivElement | null>;
};

export type SimulationSummaryItemModel = {
  label: string;
  value: string;
  editTarget?: SimulationSummaryEditTarget;
};

function formatClearanceSummaryValue(form: Partial<PackagingFormData>): string {
  const opts =
    form.unit === "cm" ? CLEARANCE_OPTIONS_CM : CLEARANCE_OPTIONS_MM;
  const opt = opts.find((o) => o.value === form.clearance);
  const label = opt?.label ?? "Folga";
  const unitLabel = form.unit === "cm" ? "cm" : "mm";
  const v = form.clearance;
  return v != null ? `${label} - ${v} ${unitLabel}` : label;
}

export function buildSimulationSummaryItems(params: {
  form: Partial<PackagingFormData>;
  isPallet: boolean;
  showAssemblySection: boolean;
  elegibleTemplates: ElegibleTemplateResult[];
  refs: SimulationSummarySectionRefs;
}): SimulationSummaryItemModel[] {
  const { form, isPallet, showAssemblySection, elegibleTemplates, refs } = params;
  const {
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
  } = refs;

  const raw = [
    {
      label: "Tipo de embalagem",
      value:
        PACK_TYPE_OPTIONS.find((o) => o.value === form.packType)?.label ??
        String(form.packType ?? ""),
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
          value:
            WEIGHT_RANGE_OPTIONS.find((o) => o.value === form.weight)?.label ??
            `${form.weight} kg`,
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
          value: form.isUnitizedContent ? "Produto único" : "Vários produtos",
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
          value: formatSimulationDimensionsLine(form) ?? "",
          editTarget: { step: STEP_TELA4, ref: sectionMeasuresRef },
        }
      : null,
    form.measuresOf === "product" && form.clearance != null
      ? {
          label: "Folga",
          value: formatClearanceSummaryValue(form),
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
          value: form.customerCnpj.replace(/\D/g, "").replace(
            /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
            "$1.$2.$3/$4-$5",
          ),
          editTarget: { step: STEP_TELA7, ref: sectionTela7Ref },
        }
      : null,
    form.template
      ? {
          label: "Modelo escolhido",
          value: (() => {
            const row = elegibleTemplates.find((x) => x.name === form.template);
            const titulo = row?.priceResult?.info?.titulo;
            return titulo ?? formatTemplateModelLabel(form.template!);
          })(),
          editTarget: {
            step: STEP_RESULT,
            ref: sectionResultModelsRef,
          },
        }
      : null,
    showAssemblySection && form.assembly != null
      ? {
          label: "Montagem e aberturas",
          value:
            ASSEMBLY_OPTIONS.find((o) => o.value === form.assembly)?.label ?? "",
          editTarget: {
            step: STEP_RESULT,
            ref: sectionAssemblyRef,
          },
        }
      : null,
  ] as (SimulationSummaryItemModel | null)[];

  return raw.filter(
    (i): i is SimulationSummaryItemModel => i != null && i.value !== "",
  );
}
