"use client";

import { motion } from "framer-motion";

interface WorkoutCardProps {
  day: string;
  focus: string;
  exercises: string[];
  index: number;
}

const dayColors: Record<
  string,
  { badge: string; orb: string; glow: string; border: string; dot: string }
> = {
  "Day 1": {
    badge:
      "from-neon-green/25 to-neon-green/8 text-neon-green border-neon-green/30",
    orb: "bg-neon-green/15",
    glow: "group-hover:shadow-[0_0_50px_rgba(57,255,20,0.1),0_0_100px_rgba(57,255,20,0.05)]",
    border: "group-hover:border-neon-green/30",
    dot: "from-neon-green to-electric-blue",
  },
  "Day 2": {
    badge:
      "from-electric-blue/25 to-electric-blue/8 text-electric-blue border-electric-blue/30",
    orb: "bg-electric-blue/15",
    glow: "group-hover:shadow-[0_0_50px_rgba(15,240,252,0.1),0_0_100px_rgba(15,240,252,0.05)]",
    border: "group-hover:border-electric-blue/30",
    dot: "from-electric-blue to-deep-purple",
  },
  "Day 3": {
    badge:
      "from-deep-purple/25 to-deep-purple/8 text-deep-purple border-deep-purple/30",
    orb: "bg-deep-purple/15",
    glow: "group-hover:shadow-[0_0_50px_rgba(138,43,226,0.1),0_0_100px_rgba(138,43,226,0.05)]",
    border: "group-hover:border-deep-purple/30",
    dot: "from-deep-purple to-neon-green",
  },
  "Day 4": {
    badge:
      "from-yellow-500/25 to-yellow-500/8 text-yellow-400 border-yellow-500/30",
    orb: "bg-yellow-500/15",
    glow: "group-hover:shadow-[0_0_50px_rgba(234,179,8,0.1),0_0_100px_rgba(234,179,8,0.05)]",
    border: "group-hover:border-yellow-500/30",
    dot: "from-yellow-400 to-neon-green",
  },
  "Day 5": {
    badge:
      "from-neon-green/25 to-neon-green/8 text-neon-green border-neon-green/30",
    orb: "bg-neon-green/15",
    glow: "group-hover:shadow-[0_0_50px_rgba(57,255,20,0.1),0_0_100px_rgba(57,255,20,0.05)]",
    border: "group-hover:border-neon-green/30",
    dot: "from-neon-green to-electric-blue",
  },
  "Day 6": {
    badge:
      "from-electric-blue/25 to-electric-blue/8 text-electric-blue border-electric-blue/30",
    orb: "bg-electric-blue/15",
    glow: "group-hover:shadow-[0_0_50px_rgba(15,240,252,0.1),0_0_100px_rgba(15,240,252,0.05)]",
    border: "group-hover:border-electric-blue/30",
    dot: "from-electric-blue to-deep-purple",
  },
  "Day 7": {
    badge: "from-gray-400/25 to-gray-400/8 text-gray-400 border-gray-500/30",
    orb: "bg-gray-400/10",
    glow: "group-hover:shadow-[0_0_50px_rgba(156,163,175,0.08),0_0_100px_rgba(156,163,175,0.04)]",
    border: "group-hover:border-gray-500/30",
    dot: "from-gray-400 to-gray-500",
  },
};

export default function WorkoutCard({
  day,
  focus,
  exercises,
  index,
}: WorkoutCardProps) {
  const colors = dayColors[day] || dayColors["Day 1"];

  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: 0.5,
        delay: index * 0.07,
        ease: [0.16, 1, 0.3, 1],
      }}
      whileHover={{
        y: -7,
        scale: 1.015,
        rotateX: 1.5,
        transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] },
      }}
      whileTap={{ scale: 0.985 }}
      style={{
        transformStyle: "preserve-3d",
        perspective: "1000px",
      }}
      className={`group glass-panel p-5 flex flex-col h-full transition-all duration-400 ${colors.border} ${colors.glow} relative overflow-hidden`}
    >
      {/* Corner gradient orb */}
      <motion.div
        initial={{ opacity: 0, scale: 0.6 }}
        whileHover={{ opacity: 0.7, scale: 1.3 }}
        transition={{ duration: 0.5 }}
        className={`absolute -top-12 -right-12 h-28 w-28 rounded-full ${colors.orb} blur-3xl`}
      />

      {/* Bottom corner orb */}
      <div
        className={`absolute -bottom-8 -left-8 h-20 w-20 rounded-full ${colors.orb} blur-3xl opacity-0 group-hover:opacity-50 transition-opacity duration-600`}
      />

      {/* Top light sweep */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(165deg,rgba(255,255,255,0.1),transparent_35%)] opacity-70" />

      {/* Inner edge glow */}
      <div className="pointer-events-none absolute inset-0 rounded-[inherit] shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]" />

      {/* Day Badge */}
      <div className="flex justify-between items-start mb-4 relative z-10">
        <motion.span
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
          className={`inline-flex items-center rounded-lg border bg-gradient-to-r px-3 py-1.5 text-xs font-bold uppercase tracking-wider ${colors.badge} shadow-lg`}
        >
          {day}
        </motion.span>
      </div>

      {/* Focus Title */}
      <h3 className="text-base font-bold text-white mb-4 flex-grow relative z-10 leading-snug tracking-tight">
        {focus}
      </h3>

      {/* Exercise List */}
      <ul className="space-y-2.5 text-sm text-gray-400 relative z-10">
        {exercises.map((ex, i) => (
          <motion.li
            key={i}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.07 + i * 0.05 + 0.2 }}
            className="flex items-start gap-3 group/item"
          >
            <motion.span
              whileHover={{ scale: 1.4 }}
              className={`mt-1.5 h-2 w-2 rounded-full bg-gradient-to-r ${colors.dot} shrink-0 shadow-sm`}
            />
            <span className="group-hover/item:text-gray-200 transition-colors duration-200">
              {ex}
            </span>
          </motion.li>
        ))}
      </ul>
    </motion.div>
  );
}
