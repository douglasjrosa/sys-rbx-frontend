import type { AssemblyType, PackagingFormData, PackType } from "./packagingCalculator";

export const PACK_TYPE_OPTIONS: { value: PackType; label: string }[] = [
  { value: "box", label: "Caixa Fechada" },
  { value: "crate", label: "Engradado" },
  { value: "pallet", label: "Palete" },
  { value: "any", label: "Ajude-me a escolher" },
];

export const PACK_TYPE_IMAGES: Record<PackType, string> = {
  box: "/img/box.jpg",
  crate: "/img/crate.jpg",
  pallet: "/img/pallet.jpg",
  any: "/img/any.jpg",
};

export const WEIGHT_RANGE_OPTIONS: { value: number; label: string }[] = [
  { value: 30, label: "Menos de 30 Kg" },
  { value: 100, label: "Entre 30 e 100 Kg" },
  { value: 500, label: "Entre 100 e 500 Kg" },
  { value: 1000, label: "Entre 500 e 1.000 Kg" },
  { value: 2000, label: "Entre 1.000 e 2.000 Kg" },
  { value: 2500, label: "Acima de 2.000 Kg" },
];

export type ClearanceOption = {
  value: number;
  label: string;
  suffix: string;
  iconSize: number;
};

export const CLEARANCE_OPTIONS_MM: ClearanceOption[] = [
  { value: 10, label: "Folga Mínima", suffix: "(10mm)", iconSize: 3 },
  { value: 20, label: "Folga Pequena", suffix: "(20mm)", iconSize: 4 },
  { value: 30, label: "Folga Média", suffix: "(30mm)", iconSize: 5 },
  { value: 50, label: "Folga Grande", suffix: "(50mm)", iconSize: 7 },
  { value: 100, label: "Extra Grande", suffix: "(100mm)", iconSize: 9 },
];

export const CLEARANCE_OPTIONS_CM: ClearanceOption[] = [
  { value: 1, label: "Folga Mínima", suffix: "(1cm)", iconSize: 3 },
  { value: 2, label: "Folga Pequena", suffix: "(2cm)", iconSize: 4 },
  { value: 3, label: "Folga Média", suffix: "(3cm)", iconSize: 5 },
  { value: 5, label: "Folga Grande", suffix: "(5cm)", iconSize: 7 },
  { value: 10, label: "Extra Grande", suffix: "(10cm)", iconSize: 9 },
];

export const PRODUCT_TYPE_IMAGES: Record<number, string | null> = {
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

export const ASSEMBLY_OPTIONS: ReadonlyArray<{ value: AssemblyType; label: string }> =
  [
    { value: "disassembled", label: "Desmontada" },
    { value: "top-opening", label: "Montada com abertura na TAMPA" },
    { value: "bottom-opening", label: "Montada com abertura na BASE" },
    { value: "side-opening", label: "Montada com abertura na LATERAL MAIOR" },
    { value: "end-opening", label: "Montada com abertura na LATERAL MENOR" },
    {
      value: "top-and-side-opening",
      label: "Montada com abertura na TAMPA e LATERAL MAIOR",
    },
    {
      value: "top-and-end-opening",
      label: "Montada com abertura na TAMPA e LATERAL MENOR",
    },
    {
      value: "bottom-and-side-opening",
      label: "Montada com abertura na BASE e LATERAL MAIOR",
    },
    {
      value: "bottom-and-end-opening",
      label: "Montada com abertura na BASE e LATERAL MENOR",
    },
  ];

export const initialForm: Partial<PackagingFormData> = {
  prodType: 0,
  weight: 0,
  measuresOf: undefined,
  unit: undefined,
  length: undefined,
  width: undefined,
  height: undefined,
  clearance: undefined,
  isUnitizedContent: undefined,
  isDistributedWeight: undefined,
  customerCnpj: "",
  emailNfe: "",
  customerName: "",
  customerEmail: "",
  customerPhone: "",
  contactChannel: undefined,
  template: undefined,
  assembly: null,
};
