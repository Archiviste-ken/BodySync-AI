import { NextRequest, NextResponse } from "next/server";
import { extractTextFromImage } from "@/lib/ocr/extract";
import { parseBCAReport, calculateConfidence, getParsingWarnings } from "@/lib/parser/bcaParser";

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

    // Run the extraction pipeline (never throws — returns OCRResult)
    const ocrResult = await extractTextFromImage(buffer);
    const { text: rawText, warning: ocrWarning } = ocrResult;
    const ocrEmpty = !rawText || rawText.trim().length < 20;

    const metrics = ocrEmpty
      ? {
          height: null, weight: null, skeletalMuscleMass: null,
          bodyFatMass: null, bodyFatPercent: null, bmi: null,
          bmr: null, visceralFat: null, totalBodyWater: null,
          leanBodyMass: null, segmentalLean: null, segmentalFat: null,
        }
      : parseBCAReport(rawText);

    const confidence = calculateConfidence(metrics);
    const warnings = getParsingWarnings(metrics);

    if (ocrEmpty) {
      warnings.unshift(
        "OCR could not detect text clearly. Please ensure the full report is visible or enter the values manually."
      );
    }
    if (ocrWarning) {
      warnings.unshift(`OCR Note: ${ocrWarning}`);
    }

    return NextResponse.json({
      success: true,
      metrics,
      rawText,
      confidence,
      warnings,
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