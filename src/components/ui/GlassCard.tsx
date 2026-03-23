"use client";

import { motion } from "framer-motion";
import { type ReactNode, useRef } from "react";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  glowColor?: "green" | "blue" | "purple" | "none";
  delay?: number;
}

export default function GlassCard({
  children,
  className = "",
  hover = true,
  glowColor = "none",
  delay = 0,
}: GlassCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  const glowMap = {
    green:
      "hover:shadow-[0_0_50px_rgba(57,255,20,0.12),0_0_100px_rgba(57,255,20,0.06)] hover:border-neon-green/25",
    blue: "hover:shadow-[0_0_50px_rgba(15,240,252,0.12),0_0_100px_rgba(15,240,252,0.06)] hover:border-electric-blue/25",
    purple:
      "hover:shadow-[0_0_50px_rgba(138,43,226,0.12),0_0_100px_rgba(138,43,226,0.06)] hover:border-deep-purple/25",
    none: "hover:border-white/18",
  };

  const innerGlowMap = {
    green: "from-neon-green/8 via-transparent to-transparent",
    blue: "from-electric-blue/8 via-transparent to-transparent",
    purple: "from-deep-purple/8 via-transparent to-transparent",
    none: "from-white/5 via-transparent to-transparent",
  };

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 24, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: 0.6,
        delay,
        ease: [0.16, 1, 0.3, 1],
      }}
      whileHover={
        hover
          ? {
              y: -6,
              scale: 1.015,
              rotateX: 2,
              rotateY: -1,
              transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] },
            }
          : undefined
      }
      whileTap={hover ? { scale: 0.995 } : undefined}
      style={{
        transformStyle: "preserve-3d",
        perspective: "1000px",
      }}
      className={`glass-panel p-6 relative overflow-hidden transition-all duration-400 ${
        hover ? glowMap[glowColor] : ""
      } ${className}`}
    >
      {/* Top light sweep */}
      <div
        className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${innerGlowMap[glowColor]} opacity-60`}
      />

      {/* Diagonal shine */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(115deg,transparent_20%,rgba(255,255,255,0.08)_40%,transparent_60%)] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      {/* Inner edge highlight */}
      <div className="pointer-events-none absolute inset-0 rounded-[inherit] shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),inset_0_-1px_1px_rgba(0,0,0,0.1)]" />

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}
