"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Dropzone from "@/components/upload/Dropzone";
import type { UploadResult } from "@/components/upload/Dropzone";
import MetricsCorrection from "@/components/upload/MetricsCorrection";
import { motion, AnimatePresence } from "framer-motion";
import {
  ScanLine,
  ArrowLeft,
  Brain,
  Flame,
  Utensils,
  Dumbbell,
  Sparkles,
} from "lucide-react";
import type { ParsedBCAData } from "@/lib/types";

type Step = "upload" | "review" | "generating";

// Loading stage labels during plan generation
const GEN_STAGES = [
  { label: "Analyzing body composition...", icon: Brain },
  { label: "Calculating metabolism...", icon: Flame },
  { label: "Generating nutrition plan...", icon: Utensils },
  { label: "Building training protocol...", icon: Dumbbell },
];

export default function UploadPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("upload");
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const [reportId, setReportId] = useState<string | undefined>(undefined);
  const [isGenerating, setIsGenerating] = useState(false);
  const [genError, setGenError] = useState<string | null>(null);
  const [genStageIndex, setGenStageIndex] = useState(0);

  const handleUploadComplete = (result: UploadResult) => {
    setUploadResult(result);
    setReportId(result.reportId);
    setStep("review");
  };

  const handleConfirmMetrics = async (corrected: ParsedBCAData) => {
    setIsGenerating(true);
    setGenError(null);
    setStep("generating");
    setGenStageIndex(0);

    // Cycle through loading stages for UX feedback
    const stageInterval = setInterval(() => {
      setGenStageIndex((prev) => {
        if (prev >= GEN_STAGES.length - 1) return prev;
        return prev + 1;
      });
    }, 2500);

    try {
      const res = await fetch("/api/generate-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ metrics: corrected, reportId }),
      });

      clearInterval(stageInterval);
      const data = await res.json();

      if (res.ok && data.success) {
        // Store plan in sessionStorage for the dashboard
        sessionStorage.setItem("bodysync_plan", JSON.stringify(data.plan));
        sessionStorage.setItem("bodysync_metrics", JSON.stringify(corrected));
        if (data.reportId) {
          sessionStorage.setItem("bodysync_reportId", data.reportId);
        }
        router.push("/plan");
      } else {
        setGenError(data.error || "Failed to generate protocol.");
        setStep("review");
        setIsGenerating(false);
      }
    } catch {
      clearInterval(stageInterval);
      setGenError("Network error. Please try again.");
      setStep("review");
      setIsGenerating(false);
    }
  };

  return (
    <div className="relative min-h-[85vh] flex flex-col items-center justify-center py-16 px-4">
      {/* Background glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          animate={{
            x: [0, 20, -15, 0],
            y: [0, -12, 15, 0],
            scale: [1, 1.05, 0.98, 1],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          className="absolute left-1/2 top-28 h-[500px] w-[700px] -translate-x-1/2 rounded-full bg-electric-blue/[0.06] blur-[150px]"
        />
        <motion.div
          animate={{
            x: [0, -18, 12, 0],
            y: [0, 15, -10, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 5,
          }}
          className="absolute right-0 top-1/2 h-[350px] w-[450px] rounded-full bg-deep-purple/[0.05] blur-[130px]"
        />
      </div>

      {/* Step Indicator */}
      <motion.div
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="glass-panel mb-10 flex items-center gap-4 px-5 py-3"
      >
        {[
          { label: "Upload", s: "upload" },
          { label: "Review", s: "review" },
          { label: "Protocol", s: "generating" },
        ].map((item, i) => {
          const isActive = step === item.s;
          const isPast =
            (item.s === "upload" &&
              (step === "review" || step === "generating")) ||
            (item.s === "review" && step === "generating");
          return (
            <div key={item.s} className="flex items-center gap-4">
              {i > 0 && (
                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  className={`h-px w-10 origin-left transition-colors duration-400 ${
                    isPast
                      ? "bg-gradient-to-r from-neon-green/60 to-electric-blue/60"
                      : "bg-white/12"
                  }`}
                />
              )}
              <div className="flex items-center gap-2.5">
                <motion.div
                  animate={
                    isActive
                      ? {
                          scale: [1, 1.2, 1],
                          boxShadow: [
                            "0 0 0 rgba(57,255,20,0)",
                            "0 0 12px rgba(57,255,20,0.6)",
                            "0 0 8px rgba(57,255,20,0.4)",
                          ],
                        }
                      : {}
                  }
                  transition={{
                    duration: 1.5,
                    repeat: isActive ? Infinity : 0,
                  }}
                  className={`h-3 w-3 rounded-full transition-all duration-400 ${
                    isActive
                      ? "bg-neon-green shadow-[0_0_10px_rgba(57,255,20,0.6)]"
                      : isPast
                        ? "bg-neon-green/50"
                        : "bg-white/15"
                  }`}
                />
                <span
                  className={`text-xs font-medium transition-colors duration-400 ${
                    isActive
                      ? "text-white"
                      : isPast
                        ? "text-gray-400"
                        : "text-gray-600"
                  }`}
                >
                  {item.label}
                </span>
              </div>
            </div>
          );
        })}
      </motion.div>

      <AnimatePresence mode="wait">
        {step === "upload" && (
          <motion.div
            key="upload-step"
            initial={{ opacity: 0, x: -30, scale: 0.98 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -50, scale: 0.96 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="w-full flex flex-col items-center"
          >
            {/* Header */}
            <div className="mb-12 text-center">
              <motion.div
                whileHover={{ scale: 1.08, rotate: 5 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
                className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-electric-blue/25 bg-electric-blue/12 shadow-[0_0_30px_rgba(15,240,252,0.15)]"
              >
                <ScanLine className="h-8 w-8 text-electric-blue" />
              </motion.div>
              <h1 className="mb-4 font-heading text-4xl font-bold text-white md:text-5xl">
                Upload <span className="text-gradient">BCA Report</span>
              </h1>
              <p className="mx-auto max-w-lg leading-relaxed text-gray-300">
                Ensure your image is well-lit and the text is clearly visible
                for the highest OCR accuracy.
              </p>
            </div>

            <div className="w-full max-w-2xl">
              <Dropzone onUploadComplete={handleUploadComplete} />
            </div>

            <p className="mt-8 text-center text-xs text-gray-500">
              Supports JPG, PNG, WebP, and PDF up to 5 MB
            </p>
          </motion.div>
        )}

        {step === "review" && uploadResult && (
          <motion.div
            key="review-step"
            initial={{ opacity: 0, x: 50, scale: 0.98 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -50, scale: 0.96 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="w-full flex flex-col items-center"
          >
            {/* Back button */}
            <motion.button
              whileHover={{ x: -4, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setStep("upload");
                setUploadResult(null);
                setReportId(undefined);
              }}
              disabled={isGenerating}
              className="glass-panel-hover self-start mb-8 flex items-center gap-2.5 rounded-xl px-4 py-2.5 text-sm text-gray-400 hover:text-white transition-colors disabled:opacity-50"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Upload a different report</span>
            </motion.button>

            {/* Generation error */}
            {genError && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className="glass-panel w-full max-w-2xl mb-8 flex items-start gap-3 rounded-xl border border-red-500/25 bg-red-500/10 p-4 shadow-[0_0_20px_rgba(239,68,68,0.1)]"
              >
                <p className="text-sm text-red-300">{genError}</p>
              </motion.div>
            )}

            <MetricsCorrection
              metrics={uploadResult.metrics}
              confidence={uploadResult.confidence}
              warnings={uploadResult.warnings}
              onConfirm={handleConfirmMetrics}
              isGenerating={isGenerating}
            />
          </motion.div>
        )}

        {step === "generating" && (
          <motion.div
            key="generating-step"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="w-full flex flex-col items-center justify-center py-20"
          >
            <div className="glass-panel relative w-full max-w-md space-y-10 overflow-hidden p-12 text-center">
              {/* Background gradient overlay */}
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(57,255,20,0.15),transparent_50%)]" />
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_bottom,rgba(15,240,252,0.1),transparent_50%)]" />

              {/* Enhanced spinning animation */}
              <div className="relative mx-auto h-24 w-24">
                {/* Outer ring */}
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 rounded-full border-2 border-white/5"
                  style={{
                    borderTopColor: "rgba(57, 255, 20, 0.8)",
                    borderRightColor: "rgba(15, 240, 252, 0.6)",
                  }}
                />
                {/* Middle ring */}
                <motion.div
                  animate={{ rotate: -360 }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-2 rounded-full border-2 border-transparent"
                  style={{
                    borderBottomColor: "rgba(138, 43, 226, 0.7)",
                    borderLeftColor: "rgba(57, 255, 20, 0.5)",
                  }}
                />
                {/* Inner ring */}
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-4 rounded-full border-2 border-transparent"
                  style={{
                    borderTopColor: "rgba(15, 240, 252, 0.6)",
                    borderRightColor: "rgba(138, 43, 226, 0.4)",
                  }}
                />
                {/* Center icon */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <AnimatePresence mode="wait">
                    {(() => {
                      const StageIcon =
                        GEN_STAGES[genStageIndex]?.icon || Brain;
                      return (
                        <motion.div
                          key={genStageIndex}
                          initial={{ scale: 0, opacity: 0, rotate: -20 }}
                          animate={{ scale: 1, opacity: 1, rotate: 0 }}
                          exit={{ scale: 0, opacity: 0, rotate: 20 }}
                          transition={{ duration: 0.3 }}
                        >
                          <StageIcon className="h-8 w-8 text-neon-green" />
                        </motion.div>
                      );
                    })()}
                  </AnimatePresence>
                </div>
                {/* Glow effect */}
                <div className="absolute inset-0 rounded-full bg-neon-green/10 blur-xl animate-pulse" />
              </div>

              {/* Stage label */}
              <div className="relative z-10 space-y-4">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={genStageIndex}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                    className="flex items-center justify-center gap-2"
                  >
                    <Sparkles className="h-4 w-4 text-neon-green/60" />
                    <p className="text-lg font-semibold text-white">
                      {GEN_STAGES[genStageIndex]?.label || "Generating..."}
                    </p>
                  </motion.div>
                </AnimatePresence>
                <p className="text-sm text-gray-400">
                  This usually takes 10–20 seconds
                </p>
              </div>

              {/* Stage progress dots */}
              <div className="relative z-10 flex items-center justify-center gap-5">
                {GEN_STAGES.map((stage, i) => {
                  const Icon = stage.icon;
                  const isPast = i < genStageIndex;
                  const isCurrent = i === genStageIndex;
                  return (
                    <motion.div
                      key={i}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: i * 0.1 }}
                      className="flex flex-col items-center gap-2"
                    >
                      <motion.div
                        animate={
                          isCurrent
                            ? { scale: [1, 1.15, 1], y: [0, -3, 0] }
                            : {}
                        }
                        transition={{
                          duration: 1.2,
                          repeat: isCurrent ? Infinity : 0,
                        }}
                      >
                        <Icon
                          className={`h-5 w-5 transition-all duration-400 ${
                            isPast
                              ? "text-neon-green"
                              : isCurrent
                                ? "text-electric-blue"
                                : "text-gray-600"
                          }`}
                        />
                      </motion.div>
                      <motion.div
                        animate={
                          isCurrent
                            ? {
                                boxShadow: [
                                  "0 0 0 rgba(15,240,252,0)",
                                  "0 0 10px rgba(15,240,252,0.6)",
                                  "0 0 4px rgba(15,240,252,0.4)",
                                ],
                              }
                            : {}
                        }
                        transition={{
                          duration: 1.5,
                          repeat: isCurrent ? Infinity : 0,
                        }}
                        className={`h-2 w-2 rounded-full transition-all duration-400 ${
                          isPast
                            ? "bg-neon-green shadow-[0_0_8px_rgba(57,255,20,0.5)]"
                            : isCurrent
                              ? "bg-electric-blue shadow-[0_0_8px_rgba(15,240,252,0.5)]"
                              : "bg-white/12"
                        }`}
                      />
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
