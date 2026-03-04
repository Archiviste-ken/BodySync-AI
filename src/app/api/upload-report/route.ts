import { NextRequest, NextResponse } from "next/server";
import { extractMetricsFromImage } from "@/lib/ocr/extract";
import dbConnect from "@/lib/db/connect";
import Report from "@/lib/db/models/Report";

// Maximum file size: 5 MB
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

    // ── 5. AI Vision extraction (replaces OCR + regex parser) ──
    const result = await extractMetricsFromImage(buffer);

    // ── 6. Persist to MongoDB ──
    let reportId: string | null = null;
    try {
      await dbConnect();
      const report = await Report.create({
        fileName: file.name,
        rawText: result.rawText,
        metrics: result.metrics,
        confidence: result.confidence,
        warnings: result.warnings,
        ocrMode: result.mode,
        ocrDurationMs: result.durationMs,
      });
      reportId = report._id.toString();
    } catch (dbError) {
      // Non-fatal — we still return the result even if DB save fails
      console.error("MongoDB save error (non-fatal):", dbError);
    }

    // ── 7. Return structured result ──
    return NextResponse.json({
      success: true,
      reportId,
      metrics: result.metrics,
      rawText: result.rawText,
      confidence: result.confidence,
      warnings: result.warnings,
      fileName: file.name,
      ocrMode: result.mode,
      ocrDurationMs: result.durationMs,
      requiresCorrection: result.confidence < 50,
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