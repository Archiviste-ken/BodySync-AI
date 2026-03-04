import type {
  ParsedBCAData,
  BodyCompositionAnalysis,
  NutritionTargets,
  InsightCard,
  MuscleBalance,
} from "@/lib/types";

// ────────────────────────────────────────────────────────────
//  Body Composition Analysis Engine (Parts 4, 5, 6, 7, 8)
// ────────────────────────────────────────────────────────────

/** Perform complete body composition analysis from parsed BCA data */
export function analyzeBodyComposition(data: ParsedBCAData): BodyCompositionAnalysis {
  const weight = data.weight;
  const smm = data.skeletalMuscleMass;
  const bfm = data.bodyFatMass;
  const pbf = data.bodyFatPercent;
  const bmi = data.bmi;
  const bmr = data.bmr;
  const vf = data.visceralFat;

  // ── Computed Ratios ──
  const muscleToWeightRatio = weight && smm ? round((smm / weight) * 100) : null;
  const fatToWeightRatio = weight && bfm ? round((bfm / weight) * 100) : null;

  const leanBodyMass =
    data.leanBodyMass ?? (weight && bfm ? round(weight - bfm) : null);
  const leanMassPercent = weight && leanBodyMass ? round((leanBodyMass / weight) * 100) : null;
  const fatMassPercent = pbf ?? fatToWeightRatio;

  // ── BMI Category ──
  const bmiCategory = getBMICategory(bmi);

  // ── Visceral Fat Category ──
  const visceralFatCategory = getVisceralFatCategory(vf);

  // ── Muscle Balance ──
  const muscleBalance = analyzeMuscleBalance(data);

  // ── Textual Insights ──
  const overallStatus = generateOverallStatus(data, muscleToWeightRatio, bmiCategory, visceralFatCategory);
  const muscleAnalysis = generateMuscleAnalysis(smm, weight, muscleToWeightRatio);
  const fatAnalysis = generateFatAnalysis(bfm, pbf, weight);
  const bmiInterpretation = generateBMIInterpretation(bmi, bmiCategory, smm, weight);
  const visceralFatHealth = generateVisceralFatInsight(vf, visceralFatCategory);
  const metabolismAnalysis = generateMetabolismAnalysis(bmr, weight, smm);
  const segmentalBalance = generateSegmentalInsight(data, muscleBalance);

  // ── Training & Nutrition Strategy ──
  const trainingRecommendations = generateTrainingStrategy(data, muscleToWeightRatio, fatMassPercent, muscleBalance);
  const nutritionRecommendations = generateNutritionStrategy(data, muscleToWeightRatio, fatMassPercent);

  // ── Insight Cards ──
  const positiveIndicators = getPositiveIndicators(data, bmiCategory, visceralFatCategory, muscleToWeightRatio);
  const areasToImprove = getAreasToImprove(data, bmiCategory, visceralFatCategory, muscleToWeightRatio);

  return {
    muscleToWeightRatio,
    fatToWeightRatio,
    leanBodyMass,
    leanMassPercent,
    fatMassPercent,
    bmiCategory,
    visceralFatCategory,
    muscleBalance,
    overallStatus,
    muscleAnalysis,
    fatAnalysis,
    bmiInterpretation,
    visceralFatHealth,
    metabolismAnalysis,
    segmentalBalance,
    trainingRecommendations,
    nutritionRecommendations,
    positiveIndicators,
    areasToImprove,
  };
}

// ────────────────────────────────────────────────────────────
//  Nutrition Calculator (Part 7)
// ────────────────────────────────────────────────────────────

