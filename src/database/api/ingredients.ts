import { supabase } from "@/database/supabase";
import { CreateIngredientInput, UpdateIngredientInput } from "@/types/database";

export async function getIngredients() {
  const userResponse = await supabase.auth.getUser();
  const currentUser = userResponse.data.user;

  if (!currentUser) {
    throw new Error("Not authenticated");
  }

  const response = await supabase
    .from("ingredients")
    .select("*")
    .eq("user_id", currentUser.id)
    .order("category", { ascending: true })
    .order("name", { ascending: true });

  if (response.error) {
    throw response.error;
  }

  return response.data;
}

export async function createIngredient(ingredient: CreateIngredientInput) {
  const userResponse = await supabase.auth.getUser();
  const currentUser = userResponse.data.user;

  if (!currentUser) {
    throw new Error("Not authenticated");
  }

  const ingredientData = {
    name: ingredient.name,
    quantity: ingredient.quantity,
    unit: ingredient.unit,
    category: ingredient.category,
    notes: ingredient.notes,
    user_id: currentUser.id,
  };

  const response = await supabase
    .from("ingredients")
    .insert(ingredientData)
    .select()
    .single();

  if (response.error) {
    throw response.error;
  }

  return response.data;
}

export async function updateIngredient(
  id: string,
  updates: UpdateIngredientInput,
) {
  const response = await supabase
    .from("ingredients")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (response.error) {
    throw response.error;
  }

  return response.data;
}

export async function deleteIngredient(id: string) {
  const response = await supabase.from("ingredients").delete().eq("id", id);

  if (response.error) {
    throw response.error;
  }
}
