"use client";

import { useRef, useState } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useInView,
} from "framer-motion";
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

// Progress Bar Component - Pure gray colors (no blue)
function ProgressBar({
  containerRef,
  totalSteps,
}: {
  containerRef: React.RefObject<HTMLDivElement | null>;
  totalSteps: number;
}) {
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <div className="fixed top-[72px] left-0 right-0 z-40 h-0.5 bg-[#1A1A1A]/50 backdrop-blur-sm">
      <motion.div
        className="h-full bg-[#6B7280] origin-left"
        style={{ scaleX }}
      />
      {/* Step dots */}
      <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 flex justify-between px-8 md:px-16">
        {Array.from({ length: totalSteps }).map((_, i) => (
          <motion.div
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-[#374151] transition-colors duration-300"
            style={{
              backgroundColor: useTransform(
                scrollYProgress,
                [i / totalSteps, (i + 0.5) / totalSteps],
                ["#374151", "#6B7280"]
              ),
            }}
          />
        ))}
      </div>
    </div>
  );
}

// Full Screen Step Component - Professional, pure gray design
function FullScreenStep({
  step,
  index,
  totalSteps,
  isLastStep,
  cta,
}: {
  step: Step;
  index: number;
  totalSteps: number;
  isLastStep: boolean;
  cta: string;
}) {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, {
    amount: 0.5,
    once: false,
  });

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  // Subtle parallax effects
  const y = useTransform(scrollYProgress, [0, 1], [60, -60]);
  const scale = useTransform(
    scrollYProgress,
    [0, 0.3, 0.5, 0.7, 1],
    [0.85, 0.95, 1, 0.98, 0.9]
  );
  const springScale = useSpring(scale, { stiffness: 150, damping: 25 });
  const opacity = useTransform(
    scrollYProgress,
    [0, 0.25, 0.5, 0.75, 1],
    [0, 1, 1, 1, 0]
  );

  return (
    <section
      ref={ref}
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#111111]"
    >
      {/* Subtle grid background */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,1) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)`,
          backgroundSize: "80px 80px",
        }}
      />

      {/* Main card */}
      <motion.div
        style={{
          scale: springScale,
          y,
          opacity,
        }}
        className="relative z-10 w-[90vw] max-w-3xl px-4"
      >
        {/* The card - clean, professional */}
        <motion.div
          className="relative bg-[#1A1A1A]/80 backdrop-blur-sm rounded-2xl p-10 md:p-16 border border-[#374151]/50"
          style={{
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.4)",
          }}
          whileHover={{ y: -4 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
        >
          {/* Step number - Dark gray circle, NO blue */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={
              isInView
                ? { scale: 1, opacity: 1 }
                : { scale: 0, opacity: 0 }
            }
            transition={{
              type: "spring",
              stiffness: 200,
              damping: 18,
              delay: 0.1,
            }}
            className="absolute -top-8 -left-8 md:-top-10 md:-left-10"
          >
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-[#374151] border-2 border-[#4B5563] flex items-center justify-center shadow-lg">
              <span className="text-2xl md:text-3xl font-bold text-white">
                {step.number}
              </span>
            </div>
          </motion.div>

          {/* Title */}
          <motion.h3
            initial={{ opacity: 0, y: 40 }}
            animate={
              isInView
                ? { opacity: 1, y: 0 }
                : { opacity: 0, y: 40 }
            }
            transition={{
              type: "spring",
              stiffness: 100,
              damping: 18,
              delay: 0.2,
            }}
            className="text-2xl md:text-4xl font-semibold text-white text-center mb-4 leading-tight"
          >
            {step.title}
          </motion.h3>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={
              isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }
            }
            transition={{
              type: "spring",
              stiffness: 80,
              damping: 18,
              delay: 0.3,
            }}
            className="text-lg text-gray-300 text-center max-w-xl mx-auto"
          >
            {step.description}
          </motion.p>

          {/* Subtle divider */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={isInView ? { scaleX: 1 } : { scaleX: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-10 h-px bg-[#4B5563]/50 rounded-full origin-center max-w-xs mx-auto"
          />

          {/* Step indicator */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ delay: 0.5 }}
            className="text-center text-gray-500 mt-4 text-sm"
          >
            Step {step.number} of {totalSteps}
          </motion.p>

          {/* CTA on last step */}
          {isLastStep && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={
                isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }
              }
              transition={{ delay: 0.6 }}
              className="mt-8 flex justify-center"
            >
              <Button
                asChild
                size="lg"
                className="bg-emerald-600 px-8 py-6 text-base font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-emerald-700"
              >
                <Link href="/onboard/name">
                  {cta}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </motion.div>
          )}
        </motion.div>
      </motion.div>

      {/* Scroll indicator on first step */}
      {index === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: 1,
            repeat: Infinity,
            repeatType: "reverse",
            duration: 1.5,
          }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 text-gray-500 flex flex-col items-center gap-2"
        >
          <span className="text-sm">Scroll to continue</span>
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </svg>
        </motion.div>
      )}
    </section>
  );
}

// Main Component
export function CinematicTimeline() {
  const [activeTier, setActiveTier] = useState<TierKey>("guided");
  const containerRef = useRef<HTMLDivElement>(null);
  const currentTier = tiers[activeTier];

  return (
    <div className="relative bg-[#111111]">
      {/* Sticky Header */}
      <div className="sticky top-0 z-50 bg-[#111111]/95 backdrop-blur-xl border-b border-[#1A1A1A] py-6">
        <div className="mx-auto max-w-6xl px-6">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-6"
          >
            <p className="text-xs font-semibold tracking-[4px] text-gray-400 uppercase mb-2">
              How It Works
            </p>
            <h2 className="text-2xl md:text-3xl font-semibold text-white">
              6 Simple Steps to Your Grant
            </h2>
          </motion.div>

          {/* Tier Tabs - Professional, pure gray */}
          <div className="flex justify-center">
            <div className="relative inline-flex rounded-xl border border-[#374151] bg-[#1A1A1A]/50 p-1">
              {/* Sliding indicator */}
              <motion.div
                className="absolute top-1 bottom-1 rounded-lg bg-emerald-600"
                initial={false}
                animate={{
                  x: tierOrder.indexOf(activeTier) * 120 + 4,
                  width: 112,
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
                    className="relative z-10 w-[120px] rounded-lg px-4 py-2 text-center transition-colors duration-200"
                  >
                    <span
                      className={`block text-sm font-medium ${
                        isActive ? "text-white" : "text-gray-400"
                      }`}
                    >
                      {tier.name}
                    </span>
                    <span
                      className={`block text-xs ${
                        isActive ? "text-white/80" : "text-gray-500"
                      }`}
                    >
                      {tier.price}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tagline */}
          <motion.p
            key={activeTier}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center text-sm text-gray-400 mt-4"
          >
            {currentTier.tagline}
          </motion.p>
        </div>
      </div>

      {/* Progress Bar */}
      <ProgressBar
        containerRef={containerRef}
        totalSteps={currentTier.steps.length}
      />

      {/* Full Screen Steps */}
      <div ref={containerRef} className="relative">
        {currentTier.steps.map((step, index) => (
          <FullScreenStep
            key={`${activeTier}-${step.number}`}
            step={step}
            index={index}
            totalSteps={currentTier.steps.length}
            isLastStep={index === currentTier.steps.length - 1}
            cta={currentTier.cta}
          />
        ))}
      </div>

      {/* Footer Note */}
      <div className="bg-[#111111] py-8 text-center border-t border-[#1A1A1A]">
        <p className="text-xs text-gray-500">
          *Court probate fees are set by BC government and paid separately
        </p>
      </div>
    </div>
  );
}
