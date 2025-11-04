"use client";

import { useState } from "react";
import { createRecipe } from "@/database/api/recipes";
import { useRouter } from "next/navigation";
import { DIFFICULTY_LEVELS, UNITS } from "@/types/database";

const CreateRecipePage = () => {
  const router = useRouter();
  const [recipeData, setRecipeData] = useState({
    name: "",
    description: "",
    instructions: "",
    prep_time: 0,
    cook_time: 0,
    difficulty: "medium" as "easy" | "medium" | "hard",
    servings: 2,
    cuisine_type: "",
  });

  const [ingredientsList, setIngredientsList] = useState<
    { ingredient_name: string; quantity: number; unit: string; notes: string }[]
  >([]);

  const [currentIngredient, setCurrentIngredient] = useState({
    ingredient_name: "",
    quantity: 0,
    unit: "pieces",
    notes: "",
  });

  const [isSaving, setIsSaving] = useState(false);

  const handleAddIngredient = () => {
    const hasName = currentIngredient.ingredient_name;
    const hasQuantity = currentIngredient.quantity > 0;

    if (hasName && hasQuantity) {
      const updatedIngredients = [...ingredientsList, currentIngredient];
      setIngredientsList(updatedIngredients);

      setCurrentIngredient({
        ingredient_name: "",
        quantity: 0,
        unit: "pieces",
        notes: "",
      });
    }
  };

  const handleRemoveIngredient = (ingredientIndex: number) => {
    const filteredIngredients = ingredientsList.filter((ingredient, index) => {
      return index !== ingredientIndex;
    });
    setIngredientsList(filteredIngredients);
  };

  const handleSubmitRecipe = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const newRecipeData = {
        name: recipeData.name,
        description: recipeData.description,
        instructions: recipeData.instructions,
        prep_time: recipeData.prep_time,
        cook_time: recipeData.cook_time,
        difficulty: recipeData.difficulty,
        servings: recipeData.servings,
        cuisine_type: recipeData.cuisine_type,
        source: "user" as const,
        ingredients: ingredientsList,
        rating: 0,
        parent_recipe_id: null,
        image_url: "",
      };

      const createdRecipe = await createRecipe(newRecipeData);
      router.push(`/recipes/${createdRecipe.id}`);
    } catch (error) {
      console.error(error);
      alert("Failed to create recipe");
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-cookcraft-white flex min-h-screen w-screen flex-col items-center py-20">
      <div className="w-full max-w-3xl px-8">
        <h1 className="text-cookcraft-olive mb-8 text-4xl font-bold">
          Create Recipe
        </h1>

        <form
          onSubmit={handleSubmitRecipe}
          className="border-cookcraft-olive bg-cookcraft-white rounded-2xl border-3 p-8"
        >
          <div className="flex flex-col gap-6">
            <div>
              <label className="text-cookcraft-olive text-sm font-medium">
                Recipe Name
              </label>
              <input
                type="text"
                value={recipeData.name}
                onChange={(e) =>
                  setRecipeData({ ...recipeData, name: e.target.value })
                }
                required
                className="border-cookcraft-olive mt-1 w-full rounded-2xl border-3 p-3"
              />
            </div>

            <div>
              <label className="text-cookcraft-olive text-sm font-medium">
                Description
              </label>
              <input
                type="text"
                value={recipeData.description}
                onChange={(e) =>
                  setRecipeData({ ...recipeData, description: e.target.value })
                }
                className="border-cookcraft-olive mt-1 w-full rounded-2xl border-3 p-3"
              />
            </div>

            <div>
              <label className="text-cookcraft-olive text-sm font-medium">
                Instructions
              </label>
              <textarea
                value={recipeData.instructions}
                onChange={(e) =>
                  setRecipeData({ ...recipeData, instructions: e.target.value })
                }
                required
                rows={6}
                className="border-cookcraft-olive mt-1 w-full rounded-2xl border-3 p-3"
              />
            </div>

            <div className="flex gap-4">
              <div className="flex-1">
                <label className="text-cookcraft-olive text-sm font-medium">
                  Prep Time (min)
                </label>
                <input
                  type="number"
                  value={recipeData.prep_time}
                  onChange={(e) =>
                    setRecipeData({
                      ...recipeData,
                      prep_time: parseInt(e.target.value) || 0,
                    })
                  }
                  min="0"
                  className="border-cookcraft-olive mt-1 w-full rounded-2xl border-3 p-3"
                />
              </div>

              <div className="flex-1">
                <label className="text-cookcraft-olive text-sm font-medium">
                  Cook Time (min)
                </label>
                <input
                  type="number"
                  value={recipeData.cook_time}
                  onChange={(e) =>
                    setRecipeData({
                      ...recipeData,
                      cook_time: parseInt(e.target.value) || 0,
                    })
                  }
                  min="0"
                  className="border-cookcraft-olive mt-1 w-full rounded-2xl border-3 p-3"
                />
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-1">
                <label className="text-cookcraft-olive text-sm font-medium">
                  Difficulty
                </label>
                <select
                  value={recipeData.difficulty}
                  onChange={(e) =>
                    setRecipeData({
                      ...recipeData,
                      difficulty: e.target.value as "easy" | "medium" | "hard",
                    })
                  }
                  className="border-cookcraft-olive mt-1 w-full rounded-2xl border-3 p-3"
                >
                  {DIFFICULTY_LEVELS.map((level) => (
                    <option key={level} value={level}>
                      {level}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex-1">
                <label className="text-cookcraft-olive text-sm font-medium">
                  Servings
                </label>
                <input
                  type="number"
                  value={recipeData.servings}
                  onChange={(e) =>
                    setRecipeData({
                      ...recipeData,
                      servings: parseInt(e.target.value) || 1,
                    })
                  }
                  min="1"
                  className="border-cookcraft-olive mt-1 w-full rounded-2xl border-3 p-3"
                />
              </div>
            </div>

            <div>
              <label className="text-cookcraft-olive text-sm font-medium">
                Cuisine Type
              </label>
              <input
                type="text"
                value={recipeData.cuisine_type}
                onChange={(e) =>
                  setRecipeData({ ...recipeData, cuisine_type: e.target.value })
                }
                placeholder="Italian, Mexican, etc."
                className="border-cookcraft-olive mt-1 w-full rounded-2xl border-3 p-3"
              />
            </div>

            <div className="border-cookcraft-olive border-t-2 pt-6">
              <h2 className="text-cookcraft-olive mb-4 text-2xl font-bold">
                Ingredients
              </h2>

              <div className="mb-4 flex flex-col gap-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Ingredient name"
                    value={currentIngredient.ingredient_name}
                    onChange={(e) =>
                      setCurrentIngredient({
                        ...currentIngredient,
                        ingredient_name: e.target.value,
                      })
                    }
                    className="border-cookcraft-olive flex-1 rounded-2xl border-3 p-2 text-sm"
                  />
                  <input
                    type="number"
                    placeholder="Qty"
                    value={currentIngredient.quantity || ""}
                    onChange={(e) =>
                      setCurrentIngredient({
                        ...currentIngredient,
                        quantity: parseFloat(e.target.value) || 0,
                      })
                    }
                    step="0.01"
                    className="border-cookcraft-olive w-24 rounded-2xl border-3 p-2 text-sm"
                  />
                  <select
                    value={currentIngredient.unit}
                    onChange={(e) =>
                      setCurrentIngredient({
                        ...currentIngredient,
                        unit: e.target.value,
                      })
                    }
                    className="border-cookcraft-olive w-32 rounded-2xl border-3 p-2 text-sm"
                  >
                    {UNITS.map((unit) => (
                      <option key={unit} value={unit}>
                        {unit}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={handleAddIngredient}
                    className="bg-cookcraft-red hover:bg-cookcraft-yellow rounded-2xl px-4 text-sm font-bold text-white"
                  >
                    Add
                  </button>
                </div>
              </div>

              {ingredientsList.length > 0 && (
                <div className="flex flex-col gap-2">
                  {ingredientsList.map((ing, index) => (
                    <div
                      key={index}
                      className="bg-cookcraft-green text-cookcraft-olive flex items-center justify-between rounded-2xl p-3"
                    >
                      <span>
                        {ing.ingredient_name} - {ing.quantity} {ing.unit}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveIngredient(index)}
                        className="text-cookcraft-red text-xl font-bold"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={isSaving || ingredientsList.length === 0}
                className="bg-cookcraft-red hover:bg-cookcraft-yellow disabled:bg-cookcraft-green flex-1 rounded-2xl p-4 text-lg font-bold text-white transition-colors disabled:cursor-not-allowed"
              >
                {isSaving ? "Creating..." : "Create Recipe"}
              </button>
              <button
                type="button"
                onClick={() => router.back()}
                className="border-cookcraft-olive text-cookcraft-olive hover:bg-cookcraft-white flex-1 rounded-2xl border-3 p-4 text-lg font-bold transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateRecipePage;
