"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { cookRecipe } from "@/app/recetas/actions";
import type { ActionResult } from "@/lib/action-result";

export function CookRecipeButton({
  recipeId,
  recipeName,
}: {
  recipeId: string;
  recipeName: string;
}) {
  const [showOk, setShowOk] = useState(false);
  const [state, formAction, pending] = useActionState(
    async (_prev: ActionResult | null, formData: FormData) =>
      cookRecipe(formData),
    null as ActionResult | null,
  );

  const wasPending = useRef(false);
  useEffect(() => {
    if (wasPending.current && !pending && state?.ok) {
      setShowOk(true);
      const t = setTimeout(() => setShowOk(false), 3000);
      return () => clearTimeout(t);
    }
    wasPending.current = pending;
  }, [pending, state]);

  return (
    <div className="flex flex-col items-end gap-1">
      {!state?.ok && state && (
        <p className="max-w-xs text-right text-xs text-danger">{state.error}</p>
      )}
      {showOk && (
        <p className="text-right text-xs text-emerald-700">Stock actualizado.</p>
      )}
      <form action={formAction}>
        <input type="hidden" name="id" value={recipeId} />
        <button
          type="submit"
          disabled={pending}
          onClick={(e) => {
            if (
              !confirm(
                `¿Marcar "${recipeName}" como cocinada y descontar del inventario?`,
              )
            ) {
              e.preventDefault();
            }
          }}
          className="rounded-lg bg-emerald-700 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-emerald-800 disabled:opacity-60"
        >
          {pending ? "Descontando…" : "Cociné esto"}
        </button>
      </form>
    </div>
  );
}
