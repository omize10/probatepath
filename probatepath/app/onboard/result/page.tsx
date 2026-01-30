"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence, useInView } from "framer-motion";
import {
  CheckCircle2,
  X,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Star,
  MessageCircle,
  AlertTriangle,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  getOnboardState,
  saveOnboardState,
  savePendingIntake,
  TIER_INFO,
  type Tier,
} from "@/lib/onboard/state";

// Animation variants
const headerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" as const },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 60 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring" as const, stiffness: 300, damping: 24, delay: 0.3 },
  },
};

const badgeVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { delay: 0.5, duration: 0.3 },
  },
};

const featureVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: { delay: 0.7 + i * 0.1, duration: 0.3 },
  }),
};

const checkVariants = {
  hidden: { scale: 0 },
  visible: (i: number) => ({
    scale: 1,
    transition: {
      delay: 0.7 + i * 0.1,
      type: "spring" as const,
      stiffness: 500,
      damping: 15,
    },
  }),
};

const otherOptionsVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { delay: 1.4, duration: 0.4 } },
};

const comparisonRowVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.4 },
  }),
};

const popupVariants = {
  hidden: { opacity: 0, y: 50, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring" as const, stiffness: 300, damping: 25 },
  },
  exit: {
    opacity: 0,
    y: 20,
    scale: 0.95,
    transition: { duration: 0.2 },
  },
};

// Comparison data
const lawyerDownsides = [
  "Hourly billing adds up",
  "Weeks of back-and-forth",
  "You're just another file",
  "Complex legal jargon",
  "No control over timeline",
];

const probateDeskBenefits = [
  "Know your cost upfront",
  "Documents ready in days",
  "Dedicated attention",
  "Plain English guidance",
  "You control the pace",
];

