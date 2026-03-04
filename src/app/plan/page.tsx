"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Flame,
  Droplets,
  Moon,
  Dumbbell,
  Utensils,
  Zap,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  Info,
  ChevronDown,
  ChevronUp,
  Brain,
  Heart,
  Scale,
  Target,
  Loader2,
  ArrowLeft,
  Apple,
  Clock,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import StatCard from "@/components/ui/StatCard";
import AnimatedProgress from "@/components/ui/AnimatedProgress";
import WorkoutCard from "@/components/ui/WorkoutCard";
import type { GeneratedPlan, InsightCard as InsightCardType, ParsedBCAData } from "@/lib/types";

// ─── Insight Card Component ────────────────────────────
function InsightCardUI({ card, index }: { card: InsightCardType; index: number }) {
  const config = {
    positive: {
      icon: CheckCircle2,
      border: "border-neon-green/15",
      bg: "bg-neon-green/5",
      iconColor: "text-neon-green",
      glow: "shadow-[0_0_20px_rgba(57,255,20,0.04)]",
    },
    warning: {
      icon: AlertTriangle,
      border: "border-yellow-500/15",
      bg: "bg-yellow-500/5",
      iconColor: "text-yellow-400",
      glow: "shadow-[0_0_20px_rgba(234,179,8,0.04)]",
    },
    info: {
      icon: Info,
      border: "border-electric-blue/15",
      bg: "bg-electric-blue/5",
      iconColor: "text-electric-blue",
      glow: "shadow-[0_0_20px_rgba(15,240,252,0.04)]",
    },
  };

  const c = config[card.type];
  const Icon = c.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.06 }}
      className={`glass-panel p-4 ${c.border} ${c.glow}`}
    >
      <div className="flex items-start gap-3">
        <div className={`shrink-0 mt-0.5 flex h-8 w-8 items-center justify-center rounded-xl ${c.bg}`}>
          <Icon className={`h-4 w-4 ${c.iconColor}`} />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-white">{card.title}</p>
          <p className="text-xs text-gray-400 mt-1 leading-relaxed">{card.description}</p>
          {card.metric && (
            <span className={`inline-block mt-2 text-xs font-mono font-bold ${c.iconColor}`}>
              {card.metric}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ─── Expandable Analysis Section ───────────────────────
function AnalysisSection({
  title,
  content,
  icon: Icon,
  color,
  delay,
}: {
  title: string;
  content: string;
  icon: React.ElementType;
  color: string;
  delay: number;
}) {
  const [open, setOpen] = useState(false);

  if (!content || content === "Insufficient data for analysis.") return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      className="glass-panel overflow-hidden"
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-white/[0.02] transition-colors"
      >
        <div className="flex items-center gap-3">
          <Icon className={`h-4 w-4 ${color}`} />
          <span className="text-sm font-semibold text-white">{title}</span>
        </div>
        {open ? (
          <ChevronUp className="h-4 w-4 text-gray-500" />
        ) : (
          <ChevronDown className="h-4 w-4 text-gray-500" />
        )}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <div className="px-4 pb-4 pt-0">
              <p className="text-sm text-gray-400 leading-relaxed">{content}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Main Dashboard ────────────────────────────────────
export default function PlanDashboard() {
  const router = useRouter();
  const [plan, setPlan] = useState<GeneratedPlan | null>(null);
  const [metrics, setMetrics] = useState<ParsedBCAData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      // 1. Try sessionStorage first (just generated)
      const storedPlan = sessionStorage.getItem("bodysync_plan");
      const storedMetrics = sessionStorage.getItem("bodysync_metrics");

      if (storedPlan) {
        try { setPlan(JSON.parse(storedPlan)); } catch { /* ignore */ }
      }
      if (storedMetrics) {
        try { setMetrics(JSON.parse(storedMetrics)); } catch { /* ignore */ }
      }

      // 2. If no sessionStorage data, try MongoDB via reportId
      if (!storedPlan) {
        const reportId = sessionStorage.getItem("bodysync_reportId") ||
          new URLSearchParams(window.location.search).get("id");

        if (reportId) {
          try {
            const res = await fetch(`/api/report/${reportId}`);
            if (res.ok) {
              const data = await res.json();
              if (data.plan) {
                setPlan(data.plan);
                sessionStorage.setItem("bodysync_plan", JSON.stringify(data.plan));
              }
              if (data.correctedMetrics || data.metrics) {
                const m = data.correctedMetrics || data.metrics;
                setMetrics(m);
                sessionStorage.setItem("bodysync_metrics", JSON.stringify(m));
              }
            }
          } catch {
            /* MongoDB fetch failed, fall through to no-plan state */
          }
        }
      }

      setLoading(false);
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <Loader2 className="h-8 w-8 animate-spin text-electric-blue" />
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] gap-6 px-4">
        <div className="glass-panel p-8 text-center max-w-md">
          <Scale className="h-10 w-10 text-electric-blue mx-auto mb-4" />
          <h2 className="font-heading text-2xl font-bold text-white mb-2">No Protocol Found</h2>
          <p className="text-gray-400 text-sm mb-6">
            Upload your BCA report first to generate a personalized protocol.
          </p>
          <button
            onClick={() => router.push("/upload")}
            className="flex items-center justify-center gap-2 mx-auto rounded-xl py-3 px-6 font-bold bg-gradient-to-r from-neon-green to-electric-blue text-black hover:shadow-[0_0_30px_rgba(57,255,20,0.2)] transition-all"
          >
            <ArrowLeft className="h-4 w-4" />
            Go to Upload
          </button>
        </div>
      </div>
    );
  }

  const ba = plan.bodyAnalysis;
  const nt = plan.nutritionTargets;

  const totalMacroGrams =
    plan.macros.protein + plan.macros.carbs + plan.macros.fats;

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
            Your <span className="text-gradient-hero">Protocol</span> is Ready.
          </h1>
          <p className="text-gray-400 mt-2 text-sm md:text-base">
            AI-generated hyper-personalized fitness & nutrition protocol.
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
          <span className="text-sm font-medium text-white">Protocol Active</span>
          <TrendingUp className="h-4 w-4 text-neon-green" />
        </motion.div>
      </div>

      {/* ── Body Metrics Summary (from uploaded data) ── */}
      {metrics && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3"
        >
          {[
            { label: "Weight", value: metrics.weight, unit: "kg" },
            { label: "SMM", value: metrics.skeletalMuscleMass, unit: "kg" },
            { label: "Body Fat", value: metrics.bodyFatPercent, unit: "%" },
            { label: "BMI", value: metrics.bmi, unit: "" },
            { label: "BMR", value: metrics.bmr, unit: "kcal" },
            { label: "Visceral Fat", value: metrics.visceralFat, unit: "" },
          ].map((m, i) => (
            <motion.div
              key={m.label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.08 + i * 0.04 }}
              className="glass-panel p-3 text-center"
            >
              <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-1">{m.label}</p>
              <p className="text-xl font-bold text-white">
                {m.value !== null && m.value !== undefined ? m.value : "—"}
                {m.unit && m.value !== null && (
                  <span className="text-xs font-normal text-gray-500 ml-0.5">{m.unit}</span>
                )}
              </p>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* ── Insight Cards ── */}
      {ba && (ba.positiveIndicators.length > 0 || ba.areasToImprove.length > 0) && (
        <div className="space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
            className="flex items-center gap-3"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-electric-blue/10">
              <Brain className="h-5 w-5 text-electric-blue" />
            </div>
            <div>
              <h2 className="font-heading text-2xl font-bold text-white">AI Insights</h2>
              <p className="text-sm text-gray-500">Key findings from your body analysis</p>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {ba.positiveIndicators.map((card, i) => (
              <InsightCardUI key={`pos-${i}`} card={card} index={i} />
            ))}
            {ba.areasToImprove.map((card, i) => (
              <InsightCardUI key={`imp-${i}`} card={card} index={ba.positiveIndicators.length + i} />
            ))}
          </div>
        </div>
      )}

      {/* ── Nutrition & Recovery Cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Nutrition Target — spans 2 cols */}
        <StatCard
          icon={Utensils}
          title="Nutrition Target"
          accentColor="blue"
          delay={0.1}
          className="lg:col-span-2"
        >
          <div className="flex items-end justify-between gap-4 flex-wrap">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Daily Intake</p>
              <p className="text-4xl md:text-5xl font-bold text-white tracking-tight">
                {plan.calorieTarget}
                <span className="text-base font-normal text-gray-500 ml-1">kcal</span>
              </p>
            </div>

            <div className="flex gap-5">
              {[
                { label: "PRO", value: plan.macros.protein, color: "#0FF0FC", pct: Math.round((plan.macros.protein / totalMacroGrams) * 100) },
                { label: "CARB", value: plan.macros.carbs, color: "#39FF14", pct: Math.round((plan.macros.carbs / totalMacroGrams) * 100) },
                { label: "FAT", value: plan.macros.fats, color: "#8A2BE2", pct: Math.round((plan.macros.fats / totalMacroGrams) * 100) },
              ].map((macro) => (
                <div key={macro.label} className="text-center min-w-[3rem]">
                  <p className="text-[10px] font-bold tracking-widest mb-1" style={{ color: macro.color }}>
                    {macro.label}
                  </p>
                  <p className="text-lg font-bold text-white">{macro.value}g</p>
                  <div className="mt-2 w-full">
                    <AnimatedProgress value={macro.pct} colorFrom={macro.color} colorTo={macro.color} delay={0.3} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </StatCard>

        {/* Hydration */}
        <StatCard icon={Droplets} title="Hydration" accentColor="blue" delay={0.2}>
          <p className="text-3xl font-bold text-white mb-3">{plan.hydrationTarget}</p>
          <AnimatedProgress value={40} colorFrom="#3B82F6" colorTo="#0FF0FC" delay={0.4} />
          <p className="mt-2 text-xs text-gray-500">Daily target</p>
        </StatCard>

        {/* Recovery */}
        <StatCard icon={Moon} title="Recovery" accentColor="purple" delay={0.3}>
          <p className="text-3xl font-bold text-white mb-1">{plan.sleepRecommendation}</p>
          <p className="text-sm text-gray-400 flex items-center gap-1.5 mt-2">
            <Zap className="h-3.5 w-3.5 text-yellow-400" />
            Essential for CNS repair
          </p>
        </StatCard>
      </div>

      {/* ── Calorie Targets Bar ── */}
      {nt && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.25 }}
        >
          <StatCard icon={Target} title="Calorie Zones" accentColor="green" delay={0.25}>
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: "Fat Loss", value: nt.fatLossCalories, color: "#EF4444" },
                { label: "Maintenance", value: nt.maintenanceCalories, color: "#0FF0FC" },
                { label: "Muscle Gain", value: nt.muscleGainCalories, color: "#39FF14" },
              ].map((zone) => (
                <div key={zone.label} className="text-center">
                  <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-1">{zone.label}</p>
                  <p className="text-2xl font-bold" style={{ color: zone.color }}>
                    {zone.value}
                  </p>
                  <p className="text-[10px] text-gray-500">kcal</p>
                </div>
              ))}
            </div>
          </StatCard>
        </motion.div>
      )}

      {/* ── Meal Plan ── */}
      {plan.mealPlan && plan.mealPlan.meals && plan.mealPlan.meals.length > 0 && (
        <div className="space-y-6 pt-2">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="flex items-center gap-3"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-deep-purple/20">
              <Apple className="h-5 w-5 text-deep-purple" />
            </div>
            <div>
              <h2 className="font-heading text-2xl font-bold text-white">Meal Plan</h2>
              <p className="text-sm text-gray-500">Optimized daily nutrition timing</p>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {plan.mealPlan.meals.map((meal, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.35 + i * 0.05 }}
                className="glass-panel-hover p-5 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-heading font-bold text-white">{meal.name}</h3>
                  <div className="flex items-center gap-1 text-gray-500 text-xs">
                    <Clock className="h-3 w-3" />
                    {meal.time}
                  </div>
                </div>
                <p className="text-sm text-gray-400 leading-relaxed">{meal.description}</p>
                <div className="flex items-center gap-3 pt-1">
                  <span className="text-xs text-electric-blue font-bold">{meal.calories} kcal</span>
                  <span className="text-[10px] text-gray-600">|</span>
                  <span className="text-[10px] text-gray-500">P {meal.protein}g</span>
                  <span className="text-[10px] text-gray-500">C {meal.carbs}g</span>
                  <span className="text-[10px] text-gray-500">F {meal.fats}g</span>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Foods to prioritize / reduce */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {plan.mealPlan.foodsToPrioritize && plan.mealPlan.foodsToPrioritize.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.5 }}
                className="glass-panel p-4"
              >
                <p className="text-xs font-bold text-neon-green uppercase tracking-widest mb-3">
                  Prioritize
                </p>
                <div className="flex flex-wrap gap-2">
                  {plan.mealPlan.foodsToPrioritize.map((f, i) => (
                    <span key={i} className="text-xs bg-neon-green/10 text-neon-green rounded-lg px-3 py-1.5 border border-neon-green/10">
                      {f}
                    </span>
                  ))}
                </div>
              </motion.div>
            )}
            {plan.mealPlan.foodsToReduce && plan.mealPlan.foodsToReduce.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.55 }}
                className="glass-panel p-4"
              >
                <p className="text-xs font-bold text-yellow-400 uppercase tracking-widest mb-3">
                  Reduce
                </p>
                <div className="flex flex-wrap gap-2">
                  {plan.mealPlan.foodsToReduce.map((f, i) => (
                    <span key={i} className="text-xs bg-yellow-500/10 text-yellow-400 rounded-lg px-3 py-1.5 border border-yellow-500/10">
                      {f}
                    </span>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      )}

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
            <h2 className="font-heading text-2xl font-bold text-white">Weekly Training Split</h2>
            <p className="text-sm text-gray-500">7-day periodized performance protocol</p>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {plan.workoutPlan.map((day, index) => (
            <WorkoutCard key={index} day={day.day} focus={day.focus} exercises={day.exercises} index={index} />
          ))}
        </div>
      </div>

      {/* ── Body Analysis Deep Dive ── */}
      {ba && (
        <div className="space-y-4 pt-2">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
            className="flex items-center gap-3"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-deep-purple/20">
              <Heart className="h-5 w-5 text-deep-purple" />
            </div>
            <div>
              <h2 className="font-heading text-2xl font-bold text-white">Body Analysis</h2>
              <p className="text-sm text-gray-500">Detailed breakdown of your composition</p>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <AnalysisSection title="Overall Status" content={ba.overallStatus} icon={TrendingUp} color="text-neon-green" delay={0.42} />
            <AnalysisSection title="Muscle Analysis" content={ba.muscleAnalysis} icon={Dumbbell} color="text-electric-blue" delay={0.44} />
            <AnalysisSection title="Fat Analysis" content={ba.fatAnalysis} icon={Scale} color="text-deep-purple" delay={0.46} />
            <AnalysisSection title="BMI Interpretation" content={ba.bmiInterpretation} icon={Heart} color="text-electric-blue" delay={0.48} />
            <AnalysisSection title="Visceral Fat Health" content={ba.visceralFatHealth} icon={AlertTriangle} color="text-yellow-400" delay={0.50} />
            <AnalysisSection title="Metabolism" content={ba.metabolismAnalysis} icon={Flame} color="text-neon-green" delay={0.52} />
            <AnalysisSection title="Training Strategy" content={ba.trainingRecommendations} icon={Target} color="text-electric-blue" delay={0.54} />
            <AnalysisSection title="Nutrition Strategy" content={ba.nutritionRecommendations} icon={Utensils} color="text-deep-purple" delay={0.56} />
          </div>
        </div>
      )}
    </div>
  );
}