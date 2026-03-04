import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
import { analyzeBodyComposition, calculateNutrition } from "@/lib/analysis/bodyAnalysis";
import type { ParsedBCAData } from "@/lib/types";
import dbConnect from "@/lib/db/connect";
import Report from "@/lib/db/models/Report";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const metrics: ParsedBCAData = body.metrics ?? body;
    const reportId: string | undefined = body.reportId;

    if (!metrics || typeof metrics !== "object") {
      return NextResponse.json({ error: "No body metrics provided." }, { status: 400 });
    }

    // Run local analysis engine first
    const bodyAnalysis = analyzeBodyComposition(metrics);
    const nutritionTargets = calculateNutrition(metrics);

    // Build AI prompt with all analysis context
    const systemPrompt = `
You are an elite AI fitness and nutrition coach with expertise in sports science, exercise physiology, and clinical nutrition.
Generate a highly optimized, personalized fitness protocol based on the user's Body Composition Analysis (BCA) metrics AND the computed analysis below.

You MUST output ONLY valid JSON using the exact structure below. Do not include markdown formatting, explanations, or greeting text.

{
  "calorieTarget": 0,
  "macros": { "protein": 0, "carbs": 0, "fats": 0 },
  "hydrationTarget": "",
  "sleepRecommendation": "",
  "workoutPlan": [
    { "day": "Day 1", "focus": "Push (Chest, Shoulders, Triceps)", "exercises": ["Exercise 1", "Exercise 2", "Exercise 3"] }
  ],
  "mealPlan": {
    "meals": [
      { "name": "Breakfast", "time": "7:00 AM", "description": "...", "calories": 0, "protein": 0, "carbs": 0, "fats": 0 }
    ],
    "foodsToReduce": ["item"],
    "foodsToPrioritize": ["item"]
  }
}

The workoutPlan must have exactly 7 days.
The mealPlan must have 4-5 meals.
Use the computed analysis to make smart decisions about training volume, intensity, and calorie targets.
`;

    const userPrompt = `
User's BCA Metrics:
- Height: ${metrics.height ?? "Unknown"} cm
- Weight: ${metrics.weight ?? "Unknown"} kg
- Skeletal Muscle Mass: ${metrics.skeletalMuscleMass ?? "Unknown"} kg
- Body Fat %: ${metrics.bodyFatPercent ?? "Unknown"}%
- Body Fat Mass: ${metrics.bodyFatMass ?? "Unknown"} kg
- BMI: ${metrics.bmi ?? "Unknown"}
- BMR: ${metrics.bmr ?? "Unknown"} kcal
- Visceral Fat Level: ${metrics.visceralFat ?? "Unknown"}

Computed Analysis:
- Muscle-to-Weight Ratio: ${bodyAnalysis.muscleToWeightRatio ?? "Unknown"}%
- Fat-to-Weight Ratio: ${bodyAnalysis.fatToWeightRatio ?? "Unknown"}%
- Lean Body Mass: ${bodyAnalysis.leanBodyMass ?? "Unknown"} kg
- BMI Category: ${bodyAnalysis.bmiCategory}
- Visceral Fat Category: ${bodyAnalysis.visceralFatCategory}
- Overall: ${bodyAnalysis.overallStatus}

Nutrition Targets:
- Maintenance: ${nutritionTargets.maintenanceCalories} kcal
- Fat Loss: ${nutritionTargets.fatLossCalories} kcal
- Muscle Gain: ${nutritionTargets.muscleGainCalories} kcal
- Protein Target: ${nutritionTargets.protein}g

Training Strategy:
${bodyAnalysis.trainingRecommendations}

Based on this data, generate the complete 7-day protocol with meal plan. If specific metrics are unknown, provide a balanced baseline plan.
`;

    const completion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.2,
      response_format: { type: "json_object" },
    });

    const aiResponse = completion.choices[0]?.message?.content;

    if (!aiResponse) {
      throw new Error("Failed to generate plan from AI.");
    }

    const structuredPlan = JSON.parse(aiResponse);

    const fullPlan = {
      ...structuredPlan,
      nutritionTargets,
      bodyAnalysis,
    };

    // Persist plan + corrected metrics to MongoDB
    if (reportId) {
      try {
        await dbConnect();
        await Report.findByIdAndUpdate(reportId, {
          correctedMetrics: metrics,
          plan: fullPlan,
        });
      } catch (dbError) {
        console.error("MongoDB plan save error (non-fatal):", dbError);
      }
    }

    return NextResponse.json({
      success: true,
      reportId,
      plan: fullPlan,
    });
  } catch (error: unknown) {
    console.error("Groq Generation Error:", error);
    const message =
      error instanceof Error ? error.message : "An error occurred while generating the plan.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}