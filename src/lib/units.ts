import type { MeasureUnit } from "@prisma/client";

export const UNIT_LABELS: Record<MeasureUnit, string> = {
  G: "g",
  ML: "ml",
  UNIT: "unidad",
};

export const UNIT_OPTIONS: { value: MeasureUnit; label: string }[] = [
  { value: "G", label: "Gramos (g)" },
  { value: "ML", label: "Mililitros (ml)" },
  { value: "UNIT", label: "Unidad" },
];

export function formatQuantity(quantity: number, unit: MeasureUnit): string {
  const formatted =
    Number.isInteger(quantity) || quantity >= 100
      ? quantity.toLocaleString("es-AR", { maximumFractionDigits: 2 })
      : quantity.toLocaleString("es-AR", { maximumFractionDigits: 3 });
  return `${formatted} ${UNIT_LABELS[unit]}`;
}
