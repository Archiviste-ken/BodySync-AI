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
import FeatureCard from "@/components/ui/FeatureCard";

export default function Home() {
  return (
    <div className="relative flex flex-col items-center animate-fade-in">

      {/* Enhanced floating background orbs - CSS animated */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* Primary large orb */}
        <div className="absolute left-1/2 top-16 h-[600px] w-[800px] -translate-x-1/2 rounded-full bg-neon-green/[0.06] blur-[150px] animate-float-orb-1" />

        {/* Secondary electric blue orb */}
        <div className="absolute right-0 top-40 h-[400px] w-[500px] rounded-full bg-electric-blue/[0.05] blur-[130px] animate-float-orb-2" />

        {/* Tertiary purple orb */}
        <div className="absolute left-10 top-[500px] h-[350px] w-[450px] rounded-full bg-deep-purple/[0.06] blur-[120px] animate-float-orb-3" />

        {/* Small accent orbs */}
        <div className="absolute left-1/4 top-1/3 h-32 w-32 rounded-full bg-neon-green/10 blur-3xl animate-pulse-orb" />
        <div className="absolute right-1/4 top-1/2 h-28 w-28 rounded-full bg-electric-blue/10 blur-3xl animate-pulse-orb-delayed" />
      </div>

      {/* Hero Section */}
      <section className="relative flex min-h-[85vh] sm:min-h-[90vh] flex-col items-center justify-center px-2 sm:px-4 pb-12 sm:pb-16 pt-6 sm:pt-8 text-center">
        {/* Status Badge with enhanced animation */}
        <div className="mb-6 sm:mb-10 animate-slide-down">
          <span className="inline-flex items-center gap-2 sm:gap-2.5 rounded-full border border-neon-green/25 bg-neon-green/10 px-3 sm:px-5 py-1.5 sm:py-2 text-[10px] sm:text-xs font-semibold text-neon-green shadow-[0_0_30px_rgba(57,255,20,0.1),inset_0_1px_0_rgba(255,255,255,0.1)] transition-transform duration-300 hover:scale-103">
            <span className="relative flex h-2 w-2 sm:h-2.5 sm:w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-neon-green opacity-75" />
              <span className="relative inline-flex h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-full bg-neon-green shadow-[0_0_8px_rgba(57,255,20,0.8)]" />
            </span>
            <Sparkles className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
            AI-Powered Fitness Analytics
          </span>
        </div>

        {/* Headline with enhanced animation */}
        <h1 className="max-w-5xl font-heading text-[2.5rem] sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold leading-[0.95] sm:leading-[0.92] tracking-tight animate-slide-up-delay-1">
          <span className="animate-fade-in-delay-2">Sync Your Body</span>
          <br />
          <span className="text-gradient-hero animate-slide-left-delay-4">
            with Intelligence
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mt-5 sm:mt-7 max-w-2xl text-sm sm:text-base md:text-lg lg:text-xl leading-relaxed text-gray-300 px-2 animate-slide-up-delay-2">
          Upload your Body Composition Analysis report. Our OCR extracts every
          metric, and Groq AI generates a hyper-personalized workout &amp;
          nutrition protocol — in seconds.
        </p>

        {/* CTA Buttons with enhanced styling */}
        <div className="mt-8 sm:mt-12 flex flex-col items-center gap-3 sm:gap-5 sm:flex-row w-full sm:w-auto px-4 sm:px-0 animate-slide-up-delay-4">
          <div className="w-full sm:w-auto transform transition-all duration-300 hover:scale-104 hover:-translate-y-0.5 active:scale-97">
            <Link
              href="/upload"
              className="btn-primary flex items-center justify-center gap-2.5 text-sm sm:text-base w-full sm:w-auto"
            >
              Get Started
              <span className="inline-block animate-arrow-bounce">
                <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
              </span>
            </Link>
          </div>
          <div className="w-full sm:w-auto transform transition-all duration-300 hover:scale-102 active:scale-98">
            <Link
              href="/plan"
              className="glass-panel-hover flex items-center justify-center gap-2 rounded-full border border-white/12 px-5 sm:px-7 py-3 sm:py-4 text-xs sm:text-sm font-medium text-gray-300 hover:border-white/25 hover:bg-white/10 hover:text-white transition-all duration-300 w-full sm:w-auto"
            >
              View Demo Dashboard
            </Link>
          </div>
        </div>
      </section>

      {/* Glass Upload Card with enhanced effects */}
      <section className="relative z-10 w-full max-w-4xl -mt-4 sm:-mt-6 mb-16 sm:mb-24 px-2 sm:px-0 animate-slide-up-delay-5">
        <div className="glass-panel-hover relative overflow-hidden p-5 sm:p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-6 sm:gap-8 transition-all duration-400 hover:-translate-y-1.5 hover:scale-101">
          {/* Background gradients */}
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(15,240,252,0.12),transparent_50%)]" />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(57,255,20,0.08),transparent_50%)]" />

          {/* Animated border shimmer */}
          <div className="absolute inset-0 rounded-[inherit] opacity-50 pointer-events-none animate-border-shimmer" />

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
                  delay: "animate-slide-in-delay-6",
                },
                {
                  icon: Activity,
                  text: "Instant metric extraction via OCR",
                  color: "text-electric-blue",
                  bg: "bg-electric-blue/12 border-electric-blue/20",
                  delay: "animate-slide-in-delay-7",
                },
                {
                  icon: BrainCircuit,
                  text: "AI-generated personalized protocol",
                  color: "text-deep-purple",
                  bg: "bg-deep-purple/12 border-deep-purple/20",
                  delay: "animate-slide-in-delay-8",
                },
              ].map((item, i) => (
                <li
                  key={i}
                  className={`flex items-center gap-3 sm:gap-3.5 group justify-center md:justify-start ${item.delay}`}
                >
                  <div className={`flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-lg sm:rounded-xl border ${item.bg} transition-all duration-300 group-hover:scale-110 group-hover:rotate-5`}>
                    <item.icon className={`h-4 w-4 sm:h-5 sm:w-5 ${item.color}`} />
                  </div>
                  <span className="text-xs sm:text-sm font-medium group-hover:text-white transition-colors">
                    {item.text}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* CTA */}
          <div className="w-full md:w-auto transform transition-all duration-300 hover:scale-104 active:scale-97">
            <Link
              href="/upload"
              className="btn-primary relative z-10 flex items-center justify-center gap-2.5 whitespace-nowrap text-sm sm:text-base w-full md:w-auto"
            >
              Upload Report
              <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid with enhanced styling */}
      <section className="w-full max-w-5xl pb-20 sm:pb-28 px-2 sm:px-0">
        <div className="text-center mb-10 sm:mb-14 animate-slide-up-delay-6">
          <h2 className="mb-3 sm:mb-4 font-heading text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white">
            Built for <span className="text-gradient">Performance</span>
          </h2>
          <p className="mx-auto max-w-lg text-gray-400 text-sm sm:text-base md:text-lg px-2">
            Everything you need to optimize your fitness journey, powered by
            cutting-edge AI.
          </p>
        </div>

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
    </div>
  );
}
