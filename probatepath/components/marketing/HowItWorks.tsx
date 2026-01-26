"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Check } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

type TierKey = "essentials" | "guided" | "concierge";

interface TierStep {
  step: number;
  title: string;
  description: string;
}

interface TierData {
  name: string;
  price: string;
  tagline: string;
  steps: TierStep[];
  cta: string;
}

const tiers: Record<TierKey, TierData> = {
  essentials: {
    name: "Essentials",
    price: "$799",
    tagline: "Self-guided with professional documents",
    steps: [
      {
        step: 1,
        title: "Complete online intake",
        description: "Answer questions at your own pace with autosave",
      },
      {
        step: 2,
        title: "We prepare your forms",
        description: "Court-ready documents delivered in 3 days",
      },
      {
        step: 3,
        title: "Get notarized",
        description: "$50 notary credit or free at partner firms",
      },
      {
        step: 4,
        title: "Submit to court",
        description: "Follow our step-by-step filing guide",
      },
      {
        step: 5,
        title: "Pay court fees",
        description: "Court fees based on estate value*",
      },
      {
        step: 6,
        title: "Receive your grant",
        description: "Probate mailed directly to you",
      },
    ],
    cta: "Start with Essentials",
  },
  guided: {
    name: "Guided",
    price: "$1,499",
    tagline: "Phone support every step of the way",
    steps: [
      {
        step: 1,
        title: "Phone intake with specialist",
        description: "We walk you through every question",
      },
      {
        step: 2,
        title: "Forms prepared + reviewed",
        description: "Specialist reviews for completeness",
      },
      {
        step: 3,
        title: "Get notarized",
        description: "$50 notary credit or free at partner firms",
      },
      {
        step: 4,
        title: "Guided submission",
        description: "We explain exactly what to send and where",
      },
      {
        step: 5,
        title: "Pay court fees",
        description: "Court fees based on estate value*",
      },
      {
        step: 6,
        title: "Receive your grant",
        description: "We check in until it arrives",
      },
    ],
    cta: "Start with Guided",
  },
  concierge: {
    name: "Concierge",
    price: "$2,499",
    tagline: "White-glove service, we handle everything",
    steps: [
      {
        step: 1,
        title: "Dedicated case manager",
        description: "Your single point of contact throughout",
      },
      {
        step: 2,
        title: "Full document preparation",
        description: "Every form prepared and triple-checked",
      },
      {
        step: 3,
        title: "We handle notarization",
        description: "Coordinated through our partner network",
      },
      {
        step: 4,
        title: "We submit for you",
        description: "Shepherded through the court registry",
      },
      {
        step: 5,
        title: "Court fees coordinated",
        description: "We manage the payment process",
      },
      {
        step: 6,
        title: "Grant delivered to you",
        description: "Hand-delivered with full closure support",
      },
    ],
    cta: "Start with Concierge",
  },
};

const tierOrder: TierKey[] = ["essentials", "guided", "concierge"];

