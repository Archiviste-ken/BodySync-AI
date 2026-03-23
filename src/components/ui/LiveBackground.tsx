"use client";

export default function LiveBackground() {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
      {/* Floating orbs using CSS animations */}
      <div className="absolute top-[10%] left-[15%] w-[300px] h-[300px] sm:w-[400px] sm:h-[400px] rounded-full bg-neon-green/[0.03] blur-[80px] animate-float-slow" />
      <div className="absolute top-[40%] right-[10%] w-[250px] h-[250px] sm:w-[350px] sm:h-[350px] rounded-full bg-electric-blue/[0.03] blur-[80px] animate-float-medium" />
      <div className="absolute bottom-[15%] left-[20%] w-[200px] h-[200px] sm:w-[300px] sm:h-[300px] rounded-full bg-deep-purple/[0.03] blur-[80px] animate-float-fast" />

      {/* Static particles - no animation, just visual depth */}
      <div className="absolute top-[20%] left-[30%] w-1.5 h-1.5 rounded-full bg-neon-green/60 shadow-[0_0_6px_rgba(57,255,20,0.6)]" />
      <div className="absolute top-[35%] right-[25%] w-1 h-1 rounded-full bg-electric-blue/60 shadow-[0_0_6px_rgba(15,240,252,0.6)]" />
      <div className="absolute top-[55%] left-[15%] w-2 h-2 rounded-full bg-deep-purple/60 shadow-[0_0_6px_rgba(138,43,226,0.6)]" />
      <div className="absolute top-[70%] right-[35%] w-1 h-1 rounded-full bg-neon-green/60 shadow-[0_0_6px_rgba(57,255,20,0.6)]" />
      <div className="absolute top-[25%] right-[15%] w-1.5 h-1.5 rounded-full bg-electric-blue/60 shadow-[0_0_6px_rgba(15,240,252,0.6)]" />
      <div className="absolute top-[80%] left-[40%] w-1 h-1 rounded-full bg-deep-purple/60 shadow-[0_0_6px_rgba(138,43,226,0.6)]" />
      <div className="absolute top-[45%] left-[60%] w-1.5 h-1.5 rounded-full bg-neon-green/60 shadow-[0_0_6px_rgba(57,255,20,0.6)]" />
      <div className="absolute top-[65%] right-[20%] w-1 h-1 rounded-full bg-electric-blue/60 shadow-[0_0_6px_rgba(15,240,252,0.6)]" />

      {/* Grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.015]"
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
