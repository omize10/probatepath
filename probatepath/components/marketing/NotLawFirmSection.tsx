"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface NotLawFirmSectionProps {
  className?: string;
}

export function NotLawFirmSection({ className }: NotLawFirmSectionProps) {
  return (
    <section
      className={cn(
        "relative left-1/2 w-screen -translate-x-1/2 overflow-hidden bg-[#080f1c]",
        "py-24 sm:py-32 lg:py-40",
        className
      )}
    >
      {/* Subtle gradient overlay for depth */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% 50%, rgba(30, 40, 60, 0.3) 0%, transparent 60%)",
        }}
      />

      {/* Main content */}
      <div className="relative z-10 mx-auto max-w-4xl px-6 text-center">
        {/* Headline */}
        <h2 className="font-serif text-4xl leading-tight sm:text-5xl lg:text-6xl tracking-tight">
          <span className="text-white">We&apos;re not a law firm.</span>
          <br />
          <span className="text-gradient-animated">And that&apos;s the point.</span>
        </h2>

        {/* Supporting copy */}
        <p className="mt-6 text-lg leading-relaxed text-white/70 max-w-2xl mx-auto sm:text-xl">
          No billable hours. No legal jargon. No $5,000 surprise invoices.
          <br className="hidden sm:block" />
          Just specialists who know BC probate inside and out, preparing your
          documents for a fixed, transparent price.
        </p>

        {/* CTA Button */}
        <div className="mt-12">
          <Link href="/onboard/executor" className="cta-clean-button">
            Get Started Now
            <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-200 group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Trust indicator */}
        <p className="mt-14 text-sm text-white/60">
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
