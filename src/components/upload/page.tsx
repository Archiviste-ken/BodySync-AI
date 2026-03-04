"use client";

import Dropzone from "@/components/upload/Dropzone";
import { motion } from "framer-motion";
import { ScanLine } from "lucide-react";

export default function UploadPage() {
  return (
    <div className="relative min-h-[85vh] flex flex-col items-center justify-center py-16 px-4">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-32 -translate-x-1/2 h-[400px] w-[600px] rounded-full bg-electric-blue/[0.04] blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-10"
      >
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
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15 }}
        className="w-full max-w-2xl"
      >
        <Dropzone />
      </motion.div>
    </div>
  );
}