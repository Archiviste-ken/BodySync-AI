"use client";

import { useState, useCallback, useEffect } from "react";
import { UploadCloud, FileText, X, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export default function Dropzone() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<"idle" | "success" | "error">("idle");
  const [progress, setProgress] = useState(0);

  const router = useRouter();

  // Cleanup preview URL to prevent memory leaks
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const handleFile = (selectedFile: File) => {
    if (!selectedFile.type.includes("image") && selectedFile.type !== "application/pdf") {
      alert("Please upload an image or PDF.");
      return;
    }
    setFile(selectedFile);
    setUploadStatus("idle");
    setProgress(0);

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

  const handleUpload = async () => {
    if (!file) return;
    setIsUploading(true);
    setProgress(0);

    // Simulate progress
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + Math.random() * 15;
      });
    }, 200);

    const formData = new FormData();
    formData.append("report", file);

    try {
      const res = await fetch("/api/upload-report", {
        method: "POST",
        body: formData,
      });

      clearInterval(progressInterval);

      if (res.ok) {
        setProgress(100);
        setUploadStatus("success");
        setTimeout(() => {
          router.push("/plan");
        }, 1200);
      } else {
        setUploadStatus("error");
      }
    } catch {
      clearInterval(progressInterval);
      setUploadStatus("error");
    } finally {
      setIsUploading(false);
    }
  };

  const clearFile = () => {
    setFile(null);
    setPreview(null);
    setUploadStatus("idle");
    setProgress(0);
  };

  return (
    <div className="w-full space-y-4">
      <AnimatePresence mode="wait">
        {!file ? (
          /* ── Dropzone Area ── */
          <motion.div
            key="dropzone"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.3 }}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            onClick={() => document.getElementById("fileInput")?.click()}
            className={`group relative cursor-pointer overflow-hidden rounded-2xl border-2 border-dashed p-14 text-center transition-all duration-300 ${
              isDragging
                ? "border-neon-green bg-neon-green/[0.06] shadow-[0_0_40px_rgba(57,255,20,0.08)]"
                : "border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]"
            }`}
          >
            {/* Hover glow orb */}
            <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-40 w-40 rounded-full bg-electric-blue/[0.06] blur-[80px] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <motion.div
              animate={isDragging ? { scale: 1.1, y: -5 } : { scale: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="relative z-10"
            >
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
                <UploadCloud
                  className={`h-8 w-8 transition-colors duration-300 ${
                    isDragging ? "text-neon-green" : "text-gray-400 group-hover:text-electric-blue"
                  }`}
                />
              </div>
              <h3 className="font-heading text-xl font-semibold text-white mb-2">
                {isDragging ? "Drop it here" : "Drag & Drop your BCA Report"}
              </h3>
              <p className="text-sm text-gray-500">
                or <span className="text-electric-blue underline underline-offset-2">browse files</span>
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
          /* ── File Preview & Upload ── */
          <motion.div
            key="preview"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.3 }}
            className="glass-panel p-6 space-y-5"
          >
            {/* File Info */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="relative h-16 w-16 overflow-hidden rounded-xl border border-white/10 bg-black/40 flex items-center justify-center shrink-0">
                  {preview ? (
                    <Image src={preview} alt="Preview" fill className="object-cover" />
                  ) : (
                    <FileText className="h-7 w-7 text-deep-purple" />
                  )}
                </div>
                <div>
                  <p className="font-medium text-white truncate max-w-[200px] md:max-w-xs">
                    {file.name}
                  </p>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <button
                onClick={clearFile}
                disabled={isUploading}
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 text-gray-400 transition-all hover:bg-white/10 hover:text-white disabled:opacity-50"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Progress Bar */}
            {(isUploading || uploadStatus === "success") && (
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-gray-400">
                  <span>{uploadStatus === "success" ? "Complete" : "Analyzing..."}</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-white/5">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.3 }}
                    className="h-full rounded-full"
                    style={{
                      background:
                        uploadStatus === "success"
                          ? "linear-gradient(90deg, #39FF14, #0FF0FC)"
                          : "linear-gradient(90deg, #0FF0FC, #39FF14)",
                      boxShadow:
                        uploadStatus === "success"
                          ? "0 0 12px rgba(57,255,20,0.4)"
                          : "0 0 12px rgba(15,240,252,0.3)",
                    }}
                  />
                </div>
              </div>
            )}

            {/* Upload Button */}
            <button
              onClick={handleUpload}
              disabled={isUploading || uploadStatus === "success"}
              className={`w-full flex items-center justify-center gap-2 rounded-xl py-3.5 px-4 font-bold transition-all duration-300 disabled:cursor-not-allowed ${
                uploadStatus === "success"
                  ? "bg-neon-green/10 text-neon-green border border-neon-green/20"
                  : uploadStatus === "error"
                    ? "bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20"
                    : "bg-gradient-to-r from-neon-green to-electric-blue text-black hover:shadow-[0_0_30px_rgba(57,255,20,0.2)] disabled:opacity-60"
              }`}
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Analyzing Report...</span>
                </>
              ) : uploadStatus === "success" ? (
                <>
                  <CheckCircle2 className="h-5 w-5" />
                  <span>Analysis Complete — Redirecting...</span>
                </>
              ) : uploadStatus === "error" ? (
                <>
                  <AlertCircle className="h-5 w-5" />
                  <span>Failed — Click to Retry</span>
                </>
              ) : (
                <span>Analyze Report</span>
              )}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}