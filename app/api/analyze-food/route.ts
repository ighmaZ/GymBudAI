import { NextRequest, NextResponse } from "next/server";
import { analyzeFoodImage } from "@/lib/groqai";
import { rateLimit } from "@/lib/rate-limiter";

export async function POST(request: NextRequest) {
  // Rate limit check (10 requests per minute for AI routes)
  const rateLimitResponse = rateLimit(request, "AI");
  if (rateLimitResponse) return rateLimitResponse;

  try {
    // 1. Get the image from request body
    const body = await request.json();
    const { imageBase64 } = body;

    // 2. Validate input
    if (!imageBase64) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    // 3. Call AI to analyze the food
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