export function HowItWorks() {
  const [activeTier, setActiveTier] = useState<TierKey>("guided");
  const currentTier = tiers[activeTier];

  return (
    <section className="space-y-10">
      {/* Header */}
      <div className="space-y-4 text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[color:var(--slate)]">
          How It Works
        </p>
        <h2 className="font-serif text-3xl text-[color:var(--brand)] sm:text-4xl">
          Choose your level of support
        </h2>
        <p className="mx-auto max-w-2xl text-base text-[color:var(--muted-ink)]">
          Every tier gets the same court-ready documents. Pick the service level that fits your needs.
        </p>
      </div>

      {/* Tier Tabs */}
      <div className="flex justify-center">
        <div className="inline-flex rounded-2xl border border-[color:var(--border-muted)] bg-[color:var(--bg-surface)] p-1.5 shadow-sm">
          {tierOrder.map((tierKey) => {
            const tier = tiers[tierKey];
            const isActive = activeTier === tierKey;
            return (
              <button
                key={tierKey}
                onClick={() => setActiveTier(tierKey)}
                className={`relative rounded-xl px-5 py-3 text-center transition-all duration-300 ${
                  isActive
                    ? "bg-[color:var(--brand)] text-white shadow-md"
                    : "text-[color:var(--muted-ink)] hover:text-[color:var(--brand)]"
                }`}
              >
                <span className="block text-sm font-semibold">{tier.name}</span>
                <span className={`block text-xs ${isActive ? "text-white/80" : "text-[color:var(--muted-ink)]"}`}>
                  {tier.price}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tier Tagline */}
      <AnimatePresence mode="wait">
        <motion.p
          key={activeTier + "-tagline"}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.3 }}
          className="text-center text-base font-medium text-[color:var(--brand)]"
        >
          {currentTier.tagline}
        </motion.p>
      </AnimatePresence>

      {/* Timeline */}
      <div className="relative mx-auto max-w-4xl">
        {/* Desktop Timeline Line */}
        <div className="absolute left-8 top-0 hidden h-full w-0.5 bg-gradient-to-b from-[color:var(--brand)] via-[color:var(--accent)] to-[color:var(--brand)] md:left-1/2 md:-translate-x-1/2 md:block" />

        {/* Mobile Timeline Line */}
        <div className="absolute left-8 top-0 block h-full w-0.5 bg-gradient-to-b from-[color:var(--brand)] via-[color:var(--accent)] to-[color:var(--brand)] md:hidden" />

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTier}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="relative space-y-0"
          >
            {currentTier.steps.map((step, index) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1, duration: 0.4 }}
                className={`relative flex items-start gap-6 py-4 md:items-center ${
                  index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                }`}
              >
                {/* Step Number Circle */}
                <div className="relative z-10 flex h-16 w-16 flex-none items-center justify-center rounded-full border-4 border-white bg-[color:var(--brand)] text-white shadow-lg md:absolute md:left-1/2 md:-translate-x-1/2">
                  <span className="text-lg font-bold">{step.step}</span>
                </div>

                {/* Content Card */}
                <div
                  className={`flex-1 rounded-2xl border border-[color:var(--border-muted)] bg-white p-5 shadow-sm transition-all duration-300 hover:shadow-md md:max-w-[calc(50%-4rem)] ${
                    index % 2 === 0 ? "md:mr-auto md:text-right" : "md:ml-auto md:text-left"
                  }`}
                >
                  <h3 className="text-base font-semibold text-[color:var(--brand)]">
                    {step.title}
                  </h3>
                  <p className="mt-1 text-sm text-[color:var(--muted-ink)]">
                    {step.description}
                  </p>
                </div>

                {/* Spacer for desktop layout */}
                <div className="hidden flex-1 md:block" />
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* CTA */}
      <motion.div
        className="flex flex-col items-center gap-4"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.6, duration: 0.4 }}
      >
        <Button asChild size="lg" className="shadow-lg">
          <Link href="/onboard/name">
            {currentTier.cta}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
        <p className="text-xs text-[color:var(--muted-ink)]">
          *Court probate fees are set by BC government and paid separately
        </p>
      </motion.div>

      {/* Feature Comparison */}
      <div className="mx-auto max-w-3xl rounded-2xl border border-[color:var(--border-muted)] bg-[color:var(--bg-surface)] p-6">
        <h3 className="mb-4 text-center text-sm font-semibold uppercase tracking-wide text-[color:var(--slate)]">
          What&apos;s Included
        </h3>
        <div className="grid gap-4 text-sm md:grid-cols-3">
          {tierOrder.map((tierKey) => {
            const tier = tiers[tierKey];
            const isActive = activeTier === tierKey;
            return (
              <div
                key={tierKey}
                className={`rounded-xl p-4 transition-all duration-300 ${
                  isActive
                    ? "bg-[color:var(--brand)] text-white"
                    : "bg-white text-[color:var(--muted-ink)]"
                }`}
              >
                <p className={`font-semibold ${isActive ? "text-white" : "text-[color:var(--brand)]"}`}>
                  {tier.name}
                </p>
                <p className={`text-xs ${isActive ? "text-white/80" : ""}`}>{tier.price}</p>
                <ul className="mt-3 space-y-2">
                  {[
                    "Court-ready P1, P2, P3 forms",
                    "Personalized cover letter",
                    "Filing checklist",
                    tierKey === "essentials" ? "Email support" : "Phone support",
                    tierKey === "concierge" ? "We file for you" : "Filing guide included",
                  ].map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <Check className={`mt-0.5 h-3.5 w-3.5 flex-none ${isActive ? "text-white" : "text-green-600"}`} />
                      <span className="text-xs">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
