import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db/connect";
import Report from "@/lib/db/models/Report";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id || id.length !== 24) {
      return NextResponse.json({ error: "Invalid report ID." }, { status: 400 });
    }

    await dbConnect();
    const report = await Report.findById(id).lean();

    if (!report) {
      return NextResponse.json({ error: "Report not found." }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      metrics: report.metrics,
      correctedMetrics: report.correctedMetrics,
      plan: report.plan,
      confidence: report.confidence,
      warnings: report.warnings,
      fileName: report.fileName,
    });
  } catch (error) {
    console.error("Report fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch report." },
      { status: 500 }
    );
  }
}
