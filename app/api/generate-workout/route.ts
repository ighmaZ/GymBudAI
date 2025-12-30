import { NextRequest, NextResponse } from "next/server";
import { generateWorkoutPlan, type WorkoutPlanRequest } from "@/lib/gemini-workout-planner";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { age, weight, height, goal, frequency } = body as WorkoutPlanRequest;

    if (!age || !weight || !height || !goal || !frequency) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (!["muscle_gain", "fat_loss", "endurance"].includes(goal)) {
      return NextResponse.json(
        { error: "Invalid goal. Must be muscle_gain, fat_loss, or endurance" },
        { status: 400 }
      );
    }

    if (frequency < 1 || frequency > 7) {
      return NextResponse.json(
        { error: "Invalid frequency. Must be between 1 and 7" },
        { status: 400 }
      );
    }

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