export default function OnboardResultPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [grantType, setGrantType] = useState<"probate" | "administration">("probate");
  const [recommendedTier, setRecommendedTier] = useState<Tier>("premium");
  const [selectedTier, setSelectedTier] = useState<Tier>("premium");
  const [showOtherOptions, setShowOtherOptions] = useState(false);
  const [showInactivityPopup, setShowInactivityPopup] = useState(false);
  const [showDowngradeWarning, setShowDowngradeWarning] = useState(false);
  const [pendingDowngradeTier, setPendingDowngradeTier] = useState<Tier | null>(null);
  const [showGrantOfAdmin, setShowGrantOfAdmin] = useState(false);
  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);
  const comparisonRef = useRef<HTMLDivElement>(null);
  const comparisonInView = useInView(comparisonRef, { once: true, amount: 0.3 });

  // Initialize state from localStorage
  useEffect(() => {
    const state = getOnboardState();

    // Check if they should be on specialist page
    if (state.redirectedToSpecialist) {
      router.push("/onboard/specialist");
      return;
    }

    // Check if they completed screening
    if (!state.fitAnswers) {
      router.push("/onboard/screening");
      return;
    }

    setGrantType(state.grantType || "probate");
    setRecommendedTier(state.recommendedTier || "premium");
    setSelectedTier(state.recommendedTier || "premium");
    setShowGrantOfAdmin(state.showGrantOfAdministration || false);

    // Brief loading state for smooth transition
    setTimeout(() => {
      setIsLoading(false);
    }, 300);
  }, [router]);

  // Inactivity popup timer
  const resetInactivityTimer = useCallback(() => {
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }
    setShowInactivityPopup(false);

    inactivityTimerRef.current = setTimeout(() => {
      setShowInactivityPopup(true);
    }, 30000);
  }, []);

  useEffect(() => {
    resetInactivityTimer();

    const handleActivity = () => {
      if (showInactivityPopup) return;
      resetInactivityTimer();
    };

    window.addEventListener("click", handleActivity);
    window.addEventListener("scroll", handleActivity);
    window.addEventListener("mousemove", handleActivity);

    return () => {
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
      window.removeEventListener("click", handleActivity);
      window.removeEventListener("scroll", handleActivity);
      window.removeEventListener("mousemove", handleActivity);
    };
  }, [resetInactivityTimer, showInactivityPopup]);

  const handleSelectTier = (tier: Tier) => {
    // If downgrading to basic when recommended is higher, show warning
    if (
      tier === "basic" &&
      recommendedTier !== "basic"
    ) {
      setPendingDowngradeTier(tier);
      setShowDowngradeWarning(true);
      return;
    }
    setSelectedTier(tier);
    saveOnboardState({ selectedTier: tier });
  };

  const confirmDowngrade = () => {
    if (pendingDowngradeTier) {
      setSelectedTier(pendingDowngradeTier);
      saveOnboardState({ selectedTier: pendingDowngradeTier });
    }
    setShowDowngradeWarning(false);
    setPendingDowngradeTier(null);
  };

  const cancelDowngrade = () => {
    setShowDowngradeWarning(false);
    setPendingDowngradeTier(null);
  };

  const handleContinue = () => {
    saveOnboardState({ selectedTier });
    savePendingIntake({ selectedTier });
    router.push("/onboard/create-account");
  };

  const dismissPopup = () => {
    setShowInactivityPopup(false);
    resetInactivityTimer();
  };

  if (isLoading) {
    return (
      <div className="space-y-8 text-center py-12">
        <div className="relative mx-auto w-16 h-16">
          <div className="absolute inset-0 rounded-full border-4 border-[color:var(--border-muted)]"></div>
          <div className="absolute inset-0 rounded-full border-4 border-[color:var(--brand)] border-t-transparent animate-spin"></div>
        </div>
        <p className="text-[color:var(--muted-ink)]">Preparing your results...</p>
      </div>
    );
  }

  // ─── Grant of Administration Screen ───
  // When user has no will, show special screen locked to White Glove
  if (showGrantOfAdmin) {
    const whiteGloveInfo = TIER_INFO.white_glove;
    return (
      <div className="space-y-8 pb-24 md:pb-8">
        <motion.div
          className="space-y-3 text-center"
          variants={headerVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="mx-auto w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
            <FileText className="w-8 h-8 text-[color:var(--brand)]" />
          </div>
          <h1 className="font-serif text-3xl font-semibold text-[color:var(--brand)] sm:text-4xl">
            You don&apos;t need probate
          </h1>
          <p className="text-[color:var(--muted-ink)] text-lg">
            Looks like you need a{" "}
            <span className="font-semibold text-[color:var(--brand)]">
              Grant of Administration
            </span>
            . Good news: we handle that too.
          </p>
          <p className="text-sm text-[color:var(--muted-ink)]">
            When there&apos;s no will, the court needs to appoint an administrator. This is a bit more involved than standard probate, so we recommend our full-service option.
          </p>
        </motion.div>

        {/* White Glove Card - Only option */}
        <motion.div
          className="relative rounded-2xl border-2 border-emerald-500 bg-white p-6 shadow-lg shadow-emerald-500/10"
          variants={cardVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div
            className="absolute -top-3 left-4 flex items-center gap-1.5 rounded-full bg-emerald-500 px-3 py-1 text-xs font-semibold text-white"
            variants={badgeVariants}
            initial="hidden"
            animate="visible"
          >
            <Star className="h-3 w-3 fill-current" />
            YOUR PLAN
          </motion.div>

          <div className="mt-2 space-y-4">
            <div>
              <h2 className="text-2xl font-bold text-[color:var(--brand)]">
                {whiteGloveInfo.name}
              </h2>
              <p className="text-sm text-[color:var(--muted-ink)]">
                {whiteGloveInfo.tagline}
              </p>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-[color:var(--brand)]">
                ${whiteGloveInfo.price.toLocaleString()}
              </span>
              <span className="text-sm text-[color:var(--muted-ink)]">
                Fixed price. No surprises.
              </span>
            </div>

            <div className="space-y-2 pt-2">
              {whiteGloveInfo.features.map((feature, index) => (
                <motion.div
                  key={feature}
                  className="flex items-start gap-3"
                  variants={featureVariants}
                  initial="hidden"
                  animate="visible"
                  custom={index}
                >
                  <motion.div
                    variants={checkVariants}
                    initial="hidden"
                    animate="visible"
                    custom={index}
                  >
                    <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-emerald-500" />
                  </motion.div>
                  <span className="text-sm text-[color:var(--ink)]">{feature}</span>
                </motion.div>
              ))}
            </div>

            <Button
              onClick={() => {
                setSelectedTier("white_glove");
                saveOnboardState({ selectedTier: "white_glove" });
                handleContinue();
              }}
              size="lg"
              className="w-full h-12 text-base font-semibold bg-emerald-600 hover:bg-emerald-700"
            >
              Continue with {whiteGloveInfo.name} - ${whiteGloveInfo.price.toLocaleString()}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </motion.div>

        {/* Disclaimer */}
        <div className="rounded-lg border border-[color:var(--border-muted)] bg-slate-50 p-4 space-y-1">
          <p className="text-xs font-medium text-[color:var(--text-tertiary)]">Service Eligibility Note</p>
          <p className="text-xs text-slate-500">
            If after payment we determine your estate cannot be served at your selected tier due to complexity, you will have two options: receive a full refund, or upgrade to a tier that can accommodate your needs. No hidden fees or surprises.
          </p>
        </div>

        {/* Sticky CTA for Mobile */}
        <div className="fixed bottom-0 left-0 right-0 border-t border-[color:var(--border-muted)] bg-white p-4 md:hidden">
          <Button
            onClick={() => {
              setSelectedTier("white_glove");
              saveOnboardState({ selectedTier: "white_glove" });
              handleContinue();
            }}
            size="lg"
            className="w-full h-12 font-semibold bg-emerald-600 hover:bg-emerald-700"
          >
            Continue - ${whiteGloveInfo.price.toLocaleString()}
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    );
  }

  // ─── Standard Result Page ───
  const tierInfo = TIER_INFO[selectedTier];
  const recommendedTierInfo = TIER_INFO[recommendedTier];

  return (
    <div className="space-y-4 pb-24 md:pb-8">
      {/* Header Section */}
      <motion.div
        className="space-y-2 text-center"
        variants={headerVariants}
        initial="hidden"
        animate="visible"
      >
        <h1 className="font-serif text-3xl font-semibold text-[color:var(--brand)] sm:text-4xl">
          Good news!
        </h1>
        <p className="text-[color:var(--muted-ink)]">
          Based on your answers, we can help. Here&apos;s what we recommend to get
          your{" "}
          <span className="font-medium text-[color:var(--brand)]">
            {grantType === "probate" ? "probate" : "administration"}
          </span>{" "}
          done quickly and affordably.
        </p>
      </motion.div>

      {/* Recommended Package Card */}
      <motion.div
        className="relative rounded-2xl border-2 border-emerald-500 bg-white p-6 shadow-lg shadow-emerald-500/10 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-500/20"
        variants={cardVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Recommended Badge */}
        <motion.div
          className="absolute -top-3 left-4 flex items-center gap-1.5 rounded-full bg-emerald-500 px-3 py-1 text-xs font-semibold text-white"
          variants={badgeVariants}
          initial="hidden"
          animate="visible"
        >
          <Star className="h-3 w-3 fill-current" />
          RECOMMENDED FOR YOU
        </motion.div>

        <div className="mt-2 space-y-4">
          {/* Package Name */}
          <div>
            <h2 className="text-2xl font-bold text-[color:var(--brand)]">
              {recommendedTierInfo.name}
            </h2>
            <p className="text-sm text-[color:var(--muted-ink)]">
              {recommendedTierInfo.tagline}
            </p>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold text-[color:var(--brand)]">
              ${recommendedTierInfo.price.toLocaleString()}
            </span>
            <span className="text-sm text-[color:var(--muted-ink)]">
              Fixed price. No surprises.
            </span>
          </div>

          {/* Features */}
          <div className="space-y-2 pt-2">
            {recommendedTierInfo.features.map((feature, index) => (
              <motion.div
                key={feature}
                className="flex items-start gap-3"
                variants={featureVariants}
                initial="hidden"
                animate="visible"
                custom={index}
              >
                <motion.div
                  variants={checkVariants}
                  initial="hidden"
                  animate="visible"
                  custom={index}
                >
                  <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-emerald-500" />
                </motion.div>
                <span className="text-sm text-[color:var(--ink)]">{feature}</span>
              </motion.div>
            ))}
          </div>

          {/* Select Button - directly beneath features */}
          <Button
            onClick={() => handleSelectTier(recommendedTier)}
            size="lg"
            className={`w-full h-12 text-base font-semibold transition-all ${
              selectedTier === recommendedTier
                ? "bg-emerald-600 hover:bg-emerald-700"
                : "bg-[color:var(--brand)] hover:bg-[color:var(--brand)]/90"
            }`}
          >
            {selectedTier === recommendedTier ? (
              <>
                <CheckCircle2 className="mr-2 h-5 w-5" />
                Selected
              </>
            ) : (
              <>
                Select {recommendedTierInfo.name}
                <ArrowRight className="ml-2 h-5 w-5" />
              </>
            )}
          </Button>
        </div>
      </motion.div>

      {/* Continue Button - Primary Action */}
      <motion.div
        variants={otherOptionsVariants}
        initial="hidden"
        animate="visible"
      >
        <Button
          onClick={handleContinue}
          size="lg"
          className="w-full h-14 text-lg font-semibold bg-emerald-600 hover:bg-emerald-700 transition-all hover:scale-[1.02]"
        >
          Continue with {tierInfo.name} - ${tierInfo.price.toLocaleString()}
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </motion.div>

      {/* Modify / Other Options Toggle */}
      <motion.div
        variants={otherOptionsVariants}
        initial="hidden"
        animate="visible"
      >
        <button
          onClick={() => setShowOtherOptions(!showOtherOptions)}
          className="flex w-full items-center justify-center gap-2 py-2 text-sm font-medium text-[color:var(--muted-ink)] transition-colors hover:text-[color:var(--brand)]"
        >
          {showOtherOptions ? (
            <>
              Hide other options
              <ChevronUp className="h-4 w-4" />
            </>
          ) : (
            <>
              Modify selection
              <ChevronDown className="h-4 w-4" />
            </>
          )}
        </button>
      </motion.div>

      {/* Other Options Expanded */}
      <AnimatePresence>
        {showOtherOptions && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="grid gap-4 md:grid-cols-3">
              {(Object.keys(TIER_INFO) as Tier[])
                .sort((a, b) => {
                  if (a === selectedTier) return -1;
                  if (b === selectedTier) return 1;
                  if (a === recommendedTier) return -1;
                  if (b === recommendedTier) return 1;
                  return 0;
                })
                .map((tierKey, index) => {
                const tier = TIER_INFO[tierKey];
                const isRecommended = tierKey === recommendedTier;
                const isSelected = tierKey === selectedTier;

                return (
                  <motion.div
                    key={tierKey}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`rounded-xl border-2 p-4 transition-all duration-300 hover:-translate-y-1 ${
                      isSelected
                        ? "border-emerald-500 bg-emerald-50 order-first"
                        : isRecommended
                        ? "border-[color:var(--brand)]/30 bg-white"
                        : "border-[color:var(--border-muted)] bg-white"
                    }`}
                  >
                    {isSelected && (
                      <span className="mb-2 inline-block rounded-full bg-emerald-500 px-2 py-0.5 text-xs font-medium text-white">
                        Your Selection
                      </span>
                    )}
                    {isRecommended && !isSelected && (
                      <span className="mb-2 inline-block rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
                        Recommended
                      </span>
                    )}
                    <h3 className="font-bold text-[color:var(--brand)]">
                      {tier.name}
                    </h3>
                    <p className="text-2xl font-bold text-[color:var(--brand)]">
                      ${tier.price.toLocaleString()}
                    </p>
                    <p className="mb-3 text-xs text-[color:var(--muted-ink)]">
                      {tier.tagline}
                    </p>
                    <ul className="mb-4 space-y-1">
                      {tier.features.slice(0, 4).map((feature) => (
                        <li
                          key={feature}
                          className="flex items-start gap-2 text-xs text-[color:var(--ink)]"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5 flex-shrink-0 text-emerald-500 mt-0.5" />
                          <span>{feature}</span>
                        </li>
                      ))}
                      {tier.features.length > 4 && (
                        <li className="text-xs text-[color:var(--muted-ink)] pl-5">
                          +{tier.features.length - 4} more
                        </li>
                      )}
                    </ul>
                    <Button
                      onClick={() => handleSelectTier(tierKey)}
                      size="sm"
                      variant={isSelected ? "primary" : "outline"}
                      className={`w-full ${
                        isSelected ? "bg-emerald-600 hover:bg-emerald-700" : ""
                      }`}
                    >
                      {isSelected ? "Selected" : "Select"}
                    </Button>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Price Comparison Section */}
      <div ref={comparisonRef} className="space-y-4">
        <motion.h3
          initial={{ opacity: 0 }}
          animate={comparisonInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center text-lg font-semibold text-[color:var(--brand)]"
        >
          Why thousands choose ProbateDesk over traditional lawyers
        </motion.h3>

        <div className="grid gap-4 md:grid-cols-2">
          {/* Lawyer Column */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={
              comparisonInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -30 }
            }
            transition={{ delay: 0.2, duration: 0.5 }}
            className="rounded-xl bg-slate-100 p-5"
          >
            <div className="mb-4">
              <p className="text-sm font-medium text-[color:var(--text-tertiary)]">
                Traditional Lawyer
              </p>
              <p className="text-2xl font-bold text-slate-800">
                $5,000 - $10,000+
              </p>
              <p className="text-xs text-[color:var(--text-tertiary)]">
                (and that&apos;s just the start)
              </p>
            </div>
            <div className="space-y-2">
              {lawyerDownsides.map((item, index) => (
                <motion.div
                  key={item}
                  className="flex items-center gap-2"
                  variants={comparisonRowVariants}
                  initial="hidden"
                  animate={comparisonInView ? "visible" : "hidden"}
                  custom={index}
                >
                  <X className="h-4 w-4 flex-shrink-0 text-red-500" />
                  <span className="text-sm text-[color:var(--text-secondary)]">{item}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* ProbateDesk Column */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={
              comparisonInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 30 }
            }
            transition={{ delay: 0.3, duration: 0.5 }}
            className="rounded-xl border-2 border-emerald-200 bg-emerald-50 p-5"
          >
            <div className="mb-4">
              <p className="text-sm font-medium text-emerald-600">ProbateDesk</p>
              <p className="text-2xl font-bold text-emerald-700">
                $799 - $2,499
              </p>
              <p className="text-xs text-emerald-600">Fixed price. Period.</p>
            </div>
            <div className="space-y-2">
              {probateDeskBenefits.map((item, index) => (
                <motion.div
                  key={item}
                  className="flex items-center gap-2"
                  variants={comparisonRowVariants}
                  initial="hidden"
                  animate={comparisonInView ? "visible" : "hidden"}
                  custom={index + 0.5}
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={comparisonInView ? { scale: 1 } : { scale: 0 }}
                    transition={{
                      delay: 0.5 + index * 0.1,
                      type: "spring",
                      stiffness: 500,
                      damping: 15,
                    }}
                  >
                    <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-emerald-500" />
                  </motion.div>
                  <span className="text-sm text-emerald-800">{item}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Disclaimer */}
        <p className="text-center text-xs text-[color:var(--text-tertiary)]">
          *Lawyer fees based on industry surveys of BC probate services. Actual
          costs vary. ProbateDesk pricing is fixed with no hidden fees.
        </p>
      </div>

      {/* Service Eligibility Disclaimer */}
      <div className="rounded-lg border border-[color:var(--border-muted)] bg-slate-50 p-4 space-y-1">
        <p className="text-xs font-medium text-[color:var(--text-tertiary)]">Service Eligibility Note</p>
        <p className="text-xs text-slate-500">
          If after payment we determine your estate cannot be served at your selected tier due to complexity, you will have two options: receive a full refund, or upgrade to a tier that can accommodate your needs. No hidden fees or surprises.
        </p>
      </div>

      {/* Sticky CTA for Mobile */}
      <div className="fixed bottom-0 left-0 right-0 border-t border-[color:var(--border-muted)] bg-white p-4 md:hidden">
        <Button
          onClick={handleContinue}
          size="lg"
          className="w-full h-12 font-semibold bg-emerald-600 hover:bg-emerald-700"
        >
          Continue - ${tierInfo.price.toLocaleString()}
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </div>

      {/* Downgrade Warning Modal */}
      <AnimatePresence>
        {showDowngradeWarning && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="max-w-md rounded-2xl bg-white p-6 shadow-2xl space-y-4"
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-[color:var(--brand)]">
                    Are you sure?
                  </h3>
                  <p className="mt-1 text-sm text-[color:var(--muted-ink)]">
                    Based on your answers, your situation may be more complex than what Basic covers. If we cannot accommodate your estate on the Basic tier, you will need to upgrade or receive a refund. Do you want to continue with Basic anyway?
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={confirmDowngrade}
                >
                  Yes, continue with Basic
                </Button>
                <Button
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                  onClick={cancelDowngrade}
                >
                  No, keep {TIER_INFO[recommendedTier].name}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Inactivity Popup */}
      <AnimatePresence>
        {showInactivityPopup && (
          <motion.div
            className="fixed bottom-20 right-4 z-50 max-w-sm rounded-xl border border-[color:var(--border-muted)] bg-white p-4 shadow-xl md:bottom-4"
            variants={popupVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <button
              onClick={dismissPopup}
              className="absolute right-2 top-2 text-slate-500 hover:text-[color:var(--text-secondary)]"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-emerald-100">
                <MessageCircle className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="font-medium text-[color:var(--brand)]">
                  Have questions?
                </p>
                <p className="mt-1 text-sm text-[color:var(--muted-ink)]">
                  Most executors save over{" "}
                  <span className="font-semibold text-emerald-600">$4,000</span>{" "}
                  compared to hiring a lawyer.
                </p>
                <div className="mt-3 flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      window.location.href = "mailto:hello@probatedesk.com";
                    }}
                  >
                    Chat with us
                  </Button>
                  <Button
                    size="sm"
                    className="bg-emerald-600 hover:bg-emerald-700"
                    onClick={() => {
                      dismissPopup();
                      handleContinue();
                    }}
                  >
                    Continue
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
