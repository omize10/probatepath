"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { ComponentConfig } from "@puckeditor/core";

export type NotLawFirmSectionProps = {
  headlineLine1: string;
  headlineLine2: string;
  body: string;
  ctaText: string;
  ctaLink: string;
  subCtaText: string;
  disclaimer: string;
};

export function PuckNotLawFirmSection({
  headlineLine1,
  headlineLine2,
  body,
  ctaText,
  ctaLink,
  subCtaText,
  disclaimer,
}: NotLawFirmSectionProps) {
  return (
    <section className="relative left-1/2 w-screen -translate-x-1/2 overflow-hidden bg-[#080f1c] py-24 sm:py-32 lg:py-40">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 80% 50% at 50% 50%, rgba(30, 40, 60, 0.3) 0%, transparent 60%)",
        }}
      />
      <div className="relative z-10 mx-auto max-w-4xl px-6 text-center">
        <h2 className="font-serif text-4xl leading-tight sm:text-5xl lg:text-6xl tracking-tight">
          <span className="text-white">{headlineLine1}</span>
          <br />
          <span className="text-gradient-animated">{headlineLine2}</span>
        </h2>
        <p className="mt-6 text-lg leading-relaxed text-white/70 max-w-2xl mx-auto sm:text-xl">
          {body}
        </p>
        {ctaText && (
          <div className="mt-12">
            <Link href={ctaLink} className="cta-clean-button">
              {ctaText}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        )}
        {subCtaText && (
          <p className="mt-14 text-sm text-white/60">{subCtaText}</p>
        )}
        {disclaimer && (
          <p className="mt-8 text-xs text-white/30 max-w-2xl mx-auto leading-relaxed">{disclaimer}</p>
        )}
      </div>
      <div
        className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
        style={{ background: "linear-gradient(to top, var(--bg-page) 0%, transparent 100%)" }}
      />
    </section>
  );
}

export const notLawFirmSectionConfig: ComponentConfig<NotLawFirmSectionProps> = {
  label: "Not A Law Firm Section",
  fields: {
    headlineLine1: { type: "text", label: "Headline Line 1" },
    headlineLine2: { type: "text", label: "Headline Line 2 (gradient)" },
    body: { type: "textarea", label: "Body Text" },
    ctaText: { type: "text", label: "CTA Button Text" },
    ctaLink: { type: "text", label: "CTA Button Link" },
    subCtaText: { type: "text", label: "Sub-CTA Text" },
    disclaimer: { type: "text", label: "Disclaimer Text" },
  },
  defaultProps: {
    headlineLine1: "We're not a law firm.",
    headlineLine2: "And that's the point.",
    body: "No billable hours. No legal jargon. No $5,000 surprise invoices. Just specialists who know BC probate inside and out, preparing your documents for a fixed, transparent price.",
    ctaText: "Get Started Now",
    ctaLink: "/onboard/executor",
    subCtaText: "Join hundreds of BC executors who've simplified their probate journey",
    disclaimer: "",
  },
  render: (props) => <PuckNotLawFirmSection {...props} />,
};
