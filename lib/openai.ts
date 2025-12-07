import OpenAI from "openai";

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Types for the analysis result
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

// Analyze food image with GPT-4o Vision
export async function analyzeFoodImage(
  imageBase64: string
): Promise<FoodAnalysisResult> {
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: `You are an expert nutritionist AI that analyzes food images.
Identify each food item, estimate portions, and provide calorie/macro estimates.
Be conservative - slightly overestimate calories for safety.
Return ONLY valid JSON, no markdown.`,
      },
      {
        role: "user",
        content: [
          {
            type: "text",
            text: `Analyze this food image. Return JSON:
{
  "foods": [{ "name": "string", "portion": "string", "calories": number, "protein": number, "carbs": number, "fat": number, "confidence": number }],
  "total": { "calories": number, "protein": number, "carbs": number, "fat": number },
  "mealSuggestion": "Breakfast" | "Lunch" | "Dinner" | "Snack"
}`,
          },
          {
            type: "image_url",
            image_url: {
              url: `data:image/jpeg;base64,${imageBase64}`,
              detail: "high",
            },
          },
        ],
      },
    ],
    max_tokens: 1000,
    temperature: 0.3,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) throw new Error("No response from OpenAI");

  // Parse JSON (handle markdown code blocks)
  let jsonString = content;
  if (content.includes("```")) {
    jsonString = content.split("```")[1].replace("json", "").trim();
  }

  return JSON.parse(jsonString) as FoodAnalysisResult;
}
