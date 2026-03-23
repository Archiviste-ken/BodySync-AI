"use client";

import Link from "next/link";
import {
  ArrowRight,
  UploadCloud,
  Activity,
  BrainCircuit,
  Zap,
  Shield,
  TrendingUp,
  Sparkles,
} from "lucide-react";
import { motion } from "framer-motion";
import FeatureCard from "@/components/ui/FeatureCard";

export default function Home() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="relative flex flex-col items-center"
    >
      {/* Enhanced floating background orbs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* Primary large orb */}
        <motion.div
          animate={{
            x: [0, 30, -20, 10, 0],
            y: [0, -20, 15, -10, 0],
            scale: [1, 1.1, 0.95, 1.05, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute left-1/2 top-16 h-[600px] w-[800px] -translate-x-1/2 rounded-full bg-neon-green/[0.06] blur-[150px]"
        />

        {/* Secondary electric blue orb */}
        <motion.div
          animate={{
            x: [0, -25, 15, -10, 0],
            y: [0, 18, -12, 8, 0],
            scale: [1, 0.9, 1.1, 0.95, 1],
          }}
          transition={{
            duration: 22,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
          className="absolute right-0 top-40 h-[400px] w-[500px] rounded-full bg-electric-blue/[0.05] blur-[130px]"
        />

        {/* Tertiary purple orb */}
        <motion.div
          animate={{
            x: [0, 20, -15, 8, 0],
            y: [0, -15, 20, -8, 0],
            scale: [1, 1.15, 0.9, 1.05, 1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 4,
          }}
          className="absolute left-10 top-[500px] h-[350px] w-[450px] rounded-full bg-deep-purple/[0.06] blur-[120px]"
        />

        {/* Small accent orbs */}
        <motion.div
          animate={{
            y: [0, -30, 0],
            opacity: [0.4, 0.7, 0.4],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute left-1/4 top-1/3 h-32 w-32 rounded-full bg-neon-green/10 blur-3xl"
        />
        <motion.div
          animate={{
            y: [0, 25, 0],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 3,
          }}
          className="absolute right-1/4 top-1/2 h-28 w-28 rounded-full bg-electric-blue/10 blur-3xl"
        />
      </div>

      {/* Hero Section */}
      <section className="relative flex min-h-[85vh] sm:min-h-[90vh] flex-col items-center justify-center px-2 sm:px-4 pb-12 sm:pb-16 pt-6 sm:pt-8 text-center">
        {/* Status Badge with enhanced animation */}
        <motion.div
          initial={{ opacity: 0, y: 15, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mb-6 sm:mb-10"
        >
          <motion.span
            whileHover={{ scale: 1.03 }}
            className="inline-flex items-center gap-2 sm:gap-2.5 rounded-full border border-neon-green/25 bg-neon-green/10 px-3 sm:px-5 py-1.5 sm:py-2 text-[10px] sm:text-xs font-semibold text-neon-green shadow-[0_0_30px_rgba(57,255,20,0.1),inset_0_1px_0_rgba(255,255,255,0.1)]"
          >
            <span className="relative flex h-2 w-2 sm:h-2.5 sm:w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-neon-green opacity-75" />
              <span className="relative inline-flex h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-full bg-neon-green shadow-[0_0_8px_rgba(57,255,20,0.8)]" />
            </span>
            <Sparkles className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
            AI-Powered Fitness Analytics
          </motion.span>
        </motion.div>

        {/* Headline with enhanced animation */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-5xl font-heading text-[2.5rem] sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold leading-[0.95] sm:leading-[0.92] tracking-tight"
        >
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            Sync Your Body
          </motion.span>
          <br />
          <motion.span
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="text-gradient-hero"
          >
            with Intelligence
          </motion.span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="mt-5 sm:mt-7 max-w-2xl text-sm sm:text-base md:text-lg lg:text-xl leading-relaxed text-gray-300 px-2"
        >
          Upload your Body Composition Analysis report. Our OCR extracts every
          metric, and Groq AI generates a hyper-personalized workout &amp;
          nutrition protocol — in seconds.
        </motion.p>

        {/* CTA Buttons with enhanced styling */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="mt-8 sm:mt-12 flex flex-col items-center gap-3 sm:gap-5 sm:flex-row w-full sm:w-auto px-4 sm:px-0"
        >
          <motion.div
            whileHover={{ scale: 1.04, y: -2 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
            className="w-full sm:w-auto"
          >
            <Link
              href="/upload"
              className="btn-primary flex items-center justify-center gap-2.5 text-sm sm:text-base w-full sm:w-auto"
            >
              Get Started
              <motion.span
                animate={{ x: [0, 4, 0] }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
              </motion.span>
            </Link>
          </motion.div>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full sm:w-auto">
            <Link
              href="/plan"
              className="glass-panel-hover flex items-center justify-center gap-2 rounded-full border border-white/12 px-5 sm:px-7 py-3 sm:py-4 text-xs sm:text-sm font-medium text-gray-300 hover:border-white/25 hover:bg-white/10 hover:text-white transition-all duration-300 w-full sm:w-auto"
            >
              View Demo Dashboard
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* Glass Upload Card with enhanced effects */}
      <motion.section
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-4xl -mt-4 sm:-mt-6 mb-16 sm:mb-24 px-2 sm:px-0"
      >
        <motion.div
          whileHover={{ y: -6, scale: 1.01 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="glass-panel-hover relative overflow-hidden p-5 sm:p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-6 sm:gap-8"
        >
          {/* Background gradients */}
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(15,240,252,0.12),transparent_50%)]" />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(57,255,20,0.08),transparent_50%)]" />

          {/* Animated border shimmer */}
          <motion.div
            animate={{
              backgroundPosition: ["0% 50%", "200% 50%"],
            }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 rounded-[inherit] opacity-50 pointer-events-none"
            style={{
              background:
                "linear-gradient(90deg, transparent 40%, rgba(57,255,20,0.15) 50%, transparent 60%)",
              backgroundSize: "200% 100%",
            }}
          />

          {/* Left content */}
          <div className="relative z-10 space-y-4 sm:space-y-6 flex-1 text-center md:text-left">
            <h2 className="font-heading text-xl sm:text-2xl md:text-3xl font-bold text-white">
              Ready to decode your metrics?
            </h2>
            <ul className="space-y-3 sm:space-y-4 text-gray-300">
              {[
                {
                  icon: UploadCloud,
                  text: "Drag & drop your BCA report",
                  color: "text-neon-green",
                  bg: "bg-neon-green/12 border-neon-green/20",
                },
                {
                  icon: Activity,
                  text: "Instant metric extraction via OCR",
                  color: "text-electric-blue",
                  bg: "bg-electric-blue/12 border-electric-blue/20",
                },
                {
                  icon: BrainCircuit,
                  text: "AI-generated personalized protocol",
                  color: "text-deep-purple",
                  bg: "bg-deep-purple/12 border-deep-purple/20",
                },
              ].map((item, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: -15 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + i * 0.1, duration: 0.5 }}
                  className="flex items-center gap-3 sm:gap-3.5 group justify-center md:justify-start"
                >
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                    className={`flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-lg sm:rounded-xl border ${item.bg}`}
                  >
                    <item.icon className={`h-4 w-4 sm:h-5 sm:w-5 ${item.color}`} />
                  </motion.div>
                  <span className="text-xs sm:text-sm font-medium group-hover:text-white transition-colors">
                    {item.text}
                  </span>
                </motion.li>
              ))}
            </ul>
          </div>

          {/* CTA */}
          <motion.div
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
            className="w-full md:w-auto"
          >
            <Link
              href="/upload"
              className="btn-primary relative z-10 flex items-center justify-center gap-2.5 whitespace-nowrap text-sm sm:text-base w-full md:w-auto"
            >
              Upload Report
              <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
            </Link>
          </motion.div>
        </motion.div>
      </motion.section>

      {/* Features Grid with enhanced styling */}
      <section className="w-full max-w-5xl pb-20 sm:pb-28 px-2 sm:px-0">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.65 }}
          className="text-center mb-10 sm:mb-14"
        >
          <h2 className="mb-3 sm:mb-4 font-heading text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white">
            Built for <span className="text-gradient">Performance</span>
          </h2>
          <p className="mx-auto max-w-lg text-gray-400 text-sm sm:text-base md:text-lg px-2">
            Everything you need to optimize your fitness journey, powered by
            cutting-edge AI.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          <FeatureCard
            icon={Zap}
            title="Instant Analysis"
            description="Upload your BCA report and get results in under 10 seconds with real-time OCR processing."
            accentColor="green"
            delay={0.7}
          />
          <FeatureCard
            icon={TrendingUp}
            title="Smart Protocols"
            description="AI-generated workout splits and nutrition plans tailored to your exact body composition."
            accentColor="blue"
            delay={0.8}
          />
          <FeatureCard
            icon={Shield}
            title="AI Coach"
            description="Real-time coaching adjustments and answers to your fitness questions, 24/7."
            accentColor="purple"
            delay={0.9}
          />
        </div>
      </section>
    </motion.div>
  );
}
