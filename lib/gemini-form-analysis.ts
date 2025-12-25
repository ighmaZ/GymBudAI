import { GoogleGenAI } from "@google/genai";
import type { FormAnalysisResult } from "@/types";

const ai = new GoogleGenAI({
  vertexai: false,
  apiKey: process.env.GEMINI_API_KEY!,
});

const FORM_ANALYSIS_PROMPT = `You are an expert fitness coach analyzing an exercise video.

Watch the entire video carefully and provide:
1. The EXACT exercise name (e.g., "Barbell Bench Press", "Dumbbell Bicep Curl", "Barbell Shrug", "Hip Abduction", "Standing Calf Raise")
2. Your confidence level (0-100) in identifying the exercise
3. Form effectiveness score (0-100) - how good is their form
4. Potential score if form was perfect (0-100)
5. What the person is doing well (3-5 specific points about their form)
6. What needs improvement (2-4 specific points)
7. Actionable tips to improve their form
8. Overall grade (A, B, C, D, or F)

Be specific about the exercise name - include equipment type (Barbell, Dumbbell, Cable, Bodyweight) and variation (e.g., "Incline Dumbbell Press" not just "Bench Press").

IMPORTANT: Return ONLY valid JSON with this exact structure, no markdown or explanation:
{
  "exercise": "Exact Exercise Name with Equipment",
  "confidence": 95,
  "effectivenessScore": 75,
  "potentialScore": 95,
  "goodPoints": ["Specific point 1", "Specific point 2", "Specific point 3"],
  "improvementPoints": ["Specific issue 1", "Specific issue 2"],
  "tips": ["Actionable tip 1", "Actionable tip 2", "Actionable tip 3"],
  "overallGrade": "B"
}`;

export async function analyzeFormWithGemini(
  videoBase64: string,
  mimeType: string
): Promise<FormAnalysisResult> {
  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: [
      {
        role: "user",
        parts: [
          {
            inlineData: {
              mimeType,
              data: videoBase64,
            },
          },
          {
            text: FORM_ANALYSIS_PROMPT,
          },
        ],
      },
    ],
  });

  const text = response.text;

  if (!text) {
    throw new Error("No response from Gemini");
  }

  // Parse JSON from response (handle potential markdown code blocks)
  let jsonString = text;
  if (text.includes("```json")) {
    jsonString = text.split("```json")[1].split("```")[0].trim();
  } else if (text.includes("```")) {
    jsonString = text.split("```")[1].split("```")[0].trim();
  }

  try {
    return JSON.parse(jsonString) as FormAnalysisResult;
  } catch {
    console.error("Failed to parse Gemini response:", text);
    throw new Error("Failed to parse form analysis response");
  }
}


