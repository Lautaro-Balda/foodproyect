"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import type { IngredientRow } from "@/app/inventario/actions";
import {
  createRecipe,
  updateRecipe,
  type RecipeRow,
} from "@/app/recetas/actions";
import type { ActionResult } from "@/lib/action-result";
import { UNIT_LABELS } from "@/lib/units";
import {
  Field,
  FormError,
  SelectInput,
  SubmitButton,
  TextInput,
} from "@/components/inventory/form-fields";

type Line = { ingredientId: string; quantity: string };

type Props =
  | {
      mode: "create";
      ingredients: IngredientRow[];
      onSuccess?: () => void;
    }
  | {
      mode: "edit";
      recipe: RecipeRow;
      ingredients: IngredientRow[];
      onSuccess?: () => void;
    };

function emptyLine(ingredients: IngredientRow[]): Line {
  return {
    ingredientId: ingredients[0]?.id ?? "",
    quantity: "",
  };
}

function linesFromRecipe(recipe: RecipeRow): Line[] {
  return recipe.items.map((item) => ({
    ingredientId: item.ingredientId,
    quantity: String(item.quantity),
  }));
}

export function RecipeForm(props: Props) {
  const formRef = useRef<HTMLFormElement>(null);
  const action = props.mode === "create" ? createRecipe : updateRecipe;
  const [lines, setLines] = useState<Line[]>(() =>
    props.mode === "edit"
      ? linesFromRecipe(props.recipe)
      : [emptyLine(props.ingredients)],
  );

  const [state, formAction, pending] = useActionState(
    async (_prev: ActionResult | null, formData: FormData) => {
      formData.set(
        "items",
        JSON.stringify(
          lines.map((line) => ({
            ingredientId: line.ingredientId,
            quantity: line.quantity,
          })),
        ),
      );
      return action(formData);
    },
    null as ActionResult | null,
  );

  const wasPending = useRef(false);
  useEffect(() => {
    if (wasPending.current && !pending && state?.ok) {
      if (props.mode === "create") {
        formRef.current?.reset();
        setLines([emptyLine(props.ingredients)]);
      }
      props.onSuccess?.();
    }
    wasPending.current = pending;
  }, [pending, state, props]);

  if (props.ingredients.length === 0) {
    return (
      <p className="text-sm text-muted">
        Cargá ingredientes en el inventario antes de armar una receta.
      </p>
    );
  }

  function updateLine(index: number, patch: Partial<Line>) {
    setLines((prev) =>
      prev.map((line, i) => (i === index ? { ...line, ...patch } : line)),
    );
  }

  function addLine() {
    const nextId =
      props.ingredients.find(
        (ing) => !lines.some((line) => line.ingredientId === ing.id),
      )?.id ?? props.ingredients[0].id;
    setLines((prev) => [...prev, { ingredientId: nextId, quantity: "" }]);
  }

  function removeLine(index: number) {
    setLines((prev) => prev.filter((_, i) => i !== index));
  }

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-4">
      {props.mode === "edit" && (
        <input type="hidden" name="id" value={props.recipe.id} />
      )}

      {!state?.ok && state && <FormError message={state.error} />}

      <Field label="Nombre de la receta" htmlFor="recipe-name">
        <TextInput
          id="recipe-name"
          name="name"
          required
          placeholder="Ej. Desayuno de avena"
          defaultValue={props.mode === "edit" ? props.recipe.name : undefined}
        />
      </Field>

      <div className="flex flex-col gap-3">
        <span className="text-sm font-medium">Ingredientes</span>
        {lines.map((line, index) => (
          <div
            key={index}
            className="grid gap-2 rounded-lg border border-border bg-stone-50/50 p-3 sm:grid-cols-[1fr_120px_auto]"
          >
            <Field label="Del inventario" htmlFor={`ing-${index}`}>
              <SelectInput
                id={`ing-${index}`}
                value={line.ingredientId}
                onChange={(e) =>
                  updateLine(index, { ingredientId: e.target.value })
                }
              >
                {props.ingredients.map((ing) => (
                  <option key={ing.id} value={ing.id}>
                    {ing.name} ({UNIT_LABELS[ing.unit]})
                  </option>
                ))}
              </SelectInput>
            </Field>
            <Field label="Cantidad" htmlFor={`qty-${index}`}>
              <TextInput
                id={`qty-${index}`}
                value={line.quantity}
                onChange={(e) =>
                  updateLine(index, { quantity: e.target.value })
                }
                inputMode="decimal"
                placeholder="0"
                required
              />
            </Field>
            <div className="flex items-end">
              <button
                type="button"
                disabled={lines.length <= 1}
                onClick={() => removeLine(index)}
                className="rounded-lg px-2 py-2 text-sm text-muted hover:bg-stone-100 hover:text-foreground disabled:opacity-40"
              >
                Quitar
              </button>
            </div>
          </div>
        ))}
        <button
          type="button"
          onClick={addLine}
          className="self-start text-sm font-medium text-accent hover:underline"
        >
          + Agregar línea
        </button>
      </div>

      <div className="flex justify-end pt-1">
        <SubmitButton>
          {pending
            ? "Guardando…"
            : props.mode === "create"
              ? "Crear receta"
              : "Guardar cambios"}
        </SubmitButton>
      </div>
    </form>
  );
}