export function calculateNutrition(data: ParsedBCAData): NutritionTargets {
  const weight = data.weight ?? 70;
  const bmr = data.bmr ?? estimateBMR(weight, data.bodyFatPercent);

  // Activity multiplier (moderate activity)
  const maintenanceCalories = Math.round(bmr * 1.55);
  const fatLossCalories = Math.round(maintenanceCalories * 0.8); // 20% deficit
  const muscleGainCalories = Math.round(maintenanceCalories * 1.15); // 15% surplus

  // Macros for moderate body recomposition
  const proteinPerKg = 2.0; // high protein
  const fatsPerKg = 0.9;
  const protein = Math.round(weight * proteinPerKg);
  const fats = Math.round(weight * fatsPerKg);
  const carbCalories = maintenanceCalories - (protein * 4 + fats * 9);
  const carbs = Math.round(Math.max(carbCalories / 4, 100));

  return {
    maintenanceCalories,
    fatLossCalories,
    muscleGainCalories,
    protein,
    carbs,
    fats,
    proteinPerKg,
    carbsPerKg: round(carbs / weight),
    fatsPerKg,
  };
}

// ────────────────────────────────────────────────────────────
//  Internal Helpers
// ────────────────────────────────────────────────────────────

function round(v: number, decimals = 1): number {
  const factor = Math.pow(10, decimals);
  return Math.round(v * factor) / factor;
}

function estimateBMR(weight: number, bodyFatPercent: number | null): number {
  // Katch-McArdle formula using lean body mass
  const bf = bodyFatPercent ?? 20;
  const lbm = weight * (1 - bf / 100);
  return Math.round(370 + 21.6 * lbm);
}

function getBMICategory(bmi: number | null): string {
  if (bmi === null) return "Unknown";
  if (bmi < 18.5) return "Underweight";
  if (bmi < 25) return "Normal";
  if (bmi < 30) return "Overweight";
  return "Obese";
}

function getVisceralFatCategory(vf: number | null): string {
  if (vf === null) return "Unknown";
  if (vf <= 9) return "Healthy";
  if (vf <= 14) return "Elevated";
  return "High";
}

function analyzeMuscleBalance(data: ParsedBCAData): MuscleBalance | null {
  const seg = data.segmentalLean;
  if (!seg) return null;

  const rightUpper = seg.rightArm ?? 0;
  const leftUpper = seg.leftArm ?? 0;
  const rightLower = seg.rightLeg ?? 0;
  const leftLower = seg.leftLeg ?? 0;
  const trunk = seg.trunk ?? 0;

  const upperAvg = (rightUpper + leftUpper) / 2;
  const lowerAvg = (rightLower + leftLower) / 2;
  const rightAvg = (rightUpper + rightLower) / 2;
  const leftAvg = (leftUpper + leftLower) / 2;

  const ulDiff = Math.abs(upperAvg - lowerAvg) / Math.max(upperAvg, lowerAvg, 1);
  const lrDiff = Math.abs(rightAvg - leftAvg) / Math.max(rightAvg, leftAvg, 1);

  const upperLower: MuscleBalance["upperLower"] =
    ulDiff < 0.1 ? "balanced" : upperAvg > lowerAvg ? "upper-dominant" : "lower-dominant";
  const leftRight: MuscleBalance["leftRight"] =
    lrDiff < 0.05 ? "balanced" : rightAvg > leftAvg ? "right-dominant" : "left-dominant";

  const parts: string[] = [];
  if (upperLower === "balanced") parts.push("Upper-lower balance is good.");
  else parts.push(`Your ${upperLower === "upper-dominant" ? "upper body" : "lower body"} has relatively more muscle mass.`);
  if (leftRight === "balanced") parts.push("Left-right symmetry is excellent.");
  else parts.push(`Your ${leftRight === "right-dominant" ? "right" : "left"} side is slightly more developed.`);

  return { upperLower, leftRight, description: parts.join(" ") };
}

// ── Textual Insight Generators ──

