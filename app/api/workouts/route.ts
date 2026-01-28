import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limiter";

export async function GET(request: NextRequest) {
  // Rate limit check (60 requests per minute for CRUD routes)
  const rateLimitResponse = await rateLimit(request, "CRUD");
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");

    const where: { userId: string; date?: Date } = { userId };

    if (date) {
      const parsedDate = new Date(date);
      if (!isNaN(parsedDate.getTime())) {
        where.date = parsedDate;
      }
    }

    const workouts = await prisma.workout.findMany({
      where,
      orderBy: { date: "desc" },
    });

    return NextResponse.json(workouts);
  } catch (error) {
    console.error("Error fetching workouts:", error);
    return NextResponse.json(
      { error: "Failed to fetch workouts" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  // Rate limit check (60 requests per minute for CRUD routes)
  const rateLimitResponse = await rateLimit(request, "CRUD");
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const body = await request.json();
    const { date, notes } = body;

    if (!notes) {
      return NextResponse.json(
        { error: "Notes are required" },
        { status: 400 }
      );
    }

    const workout = await prisma.workout.create({
      data: {
        userId,
        date: date ? new Date(date) : new Date(),
        notes,
      },
    });

    return NextResponse.json(workout, { status: 201 });
  } catch (error) {
    console.error("Error creating workout:", error);
    return NextResponse.json(
      { error: "Failed to create workout" },
      { status: 500 }
    );
  }
}
