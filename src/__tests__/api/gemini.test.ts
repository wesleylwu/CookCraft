import { NextRequest } from "next/server";

const mockSupabase = {
  auth: {
    getUser: jest.fn(),
  },
  from: jest.fn(),
};

const mockGeminiClient = {
  models: {
    generateContent: jest.fn(),
  },
};

jest.mock("@supabase/supabase-js", () => ({
  createClient: jest.fn(() => mockSupabase),
}));

jest.mock("@google/genai", () => ({
  GoogleGenAI: jest.fn(() => mockGeminiClient),
  Type: {},
}));

describe("gemini api route", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.GEMINI_API_KEY = "test-key";
  });

  test("returns error if no auth token", async () => {
    const { POST } = await import("@/app/api/gemini/route");
    
    const request = new NextRequest("http://localhost/api/gemini", {
      method: "POST",
      body: JSON.stringify({
        message: "test",
        conversationHistory: [],
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe("Authentication required");
  });

  test("calls gemini with correct parameters", async () => {
    const { POST } = await import("@/app/api/gemini/route");
    
    const mockUser = { id: "user123" };
    const mockResponse = {
      text: "Here's a recipe!",
      functionCalls: [],
      candidates: [
        {
          content: {
            parts: [{ text: "Here's a recipe!" }],
          },
        },
      ],
    };

    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
    });

    mockGeminiClient.models.generateContent.mockResolvedValue(mockResponse);

    const request = new NextRequest("http://localhost/api/gemini", {
      method: "POST",
      body: JSON.stringify({
        message: "make me a recipe",
        conversationHistory: [],
        authToken: "token123",
        useDietaryPreferences: true,
        usePreferredCuisines: true,
        onlyInventoryIngredients: false,
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(mockGeminiClient.models.generateContent).toHaveBeenCalled();
    expect(data.text).toBe("Here's a recipe!");
  });

  test("handles function calls for get_user_ingredients", async () => {
    const { POST } = await import("@/app/api/gemini/route");
    
    const mockUser = { id: "user123" };
    const mockIngredients = [
      { id: "1", name: "flour", quantity: 2, unit: "cups" },
    ];

    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
    });

    const mockQuery = {
      select: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      eq: jest.fn().mockResolvedValue({
        data: mockIngredients,
        error: null,
      }),
    };

    mockSupabase.from.mockReturnValue(mockQuery);

    const functionCallResponse = {
      text: "",
      functionCalls: [
        {
          name: "get_user_ingredients",
          args: {},
        },
      ],
      candidates: [
        {
          content: {
            parts: [
              {
                functionCall: {
                  name: "get_user_ingredients",
                  args: {},
                },
              },
            ],
          },
        },
      ],
    };

    const finalResponse = {
      text: "Based on your ingredients, here's a recipe!",
      functionCalls: [],
      candidates: [
        {
          content: {
            parts: [{ text: "Based on your ingredients, here's a recipe!" }],
          },
        },
      ],
    };

    mockGeminiClient.models.generateContent
      .mockResolvedValueOnce(functionCallResponse)
      .mockResolvedValueOnce(finalResponse);

    const request = new NextRequest("http://localhost/api/gemini", {
      method: "POST",
      body: JSON.stringify({
        message: "what can i make",
        conversationHistory: [],
        authToken: "token123",
        onlyInventoryIngredients: true,
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(data.text).toBe("Based on your ingredients, here's a recipe!");
    expect(mockSupabase.from).toHaveBeenCalledWith("ingredients");
  });
});

