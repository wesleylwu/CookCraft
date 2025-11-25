import { GoogleGenAI, Type } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

function getSystemInstruction(
  useDietaryPreferences: boolean,
  usePreferredCuisines: boolean,
  onlyInventoryIngredients: boolean,
): string {
  // using our checkboxes first
  let preferencesNote = "";
  if (useDietaryPreferences === false && usePreferredCuisines === false) {
    preferencesNote =
      "\n- IGNORE dietary preferences and preferred cuisines (user has disabled them)";
  } else if (useDietaryPreferences === false) {
    preferencesNote =
      "\n- IGNORE dietary preferences (user has disabled them), but respect preferred cuisines";
  } else if (usePreferredCuisines === false) {
    preferencesNote =
      "\n- IGNORE preferred cuisines (user has disabled them), but respect dietary preferences";
  } else {
    preferencesNote =
      "\n- Respect both dietary preferences and preferred cuisines from the user's profile";
  }

  let inventoryNote = "";
  if (onlyInventoryIngredients === true) {
    inventoryNote =
      "\n- CRITICAL: ONLY suggest recipes using ingredients from the user's inventory. DO NOT suggest any ingredients the user doesn't already have. If the user doesn't have enough ingredients for a complete recipe, suggest what they can make with what they have or inform them they need more ingredients.";
  } else {
    inventoryNote =
      "\n- Suggest ANY appropriate recipes based on the user's request, without limiting to inventory ingredients";
    inventoryNote =
      inventoryNote +
      "\n- ONLY consider inventory limitations if the user EXPLICITLY asks (e.g., 'what can I make with my ingredients', 'use what I have', 'based on my fridge')";
    inventoryNote =
      inventoryNote +
      "\n- You can still check inventory for context, but do NOT let it restrict your recipe suggestions unless asked";
  }

  const instruction = `You are CookCraft AI, a helpful cooking assistant integrated into the CookCraft recipe management platform.

Your responsibilities:
1. Help users generate recipe ideas based on their available ingredients
2. Respect user dietary preferences, allergies, and cuisine preferences
3. Create detailed, easy-to-follow recipes
4. Help users add ingredients to their inventory
5. ONLY respond to food, cooking, recipe, and ingredient-related queries

Important guidelines:
- Always check the user's current ingredients and profile before suggesting recipes${inventoryNote}
- ALWAYS respect allergies listed in the user's profile (CRITICAL - never suggest recipes with allergens)${preferencesNote}
- Consider the difficulty level and time constraints mentioned by the user (e.g., "under 30 minutes", "beginner", "fancy")
- Provide clear, numbered instructions
- Include accurate measurements and cooking times
- If a user asks something completely unrelated to food/cooking/recipes (like math, history, general knowledge), politely decline and remind them you're a cooking assistant

CRITICAL - When to use functions:
- Call get_user_profile at the start for dietary preferences and allergies
- ONLY call get_user_ingredients if: (1) onlyInventoryIngredients mode is enabled, OR (2) user explicitly asks about their ingredients/what they can make
- DO NOT call create_recipe automatically when suggesting recipes
- ONLY call create_recipe when the user EXPLICITLY says "save this recipe", "add this to my recipes", "create this recipe", or similar confirmation
- Call add_ingredient when the user wants to add items to their inventory

Response format for recipe suggestions:
- First, present the complete recipe with:
  * Recipe name
  * Description
  * Prep time and cook time
  * Difficulty level
  * Number of servings
  * Full ingredient list with measurements
  * Step-by-step numbered instructions
  * Cuisine type
- After presenting the recipe, ask: "Would you like me to save this recipe to your collection?"
- Wait for user confirmation before calling create_recipe
- For ingredient additions, confirm what was added`;

  return instruction;
}

// function declarations from gemini docs
const getUserIngredientsFunctionDeclaration = {
  name: "get_user_ingredients",
  description:
    "Gets the user's current ingredients from their inventory. Use this to see what ingredients are available before generating recipes.",
  parameters: {
    type: Type.OBJECT,
    properties: {},
  },
};

const getUserProfileFunctionDeclaration = {
  name: "get_user_profile",
  description:
    "Gets the user's dietary preferences, allergies, preferred cuisines, and default serving size. Use this to personalize recipe suggestions.",
  parameters: {
    type: Type.OBJECT,
    properties: {},
  },
};

const createRecipeFunctionDeclaration = {
  name: "create_recipe",
  description:
    "Creates a new recipe and adds it to the user's recipe collection. Use this when the user asks you to create or save a recipe.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      name: {
        type: Type.STRING,
        description: "The name of the recipe",
      },
      description: {
        type: Type.STRING,
        description: "A brief description of the recipe",
      },
      instructions: {
        type: Type.STRING,
        description:
          "Step-by-step cooking instructions, separated by newlines or numbered",
      },
      prep_time: {
        type: Type.NUMBER,
        description: "Preparation time in minutes",
      },
      cook_time: {
        type: Type.NUMBER,
        description: "Cooking time in minutes",
      },
      difficulty: {
        type: Type.STRING,
        enum: ["easy", "medium", "hard"],
        description: "The difficulty level of the recipe",
      },
      servings: {
        type: Type.NUMBER,
        description: "Number of servings this recipe makes",
      },
      cuisine_type: {
        type: Type.STRING,
        description: "The type of cuisine (e.g., Italian, Mexican, Chinese)",
      },
      ingredients: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            ingredient_name: {
              type: Type.STRING,
              description: "Name of the ingredient",
            },
            quantity: {
              type: Type.NUMBER,
              description: "Quantity of the ingredient",
            },
            unit: {
              type: Type.STRING,
              description:
                "Unit of measurement (e.g., cups, tbsp, tsp, oz, g, pieces)",
            },
            notes: {
              type: Type.STRING,
              description: "Optional notes about the ingredient",
            },
          },
          required: ["ingredient_name", "quantity", "unit"],
        },
        description: "List of ingredients needed for the recipe",
      },
    },
    required: ["name", "instructions", "ingredients", "difficulty", "servings"],
  },
};

