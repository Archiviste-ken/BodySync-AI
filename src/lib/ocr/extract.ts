import Groq from 'groq-sdk';
import sharp from 'sharp';
import type { ParsedBCAData, SegmentalData } from '@/lib/types';

// ────────────────────────────────────────────────────────────
//  Groq Vision-based BCA Report Extraction
//  Replaces tesseract.js which is broken under Next.js Turbopack
// ────────────────────────────────────────────────────────────

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

/** Result from the extraction pipeline */
export interface OCRResult {
  text: string;
  mode: string;
  durationMs: number;
  warning?: string;
}

export interface ExtractionResult {
  metrics: ParsedBCAData;
  rawText: string;
  confidence: number;
  warnings: string[];
  mode: string;
  durationMs: number;
}

// ────────────────────────────────────────────────────────────
//  Prompt for structured metric extraction
// ────────────────────────────────────────────────────────────

const EXTRACTION_PROMPT = `You are analyzing a Body Composition Analysis (BCA) report image, likely from an InBody machine or similar body composition analyzer.

Extract ALL of the following metrics from the image. Return ONLY a valid JSON object with these exact keys:

{
  "height": <number in cm or null>,
  "weight": <number in kg or null>,
  "skeletalMuscleMass": <number in kg or null>,
  "bodyFatMass": <number in kg or null>,
  "bodyFatPercent": <number as percentage value or null>,
  "bmi": <number or null>,
  "bmr": <number in kcal or null>,
  "visceralFat": <number (level) or null>,
  "totalBodyWater": <number in liters or null>,
  "leanBodyMass": <number in kg or null>,
  "segmentalLean": {
    "rightArm": <number in kg or null>,
    "leftArm": <number in kg or null>,
    "trunk": <number in kg or null>,
    "rightLeg": <number in kg or null>,
    "leftLeg": <number in kg or null>
  },
  "segmentalFat": {
    "rightArm": <number in kg or null>,
    "leftArm": <number in kg or null>,
    "trunk": <number in kg or null>,
    "rightLeg": <number in kg or null>,
    "leftLeg": <number in kg or null>
  },
  "rawText": "<all visible text from the report>"
}

Rules:
- Use null for any metric you cannot find or read clearly
- Numbers should be numeric values, not strings
- For BMR, look for "Basal Metabolic Rate" — the value is usually in kcal
- For visceral fat, look for "Visceral Fat Level" or "Visceral Fat Area"
- For body fat %, look for "Percent Body Fat" or "PBF" or "Body Fat %"
- For segmental data, use the values in kg if available
- rawText should contain ALL text you can read from the image, line by line
- Return ONLY the JSON object, no markdown code fences, no explanation`;

// ────────────────────────────────────────────────────────────
//  Image Preprocessing (resize for faster API transfer)
// ────────────────────────────────────────────────────────────

async function preprocessForVision(imageBuffer: Buffer): Promise<Buffer> {
  return sharp(imageBuffer)
    .rotate()                                          // auto-rotate from EXIF
    .resize({ width: 1500, withoutEnlargement: true }) // reasonable size for vision
    .png({ compressionLevel: 6 })
    .toBuffer();
}

// ────────────────────────────────────────────────────────────
//  Main Extraction Function
// ────────────────────────────────────────────────────────────

/**
 * Extract BCA metrics from a report image using Groq Vision API.
 * Returns structured metrics, raw text, confidence score, and warnings.
 */
