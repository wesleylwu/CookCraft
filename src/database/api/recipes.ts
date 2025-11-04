import { supabase } from "@/database/supabase";
import {
  CreateRecipeInput,
  UpdateRecipeInput,
  RecipeIngredient,
} from "@/types/database";

export async function getRecipes() {
  const userResponse = await supabase.auth.getUser();
  const currentUser = userResponse.data.user;

  if (!currentUser) {
    throw new Error("Not authenticated");
  }

  const response = await supabase
    .from("recipes")
    .select("*, recipe_ingredients(*)")
    .eq("user_id", currentUser.id)
    .order("created_at", { ascending: false });

  if (response.error) {
    throw response.error;
  }

  return response.data;
}

export async function getRecipe(id: string) {
  const response = await supabase
    .from("recipes")
    .select("*, recipe_ingredients(*)")
    .eq("id", id)
    .single();

  if (response.error) {
    throw response.error;
  }

  return response.data;
}

export async function createRecipe(recipe: CreateRecipeInput) {
  const userResponse = await supabase.auth.getUser();
  const currentUser = userResponse.data.user;

  if (!currentUser) {
    throw new Error("Not authenticated");
  }

  const recipeIngredients = recipe.ingredients;
  const recipeData = {
    name: recipe.name,
    description: recipe.description,
    instructions: recipe.instructions,
    prep_time: recipe.prep_time,
    cook_time: recipe.cook_time,
    difficulty: recipe.difficulty,
    rating: recipe.rating,
    servings: recipe.servings,
    cuisine_type: recipe.cuisine_type,
    source: recipe.source,
    parent_recipe_id: recipe.parent_recipe_id,
    image_url: recipe.image_url,
    user_id: currentUser.id,
  };

  const recipeResponse = await supabase
    .from("recipes")
    .insert(recipeData)
    .select()
    .single();

  if (recipeResponse.error) {
    throw recipeResponse.error;
  }

  const newRecipe = recipeResponse.data;

  if (recipeIngredients && recipeIngredients.length > 0) {
    const ingredientsToInsert = recipeIngredients.map((ing) => ({
      recipe_id: newRecipe.id,
      ingredient_name: ing.ingredient_name,
      quantity: ing.quantity,
      unit: ing.unit,
      notes: ing.notes,
    }));

    const ingredientsResponse = await supabase
      .from("recipe_ingredients")
      .insert(ingredientsToInsert);

    if (ingredientsResponse.error) {
      throw ingredientsResponse.error;
    }
  }

  return newRecipe;
}

export async function updateRecipe(id: string, updates: UpdateRecipeInput) {
  const response = await supabase
    .from("recipes")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (response.error) {
    throw response.error;
  }

  return response.data;
}

export async function deleteRecipe(id: string) {
  const response = await supabase.from("recipes").delete().eq("id", id);

  if (response.error) {
    throw response.error;
  }
}

export async function duplicateRecipe(id: string) {
  const userResponse = await supabase.auth.getUser();
  const currentUser = userResponse.data.user;

  if (!currentUser) {
    throw new Error("Not authenticated");
  }

  const originalRecipe = await getRecipe(id);

  const duplicatedRecipeData = {
    user_id: currentUser.id,
    name: `${originalRecipe.name} (Copy)`,
    description: originalRecipe.description,
    instructions: originalRecipe.instructions,
    prep_time: originalRecipe.prep_time,
    cook_time: originalRecipe.cook_time,
    difficulty: originalRecipe.difficulty,
    servings: originalRecipe.servings,
    cuisine_type: originalRecipe.cuisine_type,
    source: "duplicate",
    parent_recipe_id: id,
  };

  const recipeResponse = await supabase
    .from("recipes")
    .insert(duplicatedRecipeData)
    .select()
    .single();

  if (recipeResponse.error) {
    throw recipeResponse.error;
  }

  const newRecipe = recipeResponse.data;

  if (
    originalRecipe.recipe_ingredients &&
    originalRecipe.recipe_ingredients.length > 0
  ) {
    const ingredientsToCopy = originalRecipe.recipe_ingredients.map(
      (ing: RecipeIngredient) => ({
        recipe_id: newRecipe.id,
        ingredient_name: ing.ingredient_name,
        quantity: ing.quantity,
        unit: ing.unit,
        notes: ing.notes,
      }),
    );

    const ingredientsResponse = await supabase
      .from("recipe_ingredients")
      .insert(ingredientsToCopy);

    if (ingredientsResponse.error) {
      throw ingredientsResponse.error;
    }
  }

  return newRecipe;
}
