import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface FoodInput {
  name: string;
  portion: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  confidence?: number;
}

interface MacroTotals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

// GET - Fetch meals for a user (by date)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const date = searchParams.get("date"); // Format: "2025-12-07"

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 });
    }

    // Build date filter
    let dateFilter = {};

    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      dateFilter = {
        createdAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
      };
    }

    const meals = await prisma.meal.findMany({
      where: {
        userId,
        ...dateFilter,
      },
      include: {
        food: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(meals);
  } catch (error) {
    console.error("Fetch meals error:", error);
    return NextResponse.json(
      { error: "Failed to fetch meals" },
      { status: 500 }
    );
  }
}

// POST - Create a new meal
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, name, imageUrl, foods } = body as {
      userId: string;
      name: string;
      imageUrl?: string;
      foods: FoodInput[];
    };

    if (!userId || !name || !foods) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Calculate totals from foods
    const totals = foods.reduce<MacroTotals>(
      (acc, food) => ({
        calories: acc.calories + food.calories,
        protein: acc.protein + food.protein,
        carbs: acc.carbs + food.carbs,
        fat: acc.fat + food.fat,
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );

    // Create meal with food items
    const meal = await prisma.meal.create({
      data: {
        userId,
        name,
        imageUrl,
        totalCalories: totals.calories,
        totalProtein: totals.protein,
        totalCarbs: totals.carbs,
        totalFat: totals.fat,
        food: {
          create: foods.map((f) => ({
            name: f.name,
            portion: f.portion,
            calories: f.calories,
            protein: f.protein,
            carbs: f.carbs,
            fat: f.fat,
            confidence: f.confidence || 0.8,
          })),
        },
      },
      include: {
        food: true,
      },
    });

    return NextResponse.json(meal);
  } catch (error) {
    console.error("Create meal error:", error);
    return NextResponse.json(
      { error: "Failed to create meal" },
      { status: 500 }
    );
  }
}
