"use server";

import { revalidatePath } from "next/cache";
import type { MeasureUnit } from "@prisma/client";
import type { ActionResult } from "@/lib/action-result";
import { parseQuantity } from "@/lib/parse-quantity";
import { formatQuantity } from "@/lib/units";
import { prisma } from "@/lib/prisma";

export type RecipeItemRow = {
  id: string;
  quantity: number;
  ingredientId: string;
  ingredientName: string;
  unit: MeasureUnit;
};

export type RecipeRow = {
  id: string;
  name: string;
  items: RecipeItemRow[];
};

type ParsedItem = { ingredientId: string; quantity: number };

function parseItemsJson(raw: string): ParsedItem[] | null {
  try {
    const data = JSON.parse(raw) as unknown;
    if (!Array.isArray(data) || data.length === 0) return null;

    const items: ParsedItem[] = [];
    const seen = new Set<string>();

    for (const entry of data) {
      if (typeof entry !== "object" || entry === null) return null;
      const ingredientId = String(
        (entry as { ingredientId?: unknown }).ingredientId ?? "",
      );
      const quantity = parseQuantity(
        String((entry as { quantity?: unknown }).quantity ?? ""),
      );
      if (!ingredientId || quantity === null || quantity <= 0) return null;
      if (seen.has(ingredientId)) return null;
      seen.add(ingredientId);
      items.push({ ingredientId, quantity });
    }

    return items.length > 0 ? items : null;
  } catch {
    return null;
  }
}

async function validateIngredientIds(ids: string[]): Promise<boolean> {
  const count = await prisma.ingredient.count({
    where: { id: { in: ids } },
  });
  return count === ids.length;
}

export async function getRecipes(): Promise<RecipeRow[]> {
  const recipes = await prisma.recipe.findMany({
    orderBy: { name: "asc" },
    include: {
      items: {
        orderBy: { ingredient: { name: "asc" } },
        include: {
          ingredient: { select: { id: true, name: true, unit: true } },
        },
      },
    },
  });

  return recipes.map((recipe) => ({
    id: recipe.id,
    name: recipe.name,
    items: recipe.items.map((item) => ({
      id: item.id,
      quantity: item.quantity,
      ingredientId: item.ingredient.id,
      ingredientName: item.ingredient.name,
      unit: item.ingredient.unit,
    })),
  }));
}

export async function createRecipe(formData: FormData): Promise<ActionResult> {
  const name = String(formData.get("name") ?? "").trim();
  const items = parseItemsJson(String(formData.get("items") ?? ""));

  if (!name) return { ok: false, error: "El nombre de la receta es obligatorio." };
  if (!items) {
    return {
      ok: false,
      error: "Agregá al menos un ingrediente con cantidad mayor a 0.",
    };
  }

  if (!(await validateIngredientIds(items.map((i) => i.ingredientId)))) {
    return { ok: false, error: "Uno o más ingredientes no existen en el inventario." };
  }

  try {
    await prisma.recipe.create({
      data: {
        name,
        items: {
          create: items.map((item) => ({
            ingredientId: item.ingredientId,
            quantity: item.quantity,
          })),
        },
      },
    });
  } catch {
    return { ok: false, error: "Ya existe una receta con ese nombre." };
  }

  revalidatePath("/recetas");
  return { ok: true };
}

export async function updateRecipe(formData: FormData): Promise<ActionResult> {
  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const items = parseItemsJson(String(formData.get("items") ?? ""));

  if (!id) return { ok: false, error: "Receta no encontrada." };
  if (!name) return { ok: false, error: "El nombre de la receta es obligatorio." };
  if (!items) {
    return {
      ok: false,
      error: "Agregá al menos un ingrediente con cantidad mayor a 0.",
    };
  }

  if (!(await validateIngredientIds(items.map((i) => i.ingredientId)))) {
    return { ok: false, error: "Uno o más ingredientes no existen en el inventario." };
  }

  try {
    await prisma.$transaction([
      prisma.recipe.update({
        where: { id },
        data: { name },
      }),
      prisma.recipeItem.deleteMany({ where: { recipeId: id } }),
      prisma.recipeItem.createMany({
        data: items.map((item) => ({
          recipeId: id,
          ingredientId: item.ingredientId,
          quantity: item.quantity,
        })),
      }),
    ]);
  } catch {
    return {
      ok: false,
      error: "No se pudo guardar. ¿Ya existe otra receta con ese nombre?",
    };
  }

  revalidatePath("/recetas");
  return { ok: true };
}

export async function deleteRecipe(formData: FormData): Promise<ActionResult> {
  const id = String(formData.get("id") ?? "");
  if (!id) return { ok: false, error: "Receta no encontrada." };

  try {
    await prisma.recipe.delete({ where: { id } });
  } catch {
    return { ok: false, error: "No se pudo eliminar la receta." };
  }

  revalidatePath("/recetas");
  return { ok: true };
}

export async function cookRecipe(formData: FormData): Promise<ActionResult> {
  const id = String(formData.get("id") ?? "");
  if (!id) return { ok: false, error: "Receta no encontrada." };

  const recipe = await prisma.recipe.findUnique({
    where: { id },
    include: {
      items: { include: { ingredient: true } },
    },
  });

  if (!recipe) return { ok: false, error: "Receta no encontrada." };
  if (recipe.items.length === 0) {
    return { ok: false, error: "La receta no tiene ingredientes." };
  }

  const shortages: string[] = [];
  for (const item of recipe.items) {
    if (item.ingredient.quantity + 1e-9 < item.quantity) {
      shortages.push(
        `${item.ingredient.name}: tenés ${formatQuantity(item.ingredient.quantity, item.ingredient.unit)}, necesitás ${formatQuantity(item.quantity, item.ingredient.unit)}`,
      );
    }
  }

  if (shortages.length > 0) {
    return {
      ok: false,
      error: `Stock insuficiente — ${shortages.join(" · ")}`,
    };
  }

  await prisma.$transaction(
    recipe.items.map((item) =>
      prisma.ingredient.update({
        where: { id: item.ingredientId },
        data: {
          quantity: Math.max(0, item.ingredient.quantity - item.quantity),
        },
      }),
    ),
  );

  revalidatePath("/recetas");
  revalidatePath("/inventario");
  return { ok: true };
}
