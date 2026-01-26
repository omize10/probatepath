"use client";

import { useRef, useState, useEffect, useMemo } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useInView,
} from "framer-motion";
import { ArrowRight, Check } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

type TierKey = "essentials" | "guided" | "concierge";

interface Step {
  number: number;
  title: string;
  description: string;
  icon: string;
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
        icon: "📝",
      },
      {
        number: 2,
        title: "We prepare your forms",
        description: "Court-ready documents delivered in 3 days",
        icon: "📋",
      },
      {
        number: 3,
        title: "Get notarized",
        description: "$50 notary credit or free at partner firms",
        icon: "✍️",
      },
      {
        number: 4,
        title: "Submit to court",
        description: "Follow our step-by-step filing guide",
        icon: "📤",
      },
      {
        number: 5,
        title: "Pay court fees",
        description: "Court fees based on estate value*",
        icon: "💳",
      },
      {
        number: 6,
        title: "Receive your grant",
        description: "Probate mailed directly to you",
        icon: "🎉",
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
        icon: "📞",
      },
      {
        number: 2,
        title: "Forms prepared + reviewed",
        description: "Specialist reviews for completeness",
        icon: "📋",
      },
      {
        number: 3,
        title: "Get notarized",
        description: "$50 notary credit or free at partner firms",
        icon: "✍️",
      },
      {
        number: 4,
        title: "Guided submission",
        description: "We explain exactly what to send and where",
        icon: "📤",
      },
      {
        number: 5,
        title: "Pay court fees",
        description: "Court fees based on estate value*",
        icon: "💳",
      },
      {
        number: 6,
        title: "Receive your grant",
        description: "We check in until it arrives",
        icon: "🎉",
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
        icon: "👤",
      },
      {
        number: 2,
        title: "Full document preparation",
        description: "Every form prepared and triple-checked",
        icon: "📋",
      },
      {
        number: 3,
        title: "We handle notarization",
        description: "Coordinated through our partner network",
        icon: "✍️",
      },
      {
        number: 4,
        title: "We submit for you",
        description: "Shepherded through the court registry",
        icon: "📤",
      },
      {
        number: 5,
        title: "Court fees coordinated",
        description: "We manage the payment process",
        icon: "💳",
      },
      {
        number: 6,
        title: "Grant delivered to you",
        description: "Hand-delivered with full closure support",
        icon: "🎉",
      },
    ],
    cta: "Start with Concierge",
  },
};

const tierOrder: TierKey[] = ["essentials", "guided", "concierge"];

const gradients = [
  "from-slate-900 via-slate-800 to-slate-900",
  "from-slate-900 via-emerald-950/30 to-slate-900",
  "from-slate-900 via-slate-800 to-slate-900",
  "from-slate-900 via-teal-950/30 to-slate-900",
  "from-slate-900 via-slate-800 to-slate-900",
  "from-emerald-950/30 via-slate-900 to-emerald-950/30",
];

// Background Effects Component
function BackgroundEffects({
  scrollYProgress,
  index,
}: {
  scrollYProgress: ReturnType<typeof useScroll>["scrollYProgress"];
  index: number;
}) {
  const particles = useMemo(
    () =>
      Array.from({ length: 15 }).map((_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 3 + 1,
        duration: Math.random() * 10 + 10,
      })),
    []
  );

  const glowScale = useTransform(
    scrollYProgress,
    [0.3, 0.5, 0.7],
    [0.5, 1.5, 0.5]
  );

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Radial gradient spotlight */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(16,185,129,0.12) 0%, transparent 70%)",
          scale: glowScale,
        }}
      />

      {/* Grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,1) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />

      {/* Floating particles */}
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full bg-emerald-500/20"
          style={{
            width: particle.size,
            height: particle.size,
            left: `${particle.x}%`,
            top: `${particle.y}%`,
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [0.2, 0.4, 0.2],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Corner accents */}
      <div className="absolute top-0 left-0 w-80 h-80 bg-gradient-to-br from-emerald-500/5 to-transparent" />
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-gradient-to-tl from-teal-500/5 to-transparent" />
    </div>
  );
}

