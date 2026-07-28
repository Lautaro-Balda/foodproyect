"use client";

import { useActionState, useEffect, useRef } from "react";
import type { MeasureUnit } from "@prisma/client";
import {
  createIngredient,
  updateIngredient,
} from "@/app/inventario/actions";
import type { ActionResult } from "@/lib/action-result";
import { UNIT_OPTIONS } from "@/lib/units";
import {
  Field,
  FormError,
  SelectInput,
  SubmitButton,
  TextInput,
} from "@/components/inventory/form-fields";

const initial: ActionResult | null = null;

type Props =
  | { mode: "create"; onSuccess?: () => void }
  | {
      mode: "edit";
      ingredient: {
        id: string;
        name: string;
        unit: MeasureUnit;
        quantity: number;
      };
      onSuccess?: () => void;
    };

export function IngredientForm(props: Props) {
  const formRef = useRef<HTMLFormElement>(null);
  const action = props.mode === "create" ? createIngredient : updateIngredient;

  const [state, formAction, pending] = useActionState(
    async (_prev: ActionResult | null, formData: FormData) => action(formData),
    initial,
  );

  const wasPending = useRef(false);
  useEffect(() => {
    if (wasPending.current && !pending && state?.ok) {
      if (props.mode === "create") formRef.current?.reset();
      props.onSuccess?.();
    }
    wasPending.current = pending;
  }, [pending, state, props]);

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-4">
      {props.mode === "edit" && (
        <input type="hidden" name="id" value={props.ingredient.id} />
      )}

      {!state?.ok && state && <FormError message={state.error} />}

      <Field label="Nombre" htmlFor="name">
        <TextInput
          id="name"
          name="name"
          required
          placeholder="Ej. Avena, Leche, Huevos"
          defaultValue={props.mode === "edit" ? props.ingredient.name : undefined}
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Unidad" htmlFor="unit">
          <SelectInput
            id="unit"
            name="unit"
            required
            defaultValue={props.mode === "edit" ? props.ingredient.unit : "G"}
          >
            {UNIT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </SelectInput>
        </Field>

        <Field label="Cantidad en stock" htmlFor="quantity">
          <TextInput
            id="quantity"
            name="quantity"
            type="text"
            inputMode="decimal"
            required
            placeholder="0"
            defaultValue={
              props.mode === "edit" ? String(props.ingredient.quantity) : undefined
            }
          />
        </Field>
      </div>

      <div className="flex justify-end gap-2 pt-1">
        <SubmitButton>
          {pending
            ? "Guardando…"
            : props.mode === "create"
              ? "Agregar ingrediente"
              : "Guardar cambios"}
        </SubmitButton>
      </div>
    </form>
  );
}
