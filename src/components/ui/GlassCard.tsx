"use client";

import { motion } from "framer-motion";
import { type ReactNode } from "react";

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
  const glowMap = {
    green: "hover:shadow-[0_0_40px_rgba(57,255,20,0.08)] hover:border-neon-green/20",
    blue: "hover:shadow-[0_0_40px_rgba(15,240,252,0.08)] hover:border-electric-blue/20",
    purple: "hover:shadow-[0_0_40px_rgba(138,43,226,0.08)] hover:border-deep-purple/20",
    none: "hover:border-white/15",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
      whileHover={hover ? { y: -3, transition: { duration: 0.2 } } : undefined}
      className={`glass-panel p-6 relative overflow-hidden transition-all duration-300 ${
        hover ? glowMap[glowColor] : ""
      } ${className}`}
    >
      {children}
    </motion.div>
  );
}
