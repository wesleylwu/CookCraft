import { supabase } from "@/database/supabase";
import { CreateMealInput } from "@/types/database";
import { getRecipe } from "./recipes";
import { getIngredients, updateIngredient } from "./ingredients";

export async function getMealHistory() {
  const userResponse = await supabase.auth.getUser();
  const currentUser = userResponse.data.user;

  if (!currentUser) {
    throw new Error("Not authenticated");
  }

  const response = await supabase
    .from("meal_history")
    .select("*, recipe:recipes(*)")
    .eq("user_id", currentUser.id)
    .order("eaten_at", { ascending: false });

  if (response.error) {
    throw response.error;
  }

  return response.data;
}

export async function logMeal(meal: CreateMealInput) {
  const userResponse = await supabase.auth.getUser();
  const currentUser = userResponse.data.user;

  if (!currentUser) {
    throw new Error("Not authenticated");
  }

  const mealData = {
    recipe_id: meal.recipe_id,
    meal_name: meal.meal_name,
    servings: meal.servings,
    eaten_at: meal.eaten_at,
    notes: meal.notes,
    user_id: currentUser.id,
  };

  const response = await supabase
    .from("meal_history")
    .insert(mealData)
    .select()
    .single();

  if (response.error) {
    throw response.error;
  }

  if (meal.recipe_id) {
    const servingsEaten = meal.servings || 1;
    await deductIngredientsFromInventory(meal.recipe_id, servingsEaten);
  }

  return response.data;
}

export async function deleteMeal(id: string) {
  const response = await supabase.from("meal_history").delete().eq("id", id);

  if (response.error) {
    throw response.error;
  }
}

async function deductIngredientsFromInventory(
  recipeId: string,
  servingsEaten: number,
) {
  const recipe = await getRecipe(recipeId);
  const inventoryItems = await getIngredients();

  const recipeServings = recipe.servings || 1;
  const servingMultiplier = servingsEaten / recipeServings;

  const ingredientsSkipped: string[] = [];
  const ingredientsDeducted: string[] = [];

  const recipeIngredientsList = recipe.recipe_ingredients || [];

  for (const recipeIngredient of recipeIngredientsList) {
    const matchingInventoryItem = inventoryItems.find(
      (inventoryItem) =>
        inventoryItem.name.toLowerCase() ===
        recipeIngredient.ingredient_name.toLowerCase(),
    );

    if (!matchingInventoryItem) {
      ingredientsSkipped.push(recipeIngredient.ingredient_name);
      continue;
    }

    const quantityToDeduct =
      Number(recipeIngredient.quantity) * servingMultiplier;
    const currentQuantity = Number(matchingInventoryItem.quantity);
    const updatedQuantity = Math.max(0, currentQuantity - quantityToDeduct);

    await updateIngredient(matchingInventoryItem.id, {
      quantity: updatedQuantity,
    });

    ingredientsDeducted.push(recipeIngredient.ingredient_name);
  }

  return {
    deducted: ingredientsDeducted,
    skipped: ingredientsSkipped,
  };
}
