import { sendMessageToAI } from "@/lib/ai";
import { supabase } from "@/database/supabase";

jest.mock("@/database/supabase");

describe("ai service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  test("sends message to api route", async () => {
    const mockSession = {
      data: {
        session: {
          access_token: "token123",
        },
      },
    };

    (supabase.auth.getSession as jest.Mock).mockResolvedValue(mockSession);

    const mockApiResponse = {
      text: "Here's a recipe!",
    };

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockApiResponse,
    });

    const result = await sendMessageToAI("make me pasta", []);

    expect(result.text).toBe("Here's a recipe!");
    expect(global.fetch).toHaveBeenCalledWith("/api/gemini", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: "make me pasta",
        conversationHistory: [],
        authToken: "token123",
        useDietaryPreferences: true,
        usePreferredCuisines: true,
        onlyInventoryIngredients: false,
      }),
    });
  });

  test("throws error if not authenticated", async () => {
    (supabase.auth.getSession as jest.Mock).mockResolvedValue({
      data: { session: null },
    });

    await expect(sendMessageToAI("test", [])).rejects.toThrow(
      "Not authenticated",
    );
  });
});

