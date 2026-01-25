"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, ArrowLeft, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getOnboardState, saveOnboardState, calculateResult, type ScreeningAnswers } from "@/lib/onboard/state";

type Question = "will" | "original" | "dispute" | "foreign" | "value";

interface HelpText {
  title: string;
  content: string;
}

const HELP_TEXT: Record<string, HelpText> = {
  will: {
    title: "Not sure about the will?",
    content: "A will is a legal document that says who gets what. If you haven't found one, assume there isn't one.",
  },
  original: {
    title: "Why does this matter?",
    content: "The court requires the original will. If you only have a copy, extra steps are needed to prove it's valid.",
  },
  dispute: {
    title: "What counts as a dispute?",
    content: "Family disagreements about inheritance, someone challenging the will, or concerns about how assets are distributed.",
  },
  foreign: {
    title: "What are foreign assets?",
    content: "Property, bank accounts, or investments located outside Canada. These require special handling.",
  },
  value: {
    title: "How to estimate value?",
    content: "Add up property value, bank accounts, investments, and other assets. A rough estimate is fine.",
  },
};

export default function OnboardScreeningPage() {
  const router = useRouter();
  const [question, setQuestion] = useState<Question>("will");
  const [answers, setAnswers] = useState<ScreeningAnswers>({});
  const [showHelp, setShowHelp] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const state = getOnboardState();
    // Allow continuing from call page even without call
    if (!state.phone) {
      router.push("/onboard/phone");
      return;
    }
    if (state.screening) {
      setAnswers(state.screening);
    }
  }, [router]);

  const handleAnswer = (key: keyof ScreeningAnswers, value: boolean | string) => {
    const updated = { ...answers, [key]: value };
    setAnswers(updated);
    saveOnboardState({ screening: updated });

    // Auto-advance to next question
    setTimeout(() => {
      advanceQuestion(key, value, updated);
    }, 300);
  };

  const advanceQuestion = (currentKey: keyof ScreeningAnswers, value: boolean | string, updatedAnswers: ScreeningAnswers) => {
    // Validate that we actually got an answer before advancing
    if (value === undefined || value === null) {
      console.log('[screening] No valid answer, not advancing');
      return;
    }

    console.log('[screening] Advancing from', question, 'with value', value);

    switch (question) {
      case "will":
        if (value === true) {
          setQuestion("original");
        } else if (value === false) {
          // No will - skip original question
          setQuestion("dispute");
        }
        break;
      case "original":
        // Always advance to dispute
        setQuestion("dispute");
        break;
      case "dispute":
        if (value === true) {
          // Red flag - go to result immediately
          console.log('[screening] Dispute detected, finishing screening early');
          finishScreening({ ...updatedAnswers, expectsDispute: true });
        } else if (value === false) {
          setQuestion("foreign");
        }
        break;
      case "foreign":
        if (value === true) {
          // Red flag - go to result immediately
          console.log('[screening] Foreign assets detected, finishing screening early');
          finishScreening({ ...updatedAnswers, foreignAssets: true });
        } else if (value === false) {
          setQuestion("value");
        }
        break;
      case "value":
        // Any value here completes screening - THIS IS THE FINAL STEP
        console.log('[screening] Final question answered, finishing screening with complete answers:', updatedAnswers);
        finishScreening(updatedAnswers);
        break;
    }
  };

  const finishScreening = (finalAnswers: ScreeningAnswers) => {
    // GUARD: Prevent double submission
    if (isSubmitting) {
      console.log('[screening] Already submitting, preventing double submission');
      return;
    }
    
    console.log('[screening] finishScreening called with answers:', finalAnswers);
    setIsSubmitting(true);

    try {
      const result = calculateResult(finalAnswers);
      console.log('[screening] Calculated result:', result);
      
      saveOnboardState({
        screening: finalAnswers,
        grantType: result.grantType,
        recommendedTier: result.recommendedTier,
        redFlags: result.redFlags,
      });

      console.log('[screening] State saved, pushing to /onboard/result');
      router.push("/onboard/result");
    } catch (error) {
      console.error('[screening] Error in finishScreening:', error);
      setIsSubmitting(false);
    }
  };

  const goBack = () => {
    switch (question) {
      case "will":
        router.push("/onboard/call");
        break;
      case "original":
        setQuestion("will");
        break;
      case "dispute":
        if (answers.hasWill) {
          setQuestion("original");
        } else {
          setQuestion("will");
        }
        break;
      case "foreign":
        setQuestion("dispute");
        break;
      case "value":
        setQuestion("foreign");
        break;
    }
  };

  const renderQuestion = () => {
    switch (question) {
      case "will":
        return (
          <QuestionCard
            title="Did they have a will?"
            helpKey="will"
            showHelp={showHelp}
            setShowHelp={setShowHelp}
          >
            <div className="grid gap-3">
              <OptionButton
                selected={answers.hasWill === true}
                onClick={() => handleAnswer("hasWill", true)}
              >
                Yes, there's a will
              </OptionButton>
              <OptionButton
                selected={answers.hasWill === false}
                onClick={() => handleAnswer("hasWill", false)}
              >
                No, no will
              </OptionButton>
            </div>
          </QuestionCard>
        );

      case "original":
        return (
          <QuestionCard
            title="Do you have the original will?"
            helpKey="original"
            showHelp={showHelp}
            setShowHelp={setShowHelp}
          >
            <div className="grid gap-3">
              <OptionButton
                selected={answers.hasOriginal === true}
                onClick={() => handleAnswer("hasOriginal", true)}
              >
                Yes, I have the original
              </OptionButton>
              <OptionButton
                selected={answers.hasOriginal === false}
                onClick={() => handleAnswer("hasOriginal", false)}
              >
                No, only a copy
              </OptionButton>
            </div>
          </QuestionCard>
        );

      case "dispute":
        return (
          <QuestionCard
            title="Is anyone likely to disagree about the estate?"
            helpKey="dispute"
            showHelp={showHelp}
            setShowHelp={setShowHelp}
          >
            <div className="grid gap-3">
              <OptionButton
                selected={answers.expectsDispute === false}
                onClick={() => handleAnswer("expectsDispute", false)}
              >
                No, everyone's on the same page
              </OptionButton>
              <OptionButton
                selected={answers.expectsDispute === true}
                onClick={() => handleAnswer("expectsDispute", true)}
                variant="warning"
              >
                Yes, there may be disagreements
              </OptionButton>
            </div>
          </QuestionCard>
        );

      case "foreign":
        return (
          <QuestionCard
            title="Are there any assets outside Canada?"
            helpKey="foreign"
            showHelp={showHelp}
            setShowHelp={setShowHelp}
          >
            <div className="grid gap-3">
              <OptionButton
                selected={answers.foreignAssets === false}
                onClick={() => handleAnswer("foreignAssets", false)}
              >
                No, everything is in Canada
              </OptionButton>
              <OptionButton
                selected={answers.foreignAssets === true}
                onClick={() => handleAnswer("foreignAssets", true)}
                variant="warning"
              >
                Yes, there are foreign assets
              </OptionButton>
            </div>
          </QuestionCard>
        );

      case "value":
        return (
          <QuestionCard
            title="Roughly, what's the total estate worth?"
            helpKey="value"
            showHelp={showHelp}
            setShowHelp={setShowHelp}
          >
            <div className="grid gap-3">
              <OptionButton
                selected={answers.estateValue === "under_50k"}
                onClick={() => handleAnswer("estateValue", "under_50k")}
              >
                Under $50,000
              </OptionButton>
              <OptionButton
                selected={answers.estateValue === "50k_150k"}
                onClick={() => handleAnswer("estateValue", "50k_150k")}
              >
                $50,000 - $150,000
              </OptionButton>
              <OptionButton
                selected={answers.estateValue === "150k_500k"}
                onClick={() => handleAnswer("estateValue", "150k_500k")}
              >
                $150,000 - $500,000
              </OptionButton>
              <OptionButton
                selected={answers.estateValue === "over_500k"}
                onClick={() => handleAnswer("estateValue", "over_500k")}
              >
                Over $500,000
              </OptionButton>
            </div>
          </QuestionCard>
        );
    }
  };

  return (
    <div className="space-y-8">
      <div className="space-y-2 text-center">
        <h1 className="font-serif text-3xl font-semibold text-[color:var(--brand)] sm:text-4xl">
          A few quick questions
        </h1>
        <p className="text-[color:var(--muted-ink)]">
          This helps us understand your situation.
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
  helpKey: string;
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
      ? "border-[color:var(--brand)] bg-[color:var(--brand)]/5 text-[color:var(--brand)]"
      : "border-[color:var(--border-muted)] hover:border-[color:var(--brand)]/50",
    warning: selected
      ? "border-amber-500 bg-amber-50 text-amber-700"
      : "border-[color:var(--border-muted)] hover:border-amber-400",
  };

  return (
    <button className={`${baseClasses} ${variantClasses[variant]}`} onClick={onClick}>
      {children}
    </button>
  );
}
