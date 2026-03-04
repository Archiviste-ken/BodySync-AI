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
    iconBg: "bg-neon-green/10",
    iconText: "text-neon-green",
    glow: "group-hover:shadow-[0_0_40px_rgba(57,255,20,0.08)]",
    border: "group-hover:border-neon-green/20",
    orb: "bg-neon-green/8",
  },
  blue: {
    iconBg: "bg-electric-blue/10",
    iconText: "text-electric-blue",
    glow: "group-hover:shadow-[0_0_40px_rgba(15,240,252,0.08)]",
    border: "group-hover:border-electric-blue/20",
    orb: "bg-electric-blue/8",
  },
  purple: {
    iconBg: "bg-deep-purple/10",
    iconText: "text-deep-purple",
    glow: "group-hover:shadow-[0_0_40px_rgba(138,43,226,0.08)]",
    border: "group-hover:border-deep-purple/20",
    orb: "bg-deep-purple/8",
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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
      whileHover={{ y: -3, transition: { duration: 0.2 } }}
      className={`group glass-panel p-6 relative overflow-hidden transition-all duration-300 ${colors.glow} ${colors.border} ${className}`}
    >
      {/* Background orb */}
      <div
        className={`absolute -right-8 -top-8 h-28 w-28 rounded-full ${colors.orb} blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
      />

      {/* Header */}
      <div className="flex items-center gap-3 mb-4 relative z-10">
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${colors.iconBg}`}>
          <Icon className={`h-5 w-5 ${colors.iconText}`} />
        </div>
        <h3 className="font-heading text-lg font-semibold text-white">{title}</h3>
      </div>

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}
