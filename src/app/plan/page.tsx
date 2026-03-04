"use client";

import {
  Flame,
  Droplets,
  Moon,
  Dumbbell,
  Utensils,
  Zap,
  Activity,
  TrendingUp,
} from "lucide-react";
import { motion } from "framer-motion";
import StatCard from "@/components/ui/StatCard";
import AnimatedProgress from "@/components/ui/AnimatedProgress";
import WorkoutCard from "@/components/ui/WorkoutCard";

// Mock data reflecting the Groq AI output structure
const planData = {
  calorieTarget: 2450,
  macros: { protein: 180, carbs: 220, fats: 75 },
  hydrationTarget: "3.5 Liters",
  sleepRecommendation: "7.5 - 8 hours",
  workoutPlan: [
    {
      day: "Day 1",
      focus: "Push (Chest, Shoulders, Triceps)",
      exercises: ["Incline Bench", "Overhead Press", "Dips"],
    },
    {
      day: "Day 2",
      focus: "Pull (Back, Biceps, Rear Delts)",
      exercises: ["Pull-ups", "Barbell Rows", "Face Pulls"],
    },
    {
      day: "Day 3",
      focus: "Legs (Quads, Calves)",
      exercises: ["Squats", "Leg Press", "Calf Raises"],
    },
    {
      day: "Day 4",
      focus: "Active Recovery",
      exercises: ["Light Mobility", "Zone 2 Cardio"],
    },
    {
      day: "Day 5",
      focus: "Upper Body Power",
      exercises: ["Weighted Dips", "Pendlay Rows"],
    },
    {
      day: "Day 6",
      focus: "Lower Body Posterior",
      exercises: ["Deadlifts", "Hamstring Curls"],
    },
    {
      day: "Day 7",
      focus: "Rest",
      exercises: ["Complete Rest", "Stretching"],
    },
  ],
};

// Macro progress helper
const totalMacroGrams =
  planData.macros.protein + planData.macros.carbs + planData.macros.fats;

export default function PlanDashboard() {
  return (
    <div className="relative py-10 md:py-14 space-y-10">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/4 top-0 h-[450px] w-[500px] rounded-full bg-neon-green/[0.03] blur-[120px]" />
        <div className="absolute right-0 top-60 h-[300px] w-[400px] rounded-full bg-electric-blue/[0.03] blur-[100px]" />
      </div>

      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="font-heading text-3xl md:text-4xl font-bold tracking-tight">
            Protocol Active,{" "}
            <span className="text-gradient-hero">Shreyesh</span>.
          </h1>
          <p className="text-gray-400 mt-2 text-sm md:text-base">
            Your AI-generated hyper-personalized protocol.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="glass-panel px-4 py-2.5 flex items-center gap-2.5"
        >
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-neon-green opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-neon-green" />
          </span>
          <span className="text-sm font-medium text-white">Status: Optimal</span>
          <TrendingUp className="h-4 w-4 text-neon-green" />
        </motion.div>
      </div>

      {/* ── Metrics Cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Nutrition — spans 2 cols */}
        <StatCard
          icon={Utensils}
          title="Nutrition Target"
          accentColor="blue"
          delay={0.1}
          className="lg:col-span-2"
        >
          <div className="flex items-end justify-between gap-4 flex-wrap">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                Daily Intake
              </p>
              <p className="text-4xl md:text-5xl font-bold text-white tracking-tight">
                {planData.calorieTarget}
                <span className="text-base font-normal text-gray-500 ml-1">
                  kcal
                </span>
              </p>
            </div>

            <div className="flex gap-5">
              {[
                { label: "PRO", value: planData.macros.protein, color: "#0FF0FC", pct: Math.round((planData.macros.protein / totalMacroGrams) * 100) },
                { label: "CARB", value: planData.macros.carbs, color: "#39FF14", pct: Math.round((planData.macros.carbs / totalMacroGrams) * 100) },
                { label: "FAT", value: planData.macros.fats, color: "#8A2BE2", pct: Math.round((planData.macros.fats / totalMacroGrams) * 100) },
              ].map((macro) => (
                <div key={macro.label} className="text-center min-w-[3rem]">
                  <p
                    className="text-[10px] font-bold tracking-widest mb-1"
                    style={{ color: macro.color }}
                  >
                    {macro.label}
                  </p>
                  <p className="text-lg font-bold text-white">{macro.value}g</p>
                  <div className="mt-2 w-full">
                    <AnimatedProgress
                      value={macro.pct}
                      colorFrom={macro.color}
                      colorTo={macro.color}
                      delay={0.3}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </StatCard>

        {/* Hydration */}
        <StatCard
          icon={Droplets}
          title="Hydration"
          accentColor="blue"
          delay={0.2}
        >
          <p className="text-3xl font-bold text-white mb-3">
            {planData.hydrationTarget}
          </p>
          <AnimatedProgress
            value={40}
            colorFrom="#3B82F6"
            colorTo="#0FF0FC"
            delay={0.4}
          />
          <p className="mt-2 text-xs text-gray-500">40% of daily target</p>
        </StatCard>

        {/* Recovery */}
        <StatCard
          icon={Moon}
          title="Recovery"
          accentColor="purple"
          delay={0.3}
        >
          <p className="text-3xl font-bold text-white mb-1">
            {planData.sleepRecommendation}
          </p>
          <p className="text-sm text-gray-400 flex items-center gap-1.5 mt-2">
            <Zap className="h-3.5 w-3.5 text-yellow-400" />
            Essential for CNS repair
          </p>
        </StatCard>
      </div>

      {/* ── Weekly Training Split ── */}
      <div className="space-y-6 pt-2">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.35 }}
          className="flex items-center gap-3"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-neon-green/10">
            <Dumbbell className="h-5 w-5 text-neon-green" />
          </div>
          <div>
            <h2 className="font-heading text-2xl font-bold text-white">
              Weekly Training Split
            </h2>
            <p className="text-sm text-gray-500">
              7-day periodized performance protocol
            </p>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {planData.workoutPlan.map((day, index) => (
            <WorkoutCard
              key={index}
              day={day.day}
              focus={day.focus}
              exercises={day.exercises}
              index={index}
            />
          ))}
        </div>
      </div>
    </div>
  );
}