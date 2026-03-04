"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Dropzone from "@/components/upload/Dropzone";
import type { UploadResult } from "@/components/upload/Dropzone";
import MetricsCorrection from "@/components/upload/MetricsCorrection";
import { motion, AnimatePresence } from "framer-motion";
import { ScanLine, ArrowLeft, Brain, Flame, Utensils, Dumbbell, Loader2 } from "lucide-react";
import type { ParsedBCAData } from "@/lib/types";

type Step = "upload" | "review" | "generating";

// ── Loading stage labels during plan generation ──
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
        <div className="absolute left-1/2 top-32 -translate-x-1/2 h-[400px] w-[600px] rounded-full bg-electric-blue/[0.04] blur-[120px]" />
      </div>

      {/* Step Indicator */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3 mb-8"
      >
        {[
          { label: "Upload", s: "upload" },
          { label: "Review", s: "review" },
          { label: "Protocol", s: "generating" },
        ].map((item, i) => {
          const isActive = step === item.s;
          const isPast =
            (item.s === "upload" && (step === "review" || step === "generating")) ||
            (item.s === "review" && step === "generating");
          return (
            <div key={item.s} className="flex items-center gap-3">
              {i > 0 && (
                <div
                  className={`h-px w-8 transition-colors duration-300 ${
                    isPast ? "bg-neon-green/50" : "bg-white/10"
                  }`}
                />
              )}
              <div className="flex items-center gap-2">
                <div
                  className={`h-2.5 w-2.5 rounded-full transition-all duration-300 ${
                    isActive
                      ? "bg-neon-green shadow-[0_0_8px_rgba(57,255,20,0.5)]"
                      : isPast
                        ? "bg-neon-green/40"
                        : "bg-white/15"
                  }`}
                />
                <span
                  className={`text-xs font-medium transition-colors duration-300 ${
                    isActive ? "text-white" : isPast ? "text-gray-500" : "text-gray-600"
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
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.35 }}
            className="w-full flex flex-col items-center"
          >
            {/* Header */}
            <div className="text-center mb-10">
              <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-electric-blue/20 bg-electric-blue/10">
                <ScanLine className="h-7 w-7 text-electric-blue" />
              </div>
              <h1 className="font-heading text-4xl md:text-5xl font-bold text-white mb-3">
                Upload <span className="text-gradient">BCA Report</span>
              </h1>
              <p className="text-gray-400 max-w-lg mx-auto leading-relaxed">
                Ensure your image is well-lit and the text is clearly visible for
                the highest OCR accuracy.
              </p>
            </div>

            <div className="w-full max-w-2xl">
              <Dropzone onUploadComplete={handleUploadComplete} />
            </div>

            <p className="mt-6 text-xs text-gray-500 text-center">
              Supports JPG, PNG, WebP, and PDF up to 5 MB
            </p>
          </motion.div>
        )}

        {step === "review" && uploadResult && (
          <motion.div
            key="review-step"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.35 }}
            className="w-full flex flex-col items-center"
          >
            {/* Back button */}
            <button
              onClick={() => {
                setStep("upload");
                setUploadResult(null);
                setReportId(undefined);
              }}
              disabled={isGenerating}
              className="self-start mb-6 flex items-center gap-2 text-sm text-gray-500 hover:text-white transition-colors disabled:opacity-50"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Upload a different report</span>
            </button>

            {/* Generation error */}
            {genError && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-2xl mb-6 flex items-start gap-3 rounded-xl bg-red-500/10 border border-red-500/20 p-4"
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
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.4 }}
            className="w-full flex flex-col items-center justify-center py-20"
          >
            <div className="glass-panel p-10 max-w-md w-full text-center space-y-8">
              {/* Spinning animation */}
              <div className="relative mx-auto h-20 w-20">
                <div className="absolute inset-0 rounded-full border-2 border-white/5" />
                <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-neon-green border-r-electric-blue animate-spin" />
                <div className="absolute inset-2 rounded-full border-2 border-transparent border-b-deep-purple border-l-neon-green animate-spin" style={{ animationDirection: "reverse", animationDuration: "1.5s" }} />
                <div className="absolute inset-0 flex items-center justify-center">
                  {(() => {
                    const StageIcon = GEN_STAGES[genStageIndex]?.icon || Brain;
                    return <StageIcon className="h-7 w-7 text-neon-green" />;
                  })()}
                </div>
              </div>

              {/* Stage label */}
              <div className="space-y-3">
                <AnimatePresence mode="wait">
                  <motion.p
                    key={genStageIndex}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.3 }}
                    className="text-lg font-semibold text-white"
                  >
                    {GEN_STAGES[genStageIndex]?.label || "Generating..."}
                  </motion.p>
                </AnimatePresence>
                <p className="text-sm text-gray-500">
                  This usually takes 10–20 seconds
                </p>
              </div>

              {/* Stage progress dots */}
              <div className="flex items-center justify-center gap-3">
                {GEN_STAGES.map((stage, i) => {
                  const Icon = stage.icon;
                  const isPast = i < genStageIndex;
                  const isCurrent = i === genStageIndex;
                  return (
                    <div key={i} className="flex flex-col items-center gap-1.5">
                      <Icon
                        className={`h-4 w-4 transition-all duration-300 ${
                          isPast
                            ? "text-neon-green"
                            : isCurrent
                              ? "text-electric-blue animate-pulse"
                              : "text-gray-600"
                        }`}
                      />
                      <div
                        className={`h-1.5 w-1.5 rounded-full transition-all duration-300 ${
                          isPast
                            ? "bg-neon-green"
                            : isCurrent
                              ? "bg-electric-blue shadow-[0_0_6px_rgba(15,240,252,0.5)]"
                              : "bg-white/10"
                        }`}
                      />
                    </div>
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