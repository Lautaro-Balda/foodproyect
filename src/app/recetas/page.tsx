import { getIngredients } from "@/app/inventario/actions";
import { RecipesClient } from "@/components/recipes/recipes-client";
import { getRecipes } from "./actions";

export default async function RecetasPage() {
  const [recipes, ingredients] = await Promise.all([
    getRecipes(),
    getIngredients(),
  ]);

  return <RecipesClient recipes={recipes} ingredients={ingredients} />;
}
