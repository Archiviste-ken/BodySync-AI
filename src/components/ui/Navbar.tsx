"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, Upload, LayoutDashboard, MessageSquare } from "lucide-react";
import { motion } from "framer-motion";

const navLinks = [
  { href: "/", label: "Home", icon: Activity },
  { href: "/upload", label: "Upload", icon: Upload },
  { href: "/plan", label: "Dashboard", icon: LayoutDashboard },
  { href: "/ai-coach", label: "AI Coach", icon: MessageSquare },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="sticky top-0 z-50 w-full"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-neon-green/20 to-electric-blue/20 border border-neon-green/20">
              <Activity className="h-5 w-5 text-neon-green" />
              <div className="absolute inset-0 rounded-xl bg-neon-green/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <span className="font-heading text-lg font-bold tracking-tight text-white">
              Body<span className="text-gradient">Sync</span>
            </span>
          </Link>

          {/* Nav Links */}
          <div className="flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "text-neon-green"
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{link.label}</span>
                  {isActive && (
                    <motion.div
                      layoutId="navbar-active"
                      className="absolute inset-0 rounded-xl border border-neon-green/20 bg-neon-green/5"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                    />
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
      {/* Bottom border glow */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-surface-border to-transparent" />
    </motion.nav>
  );
}
