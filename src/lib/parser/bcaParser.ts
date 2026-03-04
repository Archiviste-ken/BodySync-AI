export interface ParsedBCAData {
  weight: number | null;
  skeletalMuscleMass: number | null;
  bodyFatPercent: number | null;
  bodyFatMass: number | null;
  bmi: number | null;
  bmr: number | null;
  visceralFat: number | null;
}

/**
 * Extracts specific body metrics from raw OCR text.
 * @param ocrText - The raw text string extracted by Tesseract.js
 * @returns An object containing the parsed numeric values or null if not found.
 */
export function parseBCAReport(ocrText: string): ParsedBCAData {
  // Normalize text: remove extra whitespace, convert to uppercase for easier matching
  const normalizedText = ocrText.replace(/\s+/g, ' ').toUpperCase();

  // Helper function to extract a number based on a regex pattern
  const extractValue = (pattern: RegExp): number | null => {
    const match = normalizedText.match(pattern);
    if (match && match[1]) {
      // Remove commas (e.g., BMR 1,800 -> 1800) and parse to float
      const cleanNumber = match[1].replace(/,/g, '');
      const parsed = parseFloat(cleanNumber);
      return isNaN(parsed) ? null : parsed;
    }
    return null;
  };

  // RegEx Patterns
  // Looks for keywords, allows optional spaces/characters, then captures the first number it finds
  const patterns = {
    weight: /(?:WEIGHT|WT)[\s\S]*?([\d.]+)\s*(?:KG|LBS?)/,
    skeletalMuscleMass: /(?:SKELETAL MUSCLE MASS|SMM)[\s\S]*?([\d.]+)\s*(?:KG|LBS?)/,
    bodyFatMass: /(?:BODY FAT MASS|FAT MASS|BFM)[\s\S]*?([\d.]+)\s*(?:KG|LBS?)/,
    bodyFatPercent: /(?:PERCENT BODY FAT|PBF|BODY FAT\s*%|FAT\s*%)[\s\S]*?([\d.]+)\s*%?/,
    bmi: /(?:BMI|BODY MASS INDEX)[\s\S]*?([\d.]+)/,
    bmr: /(?:BMR|BASAL METABOLIC RATE)[\s\S]*?([\d,]+)\s*(?:KCAL|CAL)?/,
    visceralFat: /(?:VISCERAL FAT LEVEL|VFL|VISCERAL FAT)[\s\S]*?([\d.]+)/,
  };

  return {
    weight: extractValue(patterns.weight),
    skeletalMuscleMass: extractValue(patterns.skeletalMuscleMass),
    bodyFatMass: extractValue(patterns.bodyFatMass),
    bodyFatPercent: extractValue(patterns.bodyFatPercent),
    bmi: extractValue(patterns.bmi),
    bmr: extractValue(patterns.bmr),
    visceralFat: extractValue(patterns.visceralFat),
  };
}