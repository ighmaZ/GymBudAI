import { NextRequest, NextResponse } from "next/server";
import { analyzeFoodImage } from "@/lib/openai";

export async function POST(request: NextRequest) {
  try {
    // 1. Get the image from request body
    const body = await request.json();
    const { imageBase64 } = body;

    // 2. Validate input
    if (!imageBase64) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    // 3. Call OpenAI to analyze the food
    const result = await analyzeFoodImage(imageBase64);

    // 4. Return the result
    return NextResponse.json(result);
  } catch (error) {
    console.error("Food analysis error:", error);
    return NextResponse.json(
      { error: "Failed to analyze food image" },
      { status: 500 }
    );
  }
}
