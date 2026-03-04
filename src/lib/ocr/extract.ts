import Tesseract from 'tesseract.js';
import sharp from 'sharp';

// ────────────────────────────────────────────────────────────
//  Timeout Tiers (Part 4 — Smart Timeout System)
// ────────────────────────────────────────────────────────────
const PREPROCESS_TIMEOUT_MS = 8_000;
const OCR_TIMEOUT_MS = 25_000;       // hard abort (Task 4)
const OCR_WARNING_MS = 12_000;        // logs warning (informational)

/**
 * Race a promise against a timeout.
 */
function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`${label} timed out after ${ms}ms`));
    }, ms);

    promise
      .then((val) => { clearTimeout(timer); resolve(val); })
      .catch((err) => { clearTimeout(timer); reject(err); });
  });
}

// ────────────────────────────────────────────────────────────
//  Image Preprocessing (Part 1 — Optimized Pipeline)
// ────────────────────────────────────────────────────────────

/**
 * Aggressive image preprocessing optimized for speed on Vercel:
 *   1. Auto-rotate (EXIF orientation from phone cameras)
 *   2. Resize to max 1200px width  (smaller = dramatically faster OCR)
 *   3. Grayscale
 *   4. Linear contrast stretch (1% clip both ends)
 *   5. Sharpen text edges
 *   6. Output PNG
 */
export async function preprocessImage(imageBuffer: Buffer): Promise<Buffer> {
  return sharp(imageBuffer)
    .rotate()                                          // auto-rotate from EXIF
    .resize({ width: 1200, withoutEnlargement: true }) // max 1200px
    .grayscale()
    .normalize()                                       // full-range contrast
    .threshold(160)                                    // binarize for text detection
    .sharpen()                                         // text edge enhancement
    .png({ compressionLevel: 6 })                     // fast PNG
    .toBuffer();
}

/**
 * Crop the image into important InBody regions for targeted OCR (Part 2).
 * Returns an array of cropped buffers corresponding to key report sections.
 *
 * InBody layout (approximate vertical zones):
 *   0-8%   : Header (ID, Height, Age, Gender, Date)
 *   8-25%  : Body Composition Analysis
 *   25-40% : Muscle-Fat Analysis
 *   40-55% : Obesity Analysis
 *   55-75% : Segmental Analysis
 *   75-100%: Research Parameters + Body Composition History
 */
async function cropRegions(imageBuffer: Buffer): Promise<Buffer[]> {
  const metadata = await sharp(imageBuffer).metadata();
  const w = metadata.width ?? 1200;
  const h = metadata.height ?? 1600;

  // Define vertical slices that cover all important data sections
  const regions = [
    // Header + Body Composition Analysis + InBody Score + Weight Control
    { left: 0, top: 0, width: w, height: Math.round(h * 0.28) },
    // Muscle-Fat Analysis + Nutrition Evaluation + Obesity Analysis
    { left: 0, top: Math.round(h * 0.22), width: w, height: Math.round(h * 0.35) },
    // Segmental + Visceral Fat + Research Parameters
    { left: 0, top: Math.round(h * 0.50), width: w, height: Math.round(h * 0.38) },
    // Bottom: Body Composition History (sometimes has weight/SMM/PBF)
    { left: 0, top: Math.round(h * 0.82), width: w, height: Math.round(h * 0.18) },
  ];

  const crops = await Promise.all(
    regions.map(async (region) => {
      try {
        // Clamp dimensions to image bounds
        const clampedWidth = Math.min(region.width, w - region.left);
        const clampedHeight = Math.min(region.height, h - region.top);
        if (clampedWidth <= 0 || clampedHeight <= 0) return null;

        return await sharp(imageBuffer)
          .extract({
            left: region.left,
            top: region.top,
            width: clampedWidth,
            height: clampedHeight,
          })
          .toBuffer();
      } catch {
        return null;
      }
    }),
  );

  return crops.filter((b): b is Buffer => b !== null);
}

// ────────────────────────────────────────────────────────────
//  OCR Extraction  (Parts 1, 2, 4)
// ────────────────────────────────────────────────────────────

