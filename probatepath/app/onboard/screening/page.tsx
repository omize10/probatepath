"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  getOnboardState,
  saveOnboardState,
  savePendingIntake,
  calculateResult,
  shouldRedirectToSpecialist,
  type FitAnswers,
} from "@/lib/onboard/state";

type Question =
  | "will"
  | "witnessed"
  | "bc"
  | "original"
  | "beneficiaries"
  | "dispute"
  | "assets";

interface HelpText {
  title: string;
  content: string;
}

const HELP_TEXT: Record<Question, HelpText> = {
  will: {
    title: "Not sure about the will?",
    content: "A will is a legal document that says who gets what. Check with family members or look through important papers. If you can't find one, select 'Not sure'.",
  },
  witnessed: {
    title: "What does 'properly witnessed' mean?",
    content: "A valid will in BC must be signed by the will-maker in front of 2 witnesses, who then also sign the will. The witnesses cannot be beneficiaries.",
  },
  bc: {
    title: "Does it matter where the will was prepared?",
    content: "Wills from other provinces or countries can still be valid in BC, but may require additional steps. We can still help in most cases.",
  },
  original: {
    title: "Why do you need the original?",
    content: "The court requires the original signed will to grant probate. If you only have a copy, additional steps are needed to prove the will is valid.",
  },
  beneficiaries: {
    title: "Why does this matter?",
    content: "Keeping beneficiaries informed helps prevent surprises and potential disputes later. It's not required, but it's generally a good practice.",
  },
  dispute: {
    title: "What counts as a dispute?",
    content: "This includes disagreements about the will's validity, concerns about mental capacity when signed, undue influence claims, or family conflicts about distribution.",
  },
  assets: {
    title: "Why does asset location matter?",
    content: "We specialize in BC probate. Assets in other Canadian provinces can be handled through ancillary probate. International assets require specialized legal help.",
  },
};

