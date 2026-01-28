import Groq from "groq-sdk";
import { getRequiredEnv } from "./env";
import { parseJsonFromAiResponse } from "./json-parser";

// Initialize Groq
const groq = new Groq({
  apiKey: getRequiredEnv("GROQ_API_KEY"),
});

// Type for analyzed food item
export interface AnalyzedFood {
  name: string;
  portion: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  confidence: number;
}

export interface FoodAnalysisResult {
  foods: AnalyzedFood[];
  total: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  mealSuggestion: string;
}

// Analyze food image with Groq Vision
export async function analyzeFoodImage(
  imageBase64: string
): Promise<FoodAnalysisResult> {
  const response = await groq.chat.completions.create({
    model: "meta-llama/llama-4-maverick-17b-128e-instruct",
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: `You are an expert nutritionist AI that analyzes food images.
Analyze this food image and identify each food item.

For each food item, estimate:
- The name of the food
- Portion size (e.g., "150g", "1 cup", "1 medium")
- Calories
- Protein (grams)
- Carbs (grams)
- Fat (grams)
- Confidence (0-1, how confident you are)

Also suggest what meal this is (Breakfast, Lunch, Dinner, or Snack) based on the foods.

IMPORTANT: Return ONLY valid JSON with this exact structure, no markdown or explanation:
{
  "foods": [
    {
      "name": "Food name",
      "portion": "Portion size",
      "calories": number,
      "protein": number,
      "carbs": number,
      "fat": number,
      "confidence": number
    }
  ],
  "total": {
    "calories": number,
    "protein": number,
    "carbs": number,
    "fat": number
  },
  "mealSuggestion": "Breakfast" | "Lunch" | "Dinner" | "Snack"
}

Be conservative with calorie estimates - slightly overestimate for safety.`,
          },
          {
            type: "image_url",
            image_url: {
              url: `data:image/jpeg;base64,${imageBase64}`,
            },
          },
        ],
      },
    ],
    max_tokens: 1000,
    temperature: 0.3,
  });

  const content = response.choices[0]?.message?.content;

  if (!content) {
    throw new Error("No response from Groq");
  }

  return parseJsonFromAiResponse<FoodAnalysisResult>(content, "food analysis");
}
