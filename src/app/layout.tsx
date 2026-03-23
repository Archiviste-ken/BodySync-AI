import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/ui/Navbar";
import LiveBackgroundWrapper from "@/components/ui/LiveBackgroundWrapper";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
});

export const metadata: Metadata = {
  title: "BodySync AI | Smart Fitness Analytics",
  description:
    "Upload your BCA report and get AI-driven workout and meal plans.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.variable} ${spaceGrotesk.variable} min-h-screen antialiased selection:bg-neon-green/30 selection:text-white`}
      >
        {/* Base background */}
        <div className="fixed inset-0 -z-50 h-full w-full bg-[#020304]" />

        {/* Static gradient overlays */}
        <div className="fixed inset-0 -z-40 h-full w-full bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(57,255,20,0.08),transparent)]" />
        <div className="fixed inset-0 -z-40 h-full w-full bg-[radial-gradient(ellipse_60%_45%_at_80%_50%,rgba(15,240,252,0.06),transparent)]" />

        {/* Live animated background */}
        <LiveBackgroundWrapper />

        {/* Top fade overlay */}
        <div className="pointer-events-none fixed inset-0 -z-10 h-full w-full bg-[linear-gradient(to_bottom,rgba(255,255,255,0.03),transparent_15%)]" />

        <Navbar />
        <main className="relative z-10 mx-auto max-w-7xl px-4 pb-14 sm:px-6 lg:px-8">
          {children}
        </main>
      </body>
    </html>
  );
}

