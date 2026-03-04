"use client";

import { motion } from "framer-motion";

interface WorkoutCardProps {
  day: string;
  focus: string;
  exercises: string[];
  index: number;
}

const dayColors: Record<string, string> = {
  "Day 1": "from-neon-green/20 to-neon-green/5 text-neon-green border-neon-green/20",
  "Day 2": "from-electric-blue/20 to-electric-blue/5 text-electric-blue border-electric-blue/20",
  "Day 3": "from-deep-purple/20 to-deep-purple/5 text-deep-purple border-deep-purple/20",
  "Day 4": "from-yellow-500/20 to-yellow-500/5 text-yellow-400 border-yellow-500/20",
  "Day 5": "from-neon-green/20 to-neon-green/5 text-neon-green border-neon-green/20",
  "Day 6": "from-electric-blue/20 to-electric-blue/5 text-electric-blue border-electric-blue/20",
  "Day 7": "from-gray-400/20 to-gray-400/5 text-gray-400 border-gray-500/20",
};

const accentBorder: Record<string, string> = {
  "Day 1": "group-hover:border-neon-green/25",
  "Day 2": "group-hover:border-electric-blue/25",
  "Day 3": "group-hover:border-deep-purple/25",
  "Day 4": "group-hover:border-yellow-500/25",
  "Day 5": "group-hover:border-neon-green/25",
  "Day 6": "group-hover:border-electric-blue/25",
  "Day 7": "group-hover:border-gray-500/25",
};

const glowColors: Record<string, string> = {
  "Day 1": "group-hover:shadow-[0_0_30px_rgba(57,255,20,0.06)]",
  "Day 2": "group-hover:shadow-[0_0_30px_rgba(15,240,252,0.06)]",
  "Day 3": "group-hover:shadow-[0_0_30px_rgba(138,43,226,0.06)]",
  "Day 4": "group-hover:shadow-[0_0_30px_rgba(234,179,8,0.06)]",
  "Day 5": "group-hover:shadow-[0_0_30px_rgba(57,255,20,0.06)]",
  "Day 6": "group-hover:shadow-[0_0_30px_rgba(15,240,252,0.06)]",
  "Day 7": "group-hover:shadow-[0_0_30px_rgba(156,163,175,0.06)]",
};

export default function WorkoutCard({ day, focus, exercises, index }: WorkoutCardProps) {
  const badgeColor = dayColors[day] || dayColors["Day 1"];
  const hoverBorder = accentBorder[day] || accentBorder["Day 1"];
  const hoverGlow = glowColors[day] || glowColors["Day 1"];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08, ease: "easeOut" }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className={`group glass-panel p-5 flex flex-col h-full transition-all duration-300 ${hoverBorder} ${hoverGlow} relative overflow-hidden`}
    >
      {/* Corner gradient accent */}
      <div
        className={`absolute -top-10 -right-10 h-24 w-24 rounded-full bg-gradient-to-br ${badgeColor.split(" ")[0]} ${badgeColor.split(" ")[1]} blur-2xl opacity-0 group-hover:opacity-60 transition-opacity duration-500`}
      />

      {/* Day Badge */}
      <div className="flex justify-between items-start mb-4 relative z-10">
        <span
          className={`inline-flex items-center rounded-lg border bg-gradient-to-r px-2.5 py-1 text-xs font-bold uppercase tracking-wider ${badgeColor}`}
        >
          {day}
        </span>
      </div>

      {/* Focus Title */}
      <h3 className="text-base font-bold text-white mb-3 flex-grow relative z-10 leading-snug">
        {focus}
      </h3>

      {/* Exercise List */}
      <ul className="space-y-2 text-sm text-gray-400 relative z-10">
        {exercises.map((ex, i) => (
          <li key={i} className="flex items-start gap-2.5 group/item">
            <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-gradient-to-r from-neon-green to-electric-blue shrink-0" />
            <span className="group-hover/item:text-gray-200 transition-colors">{ex}</span>
          </li>
        ))}
      </ul>
    </motion.div>
  );
}
