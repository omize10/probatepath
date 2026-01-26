"use client";

import { useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

type TierKey = "essentials" | "guided" | "concierge";

interface Step {
  number: number;
  title: string;
  description: string;
}

interface TierData {
  name: string;
  price: string;
  tagline: string;
  steps: Step[];
  cta: string;
}

const tiers: Record<TierKey, TierData> = {
  essentials: {
    name: "Essentials",
    price: "$799",
    tagline: "Self-guided with professional documents",
    steps: [
      {
        number: 1,
        title: "Complete online intake",
        description: "Answer questions at your own pace with autosave",
      },
      {
        number: 2,
        title: "We prepare your forms",
        description: "Court-ready documents delivered in 3 days",
      },
      {
        number: 3,
        title: "Get notarized",
        description: "$50 notary credit or free at partner firms",
      },
      {
        number: 4,
        title: "Submit to court",
        description: "Follow our step-by-step filing guide",
      },
      {
        number: 5,
        title: "Pay court fees",
        description: "Court fees based on estate value*",
      },
      {
        number: 6,
        title: "Receive your grant",
        description: "Your estate grant arrives by mail",
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
        number: 1,
        title: "Phone intake with specialist",
        description: "We walk you through every question",
      },
      {
        number: 2,
        title: "Forms prepared + reviewed",
        description: "Specialist reviews for completeness",
      },
      {
        number: 3,
        title: "Get notarized",
        description: "$50 notary credit or free at partner firms",
      },
      {
        number: 4,
        title: "Guided submission",
        description: "We explain exactly what to send and where",
      },
      {
        number: 5,
        title: "Pay court fees",
        description: "Court fees based on estate value*",
      },
      {
        number: 6,
        title: "Receive your grant",
        description: "Your estate grant arrives by mail",
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
        number: 1,
        title: "Dedicated case manager",
        description: "Your single point of contact throughout",
      },
      {
        number: 2,
        title: "Full document preparation",
        description: "Every form prepared and triple-checked",
      },
      {
        number: 3,
        title: "We handle notarization",
        description: "Coordinated through our partner network",
      },
      {
        number: 4,
        title: "We submit for you",
        description: "Shepherded through the court registry",
      },
      {
        number: 5,
        title: "Court fees coordinated",
        description: "We manage the payment process",
      },
      {
        number: 6,
        title: "Grant delivered to you",
        description: "Hand-delivered with full closure support",
      },
    ],
    cta: "Start with Concierge",
  },
};

const tierOrder: TierKey[] = ["essentials", "guided", "concierge"];

// Timeline Step Card Component with POP OUT effect
function TimelineStep({
  step,
  index,
  isLeft,
}: {
  step: Step;
  index: number;
  isLeft: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  // Card pops when it's in the CENTER of viewport (middle 30%)
  const isInCenter = useInView(ref, {
    margin: "-35% 0px -35% 0px",
  });

  return (
    <div
      ref={ref}
      className={`relative flex items-center ${
        isLeft ? "md:flex-row" : "md:flex-row-reverse"
      } flex-col md:gap-8`}
      style={{ minHeight: "200px" }}
    >
      {/* Card - POPS OUT when in center */}
      <motion.div
        initial={{ opacity: 0.6, scale: 0.95 }}
        animate={{
          opacity: isInCenter ? 1 : 0.6,
          scale: isInCenter ? 1.15 : 1,
          zIndex: isInCenter ? 50 : 1,
        }}
        transition={{
          type: "spring",
          stiffness: 200,
          damping: 25,
        }}
        className={`w-full md:w-[calc(50%-2rem)] ${isLeft ? "md:text-right" : "md:text-left"}`}
        style={{
          transformOrigin: isLeft ? "right center" : "left center",
        }}
      >
        <motion.div
          animate={{
            boxShadow: isInCenter
              ? "0 40px 100px -30px rgba(0,0,0,0.4)"
              : "0 20px 50px -20px rgba(15,26,42,0.15)",
          }}
          className={`rounded-2xl border bg-white p-6 md:p-8 transition-colors duration-300
            ${isInCenter
              ? "border-gray-400"
              : "border-[color:var(--border-muted)]"
            }`}
        >
          <div className={`flex items-start gap-4 ${isLeft ? "md:flex-row-reverse" : ""}`}>
            {/* Step number */}
            <motion.div
              animate={{
                scale: isInCenter ? 1.1 : 1,
                backgroundColor: isInCenter ? "#111827" : "#f0f3f7",
                color: isInCenter ? "#ffffff" : "var(--brand)",
              }}
              transition={{ duration: 0.3 }}
              className="flex h-12 w-12 md:h-14 md:w-14 shrink-0 items-center justify-center rounded-full text-xl md:text-2xl font-bold"
            >
              {step.number}
            </motion.div>
            <div className={`flex-1 ${isLeft ? "md:text-right" : ""}`}>
              <motion.h3
                animate={{
                  fontSize: isInCenter ? "1.5rem" : "1.125rem",
                }}
                className="font-semibold text-[color:var(--brand)] leading-tight"
              >
                {step.title}
              </motion.h3>
              <motion.p
                animate={{
                  fontSize: isInCenter ? "1rem" : "0.875rem",
                  opacity: isInCenter ? 1 : 0.8,
                }}
                className="mt-2 text-[color:var(--muted-ink)]"
              >
                {step.description}
              </motion.p>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Center connector (desktop only) */}
      <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 flex-col items-center">
        <motion.div
          animate={{
            scale: isInCenter ? 1.5 : 1,
            backgroundColor: isInCenter ? "#111827" : "#ffffff",
            borderColor: isInCenter ? "#111827" : "var(--border-muted)",
          }}
          transition={{ duration: 0.3 }}
          className="h-4 w-4 rounded-full border-2 z-10"
        />
      </div>

      {/* Spacer for the other side */}
      <div className="hidden md:block w-[calc(50%-2rem)]" />
    </div>
  );
}

// Main Component
export function CinematicTimeline() {
  const [activeTier, setActiveTier] = useState<TierKey>("guided");
  const currentTier = tiers[activeTier];
  const sectionRef = useRef<HTMLElement>(null);
  const headerInView = useInView(sectionRef, { once: true, amount: 0.2 });

  return (
    <section
      ref={sectionRef}
      className="relative bg-gradient-to-b from-white via-white to-[#f5f7fb] py-16 sm:py-24"
    >
      <div className="mx-auto max-w-4xl px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={headerInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[color:var(--slate)] mb-3">
            How It Works
          </p>
          <h2 className="font-serif text-3xl text-[color:var(--brand)] sm:text-4xl">
            6 Simple Steps to Your Grant
          </h2>
        </motion.div>

        {/* Tier Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={headerInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex justify-center mb-4"
        >
          <div className="relative inline-flex rounded-2xl border border-[color:var(--border-muted)] bg-[color:var(--bg-surface)] p-1.5 shadow-sm">
            {/* Sliding indicator - black/gray */}
            <motion.div
              className="absolute top-1.5 bottom-1.5 rounded-xl bg-gray-900 shadow-md"
              initial={false}
              animate={{
                x: tierOrder.indexOf(activeTier) * 120 + 6,
                width: 108,
              }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />
            {tierOrder.map((tierKey) => {
              const tier = tiers[tierKey];
              const isActive = activeTier === tierKey;
              return (
                <button
                  key={tierKey}
                  onClick={() => setActiveTier(tierKey)}
                  className="relative z-10 w-[120px] rounded-xl px-5 py-3 text-center transition-colors duration-200"
                >
                  <span
                    className={`block text-sm font-semibold ${
                      isActive
                        ? "text-white"
                        : "text-[color:var(--muted-ink)] hover:text-[color:var(--brand)]"
                    }`}
                  >
                    {tier.name}
                  </span>
                  <span
                    className={`block text-xs ${
                      isActive ? "text-white/80" : "text-[color:var(--slate)]"
                    }`}
                  >
                    {tier.price}
                  </span>
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Tagline */}
        <motion.p
          key={activeTier}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="text-center text-sm text-[color:var(--slate)] mb-12"
        >
          {currentTier.tagline}
        </motion.p>

        {/* Timeline */}
        <div className="relative">
          {/* Vertical line (desktop only) */}
          <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-0.5 -translate-x-1/2 bg-[color:var(--border-muted)]" />

          {/* Steps */}
          <div className="space-y-12 md:space-y-16">
            {currentTier.steps.map((step, index) => (
              <TimelineStep
                key={`${activeTier}-${step.number}`}
                step={step}
                index={index}
                isLeft={index % 2 === 0}
              />
            ))}
          </div>
        </div>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-16 flex justify-center"
        >
          <Button
            asChild
            size="lg"
            className="bg-gray-900 px-8 py-6 text-base font-semibold text-white shadow-lg shadow-gray-900/25 transition-all hover:-translate-y-0.5 hover:bg-gray-800 hover:shadow-xl hover:shadow-gray-900/30"
          >
            <Link href="/onboard/executor">
              {currentTier.cta}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </motion.div>

        {/* Footer Note */}
        <p className="mt-8 text-center text-xs text-[color:var(--slate)]">
          *Court probate fees are set by BC government and paid separately
        </p>
      </div>
    </section>
  );
}
