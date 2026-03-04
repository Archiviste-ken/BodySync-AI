import type { ParsedBCAData, SegmentalData } from "@/lib/types";

// Re-export for backwards compat
export type { ParsedBCAData };

// ───────────────────────────────────────────────────────
//  Data Validation Ranges
// ───────────────────────────────────────────────────────

interface ValidationRange {
  min: number;
  max: number;
  label: string;
}

const VALID_RANGES: Record<string, ValidationRange> = {
  height:             { min: 120, max: 230, label: "Height" },
  weight:             { min: 30,  max: 250, label: "Weight" },
  skeletalMuscleMass: { min: 5,   max: 80,  label: "Skeletal Muscle Mass" },
  bodyFatMass:        { min: 1,   max: 120, label: "Body Fat Mass" },
  bodyFatPercent:     { min: 3,   max: 60,  label: "Body Fat %" },
  bmi:                { min: 10,  max: 50,  label: "BMI" },
  bmr:                { min: 800, max: 4000, label: "BMR" },
  visceralFat:        { min: 1,   max: 20,  label: "Visceral Fat" },
  totalBodyWater:     { min: 10,  max: 80,  label: "Total Body Water" },
  leanBodyMass:       { min: 20,  max: 150, label: "Lean Body Mass" },
};

function validateValue(key: string, value: number | null): { valid: boolean; warning?: string } {
  if (value === null) return { valid: true };
  const range = VALID_RANGES[key];
  if (!range) return { valid: true };
  if (value < range.min || value > range.max) {
    return {
      valid: false,
      warning: `${range.label} value ${value} is outside the expected range (${range.min}–${range.max}). Please verify.`,
    };
  }
  return { valid: true };
}

// ───────────────────────────────────────────────────────
//  OCR Text Cleaning
// ───────────────────────────────────────────────────────

function cleanOCRText(raw: string): string {
  let text = raw;

  text = text.replace(/\r\n/g, "\n");

  // Fix common OCR letter→digit mistakes in numeric contexts
  text = text.replace(/(\d)[Oo]/g, "$10");
  text = text.replace(/[Oo](\d)/g, "0$1");
  text = text.replace(/(\d)[lI]/g, "$11");
  text = text.replace(/[lI](\d)/g, "1$1");
  text = text.replace(/(\d)[Ss](?=\d)/g, "$15");

  // Fix "," as decimal separator (65,3 → 65.3)
  text = text.replace(/(\d),(\d{1,2})(?!\d)/g, "$1.$2");

  // Normalize whitespace
  text = text.replace(/[ \t]+/g, " ");
  text = text.replace(/\n{3,}/g, "\n\n");

  // Common OCR word fixes
  text = text.replace(/\bWelght\b/gi, "Weight");
  text = text.replace(/\bWeiqht\b/gi, "Weight");
  text = text.replace(/\bMuscIe\b/gi, "Muscle");
  text = text.replace(/\bMuscie\b/gi, "Muscle");
  text = text.replace(/\bSkeletaI\b/gi, "Skeletal");
  text = text.replace(/\bPercenl\b/gi, "Percent");
  text = text.replace(/\bBasaI\b/gi, "Basal");
  text = text.replace(/\bMetaboIic\b/gi, "Metabolic");
  text = text.replace(/\bVisceral\b/gi, "Visceral");
  text = text.replace(/\bVisceraI\b/gi, "Visceral");
  text = text.replace(/\bInbaody\b/gi, "InBody");
  text = text.replace(/\bLBvel\b/gi, "Level");
  text = text.replace(/\bObeslty\b/gi, "Obesity");
  text = text.replace(/\bAnaiysis\b/gi, "Analysis");
  text = text.replace(/\bAnlysis\b/gi, "Analysis");
  text = text.replace(/\bSegmentai\b/gi, "Segmental");
  text = text.replace(/\bFai\b/gi, "Fat");
  text = text.replace(/\bPBE\b/g, "PBF");
  text = text.replace(/\bBMl\b/g, "BMI");

  return text;
}

// ───────────────────────────────────────────────────────
//  Flexible Value Extraction
// ───────────────────────────────────────────────────────

function extractFirstMatch(text: string, patterns: RegExp[]): number | null {
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      const cleaned = match[1].replace(/,/g, "").trim();
      const parsed = parseFloat(cleaned);
      if (!isNaN(parsed) && parsed > 0) {
        return parsed;
      }
    }
  }
  return null;
}

