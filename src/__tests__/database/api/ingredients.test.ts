import { getIngredients, createIngredient } from "@/database/api/ingredients";
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

describe("ingredients api", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("getIngredients returns user ingredients", async () => {
    const mockUser = { id: "user123" };
    const mockIngredients = [
      { id: "1", name: "flour", quantity: 2, unit: "cups" },
      { id: "2", name: "sugar", quantity: 1, unit: "cup" },
    ];

    (supabase.auth.getUser as jest.Mock).mockResolvedValue({
      data: { user: mockUser },
    });

    const mockFinalOrder = {
      order: jest.fn().mockResolvedValue({
        data: mockIngredients,
        error: null,
      }),
    };

    const mockFirstOrder = {
      order: jest.fn().mockReturnValue(mockFinalOrder),
    };

    const mockEq = {
      eq: jest.fn().mockReturnValue(mockFirstOrder),
    };

    const mockSelect = {
      select: jest.fn().mockReturnValue(mockEq),
    };

    (supabase.from as jest.Mock).mockReturnValue(mockSelect);

    const result = await getIngredients();

    expect(result).toEqual(mockIngredients);
    expect(supabase.from).toHaveBeenCalledWith("ingredients");
  });

  test("createIngredient adds new ingredient", async () => {
    const mockUser = { id: "user123" };
    const newIngredient = {
      name: "milk",
      quantity: 1,
      unit: "cup",
      category: "Dairy",
      notes: null,
    };

    (supabase.auth.getUser as jest.Mock).mockResolvedValue({
      data: { user: mockUser },
    });

    const mockQuery = {
      insert: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: { id: "new123", ...newIngredient, user_id: mockUser.id },
        error: null,
      }),
    };

    (supabase.from as jest.Mock).mockReturnValue(mockQuery);

    const result = await createIngredient(newIngredient);

    expect(result.name).toBe("milk");
    expect(mockQuery.insert).toHaveBeenCalled();
  });
});

