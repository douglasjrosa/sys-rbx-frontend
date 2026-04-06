export const STEP_TELA1 = 1;
export const STEP_TELA2 = 2;
export const STEP_TELA3 = 3;
export const STEP_TELA4 = 4;
export const STEP_TELA5 = 5;
export const STEP_TELA6 = 6;
export const STEP_TELA7 = 7;
export const STEP_RESULT = 8;
export const STEP_DISCOUNT = 9;
/** Review & send (after discount policy). */
export const STEP_CONFERIR = 10;

export const PROGRESS_STEPS = [
  { id: 1, label: "Sobre a embalagem", telas: [1] },
  { id: 2, label: "E-mail", telas: [2] },
  { id: 3, label: "Medidas e detalhes", telas: [3, 4, 5, 6] },
  { id: 4, label: "CNPJ", telas: [7] },
  { id: 5, label: "Preço", telas: [8] },
  { id: 6, label: "Política de descontos", telas: [9] },
  { id: 7, label: "Conferir", telas: [10] },
] as const;

export const TELA1_SUB_PACK = 0;
export const TELA1_SUB_PROD = 1;
export const TELA1_SUB_EXPORT = 2;
export const TELA1_SUB_WEIGHT = 3;

export const DEFAULT_PRODTYPE_FOR_PALLET = 11;
