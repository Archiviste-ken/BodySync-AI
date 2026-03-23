"use client";

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

// Map delay prop to animation class
const delayMap: Record<number, string> = {
  0.7: "animate-slide-up-stagger-1",
  0.8: "animate-slide-up-stagger-2",
  0.9: "animate-slide-up-stagger-3",
};

export default function FeatureCard({
  icon: Icon,
  title,
  description,
  accentColor = "green",
  delay = 0,
}: FeatureCardProps) {
  const colors = colorMap[accentColor];
  const animationClass = delayMap[delay] || "animate-slide-up-stagger-1";

  return (
    <div
      className={`group glass-panel p-8 text-center transition-all duration-400 ${colors.glow} hover:border-white/22 hover:-translate-y-2 hover:scale-102 active:scale-98 ${animationClass}`}
    >
      {/* Radial gradient from top */}
      <div
        className="pointer-events-none absolute inset-0 rounded-[inherit] bg-[radial-gradient(circle_at_50%_-20%,rgba(255,255,255,0.15),transparent_55%)] opacity-70 transition-opacity duration-500 group-hover:opacity-100"
      />

      {/* Color-specific gradient overlay */}
      <div
        className={`pointer-events-none absolute inset-0 rounded-[inherit] bg-gradient-to-b ${colors.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
      />

      {/* Floating background orb */}
      <div
        className={`pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full ${colors.orbColor} blur-3xl opacity-0 group-hover:opacity-60 transition-all duration-600 group-hover:scale-150`}
      />

      {/* Inner light reflection */}
      <div className="pointer-events-none absolute inset-0 rounded-[inherit] shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)]" />

      {/* Icon container with enhanced animation */}
      <div className={`relative z-10 mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border ${colors.iconBg} transition-all duration-400 group-hover:border-opacity-50 group-hover:scale-112 group-hover:rotate-8 group-hover:-translate-y-0.5`}>
        <div className="animate-icon-wobble">
          <Icon
            className={`h-8 w-8 ${colors.iconText} transition-all duration-300 group-hover:scale-110`}
          />
        </div>

        {/* Icon glow ring */}
        <div
          className={`absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${colors.glow}`}
        />
      </div>

      <h3 className="relative z-10 mb-3 font-heading text-xl sm:text-2xl font-bold text-white tracking-tight">
        {title}
      </h3>
      <p className="relative z-10 text-base leading-relaxed text-gray-400 group-hover:text-gray-300 transition-colors duration-300">
        {description}
      </p>
    </div>
  );
}
