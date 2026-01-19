import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limiter";

// GET - Fetch user settings (calorie goal)
export async function GET(request: NextRequest) {
  const rateLimitResponse = rateLimit(request, "CRUD");
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { dailyCaloriesGoal: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ dailyCaloriesGoal: user.dailyCaloriesGoal });
  } catch (error) {
    console.error("Fetch user settings error:", error);
    return NextResponse.json(
      { error: "Failed to fetch settings" },
      { status: 500 }
    );
  }
}

// PATCH - Update user calorie goal
export async function PATCH(request: NextRequest) {
  const rateLimitResponse = rateLimit(request, "CRUD");
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const body = await request.json();
    const { userId, dailyCaloriesGoal } = body as {
      userId: string;
      dailyCaloriesGoal: number;
    };

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 });
    }

    if (
      typeof dailyCaloriesGoal !== "number" ||
      dailyCaloriesGoal < 500 ||
      dailyCaloriesGoal > 10000
    ) {
      return NextResponse.json(
        { error: "Calorie goal must be between 500 and 10,000" },
        { status: 400 }
      );
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: { dailyCaloriesGoal: Math.round(dailyCaloriesGoal) },
      select: { dailyCaloriesGoal: true },
    });

    return NextResponse.json({ dailyCaloriesGoal: user.dailyCaloriesGoal });
  } catch (error) {
    console.error("Update user settings error:", error);
    return NextResponse.json(
      { error: "Failed to update settings" },
      { status: 500 }
    );
  }
}