function generateOverallStatus(
  data: ParsedBCAData,
  muscleRatio: number | null,
  bmiCat: string,
  vfCat: string
): string {
  const parts: string[] = [];
  if (bmiCat === "Normal") parts.push("Your BMI is within the healthy range.");
  else if (bmiCat === "Overweight") parts.push("Your BMI indicates you are slightly above optimal range.");
  else if (bmiCat === "Obese") parts.push("Your BMI indicates a higher risk category — targeted fat loss is recommended.");
  else if (bmiCat === "Underweight") parts.push("Your BMI is below normal — a calorie surplus is recommended.");

  if (muscleRatio !== null) {
    if (muscleRatio >= 45) parts.push("You have an excellent muscle-to-weight ratio, indicating strong athletic potential.");
    else if (muscleRatio >= 38) parts.push("Your muscle mass is at a moderate level relative to your weight.");
    else parts.push("Your muscle mass is below optimal. Prioritizing resistance training will improve metabolic health.");
  }

  if (vfCat === "Healthy") parts.push("Visceral fat is within a healthy range — great indicator of metabolic health.");
  else if (vfCat === "Elevated") parts.push("Visceral fat is slightly elevated. Dietary adjustments and consistent cardio will help reduce it.");
  else if (vfCat === "High") parts.push("Visceral fat is high, which increases metabolic and cardiovascular risk. Prioritize fat loss.");

  return parts.join(" ") || "Body composition data is limited. Please ensure all metrics are correctly entered.";
}

function generateMuscleAnalysis(smm: number | null, weight: number | null, ratio: number | null): string {
  if (smm === null || weight === null) return "Skeletal muscle mass data is unavailable.";
  const parts = [`Your skeletal muscle mass is ${smm} kg (${ratio?.toFixed(1)}% of body weight).`];
  if (ratio !== null) {
    if (ratio >= 45) parts.push("This is excellent — you have a high proportion of metabolically active tissue.");
    else if (ratio >= 40) parts.push("This is a good level. Adding 2–3 kg of muscle would further boost metabolism and performance.");
    else if (ratio >= 35) parts.push("This is moderate. Increasing skeletal muscle mass by 3–5 kg would significantly improve your metabolic rate and physique.");
    else parts.push("Your muscle mass is relatively low. A structured hypertrophy program with progressive overload is strongly recommended.");
  }
  return parts.join(" ");
}

function generateFatAnalysis(bfm: number | null, pbf: number | null, weight: number | null): string {
  if (pbf === null) return "Body fat data is unavailable.";
  const parts = [`Your body fat percentage is ${pbf}%.`];
  if (bfm !== null) parts.push(`Total fat mass: ${bfm} kg.`);

  if (pbf < 10) parts.push("This is very lean — ensure adequate nutrition for hormonal and immune health.");
  else if (pbf < 18) parts.push("This is in the athletic/fit range. Good foundation for performance goals.");
  else if (pbf < 25) parts.push("This is in the average range. A moderate caloric deficit with resistance training can improve composition.");
  else if (pbf < 32) parts.push("Body fat is above average. A structured fat-loss phase with high protein intake is recommended.");
  else parts.push("Body fat is elevated. A gradual deficit of 500 kcal/day combined with strength training will yield sustainable results.");

  return parts.join(" ");
}

function generateBMIInterpretation(bmi: number | null, category: string, smm: number | null, weight: number | null): string {
  if (bmi === null) return "BMI data is unavailable.";
  let text = `Your BMI is ${bmi} (${category}).`;
  if (category === "Overweight" && smm && weight && (smm / weight) > 0.40) {
    text += " However, your high muscle mass suggests this may be muscular weight rather than excess fat. BMI alone is not the best metric for athletic individuals.";
  } else if (category === "Normal") {
    text += " This falls within the healthy range. Combined with other metrics, this indicates good overall body size.";
  }
  return text;
}

function generateVisceralFatInsight(vf: number | null, category: string): string {
  if (vf === null) return "Visceral fat data is unavailable.";
  let text = `Your visceral fat level is ${vf} (${category}).`;
  if (category === "Healthy") text += " Visceral fat below 10 is associated with lower risk of metabolic syndrome, type 2 diabetes, and cardiovascular disease.";
  else if (category === "Elevated") text += " Levels between 10–14 indicate a moderate risk. Incorporating regular Zone 2 cardio (150 min/week) and reducing refined sugars will help.";
  else text += " Levels above 14 pose significant health risks. Prioritize a caloric deficit, increase fiber intake, and aim for 5+ hours of weekly physical activity.";
  return text;
}