/** Result from the OCR pipeline */
export interface OCRResult {
  text: string;
  mode: 'region' | 'full' | 'fallback';
  durationMs: number;
  warning?: string;
}


/**
 * Run Tesseract on a single buffer with the given timeout.
 */
async function ocrBuffer(buf: Buffer, timeoutMs: number): Promise<string> {
  const { data: { text } } = await withTimeout(
    Tesseract.recognize(buf, 'eng'),
    timeoutMs,
    'OCR',
  );

  // Debug logging — dev mode only (PART 4)
  if (process.env.NODE_ENV === 'development') {
    if (!text || text.trim().length === 0) {
      console.warn('OCR returned empty text');
    } else {
      console.log('OCR TEXT SAMPLE:');
      console.log(text.slice(0, 800));
    }
  }

  return text;
}

/**
 * Primary extraction: preprocess → region-crop → OCR each region → merge.
 * Falls back to full-page OCR if region results are too short.
 * Falls back to raw-buffer OCR if preprocessing itself fails.
 *
 * Never throws for timeout — returns partial text with a warning.
 */
export async function extractTextFromImage(imageBuffer: Buffer): Promise<OCRResult> {
  const t0 = Date.now();

  // ── Step 1: Preprocess ──
  let processed: Buffer;
  try {
    processed = await withTimeout(
      preprocessImage(imageBuffer),
      PREPROCESS_TIMEOUT_MS,
      'PREPROCESS',
    );
  } catch {
    // Preprocessing failed — try raw buffer OCR as absolute fallback
    try {
      const text = await withTimeout(ocrBuffer(imageBuffer, OCR_TIMEOUT_MS), OCR_TIMEOUT_MS, 'OCR_RAW');
      return { text, mode: 'fallback', durationMs: Date.now() - t0, warning: 'Preprocessing failed; used raw image.' };
    } catch {
      return { text: '', mode: 'fallback', durationMs: Date.now() - t0, warning: 'IMAGE_TOO_BLURRY' };
    }
  }

  // Set up a warning timer
  let ocrWarningFired = false;
  const warnTimer = setTimeout(() => { ocrWarningFired = true; }, OCR_WARNING_MS);

  // ── Step 2: Region-based OCR (Part 2) ──
  try {
    const regions = await cropRegions(processed);

    if (regions.length >= 2) {
      // OCR each region in parallel — much faster than full-page
      const perRegionTimeout = Math.round(OCR_TIMEOUT_MS / regions.length) + 2000;
      const regionTexts = await Promise.allSettled(
        regions.map((buf) => ocrBuffer(buf, perRegionTimeout)),
      );

      const merged = regionTexts
        .filter((r): r is PromiseFulfilledResult<string> => r.status === 'fulfilled')
        .map((r) => r.value)
        .join('\n');

      clearTimeout(warnTimer);

      // If region OCR got meaningful text, return it
      if (merged.trim().length > 80) {
        return {
          text: merged,
          mode: 'region',
          durationMs: Date.now() - t0,
          warning: ocrWarningFired ? 'OCR took longer than expected.' : undefined,
        };
      }
    }
  } catch {
    // Region cropping/OCR failed — fall through to full-page
  }

  // ── Step 3: Full-page fallback ──
  try {
    const text = await withTimeout(ocrBuffer(processed, OCR_TIMEOUT_MS), OCR_TIMEOUT_MS, 'OCR_FULL');
    clearTimeout(warnTimer);
    return {
      text,
      mode: 'full',
      durationMs: Date.now() - t0,
      warning: ocrWarningFired ? 'OCR took longer than expected.' : undefined,
    };
  } catch (err) {
    clearTimeout(warnTimer);
    const msg = err instanceof Error ? err.message : '';
    if (msg.includes('timed out')) {
      return { text: '', mode: 'full', durationMs: Date.now() - t0, warning: 'OCR_TIMEOUT' };
    }
    return { text: '', mode: 'full', durationMs: Date.now() - t0, warning: 'OCR_FAILED' };
  }
}