"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface NotLawFirmSectionProps {
  className?: string;
}

// Generate particle positions with deterministic values to avoid hydration mismatch
const particles = [
  { left: "10%", bottom: "20%", delay: "0s", duration: "7s" },
  { left: "20%", bottom: "40%", delay: "1s", duration: "9s" },
  { left: "30%", bottom: "10%", delay: "2s", duration: "8s" },
  { left: "40%", bottom: "60%", delay: "0.5s", duration: "10s" },
  { left: "50%", bottom: "30%", delay: "1.5s", duration: "7.5s" },
  { left: "60%", bottom: "50%", delay: "2.5s", duration: "8.5s" },
  { left: "70%", bottom: "15%", delay: "0.8s", duration: "9.5s" },
  { left: "80%", bottom: "45%", delay: "1.8s", duration: "7.8s" },
  { left: "85%", bottom: "25%", delay: "3s", duration: "8.2s" },
  { left: "15%", bottom: "55%", delay: "2.2s", duration: "9.2s" },
  { left: "25%", bottom: "35%", delay: "0.3s", duration: "8.8s" },
  { left: "75%", bottom: "65%", delay: "1.3s", duration: "7.3s" },
];

export function NotLawFirmSection({ className }: NotLawFirmSectionProps) {
  return (
    <section
      className={cn(
        "relative left-1/2 w-screen -translate-x-1/2 overflow-hidden bg-[#080f1c]",
        "py-24 sm:py-32 lg:py-40",
        className
      )}
    >
      {/* Animated grid pattern background */}
      <div className="grid-pattern absolute inset-0 pointer-events-none" />

      {/* Gradient overlay for depth */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% 50%, rgba(30, 40, 60, 0.4) 0%, transparent 70%)",
        }}
      />

      {/* Floating particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {particles.map((particle, i) => (
          <div
            key={i}
            className="particle"
            style={{
              left: particle.left,
              bottom: particle.bottom,
              animationDelay: particle.delay,
              animationDuration: particle.duration,
            }}
          />
        ))}
      </div>

      {/* Main content */}
      <div className="relative z-10 mx-auto max-w-4xl px-6 text-center">
        {/* Headline */}
        <h2 className="font-serif text-4xl leading-tight sm:text-5xl lg:text-6xl">
          <span className="text-white">We&apos;re not a law firm.</span>
          <br />
          <span className="text-gradient-animated">And that&apos;s the point.</span>
        </h2>

        {/* Supporting copy */}
        <p className="mt-8 text-lg leading-relaxed text-white/70 max-w-2xl mx-auto sm:text-xl">
          No billable hours. No legal jargon. No $5,000 surprise invoices.
          <br className="hidden sm:block" />
          Just specialists who know BC probate inside and out, preparing your
          documents for a fixed, transparent price.
        </p>

        {/* Animated CTA Button Container */}
        <div className="mt-14 relative inline-flex items-center justify-center">
          {/* Expanding ring effects */}
          <div className="cta-ring" />
          <div className="cta-ring cta-ring-delayed" />
          <div className="cta-ring cta-ring-delayed-2" />

          {/* Main CTA button */}
          <Link href="/onboard/executor" className="cta-animated-button">
            Get Started Now
            <ArrowRight className="cta-arrow h-5 w-5" />
          </Link>
        </div>

        {/* Trust indicator */}
        <p className="mt-10 text-sm text-white/40">
          Join hundreds of BC executors who&apos;ve simplified their probate journey
        </p>
      </div>

      {/* Bottom gradient fade */}
      <div
        className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
        style={{
          background:
            "linear-gradient(to top, var(--bg-page) 0%, transparent 100%)",
        }}
      />
    </section>
  );
}
