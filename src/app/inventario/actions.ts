"use server";

import { revalidatePath } from "next/cache";
import type { MeasureUnit } from "@prisma/client";
import type { ActionResult } from "@/lib/action-result";
import { parseQuantity } from "@/lib/parse-quantity";
import { prisma } from "@/lib/prisma";

export type IngredientRow = {
  id: string;
  name: string;
  unit: MeasureUnit;
  quantity: number;
};

export async function getIngredients(): Promise<IngredientRow[]> {
  return prisma.ingredient.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true, unit: true, quantity: true },
  });
}

export async function createIngredient(formData: FormData): Promise<ActionResult> {
  const name = String(formData.get("name") ?? "").trim();
  const unit = formData.get("unit") as MeasureUnit;
  const quantity = parseQuantity(String(formData.get("quantity") ?? ""));

  if (!name) return { ok: false, error: "El nombre es obligatorio." };
  if (!["G", "ML", "UNIT"].includes(unit)) {
    return { ok: false, error: "Unidad de medida inválida." };
  }
  if (quantity === null) {
    return { ok: false, error: "La cantidad debe ser un número mayor o igual a 0." };
  }

  try {
    await prisma.ingredient.create({
      data: { name, unit, quantity },
    });
  } catch {
    return {
      ok: false,
      error: "Ya existe un ingrediente con ese nombre.",
    };
  }

  revalidatePath("/inventario");
  revalidatePath("/recetas");
  return { ok: true };
}

export async function createIngredientWithNutrition(
  formData: FormData
): Promise<ActionResult> {
  const name = String(formData.get("name") ?? "").trim();
  const calorias100 = formData.get("calorias100");
  const proteinas100 = formData.get("proteinas100");
  const carbohidratos100 = formData.get("carbohidratos100");
  const grasas100 = formData.get("grasas100");
  const fibra100 = formData.get("fibra100");
  const costoUnitario = formData.get("costoUnitario");
  const proveedor = String(formData.get("proveedor") ?? "").trim() || null;
  const rendimiento = formData.get("rendimiento");

  if (!name) return { ok: false, error: "El nombre es obligatorio." };

  try {
    await prisma.ingredient.create({
      data: {
        name,
        unit: "G",
        quantity: 0,
        calorias100: calorias100 ? parseFloat(String(calorias100)) : null,
        proteinas100: proteinas100 ? parseFloat(String(proteinas100)) : null,
        carbohidratos100: carbohidratos100
          ? parseFloat(String(carbohidratos100))
          : null,
        grasas100: grasas100 ? parseFloat(String(grasas100)) : null,
        fibra100: fibra100 ? parseFloat(String(fibra100)) : null,
        costoUnitario: costoUnitario ? parseFloat(String(costoUnitario)) : null,
        proveedor,
        rendimiento: rendimiento ? parseFloat(String(rendimiento)) : null,
      },
    });
  } catch {
    return {
      ok: false,
      error: "Ya existe un ingrediente con ese nombre.",
    };
  }

  revalidatePath("/inventario");
  revalidatePath("/recetas");
  return { ok: true };
}

export async function updateIngredient(formData: FormData): Promise<ActionResult> {
  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const unit = formData.get("unit") as MeasureUnit;
  const quantity = parseQuantity(String(formData.get("quantity") ?? ""));

  if (!id) return { ok: false, error: "Ingrediente no encontrado." };
  if (!name) return { ok: false, error: "El nombre es obligatorio." };
  if (!["G", "ML", "UNIT"].includes(unit)) {
    return { ok: false, error: "Unidad de medida inválida." };
  }
  if (quantity === null) {
    return { ok: false, error: "La cantidad debe ser un número mayor o igual a 0." };
  }

  try {
    await prisma.ingredient.update({
      where: { id },
      data: { name, unit, quantity },
    });
  } catch {
    return {
      ok: false,
      error: "No se pudo guardar. ¿Ya existe otro ingrediente con ese nombre?",
    };
  }

  revalidatePath("/inventario");
  revalidatePath("/recetas");
  return { ok: true };
}

export async function deleteIngredient(formData: FormData): Promise<ActionResult> {
  const id = String(formData.get("id") ?? "");
  if (!id) return { ok: false, error: "Ingrediente no encontrado." };

  try {
    await prisma.ingredient.delete({ where: { id } });
  } catch {
    return {
      ok: false,
      error: "No se pudo eliminar: puede estar usado en una receta.",
    };
  }

  revalidatePath("/inventario");
  revalidatePath("/recetas");
  return { ok: true };
}
