import type { PackType } from "./packagingCalculator";

export function getResultRankCaption(params: {
  templatePackType: PackType | undefined;
  isRecommendedCard: boolean;
  isLastVisibleCard: boolean;
}): string {
  if (params.templatePackType === "pallet") {
    return (
      "Se o seu produto não possui nenhum componente " +
      "frágil, talvez um simples palete sob medida resolva."
    );
  }
  if (params.isRecommendedCard) {
    return (
      "Modelo suficiente para o seu caso. " +
      "Melhor custo benefício."
    );
  }
  if (params.isLastVisibleCard) {
    return (
      "Modelo indicado caso o seu produto seja de " +
      "altíssimo valor e você queira o menor risco possível."
    );
  }
  return (
    "Modelo adequado caso você queira um reforço a " +
    "mais para diminuir riscos."
  );
}
