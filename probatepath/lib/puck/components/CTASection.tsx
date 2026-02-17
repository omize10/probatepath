"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ComponentConfig } from "@puckeditor/core";

export type CTASectionProps = {
  eyebrow: string;
  headline: string;
  description: string;
  ctaText: string;
  ctaLink: string;
  secondaryCtaText: string;
  secondaryCtaLink: string;
  variant: "light" | "dark" | "brand";
};

export function CTASection({
  eyebrow,
  headline,
  description,
  ctaText,
  ctaLink,
  secondaryCtaText,
  secondaryCtaLink,
  variant,
}: CTASectionProps) {
  const bgClasses =
    variant === "dark"
      ? "bg-[#080f1c] text-white"
      : variant === "brand"
        ? "bg-[color:var(--brand)] text-white"
        : "rounded-[32px] border border-[color:var(--border-muted)] bg-[color:var(--bg-surface)] shadow-[0_40px_90px_-70px_rgba(15,23,42,0.2)]";

  const textColor = variant === "light" ? "text-[color:var(--brand)]" : "text-white";
  const mutedColor = variant === "light" ? "text-[color:var(--muted-ink)]" : "text-white/80";

  return (
    <section className={`p-10 ${bgClasses}`}>
      <div className="space-y-6 text-center">
        {eyebrow && (
          <p className={`text-sm font-semibold uppercase tracking-[0.35em] ${mutedColor}`}>{eyebrow}</p>
        )}
        <h2 className={`font-serif text-3xl sm:text-4xl ${textColor}`}>{headline}</h2>
        {description && (
          <p className={`mx-auto max-w-2xl text-base ${mutedColor}`}>{description}</p>
        )}
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button asChild size="lg" className={variant !== "light" ? "bg-white text-[#0a0d12] hover:bg-white/90" : ""}>
            <Link href={ctaLink}>
              {ctaText}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          {secondaryCtaText && (
            <Button asChild size="lg" variant={variant === "light" ? "outline" : "secondary"}>
              <Link href={secondaryCtaLink}>{secondaryCtaText}</Link>
            </Button>
          )}
        </div>
      </div>
    </section>
  );
}

export const ctaSectionConfig: ComponentConfig<CTASectionProps> = {
  label: "CTA Section",
  fields: {
    eyebrow: { type: "text", label: "Eyebrow Text" },
    headline: { type: "text", label: "Headline" },
    description: { type: "textarea", label: "Description" },
    ctaText: { type: "text", label: "CTA Button Text" },
    ctaLink: { type: "text", label: "CTA Button Link" },
    secondaryCtaText: { type: "text", label: "Secondary CTA Text" },
    secondaryCtaLink: { type: "text", label: "Secondary CTA Link" },
    variant: {
      type: "select",
      label: "Style Variant",
      options: [
        { label: "Light", value: "light" },
        { label: "Dark", value: "dark" },
        { label: "Brand Color", value: "brand" },
      ],
    },
  },
  defaultProps: {
    eyebrow: "Ready to start?",
    headline: "Begin your intake in minutes",
    description: "We'll guide you through every field, confirm fit, and assemble your filing-ready package.",
    ctaText: "Get started",
    ctaLink: "/onboard/executor",
    secondaryCtaText: "How it works",
    secondaryCtaLink: "/how-it-works",
    variant: "light",
  },
  render: (props) => <CTASection {...props} />,
};