/** Extract ALL matches and pick the most common or sensible value */
function extractBestMatch(text: string, patterns: RegExp[], validRange?: ValidationRange): number | null {
  const candidates: number[] = [];
  for (const pattern of patterns) {
    const matches = text.matchAll(new RegExp(pattern.source, pattern.flags.includes('g') ? pattern.flags : pattern.flags + 'g'));
    for (const match of matches) {
      if (match[1]) {
        const cleaned = match[1].replace(/,/g, "").trim();
        const parsed = parseFloat(cleaned);
        if (!isNaN(parsed) && parsed > 0) {
          if (validRange) {
            if (parsed >= validRange.min && parsed <= validRange.max) {
              candidates.push(parsed);
            }
          } else {
            candidates.push(parsed);
          }
        }
      }
    }
  }
  if (candidates.length === 0) return null;
  // If multiple matches, prefer the first one in valid range
  return candidates[0];
}

function extractSegmental(text: string, keyword: string): SegmentalData | null {
  const upper = text.toUpperCase();
  const idx = upper.indexOf(keyword.toUpperCase());
  if (idx === -1) return null;

  const chunk = upper.substring(idx, idx + 500);
  const numbers = chunk.match(/[\d]+\.[\d]+/g);
  if (!numbers || numbers.length < 5) return null;

  return {
    rightArm: parseFloat(numbers[0]) || null,
    leftArm: parseFloat(numbers[1]) || null,
    trunk: parseFloat(numbers[2]) || null,
    rightLeg: parseFloat(numbers[3]) || null,
    leftLeg: parseFloat(numbers[4]) || null,
  };
}

// ───────────────────────────────────────────────────────
//  Pass 1: Regex Parser (primary)
// ───────────────────────────────────────────────────────

