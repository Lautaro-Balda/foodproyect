"use client";

import { useState } from "react";
import type { IngredientRow } from "@/app/inventario/actions";
import type { RecipeRow } from "@/app/recetas/actions";
import { deleteRecipe } from "@/app/recetas/actions";
import { CookRecipeButton } from "@/components/recipes/cook-recipe-button";
import { RecipeForm } from "@/components/recipes/recipe-form";
import { formatQuantity } from "@/lib/units";

export function RecipesClient({
  recipes,
  ingredients,
}: {
  recipes: RecipeRow[];
  ingredients: IngredientRow[];
}) {
  const [showCreate, setShowCreate] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const editing = recipes.find((r) => r.id === editingId);

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Recetas
          </h1>
          <p className="mt-1 text-sm text-muted">
            Definí platos y descontá stock al cocinarlos.
          </p>
        </div>
        {!showCreate && ingredients.length > 0 && (
          <button
            type="button"
            onClick={() => {
              setEditingId(null);
              setShowCreate(true);
            }}
            className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition hover:bg-accent-hover"
          >
            + Nueva receta
          </button>
        )}
      </header>

      {ingredients.length === 0 && (
        <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Primero cargá ingredientes en el{" "}
          <a href="/inventario" className="font-medium underline">
            inventario
          </a>
          .
        </p>
      )}

      {showCreate && (
        <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-medium">Nueva receta</h2>
            <button
              type="button"
              onClick={() => setShowCreate(false)}
              className="text-sm text-muted hover:text-foreground"
            >
              Cancelar
            </button>
          </div>
          <RecipeForm
            mode="create"
            ingredients={ingredients}
            onSuccess={() => setShowCreate(false)}
          />
        </section>
      )}

      {editing && (
        <section className="rounded-xl border border-accent/30 bg-card p-5 shadow-sm ring-1 ring-accent/10">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-medium">Editar: {editing.name}</h2>
            <button
              type="button"
              onClick={() => setEditingId(null)}
              className="text-sm text-muted hover:text-foreground"
            >
              Cerrar
            </button>
          </div>
          <RecipeForm
            mode="edit"
            recipe={editing}
            ingredients={ingredients}
            onSuccess={() => setEditingId(null)}
          />
        </section>
      )}

      <div className="flex flex-col gap-4">
        {recipes.length === 0 ? (
          <div className="rounded-xl border border-border bg-card px-6 py-12 text-center shadow-sm">
            <p className="text-muted">Todavía no hay recetas.</p>
            {ingredients.length > 0 && !showCreate && (
              <button
                type="button"
                onClick={() => setShowCreate(true)}
                className="mt-3 text-sm font-medium text-accent hover:underline"
              >
                Crear la primera
              </button>
            )}
          </div>
        ) : (
          recipes.map((recipe) => (
            <article
              key={recipe.id}
              className="rounded-xl border border-border bg-card p-5 shadow-sm"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 flex-1">
                  <h2 className="text-lg font-semibold text-foreground">
                    {recipe.name}
                  </h2>
                  <ul className="mt-3 space-y-1.5 text-sm text-muted">
                    {recipe.items.map((item) => (
                      <li key={item.id} className="flex gap-2">
                        <span className="text-foreground">
                          {item.ingredientName}
                        </span>
                        <span className="tabular-nums">
                          {formatQuantity(item.quantity, item.unit)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
                <CookRecipeButton
                  recipeId={recipe.id}
                  recipeName={recipe.name}
                />
              </div>
              <div className="mt-4 flex gap-2 border-t border-border pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreate(false);
                    setEditingId(recipe.id);
                  }}
                  className="rounded-md px-2 py-1 text-sm font-medium text-accent hover:bg-amber-50"
                >
                  Editar
                </button>
                <form action={deleteRecipe}>
                  <input type="hidden" name="id" value={recipe.id} />
                  <button
                    type="submit"
                    className="rounded-md px-2 py-1 text-sm text-muted hover:bg-red-50 hover:text-danger"
                    onClick={(e) => {
                      if (
                        !confirm(`¿Eliminar la receta "${recipe.name}"?`)
                      ) {
                        e.preventDefault();
                      }
                    }}
                  >
                    Eliminar
                  </button>
                </form>
              </div>
            </article>
          ))
        )}
      </div>
    </div>
  );
}
