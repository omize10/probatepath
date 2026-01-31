'use client';

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { GrantOfAdministrationScreen } from "./grant-of-administration-screen";
import { getRecommendation, type RecommendedTier } from "@/lib/tier-recommendation";
import type { FitAnswers } from "@/lib/onboard/state";

type Question = "executor" | "will" | "witnessed" | "bc" | "original" | "beneficiaries" | "disputes" | "assets";

type EligibilityGateProps = {
  isAuthed?: boolean;
};

export function EligibilityGate({ isAuthed = false }: EligibilityGateProps) {
  const router = useRouter();
  const { status: sessionStatus } = useSession();
  const hasPortalSession = isAuthed || sessionStatus === "authenticated";

  const [question, setQuestion] = useState<Question>("executor");
  const [answers, setAnswers] = useState<Partial<FitAnswers> & { isExecutor?: "yes" | "no" }>({});
  const [showGrantAdmin, setShowGrantAdmin] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [recommendation, setRecommendation] = useState<ReturnType<typeof getRecommendation> | null>(null);

  // Calculate progress
  const getQuestionNumber = (): number => {
    const questionOrder: Question[] = answers.hasWill === "yes"
      ? ["executor", "will", "witnessed", "bc", "original", "beneficiaries", "disputes", "assets"]
      : ["executor", "will", "original", "beneficiaries", "disputes", "assets"];
    return questionOrder.indexOf(question) + 1;
  };

  const getTotalQuestions = (): number => {
    return answers.hasWill === "yes" ? 8 : 6;
  };

  const handleAnswer = <K extends keyof (FitAnswers & { isExecutor?: string })>(
    key: K,
    value: any
  ) => {
    const updated = { ...answers, [key]: value };
    setAnswers(updated);

    // Check for immediate disqualifications
    if (key === "isExecutor" && value === "no") {
      // Submit as not-a-fit and redirect
      submitNotAFit(updated);
      return;
    }

    // Check for Open Door Law triggers
    if (key === "potentialDisputes" && value === "yes") {
      submitNotAFit(updated);
      return;
    }

    if (key === "assetsOutsideBC" && value === "international") {
      submitNotAFit(updated);
      return;
    }

    // Auto-advance to next question
    setTimeout(() => {
      advanceQuestion(key, value, updated);
    }, 300);
  };

  const advanceQuestion = (
    currentKey: string,
    value: any,
    updatedAnswers: typeof answers
  ) => {
    switch (question) {
      case "executor":
        setQuestion("will");
        break;
      case "will":
        if (value === "no") {
          // Show Grant of Administration screen
          setShowGrantAdmin(true);
        } else {
          // Continue to next question
          if (value === "yes") {
            setQuestion("witnessed");
          } else {
            // not_sure - skip will questions
            setQuestion("original");
          }
        }
        break;
      case "witnessed":
        setQuestion("bc");
        break;
      case "bc":
        setQuestion("original");
        break;
      case "original":
        setQuestion("beneficiaries");
        break;
      case "beneficiaries":
        setQuestion("disputes");
        break;
      case "disputes":
        // If yes, they were redirected
        setQuestion("assets");
        break;
      case "assets":
        // If international, they were redirected
        // Finish screening
        finishScreening(updatedAnswers);
        break;
    }
  };

  const continueFromGrantAdmin = () => {
    setShowGrantAdmin(false);
    // Skip will-specific questions and go to original
    setQuestion("original");
  };

  const finishScreening = async (finalAnswers: typeof answers) => {
    if (submitting) return;
    setSubmitting(true);
    setSubmitError(null);

    try {
      // Extract FitAnswers (remove isExecutor)
      const { isExecutor, ...fitAnswers } = finalAnswers;

      // Get recommendation
      const rec = getRecommendation(fitAnswers as FitAnswers);
      setRecommendation(rec);

      // If Open Door Law, redirect immediately
      if (rec.tier === "open_door_law") {
        await submitNotAFit(finalAnswers);
        return;
      }

      // If authenticated, save to database
      if (hasPortalSession) {
        await saveRecommendation(fitAnswers as FitAnswers, rec);
      }
    } catch (error) {
      console.error("[screening] Error in finishScreening:", error);
      setSubmitError("Unable to process your answers. Please try again.");
      setSubmitting(false);
    }
  };

  const saveRecommendation = async (fitAnswers: FitAnswers, rec: ReturnType<typeof getRecommendation>) => {
    try {
      const response = await fetch("/api/intake/right-fit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          answers: fitAnswers,
          recommendation: {
            tier: rec.tier,
            reason: rec.reason,
            grantType: fitAnswers.hasWill === "no" ? "administration" : "probate",
          },
        }),
      });

      const payload = await response.json().catch(() => null);

      if (!response.ok || !payload?.matterId) {
        throw new Error(payload?.error ?? "Unable to save recommendation");
      }

      // Redirect to pricing with recommendation
      router.push("/portal/pricing");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to continue right now.";
      setSubmitError(message);
      setSubmitting(false);
    }
  };

  const submitNotAFit = async (finalAnswers: typeof answers) => {
    if (!hasPortalSession) {
      // Show result inline for non-authenticated users
      setRecommendation({
        tier: "open_door_law",
        reason: "This estate requires full legal representation.",
        showGrantOfAdministration: false,
        complicatedAnswerCount: 0,
        canDowngradeToBasic: false,
      });
      setSubmitting(false);
      return;
    }

    try {
      const { isExecutor, ...fitAnswers } = finalAnswers;

      const response = await fetch("/api/intake/right-fit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          answers: fitAnswers,
          recommendation: {
            tier: "open_door_law",
            reason: "This estate requires full legal representation.",
            grantType: fitAnswers.hasWill === "no" ? "administration" : "probate",
          },
        }),
      });

      const payload = await response.json().catch(() => null);

      if (response.ok && payload?.matterId) {
        router.push(`/matters/${payload.matterId}/not-a-fit`);
      } else {
        throw new Error(payload?.error ?? "Unable to continue");
      }
    } catch (error) {
      console.error("[screening] Error submitting not-a-fit:", error);
      setSubmitError("Unable to process your response. Please try again.");
      setSubmitting(false);
    }
  };

  const goBack = () => {
    switch (question) {
      case "executor":
        // Can't go back from first question
        break;
      case "will":
        setQuestion("executor");
        break;
      case "witnessed":
        setQuestion("will");
        break;
      case "bc":
        setQuestion("witnessed");
        break;
      case "original":
        if (answers.hasWill === "yes") {
          setQuestion("bc");
        } else {
          setQuestion("will");
        }
        break;
      case "beneficiaries":
        setQuestion("original");
        break;
      case "disputes":
        setQuestion("beneficiaries");
        break;
      case "assets":
        setQuestion("disputes");
        break;
    }
  };

  // Show Grant of Administration screen
  if (showGrantAdmin) {
    return (
      <div className="mx-auto max-w-5xl space-y-10 py-12">
        <GrantOfAdministrationScreen onContinue={continueFromGrantAdmin} />
      </div>
    );
  }

  // Show result screen
  if (recommendation) {
    return (
      <div className="mx-auto max-w-5xl space-y-10 py-12">
        <TierResultScreen
          recommendation={recommendation}
          isAuthed={hasPortalSession}
          submitting={submitting}
        />
      </div>
    );
  }

  // Show question flow
  return (
    <div className="mx-auto max-w-5xl space-y-10 py-12">
      <header className="space-y-5 rounded-3xl border border-[color:var(--border-muted)] bg-white p-8 text-[color:var(--ink)] shadow-[0_40px_160px_-120px_rgba(15,23,42,0.75)]">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[color:var(--ink-muted)]">
          Start here
        </p>
        <h1 className="font-serif text-4xl">Is ProbateDesk the right fit for you?</h1>
        <p className="text-base text-[color:var(--ink-muted)]">
          A few quick questions to recommend the best service tier for your situation.
        </p>
        <p className="text-sm text-[color:var(--muted-ink)]">
          Question {getQuestionNumber()} of {getTotalQuestions()}
        </p>
      </header>

      <section className="space-y-6 rounded-3xl border border-[color:var(--border-muted)] bg-[color:var(--bg-surface)] p-6">
        {renderQuestion()}

        {question !== "executor" && (
          <Button variant="ghost" onClick={goBack} className="w-full mt-4">
            Back
          </Button>
        )}

        {submitError && (
          <p className="text-sm text-[color:var(--error)] mt-4">{submitError}</p>
        )}
      </section>
    </div>
  );

  function renderQuestion() {
    switch (question) {
      case "executor":
        return (
          <QuestionCard title="Are you the executor?">
            <div className="grid gap-3">
              <OptionButton
                selected={answers.isExecutor === "yes"}
                onClick={() => handleAnswer("isExecutor", "yes")}
              >
                Yes
              </OptionButton>
              <OptionButton
                selected={answers.isExecutor === "no"}
                onClick={() => handleAnswer("isExecutor", "no")}
              >
                No
              </OptionButton>
            </div>
          </QuestionCard>
        );

      case "will":
        return (
          <QuestionCard title="Did your loved one have a will?">
            <div className="grid gap-3">
              <OptionButton
                selected={answers.hasWill === "yes"}
                onClick={() => handleAnswer("hasWill", "yes")}
              >
                Yes
              </OptionButton>
              <OptionButton
                selected={answers.hasWill === "no"}
                onClick={() => handleAnswer("hasWill", "no")}
              >
                No
              </OptionButton>
              <OptionButton
                selected={answers.hasWill === "not_sure"}
                onClick={() => handleAnswer("hasWill", "not_sure")}
              >
                Not sure
              </OptionButton>
            </div>
          </QuestionCard>
        );

      case "witnessed":
        return (
          <QuestionCard title="Was the will signed in the presence of two witnesses?">
            <div className="grid gap-3">
              <OptionButton
                selected={answers.willProperlyWitnessed === "yes"}
                onClick={() => handleAnswer("willProperlyWitnessed", "yes")}
              >
                Yes
              </OptionButton>
              <OptionButton
                selected={answers.willProperlyWitnessed === "no"}
                onClick={() => handleAnswer("willProperlyWitnessed", "no")}
              >
                No
              </OptionButton>
              <OptionButton
                selected={answers.willProperlyWitnessed === "not_sure"}
                onClick={() => handleAnswer("willProperlyWitnessed", "not_sure")}
              >
                Not sure
              </OptionButton>
            </div>
          </QuestionCard>
        );

      case "bc":
        return (
          <QuestionCard title="Was this will prepared in British Columbia?">
            <div className="grid gap-3">
              <OptionButton
                selected={answers.willPreparedInBC === "yes"}
                onClick={() => handleAnswer("willPreparedInBC", "yes")}
              >
                Yes
              </OptionButton>
              <OptionButton
                selected={answers.willPreparedInBC === "no"}
                onClick={() => handleAnswer("willPreparedInBC", "no")}
              >
                No
              </OptionButton>
              <OptionButton
                selected={answers.willPreparedInBC === "not_sure"}
                onClick={() => handleAnswer("willPreparedInBC", "not_sure")}
              >
                Not sure
              </OptionButton>
            </div>
          </QuestionCard>
        );

      case "original":
        return (
          <QuestionCard title="Do you have the original will in your possession?">
            <p className="text-sm text-[color:var(--muted-ink)] mb-4">
              You'll need the original signed will for the probate process.
            </p>
            <div className="grid gap-3">
              <OptionButton
                selected={answers.hasOriginalWill === true}
                onClick={() => handleAnswer("hasOriginalWill", true)}
              >
                Yes, I have the original
              </OptionButton>
              <OptionButton
                selected={answers.hasOriginalWill === false}
                onClick={() => handleAnswer("hasOriginalWill", false)}
              >
                No, I only have a copy
              </OptionButton>
              <OptionButton
                selected={answers.hasOriginalWill === "can_get_it"}
                onClick={() => handleAnswer("hasOriginalWill", "can_get_it")}
              >
                Not right now, but I can get it
              </OptionButton>
            </div>
            <p className="text-xs text-[color:var(--muted-ink)] mt-2">
              "I can get it" means you know where the original is and can retrieve it.
            </p>
          </QuestionCard>
        );

      case "beneficiaries":
        return (
          <QuestionCard title="Are the beneficiaries aware of the will?">
            <div className="grid gap-3">
              <OptionButton
                selected={answers.beneficiariesAware === "yes"}
                onClick={() => handleAnswer("beneficiariesAware", "yes")}
              >
                Yes, everyone knows
              </OptionButton>
              <OptionButton
                selected={answers.beneficiariesAware === "no"}
                onClick={() => handleAnswer("beneficiariesAware", "no")}
              >
                No, I haven't shared it yet
              </OptionButton>
              <OptionButton
                selected={answers.beneficiariesAware === "partial"}
                onClick={() => handleAnswer("beneficiariesAware", "partial")}
              >
                Some know, some don't
              </OptionButton>
            </div>
          </QuestionCard>
        );

      case "disputes":
        return (
          <QuestionCard title="Do you believe there may be any reason someone will dispute the will?">
            <div className="grid gap-3">
              <OptionButton
                selected={answers.potentialDisputes === "no"}
                onClick={() => handleAnswer("potentialDisputes", "no")}
              >
                No, I don't expect any disputes
              </OptionButton>
              <OptionButton
                selected={answers.potentialDisputes === "yes"}
                onClick={() => handleAnswer("potentialDisputes", "yes")}
                variant="warning"
              >
                Yes, there may be disputes
              </OptionButton>
              <OptionButton
                selected={answers.potentialDisputes === "not_sure"}
                onClick={() => handleAnswer("potentialDisputes", "not_sure")}
              >
                I'm not sure
              </OptionButton>
            </div>
          </QuestionCard>
        );

      case "assets":
        return (
          <QuestionCard title="Did the deceased have any assets outside of British Columbia?">
            <div className="grid gap-3">
              <OptionButton
                selected={answers.assetsOutsideBC === "none"}
                onClick={() => handleAnswer("assetsOutsideBC", "none")}
              >
                No, all assets are in BC
              </OptionButton>
              <OptionButton
                selected={answers.assetsOutsideBC === "other_provinces"}
                onClick={() => handleAnswer("assetsOutsideBC", "other_provinces")}
              >
                Yes, in other Canadian provinces
              </OptionButton>
              <OptionButton
                selected={answers.assetsOutsideBC === "international"}
                onClick={() => handleAnswer("assetsOutsideBC", "international")}
                variant="warning"
              >
                Yes, outside of Canada
              </OptionButton>
            </div>
          </QuestionCard>
        );
    }
  }
}

function QuestionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-medium text-[color:var(--brand)]">{title}</h2>
      {children}
    </div>
  );
}

function OptionButton({
  selected,
  onClick,
  variant = "default",
  children,
}: {
  selected: boolean;
  onClick: () => void;
  variant?: "default" | "warning";
  children: React.ReactNode;
}) {
  const baseClasses = "w-full h-14 text-left px-4 rounded-xl border-2 transition-all font-medium";
  const variantClasses = {
    default: selected
      ? "border-[color:var(--brand)] bg-blue-50 text-[color:var(--brand)]"
      : "border-[color:var(--border-muted)] text-[color:var(--ink)] hover:border-[color:var(--brand)]/50",
    warning: selected
      ? "border-amber-500 bg-amber-50 text-amber-700"
      : "border-[color:var(--border-muted)] text-[color:var(--ink)] hover:border-amber-400",
  };

  return (
    <button className={`${baseClasses} ${variantClasses[variant]}`} onClick={onClick}>
      {children}
    </button>
  );
}

function TierResultScreen({
  recommendation,
  isAuthed,
  submitting,
}: {
  recommendation: ReturnType<typeof getRecommendation>;
  isAuthed: boolean;
  submitting: boolean;
}) {
  const tierDisplayNames: Record<RecommendedTier, string> = {
    basic: "Basic",
    premium: "Standard", // Portal displays premium as Standard
    white_glove: "Premium", // Portal displays white_glove as Premium
    open_door_law: "Open Door Law",
  };

  const tierPrices: Record<Exclude<RecommendedTier, "open_door_law">, number> = {
    basic: 799,
    premium: 1499,
    white_glove: 2499,
  };

  if (recommendation.tier === "open_door_law") {
    return (
      <section className="space-y-4 rounded-3xl border border-[color:var(--error)] bg-white p-8 shadow-[0_30px_120px_-100px_rgba(164,50,50,0.8)]">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[color:var(--error)]">
          Needs Full Legal Representation
        </p>
        <h2 className="font-serif text-3xl text-[color:var(--error)]">
          This estate needs full legal representation
        </h2>
        <p className="text-base text-[color:var(--ink-muted)]">
          Based on your answers, this estate would be better served by a full-service law firm.
          We're connecting you with Open Door Law Corporation.
        </p>
        <p className="text-sm text-[color:var(--ink-muted)]">{recommendation.reason}</p>

        {isAuthed ? (
          <p className="text-sm font-semibold text-[color:var(--ink)]">
            Hang tight—we'll redirect you to our partner referral flow.
          </p>
        ) : (
          <div className="flex flex-wrap items-center gap-4">
            <Button size="lg" asChild>
              <Link href={`/create-account?next=${encodeURIComponent("/start")}`}>
                Create an account to continue
              </Link>
            </Button>
            <Link
              href={`/login?next=${encodeURIComponent("/start")}`}
              className="text-sm font-semibold text-[color:var(--brand)] underline-offset-4 hover:underline"
            >
              Already have an account? Sign in
            </Link>
          </div>
        )}
      </section>
    );
  }

  const tierName = tierDisplayNames[recommendation.tier];
  const tierPrice = tierPrices[recommendation.tier];

  return (
    <section className="space-y-6 rounded-3xl border border-[color:var(--border-muted)] bg-gradient-to-br from-[#e8ebf3] to-white p-8 shadow-[0_50px_150px_-120px_rgba(15,23,42,0.65)]">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[color:var(--ink-muted)]">
          Recommended for you
        </p>
        <h2 className="font-serif text-3xl text-[color:var(--brand)]">
          {recommendation.tier === "basic"
            ? "Good news — Basic is right for you"
            : `We recommend ${tierName} for your situation`}
        </h2>
      </div>

      <div className="space-y-4">
        {recommendation.tier === "basic" ? (
          <p className="text-base text-[color:var(--ink-muted)]">
            Your estate looks straightforward. Our Basic tier includes automated form generation
            and email support.
          </p>
        ) : (
          <>
            <p className="text-base text-[color:var(--ink-muted)]">{recommendation.reason}</p>
            <p className="text-base text-[color:var(--ink-muted)]">
              {recommendation.tier === "premium"
                ? "Based on your answers, you'd benefit from human document review and phone support. Most executors choose Standard for peace of mind."
                : "Your situation has some complexity that benefits from our white-glove service, including a dedicated coordinator and priority support."}
            </p>
          </>
        )}
      </div>

      <div className="rounded-lg bg-blue-50 border border-blue-200 p-4">
        <p className="text-sm font-medium text-blue-900">
          {tierName} — ${tierPrice}
        </p>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-blue-800">
          {recommendation.tier === "basic" && (
            <>
              <li>All court forms prepared</li>
              <li>Step-by-step instructions</li>
              <li>You review and file yourself</li>
              <li>Email support for questions</li>
            </>
          )}
          {recommendation.tier === "premium" && (
            <>
              <li>All court forms prepared</li>
              <li>Step-by-step filing instructions</li>
              <li>We review everything before you file</li>
              <li>Catch mistakes before the court does</li>
              <li>Email support throughout</li>
            </>
          )}
          {recommendation.tier === "white_glove" && (
            <>
              <li>One 30-min call with our lawyer</li>
              <li>We collect all information</li>
              <li>We prepare all court forms</li>
              <li>We handle all filing</li>
              <li>We deal with court if issues arise</li>
              <li>We guide you through distribution</li>
            </>
          )}
        </ul>
      </div>

      {isAuthed ? (
        <div className="flex items-center gap-4 pt-4">
          <Button size="lg" disabled={submitting} asChild>
            <Link href="/portal/pricing">Continue to pricing</Link>
          </Button>
        </div>
      ) : (
        <div className="flex flex-wrap items-center gap-4 pt-4">
          <Button size="lg" asChild>
            <Link href={`/create-account?next=${encodeURIComponent("/start")}`}>
              Create your account to continue
            </Link>
          </Button>
          <Link
            href={`/login?next=${encodeURIComponent("/start")}`}
            className="text-sm font-semibold text-[color:var(--brand)] underline-offset-4 hover:underline"
          >
            Already have an account? Sign in
          </Link>
        </div>
      )}
    </section>
  );
}
