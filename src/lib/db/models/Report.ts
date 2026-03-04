import mongoose, { Schema, type Document } from "mongoose";

// ─── Segmental Sub-schema ──────────────────────────────
const SegmentalSchema = new Schema(
  {
    rightArm: { type: Number, default: null },
    leftArm: { type: Number, default: null },
    trunk: { type: Number, default: null },
    rightLeg: { type: Number, default: null },
    leftLeg: { type: Number, default: null },
  },
  { _id: false },
);

// ─── Metrics Sub-schema ────────────────────────────────
const MetricsSchema = new Schema(
  {
    height: { type: Number, default: null },
    weight: { type: Number, default: null },
    skeletalMuscleMass: { type: Number, default: null },
    bodyFatMass: { type: Number, default: null },
    bodyFatPercent: { type: Number, default: null },
    bmi: { type: Number, default: null },
    bmr: { type: Number, default: null },
    visceralFat: { type: Number, default: null },
    totalBodyWater: { type: Number, default: null },
    leanBodyMass: { type: Number, default: null },
    segmentalLean: { type: SegmentalSchema, default: null },
    segmentalFat: { type: SegmentalSchema, default: null },
  },
  { _id: false },
);

// ─── Nutrition Targets Sub-schema ──────────────────────
const NutritionTargetsSchema = new Schema(
  {
    maintenanceCalories: Number,
    fatLossCalories: Number,
    muscleGainCalories: Number,
    protein: Number,
    carbs: Number,
    fats: Number,
    proteinPerKg: Number,
    carbsPerKg: Number,
    fatsPerKg: Number,
  },
  { _id: false },
);

// ─── Meal Item Sub-schema ──────────────────────────────
const MealItemSchema = new Schema(
  {
    name: String,
    time: String,
    description: String,
    calories: Number,
    protein: Number,
    carbs: Number,
    fats: Number,
  },
  { _id: false },
);

// ─── Workout Day Sub-schema ────────────────────────────
const WorkoutDaySchema = new Schema(
  {
    day: String,
    focus: String,
    exercises: [String],
  },
  { _id: false },
);

// ─── Insight Card Sub-schema ───────────────────────────
const InsightCardSchema = new Schema(
  {
    title: String,
    description: String,
    type: { type: String, enum: ["positive", "warning", "info"] },
    metric: { type: String, default: undefined },
  },
  { _id: false },
);

// ─── Body Analysis Sub-schema ──────────────────────────
const BodyAnalysisSchema = new Schema(
  {
    muscleToWeightRatio: { type: Number, default: null },
    fatToWeightRatio: { type: Number, default: null },
    leanBodyMass: { type: Number, default: null },
    leanMassPercent: { type: Number, default: null },
    fatMassPercent: { type: Number, default: null },
    bmiCategory: String,
    visceralFatCategory: String,
    muscleBalance: { type: Schema.Types.Mixed, default: null },
    overallStatus: String,
    muscleAnalysis: String,
    fatAnalysis: String,
    bmiInterpretation: String,
    visceralFatHealth: String,
    metabolismAnalysis: String,
    segmentalBalance: String,
    trainingRecommendations: String,
    nutritionRecommendations: String,
    positiveIndicators: [InsightCardSchema],
    areasToImprove: [InsightCardSchema],
  },
  { _id: false },
);

// ─── Plan Sub-schema ───────────────────────────────────
const PlanSchema = new Schema(
  {
    calorieTarget: Number,
    macros: {
      protein: Number,
      carbs: Number,
      fats: Number,
    },
    hydrationTarget: String,
    sleepRecommendation: String,
    workoutPlan: [WorkoutDaySchema],
    nutritionTargets: NutritionTargetsSchema,
    mealPlan: {
      meals: [MealItemSchema],
      foodsToReduce: [String],
      foodsToPrioritize: [String],
    },
    bodyAnalysis: BodyAnalysisSchema,
  },
  { _id: false },
);

// ─── Main Report Document ──────────────────────────────
export interface IReport extends Document {
  fileName: string;
  rawText: string;
  metrics: typeof MetricsSchema;
  correctedMetrics: typeof MetricsSchema;
  confidence: number;
  warnings: string[];
  plan: typeof PlanSchema;
  createdAt: Date;
  updatedAt: Date;
}

const ReportSchema = new Schema(
  {
    fileName: { type: String, default: "" },
    rawText: { type: String, default: "" },
    metrics: { type: MetricsSchema, required: true },
    correctedMetrics: { type: MetricsSchema, default: null },
    confidence: { type: Number, default: 0 },
    warnings: { type: [String], default: [] },
    plan: { type: PlanSchema, default: null },
  },
  {
    timestamps: true, // auto createdAt + updatedAt
  },
);

// Prevent duplicate model registration in hot-reload
export default mongoose.models.Report ||
  mongoose.model<IReport>("Report", ReportSchema);
