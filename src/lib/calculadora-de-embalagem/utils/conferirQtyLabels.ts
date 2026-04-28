import type { PackType } from "./packagingCalculator";

export const PRE_SEND_TITLE = "Antes de enviar, só mais umas perguntinhas...";

export const QTY_FIELD_ID = "calculadora-result-qty";
export const QTY_COLUMN_WIDTH_PX = 100;

export function conferirQtyQuestionLabel(
  packType: Exclude<PackType, "any">,
): string {
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
