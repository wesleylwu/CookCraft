export interface Profile {
  id: string;
  email: string | null;
  dietary_preferences: string[];
  allergies: string[];
  preferred_cuisines: string[];
  default_serving_size: number;
  created_at: string;
  updated_at: string;
}

export interface Ingredient {
  id: string;
  user_id: string;
  name: string;
  quantity: number;
  unit: string;
  category: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Recipe {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  instructions: string;
  prep_time: number | null;
  cook_time: number | null;
  difficulty: "easy" | "medium" | "hard" | null;
  rating: number | null;
  servings: number;
  cuisine_type: string | null;
  source: "user" | "ai" | "duplicate";
  parent_recipe_id: string | null;
  image_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface RecipeIngredient {
  id: string;
  recipe_id: string;
  ingredient_name: string;
  quantity: number;
  unit: string;
  notes: string | null;
  created_at: string;
}

export interface MealHistory {
  id: string;
  user_id: string;
  recipe_id: string | null;
  meal_name: string;
  servings: number;
  eaten_at: string;
  notes: string | null;
  created_at: string;
}

// Helpful combined types for UI
export interface RecipeWithIngredients extends Recipe {
  recipe_ingredients: RecipeIngredient[];
}

export interface MealWithRecipe extends MealHistory {
  recipe: Recipe | null;
}

// Form types (for creating/updating)
export type CreateIngredientInput = {
  name: string;
  quantity: number;
  unit: string;
  category: string | null;
  notes: string | null;
};

export type UpdateIngredientInput = {
  name?: string;
  quantity?: number;
  unit?: string;
  category?: string | null;
  notes?: string | null;
};

export type CreateRecipeInput = {
  name: string;
  description: string | null;
  instructions: string;
  prep_time: number | null;
  cook_time: number | null;
  difficulty: "easy" | "medium" | "hard" | null;
  rating: number | null;
  servings: number;
  cuisine_type: string | null;
  source: "user" | "ai" | "duplicate";
  parent_recipe_id: string | null;
  image_url: string | null;
  ingredients: {
    ingredient_name: string;
    quantity: number;
    unit: string;
    notes: string | null;
  }[];
};

export type UpdateRecipeInput = {
  name?: string;
  description?: string | null;
  instructions?: string;
  prep_time?: number | null;
  cook_time?: number | null;
  difficulty?: "easy" | "medium" | "hard" | null;
  rating?: number | null;
  servings?: number;
  cuisine_type?: string | null;
  source?: "user" | "ai" | "duplicate";
  parent_recipe_id?: string | null;
  image_url?: string | null;
};

export type CreateMealInput = {
  recipe_id: string | null;
  meal_name: string;
  servings: number;
  eaten_at: string;
  notes: string | null;
};

export type UpdateProfileInput = {
  dietary_preferences?: string[];
  allergies?: string[];
  preferred_cuisines?: string[];
  default_serving_size?: number;
};

// Enums for dropdowns/filters
export const DIFFICULTY_LEVELS = ["easy", "medium", "hard"] as const;
export const RECIPE_SOURCES = ["user", "ai", "duplicate"] as const;

export const INGREDIENT_CATEGORIES = [
  "Dairy",
  "Meat",
  "Seafood",
  "Produce",
  "Bakery",
  "Grains",
  "Spices",
  "Condiments",
  "Beverages",
  "Other",
] as const;

export const UNITS = [
  "pieces",
  "oz",
  "lb",
  "g",
  "kg",
  "cups",
  "tbsp",
  "tsp",
  "ml",
  "l",
  "loaf",
  "can",
  "package",
] as const;