export default function OnboardScreeningPage() {
  const router = useRouter();
  const [question, setQuestion] = useState<Question>("will");
  const [answers, setAnswers] = useState<FitAnswers>({});
  const [showHelp, setShowHelp] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const state = getOnboardState();
    // Require email+phone (combined step) and call-choice
    if (!state.email || !state.phone) {
      router.push("/onboard/email");
      return;
    }
    if (state.scheduledCall === undefined) {
      router.push("/onboard/call-choice");
      return;
    }
    if (state.fitAnswers) {
      setAnswers(state.fitAnswers);
    }
  }, [router]);

  const handleAnswer = <K extends keyof FitAnswers>(key: K, value: FitAnswers[K]) => {
    const updated = { ...answers, [key]: value };
    setAnswers(updated);
    saveOnboardState({ fitAnswers: updated });

    // Progressive save to server (fire-and-forget)
    savePendingIntake({ quizAnswers: updated });

    // Check for immediate Open Door Law triggers
    if (key === "potentialDisputes" && value === "yes") {
      saveOnboardState({ fitAnswers: updated, redirectedToSpecialist: true });
      router.push("/onboard/specialist");
      return;
    }
    if (key === "assetsOutsideBC" && value === "international") {
      saveOnboardState({ fitAnswers: updated, redirectedToSpecialist: true });
      router.push("/onboard/specialist");
      return;
    }

    // Auto-advance to next question
    setTimeout(() => {
      advanceQuestion(key, value, updated);
    }, 300);
  };

  const advanceQuestion = <K extends keyof FitAnswers>(
    currentKey: K,
    value: FitAnswers[K],
    updatedAnswers: FitAnswers
  ) => {
    switch (question) {
      case "will":
        if (value === "yes") {
          setQuestion("witnessed");
        } else {
          // Skip will-specific questions
          setQuestion("original");
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
        setQuestion("dispute");
        break;
      case "dispute":
        // If they said yes, they were already redirected
        setQuestion("assets");
        break;
      case "assets":
        // If they said international, they were already redirected
        finishScreening(updatedAnswers);
        break;
    }
  };

  const finishScreening = (finalAnswers: FitAnswers) => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      // Check if should redirect to specialist
      if (shouldRedirectToSpecialist(finalAnswers)) {
        saveOnboardState({
          fitAnswers: finalAnswers,
          redirectedToSpecialist: true,
        });
        router.push("/onboard/specialist");
        return;
      }

      const result = calculateResult(finalAnswers);
      saveOnboardState({
        fitAnswers: finalAnswers,
        grantType: result.grantType,
        recommendedTier: result.recommendedTier,
        redFlags: result.redFlags,
        fitCheckPassed: result.fitCheckPassed,
        showGrantOfAdministration: result.showGrantOfAdministration,
        recommendationReason: result.recommendationReason,
      });

      // Save recommendation to server
      savePendingIntake({
        quizAnswers: finalAnswers,
        recommendedTier: result.recommendedTier,
        grantType: result.grantType,
        redFlags: result.redFlags,
      });

      router.push("/onboard/result");
    } catch (error) {
      console.error("[screening] Error in finishScreening:", error);
      setIsSubmitting(false);
    }
  };

  const goBack = () => {
    switch (question) {
      case "will":
        router.push("/onboard/call-choice");
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
      case "dispute":
        setQuestion("beneficiaries");
        break;
      case "assets":
        setQuestion("dispute");
        break;
    }
  };

  const renderQuestion = () => {
    switch (question) {
      case "will":
        return (
          <QuestionCard
            title="Did your loved one have a will?"
            helpKey="will"
            showHelp={showHelp}
            setShowHelp={setShowHelp}
          >
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
          <QuestionCard
            title="Was the will signed by your loved one in the presence of 2 witnesses?"
            helpKey="witnessed"
            showHelp={showHelp}
            setShowHelp={setShowHelp}
          >
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
          <QuestionCard
            title="Was this will prepared in British Columbia?"
            helpKey="bc"
            showHelp={showHelp}
            setShowHelp={setShowHelp}
          >
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
          <QuestionCard
            title="Do you have the original will in your possession?"
            helpKey="original"
            showHelp={showHelp}
            setShowHelp={setShowHelp}
          >
            <p className="text-sm text-[color:var(--muted-ink)] mb-4">
              You&apos;ll need the original signed will for the probate process.
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
            </div>
          </QuestionCard>
        );

      case "beneficiaries":
        return (
          <QuestionCard
            title="Are the beneficiaries aware of what's in the will?"
            helpKey="beneficiaries"
            showHelp={showHelp}
            setShowHelp={setShowHelp}
          >
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
                No, I haven&apos;t shared it yet
              </OptionButton>
              <OptionButton
                selected={answers.beneficiariesAware === "partial"}
                onClick={() => handleAnswer("beneficiariesAware", "partial")}
              >
                Some know, some don&apos;t
              </OptionButton>
            </div>
          </QuestionCard>
        );

      case "dispute":
        return (
          <QuestionCard
            title="Do you believe there may be any reason for someone to dispute the will?"
            helpKey="dispute"
            showHelp={showHelp}
            setShowHelp={setShowHelp}
          >
            <div className="grid gap-3">
              <OptionButton
                selected={answers.potentialDisputes === "no"}
                onClick={() => handleAnswer("potentialDisputes", "no")}
              >
                No, I don&apos;t expect any disputes
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
                I&apos;m not sure
              </OptionButton>
            </div>
          </QuestionCard>
        );

      case "assets":
        return (
          <QuestionCard
            title="Did the deceased have any assets outside of British Columbia?"
            helpKey="assets"
            showHelp={showHelp}
            setShowHelp={setShowHelp}
          >
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
  };

  // Calculate progress through questions
  const getQuestionNumber = (): number => {
    const questionOrder: Question[] = answers.hasWill === "yes"
      ? ["will", "witnessed", "bc", "original", "beneficiaries", "dispute", "assets"]
      : ["will", "original", "beneficiaries", "dispute", "assets"];
    return questionOrder.indexOf(question) + 1;
  };

  const getTotalQuestions = (): number => {
    return answers.hasWill === "yes" ? 7 : 5;
  };

  return (
    <div className="space-y-8">
      <div className="space-y-2 text-center">
        <h1 className="font-serif text-3xl font-semibold text-[color:var(--brand)] sm:text-4xl">
          A few quick questions
        </h1>
        <p className="text-[color:var(--muted-ink)]">
          Before we get started, we need to confirm our service is right for you. This only takes about 2 minutes.
        </p>
        <p className="text-sm text-[color:var(--muted-ink)]">
          Question {getQuestionNumber()} of {getTotalQuestions()}
        </p>
      </div>

      {renderQuestion()}

      <Button variant="ghost" onClick={goBack} className="w-full">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>
    </div>
  );
}

function QuestionCard({
  title,
  helpKey,
  showHelp,
  setShowHelp,
  children,
}: {
  title: string;
  helpKey: Question;
  showHelp: string | null;
  setShowHelp: (key: string | null) => void;
  children: React.ReactNode;
}) {
  const helpText = HELP_TEXT[helpKey];

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-2">
        <h2 className="text-lg font-medium text-[color:var(--brand)]">{title}</h2>
        {helpText && (
          <button
            onClick={() => setShowHelp(showHelp === helpKey ? null : helpKey)}
            className="p-1 text-[color:var(--muted-ink)] hover:text-[color:var(--brand)]"
          >
            <HelpCircle className="h-5 w-5" />
          </button>
        )}
      </div>

      {showHelp === helpKey && helpText && (
        <div className="rounded-lg bg-blue-50 border border-blue-200 p-3 text-sm text-blue-800">
          <p className="font-medium">{helpText.title}</p>
          <p className="mt-1">{helpText.content}</p>
        </div>
      )}

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
