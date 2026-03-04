"use client";

import Link from "next/link";
import { ArrowRight, UploadCloud, Activity, BrainCircuit, Zap, Shield, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import FeatureCard from "@/components/ui/FeatureCard";

export default function Home() {
  return (
    <div className="relative flex flex-col items-center">
      {/* ── Floating background orbs ── */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-20 -translate-x-1/2 h-[500px] w-[700px] rounded-full bg-neon-green/[0.04] blur-[120px]" />
        <div className="absolute right-0 top-60 h-[300px] w-[400px] rounded-full bg-electric-blue/[0.03] blur-[100px]" />
        <div className="absolute left-10 top-96 h-[250px] w-[350px] rounded-full bg-deep-purple/[0.04] blur-[100px]" />
      </div>

      {/* ── Hero Section ── */}
      <section className="relative flex min-h-[90vh] flex-col items-center justify-center text-center px-4 pt-8 pb-16">
        {/* Status Badge */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-neon-green/20 bg-neon-green/5 px-4 py-1.5 text-xs font-medium text-neon-green">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-neon-green opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-neon-green" />
            </span>
            AI-Powered Fitness Analytics
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="font-heading text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[0.95] max-w-5xl"
        >
          Sync Your Body
          <br />
          <span className="text-gradient-hero">with Intelligence</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-6 max-w-2xl text-base sm:text-lg text-gray-400 leading-relaxed"
        >
          Upload your Body Composition Analysis report. Our OCR extracts every
          metric, and Groq AI generates a hyper-personalized workout &amp;
          nutrition protocol — in seconds.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.35 }}
          className="mt-10 flex flex-col sm:flex-row items-center gap-4"
        >
          <Link href="/upload" className="btn-primary flex items-center gap-2 text-base">
            Get Started
            <ArrowRight className="h-5 w-5" />
          </Link>
          <Link
            href="/plan"
            className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-6 py-4 text-sm font-medium text-gray-300 transition-all hover:bg-white/10 hover:text-white hover:border-white/20"
          >
            View Demo Dashboard
          </Link>
        </motion.div>
      </section>

      {/* ── Glass Upload Card ── */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.45 }}
        className="relative z-10 w-full max-w-4xl -mt-8 mb-20"
      >
        <div className="glass-panel p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Left content */}
          <div className="space-y-5 flex-1">
            <h2 className="font-heading text-2xl md:text-3xl font-bold text-white">
              Ready to decode your metrics?
            </h2>
            <ul className="space-y-3 text-gray-300">
              {[
                {
                  icon: UploadCloud,
                  text: "Drag & drop your BCA report",
                  color: "text-neon-green",
                  bg: "bg-neon-green/10",
                },
                {
                  icon: Activity,
                  text: "Instant metric extraction via OCR",
                  color: "text-electric-blue",
                  bg: "bg-electric-blue/10",
                },
                {
                  icon: BrainCircuit,
                  text: "AI-generated personalized protocol",
                  color: "text-deep-purple",
                  bg: "bg-deep-purple/10",
                },
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3">
                  <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${item.bg}`}>
                    <item.icon className={`h-4 w-4 ${item.color}`} />
                  </div>
                  <span className="text-sm">{item.text}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* CTA */}
          <Link
            href="/upload"
            className="btn-primary flex items-center gap-2 text-base whitespace-nowrap"
          >
            Upload Report
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </motion.section>

      {/* ── Features Grid ── */}
      <section className="w-full max-w-5xl pb-24">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-white mb-3">
            Built for <span className="text-gradient">Performance</span>
          </h2>
          <p className="text-gray-400 max-w-lg mx-auto">
            Everything you need to optimize your fitness journey, powered by cutting-edge AI.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <FeatureCard
            icon={Zap}
            title="Instant Analysis"
            description="Upload your BCA report and get results in under 10 seconds with real-time OCR processing."
            accentColor="green"
            delay={0.65}
          />
          <FeatureCard
            icon={TrendingUp}
            title="Smart Protocols"
            description="AI-generated workout splits and nutrition plans tailored to your exact body composition."
            accentColor="blue"
            delay={0.75}
          />
          <FeatureCard
            icon={Shield}
            title="AI Coach"
            description="Real-time coaching adjustments and answers to your fitness questions, 24/7."
            accentColor="purple"
            delay={0.85}
          />
        </div>
      </section>
    </div>
  );
}