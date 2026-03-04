import { NextRequest, NextResponse } from "next/server";
import { extractTextFromImage, type OCRResult } from "@/lib/ocr/extract";
import {
  parseBCAReport,
  calculateConfidence,
  getParsingWarnings,
} from "@/lib/parser/bcaParser";
import dbConnect from "@/lib/db/connect";
import Report from "@/lib/db/models/Report";

// Maximum file size: 5 MB (Part 10 — Performance)
const MAX_FILE_SIZE = 5 * 1024 * 1024;

/**
 * POST /api/upload-report
 *
 * Accepts a multipart form with a "report" file field.
 * Pipeline: validation → OCR (region-based, never throws) → multi-pass parsing → DB save.
 * Always returns a JSON response — never leaves the promise unresolved.
 */
export async function POST(request: NextRequest) {
  try {
    // ── 1. Extract file from form data ──
    let formData: FormData;
    try {
      formData = await request.formData();
    } catch {
      return NextResponse.json(
        { error: "Invalid form data.", code: "INVALID_FORMAT" },
        { status: 400 },
      );
    }

    const file = formData.get("report") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided.", code: "NO_FILE" },
        { status: 400 },
      );
    }

    // ── 2. Validate file type ──
    const validTypes = ["jpeg", "jpg", "png", "webp", "heic", "pdf"];
    const fileExt = file.name.split(".").pop()?.toLowerCase() ?? "";
    const mimeMatch = validTypes.some((t) => file.type.includes(t));
    const extMatch = validTypes.includes(fileExt);

    if (!mimeMatch && !extMatch) {
      return NextResponse.json(
        {
          error:
            "Unsupported file format. Please upload a JPG, PNG, WebP, or PDF.",
          code: "INVALID_FORMAT",
        },
        { status: 400 },
      );
    }

    // ── 3. Validate file size (5 MB) ──
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          error: "File is too large. Maximum size is 5 MB.",
          code: "FILE_TOO_LARGE",
        },
        { status: 400 },
      );
    }

    // ── 4. Read buffer ──
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // ── 5. OCR extraction (never throws — returns OCRResult) ──
    let ocrResult: OCRResult;
    try {
      ocrResult = await extractTextFromImage(buffer);
    } catch (err) {
      // Defensive: should never happen since extractTextFromImage never throws,
      // but if it does, map to a user-friendly error.
      console.error("Unexpected OCR error:", err);
      return NextResponse.json(
        {
          error:
            "Could not process the image. Please try a different photo.",
          code: "OCR_FAILED",
        },
        { status: 422 },
      );
    }

    const { text: rawText, mode: ocrMode, durationMs, warning: ocrWarning } = ocrResult;

    // ── 6. Parse whatever text was extracted (Task 3 — never block user) ──
    // Skip parsing if OCR returned very little text (< 50 chars = likely failed)
    const ocrEmpty = !rawText || rawText.trim().length < 50;

    // Always attempt parsing even with partial/empty text
    let metrics;
    try {
      metrics = ocrEmpty
        ? {
            height: null, weight: null, skeletalMuscleMass: null,
            bodyFatMass: null, bodyFatPercent: null, bmi: null,
            bmr: null, visceralFat: null, totalBodyWater: null,
            leanBodyMass: null, segmentalLean: null, segmentalFat: null,
          }
        : parseBCAReport(rawText);
    } catch {
      metrics = {
        height: null, weight: null, skeletalMuscleMass: null,
        bodyFatMass: null, bodyFatPercent: null, bmi: null,
        bmr: null, visceralFat: null, totalBodyWater: null,
        leanBodyMass: null, segmentalLean: null, segmentalFat: null,
      };
    }

    const confidence = calculateConfidence(metrics);
    const warnings = getParsingWarnings(metrics);

    // Append OCR-level warnings (Task 5 — improved message)
    if (ocrEmpty) {
      warnings.unshift(
        "OCR could not detect text clearly. Please ensure the full report is visible or enter the values manually."
      );
    }
    if (ocrWarning) {
      warnings.unshift(`OCR Note: ${ocrWarning}`);
    }

    // ── 8. Persist to MongoDB ──
    let reportId: string | null = null;
    try {
      await dbConnect();
      const report = await Report.create({
        fileName: file.name,
        rawText,
        metrics,
        confidence,
        warnings,
        ocrMode,
        ocrDurationMs: durationMs,
      });
      reportId = report._id.toString();
    } catch (dbError) {
      // Non-fatal — we still return the result even if DB save fails
      console.error("MongoDB save error (non-fatal):", dbError);
    }

    // ── 9. Return structured result ──
    return NextResponse.json({
      success: true,
      reportId,
      metrics,
      rawText,
      confidence,
      warnings,
      fileName: file.name,
      ocrMode,
      ocrDurationMs: durationMs,
      requiresCorrection: confidence < 50 || ocrEmpty,
    });
  } catch (error) {
    // Catch-all: ensures the API ALWAYS returns a response
    console.error("Upload route unhandled error:", error);
    const message =
      error instanceof Error ? error.message : "An unexpected error occurred.";
    return NextResponse.json(
      { error: message, code: "INTERNAL_ERROR" },
      { status: 500 },
    );
  }
}