export async function extractMetricsFromImage(imageBuffer: Buffer): Promise<ExtractionResult> {
  const t0 = Date.now();
  const warnings: string[] = [];

  // Preprocess: resize to reduce payload size
  let processedBuffer: Buffer;
  try {
    processedBuffer = await preprocessForVision(imageBuffer);
  } catch {
    processedBuffer = imageBuffer;
    warnings.push('Image preprocessing failed; using original image.');
  }

  // Convert to base64 for the API
  const base64Image = processedBuffer.toString('base64');

  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: EXTRACTION_PROMPT },
            {
              type: 'image_url',
              image_url: {
                url: `data:image/png;base64,${base64Image}`,
              },
            },
          ],
        },
      ],
      model: 'meta-llama/llama-4-scout-17b-16e-instruct',
      temperature: 0.1,
      max_completion_tokens: 2048,
    });

    const responseText = completion.choices[0]?.message?.content ?? '';

    // Extract JSON from the response (handle possible markdown wrapping)
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      warnings.push('AI could not parse the report image. Please enter values manually.');
      return {
        metrics: emptyMetrics(),
        rawText: responseText,
        confidence: 0,
        warnings,
        mode: 'ai-vision',
        durationMs: Date.now() - t0,
      };
    }

    const parsed = JSON.parse(jsonMatch[0]);
    const rawText: string = parsed.rawText || responseText;

    const metrics: ParsedBCAData = {
      height: safeNumber(parsed.height),
      weight: safeNumber(parsed.weight),
      skeletalMuscleMass: safeNumber(parsed.skeletalMuscleMass),
      bodyFatMass: safeNumber(parsed.bodyFatMass),
      bodyFatPercent: safeNumber(parsed.bodyFatPercent),
      bmi: safeNumber(parsed.bmi),
      bmr: safeNumber(parsed.bmr),
      visceralFat: safeNumber(parsed.visceralFat),
      totalBodyWater: safeNumber(parsed.totalBodyWater),
      leanBodyMass: safeNumber(parsed.leanBodyMass),
      segmentalLean: parseSegmental(parsed.segmentalLean),
      segmentalFat: parseSegmental(parsed.segmentalFat),
    };

    // Calculate confidence based on how many core fields were extracted
    const coreFields = [
      metrics.height, metrics.weight, metrics.skeletalMuscleMass,
      metrics.bodyFatMass, metrics.bodyFatPercent, metrics.bmi,
      metrics.bmr, metrics.visceralFat, metrics.totalBodyWater,
      metrics.leanBodyMass,
    ];
    const found = coreFields.filter((v) => v !== null).length;
    const confidence = Math.round((found / coreFields.length) * 100);

    if (confidence < 30) {
      warnings.push('Only a few metrics could be extracted. Please verify and correct the values.');
    }

    return {
      metrics,
      rawText,
      confidence,
      warnings,
      mode: 'ai-vision',
      durationMs: Date.now() - t0,
    };
  } catch (error) {
    console.error('Groq Vision API error:', error);
    warnings.push('AI extraction failed. Please try again or enter values manually.');
    return {
      metrics: emptyMetrics(),
      rawText: '',
      confidence: 0,
      warnings,
      mode: 'ai-vision-failed',
      durationMs: Date.now() - t0,
    };
  }
}

// ────────────────────────────────────────────────────────────
//  Backward-compatible OCR export
// ────────────────────────────────────────────────────────────

export async function extractTextFromImage(imageBuffer: Buffer): Promise<OCRResult> {
  const result = await extractMetricsFromImage(imageBuffer);
  return {
    text: result.rawText,
    mode: result.mode,
    durationMs: result.durationMs,
    warning: result.warnings.length > 0 ? result.warnings.join('; ') : undefined,
  };
}

// ────────────────────────────────────────────────────────────
//  Helpers
// ────────────────────────────────────────────────────────────

function safeNumber(val: unknown): number | null {
  if (val === null || val === undefined) return null;
  const n = typeof val === 'string' ? parseFloat(val) : Number(val);
  return isNaN(n) || n < 0 ? null : n;
}

function parseSegmental(data: unknown): SegmentalData | null {
  if (!data || typeof data !== 'object') return null;
  const d = data as Record<string, unknown>;
  const result: SegmentalData = {
    rightArm: safeNumber(d.rightArm),
    leftArm: safeNumber(d.leftArm),
    trunk: safeNumber(d.trunk),
    rightLeg: safeNumber(d.rightLeg),
    leftLeg: safeNumber(d.leftLeg),
  };
  if (Object.values(result).every((v) => v === null)) return null;
  return result;
}

function emptyMetrics(): ParsedBCAData {
  return {
    height: null, weight: null, skeletalMuscleMass: null,
    bodyFatMass: null, bodyFatPercent: null, bmi: null,
    bmr: null, visceralFat: null, totalBodyWater: null,
    leanBodyMass: null, segmentalLean: null, segmentalFat: null,
  };
}
