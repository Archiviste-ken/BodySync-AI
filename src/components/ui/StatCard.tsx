"use client";

import { motion } from "framer-motion";
import { type LucideIcon } from "lucide-react";
import { type ReactNode } from "react";

interface StatCardProps {
  icon: LucideIcon;
  title: string;
  children: ReactNode;
  accentColor?: "green" | "blue" | "purple";
  delay?: number;
  className?: string;
}

const colorMap = {
  green: {
    iconBg: "bg-neon-green/12 border-neon-green/20",
    iconText: "text-neon-green",
    glow: "group-hover:shadow-[0_0_50px_rgba(57,255,20,0.12),0_0_100px_rgba(57,255,20,0.06)]",
    border: "group-hover:border-neon-green/25",
    orb: "bg-neon-green/12",
    orbGlow: "shadow-[0_0_80px_50px_rgba(57,255,20,0.15)]",
    gradient: "from-neon-green/10 via-transparent to-transparent",
  },
  blue: {
    iconBg: "bg-electric-blue/12 border-electric-blue/20",
    iconText: "text-electric-blue",
    glow: "group-hover:shadow-[0_0_50px_rgba(15,240,252,0.12),0_0_100px_rgba(15,240,252,0.06)]",
    border: "group-hover:border-electric-blue/25",
    orb: "bg-electric-blue/12",
    orbGlow: "shadow-[0_0_80px_50px_rgba(15,240,252,0.15)]",
    gradient: "from-electric-blue/10 via-transparent to-transparent",
  },
  purple: {
    iconBg: "bg-deep-purple/12 border-deep-purple/20",
    iconText: "text-deep-purple",
    glow: "group-hover:shadow-[0_0_50px_rgba(138,43,226,0.12),0_0_100px_rgba(138,43,226,0.06)]",
    border: "group-hover:border-deep-purple/25",
    orb: "bg-deep-purple/12",
    orbGlow: "shadow-[0_0_80px_50px_rgba(138,43,226,0.15)]",
    gradient: "from-deep-purple/10 via-transparent to-transparent",
  },
};

export default function StatCard({
  icon: Icon,
  title,
  children,
  accentColor = "green",
  delay = 0,
  className = "",
}: StatCardProps) {
  const colors = colorMap[accentColor];

  return (
    <motion.div
      initial={{ opacity: 0, y: 28, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.55, delay, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{
        y: -6,
        scale: 1.01,
        rotateX: 1.5,
        transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] },
      }}
      whileTap={{ scale: 0.995 }}
      style={{
        transformStyle: "preserve-3d",
        perspective: "1000px",
      }}
      className={`group glass-panel p-6 relative overflow-hidden transition-all duration-400 ${colors.glow} ${colors.border} ${className}`}
    >
      {/* Background orb with enhanced animation */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        whileHover={{ opacity: 1, scale: 1.2 }}
        transition={{ duration: 0.5 }}
        className={`absolute -right-12 -top-12 h-36 w-36 rounded-full ${colors.orb} blur-3xl ${colors.orbGlow} opacity-0 group-hover:opacity-100`}
      />

      {/* Secondary orb */}
      <div
        className={`absolute -left-8 -bottom-8 h-24 w-24 rounded-full ${colors.orb} blur-3xl opacity-0 group-hover:opacity-60 transition-opacity duration-700`}
      />

      {/* Gradient overlay */}
      <div
        className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${colors.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
      />

      {/* Top light sweep */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(145deg,rgba(255,255,255,0.1),transparent_40%)] opacity-70" />

      {/* Inner edge glow */}
      <div className="pointer-events-none absolute inset-0 rounded-[inherit] shadow-[inset_0_1px_1px_rgba(255,255,255,0.12)]" />

      {/* Header */}
      <div className="flex items-center gap-3.5 mb-4 relative z-10">
        <motion.div
          whileHover={{ scale: 1.1, rotate: 5 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
          className={`flex h-11 w-11 items-center justify-center rounded-xl border ${colors.iconBg} transition-all duration-300 group-hover:scale-105`}
        >
          <Icon
            className={`h-5 w-5 ${colors.iconText} transition-transform duration-300 group-hover:scale-110`}
          />
        </motion.div>
        <h3 className="font-heading text-lg font-semibold text-white tracking-tight">
          {title}
        </h3>
      </div>

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}
