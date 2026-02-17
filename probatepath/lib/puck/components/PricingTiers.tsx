"use client";

import Link from "next/link";
import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { ComponentConfig } from "@puckeditor/core";

export type PricingTiersProps = {
  eyebrow: string;
  headline: string;
  tiers: string; // JSON string of tier objects
};

type Tier = {
  name: string;
  price: number;
  description: string;
  recommended: boolean;
  features: { name: string; included: boolean; note?: string }[];
  cta: string;
  href: string;
};

export function PricingTiers({ eyebrow, headline, tiers }: PricingTiersProps) {
  let parsed: Tier[] = [];
  try {
    parsed = JSON.parse(tiers);
  } catch {
    parsed = [];
  }

  return (
    <section className="space-y-8">
      <div className="text-center">
        {eyebrow && (
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[color:var(--slate)]">{eyebrow}</p>
        )}
        {headline && (
          <h2 className="mt-3 font-serif text-3xl text-[color:var(--brand)] sm:text-4xl">{headline}</h2>
        )}
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        {parsed.map((tier) => (
          <Card
            key={tier.name}
            className={`relative h-full border-[color:var(--border-muted)] shadow-[0_30px_80px_-70px_rgba(15,23,42,0.25)] transition hover:-translate-y-1 ${
              tier.recommended ? "border-2 border-[color:var(--brand)] shadow-[0_40px_100px_-60px_rgba(13,23,38,0.35)]" : ""
            }`}
          >
            {tier.recommended && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="portal-badge">RECOMMENDED</span>
              </div>
            )}
            <CardHeader className="space-y-4 pb-6">
              <CardTitle className="text-2xl text-[color:var(--brand)]">{tier.name}</CardTitle>
              <div className="space-y-1">
                <p className="text-4xl font-bold text-[color:var(--brand)]">
                  ${tier.price.toLocaleString()}
                  <span className="ml-1 text-base font-normal text-[color:var(--muted-ink)]">CAD</span>
                </p>
                <p className="text-xs text-[color:var(--muted-ink)]">plus GST/PST</p>
              </div>
              <CardDescription className="text-sm text-[color:var(--muted-ink)]">{tier.description}</CardDescription>
              {tier.recommended ? (
                <Button asChild size="lg" className="w-full">
                  <Link href={tier.href}>{tier.cta}</Link>
                </Button>
              ) : (
                <Button asChild size="lg" className="w-full" variant="outline">
                  <Link href={tier.href}>{tier.cta}</Link>
                </Button>
              )}
            </CardHeader>
            <CardContent className="space-y-3 pt-6">
              {tier.features.map((feature) => (
                <div key={feature.name} className="flex items-start gap-3 text-sm">
                  {feature.included ? (
                    <span className="mt-0.5 inline-flex h-5 w-5 flex-none items-center justify-center rounded-full bg-[#f0f3f7] text-[color:var(--brand)]">
                      <Check className="h-3 w-3" aria-hidden />
                    </span>
                  ) : (
                    <span className="mt-0.5 inline-flex h-5 w-5 flex-none items-center justify-center rounded-full bg-[#f0f3f7] text-[color:var(--slate)]">
                      <X className="h-3 w-3" aria-hidden />
                    </span>
                  )}
                  <span className={feature.included ? "text-[color:var(--brand)]" : "text-[color:var(--slate)]"}>
                    {feature.name}
                    {feature.note && <span className="block text-xs text-[color:var(--muted-ink)]">{feature.note}</span>}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}

export const pricingTiersConfig: ComponentConfig<PricingTiersProps> = {
  label: "Pricing Tiers",
  fields: {
    eyebrow: { type: "text", label: "Eyebrow Text" },
    headline: { type: "text", label: "Headline" },
    tiers: { type: "textarea", label: "Tiers (JSON array)" },
  },
  defaultProps: {
    eyebrow: "Three service tiers",
    headline: "Pick what matches your comfort level",
    tiers: JSON.stringify([
      {
        name: "Basic", price: 799, description: "For tech-savvy executors with simple estates",
        recommended: false, cta: "Get started", href: "/create-account",
        features: [
          { name: "Online intake questionnaire", included: true },
          { name: "Automated probate form generation", included: true },
          { name: "PDF filing instructions", included: true },
          { name: "Email support (48-hour response)", included: true },
          { name: "Human document review", included: false },
          { name: "Phone/video support", included: false },
        ],
      },
      {
        name: "Standard", price: 1499, description: "Most executors choose this for peace of mind",
        recommended: true, cta: "Get started", href: "/create-account",
        features: [
          { name: "Everything in Basic", included: true },
          { name: "Human review of all documents", included: true },
          { name: "Phone/video support", included: true },
          { name: "Free notarization in Vancouver", included: true, note: "or $50 credit elsewhere" },
          { name: "Post-grant checklist", included: true },
          { name: "One requisition response", included: true },
        ],
      },
      {
        name: "Premium", price: 2499, description: "White-glove service for complex estates",
        recommended: false, cta: "Get started", href: "/create-account",
        features: [
          { name: "Everything in Standard", included: true },
          { name: "Priority support (same-day)", included: true },
          { name: "Dedicated case coordinator", included: true },
          { name: "Unlimited requisition assistance", included: true },
          { name: "Post-grant administration guidance", included: true },
          { name: "Tax filing reminders", included: true },
        ],
      },
    ]),
  },
  render: (props) => <PricingTiers {...props} />,
};
