"use client";

import { useState } from "react";
import type { IngredientRow } from "@/app/inventario/actions";
import { deleteIngredient } from "@/app/inventario/actions";
import { IngredientForm } from "@/components/inventory/ingredient-form";
import { IngredientAutocomplete } from "@/components/inventory/ingredient-autocomplete";
import { NewIngredientForm } from "@/components/inventory/new-ingredient-form";
import { formatQuantity, UNIT_LABELS } from "@/lib/units";
import {
  Field,
} from "@/components/inventory/form-fields";

export function InventoryClient({
  ingredients,
}: {
  ingredients: IngredientRow[];
}) {
  const [showCreate, setShowCreate] = useState(false);
  const [showNewIngredient, setShowNewIngredient] = useState(false);
  const [newIngredientName, setNewIngredientName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchValue, setSearchValue] = useState("");

  const editing = ingredients.find((i) => i.id === editingId);

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Inventario
          </h1>
          <p className="mt-1 text-sm text-muted">
            Ingredientes disponibles para tus recetas y compras.
          </p>
        </div>
        {!showCreate && !showNewIngredient && (
          <button
            type="button"
            onClick={() => {
              setEditingId(null);
              setShowCreate(true);
              setSearchValue("");
            }}
            className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition hover:bg-accent-hover"
          >
            + Agregar ingrediente
          </button>
        )}
      </header>

      {showCreate && !showNewIngredient && (
        <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-medium">Nuevo ingrediente</h2>
            <button
              type="button"
              onClick={() => {
                setShowCreate(false);
                setSearchValue("");
              }}
              className="text-sm text-muted hover:text-foreground"
            >
              Cancelar
            </button>
          </div>
          <div className="flex flex-col gap-4">
            <Field label="Nombre" htmlFor="ingredient-search">
              <IngredientAutocomplete
                value={searchValue}
                onChange={setSearchValue}
                onSelectExisting={() => {
                  setShowCreate(false);
                  setSearchValue("");
                }}
                onSelectNew={(name) => {
                  setNewIngredientName(name);
                  setShowNewIngredient(true);
                  setSearchValue("");
                }}
                placeholder="Busca un ingrediente o crea uno nuevo..."
              />
            </Field>
            <div className="text-xs text-muted">
              💡 Escribe el nombre del ingrediente para buscarlo. Si no existe, verás la opción de crearlo.
            </div>
          </div>
        </section>
      )}

      {showNewIngredient && (
        <section className="rounded-xl border border-accent/30 bg-card p-5 shadow-sm ring-1 ring-accent/10">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-medium">Crear: {newIngredientName}</h2>
            <button
              type="button"
              onClick={() => {
                setShowNewIngredient(false);
                setNewIngredientName("");
                setShowCreate(false);
              }}
              className="text-sm text-muted hover:text-foreground"
            >
              Cerrar
            </button>
          </div>
          <NewIngredientForm
            ingredientName={newIngredientName}
            onSuccess={() => {
              setShowNewIngredient(false);
              setNewIngredientName("");
              setShowCreate(false);
              setSearchValue("");
            }}
            onCancel={() => {
              setShowNewIngredient(false);
              setNewIngredientName("");
              setShowCreate(true);
            }}
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
          <IngredientForm
            mode="edit"
            ingredient={editing}
            onSuccess={() => setEditingId(null)}
          />
        </section>
      )}

      <section className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        {ingredients.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-muted">Todavía no hay ingredientes en stock.</p>
            {!showCreate && !showNewIngredient && (
              <button
                type="button"
                onClick={() => setShowCreate(true)}
                className="mt-3 text-sm font-medium text-accent hover:underline"
              >
                Agregar el primero
              </button>
            )}
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-stone-50/80 text-muted">
                <th className="px-4 py-3 font-medium">Ingrediente</th>
                <th className="px-4 py-3 font-medium">Unidad</th>
                <th className="px-4 py-3 font-medium text-right">Stock</th>
                <th className="px-4 py-3 font-medium text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {ingredients.map((item) => (
                <tr
                  key={item.id}
                  className="border-b border-border last:border-0 hover:bg-stone-50/50"
                >
                  <td className="px-4 py-3 font-medium text-foreground">
                    {item.name}
                  </td>
                  <td className="px-4 py-3 text-muted">{UNIT_LABELS[item.unit]}</td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    {formatQuantity(item.quantity, item.unit)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setShowCreate(false);
                          setShowNewIngredient(false);
                          setEditingId(item.id);
                        }}
                        className="rounded-md px-2 py-1 text-sm font-medium text-accent hover:bg-amber-50"
                      >
                        Editar
                      </button>
                      <form action={deleteIngredient}>
                        <input type="hidden" name="id" value={item.id} />
                        <button
                          type="submit"
                          className="rounded-md px-2 py-1 text-sm text-muted hover:bg-red-50 hover:text-danger"
                          onClick={(e) => {
                            if (
                              !confirm(
                                `¿Eliminar "${item.name}" del inventario?`,
                              )
                            ) {
                              e.preventDefault();
                            }
                          }}
                        >
                          Eliminar
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}
