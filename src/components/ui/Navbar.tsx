"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, Upload, LayoutDashboard, MessageSquare } from "lucide-react";

const navLinks = [
  { href: "/", label: "Home", icon: Activity },
  { href: "/upload", label: "Upload", icon: Upload },
  { href: "/plan", label: "Dashboard", icon: LayoutDashboard },
  { href: "/ai-coach", label: "AI Coach", icon: MessageSquare },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="relative z-50 w-full pt-3 px-3 sm:px-0 animate-slide-down-nav">
      <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
        <div className="glass-panel flex h-14 sm:h-16 items-center justify-between px-3 sm:px-5 relative overflow-hidden">
          {/* Subtle animated gradient background */}
          <div
            className="absolute inset-0 opacity-30 pointer-events-none animate-nav-gradient"
            style={{
              background:
                "linear-gradient(90deg, transparent, rgba(57,255,20,0.03), rgba(15,240,252,0.03), transparent)",
              backgroundSize: "200% 100%",
            }}
          />

          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 sm:gap-2.5 group relative z-10"
          >
            <div className="relative flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-lg sm:rounded-xl bg-gradient-to-br from-neon-green/20 to-electric-blue/20 border border-neon-green/25 transition-all duration-300 hover:scale-108 hover:rotate-5 active:scale-95">
              <Activity className="h-4 w-4 sm:h-5 sm:w-5 text-neon-green transition-transform duration-300 group-hover:scale-110" />
              {/* Logo glow on hover */}
              <div className="absolute inset-0 rounded-lg sm:rounded-xl bg-neon-green/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm" />
            </div>
            <span className="font-heading text-base sm:text-lg font-bold tracking-tight text-white">
              Body<span className="text-gradient">Sync</span>
            </span>
          </Link>

          {/* Nav Links */}
          <div className="flex items-center gap-0.5 sm:gap-1 rounded-lg sm:rounded-xl border border-white/8 bg-black/20 p-1 sm:p-1.5 backdrop-blur-sm relative z-10">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              const Icon = link.icon;
              return (
                <div
                  key={link.href}
                  className="transition-transform duration-300 hover:-translate-y-0.5 active:scale-96"
                >
                  <Link
                    href={link.href}
                    className={`relative flex items-center justify-center gap-1.5 sm:gap-2 rounded-lg sm:rounded-xl px-2.5 py-2 sm:px-3.5 sm:py-2.5 text-xs sm:text-sm font-medium transition-all duration-300 min-w-[40px] sm:min-w-0 ${
                      isActive
                        ? "text-neon-green"
                        : "text-gray-400 hover:text-white hover:bg-white/8"
                    }`}
                  >
                    <Icon
                      className={`h-4 w-4 sm:h-4 sm:w-4 transition-all duration-300 ${
                        isActive ? "scale-110" : ""
                      }`}
                    />
                    <span className="hidden md:inline">{link.label}</span>
                    {isActive && (
                      <div
                        className="absolute inset-0 rounded-lg sm:rounded-xl border border-neon-green/30 bg-gradient-to-r from-neon-green/18 via-electric-blue/12 to-neon-green/8 animate-active-link"
                        style={{
                          boxShadow:
                            "0 0 20px rgba(57,255,20,0.1), inset 0 1px 0 rgba(255,255,255,0.1)",
                        }}
                      />
                    )}
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom border glow with enhanced animation */}
      <div
        className="mt-3 h-px w-full origin-center animate-border-expand"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(57,255,20,0.2), rgba(15,240,252,0.3), rgba(138,43,226,0.2), transparent)",
        }}
      />
    </nav>
  );
}
