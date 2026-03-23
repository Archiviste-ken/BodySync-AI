"use client";

import { motion } from "framer-motion";
import { useMemo, useEffect, useState } from "react";

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
  color: "green" | "blue" | "purple";
}

interface EnergyLine {
  id: number;
  startX: number;
  startY: number;
  length: number;
  angle: number;
  duration: number;
  delay: number;
  color: "green" | "blue" | "purple";
}

interface FloatingOrb {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
  color: "green" | "blue" | "purple";
}

export default function LiveBackground() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Generate random particles - fewer on mobile
  const particles = useMemo<Particle[]>(() => {
    const count = isMobile ? 15 : 35;
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      duration: Math.random() * 15 + 10,
      delay: Math.random() * 5,
      color: (["green", "blue", "purple"] as const)[
        Math.floor(Math.random() * 3)
      ],
    }));
  }, [isMobile]);

  // Generate energy lines - fewer on mobile
  const energyLines = useMemo<EnergyLine[]>(() => {
    const count = isMobile ? 4 : 8;
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      startX: Math.random() * 100,
      startY: Math.random() * 100,
      length: Math.random() * 150 + 50,
      angle: Math.random() * 360,
      duration: Math.random() * 8 + 6,
      delay: Math.random() * 4,
      color: (["green", "blue", "purple"] as const)[
        Math.floor(Math.random() * 3)
      ],
    }));
  }, [isMobile]);

  // Generate floating orbs - fewer on mobile
  const floatingOrbs = useMemo<FloatingOrb[]>(() => {
    const count = isMobile ? 3 : 6;
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 80 + 10,
      y: Math.random() * 80 + 10,
      size: isMobile ? Math.random() * 150 + 80 : Math.random() * 200 + 100,
      duration: Math.random() * 20 + 15,
      delay: Math.random() * 5,
      color: (["green", "blue", "purple"] as const)[
        Math.floor(Math.random() * 3)
      ],
    }));
  }, [isMobile]);

  const colorMap = {
    green: {
      particle: "bg-neon-green",
      glow: "shadow-[0_0_8px_rgba(57,255,20,0.8)]",
      line: "from-transparent via-neon-green/40 to-transparent",
      orb: "bg-neon-green/[0.04]",
    },
    blue: {
      particle: "bg-electric-blue",
      glow: "shadow-[0_0_8px_rgba(15,240,252,0.8)]",
      line: "from-transparent via-electric-blue/40 to-transparent",
      orb: "bg-electric-blue/[0.04]",
    },
    purple: {
      particle: "bg-deep-purple",
      glow: "shadow-[0_0_8px_rgba(138,43,226,0.8)]",
      line: "from-transparent via-deep-purple/40 to-transparent",
      orb: "bg-deep-purple/[0.04]",
    },
  };

  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
      {/* Floating Orbs - Large blurred background elements */}
      {floatingOrbs.map((orb) => (
        <motion.div
          key={`orb-${orb.id}`}
          className={`absolute rounded-full ${colorMap[orb.color].orb} blur-[60px] sm:blur-[80px]`}
          style={{
            left: `${orb.x}%`,
            top: `${orb.y}%`,
            width: orb.size,
            height: orb.size,
          }}
          animate={{
            x: [0, 30, -20, 15, 0],
            y: [0, -25, 20, -10, 0],
            scale: [1, 1.2, 0.9, 1.1, 1],
            opacity: [0.3, 0.5, 0.3, 0.6, 0.3],
          }}
          transition={{
            duration: orb.duration,
            delay: orb.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Energy Lines - Animated streaks */}
      {energyLines.map((line) => (
        <motion.div
          key={`line-${line.id}`}
          className={`absolute h-px bg-gradient-to-r ${colorMap[line.color].line}`}
          style={{
            left: `${line.startX}%`,
            top: `${line.startY}%`,
            width: isMobile ? line.length * 0.7 : line.length,
            transform: `rotate(${line.angle}deg)`,
            transformOrigin: "left center",
          }}
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{
            opacity: [0, 0.6, 0.8, 0.6, 0],
            scaleX: [0, 1, 1, 1, 0],
          }}
          transition={{
            duration: line.duration,
            delay: line.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Floating Particles */}
      {particles.map((particle) => (
        <motion.div
          key={`particle-${particle.id}`}
          className={`absolute rounded-full ${colorMap[particle.color].particle} ${colorMap[particle.color].glow}`}
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: particle.size,
            height: particle.size,
          }}
          animate={{
            y: [0, -30, 0, 25, 0],
            x: [0, 15, -10, 5, 0],
            opacity: [0.2, 0.8, 0.4, 0.9, 0.2],
            scale: [1, 1.3, 0.8, 1.2, 1],
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Pulse Rings - Expanding circles (hidden on mobile for performance) */}
      {!isMobile &&
        [0, 1, 2].map((i) => (
          <motion.div
            key={`ring-${i}`}
            className="absolute rounded-full border border-neon-green/20"
            style={{
              left: `${20 + i * 30}%`,
              top: `${30 + i * 20}%`,
              width: 100,
              height: 100,
            }}
            animate={{
              scale: [1, 3, 1],
              opacity: [0.3, 0, 0.3],
            }}
            transition={{
              duration: 8,
              delay: i * 2.5,
              repeat: Infinity,
              ease: "easeOut",
            }}
          />
        ))}

      {/* DNA Helix-like connecting dots (hidden on mobile) */}
      {!isMobile && (
        <svg className="absolute inset-0 w-full h-full opacity-20">
          <motion.path
            d="M 0 50% Q 25% 30%, 50% 50% T 100% 50%"
            fill="none"
            stroke="url(#gradient-line)"
            strokeWidth="1"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: [0, 1, 0], opacity: [0, 0.5, 0] }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          />
          <defs>
            <linearGradient
              id="gradient-line"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="0%"
            >
              <stop offset="0%" stopColor="rgba(57, 255, 20, 0)" />
              <stop offset="50%" stopColor="rgba(15, 240, 252, 0.5)" />
              <stop offset="100%" stopColor="rgba(138, 43, 226, 0)" />
            </linearGradient>
          </defs>
        </svg>
      )}

      {/* Grid overlay for depth (subtle on mobile) */}
      <div
        className="absolute inset-0 opacity-[0.015] sm:opacity-[0.02]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(57, 255, 20, 0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(57, 255, 20, 0.3) 1px, transparent 1px)
          `,
          backgroundSize: isMobile ? "40px 40px" : "60px 60px",
        }}
      />
    </div>
  );
}
