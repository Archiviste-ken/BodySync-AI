"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  CheckCircle2,
  Edit3,
  Loader2,
  ArrowRight,
  Scale,
  Ruler,
  Percent,
  Flame,
  Activity,
  Heart,
  Dumbbell,
  ShieldAlert,
} from "lucide-react";
import type { ParsedBCAData } from "@/lib/types";

// ── Physiological validation ranges (matching backend) ──
const VALID_RANGES: Record<string, { min: number; max: number; unit: string }> =
  {
    height: { min: 120, max: 230, unit: "cm" },
    weight: { min: 30, max: 250, unit: "kg" },
    skeletalMuscleMass: { min: 10, max: 80, unit: "kg" },
    bodyFatPercent: { min: 3, max: 60, unit: "%" },
    bodyFatMass: { min: 1, max: 120, unit: "kg" },
    bmi: { min: 10, max: 50, unit: "" },
    bmr: { min: 800, max: 4000, unit: "kcal" },
    visceralFat: { min: 1, max: 20, unit: "" },
  };

interface MetricField {
  key: keyof ParsedBCAData;
  label: string;
  unit: string;
  icon: React.ElementType;
  color: string;
}

const fields: MetricField[] = [
  {
    key: "height",
    label: "Height",
    unit: "cm",
    icon: Ruler,
    color: "text-electric-blue",
  },
  {
    key: "weight",
    label: "Weight",
    unit: "kg",
    icon: Scale,
    color: "text-neon-green",
  },
  {
    key: "skeletalMuscleMass",
    label: "Skeletal Muscle Mass",
    unit: "kg",
    icon: Dumbbell,
    color: "text-neon-green",
  },
  {
    key: "bodyFatPercent",
    label: "Body Fat %",
    unit: "%",
    icon: Percent,
    color: "text-deep-purple",
  },
  {
    key: "bodyFatMass",
    label: "Body Fat Mass",
    unit: "kg",
    icon: Activity,
    color: "text-deep-purple",
  },
  {
    key: "bmi",
    label: "BMI",
    unit: "",
    icon: Heart,
    color: "text-electric-blue",
  },
  {
    key: "bmr",
    label: "BMR",
    unit: "kcal",
    icon: Flame,
    color: "text-neon-green",
  },
  {
    key: "visceralFat",
    label: "Visceral Fat Level",
    unit: "",
    icon: AlertTriangle,
    color: "text-yellow-400",
  },
];

interface MetricsCorrectionProps {
  metrics: ParsedBCAData;
  confidence: number;
  warnings: string[];
  onConfirm: (corrected: ParsedBCAData) => void;
  isGenerating: boolean;
}

function getValidationError(key: string, value: string): string | null {
  if (!value) return null;
  const num = parseFloat(value);
  if (isNaN(num)) return "Must be a number";
  const range = VALID_RANGES[key];
  if (!range) return null;
  if (num < range.min)
    return `Min ${range.min}${range.unit ? " " + range.unit : ""}`;
  if (num > range.max)
    return `Max ${range.max}${range.unit ? " " + range.unit : ""}`;
  return null;
}

// ── Framer Motion variants for staggered card animation ──
const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, delay: i * 0.06, ease: "easeOut" as const },
  }),
};

