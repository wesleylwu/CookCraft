"use client";
import { useState, useEffect, useRef } from "react";
import { motion } from "motion/react";
import Image from "next/image";
import logo from "@/public/home/cookCraftLogo.webp";
import { sendMessageToAI, type AIMessage } from "@/lib/ai";
import { createRecipe } from "@/database/api/recipes";
import { createIngredient } from "@/database/api/ingredients";

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
  loading?: boolean;
}

const ChatBot = () => {
  const fullText = "Welcome to CookCraft!";
  const [displayedText, setDisplayedText] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<AIMessage[]>(
    [],
  );
  const [useDietaryPreferences, setUseDietaryPreferences] = useState(true);
  const [usePreferredCuisines, setUsePreferredCuisines] = useState(true);
  const [onlyInventoryIngredients, setOnlyInventoryIngredients] =
    useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      setDisplayedText(fullText.slice(0, index + 1));
      index++;
      if (index === fullText.length) {
        clearInterval(interval);
      }
    }, 80);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");

    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    setMessages((prev) => [
      ...prev,
      { role: "assistant", content: "", loading: true },
    ]);

    try {
      const aiResponse = await sendMessageToAI(
        userMessage,
        conversationHistory,
        useDietaryPreferences,
        usePreferredCuisines,
        onlyInventoryIngredients,
      );

      const newHistory: AIMessage[] = [
        ...conversationHistory,
        { role: "user", text: userMessage },
      ];

      if (aiResponse.functionCalls && aiResponse.functionCalls.length > 0) {
        for (const functionCall of aiResponse.functionCalls) {
          try {
            if (functionCall.name === "create_recipe") {
              const recipeData = functionCall.args as {
                name: string;
                description?: string;
                instructions: string;
                prep_time?: number;
                cook_time?: number;
                difficulty: "easy" | "medium" | "hard";
                servings: number;
                cuisine_type?: string;
                ingredients: Array<{
                  ingredient_name: string;
                  quantity: number;
                  unit: string;
                  notes?: string;
                }>;
              };

              await createRecipe({
                name: recipeData.name,
                description: recipeData.description || null,
                instructions: recipeData.instructions,
                prep_time: recipeData.prep_time || null,
                cook_time: recipeData.cook_time || null,
                difficulty: recipeData.difficulty,
                rating: null,
                servings: recipeData.servings,
                cuisine_type: recipeData.cuisine_type || null,
                source: "ai",
                parent_recipe_id: null,
                image_url: null,
                ingredients: recipeData.ingredients.map((ing) => ({
                  ingredient_name: ing.ingredient_name,
                  quantity: ing.quantity,
                  unit: ing.unit,
                  notes: ing.notes || null,
                })),
              });
            } else if (functionCall.name === "add_ingredient") {
              const ingredientData = functionCall.args as {
                name: string;
                quantity: number;
                unit: string;
                category?: string;
                notes?: string;
              };

              await createIngredient({
                name: ingredientData.name,
                quantity: ingredientData.quantity,
                unit: ingredientData.unit,
                category: ingredientData.category || null,
                notes: ingredientData.notes || null,
              });
            }
          } catch (error) {
            console.error(`Error executing ${functionCall.name}:`, error);
          }
        }

        const finalText = aiResponse.text || "Done!";

        setMessages((prev) => [
          ...prev.slice(0, -1),
          { role: "assistant", content: finalText },
        ]);

        newHistory.push({ role: "model", text: finalText });
      } else {
        const responseText = aiResponse.text;

        setMessages((prev) => [
          ...prev.slice(0, -1),
          { role: "assistant", content: responseText },
        ]);

        newHistory.push({ role: "model", text: responseText });
      }

      setConversationHistory(newHistory);
    } catch (error) {
      console.error("Error:", error);
      setMessages((prev) => [
        ...prev.slice(0, -1),
        {
          role: "system",
          content:
            "Sorry, I encountered an error. Please try again or check your authentication.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="text-cookcraft-olive flex h-screen w-screen flex-col items-center justify-center">
      {messages.length === 0 ? (
        <div className="flex flex-col items-center">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
            className="text-6xl font-bold"
          >
            {displayedText}
          </motion.p>
          <Image src={logo} alt="Cook Craft Logo" className="mt-20 w-1/4" />
        </div>
      ) : (
        <div className="flex h-full w-full max-w-4xl flex-col px-4 py-8">
          <div className="border-cookcraft-olive mb-4 flex items-center gap-3 border-b-3 pb-4">
            <Image src={logo} alt="Cook Craft Logo" className="w-12" />
            <h2 className="text-2xl font-bold">CookCraft AI</h2>
          </div>

          <div className="mb-4 flex-1 space-y-4 overflow-y-auto">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    message.role === "user"
                      ? "bg-cookcraft-red text-white"
                      : message.role === "system"
                        ? "bg-cookcraft-yellow text-cookcraft-olive"
                        : "border-cookcraft-olive bg-cookcraft-white border-3"
                  }`}
                >
                  {message.loading ? (
                    <div className="flex gap-1">
                      <div className="bg-cookcraft-olive h-2 w-2 animate-bounce rounded-full"></div>
                      <div
                        className="bg-cookcraft-olive h-2 w-2 animate-bounce rounded-full"
                        style={{ animationDelay: "0.1s" }}
                      ></div>
                      <div
                        className="bg-cookcraft-olive h-2 w-2 animate-bounce rounded-full"
                        style={{ animationDelay: "0.2s" }}
                      ></div>
                    </div>
                  ) : (
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>
      )}

      <div className="w-full max-w-4xl px-4 pb-8">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Ask CookCraft..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isLoading}
            className="border-cookcraft-olive focus:border-cookcraft-red flex-1 rounded-2xl border-3 p-4 text-2xl font-normal focus:outline-none disabled:opacity-50"
          />
          <button
            onClick={handleSendMessage}
            disabled={isLoading || !input.trim()}
            className="bg-cookcraft-red hover:bg-cookcraft-yellow disabled:bg-cookcraft-green rounded-2xl px-6 text-2xl font-bold text-white transition-colors disabled:cursor-not-allowed disabled:opacity-50"
          >
            Send
          </button>
        </div>
        <div className="mt-3 flex flex-wrap gap-4 text-sm">
          <label className="text-cookcraft-olive flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              checked={useDietaryPreferences}
              onChange={(e) => setUseDietaryPreferences(e.target.checked)}
              className="h-4 w-4 cursor-pointer"
            />
            <span>Use Dietary Preferences</span>
          </label>
          <label className="text-cookcraft-olive flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              checked={usePreferredCuisines}
              onChange={(e) => setUsePreferredCuisines(e.target.checked)}
              className="h-4 w-4 cursor-pointer"
            />
            <span>Use Preferred Cuisines</span>
          </label>
          <label className="text-cookcraft-olive flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              checked={onlyInventoryIngredients}
              onChange={(e) => setOnlyInventoryIngredients(e.target.checked)}
              className="h-4 w-4 cursor-pointer"
            />
            <span>Only Inventory Ingredients</span>
          </label>
        </div>
      </div>
    </div>
  );
};

export default ChatBot;