function regexParse(flat: string, upper: string): ParsedBCAData {
  // Height — from header area or body text
  const height = extractBestMatch(flat, [
    /(?:HEIGHT|HT)[^0-9]{0,10}(\d{2,3}\.?\d*)\s*(?:CM)?/i,
    /STATURE[^0-9]{0,10}(\d{2,3}\.?\d*)/i,
    /(\d{3}\.\d)\s*(?:CM|cm)/i,
  ], VALID_RANGES.height);

  // Weight — "Sum of the above" line or explicit Weight label
  const weight = extractBestMatch(flat, [
    /SUM\s*OF\s*THE\s*ABOVE[^0-9]{0,10}(\d{2,3}\.?\d*)/i,
    /(?:WEIGHT|WT)[^0-9]{0,10}(\d{2,3}\.?\d*)/i,
    /BODY\s*WEIGHT[^0-9]{0,10}(\d{2,3}\.?\d*)/i,
  ], VALID_RANGES.weight);

  // SMM — Skeletal Muscle Mass
  const skeletalMuscleMass = extractBestMatch(flat, [
    /SKELETAL\s*MUSCLE\s*MASS[^0-9]{0,10}(\d{1,3}\.?\d*)/i,
    /SMM[^0-9]{0,10}(\d{1,3}\.?\d*)/i,
    /SKELETAL\s*MUSCLE\s*M[AOa][Ss5][Ss5][^0-9]{0,10}(\d{1,3}\.?\d*)/i,
  ], VALID_RANGES.skeletalMuscleMass);

  // Body Fat Mass
  const bodyFatMass = extractBestMatch(flat, [
    /BODY\s*FAT\s*MASS[^0-9]{0,10}(\d{1,3}\.?\d*)/i,
    /BFM[^0-9]{0,10}(\d{1,3}\.?\d*)/i,
    /FAT\s*MASS[^0-9]{0,10}(\d{1,3}\.?\d*)/i,
    /EXCESS\s*ENERGY.*?STORED.*?(\d{1,3}\.?\d*)\s*/i,
  ], VALID_RANGES.bodyFatMass);

  // PBF — Percent Body Fat
  const bodyFatPercent = extractBestMatch(flat, [
    /PBF[^0-9]{0,10}(\d{1,2}\.?\d*)\s*%?/i,
    /PERCENT\s*BODY\s*FAT[^0-9]{0,10}(\d{1,2}\.?\d*)/i,
    /BODY\s*FAT\s*(?:%|PERCENT(?:AGE)?)[^0-9]{0,10}(\d{1,2}\.?\d*)/i,
  ], VALID_RANGES.bodyFatPercent);

  // BMI
  const bmi = extractBestMatch(flat, [
    /BMI[^0-9]{0,10}(\d{1,2}\.?\d*)/i,
    /BODY\s*MASS\s*INDEX[^0-9]{0,10}(\d{1,2}\.?\d*)/i,
  ], VALID_RANGES.bmi);

  // BMR — Basal Metabolic Rate
  const bmr = extractBestMatch(flat, [
    /BASAL\s*METABOLIC\s*RATE[^0-9]{0,10}(\d[\d,]*\.?\d*)/i,
    /BMR[^0-9]{0,10}(\d[\d,]*\.?\d*)/i,
  ], VALID_RANGES.bmr);

  // Visceral Fat Level
  const visceralFat = extractBestMatch(flat, [
    /VISCERAL\s*FAT\s*(?:LEVEL)?[^0-9]{0,10}(\d{1,2}\.?\d*)/i,
    /VFL[^0-9]{0,10}(\d{1,2}\.?\d*)/i,
    /LEVEL[^0-9]{0,10}(\d{1,2})\s/i,
  ], VALID_RANGES.visceralFat);

  // Total Body Water
  const totalBodyWater = extractBestMatch(flat, [
    /TOTAL\s*BODY\s*WATER[^0-9]{0,10}(\d{1,3}\.?\d*)/i,
    /TBW[^0-9]{0,10}(\d{1,3}\.?\d*)/i,
  ], VALID_RANGES.totalBodyWater);

  // Lean Body Mass / Fat Free Mass
  const leanBodyMass = extractBestMatch(flat, [
    /(?:FAT\s*FREE\s*MASS|FFM)[^0-9]{0,10}(\d{1,3}\.?\d*)/i,
    /(?:LEAN\s*BODY\s*MASS|LBM)[^0-9]{0,10}(\d{1,3}\.?\d*)/i,
  ], VALID_RANGES.leanBodyMass);

  // Segmental Analysis
  const segmentalLean = extractSegmental(upper, "SEGMENTAL LEAN") ??
    extractSegmental(upper, "LEAN ANALYSIS") ??
    extractSegmental(upper, "LEAN MASS") ??
    extractSegmental(upper, "MUSCLE ANALYSIS");

  const segmentalFat = extractSegmental(upper, "SEGMENTAL FAT") ??
    extractSegmental(upper, "FAT ANALYSIS") ??
    extractSegmental(upper, "ECW RATIO");

  return {
    height, weight, skeletalMuscleMass, bodyFatMass, bodyFatPercent,
    bmi, bmr, visceralFat, totalBodyWater, leanBodyMass,
    segmentalLean, segmentalFat,
  };
}

// ───────────────────────────────────────────────────────
//  Pass 2: Heuristic Parser (fallback)
// ───────────────────────────────────────────────────────

/**
 * Scans line-by-line for "Label ... Number" patterns.
 * Catches values the regex parser misses due to unusual OCR spacing/formatting.
 */
