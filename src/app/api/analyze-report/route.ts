import { NextRequest, NextResponse } from "next/server";
import { extractTextFromImage } from "@/lib/ocr/extract";
import { parseBCAReport } from "@/lib/parser/bcaParser";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("report") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No report file provided." }, { status: 400 });
    }

    // Convert the incoming file into a Node.js Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Run the extraction pipeline
    const rawText = await extractTextFromImage(buffer);
const parsedMetrics = parseBCAReport(rawText);
    return NextResponse.json({
      success: true,
      message: "Text extracted successfully.",
      metrics: parsedMetrics,
      rawText: rawText,
    });

  } catch (error: unknown) {
    console.error("Analysis route error:", error);
    const message =
      error instanceof Error ? error.message : "An error occurred during OCR extraction.";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}