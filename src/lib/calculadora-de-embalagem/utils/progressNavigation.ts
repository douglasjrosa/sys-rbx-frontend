import { PROGRESS_STEPS } from "./wizardSteps";

export function isProgressStepUnlocked(
  wizardStep: number,
  progressId: number,
): boolean {
  const meta = PROGRESS_STEPS.find((s) => s.id === progressId);
  if (!meta) return false;
  if ("comingSoon" in meta && meta.comingSoon) return false;
  const firstTela = Math.min(...meta.telas);
  return wizardStep >= firstTela;
}
