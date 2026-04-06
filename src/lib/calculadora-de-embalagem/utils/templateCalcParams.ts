import type { BoxTemplate, CalcProfile, PackType } from "./packagingCalculator";

/**
 * RBX $cx keys the calculadora may forward (aligns with advConfigs /
 * PackagingCalculator).
 */
export const CALC_CX_QUERY_ALLOWLIST = new Set<string>([
  "acessorios",
  "altura",
  "BaseSN",
  "cabTopoSN",
  "CabAdExSN",
  "CabAdFrSN",
  "CabChaoSN",
  "CabDSN",
  "CabESN",
  "CabTopoSN",
  "calcular",
  "Cod",
  "codigo",
  "comprimento",
  "configPe",
  "empresa",
  "fields",
  "largura",
  "LatAdExSN",
  "LatAdFrSN",
  "LatChaoSN",
  "LatDSN",
  "LatESN",
  "LatForaSN",
  "loaded",
  "modelo",
  "nomeProd",
  "obsCaixa",
  "pesoProd",
  "printable",
  "qPes",
  "qSarBase",
  "qSarCab",
  "qSarLat",
  "qSarTampa",
  "qTabuas",
  "qVigasBase",
  "tabela",
  "tabelas",
  "Token",
  "TampaSN",
]);

/**
 * Patches vs RBX calcular all-on defaults. Empty = keep PHP defaults for that
 * profile.
 */
export const CALC_PROFILE_PATCHES: Record<
  CalcProfile,
  Record<string, string>
> = {
  boxWithElevatedPallet: {
    cabTopoSN: "off",
    CabAdExSN: "off",
    CabChaoSN: "off",
    CabTopoSN: "off",
    configPe: "2",
    LatAdExSN: "off",
    LatForaSN: "off",
  },
  boxNoPallet: { CabChaoSN: "off" },
  crateWithElevatedPallet: {},
  crateNoPallet: { CabChaoSN: "off" },
  palletOnly: {},
};

/** Extra reinforcements when quoting export context. */
export const CALC_EXPORT_CX_PATCH: Record<string, string> = {
  LatAdExSN: "on",
  CabAdExSN: "on",
};

export function mergeCalcCxPatches(
  profile: BoxTemplate["calcProfile"] | undefined,
  isExport: boolean,
  packType?: PackType,
): Record<string, string> {
  const out: Record<string, string> = {};
  if (profile && CALC_PROFILE_PATCHES[profile]) {
    Object.assign(out, CALC_PROFILE_PATCHES[profile]);
  }
  if (isExport && packType !== "pallet") {
    Object.assign(out, CALC_EXPORT_CX_PATCH);
  }
  return out;
}

export function findBoxTemplateByName(
  templates: BoxTemplate[],
  name: string,
): BoxTemplate | undefined {
  return templates.find((t) => t.name === name);
}
