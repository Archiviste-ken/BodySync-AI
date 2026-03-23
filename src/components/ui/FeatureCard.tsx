"use client";

import { motion } from "framer-motion";
import { type LucideIcon } from "lucide-react";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  accentColor?: "green" | "blue" | "purple";
  delay?: number;
}

const colorMap = {
  green: {
    iconBg: "bg-neon-green/12 border-neon-green/25",
    iconText: "text-neon-green",
    glow: "group-hover:shadow-[0_0_60px_rgba(57,255,20,0.15),0_0_120px_rgba(57,255,20,0.08)]",
    gradient: "from-neon-green/15 via-neon-green/5 to-transparent",
    orbColor: "bg-neon-green/20",
  },
  blue: {
    iconBg: "bg-electric-blue/12 border-electric-blue/25",
    iconText: "text-electric-blue",
    glow: "group-hover:shadow-[0_0_60px_rgba(15,240,252,0.15),0_0_120px_rgba(15,240,252,0.08)]",
    gradient: "from-electric-blue/15 via-electric-blue/5 to-transparent",
    orbColor: "bg-electric-blue/20",
  },
  purple: {
    iconBg: "bg-deep-purple/12 border-deep-purple/25",
    iconText: "text-deep-purple",
    glow: "group-hover:shadow-[0_0_60px_rgba(138,43,226,0.15),0_0_120px_rgba(138,43,226,0.08)]",
    gradient: "from-deep-purple/15 via-deep-purple/5 to-transparent",
    orbColor: "bg-deep-purple/20",
  },
};

export default function FeatureCard({
  icon: Icon,
  title,
  description,
  accentColor = "green",
  delay = 0,
}: FeatureCardProps) {
  const colors = colorMap[accentColor];

  return (
    <motion.div
      initial={{ opacity: 0, y: 32, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{
        y: -8,
        scale: 1.02,
        rotateX: 2,
        rotateY: -1,
        transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] },
      }}
      whileTap={{ scale: 0.98 }}
      style={{
        transformStyle: "preserve-3d",
        perspective: "1200px",
      }}
      className={`group glass-panel p-7 text-center transition-all duration-400 ${colors.glow} hover:border-white/22`}
    >
      {/* Radial gradient from top */}
      <div
        className={`pointer-events-none absolute inset-0 rounded-[inherit] bg-[radial-gradient(circle_at_50%_-20%,rgba(255,255,255,0.15),transparent_55%)] opacity-70 transition-opacity duration-500 group-hover:opacity-100`}
      />

      {/* Color-specific gradient overlay */}
      <div
        className={`pointer-events-none absolute inset-0 rounded-[inherit] bg-gradient-to-b ${colors.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
      />

      {/* Floating background orb */}
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        whileHover={{ opacity: 0.6, scale: 1.5 }}
        transition={{ duration: 0.6 }}
        className={`pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full ${colors.orbColor} blur-3xl opacity-0 group-hover:opacity-60`}
      />

      {/* Inner light reflection */}
      <div className="pointer-events-none absolute inset-0 rounded-[inherit] shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)]" />

      {/* Icon container with enhanced animation */}
      <motion.div
        whileHover={{ scale: 1.12, rotate: 8, y: -2 }}
        transition={{ type: "spring", stiffness: 350, damping: 15 }}
        className={`relative z-10 mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border ${colors.iconBg} transition-all duration-400 group-hover:border-opacity-50`}
      >
        <motion.div
          animate={{ rotate: [0, 5, -5, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        >
          <Icon
            className={`h-8 w-8 ${colors.iconText} transition-all duration-300 group-hover:scale-110`}
          />
        </motion.div>

        {/* Icon glow ring */}
        <div
          className={`absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${colors.glow}`}
        />
      </motion.div>

      <h3 className="relative z-10 mb-3 font-heading text-xl font-bold text-white tracking-tight">
        {title}
      </h3>
      <p className="relative z-10 text-sm leading-relaxed text-gray-400 group-hover:text-gray-300 transition-colors duration-300">
        {description}
      </p>
    </motion.div>
  );
}
