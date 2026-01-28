import { NextRequest, NextResponse } from "next/server";
import { generateWorkoutPlan } from "@/lib/gemini-workout-planner";
import { rateLimit } from "@/lib/rate-limiter";
import { generateWorkoutSchema, parseBody } from "@/lib/validations";

export async function POST(request: NextRequest) {
  // Rate limit check (10 requests per minute for AI routes)
  const rateLimitResponse = rateLimit(request, "AI");
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const body = await request.json();
    
    // Validate request body with Zod
    const validation = parseBody(generateWorkoutSchema, body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    const { age, weight, height, goal, frequency } = validation.data;

    const plan = await generateWorkoutPlan({
      age,
      weight,
      height,
      goal,
      frequency,
    });

    return NextResponse.json(plan);
  } catch (error) {
    console.error("Workout plan generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate workout plan" },
      { status: 500 }
    );
  }
}
