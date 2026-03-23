"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import {
  UploadCloud,
  FileText,
  X,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Clock,
  ImageIcon,
  ScanLine,
  BarChart3,
  Sparkles,
} from "lucide-react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import type { ParsedBCAData } from "@/lib/types";

export interface UploadResult {
  metrics: ParsedBCAData;
  rawText: string;
  confidence: number;
  warnings: string[];
  requiresCorrection: boolean;
  reportId?: string;
  ocrMode?: string;
  ocrDurationMs?: number;
}

interface DropzoneProps {
  onUploadComplete: (result: UploadResult) => void;
}

// Pipeline stages with real labels
const STAGES = [
  {
    key: "upload",
    label: "Uploading file...",
    progress: 10,
    icon: UploadCloud,
  },
  {
    key: "preprocess",
    label: "Preprocessing image...",
    progress: 25,
    icon: ImageIcon,
  },
  {
    key: "ocr",
    label: "Running OCR extraction...",
    progress: 50,
    icon: ScanLine,
  },
  {
    key: "parsing",
    label: "Parsing metrics...",
    progress: 75,
    icon: BarChart3,
  },
  { key: "saving", label: "Saving results...", progress: 90, icon: Sparkles },
  {
    key: "done",
    label: "Extraction Complete",
    progress: 100,
    icon: CheckCircle2,
  },
] as const;

type StageKey = (typeof STAGES)[number]["key"];

// User-friendly error messages for API error codes
const ERROR_MESSAGES: Record<string, string> = {
  OCR_TIMEOUT:
    "OCR timed out. You can still enter your values manually on the next screen.",
  OCR_FAILED:
    "Could not read the image. You can still enter your values manually.",
  IMAGE_TOO_BLURRY:
    "The image appears too blurry. You can still enter values manually.",
  OCR_EMPTY:
    "OCR could not detect text clearly. Please ensure the full report is visible or enter the values manually.",
  PARSING_FAILED:
    "Could not extract metrics. You can enter the values manually on the next screen.",
  INVALID_FORMAT:
    "Unsupported file type. Please upload a JPG, PNG, or WebP image.",
  FILE_TOO_LARGE: "File exceeds the 5 MB limit. Compress or resize the image.",
  NO_FILE: "No file was received. Please try uploading again.",
};

// Client-side timeout: 60s (AI vision extraction is fast but network may vary)
const CLIENT_TIMEOUT_MS = 60_000;

