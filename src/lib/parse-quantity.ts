export function parseQuantity(raw: string): number | null {
  const normalized = raw.trim().replace(",", ".");
  const value = Number.parseFloat(normalized);
  if (!Number.isFinite(value) || value < 0) return null;
  return value;
}