const addIngredientFunctionDeclaration = {
  name: "add_ingredient",
  description:
    "Adds a new ingredient to the user's inventory. Use this when the user asks to add ingredients to their pantry/inventory.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      name: {
        type: Type.STRING,
        description: "The name of the ingredient",
      },
      quantity: {
        type: Type.NUMBER,
        description: "The quantity of the ingredient",
      },
      unit: {
        type: Type.STRING,
        description:
          "Unit of measurement (e.g., pieces, oz, lb, g, kg, cups, tbsp, tsp, ml, l)",
      },
      category: {
        type: Type.STRING,
        enum: [
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
        ],
        description: "The category of the ingredient",
      },
      notes: {
        type: Type.STRING,
        description: "Optional notes about the ingredient",
      },
    },
    required: ["name", "quantity", "unit"],
  },
};

const tools = [
  {
    functionDeclarations: [
      getUserIngredientsFunctionDeclaration,
      getUserProfileFunctionDeclaration,
      createRecipeFunctionDeclaration,
      addIngredientFunctionDeclaration,
    ],
  },
];

export async function POST(request: NextRequest) {
  const body = await request.json();
  const message = body.message;
  const conversationHistory = body.conversationHistory;
  const authToken = body.authToken;
  const useDietaryPreferences = body.useDietaryPreferences || true;
  const usePreferredCuisines = body.usePreferredCuisines || true;
  const onlyInventoryIngredients = body.onlyInventoryIngredients || false;

  if (!authToken) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 },
    );
  }

  // setup supabase
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const supabase = createClient(supabaseUrl, supabaseKey, {
    global: {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    },
  });

  // build convo for ai
  const contents = [];
  for (let i = 0; i < conversationHistory.length; i++) {
    const msg = conversationHistory[i];
    contents.push({
      role: msg.role,
      parts: [{ text: msg.text }],
    });
  }
  contents.push({
    role: "user",
    parts: [{ text: message }],
  });

  // get  instruction based on user prefs
  const systemInstruction = getSystemInstruction(
    useDietaryPreferences,
    usePreferredCuisines,
    onlyInventoryIngredients,
  );

  // call the gemini ai
  let response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: contents,
    config: {
      systemInstruction: systemInstruction,
      tools: tools,
      temperature: 1.0,
    },
  });

  // check if ai wants to call functions
  while (response.functionCalls && response.functionCalls.length > 0) {
    const functionResults = [];

    for (let i = 0; i < response.functionCalls.length; i++) {
      const functionCall = response.functionCalls[i];
      let result;

      if (functionCall.name === "get_user_ingredients") {
        const ingredientsData = await supabase
          .from("ingredients")
          .select("*")
          .order("category", { ascending: true })
          .order("name", { ascending: true });

        if (ingredientsData.error) {
          result = { error: ingredientsData.error.message };
        } else {
          result = ingredientsData.data;
        }
      } else if (functionCall.name === "get_user_profile") {
        const userData = await supabase.auth.getUser();
        if (userData.data.user) {
          const profileData = await supabase
            .from("profiles")
            .select("*")
            .eq("id", userData.data.user.id)
            .single();

          if (profileData.error) {
            result = { error: profileData.error.message };
          } else {
            result = profileData.data;
          }
        }
      } else if (functionCall.name === "create_recipe") {
        return NextResponse.json({
          text: response.text || "",
          functionCalls: response.functionCalls.map((fc) => ({
            name: fc.name,
            args: fc.args,
          })),
        });
      } else if (functionCall.name === "add_ingredient") {
        return NextResponse.json({
          text: response.text || "",
          functionCalls: response.functionCalls.map((fc) => ({
            name: fc.name,
            args: fc.args,
          })),
        });
      }

      functionResults.push({
        name: functionCall.name,
        result: result,
      });
    }

    if (response.candidates && response.candidates[0]) {
      if (response.candidates[0].content) {
        contents.push({
          role: "model",
          parts: response.candidates[0].content.parts,
        });
      }
    }

    const functionResponseParts = [];
    for (let i = 0; i < functionResults.length; i++) {
      functionResponseParts.push({
        functionResponse: {
          name: functionResults[i].name,
          response: { result: functionResults[i].result },
        },
      });
    }
    contents.push({
      role: "user",
      parts: functionResponseParts,
    });

    // calling the ai again with our results
    response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: contents,
      config: {
        systemInstruction: systemInstruction,
        tools: tools,
        temperature: 1.0,
      },
    });
  }

  return NextResponse.json({
    text: response.text,
  });
}
