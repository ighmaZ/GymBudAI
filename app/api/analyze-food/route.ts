import { NextRequest, NextResponse } from "next/server";
import { analyzeFoodImage } from "@/lib/groqai";
import { rateLimit } from "@/lib/rate-limiter";
import { analyzeFoodSchema, parseBody } from "@/lib/validations";

export async function POST(request: NextRequest) {
  // Rate limit check (10 requests per minute for AI routes)
  const rateLimitResponse = rateLimit(request, "AI");
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const body = await request.json();
    
    // Validate input with Zod
    const validation = parseBody(analyzeFoodSchema, body);
    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const { imageBase64 } = validation.data;

    // Call AI to analyze the food
    const result = await analyzeFoodImage(imageBase64);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Food analysis error:", error);
    return NextResponse.json(
      { error: "Failed to analyze food image" },
      { status: 500 }
    );
  }
}
