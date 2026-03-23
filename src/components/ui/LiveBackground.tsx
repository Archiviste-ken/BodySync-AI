"use client";

import { useEffect, useState } from "react";

export default function LiveBackground() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
      {/* Floating orbs using CSS animations - hidden on mobile for performance */}
      <div className="hidden sm:block">
        <div
          className="absolute rounded-full blur-[80px] animate-float-slow"
          style={{
            top: '10%',
            left: '15%',
            width: '350px',
            height: '350px',
            backgroundColor: 'rgba(57, 255, 20, 0.03)',
          }}
        />
        <div
          className="absolute rounded-full blur-[80px] animate-float-medium"
          style={{
            top: '40%',
            right: '10%',
            width: '300px',
            height: '300px',
            backgroundColor: 'rgba(15, 240, 252, 0.03)',
          }}
        />
        <div
          className="absolute rounded-full blur-[80px] animate-float-fast"
          style={{
            bottom: '15%',
            left: '20%',
            width: '280px',
            height: '280px',
            backgroundColor: 'rgba(138, 43, 226, 0.03)',
          }}
        />
      </div>

      {/* Animated particles - simplified on mobile */}
      <div className="hidden md:block">
        <div
          className="absolute w-1.5 h-1.5 rounded-full bg-neon-green/70"
          style={{
            top: '20%',
            left: '30%',
            boxShadow: '0 0 8px rgba(57, 255, 20, 0.8)',
            animation: 'pulse-particle 4s ease-in-out infinite',
          }}
        />
        <div
          className="absolute w-1 h-1 rounded-full bg-electric-blue/70"
          style={{
            top: '35%',
            right: '25%',
            boxShadow: '0 0 8px rgba(15, 240, 252, 0.8)',
            animation: 'pulse-particle 5s ease-in-out infinite 1s',
          }}
        />
        <div
          className="absolute w-2 h-2 rounded-full bg-deep-purple/70"
          style={{
            top: '55%',
            left: '15%',
            boxShadow: '0 0 8px rgba(138, 43, 226, 0.8)',
            animation: 'pulse-particle 6s ease-in-out infinite 2s',
          }}
        />
        <div
          className="absolute w-1 h-1 rounded-full bg-neon-green/70"
          style={{
            top: '70%',
            right: '35%',
            boxShadow: '0 0 8px rgba(57, 255, 20, 0.8)',
            animation: 'pulse-particle 4.5s ease-in-out infinite 0.5s',
          }}
        />
        <div
          className="absolute w-1.5 h-1.5 rounded-full bg-electric-blue/70"
          style={{
            top: '25%',
            right: '15%',
            boxShadow: '0 0 8px rgba(15, 240, 252, 0.8)',
            animation: 'pulse-particle 5.5s ease-in-out infinite 1.5s',
          }}
        />
        <div
          className="absolute w-1 h-1 rounded-full bg-deep-purple/70"
          style={{
            top: '80%',
            left: '40%',
            boxShadow: '0 0 8px rgba(138, 43, 226, 0.8)',
            animation: 'pulse-particle 4s ease-in-out infinite 2.5s',
          }}
        />
      </div>

      {/* Grid overlay - reduced opacity on mobile */}
      <div
        className="absolute inset-0 opacity-[0.01] sm:opacity-[0.015]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(57, 255, 20, 0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(57, 255, 20, 0.3) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
        }}
      />
    </div>
  );
}
