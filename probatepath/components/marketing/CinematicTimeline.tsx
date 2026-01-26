"use client";

import { useRef, useState, useEffect } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useMotionValueEvent,
  useSpring,
  AnimatePresence,
  MotionValue,
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
const STEP_COUNT = 6;

// Floating particles for ambient animation
function FloatingParticles() {
  const particles = [
    { size: 4, x: "10%", duration: 20, delay: 0 },
    { size: 3, x: "25%", duration: 25, delay: 2 },
    { size: 5, x: "40%", duration: 22, delay: 4 },
    { size: 3, x: "55%", duration: 28, delay: 1 },
    { size: 4, x: "70%", duration: 24, delay: 3 },
    { size: 3, x: "85%", duration: 26, delay: 5 },
    { size: 5, x: "15%", duration: 23, delay: 6 },
    { size: 4, x: "60%", duration: 21, delay: 7 },
    { size: 3, x: "80%", duration: 27, delay: 8 },
    { size: 4, x: "35%", duration: 24, delay: 9 },
  ];

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((particle, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-white/[0.03]"
          style={{
            width: particle.size,
            height: particle.size,
            left: particle.x,
          }}
          animate={{
            y: ["100vh", "-10vh"],
            opacity: [0, 0.5, 0.5, 0],
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      ))}
    </div>
  );
}

// Spotlight overlay that follows active step
function SpotlightOverlay({
  scrollProgress,
  activeStep,
}: {
  scrollProgress: MotionValue<number>;
  activeStep: number;
}) {
  // Spotlight Y position follows active step
  const spotlightPositions = ["30%", "38%", "46%", "54%", "62%", "70%"];
  const spotlightY = spotlightPositions[activeStep] || "50%";

  return (
    <>
      {/* Primary emerald spotlight */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        animate={{
          background: `radial-gradient(ellipse 900px 600px at 50% ${spotlightY}, rgba(16,185,129,0.15) 0%, rgba(16,185,129,0.05) 40%, transparent 70%)`,
        }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      />
      {/* Secondary ambient blue glow */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at 20% 30%, rgba(59,130,246,0.05) 0%, transparent 50%)",
        }}
      />
      {/* Subtle moving gradient orb */}
      <motion.div
        className="absolute w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(16,185,129,0.08) 0%, transparent 70%)",
          filter: "blur(60px)",
          top: "20%",
          right: "-10%",
        }}
        animate={{
          x: [0, -50, 0],
          y: [0, 30, 0],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </>
  );
}

// Progress indicator dots
function ProgressIndicator({
  totalSteps,
  activeStep,
}: {
  totalSteps: number;
  activeStep: number;
}) {
  return (
    <div className="absolute right-6 md:right-12 top-1/2 -translate-y-1/2 flex flex-col gap-3 z-30">
      {Array.from({ length: totalSteps }).map((_, i) => (
        <motion.div
          key={i}
          className="relative"
          animate={{
            scale: i === activeStep ? 1 : 0.8,
          }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            className={`h-3 w-3 rounded-full transition-colors duration-300 ${
              i === activeStep ? "bg-emerald-500" : "bg-gray-600"
            }`}
            animate={{
              boxShadow:
                i === activeStep
                  ? "0 0 20px rgba(16,185,129,0.8), 0 0 40px rgba(16,185,129,0.4)"
                  : "none",
            }}
          />
          {i === activeStep && (
            <motion.div
              className="absolute inset-0 rounded-full bg-emerald-500"
              initial={{ scale: 1, opacity: 0.5 }}
              animate={{ scale: 2.5, opacity: 0 }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeOut",
              }}
            />
          )}
        </motion.div>
      ))}
    </div>
  );
}

// Mobile progress dots (horizontal)
function MobileProgressDots({
  totalSteps,
  activeStep,
}: {
  totalSteps: number;
  activeStep: number;
}) {
  return (
    <div className="absolute bottom-28 left-1/2 -translate-x-1/2 flex gap-2 md:hidden z-30">
      {Array.from({ length: totalSteps }).map((_, i) => (
        <motion.div
          key={i}
          className={`h-2 rounded-full transition-all duration-300 ${
            i === activeStep ? "w-8 bg-emerald-500" : "w-2 bg-gray-600"
          }`}
          animate={{
            boxShadow:
              i === activeStep ? "0 0 12px rgba(16,185,129,0.6)" : "none",
          }}
        />
      ))}
    </div>
  );
}

