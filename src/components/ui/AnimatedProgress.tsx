"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

interface AnimatedProgressProps {
  value: number; // 0-100
  colorFrom?: string;
  colorTo?: string;
  height?: string;
  delay?: number;
}

export default function AnimatedProgress({
  value,
  colorFrom = "#39FF14",
  colorTo = "#0FF0FC",
  height = "h-2",
  delay = 0,
}: AnimatedProgressProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <div ref={ref} className={`w-full rounded-full bg-white/5 ${height} overflow-hidden`}>
      <motion.div
        initial={{ width: 0 }}
        animate={isInView ? { width: `${value}%` } : { width: 0 }}
        transition={{ duration: 1.2, delay, ease: "easeOut" }}
        className={`${height} rounded-full`}
        style={{
          background: `linear-gradient(90deg, ${colorFrom}, ${colorTo})`,
          boxShadow: `0 0 10px ${colorFrom}40`,
        }}
      />
    </div>
  );
}