export default function MetricsCorrection({
  metrics,
  confidence,
  warnings,
  onConfirm,
  isGenerating,
}: MetricsCorrectionProps) {
  const [values, setValues] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    for (const field of fields) {
      const val = metrics[field.key];
      initial[field.key] =
        val !== null && typeof val === "number" ? String(val) : "";
    }
    return initial;
  });

  const handleChange = (key: string, val: string) => {
    // Allow empty or numeric values
    if (val === "" || /^\d*\.?\d*$/.test(val)) {
      setValues((prev) => ({ ...prev, [key]: val }));
    }
  };

  const handleSubmit = () => {
    const corrected: ParsedBCAData = {
      ...metrics,
      height: values.height ? parseFloat(values.height) : null,
      weight: values.weight ? parseFloat(values.weight) : null,
      skeletalMuscleMass: values.skeletalMuscleMass
        ? parseFloat(values.skeletalMuscleMass)
        : null,
      bodyFatPercent: values.bodyFatPercent
        ? parseFloat(values.bodyFatPercent)
        : null,
      bodyFatMass: values.bodyFatMass ? parseFloat(values.bodyFatMass) : null,
      bmi: values.bmi ? parseFloat(values.bmi) : null,
      bmr: values.bmr ? parseFloat(values.bmr) : null,
      visceralFat: values.visceralFat ? parseFloat(values.visceralFat) : null,
    };
    onConfirm(corrected);
  };

  const filledCount = fields.filter((f) => values[f.key] !== "").length;

  // Check if any field has a validation error
  const hasValidationErrors = fields.some(
    (f) => getValidationError(f.key, values[f.key]) !== null,
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mx-auto w-full max-w-2xl space-y-6 px-1 sm:px-0"
    >
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-electric-blue/20 bg-electric-blue/10 shadow-[0_0_20px_rgba(15,240,252,0.08)]">
          <Edit3 className="h-7 w-7 text-electric-blue" />
        </div>
        <h2 className="font-heading text-2xl md:text-3xl font-bold text-white">
          Review <span className="text-gradient">Extracted Metrics</span>
        </h2>
        <p className="text-gray-400 text-sm md:text-base max-w-md mx-auto">
          Our OCR extracted the values below. Please verify and correct any
          inaccurate readings before generating your protocol.
        </p>
      </div>

      {/* PART 5: Low-confidence warning banner */}
      {confidence < 40 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="relative overflow-hidden rounded-xl border border-orange-500/20 bg-gradient-to-r from-orange-500/10 via-red-500/5 to-orange-500/10 p-4 sm:p-5 shadow-[0_0_20px_rgba(249,115,22,0.06)]"
        >
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-orange-500/15">
              <ShieldAlert className="h-5 w-5 text-orange-400" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-semibold text-orange-300">
                Automatic extraction was unreliable
              </p>
              <p className="text-xs text-gray-400 leading-relaxed">
                Please verify or enter the values manually below. You can still
                proceed to generate your protocol.
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Confidence Bar */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="glass-panel p-4"
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-400">Extraction Confidence</span>
          <span
            className={`text-sm font-bold ${
              confidence >= 70
                ? "text-neon-green"
                : confidence >= 40
                  ? "text-yellow-400"
                  : "text-red-400"
            }`}
          >
            {confidence}%
          </span>
        </div>
        <div className="h-2.5 w-full overflow-hidden rounded-full bg-white/5">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${confidence}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="h-full rounded-full"
            style={{
              background:
                confidence >= 70
                  ? "linear-gradient(90deg, #39FF14, #0FF0FC)"
                  : confidence >= 40
                    ? "linear-gradient(90deg, #EAB308, #F59E0B)"
                    : "linear-gradient(90deg, #EF4444, #F97316)",
            }}
          />
        </div>
      </motion.div>

      {/* Warnings */}
      {warnings.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="glass-panel rounded-xl border border-yellow-500/15 p-4 space-y-2"
        >
          <div className="flex items-center gap-2 text-yellow-400 text-sm font-medium">
            <AlertTriangle className="h-4 w-4" />
            <span>Some metrics could not be detected automatically</span>
          </div>
          <ul className="space-y-1 text-xs text-gray-400 pl-6">
            {warnings.map((w, i) => (
              <li key={i}>• {w}</li>
            ))}
          </ul>
        </motion.div>
      )}

      {/* Metric Fields Grid — single-column on mobile, 2-column on sm+ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {fields.map((field, index) => {
          const Icon = field.icon;
          const hasValue = values[field.key] !== "";
          const validationError = getValidationError(
            field.key,
            values[field.key],
          );
          const range = VALID_RANGES[field.key];

          return (
            <motion.div
              key={field.key}
              custom={index}
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              className={`group glass-panel-hover relative overflow-hidden rounded-xl border p-4 transition-all duration-300 sm:p-5 ${
                validationError
                  ? "border-red-500/25"
                  : hasValue
                    ? "border-neon-green/15"
                    : "border-white/[0.06]"
              } hover:border-white/15`}
            >
              {/* Subtle gradient glow on hover */}
              <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-white/[0.02] to-transparent" />

              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-3">
                  <Icon className={`h-5 w-5 ${field.color}`} />
                  <label className="text-sm sm:text-xs font-semibold text-gray-300 uppercase tracking-wider">
                    {field.label}
                  </label>
                  {validationError ? (
                    <AlertTriangle className="h-4 w-4 text-red-400 ml-auto" />
                  ) : hasValue ? (
                    <CheckCircle2 className="h-4 w-4 text-neon-green ml-auto" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-yellow-500/50 ml-auto" />
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    inputMode="decimal"
                    value={values[field.key]}
                    onChange={(e) => handleChange(field.key, e.target.value)}
                    placeholder="—"
                    className={`w-full bg-transparent text-2xl sm:text-xl font-bold outline-none placeholder:text-gray-600 focus:placeholder:text-gray-500 min-h-[44px] ${
                      validationError ? "text-red-400" : "text-white"
                    }`}
                  />
                  {field.unit && (
                    <span className="text-sm text-gray-500 shrink-0">
                      {field.unit}
                    </span>
                  )}
                </div>
                {/* Validation error or range hint */}
                {validationError ? (
                  <p className="text-xs text-red-400 mt-2">{validationError}</p>
                ) : range && hasValue ? null : range ? (
                  <p className="text-xs text-gray-600 mt-2">
                    Range: {range.min}–{range.max}
                    {range.unit ? ` ${range.unit}` : ""}
                  </p>
                ) : null}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Progress + CTA */}
      <div className="space-y-4 pb-4">
        <p className="text-center text-sm text-gray-500">
          {filledCount} of {fields.length} metrics filled
        </p>
        <motion.button
          whileHover={{ scale: 1.01, y: -1 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSubmit}
          disabled={isGenerating || filledCount < 3 || hasValidationErrors}
          className="w-full flex items-center justify-center gap-2 rounded-xl py-5 px-6 font-bold text-base transition-all duration-300 disabled:cursor-not-allowed bg-gradient-to-r from-neon-green to-electric-blue text-black hover:shadow-[0_0_30px_rgba(57,255,20,0.2)] disabled:opacity-50 shadow-[0_4px_20px_rgba(57,255,20,0.1)] active:scale-[0.98]"
        >
          {isGenerating ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Generating Protocol...</span>
            </>
          ) : (
            <>
              <span>Generate My Protocol</span>
              <ArrowRight className="h-5 w-5" />
            </>
          )}
        </motion.button>
        {hasValidationErrors && (
          <p className="text-center text-xs text-red-400/70">
            Fix out-of-range values before continuing
          </p>
        )}
        {!hasValidationErrors && filledCount < 3 && (
          <p className="text-center text-xs text-yellow-500/70">
            Please fill at least 3 metrics to continue
          </p>
        )}
      </div>
    </motion.div>
  );
}