function heuristicParse(text: string): Partial<ParsedBCAData> {
  const result: Partial<ParsedBCAData> = {};
  const lines = text.split('\n');

  for (const rawLine of lines) {
    const line = rawLine.toUpperCase().trim();
    // Extract trailing number from the line
    const numMatch = line.match(/(\d{1,4}\.?\d{0,2})\s*(?:KG|%|KCAL|CAL|CM|L)?\s*$/);
    if (!numMatch) continue;
    const val = parseFloat(numMatch[1]);
    if (isNaN(val) || val <= 0) continue;

    if (/HEIGHT|HT\b|STATURE/.test(line) && val >= 120 && val <= 230) {
      result.height = val;
    } else if (/SUM\s*OF\s*THE\s*ABOVE/.test(line) && val >= 30 && val <= 250) {
      result.weight = val;
    } else if (/WEIGHT/.test(line) && !result.weight && val >= 30 && val <= 250 && !/FAT/.test(line) && !/CONTROL/.test(line) && !/TARGET/.test(line)) {
      result.weight = val;
    } else if ((/SKELETAL.*MUSCLE|SMM\b/.test(line)) && val >= 5 && val <= 80) {
      result.skeletalMuscleMass = val;
    } else if (/BODY\s*FAT\s*MASS|BFM\b/.test(line) && val >= 1 && val <= 120) {
      result.bodyFatMass = val;
    } else if ((/PBF|PERCENT.*BODY.*FAT|BODY\s*FAT\s*%/.test(line)) && val >= 3 && val <= 60) {
      result.bodyFatPercent = val;
    } else if (/BMI\b|BODY\s*MASS\s*INDEX/.test(line) && val >= 10 && val <= 50 && !/BMR/.test(line)) {
      result.bmi = val;
    } else if ((/BMR\b|BASAL.*METABOLIC/.test(line)) && val >= 800 && val <= 4000) {
      result.bmr = val;
    } else if (/VISCERAL\s*FAT/.test(line) && val >= 1 && val <= 20) {
      result.visceralFat = val;
    } else if ((/TOTAL.*BODY.*WATER|TBW\b/.test(line)) && val >= 10 && val <= 80) {
      result.totalBodyWater = val;
    } else if ((/FAT.*FREE.*MASS|FFM\b|LEAN.*BODY.*MASS|LBM\b/.test(line)) && val >= 20 && val <= 150) {
      result.leanBodyMass = val;
    }
  }

  return result;
}

// ───────────────────────────────────────────────────────
//  Pass 3: Number-proximity heuristic
// ───────────────────────────────────────────────────────

/**
 * Last resort: look for isolated numbers near known InBody labels.
 * Uses a sliding window around each keyword.
 */
function proximityParse(text: string): Partial<ParsedBCAData> {
  const result: Partial<ParsedBCAData> = {};
  const flat = text.toUpperCase().replace(/\n/g, ' ');

  const search = (keywords: string[], range: ValidationRange): number | null => {
    for (const kw of keywords) {
      const idx = flat.indexOf(kw);
      if (idx === -1) continue;
      // Look in a 60-char window after the keyword
      const window = flat.substring(idx, idx + 60);
      const nums = window.match(/\d+\.?\d*/g);
      if (nums) {
        for (const n of nums) {
          const v = parseFloat(n);
          if (v >= range.min && v <= range.max) return v;
        }
      }
    }
    return null;
  };

  result.height = search(['HEIGHT', 'HT ', 'STATURE'], VALID_RANGES.height);
  result.weight = search(['SUM OF THE ABOVE', 'WEIGHT (KG', 'WEIGHT(KG'], VALID_RANGES.weight);
  result.skeletalMuscleMass = search(['SKELETAL MUSCLE MASS', 'SMM'], VALID_RANGES.skeletalMuscleMass);
  result.bodyFatMass = search(['BODY FAT MASS', 'BFM'], VALID_RANGES.bodyFatMass);
  result.bodyFatPercent = search(['PBF', 'PERCENT BODY FAT', 'BODY FAT %'], VALID_RANGES.bodyFatPercent);
  result.bmi = search(['BMI', 'BODY MASS INDEX'], VALID_RANGES.bmi);
  result.bmr = search(['BASAL METABOLIC RATE', 'BMR'], VALID_RANGES.bmr);
  result.visceralFat = search(['VISCERAL FAT LEVEL', 'VISCERAL FAT', 'LEVEL '], VALID_RANGES.visceralFat);
  result.totalBodyWater = search(['TOTAL BODY WATER', 'TBW'], VALID_RANGES.totalBodyWater);
  result.leanBodyMass = search(['FAT FREE MASS', 'FFM', 'LEAN BODY MASS'], VALID_RANGES.leanBodyMass);

  return result;
}

// ───────────────────────────────────────────────────────
//  Multi-Pass Orchestrator (Part 3)
// ───────────────────────────────────────────────────────

/**
 * Merge partial results: only fill in nulls from the fallback.
 */
function mergePartial(base: ParsedBCAData, patch: Partial<ParsedBCAData>): ParsedBCAData {
  const merged = { ...base };
  const keys: (keyof ParsedBCAData)[] = [
    'height', 'weight', 'skeletalMuscleMass', 'bodyFatMass', 'bodyFatPercent',
    'bmi', 'bmr', 'visceralFat', 'totalBodyWater', 'leanBodyMass',
  ];
  for (const key of keys) {
    if (merged[key] === null && patch[key] !== undefined && patch[key] !== null) {
      (merged as Record<string, unknown>)[key] = patch[key];
    }
  }
  return merged;
}

