"use client";

import { useEffect, useState } from "react";
import {
  getRecipe,
  updateRecipe,
  deleteRecipe,
  duplicateRecipe,
} from "@/database/api/recipes";
import { RecipeWithIngredients } from "@/types/database";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

const RecipeDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const [recipeData, setRecipeData] = useState<RecipeWithIngredients | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [currentRating, setCurrentRating] = useState<number | null>(null);
  const [starHover, setStarHover] = useState(0);

  useEffect(() => {
    const recipeId = params.id;
    if (recipeId) {
      loadRecipeDetails();
    }
  }, [params.id]);

  const loadRecipeDetails = async () => {
    try {
      const recipeId = params.id as string;
      const fetchedRecipe = await getRecipe(recipeId);
      setRecipeData(fetchedRecipe);
      setCurrentRating(fetchedRecipe.rating);
      setIsLoading(false);
    } catch (error) {
      console.error(error);
      router.push("/recipes");
    }
  };

  const handleUpdateRating = async (newRating: number) => {
    try {
      const recipeId = params.id as string;
      await updateRecipe(recipeId, { rating: newRating });
      setCurrentRating(newRating);

      if (recipeData) {
        const updatedRecipe = { ...recipeData, rating: newRating };
        setRecipeData(updatedRecipe);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteRecipe = async () => {
    const confirmDelete = confirm("Delete this recipe?");

    if (confirmDelete) {
      try {
        const recipeId = params.id as string;
        await deleteRecipe(recipeId);
        router.push("/recipes");
      } catch (error) {
        console.error(error);
      }
    }
  };

  const handleDuplicate = async () => {
    try {
      const newRecipe = await duplicateRecipe(params.id as string);
      router.push(`/recipes/${newRecipe.id}`);
    } catch (error) {
      console.error(error);
      alert("Failed to duplicate recipe");
    }
  };

  if (isLoading) {
    return (
      <div className="bg-cookcraft-white text-cookcraft-olive flex h-screen w-screen flex-col items-center justify-center">
        <div className="border-cookcraft-olive h-12 w-12 animate-spin rounded-full border-4 border-t-transparent"></div>
        <p className="mt-4 text-xl font-medium">Loading...</p>
      </div>
    );
  }

  if (!recipeData) {
    return null;
  }

  const totalTime = (recipeData.prep_time || 0) + (recipeData.cook_time || 0);

  return (
    <div className="bg-cookcraft-white flex min-h-screen w-screen flex-col items-center py-20">
      <div className="w-full max-w-4xl px-8">
        <div className="mb-4">
          <Link
            href="/recipes"
            className="text-cookcraft-red hover:text-cookcraft-yellow font-medium"
          >
            ← Back to Recipes
          </Link>
        </div>

        <div className="border-cookcraft-olive bg-cookcraft-white rounded-2xl border-3 p-8">
          <div className="mb-6 flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-cookcraft-olive text-4xl font-bold">
                {recipeData.name}
              </h1>
              {recipeData.description && (
                <p className="text-cookcraft-olive mt-2 text-lg">
                  {recipeData.description}
                </p>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleDuplicate}
                className="text-cookcraft-red hover:text-cookcraft-yellow cursor-pointer rounded-2xl border-3 px-4 py-2 font-bold transition-colors"
              >
                Duplicate
              </button>
              <button
                onClick={handleDeleteRecipe}
                className="text-cookcraft-red hover:text-cookcraft-yellow cursor-pointer rounded-2xl border-3 px-4 py-2 font-bold transition-colors"
              >
                Delete
              </button>
            </div>
          </div>

          <div className="border-cookcraft-olive mb-6 flex flex-wrap gap-4 border-b-2 pb-6">
            {recipeData.difficulty && (
              <div>
                <span className="text-cookcraft-olive text-sm font-medium">
                  Difficulty:
                </span>
                <span className="bg-cookcraft-green text-cookcraft-olive ml-2 rounded-2xl px-3 py-1 text-sm font-medium">
                  {recipeData.difficulty}
                </span>
              </div>
            )}
            {recipeData.prep_time !== null && (
              <div>
                <span className="text-cookcraft-olive text-sm font-medium">
                  Prep:
                </span>
                <span className="text-cookcraft-olive ml-2 text-sm">
                  {recipeData.prep_time} min
                </span>
              </div>
            )}
            {recipeData.cook_time !== null && (
              <div>
                <span className="text-cookcraft-olive text-sm font-medium">
                  Cook:
                </span>
                <span className="text-cookcraft-olive ml-2 text-sm">
                  {recipeData.cook_time} min
                </span>
              </div>
            )}
            {totalTime > 0 && (
              <div>
                <span className="text-cookcraft-olive text-sm font-medium">
                  Total:
                </span>
                <span className="text-cookcraft-olive ml-2 text-sm">
                  {totalTime} min
                </span>
              </div>
            )}
            <div>
              <span className="text-cookcraft-olive text-sm font-medium">
                Servings:
              </span>
              <span className="text-cookcraft-olive ml-2 text-sm">
                {recipeData.servings}
              </span>
            </div>
            {recipeData.cuisine_type && (
              <div>
                <span className="text-cookcraft-olive text-sm font-medium">
                  Cuisine:
                </span>
                <span className="text-cookcraft-olive ml-2 text-sm">
                  {recipeData.cuisine_type}
                </span>
              </div>
            )}
          </div>

          <div className="mb-6">
            <h2 className="text-cookcraft-olive mb-2 text-sm font-medium">
              Rate this recipe:
            </h2>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => handleUpdateRating(star)}
                  onMouseEnter={() => setStarHover(star)}
                  onMouseLeave={() => setStarHover(0)}
                  className="text-3xl transition-transform hover:scale-110"
                >
                  <span
                    className={
                      star <= (starHover || currentRating || 0)
                        ? "text-cookcraft-yellow"
                        : "text-cookcraft-olive opacity-30"
                    }
                  >
                    ★
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="border-cookcraft-olive mb-6 border-t-2 pt-6">
            <h2 className="text-cookcraft-olive mb-4 text-2xl font-bold">
              Ingredients
            </h2>
            <ul className="flex flex-col gap-2">
              {recipeData.recipe_ingredients?.map((ing, index) => (
                <li
                  key={index}
                  className="bg-cookcraft-green text-cookcraft-olive rounded-2xl p-3"
                >
                  {ing.ingredient_name} - {ing.quantity} {ing.unit}
                  {ing.notes && (
                    <span className="ml-2 text-sm">({ing.notes})</span>
                  )}
                </li>
              ))}
            </ul>
          </div>

          <div className="border-cookcraft-olive border-t-2 pt-6">
            <h2 className="text-cookcraft-olive mb-4 text-2xl font-bold">
              Instructions
            </h2>
            <div className="text-cookcraft-olive text-lg whitespace-pre-wrap">
              {recipeData.instructions}
            </div>
          </div>

          {recipeData.source === "duplicate" && recipeData.parent_recipe_id && (
            <div className="border-cookcraft-olive mt-6 border-t-2 pt-6">
              <p className="text-cookcraft-olive text-sm">
                This recipe was duplicated from another recipe!
              </p>
            </div>
          )}

          {recipeData.source === "ai" && (
            <div className="border-cookcraft-olive mt-6 border-t-2 pt-6">
              <p className="text-cookcraft-olive text-sm">
                This recipe was generated by AI!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecipeDetailPage;
