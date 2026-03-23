"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

interface AnimatedProgressProps {
  value: number; // 0-100
  colorFrom?: string;
  colorTo?: string;
  height?: string;
  delay?: number;
  showGlow?: boolean;
}

export default function AnimatedProgress({
  value,
  colorFrom = "#39FF14",
  colorTo = "#0FF0FC",
  height = "h-2.5",
  delay = 0,
  showGlow = true,
}: AnimatedProgressProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <div
      ref={ref}
      className={`w-full rounded-full bg-white/[0.06] ${height} overflow-hidden relative`}
      style={{
        boxShadow: "inset 0 1px 2px rgba(0,0,0,0.3)",
      }}
    >
      {/* Background pulse effect */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: [0.3, 0.5, 0.3] } : { opacity: 0 }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay }}
        className="absolute inset-0 rounded-full"
        style={{
          background: `linear-gradient(90deg, ${colorFrom}10, ${colorTo}10)`,
        }}
      />

      {/* Main progress bar */}
      <motion.div
        initial={{ width: 0, opacity: 0 }}
        animate={
          isInView
            ? { width: `${value}%`, opacity: 1 }
            : { width: 0, opacity: 0 }
        }
        transition={{
          duration: 1.4,
          delay,
          ease: [0.16, 1, 0.3, 1],
        }}
        className={`${height} relative rounded-full`}
        style={{
          background: `linear-gradient(90deg, ${colorFrom}, ${colorTo})`,
          boxShadow: showGlow
            ? `0 0 16px ${colorFrom}50, 0 0 32px ${colorFrom}30, 0 0 48px ${colorTo}20`
            : `0 0 8px ${colorFrom}30`,
        }}
      >
        {/* Animated shine sweep */}
        <motion.div
          initial={{ x: "-100%" }}
          animate={isInView ? { x: "200%" } : { x: "-100%" }}
          transition={{
            duration: 1.5,
            delay: delay + 0.4,
            ease: "easeInOut",
            repeat: Infinity,
            repeatDelay: 3,
          }}
          className="absolute inset-0 w-1/2"
          style={{
            background:
              "linear-gradient(90deg, transparent, rgba(255,255,255,0.5), rgba(255,255,255,0.7), rgba(255,255,255,0.5), transparent)",
          }}
        />

        {/* Static top highlight */}
        <div
          className="absolute inset-x-0 top-0 h-1/2 rounded-t-full opacity-60"
          style={{
            background:
              "linear-gradient(to bottom, rgba(255,255,255,0.4), transparent)",
          }}
        />

        {/* End cap glow */}
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={
            isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0 }
          }
          transition={{ delay: delay + 1.2, duration: 0.3 }}
          className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full"
          style={{
            background: colorTo,
            boxShadow: `0 0 8px ${colorTo}, 0 0 16px ${colorTo}80`,
          }}
        />
      </motion.div>
    </div>
  );
}
