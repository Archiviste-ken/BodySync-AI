import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("report") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Step 2 complete: File is received server-side.
    // In Step 3, we will pipe this file buffer into Sharp and Tesseract.js.
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Mock successful upload response for now
    return NextResponse.json({ 
      success: true, 
      message: "File received successfully",
      fileName: file.name,
      size: file.size
    });

  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Failed to process upload" }, { status: 500 });
  }
}