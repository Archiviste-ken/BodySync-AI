import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

// Initialize the Groq client
// Ensure GROQ_API_KEY is set in your .env.local file
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const metrics = await request.json();

    if (!metrics || Object.keys(metrics).length === 0) {
      return NextResponse.json({ error: "No body metrics provided." }, { status: 400 });
    }

    // Define the strict JSON structure we want back
    const systemPrompt = `
      You are an elite AI fitness and nutrition coach. 
      Generate a highly optimized, personalized fitness protocol based on the user's Body Composition Analysis (BCA) metrics.
      
      You MUST output ONLY valid JSON using the exact structure below. Do not include markdown formatting, explanations, or greeting text.
      
      {
        "calorieTarget": 0, // integer representing daily kcal
        "macros": {
          "protein": 0, // integer in grams
          "carbs": 0, // integer in grams
          "fats": 0 // integer in grams
        },
        "hydrationTarget": "", // string, e.g., "3.5 Liters"
        "sleepRecommendation": "", // string, e.g., "7-8 hours"
        "workoutPlan": [
          {
            "day": "Day 1",
            "focus": "String (e.g., Push / Chest & Triceps)",
            "exercises": ["Exercise 1", "Exercise 2", "Exercise 3"]
          },
          // ... must include exactly 7 days
        ]
      }
    `;

    const userPrompt = `
      Here are the user's latest BCA metrics:
      - Weight: ${metrics.weight || "Unknown"} kg
      - Skeletal Muscle Mass: ${metrics.skeletalMuscleMass || "Unknown"} kg
      - Body Fat %: ${metrics.bodyFatPercent || "Unknown"}%
      - Body Fat Mass: ${metrics.bodyFatMass || "Unknown"} kg
      - BMI: ${metrics.bmi || "Unknown"}
      - BMR: ${metrics.bmr || "Unknown"} kcal
      - Visceral Fat Level: ${metrics.visceralFat || "Unknown"}
      
      Based on this data, generate the 7-day protocol. If specific metrics are unknown, provide a balanced baseline plan.
    `;

    // Call Groq API
    const completion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      // llama-3.3-70b-versatile is excellent for strict JSON adherence and complex reasoning
      model: "llama-3.3-70b-versatile",
      temperature: 0.2, // Low temperature for more deterministic, focused outputs
      response_format: { type: "json_object" }, 
    });

    const aiResponse = completion.choices[0]?.message?.content;

    if (!aiResponse) {
      throw new Error("Failed to generate plan from Groq.");
    }

    // Parse the JSON string returned by Groq into a workable object
    const structuredPlan = JSON.parse(aiResponse);

    return NextResponse.json({
      success: true,
      message: "Plan generated successfully.",
      plan: structuredPlan,
    });

  } catch (error: unknown) {
    console.error("Groq Generation Error:", error);
    const message =
      error instanceof Error ? error.message : "An error occurred while generating the plan.";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}