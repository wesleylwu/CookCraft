"use client";

import { useEffect, useState } from "react";
import { getMealHistory, deleteMeal } from "@/database/api/meals";
import { MealWithRecipe } from "@/types/database";

const HistoryPage = () => {
  const [mealsList, setMealsList] = useState<MealWithRecipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadMealsFromDatabase();
  }, []);

  const loadMealsFromDatabase = async () => {
    try {
      const mealsData = await getMealHistory();
      setMealsList(mealsData);
      setIsLoading(false);
    } catch (error) {
      console.error(error);
      setIsLoading(false);
    }
  };

  const handleDeleteMeal = async (mealId: string) => {
    const confirmDelete = confirm("Delete this meal entry?");

    if (confirmDelete) {
      try {
        await deleteMeal(mealId);
        loadMealsFromDatabase();
      } catch (error) {
        console.error(error);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="bg-cookcraft-white text-cookcraft-olive flex h-screen w-screen flex-col items-center justify-center">
        <div className="border-cookcraft-olive h-12 w-12 animate-spin rounded-full border-4 border-t-transparent"></div>
        <p className="mt-4 text-xl font-medium">Loading your meal history...</p>
      </div>
    );
  }

  return (
    <div className="bg-cookcraft-white flex min-h-screen w-screen flex-col items-center py-20">
      <div className="w-full max-w-4xl px-8">
        <h1 className="text-cookcraft-olive mb-8 text-4xl font-bold">
          Meal History
        </h1>

        {mealsList.length === 0 ? (
          <div className="border-cookcraft-olive bg-cookcraft-white rounded-2xl border-3 p-12 text-center">
            <p className="text-cookcraft-olive text-xl">
              No meals logged yet. Log meals from your recipes!
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {mealsList.map((mealItem) => {
              const mealDate = new Date(mealItem.eaten_at);
              const formattedDate = mealDate.toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              });

              return (
                <div
                  key={mealItem.id}
                  className="border-cookcraft-olive bg-cookcraft-white rounded-2xl border-3 p-6"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h2 className="text-cookcraft-olive text-2xl font-bold">
                        {mealItem.meal_name}
                      </h2>
                      {mealItem.notes && (
                        <p className="text-cookcraft-olive mt-2 text-sm">
                          {mealItem.notes}
                        </p>
                      )}
                      <div className="mt-3 flex gap-4 text-sm">
                        <span className="text-cookcraft-olive">
                          Servings: {mealItem.servings}
                        </span>
                        <span className="text-cookcraft-olive">
                          {formattedDate}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteMeal(mealItem.id)}
                      className="text-cookcraft-red hover:text-cookcraft-yellow rounded-2xl border-3 px-4 py-2 font-bold transition-colors"
                    >
                      Delete
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

export default HistoryPage;