function generateMetabolismAnalysis(bmr: number | null, weight: number | null, smm: number | null): string {
  if (bmr === null) return "Metabolic data is unavailable.";
  let text = `Your Basal Metabolic Rate is ${bmr} kcal/day.`;
  if (weight) {
    const bmrPerKg = round(bmr / weight);
    text += ` That's ${bmrPerKg} kcal per kg of body weight.`;
    if (bmrPerKg > 24) text += " This indicates a very efficient metabolism.";
    else if (bmrPerKg > 20) text += " This is within normal metabolic efficiency.";
    else text += " Your metabolism is on the lower side. Building more muscle mass will help increase it.";
  }
  if (smm !== null) {
    text += ` Since each kg of muscle burns ~13 kcal/day at rest, gaining 3 kg of muscle would increase your BMR by ~40 kcal/day.`;
  }
  return text;
}

function generateSegmentalInsight(data: ParsedBCAData, balance: MuscleBalance | null): string {
  if (!balance && !data.segmentalLean) return "Segmental analysis data is unavailable.";
  if (balance) return balance.description;
  return "Segmental muscle data is present but could not be fully analyzed.";
}

// ── Training Strategy (Part 6) ──

function generateTrainingStrategy(
  data: ParsedBCAData,
  muscleRatio: number | null,
  fatPercent: number | null,
  balance: MuscleBalance | null
): string {
  const parts: string[] = [];

  // Primary goal
  if (fatPercent !== null && fatPercent > 25) {
    parts.push("Primary Goal: Fat Loss + Muscle Preservation.");
    parts.push("Recommended Split: 4-day Upper/Lower with 2 days of Zone 2 cardio.");
    parts.push("Focus on compound lifts (Squats, Deadlifts, Bench Press, Rows) at moderate intensity (RPE 7-8).");
    parts.push("Add 20-30 min LISS cardio post-workout or on rest days.");
  } else if (muscleRatio !== null && muscleRatio < 38) {
    parts.push("Primary Goal: Hypertrophy (Muscle Building).");
    parts.push("Recommended Split: Push/Pull/Legs (6 days) with progressive overload.");
    parts.push("Prioritize: Squats, Romanian Deadlifts, Overhead Press, Weighted Pull-ups, Barbell Rows.");
    parts.push("Volume: 15-20 sets per muscle group per week.");
  } else {
    parts.push("Primary Goal: Body Recomposition.");
    parts.push("Recommended Split: Upper/Lower 4-day or Push/Pull/Legs.");
    parts.push("Balance hypertrophy with progressive strength targets on compound movements.");
  }

  // Address imbalances
  if (balance) {
    if (balance.upperLower === "upper-dominant") {
      parts.push("Add extra lower body volume: Front Squats, Bulgarian Split Squats, Leg Curls.");
    } else if (balance.upperLower === "lower-dominant") {
      parts.push("Add extra upper body volume: Incline Press, Lateral Raises, Chin-ups.");
    }
    if (balance.leftRight !== "balanced") {
      parts.push("Include unilateral exercises (DB Press, Single-leg RDL) to correct left-right imbalances.");
    }
  }

  return parts.join("\n");
}

// ── Nutrition Strategy (Part 7) ──

