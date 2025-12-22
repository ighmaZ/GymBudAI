import { NextRequest, NextResponse } from "next/server";
import { analyzeFormWithGemini } from "@/lib/gemini-form-analysis";

interface AnalyzeFormRequest {
  videoBase64: string;
  mimeType: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: AnalyzeFormRequest = await request.json();
    const { videoBase64, mimeType } = body;

    // Validate input
    if (!videoBase64) {
      return NextResponse.json({ error: "No video provided" }, { status: 400 });
    }

    if (!mimeType) {
      return NextResponse.json(
        { error: "No mime type provided" },
        { status: 400 }
      );
    }

    // Call Gemini to analyze the video
    const result = await analyzeFormWithGemini(videoBase64, mimeType);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Form analysis error:", error);
    return NextResponse.json(
      { error: "Failed to analyze exercise form" },
      { status: 500 }
    );
  }
}
