import { supabase } from "@/database/supabase";

export interface AIMessage {
  role: "user" | "model";
  text: string;
}

export interface AIResponse {
  text: string;
  functionCalls?: Array<{
    name: string;
    args: Record<string, unknown>;
  }>;
}

export async function sendMessageToAI(
  userMessage: string,
  conversationHistory: AIMessage[] = [],
  useDietaryPreferences: boolean = true,
  usePreferredCuisines: boolean = true,
  onlyInventoryIngredients: boolean = false,
): Promise<AIResponse> {
  // getting auth
  const session = await supabase.auth.getSession();

  if (!session.data.session) {
    throw new Error("Not authenticated");
  }

  const token = session.data.session.access_token;

  const response = await fetch("/api/gemini", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message: userMessage,
      conversationHistory: conversationHistory,
      authToken: token,
      useDietaryPreferences: useDietaryPreferences,
      usePreferredCuisines: usePreferredCuisines,
      onlyInventoryIngredients: onlyInventoryIngredients,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to get AI response");
  }

  const data = await response.json();
  return data;
}
