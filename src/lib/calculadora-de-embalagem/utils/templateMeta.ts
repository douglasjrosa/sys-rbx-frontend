import boxTemplates from "@/pages/calculadora-de-embalagem/_data/box-templates.json";
import type { AssemblyType, BoxTemplate, PackType } from "./packagingCalculator";

export const boxTemplatesList = boxTemplates as unknown as BoxTemplate[];

export const DESCRIPTION_LINES_BY_TEMPLATE_NAME = new Map<string, string[]>(
  boxTemplatesList.map((tpl) => [
    tpl.name,
    Array.isArray(tpl.description) ? tpl.description : [],
  ]),
);

export function packTypeForTemplateName(name: string): PackType | undefined {
  const tpl = boxTemplatesList.find(
    (b) => b.name === name,
  );
  return tpl?.packType;
}

export function assemblyAssetFolderForModel(
  modelId: string,
): "box" | "crate" | null {
  const packType = packTypeForTemplateName(modelId);
  if (packType === "box") {
    return "box";
  }
  if (packType === "crate") {
    return "crate";
  }
  if (modelId.startsWith("engradado")) {
    return "crate";
  }
  if (modelId.startsWith("caixa")) {
    return "box";
  }
  return null;
}

export function assemblyIllustrationSrc(
  folder: "box" | "crate",
  variant: AssemblyType,
): string {
  const subdir = folder === "box" ? "box" : "crate";
  return `/img/assembly/${subdir}/${variant}.jpg`;
}