export default function Dropzone({ onUploadComplete }: DropzoneProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<
    "idle" | "success" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [stageKey, setStageKey] = useState<StageKey>("upload");
  const abortRef = useRef<AbortController | null>(null);
  const stageTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cleanup preview URL to prevent memory leaks
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
      if (stageTimerRef.current) clearTimeout(stageTimerRef.current);
    };
  }, [preview]);

  const handleFile = (selectedFile: File) => {
    if (
      !selectedFile.type.includes("image") &&
      selectedFile.type !== "application/pdf"
    ) {
      setErrorMessage("Please upload an image or PDF file.");
      return;
    }
    if (selectedFile.size > 5 * 1024 * 1024) {
      setErrorMessage("File is too large. Maximum size is 5 MB.");
      return;
    }
    setFile(selectedFile);
    setUploadStatus("idle");
    setErrorMessage(null);
    setErrorCode(null);
    setProgress(0);
    setStageKey("upload");

    if (selectedFile.type.includes("image")) {
      setPreview(URL.createObjectURL(selectedFile));
    } else {
      setPreview(null);
    }
  };

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, []);

  // Advance through pipeline stages on a realistic schedule
  const startStageProgression = () => {
    // Stage 1: upload (instant)
    setStageKey("upload");
    setProgress(10);

    // Stage 2: preprocess (after 800ms)
    stageTimerRef.current = setTimeout(() => {
      setStageKey("preprocess");
      setProgress(25);

      // Stage 3: ocr (after 2s more — this is the longest stage)
      stageTimerRef.current = setTimeout(() => {
        setStageKey("ocr");
        setProgress(50);

        // Stage 4: parsing (after 6s more for OCR)
        stageTimerRef.current = setTimeout(() => {
          setStageKey("parsing");
          setProgress(75);
        }, 6000);
      }, 2000);
    }, 800);
  };

  const clearStageTimers = () => {
    if (stageTimerRef.current) {
      clearTimeout(stageTimerRef.current);
      stageTimerRef.current = null;
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setIsUploading(true);
    setProgress(0);
    setErrorMessage(null);
    setErrorCode(null);
    setUploadStatus("idle");

    // Start stage progression
    startStageProgression();

    // AbortController for client-side timeout
    const controller = new AbortController();
    abortRef.current = controller;
    const timeoutId = setTimeout(() => controller.abort(), CLIENT_TIMEOUT_MS);

    const formData = new FormData();
    formData.append("report", file);

    try {
      const res = await fetch("/api/upload-report", {
        method: "POST",
        body: formData,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      clearStageTimers();

      const data = await res.json();

      if (res.ok && data.success) {
        setStageKey("saving");
        setProgress(90);

        // Brief flash of "saving" stage, then complete
        await new Promise((r) => setTimeout(r, 400));
        setStageKey("done");
        setProgress(100);
        setUploadStatus("success");

        // Hand off to parent after brief celebration
        setTimeout(() => {
          onUploadComplete({
            metrics: data.metrics,
            rawText: data.rawText,
            confidence: data.confidence,
            warnings: data.warnings,
            requiresCorrection: data.requiresCorrection,
            reportId: data.reportId,
            ocrMode: data.ocrMode,
            ocrDurationMs: data.ocrDurationMs,
          });
        }, 800);
      } else {
        setUploadStatus("error");
        const code = data.code || "";
        setErrorCode(code);
        setErrorMessage(
          ERROR_MESSAGES[code] || data.error || "Failed to process the report.",
        );
      }
    } catch (err: unknown) {
      clearStageTimers();
      setUploadStatus("error");

      if (err instanceof DOMException && err.name === "AbortError") {
        setErrorCode("CLIENT_TIMEOUT");
        setErrorMessage(
          "Request timed out. Please check your connection and try again.",
        );
      } else {
        setErrorCode("NETWORK_ERROR");
        setErrorMessage(
          "Network error. Please check your connection and try again.",
        );
      }
    } finally {
      clearTimeout(timeoutId);
      setIsUploading(false);
      abortRef.current = null;
    }
  };

  const clearFile = () => {
    // Abort any in-progress upload
    if (abortRef.current) abortRef.current.abort();
    clearStageTimers();
    setFile(null);
    setPreview(null);
    setUploadStatus("idle");
    setErrorMessage(null);
    setErrorCode(null);
    setProgress(0);
    setStageKey("upload");
    setIsUploading(false);
  };

  // Get current stage info
  const currentStage = STAGES.find((s) => s.key === stageKey) || STAGES[0];
  const CurrentStageIcon = currentStage.icon;

  return (
    <div className="w-full space-y-4">
      <AnimatePresence mode="wait">
        {!file ? (
          /* Dropzone Area */
          <motion.div
            key="dropzone"
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -10 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            onClick={() => document.getElementById("fileInput")?.click()}
            className={`group glass-panel relative cursor-pointer overflow-hidden rounded-2xl border-2 border-dashed p-16 text-center transition-all duration-400 ${
              isDragging
                ? "border-neon-green bg-neon-green/[0.1] shadow-[0_0_60px_rgba(57,255,20,0.12),inset_0_0_60px_rgba(57,255,20,0.05)]"
                : "border-white/12 bg-white/[0.02] hover:border-white/22 hover:bg-white/[0.05] hover:shadow-[0_0_40px_rgba(15,240,252,0.08)]"
            }`}
          >
            {/* Animated background gradient */}
            <motion.div
              animate={{
                backgroundPosition: isDragging
                  ? ["0% 0%", "100% 100%"]
                  : ["0% 0%"],
              }}
              transition={{
                duration: 2,
                repeat: isDragging ? Infinity : 0,
                ease: "linear",
              }}
              className="pointer-events-none absolute inset-0 opacity-30"
              style={{
                background: isDragging
                  ? "linear-gradient(135deg, rgba(57,255,20,0.1) 0%, transparent 50%, rgba(15,240,252,0.1) 100%)"
                  : "transparent",
                backgroundSize: "200% 200%",
              }}
            />

            {/* Hover glow orb */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileHover={{ opacity: 1, scale: 1 }}
              className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-48 w-48 rounded-full bg-electric-blue/[0.08] blur-[100px] opacity-0 group-hover:opacity-100 transition-opacity duration-600"
            />

            {/* Corner orbs */}
            <div className="pointer-events-none absolute -top-16 -right-16 h-32 w-32 rounded-full bg-neon-green/10 blur-3xl opacity-0 group-hover:opacity-60 transition-opacity duration-500" />
            <div className="pointer-events-none absolute -bottom-16 -left-16 h-32 w-32 rounded-full bg-electric-blue/10 blur-3xl opacity-0 group-hover:opacity-60 transition-opacity duration-500" />

            <motion.div
              animate={
                isDragging
                  ? { scale: 1.12, y: -8, rotate: 5 }
                  : { scale: 1, y: 0, rotate: 0 }
              }
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="relative z-10"
            >
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
                className="mx-auto mb-6 flex h-18 w-18 items-center justify-center rounded-2xl border border-white/12 bg-white/5 shadow-lg"
                style={{ height: "72px", width: "72px" }}
              >
                <UploadCloud
                  className={`h-9 w-9 transition-all duration-300 ${
                    isDragging
                      ? "text-neon-green scale-110"
                      : "text-gray-400 group-hover:text-electric-blue group-hover:scale-105"
                  }`}
                />
              </motion.div>
              <h3 className="font-heading text-xl font-semibold text-white mb-2.5">
                {isDragging ? "Drop it here" : "Drag & Drop your BCA Report"}
              </h3>
              <p className="text-sm text-gray-500">
                or{" "}
                <span className="text-electric-blue underline underline-offset-4 decoration-electric-blue/50 hover:decoration-electric-blue transition-all">
                  browse files
                </span>
              </p>
            </motion.div>

            <input
              id="fileInput"
              type="file"
              accept="image/*,application/pdf"
              className="hidden"
              onChange={(e) => e.target.files && handleFile(e.target.files[0])}
            />
          </motion.div>
        ) : (
          /* File Preview & Upload */
          <motion.div
            key="preview"
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -10 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="glass-panel-hover p-6 space-y-5"
          >
            {/* File Info */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <motion.div
                  whileHover={{ scale: 1.05, rotate: 2 }}
                  className="relative h-18 w-18 overflow-hidden rounded-xl border border-white/12 bg-black/40 flex items-center justify-center shrink-0 shadow-lg"
                  style={{ height: "72px", width: "72px" }}
                >
                  {preview ? (
                    <Image
                      src={preview}
                      alt="Preview"
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <FileText className="h-8 w-8 text-deep-purple" />
                  )}
                  {/* Overlay shine */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent pointer-events-none" />
                </motion.div>
                <div>
                  <p className="font-medium text-white truncate max-w-[200px] md:max-w-xs">
                    {file.name}
                  </p>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
                onClick={clearFile}
                disabled={false}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-gray-400 transition-all hover:bg-white/10 hover:text-white disabled:opacity-50 border border-white/5 hover:border-white/10"
              >
                <X className="h-4 w-4" />
              </motion.button>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className="flex items-start gap-3 rounded-xl bg-red-500/10 border border-red-500/25 p-4 shadow-[0_0_20px_rgba(239,68,68,0.1)]"
              >
                <AlertCircle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-red-300">{errorMessage}</p>
                  {errorCode && (
                    <p className="text-[10px] text-red-500/50 mt-1 font-mono">
                      Code: {errorCode}
                    </p>
                  )}
                </div>
              </motion.div>
            )}

            {/* Pipeline Progress */}
            {(isUploading || uploadStatus === "success") && (
              <div className="space-y-3">
                {/* Stage label with icon */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5 text-xs text-gray-400">
                    {uploadStatus === "success" ? (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{
                          type: "spring",
                          stiffness: 400,
                          damping: 15,
                        }}
                      >
                        <CheckCircle2 className="h-4 w-4 text-neon-green" />
                      </motion.div>
                    ) : (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                      >
                        <CurrentStageIcon className="h-4 w-4 text-electric-blue" />
                      </motion.div>
                    )}
                    <span className="font-medium">{currentStage.label}</span>
                  </div>
                  <span className="text-xs text-gray-500 font-mono tabular-nums">
                    {Math.round(progress)}%
                  </span>
                </div>

                {/* Progress bar */}
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-white/5 shadow-[inset_0_1px_2px_rgba(0,0,0,0.3)]">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    className="relative h-full rounded-full"
                    style={{
                      background:
                        uploadStatus === "success"
                          ? "linear-gradient(90deg, #39FF14, #0FF0FC)"
                          : "linear-gradient(90deg, #0FF0FC, #39FF14, #8a2be2)",
                      boxShadow:
                        uploadStatus === "success"
                          ? "0 0 16px rgba(57,255,20,0.5), 0 0 32px rgba(57,255,20,0.3)"
                          : "0 0 16px rgba(15,240,252,0.4), 0 0 32px rgba(15,240,252,0.2)",
                    }}
                  >
                    {/* Animated shine */}
                    <motion.div
                      animate={{ x: ["-100%", "200%"] }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "easeInOut",
                        repeatDelay: 0.5,
                      }}
                      className="absolute inset-0 w-1/3"
                      style={{
                        background:
                          "linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent)",
                      }}
                    />
                    {/* Top highlight */}
                    <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/30 to-transparent rounded-t-full" />
                  </motion.div>
                </div>

                {/* Stage dots */}
                <div className="flex items-center justify-between px-1">
                  {STAGES.slice(0, -1).map((stage, idx) => {
                    const StageIcon = stage.icon;
                    const isPast = progress > stage.progress;
                    const isCurrent = stageKey === stage.key;
                    return (
                      <motion.div
                        key={stage.key}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: idx * 0.05 }}
                        className="flex flex-col items-center gap-1.5"
                        title={stage.label}
                      >
                        <motion.div
                          animate={
                            isCurrent ? { scale: [1, 1.2, 1] } : { scale: 1 }
                          }
                          transition={{
                            duration: 1,
                            repeat: isCurrent ? Infinity : 0,
                          }}
                        >
                          <StageIcon
                            className={`h-3.5 w-3.5 transition-all duration-300 ${
                              isPast
                                ? "text-neon-green"
                                : isCurrent
                                  ? "text-electric-blue"
                                  : "text-gray-600"
                            }`}
                          />
                        </motion.div>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Timeout hint */}
                {isUploading && stageKey === "ocr" && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 text-[10px] text-gray-600"
                  >
                    <Clock className="h-3 w-3" />
                    <span>
                      OCR may take up to 25 seconds for complex images
                    </span>
                  </motion.div>
                )}
              </div>
            )}

            {/* Upload Button */}
            <motion.button
              whileHover={
                !isUploading && uploadStatus !== "success"
                  ? { scale: 1.02, y: -2 }
                  : {}
              }
              whileTap={
                !isUploading && uploadStatus !== "success"
                  ? { scale: 0.98 }
                  : {}
              }
              onClick={handleUpload}
              disabled={isUploading || uploadStatus === "success"}
              className={`w-full flex items-center justify-center gap-2.5 rounded-xl py-4 px-4 font-bold transition-all duration-400 disabled:cursor-not-allowed ${
                uploadStatus === "success"
                  ? "bg-neon-green/12 text-neon-green border border-neon-green/25 shadow-[0_0_30px_rgba(57,255,20,0.15)]"
                  : uploadStatus === "error"
                    ? "bg-red-500/10 text-red-400 border border-red-500/25 hover:bg-red-500/20"
                    : "bg-gradient-to-r from-neon-green via-electric-blue to-deep-purple text-black hover:shadow-[0_0_40px_rgba(57,255,20,0.25),0_0_60px_rgba(15,240,252,0.15)] disabled:opacity-60"
              }`}
            >
              {isUploading ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  >
                    <Loader2 className="h-5 w-5" />
                  </motion.div>
                  <span>Extracting Metrics...</span>
                </>
              ) : uploadStatus === "success" ? (
                <>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 15 }}
                  >
                    <CheckCircle2 className="h-5 w-5" />
                  </motion.div>
                  <span>Extraction Complete</span>
                </>
              ) : uploadStatus === "error" ? (
                <>
                  <AlertCircle className="h-5 w-5" />
                  <span>Failed — Click to Retry</span>
                </>
              ) : (
                <span>Analyze Report</span>
              )}
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