function generateNutritionStrategy(
  data: ParsedBCAData,
  muscleRatio: number | null,
  fatPercent: number | null
): string {
  const nutrition = calculateNutrition(data);
  const parts: string[] = [];

  parts.push(`Maintenance Calories: ${nutrition.maintenanceCalories} kcal/day`);

  if (fatPercent !== null && fatPercent > 25) {
    parts.push(`Fat Loss Target: ${nutrition.fatLossCalories} kcal/day (20% deficit)`);
    parts.push("Phase: Cut — maintain high protein to preserve muscle.");
  } else if (muscleRatio !== null && muscleRatio < 38) {
    parts.push(`Muscle Gain Target: ${nutrition.muscleGainCalories} kcal/day (15% surplus)`);
    parts.push("Phase: Lean Bulk — emphasize progressive overload with surplus.");
  } else {
    parts.push("Phase: Recomposition — eat at maintenance with high protein.");
  }

  parts.push("");
  parts.push(`Protein: ${nutrition.protein}g/day (${nutrition.proteinPerKg}g/kg)`);
  parts.push(`Carbs: ${nutrition.carbs}g/day (${nutrition.carbsPerKg}g/kg)`);
  parts.push(`Fats: ${nutrition.fats}g/day (${nutrition.fatsPerKg}g/kg)`);

  parts.push("");
  parts.push("Foods to Prioritize: Chicken breast, eggs, Greek yogurt, salmon, oats, sweet potatoes, rice, broccoli, spinach, berries, nuts.");
  parts.push("Foods to Reduce: Processed foods, sugary drinks, alcohol, deep-fried items, excessive refined carbs.");

  return parts.join("\n");
}

// ── Insight Cards (Part 8) ──

function getPositiveIndicators(
  data: ParsedBCAData,
  bmiCat: string,
  vfCat: string,
  muscleRatio: number | null
): InsightCard[] {
  const cards: InsightCard[] = [];

  if (vfCat === "Healthy") {
    cards.push({ title: "Healthy Visceral Fat", description: "Your visceral fat is within optimal range, reducing metabolic disease risk.", type: "positive", metric: `${data.visceralFat}` });
  }
  if (bmiCat === "Normal") {
    cards.push({ title: "Balanced BMI", description: "Your BMI indicates a healthy body size relative to height.", type: "positive", metric: `${data.bmi}` });
  }
  if (muscleRatio !== null && muscleRatio >= 42) {
    cards.push({ title: "Strong Muscle Mass", description: "You have above-average muscle relative to body weight — great for metabolism.", type: "positive", metric: `${muscleRatio.toFixed(1)}%` });
  }
  if (data.bodyFatPercent !== null && data.bodyFatPercent < 20) {
    cards.push({ title: "Athletic Body Fat", description: "Your body fat is in the athletic range.", type: "positive", metric: `${data.bodyFatPercent}%` });
  }
  if (data.bmr !== null && data.weight !== null && data.bmr / data.weight > 22) {
    cards.push({ title: "Efficient Metabolism", description: "Your metabolic rate per kg is above average.", type: "positive", metric: `${data.bmr} kcal` });
  }

  return cards;
}

function getAreasToImprove(
  data: ParsedBCAData,
  bmiCat: string,
  vfCat: string,
  muscleRatio: number | null
): InsightCard[] {
  const cards: InsightCard[] = [];

  if (data.bodyFatPercent !== null && data.bodyFatPercent > 25) {
    cards.push({ title: "High Body Fat", description: "Body fat above 25% increases health risks. Target a gradual caloric deficit.", type: "warning", metric: `${data.bodyFatPercent}%` });
  }
  if (muscleRatio !== null && muscleRatio < 38) {
    cards.push({ title: "Low Muscle Mass", description: "Increasing skeletal muscle will boost metabolism and improve body composition.", type: "warning", metric: `${muscleRatio.toFixed(1)}%` });
  }
  if (vfCat === "Elevated" || vfCat === "High") {
    cards.push({ title: "Visceral Fat Risk", description: `Visceral fat level of ${data.visceralFat} needs attention. Focus on cardio and diet changes.`, type: "warning", metric: `${data.visceralFat}` });
  }
  if (bmiCat === "Overweight" || bmiCat === "Obese") {
    cards.push({ title: "BMI Above Range", description: "Consider body recomposition strategies to reach a healthier BMI.", type: "warning", metric: `${data.bmi}` });
  }
  if (bmiCat === "Underweight") {
    cards.push({ title: "Underweight", description: "A caloric surplus with focus on lean protein and strength training is recommended.", type: "warning", metric: `${data.bmi}` });
  }

  return cards;
}
