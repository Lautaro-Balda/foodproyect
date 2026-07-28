import { InventoryClient } from "@/components/inventory/inventory-client";
import { getIngredients } from "./actions";

export default async function InventarioPage() {
  const ingredients = await getIngredients();

  return <InventoryClient ingredients={ingredients} />;
}
