"use client";

import { useEffect, useState } from "react";
import { getRecipes, deleteRecipe } from "@/database/api/recipes";
import { logMeal } from "@/database/api/meals";
import { RecipeWithIngredients } from "@/types/database";
import Link from "next/link";

const RecipesPage = () => {
  const [recipes, setRecipes] = useState<RecipeWithIngredients[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"rating" | "time">("rating");
  const [showMealForm, setShowMealForm] = useState<string | null>(null);
  const [mealServings, setMealServings] = useState(1);
  const [loggingMeal, setLoggingMeal] = useState(false);

  useEffect(() => {
    loadRecipes();
  }, []);

  const loadRecipes = async () => {
    try {
      const data = await getRecipes();
      setRecipes(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Delete this recipe?")) {
      try {
        await deleteRecipe(id);
        await loadRecipes();
      } catch (error) {
        console.error(error);
      }
    }
  };

  const handleLogMeal = async (recipe: RecipeWithIngredients) => {
    setLoggingMeal(true);
    try {
      await logMeal({
        recipe_id: recipe.id,
        meal_name: recipe.name,
        servings: mealServings,
        eaten_at: new Date().toISOString(),
        notes: null,
      });
      alert("Meal logged! Ingredients deducted from inventory.");
      setShowMealForm(null);
      setMealServings(1);
    } catch (error) {
      console.error(error);
      alert("Failed to log meal");
    } finally {
      setLoggingMeal(false);
    }
  };

  const filteredRecipes = recipes
    .filter((recipe) =>
      recipe.name.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    .sort((a, b) => {
      if (sortBy === "rating") {
        return (b.rating || 0) - (a.rating || 0);
      } else {
        const aTime = (a.prep_time || 0) + (a.cook_time || 0);
        const bTime = (b.prep_time || 0) + (b.cook_time || 0);
        return aTime - bTime;
      }
    });

  if (loading) {
    return (
      <div className="bg-cookcraft-white text-cookcraft-olive flex h-screen w-screen flex-col items-center justify-center">
        <div className="border-cookcraft-olive h-12 w-12 animate-spin rounded-full border-4 border-t-transparent"></div>
        <p className="mt-4 text-xl font-medium">Loading...</p>
      </div>
    );
  }

  return (
    <div className="bg-cookcraft-white flex min-h-screen w-screen flex-col items-center py-20">
      <div className="w-full max-w-6xl px-8">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-cookcraft-olive text-4xl font-bold">
            My Recipes
          </h1>
          <Link
            href="/recipes/create"
            className="bg-cookcraft-red hover:bg-cookcraft-yellow rounded-2xl px-6 py-3 text-lg font-bold text-white transition-colors"
          >
            Create Recipe
          </Link>
        </div>

        <div className="mb-6 flex gap-4">
          <input
            type="text"
            placeholder="Search recipes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border-cookcraft-olive flex-1 rounded-2xl border-3 p-3"
          />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as "rating" | "time")}
            className="border-cookcraft-olive rounded-2xl border-3 p-3"
          >
            <option value="rating">Sort by Rating</option>
            <option value="time">Sort by Time</option>
          </select>
        </div>

        {recipes.length === 0 ? (
          <div className="border-cookcraft-olive bg-cookcraft-white rounded-2xl border-3 p-12 text-center">
            <p className="text-cookcraft-olive text-xl">
              No recipes yet. Create your first one!
            </p>
          </div>
        ) : filteredRecipes.length === 0 ? (
          <div className="border-cookcraft-olive bg-cookcraft-white rounded-2xl border-3 p-12 text-center">
            <p className="text-cookcraft-olive text-xl">
              No recipes match your search.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredRecipes.map((recipe) => {
              const totalTime =
                (recipe.prep_time || 0) + (recipe.cook_time || 0);
              return (
                <div
                  key={recipe.id}
                  className="border-cookcraft-olive bg-cookcraft-white rounded-2xl border-3 p-6"
                >
                  <Link href={`/recipes/${recipe.id}`}>
                    <h2 className="text-cookcraft-olive hover:text-cookcraft-red text-2xl font-bold">
                      {recipe.name}
                    </h2>
                  </Link>

                  {recipe.description && (
                    <p className="text-cookcraft-olive mt-2 text-sm">
                      {recipe.description}
                    </p>
                  )}

                  <div className="text-cookcraft-olive mt-4 flex items-center gap-4 text-sm">
                    {recipe.difficulty && (
                      <span className="bg-cookcraft-green rounded-2xl px-3 py-1 font-medium">
                        {recipe.difficulty}
                      </span>
                    )}
                    {totalTime > 0 && <span>{totalTime} min</span>}
                  </div>

                  {recipe.rating !== null && (
                    <div className="mt-3 flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span
                          key={star}
                          className={
                            star <= (recipe.rating || 0)
                              ? "text-cookcraft-yellow text-xl"
                              : "text-cookcraft-olive text-xl opacity-30"
                          }
                        >
                          ★
                        </span>
                      ))}
                    </div>
                  )}

                  {showMealForm === recipe.id && (
                    <div className="border-cookcraft-olive bg-cookcraft-green mt-4 rounded-2xl border-3 p-4">
                      <h3 className="text-cookcraft-olive mb-3 text-sm font-bold">
                        Log this meal
                      </h3>
                      <div className="flex items-center gap-1">
                        <div className="flex items-center">
                          <label className="text-cookcraft-olive text-xs font-medium">
                            Servings:
                          </label>
                          <input
                            type="number"
                            value={mealServings}
                            onChange={(e) =>
                              setMealServings(parseInt(e.target.value) || 1)
                            }
                            min="1"
                            className="border-cookcraft-olive ml-2 w-16 rounded-2xl border-3 p-1 text-sm"
                          />
                        </div>
                        <button
                          onClick={() => handleLogMeal(recipe)}
                          disabled={loggingMeal}
                          className="bg-cookcraft-red hover:bg-cookcraft-yellow disabled:bg-cookcraft-green rounded-2xl px-4 py-1 text-sm font-bold text-white transition-colors disabled:cursor-not-allowed"
                        >
                          {loggingMeal ? "Logging..." : "Confirm"}
                        </button>
                        <button
                          onClick={() => {
                            setShowMealForm(null);
                            setMealServings(1);
                          }}
                          className="text-cookcraft-olive text-sm font-bold"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="mt-4 flex gap-2 text-sm">
                    <button
                      onClick={() =>
                        setShowMealForm(
                          showMealForm === recipe.id ? null : recipe.id,
                        )
                      }
                      className="bg-cookcraft-red hover:bg-cookcraft-yellow flex-1 rounded-2xl p-2 font-bold text-white transition-colors"
                    >
                      {showMealForm === recipe.id ? "Cancel" : "Log Meal"}
                    </button>
                    <Link
                      href={`/recipes/${recipe.id}`}
                      className="text-cookcraft-red hover:text-cookcraft-yellow flex-1 rounded-2xl border-3 p-2 text-center font-bold transition-colors"
                    >
                      View
                    </Link>
                    <button
                      onClick={() => handleDelete(recipe.id)}
                      className="text-cookcraft-red hover:text-cookcraft-yellow rounded-2xl border-3 p-2 px-3 font-bold transition-colors"
                    >
                      ×
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default RecipesPage;
