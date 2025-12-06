import { createRecipe, getRecipes } from "@/database/api/recipes";
import { supabase } from "@/database/supabase";

jest.mock("@/database/supabase", () => {
  const mockSupabase = {
    auth: {
      getUser: jest.fn(),
    },
    from: jest.fn(),
  };
  return {
    supabase: mockSupabase,
  };
});

describe("recipes api", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("getRecipes returns user recipes", async () => {
    const mockUser = { id: "user123" };
    const mockRecipes = [
      {
        id: "1",
        name: "Pasta",
        instructions: "Cook pasta",
        user_id: "user123",
      },
    ];

    (supabase.auth.getUser as jest.Mock).mockResolvedValue({
      data: { user: mockUser },
    });

    const mockQuery = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockResolvedValue({
        data: mockRecipes,
        error: null,
      }),
    };

    (supabase.from as jest.Mock).mockReturnValue(mockQuery);

    const result = await getRecipes();

    expect(result).toEqual(mockRecipes);
    expect(supabase.from).toHaveBeenCalledWith("recipes");
  });

  test("createRecipe saves recipe with ingredients", async () => {
    const mockUser = { id: "user123" };
    const recipeData = {
      name: "Pancakes",
      description: "Yummy pancakes",
      instructions: "Mix and cook",
      prep_time: 10,
      cook_time: 5,
      difficulty: "easy" as const,
      rating: null,
      servings: 2,
      cuisine_type: "American",
      source: "user" as const,
      parent_recipe_id: null,
      image_url: null,
      ingredients: [
        {
          ingredient_name: "flour",
          quantity: 1,
          unit: "cup",
          notes: null,
        },
      ],
    };

    (supabase.auth.getUser as jest.Mock).mockResolvedValue({
      data: { user: mockUser },
    });

    const mockRecipeQuery = {
      insert: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: { id: "recipe123", ...recipeData, user_id: mockUser.id },
        error: null,
      }),
    };

    const mockIngredientQuery = {
      insert: jest.fn().mockResolvedValue({
        error: null,
      }),
    };

    (supabase.from as jest.Mock)
      .mockReturnValueOnce(mockRecipeQuery)
      .mockReturnValueOnce(mockIngredientQuery);

    const result = await createRecipe(recipeData);

    expect(result.name).toBe("Pancakes");
    expect(mockRecipeQuery.insert).toHaveBeenCalled();
  });
});

