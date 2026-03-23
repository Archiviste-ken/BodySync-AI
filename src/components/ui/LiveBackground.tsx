"use client";

import { motion } from "framer-motion";
import { useMemo } from "react";

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

// Seeded random for consistent values across renders
function seededRandom(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

export default function LiveBackground() {
  // Generate particles with seeded random - consistent across renders
  const particles = useMemo<Particle[]>(() => {
    return Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: seededRandom(i * 1) * 100,
      y: seededRandom(i * 2) * 100,
      size: seededRandom(i * 3) * 2 + 1,
      duration: seededRandom(i * 4) * 15 + 12,
      delay: seededRandom(i * 5) * 5,
      color: (["green", "blue", "purple"] as const)[Math.floor(seededRandom(i * 6) * 3)],
    }));
  }, []);

  // Generate energy lines with seeded random
  const energyLines = useMemo<EnergyLine[]>(() => {
    return Array.from({ length: 5 }, (_, i) => ({
      id: i,
      startX: seededRandom(i * 10 + 100) * 100,
      startY: seededRandom(i * 11 + 100) * 100,
      length: seededRandom(i * 12 + 100) * 100 + 50,
      angle: seededRandom(i * 13 + 100) * 360,
      duration: seededRandom(i * 14 + 100) * 8 + 8,
      delay: seededRandom(i * 15 + 100) * 4,
      color: (["green", "blue", "purple"] as const)[Math.floor(seededRandom(i * 16 + 100) * 3)],
    }));
  }, []);

  // Generate floating orbs with seeded random
  const floatingOrbs = useMemo<FloatingOrb[]>(() => {
    return Array.from({ length: 4 }, (_, i) => ({
      id: i,
      x: seededRandom(i * 20 + 200) * 80 + 10,
      y: seededRandom(i * 21 + 200) * 80 + 10,
      size: seededRandom(i * 22 + 200) * 150 + 100,
      duration: seededRandom(i * 23 + 200) * 20 + 18,
      delay: seededRandom(i * 24 + 200) * 5,
      color: (["green", "blue", "purple"] as const)[Math.floor(seededRandom(i * 25 + 200) * 3)],
    }));
  }, []);

  const colorMap = {
    green: {
      particle: "bg-neon-green",
      glow: "shadow-[0_0_6px_rgba(57,255,20,0.6)]",
      line: "from-transparent via-neon-green/30 to-transparent",
      orb: "bg-neon-green/[0.03]",
    },
    blue: {
      particle: "bg-electric-blue",
      glow: "shadow-[0_0_6px_rgba(15,240,252,0.6)]",
      line: "from-transparent via-electric-blue/30 to-transparent",
      orb: "bg-electric-blue/[0.03]",
    },
    purple: {
      particle: "bg-deep-purple",
      glow: "shadow-[0_0_6px_rgba(138,43,226,0.6)]",
      line: "from-transparent via-deep-purple/30 to-transparent",
      orb: "bg-deep-purple/[0.03]",
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
            x: [0, 20, -15, 10, 0],
            y: [0, -20, 15, -8, 0],
            scale: [1, 1.15, 0.95, 1.08, 1],
            opacity: [0.4, 0.6, 0.4, 0.5, 0.4],
          }}
          transition={{
            duration: orb.duration,
            delay: orb.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Energy Lines - Animated streaks (hidden on very small screens) */}
      <div className="hidden sm:block">
        {energyLines.map((line) => (
          <motion.div
            key={`line-${line.id}`}
            className={`absolute h-px bg-gradient-to-r ${colorMap[line.color].line}`}
            style={{
              left: `${line.startX}%`,
              top: `${line.startY}%`,
              width: line.length,
              transform: `rotate(${line.angle}deg)`,
              transformOrigin: "left center",
            }}
            animate={{
              opacity: [0, 0.5, 0.7, 0.5, 0],
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
      </div>

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
            y: [0, -25, 0, 20, 0],
            x: [0, 12, -8, 5, 0],
            opacity: [0.3, 0.7, 0.4, 0.8, 0.3],
            scale: [1, 1.2, 0.9, 1.15, 1],
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Grid overlay for depth */}
      <div
        className="absolute inset-0 opacity-[0.012] sm:opacity-[0.018]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(57, 255, 20, 0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(57, 255, 20, 0.3) 1px, transparent 1px)
          `,
          backgroundSize: "50px 50px",
        }}
      />
    </div>
  );
}
