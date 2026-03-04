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
    iconBg: "bg-neon-green/10 border-neon-green/20",
    iconText: "text-neon-green",
    glow: "group-hover:shadow-[0_0_40px_rgba(57,255,20,0.1)]",
  },
  blue: {
    iconBg: "bg-electric-blue/10 border-electric-blue/20",
    iconText: "text-electric-blue",
    glow: "group-hover:shadow-[0_0_40px_rgba(15,240,252,0.1)]",
  },
  purple: {
    iconBg: "bg-deep-purple/10 border-deep-purple/20",
    iconText: "text-deep-purple",
    glow: "group-hover:shadow-[0_0_40px_rgba(138,43,226,0.1)]",
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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className={`group glass-panel p-6 text-center transition-all duration-300 ${colors.glow} hover:border-white/15`}
    >
      <div
        className={`mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border ${colors.iconBg}`}
      >
        <Icon className={`h-7 w-7 ${colors.iconText}`} />
      </div>
      <h3 className="font-heading text-lg font-semibold text-white mb-2">{title}</h3>
      <p className="text-sm text-gray-400 leading-relaxed">{description}</p>
    </motion.div>
  );
}