// Tier tabs with sliding indicator
function TierTabs({
  activeTier,
  onTierChange,
}: {
  activeTier: TierKey;
  onTierChange: (tier: TierKey) => void;
}) {
  return (
    <div className="flex justify-center">
      <div className="relative inline-flex rounded-2xl border border-gray-700/50 bg-gray-900/80 p-1.5 backdrop-blur-sm">
        {/* Animated sliding background */}
        <motion.div
          className="absolute top-1.5 bottom-1.5 rounded-xl bg-emerald-500 shadow-lg shadow-emerald-500/30"
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
              onClick={() => onTierChange(tierKey)}
              className="relative z-10 w-[120px] rounded-xl px-5 py-3 text-center transition-colors duration-200"
            >
              <span
                className={`block text-sm font-semibold ${
                  isActive
                    ? "text-white"
                    : "text-gray-400 hover:text-white"
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
  );
}

// Individual step card with scroll-linked animations
function StepCard({
  step,
  isActive,
  isPast,
  scrollProgress,
  index,
}: {
  step: Step;
  isActive: boolean;
  isPast: boolean;
  scrollProgress: MotionValue<number>;
  index: number;
}) {
  // Calculate this card's scroll range
  const startProgress = index / STEP_COUNT;
  const peakProgress = (index + 0.5) / STEP_COUNT;
  const endProgress = (index + 1) / STEP_COUNT;

  // Scale: small -> large -> small
  const scale = useTransform(
    scrollProgress,
    [
      startProgress - 0.08,
      startProgress,
      peakProgress,
      endProgress,
      endProgress + 0.08,
    ],
    [0.75, 0.9, 1.1, 0.9, 0.75]
  );

  // Y position: below -> center -> above
  const y = useTransform(
    scrollProgress,
    [
      startProgress - 0.08,
      startProgress,
      peakProgress,
      endProgress,
      endProgress + 0.08,
    ],
    [120, 60, 0, -60, -120]
  );

  // Opacity: fade in -> full -> fade out
  const opacity = useTransform(
    scrollProgress,
    [
      startProgress - 0.04,
      startProgress + 0.02,
      peakProgress,
      endProgress - 0.02,
      endProgress + 0.04,
    ],
    [0, 1, 1, 1, 0]
  );

  // Smooth spring physics for buttery animations
  const smoothScale = useSpring(scale, { stiffness: 80, damping: 20, mass: 0.5 });
  const smoothY = useSpring(y, { stiffness: 80, damping: 20, mass: 0.5 });
  const smoothOpacity = useSpring(opacity, { stiffness: 100, damping: 25 });

  return (
    <motion.div
      className="absolute left-1/2 w-full max-w-lg px-4 md:px-6"
      style={{
        x: "-50%",
        y: smoothY,
        scale: smoothScale,
        opacity: smoothOpacity,
        zIndex: isActive ? 20 : 10 - Math.abs(index - 3),
      }}
    >
      <motion.div
        className={`
          relative rounded-3xl border p-6 md:p-8
          transition-all duration-500
          ${
            isActive
              ? "border-emerald-500/50 bg-gradient-to-br from-gray-800/90 to-gray-900/90 shadow-2xl"
              : "border-gray-700/30 bg-gray-900/60"
          }
        `}
        style={{
          boxShadow: isActive
            ? "0 25px 80px -20px rgba(16,185,129,0.4), 0 0 40px rgba(16,185,129,0.1)"
            : "0 10px 40px -20px rgba(0,0,0,0.5)",
        }}
      >
        {/* Glow ring when active */}
        {isActive && (
          <motion.div
            className="absolute -inset-[1px] rounded-3xl pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              background:
                "linear-gradient(135deg, rgba(16,185,129,0.4) 0%, transparent 50%, rgba(16,185,129,0.2) 100%)",
            }}
          />
        )}

        {/* Content container */}
        <div className="relative z-10">
          {/* Step number badge */}
          <motion.div
            className={`
              inline-flex h-14 w-14 md:h-16 md:w-16 items-center justify-center rounded-2xl text-2xl md:text-3xl font-bold
              ${
                isActive
                  ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/50"
                  : "bg-gray-800 text-gray-400 border border-gray-700"
              }
            `}
            animate={{
              scale: isActive ? [1, 1.05, 1] : 1,
            }}
            transition={{
              duration: 2,
              repeat: isActive ? Infinity : 0,
              ease: "easeInOut",
            }}
          >
            {step.number}
          </motion.div>

          {/* Title */}
          <h3
            className={`mt-5 md:mt-6 text-xl md:text-2xl font-bold transition-colors duration-300 ${
              isActive ? "text-white" : "text-gray-300"
            }`}
          >
            {step.title}
          </h3>

          {/* Description */}
          <p
            className={`mt-2 md:mt-3 text-base md:text-lg transition-colors duration-300 ${
              isActive ? "text-gray-300" : "text-gray-500"
            }`}
          >
            {step.description}
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}

// Main Component
export function CinematicTimeline() {
  const [activeTier, setActiveTier] = useState<TierKey>("guided");
  const [activeStep, setActiveStep] = useState(0);
  const containerRef = useRef<HTMLElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  const currentTier = tiers[activeTier];

  // Check for mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Scroll tracking
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // Track active step bidirectionally
  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    const step = Math.floor(latest * STEP_COUNT);
    setActiveStep(Math.min(Math.max(step, 0), STEP_COUNT - 1));
  });

  // Reset to step 0 when tier changes
  const handleTierChange = (tier: TierKey) => {
    setActiveTier(tier);
  };

  const scrollHeight = isMobile ? "280vh" : "320vh";

  return (
    <section
      ref={containerRef}
      className="relative bg-[#0a0a0a]"
      style={{ height: scrollHeight }}
    >
      {/* Top fade transition from page background */}
      <div
        className="absolute top-0 left-0 right-0 h-32 pointer-events-none z-30"
        style={{
          background: "linear-gradient(to bottom, white 0%, transparent 100%)",
        }}
      />

      {/* Sticky container */}
      <div className="sticky top-0 h-screen overflow-hidden">
        {/* Floating particles background */}
        <FloatingParticles />

        {/* Dynamic spotlight */}
        <SpotlightOverlay
          scrollProgress={scrollYProgress}
          activeStep={activeStep}
        />

        {/* Content */}
        <div className="relative z-20 flex h-full flex-col items-center px-4 md:px-6">
          {/* Header */}
          <div className="pt-12 md:pt-16 text-center">
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-sm font-semibold uppercase tracking-[0.3em] text-gray-400"
            >
              How It Works
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="mt-3 font-serif text-3xl md:text-4xl lg:text-5xl text-white"
            >
              6 Simple Steps to Your Grant
            </motion.h2>
          </div>

          {/* Tier tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mt-6 md:mt-8"
          >
            <TierTabs activeTier={activeTier} onTierChange={handleTierChange} />
            <AnimatePresence mode="wait">
              <motion.p
                key={activeTier}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.3 }}
                className="mt-3 text-center text-sm text-gray-400"
              >
                {currentTier.tagline}
              </motion.p>
            </AnimatePresence>
          </motion.div>

          {/* Step cards container */}
          <div className="relative flex-1 w-full flex items-center justify-center mt-4">
            <div className="relative h-[280px] md:h-[320px] w-full max-w-xl">
              {currentTier.steps.map((step, index) => (
                <StepCard
                  key={`${activeTier}-${step.number}`}
                  step={step}
                  isActive={index === activeStep}
                  isPast={index < activeStep}
                  scrollProgress={scrollYProgress}
                  index={index}
                />
              ))}
            </div>
          </div>

          {/* Progress indicators */}
          <div className="hidden md:block">
            <ProgressIndicator totalSteps={STEP_COUNT} activeStep={activeStep} />
          </div>
          <MobileProgressDots totalSteps={STEP_COUNT} activeStep={activeStep} />

          {/* CTA Button */}
          <div className="absolute bottom-12 md:bottom-16 left-1/2 -translate-x-1/2 text-center">
            <Button
              asChild
              size="lg"
              className="bg-emerald-500 px-6 md:px-8 py-5 md:py-6 text-sm md:text-base font-semibold text-white shadow-lg shadow-emerald-500/25 hover:-translate-y-0.5 hover:bg-emerald-600 hover:shadow-xl hover:shadow-emerald-500/30 transition-all"
            >
              <Link href="/onboard/name">
                {currentTier.cta}
                <ArrowRight className="ml-2 h-4 w-4 md:h-5 md:w-5" />
              </Link>
            </Button>
            <p className="mt-3 md:mt-4 text-xs text-gray-500">
              *Court probate fees are set by BC government and paid separately
            </p>
          </div>
        </div>
      </div>

      {/* Bottom fade transition back to page background */}
      <div
        className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none z-30"
        style={{
          background: "linear-gradient(to top, white 0%, transparent 100%)",
        }}
      />
    </section>
  );
}
