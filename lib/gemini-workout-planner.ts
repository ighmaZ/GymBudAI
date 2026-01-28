import { GoogleGenAI } from "@google/genai";
import { getRequiredEnv } from "./env";

const ai = new GoogleGenAI({
  vertexai: false,
  apiKey: getRequiredEnv("GEMINI_API_KEY"),
});

const WORKOUT_PLANNING_PROMPT = `You are an expert fitness coach creating personalized weekly workout plans.

Based on the user's profile, create a customized weekly workout plan.

User Profile:
- Age: {age}
- Weight: {weight} kg
- Height: {height} cm
- Fitness Goal: {goal}
- Workout Frequency: {frequency} days per week

Guidelines:
1. For muscle gain: Focus on compound movements with moderate rep ranges (6-12 reps), progressive overload
2. For fat loss: Include more compound exercises, higher rep ranges (12-15 reps), shorter rest periods
3. For endurance: Higher rep ranges (15-20+ reps), circuit-style workouts, include cardio elements

Create a weekly workout plan that includes:
1. A summary of the approach based on their goal
2. Workouts broken down by day (Day 1, Day 2, etc.) based on their frequency
3. For rest days, include active recovery suggestions
4. Warm-up and cool-down routines

Format the plan with clear day headings and exercise details.
Example format:
Day 1:
- Bench press: 3 sets × 8 reps
- Biceps curls: 3 sets × 12 reps

Day 2:
- Rest day - Light stretching or walking

Day 3:
- Squats: 4 sets × 6 reps
- Leg press: 3 sets × 10 reps

IMPORTANT: Return ONLY valid JSON with this exact structure, no markdown or explanation:
{
  "summary": "Brief summary of the weekly workout approach",
  "workoutNotes": "Full weekly workout plan broken down by days with exercises, sets, reps, warm-up, cool-down, and rest day suggestions - THIS MUST BE A PLAIN TEXT STRING, NOT A JSON OBJECT. Start directly with the workout plan, NO intro text like 'Here is your plan' or similar.",
  "warmup": "Warm-up routine to do before each workout",
  "cooldown": "Cool-down routine to do after each workout",
  "exercises": [
    {
      "name": "Exercise name",
      "sets": 3,
      "reps": "8-12",
      "description": "Brief description of how to perform"
    }
  ]
}

Be specific and practical. The workoutNotes field should be a complete weekly plan ready to use with all {frequency} workout days clearly labeled. Use plain text formatting with bullet points and line breaks, not nested JSON structure. DO NOT include any intro text or explanations in the workoutNotes field.`;

export interface WorkoutPlanRequest {
  age: number;
  weight: number;
  height: number;
  goal: "muscle_gain" | "fat_loss" | "endurance";
  frequency: number;
}

export interface WorkoutPlanResponse {
  summary: string;
  workoutNotes: string;
  warmup: string;
  cooldown: string;
  exercises: Array<{
    name: string;
    sets: number;
    reps: string;
    description: string;
  }>;
}

export async function generateWorkoutPlan(
  request: WorkoutPlanRequest
): Promise<WorkoutPlanResponse> {
  const goalLabels = {
    muscle_gain: "Muscle Gain",
    fat_loss: "Fat Loss",
    endurance: "Endurance",
  };

  const prompt = WORKOUT_PLANNING_PROMPT
    .replace("{age}", request.age.toString())
    .replace("{weight}", request.weight.toString())
    .replace("{height}", request.height.toString())
    .replace("{goal}", goalLabels[request.goal])
    .replace("{frequency}", request.frequency.toString());

  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: [
      {
        role: "user",
        parts: [
          {
            text: prompt,
          },
        ],
      },
    ],
  });

  const text = response.text;

  if (!text) {
    throw new Error("No response from Gemini");
  }

  let jsonString = text;
  if (text.includes("```json")) {
    jsonString = text.split("```json")[1].split("```")[0].trim();
  } else if (text.includes("```")) {
    jsonString = text.split("```")[1].split("```")[0].trim();
  }

  try {
    return JSON.parse(jsonString) as WorkoutPlanResponse;
  } catch {
    console.error("Failed to parse Gemini response:", text);
    throw new Error("Failed to parse workout plan response");
  }
}