/**
 * Multi-pass BCA report parser.
 *
 * Pass 1: Regex patterns (most accurate)
 * Pass 2: Line-by-line heuristic (catches unusual formatting)
 * Pass 3: Keyword-proximity scan (last resort)
 *
 * Never fails completely — returns whatever partial data was found.
 */
export function parseBCAReport(ocrText: string): ParsedBCAData {
  // PART 1: Guard against empty/minimal OCR text
  if (!ocrText || ocrText.trim().length < 50) {
    return {
      height: null, weight: null, skeletalMuscleMass: null,
      bodyFatMass: null, bodyFatPercent: null, bmi: null,
      bmr: null, visceralFat: null, totalBodyWater: null,
      leanBodyMass: null, segmentalLean: null, segmentalFat: null,
    };
  }

  const cleaned = cleanOCRText(ocrText);

  // PART 4: Debug logging in development mode
  if (process.env.NODE_ENV === "development") {
    console.log("OCR TEXT SAMPLE:");
    console.log(cleaned.slice(0, 800));
  }

  const upper = cleaned.toUpperCase();
  const flat = upper.replace(/\n/g, " ").replace(/\s+/g, " ");

  // Pass 1: Regex parser
  let data = regexParse(flat, upper);

  // Pass 2: Fill gaps with heuristic parser
  const heuristic = heuristicParse(cleaned);
  data = mergePartial(data, heuristic);

  // Pass 3: Fill remaining gaps with proximity parser
  const proximity = proximityParse(cleaned);
  data = mergePartial(data, proximity);

  // Derived: compute leanBodyMass if missing but we have weight + bodyFatMass
  if (data.leanBodyMass === null && data.weight !== null && data.bodyFatMass !== null) {
    data.leanBodyMass = Math.round((data.weight - data.bodyFatMass) * 10) / 10;
  }

  // Derived: compute BMR via Katch-McArdle if missing
  if (data.bmr === null && data.weight !== null && data.bodyFatPercent !== null) {
    const lbm = data.weight * (1 - data.bodyFatPercent / 100);
    data.bmr = Math.round(370 + 21.6 * lbm);
  }

  return data;
}

// ───────────────────────────────────────────────────────
//  Confidence Scoring
// ───────────────────────────────────────────────────────

const EXPECTED_FIELDS: (keyof ParsedBCAData)[] = [
  "height", "weight", "skeletalMuscleMass", "bodyFatPercent",
  "bodyFatMass", "bmi", "bmr", "visceralFat",
];

export function calculateConfidence(data: ParsedBCAData): number {
  const found = EXPECTED_FIELDS.filter((k) => data[k] !== null).length;
  return Math.round((found / EXPECTED_FIELDS.length) * 100);
}

export function getParsingWarnings(data: ParsedBCAData): string[] {
  const warnings: string[] = [];

  // Missing-field warnings
  if (data.weight === null) warnings.push("Weight could not be detected.");
  if (data.skeletalMuscleMass === null) warnings.push("Skeletal Muscle Mass (SMM) could not be detected.");
  if (data.bodyFatPercent === null) warnings.push("Body Fat Percentage (PBF) could not be detected.");
  if (data.bmi === null) warnings.push("BMI could not be detected.");
  if (data.bmr === null) warnings.push("Basal Metabolic Rate (BMR) could not be detected.");
  if (data.visceralFat === null) warnings.push("Visceral Fat Level could not be detected.");
  if (data.height === null) warnings.push("Height could not be detected.");
  if (data.bodyFatMass === null) warnings.push("Body Fat Mass could not be detected.");

  // Range-validation warnings
  const numericKeys: (keyof ParsedBCAData)[] = [
    "height", "weight", "skeletalMuscleMass", "bodyFatMass",
    "bodyFatPercent", "bmi", "bmr", "visceralFat",
    "totalBodyWater", "leanBodyMass",
  ];

  for (const key of numericKeys) {
    const val = data[key];
    if (typeof val === "number") {
      const result = validateValue(key, val);
      if (!result.valid && result.warning) {
        warnings.push(result.warning);
      }
    }
  }

  return warnings;
}