// Spotlight Effect Component
function Spotlight({ isInView }: { isInView: boolean }) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  if (!isInView) return null;

  return (
    <motion.div
      className="pointer-events-none fixed inset-0 z-30"
      animate={{
        background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(16,185,129,0.04), transparent 40%)`,
      }}
      transition={{ type: "tween", ease: "easeOut", duration: 0.2 }}
    />
  );
}

// Progress Bar Component
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
    <div className="fixed top-[72px] left-0 right-0 z-40 h-1 bg-slate-800/50 backdrop-blur-sm">
      <motion.div
        className="h-full bg-gradient-to-r from-emerald-400 via-emerald-500 to-teal-400 origin-left"
        style={{ scaleX }}
      />
      {/* Step dots */}
      <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 flex justify-between px-8 md:px-16">
        {Array.from({ length: totalSteps }).map((_, i) => (
          <motion.div
            key={i}
            className="w-2 h-2 rounded-full bg-slate-600 transition-colors duration-300"
            style={{
              backgroundColor: useTransform(
                scrollYProgress,
                [i / totalSteps, (i + 0.5) / totalSteps],
                ["#475569", "#10b981"]
              ),
            }}
          />
        ))}
      </div>
    </div>
  );
}

// Full Screen Step Component
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

  // Parallax and 3D effects
  const y = useTransform(scrollYProgress, [0, 1], [100, -100]);
  const scale = useTransform(
    scrollYProgress,
    [0, 0.3, 0.5, 0.7, 1],
    [0.4, 0.85, 1.08, 1, 0.85]
  );
  const springScale = useSpring(scale, { stiffness: 200, damping: 25 });
  const rotateX = useTransform(scrollYProgress, [0, 0.5, 1], [20, 0, -20]);
  const springRotateX = useSpring(rotateX, { stiffness: 100, damping: 20 });
  const opacity = useTransform(
    scrollYProgress,
    [0, 0.2, 0.5, 0.8, 1],
    [0, 1, 1, 1, 0]
  );

  return (
    <section
      ref={ref}
      className={`relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-b ${gradients[index]}`}
      style={{ perspective: "1200px" }}
    >
      <BackgroundEffects scrollYProgress={scrollYProgress} index={index} />
      <Spotlight isInView={isInView} />

      {/* Main card */}
      <motion.div
        style={{
          scale: springScale,
          rotateX: springRotateX,
          y,
          opacity,
          transformStyle: "preserve-3d",
        }}
        className="relative z-10 w-[90vw] max-w-4xl px-4"
      >
        {/* Glowing border container */}
        <div className="relative group">
          {/* Animated glow */}
          <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-500 rounded-3xl blur-xl opacity-30 group-hover:opacity-60 transition-opacity duration-500" />
          <div
            className="absolute -inset-0.5 rounded-3xl opacity-20"
            style={{
              background:
                "linear-gradient(90deg, #10b981, #14b8a6, #10b981)",
              backgroundSize: "200% 100%",
              animation: "gradientMove 3s linear infinite",
            }}
          />

          {/* The card */}
          <motion.div
            className="relative bg-slate-900/95 backdrop-blur-2xl rounded-3xl p-8 md:p-16 border border-white/10"
            whileHover={{
              scale: 1.02,
              rotateY: 2,
              rotateX: -2,
            }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            {/* Step number */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={
                isInView
                  ? { scale: 1, rotate: 0 }
                  : { scale: 0, rotate: -180 }
              }
              transition={{
                type: "spring",
                stiffness: 200,
                damping: 15,
                delay: 0.2,
              }}
              className="absolute -top-6 -left-6 md:-top-10 md:-left-10"
            >
              <div className="relative">
                {/* Pulse ring */}
                <div className="absolute inset-0 rounded-full bg-emerald-500/30 animate-ping" />
                {/* Main circle */}
                <div className="relative w-16 h-16 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-2xl shadow-emerald-500/40">
                  <span className="text-3xl md:text-5xl font-black text-white">
                    {step.number}
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Icon */}
            <motion.div
              initial={{ scale: 0, y: 50 }}
              animate={
                isInView ? { scale: 1, y: 0 } : { scale: 0, y: 50 }
              }
              transition={{
                type: "spring",
                stiffness: 150,
                damping: 12,
                delay: 0.3,
              }}
              className="text-7xl md:text-8xl mb-6 text-center"
            >
              {step.icon}
            </motion.div>

            {/* Title */}
            <motion.h3
              initial={{ opacity: 0, y: 100, scale: 0.5 }}
              animate={
                isInView
                  ? { opacity: 1, y: 0, scale: 1 }
                  : { opacity: 0, y: 100, scale: 0.5 }
              }
              transition={{
                type: "spring",
                stiffness: 100,
                damping: 15,
                delay: 0.4,
              }}
              className="text-3xl md:text-5xl font-bold text-white text-center mb-4 leading-tight"
            >
              {step.title}
            </motion.h3>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 50 }}
              animate={
                isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }
              }
              transition={{
                type: "spring",
                stiffness: 80,
                damping: 15,
                delay: 0.5,
              }}
              className="text-lg md:text-xl text-slate-300 text-center max-w-2xl mx-auto"
            >
              {step.description}
            </motion.p>

            {/* Progress bar */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={isInView ? { scaleX: 1 } : { scaleX: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="mt-10 h-1 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full origin-left"
            />

            <motion.p
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : { opacity: 0 }}
              transition={{ delay: 0.7 }}
              className="text-center text-slate-500 mt-4 text-sm"
            >
              Step {step.number} of {totalSteps}
            </motion.p>

            {/* CTA on last step */}
            {isLastStep && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={
                  isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }
                }
                transition={{ delay: 0.8 }}
                className="mt-8 flex justify-center"
              >
                <Button
                  asChild
                  size="lg"
                  className="bg-emerald-500 px-8 py-6 text-base font-semibold text-white shadow-lg shadow-emerald-500/25 transition-all hover:-translate-y-0.5 hover:bg-emerald-600 hover:shadow-xl"
                >
                  <Link href="/onboard/name">
                    {cta}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </motion.div>
            )}
          </motion.div>
        </div>
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
            duration: 1,
          }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/50 flex flex-col items-center gap-2"
        >
          <span className="text-sm">Scroll to explore</span>
          <svg
            className="w-6 h-6 animate-bounce"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
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
    <div className="relative bg-slate-900">
      {/* Sticky Header */}
      <div className="sticky top-0 z-50 bg-slate-900/90 backdrop-blur-xl border-b border-white/10 py-6">
        <div className="mx-auto max-w-6xl px-6">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-6"
          >
            <p className="text-xs font-semibold tracking-[4px] text-emerald-400 uppercase mb-2">
              How It Works
            </p>
            <h2 className="text-2xl md:text-3xl font-bold text-white">
              6 Simple Steps to Your Grant
            </h2>
          </motion.div>

          {/* Tier Tabs */}
          <div className="flex justify-center">
            <div className="relative inline-flex rounded-2xl border border-white/10 bg-slate-800/50 p-1.5">
              {/* Sliding indicator */}
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
                    onClick={() => setActiveTier(tierKey)}
                    className="relative z-10 w-[120px] rounded-xl px-4 py-2 text-center transition-colors duration-200"
                  >
                    <span
                      className={`block text-sm font-semibold ${
                        isActive ? "text-white" : "text-slate-400"
                      }`}
                    >
                      {tier.name}
                    </span>
                    <span
                      className={`block text-xs ${
                        isActive ? "text-white/80" : "text-slate-500"
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
            className="text-center text-sm text-emerald-400 mt-4"
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
      <div className="bg-slate-900 py-8 text-center">
        <p className="text-xs text-slate-500">
          *Court probate fees are set by BC government and paid separately
        </p>
      </div>
    </div>
  );
}
