'use client';

import { useActionState, useEffect, useRef, useState } from 'react';
import type { MeasureUnit } from '@prisma/client';
import { createIngredientWithNutrition } from '@/app/inventario/actions';
import type { ActionResult } from '@/lib/action-result';
import { UNIT_OPTIONS } from '@/lib/units';
import {
  Field,
  FormError,
  SelectInput,
  SubmitButton,
  TextInput,
} from '@/components/inventory/form-fields';

const initial: ActionResult | null = null;

interface NutritionData {
  calorias100: number | null;
  proteinas100: number | null;
  carbohidratos100: number | null;
  grasas100: number | null;
  fibra100: number | null;
}

export function NewIngredientForm({
  ingredientName,
  onSuccess,
  onCancel,
}: {
  ingredientName: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [nutrition, setNutrition] = useState<NutritionData>({
    calorias100: null,
    proteinas100: null,
    carbohidratos100: null,
    grasas100: null,
    fibra100: null,
  });
  const [autocompletingNutrition, setAutocompletingNutrition] = useState(false);

  const [state, formAction, pending] = useActionState(
    async (_prev: ActionResult | null, formData: FormData) =>
      createIngredientWithNutrition(formData),
    initial,
  );

  const wasPending = useRef(false);
  useEffect(() => {
    if (wasPending.current && !pending && state?.ok) {
      formRef.current?.reset();
      onSuccess?.();
    }
    wasPending.current = pending;
  }, [pending, state, onSuccess]);

  const handleAutocompletNutrition = async () => {
    setAutocompletingNutrition(true);
    try {
      const response = await fetch('/api/ingredients/autocomplete-nutrition', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ingredients: [ingredientName] }),
      });

      if (response.ok) {
        const data = await response.json();
        const nutritionInfo = data[ingredientName] || {};
        setNutrition((prev) => ({
          ...prev,
          calorias100: nutritionInfo.calorias100 ?? prev.calorias100,
          proteinas100: nutritionInfo.proteinas100 ?? prev.proteinas100,
          carbohidratos100: nutritionInfo.carbohidratos100 ?? prev.carbohidratos100,
          grasas100: nutritionInfo.grasas100 ?? prev.grasas100,
          fibra100: nutritionInfo.fibra100 ?? prev.fibra100,
        }));
      }
    } catch (error) {
      console.error('Error fetching nutrition data:', error);
    } finally {
      setAutocompletingNutrition(false);
    }
  };

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="name" value={ingredientName} />
      <input type="hidden" name="calorias100" value={nutrition.calorias100 ?? ''} />
      <input type="hidden" name="proteinas100" value={nutrition.proteinas100 ?? ''} />
      <input type="hidden" name="carbohidratos100" value={nutrition.carbohidratos100 ?? ''} />
      <input type="hidden" name="grasas100" value={nutrition.grasas100 ?? ''} />
      <input type="hidden" name="fibra100" value={nutrition.fibra100 ?? ''} />

      {!state?.ok && state && <FormError message={state.error} />}

      <div className="rounded-lg bg-stone-50 p-3">
        <h3 className="text-sm font-semibold text-foreground">{ingredientName}</h3>
        <p className="text-xs text-muted mt-1">Completa los datos del nuevo ingrediente</p>
      </div>

      <div className="space-y-4 border-t border-border pt-4">
        <div className="mb-3 flex items-center justify-between">
          <h4 className="text-sm font-medium text-foreground">Datos Nutricionales (por 100g/100ml)</h4>
          <button
            type="button"
            onClick={handleAutocompletNutrition}
            disabled={autocompletingNutrition}
            className="rounded px-2 py-1 text-xs font-medium bg-stone-200 text-stone-800 hover:bg-stone-300 disabled:opacity-50"
          >
            {autocompletingNutrition ? 'Consultando IA...' : '✨ Autocompletar con IA'}
          </button>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Calorías (kcal)" htmlFor="calorias100">
            <TextInput
              id="calorias100"
              name="calorias100_manual"
              type="number"
              inputMode="decimal"
              placeholder="0"
              step="0.1"
              value={nutrition.calorias100 ?? ''}
              onChange={(e) =>
                setNutrition((prev) => ({
                  ...prev,
                  calorias100: e.target.value ? parseFloat(e.target.value) : null,
                }))
              }
            />
          </Field>

          <Field label="Proteínas (g)" htmlFor="proteinas100">
            <TextInput
              id="proteinas100"
              name="proteinas100_manual"
              type="number"
              inputMode="decimal"
              placeholder="0"
              step="0.1"
              value={nutrition.proteinas100 ?? ''}
              onChange={(e) =>
                setNutrition((prev) => ({
                  ...prev,
                  proteinas100: e.target.value ? parseFloat(e.target.value) : null,
                }))
              }
            />
          </Field>

          <Field label="Carbohidratos (g)" htmlFor="carbohidratos100">
            <TextInput
              id="carbohidratos100"
              name="carbohidratos100_manual"
              type="number"
              inputMode="decimal"
              placeholder="0"
              step="0.1"
              value={nutrition.carbohidratos100 ?? ''}
              onChange={(e) =>
                setNutrition((prev) => ({
                  ...prev,
                  carbohidratos100: e.target.value ? parseFloat(e.target.value) : null,
                }))
              }
            />
          </Field>

          <Field label="Grasas (g)" htmlFor="grasas100">
            <TextInput
              id="grasas100"
              name="grasas100_manual"
              type="number"
              inputMode="decimal"
              placeholder="0"
              step="0.1"
              value={nutrition.grasas100 ?? ''}
              onChange={(e) =>
                setNutrition((prev) => ({
                  ...prev,
                  grasas100: e.target.value ? parseFloat(e.target.value) : null,
                }))
              }
            />
          </Field>

          <Field label="Fibra (g)" htmlFor="fibra100">
            <TextInput
              id="fibra100"
              name="fibra100_manual"
              type="number"
              inputMode="decimal"
              placeholder="0"
              step="0.1"
              value={nutrition.fibra100 ?? ''}
              onChange={(e) =>
                setNutrition((prev) => ({
                  ...prev,
                  fibra100: e.target.value ? parseFloat(e.target.value) : null,
                }))
              }
            />
          </Field>
        </div>
      </div>

      <div className="space-y-4 border-t border-border pt-4">
        <h4 className="text-sm font-medium text-foreground">Información Comercial</h4>

        <Field label="Costo Unitario ($)" htmlFor="costoUnitario">
          <TextInput
            id="costoUnitario"
            name="costoUnitario"
            type="number"
            inputMode="decimal"
            placeholder="0"
            step="0.01"
          />
        </Field>

        <Field label="Proveedor" htmlFor="proveedor">
          <TextInput
            id="proveedor"
            name="proveedor"
            placeholder="Ej. Carrefour, Mercado Libre"
          />
        </Field>

        <Field label="Rendimiento" htmlFor="rendimiento">
          <TextInput
            id="rendimiento"
            name="rendimiento"
            type="number"
            inputMode="decimal"
            placeholder="% de rendimiento útil"
            step="0.1"
            min="0"
            max="100"
          />
        </Field>
      </div>

      <div className="flex justify-end gap-2 border-t border-border pt-4">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg px-4 py-2 text-sm font-medium border border-border bg-card text-foreground hover:bg-stone-100 transition"
          >
            Cancelar
          </button>
        )}
        <SubmitButton disabled={pending || autocompletingNutrition}>
          {pending ? 'Guardando…' : 'Crear ingrediente'}
        </SubmitButton>
      </div>
    </form>
  );
}
