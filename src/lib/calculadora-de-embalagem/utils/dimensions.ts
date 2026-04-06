export function isPositiveDimension(value: number | undefined): boolean {
  if (value == null) return false;
  const n = Number(value);
  return Number.isFinite(n) && n > 0;
}
