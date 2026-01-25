"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, CheckCircle2, AlertTriangle, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type QuizStep = "location" | "executor" | "will" | "complexity" | "result";

interface QuizAnswers {
  estateInBC: boolean | null;
  isExecutor: boolean | null;
  hasWill: boolean | null;
  willOriginal: boolean | null;
  hasRealProperty: boolean | null;
  estateValue: string | null;
  hasMinors: boolean | null;
  hasForeignAssets: boolean | null;
  expectsDispute: boolean | null;
  hasBusiness: boolean | null;
}

const TIER_PRICES = {
  basic: 799,
  standard: 1499,
  premium: 2499,
};

export default function QuizPage() {
  const [step, setStep] = useState<QuizStep>("location");
  const [answers, setAnswers] = useState<QuizAnswers>({
    estateInBC: null,
    isExecutor: null,
    hasWill: null,
    willOriginal: null,
    hasRealProperty: null,
    estateValue: null,
    hasMinors: null,
    hasForeignAssets: null,
    expectsDispute: null,
    hasBusiness: null,
  });

  const setAnswer = <K extends keyof QuizAnswers>(key: K, value: QuizAnswers[K]) => {
    setAnswers((prev) => ({ ...prev, [key]: value }));
  };

  const nextStep = () => {
    const steps: QuizStep[] = ["location", "executor", "will", "complexity", "result"];
    const currentIndex = steps.indexOf(step);
    if (currentIndex < steps.length - 1) {
      setStep(steps[currentIndex + 1]);
    }
  };

  const prevStep = () => {
    const steps: QuizStep[] = ["location", "executor", "will", "complexity", "result"];
    const currentIndex = steps.indexOf(step);
    if (currentIndex > 0) {
      setStep(steps[currentIndex - 1]);
    }
  };

  // Calculate result
  const calculateResult = () => {
    const issues: string[] = [];
    let qualified = true;
    let tier: "basic" | "standard" | "premium" = "basic";

    // Hard disqualifiers
    if (answers.estateInBC === false) {
      qualified = false;
      issues.push("We only handle estates located in British Columbia.");
    }
    if (answers.isExecutor === false) {
      qualified = false;
      issues.push("You need to be named as executor or administrator to use our service.");
    }
    if (answers.expectsDispute) {
      qualified = false;
      issues.push("Expected disputes require a lawyer's involvement.");
    }
    if (answers.hasForeignAssets) {
      qualified = false;
      issues.push("Foreign assets require specialized legal advice.");
    }

    // Tier determination
    if (qualified) {
      const estateValue = answers.estateValue;
      if (estateValue === ">500k" || estateValue === ">1m") {
        tier = "premium";
      } else if (estateValue === "100k-500k") {
        tier = "standard";
      }

      if (answers.hasRealProperty && tier === "basic") {
        tier = "standard";
      }
      if (answers.hasWill === false && tier === "basic") {
        tier = "standard";
      }
      if (answers.hasMinors) {
        if (tier !== "premium") tier = "standard";
        issues.push("Minor beneficiaries require additional documentation.");
      }
      if (answers.hasBusiness) {
        tier = "premium";
        issues.push("Business interests add complexity.");
      }
      if (answers.willOriginal === false) {
        if (tier === "basic") tier = "standard";
        issues.push("Missing original will requires additional steps.");
      }
    }

    const grantType = answers.hasWill ? "probate" : "administration";

    return { qualified, tier, issues, grantType };
  };

  const result = step === "result" ? calculateResult() : null;

  return (
    <div className="min-h-screen bg-[color:var(--bg-canvas)] py-12 px-4">
      <div className="mx-auto max-w-2xl">
        {/* Progress indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between text-sm text-[color:var(--muted-ink)]">
            <span>Quick eligibility check</span>
            <span>
              {step === "result"
                ? "Results"
                : `Step ${["location", "executor", "will", "complexity"].indexOf(step) + 1} of 4`}
            </span>
          </div>
          <div className="mt-2 h-2 w-full rounded-full bg-[color:var(--border-muted)]">
            <div
              className="h-full rounded-full bg-[color:var(--brand)] transition-all duration-300"
              style={{
                width: `${
                  step === "result"
                    ? 100
                    : ((["location", "executor", "will", "complexity"].indexOf(step) + 1) / 4) * 100
                }%`,
              }}
            />
          </div>
        </div>

        <Card className="border-[color:var(--border-muted)] shadow-[0_25px_60px_-50px_rgba(15,23,42,0.18)]">
          <CardHeader>
            {step === "location" && (
              <>
                <CardTitle className="text-2xl text-[color:var(--brand)]">The Situation</CardTitle>
                <CardDescription>Let's start with some basics about the estate.</CardDescription>
              </>
            )}
            {step === "executor" && (
              <>
                <CardTitle className="text-2xl text-[color:var(--brand)]">Your Role</CardTitle>
                <CardDescription>Tell us about your relationship to the estate.</CardDescription>
              </>
            )}
            {step === "will" && (
              <>
                <CardTitle className="text-2xl text-[color:var(--brand)]">The Will</CardTitle>
                <CardDescription>Information about the will (if any).</CardDescription>
              </>
            )}
            {step === "complexity" && (
              <>
                <CardTitle className="text-2xl text-[color:var(--brand)]">Estate Details</CardTitle>
                <CardDescription>A few more questions to understand your situation.</CardDescription>
              </>
            )}
            {step === "result" && (
              <>
                <CardTitle className="text-2xl text-[color:var(--brand)]">Your Results</CardTitle>
                <CardDescription>Based on your answers, here's what we recommend.</CardDescription>
              </>
            )}
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Location Step */}
            {step === "location" && (
              <>
                <div className="space-y-3">
                  <p className="text-sm font-medium text-[color:var(--brand)]">
                    Did the deceased live in British Columbia?
                  </p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Button
                      variant={answers.estateInBC === true ? "primary" : "outline"}
                      className="h-12 justify-start"
                      onClick={() => setAnswer("estateInBC", true)}
                    >
                      Yes, in BC
                    </Button>
                    <Button
                      variant={answers.estateInBC === false ? "primary" : "outline"}
                      className="h-12 justify-start"
                      onClick={() => setAnswer("estateInBC", false)}
                    >
                      No, outside BC
                    </Button>
                  </div>
                </div>
              </>
            )}

            {/* Executor Step */}
            {step === "executor" && (
              <>
                <div className="space-y-3">
                  <p className="text-sm font-medium text-[color:var(--brand)]">
                    Are you named as executor in the will, or handling the estate as an administrator?
                  </p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Button
                      variant={answers.isExecutor === true ? "primary" : "outline"}
                      className="h-12 justify-start"
                      onClick={() => setAnswer("isExecutor", true)}
                    >
                      Yes, I'm the executor
                    </Button>
                    <Button
                      variant={answers.isExecutor === false ? "primary" : "outline"}
                      className="h-12 justify-start"
                      onClick={() => setAnswer("isExecutor", false)}
                    >
                      No, I'm not
                    </Button>
                  </div>
                </div>
              </>
            )}

            {/* Will Step */}
            {step === "will" && (
              <>
                <div className="space-y-3">
                  <p className="text-sm font-medium text-[color:var(--brand)]">Was there a will?</p>
                  <div className="grid gap-3 sm:grid-cols-3">
                    <Button
                      variant={answers.hasWill === true ? "primary" : "outline"}
                      className="h-12 justify-start"
                      onClick={() => setAnswer("hasWill", true)}
                    >
                      Yes
                    </Button>
                    <Button
                      variant={answers.hasWill === false ? "primary" : "outline"}
                      className="h-12 justify-start"
                      onClick={() => setAnswer("hasWill", false)}
                    >
                      No will
                    </Button>
                  </div>
                </div>

                {answers.hasWill === true && (
                  <div className="space-y-3">
                    <p className="text-sm font-medium text-[color:var(--brand)]">
                      Do you have the original will?
                    </p>
                    <div className="grid gap-3 sm:grid-cols-3">
                      <Button
                        variant={answers.willOriginal === true ? "primary" : "outline"}
                        className="h-12 justify-start"
                        onClick={() => setAnswer("willOriginal", true)}
                      >
                        Yes, original
                      </Button>
                      <Button
                        variant={answers.willOriginal === false ? "primary" : "outline"}
                        className="h-12 justify-start"
                        onClick={() => setAnswer("willOriginal", false)}
                      >
                        Only a copy
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Complexity Step */}
            {step === "complexity" && (
              <>
                <div className="space-y-3">
                  <p className="text-sm font-medium text-[color:var(--brand)]">
                    Did they own property in BC?
                  </p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Button
                      variant={answers.hasRealProperty === true ? "primary" : "outline"}
                      className="h-12 justify-start"
                      onClick={() => setAnswer("hasRealProperty", true)}
                    >
                      Yes
                    </Button>
                    <Button
                      variant={answers.hasRealProperty === false ? "primary" : "outline"}
                      className="h-12 justify-start"
                      onClick={() => setAnswer("hasRealProperty", false)}
                    >
                      No
                    </Button>
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-sm font-medium text-[color:var(--brand)]">
                    Roughly, what's the total estate worth?
                  </p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {[
                      { value: "<25k", label: "Under $25,000" },
                      { value: "25k-100k", label: "$25,000 - $100,000" },
                      { value: "100k-500k", label: "$100,000 - $500,000" },
                      { value: ">500k", label: "Over $500,000" },
                    ].map((option) => (
                      <Button
                        key={option.value}
                        variant={answers.estateValue === option.value ? "primary" : "outline"}
                        className="h-12 justify-start"
                        onClick={() => setAnswer("estateValue", option.value)}
                      >
                        {option.label}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-sm font-medium text-[color:var(--brand)]">Quick checks:</p>
                  <div className="space-y-2">
                    {[
                      { key: "hasMinors", label: "Are any beneficiaries under 18?" },
                      { key: "hasForeignAssets", label: "Are there assets outside Canada?" },
                      { key: "expectsDispute", label: "Is anyone likely to dispute the estate?" },
                      { key: "hasBusiness", label: "Did they own a business?" },
                    ].map((item) => (
                      <div key={item.key} className="flex items-center justify-between rounded-lg border p-3">
                        <span className="text-sm">{item.label}</span>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant={answers[item.key as keyof QuizAnswers] === true ? "primary" : "outline"}
                            onClick={() => setAnswer(item.key as keyof QuizAnswers, true)}
                          >
                            Yes
                          </Button>
                          <Button
                            size="sm"
                            variant={answers[item.key as keyof QuizAnswers] === false ? "primary" : "outline"}
                            onClick={() => setAnswer(item.key as keyof QuizAnswers, false)}
                          >
                            No
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Result Step */}
            {step === "result" && result && (
              <>
                {result.qualified ? (
                  <div className="space-y-6">
                    <div className="flex items-start gap-4 rounded-lg bg-green-50 p-4">
                      <CheckCircle2 className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-green-900">Good news! You're a good fit.</p>
                        <p className="text-sm text-green-800 mt-1">
                          Based on your answers, you likely need{" "}
                          <strong>{result.grantType === "probate" ? "probate" : "administration"}</strong>.
                        </p>
                      </div>
                    </div>

                    {result.issues.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-[color:var(--muted-ink)]">Notes:</p>
                        <ul className="space-y-1 text-sm text-[color:var(--muted-ink)]">
                          {result.issues.map((issue, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <span className="text-amber-500 mt-1">*</span>
                              {issue}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="rounded-lg border-2 border-[color:var(--brand)] p-6">
                      <p className="text-sm text-[color:var(--muted-ink)]">Recommended package</p>
                      <p className="text-2xl font-semibold text-[color:var(--brand)] capitalize">
                        {result.tier} Package
                      </p>
                      <p className="text-3xl font-bold text-[color:var(--brand)] mt-1">
                        ${TIER_PRICES[result.tier]} CAD
                      </p>
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row">
                      <Button asChild size="lg" className="flex-1">
                        <Link href={`/create-account?tier=${result.tier}&path=${result.grantType}`}>
                          Get Started
                        </Link>
                      </Button>
                      <Button asChild size="lg" variant="outline" className="flex-1">
                        <Link href="/call">
                          <Phone className="h-4 w-4 mr-2" />
                          Talk to Expert
                        </Link>
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="flex items-start gap-4 rounded-lg bg-amber-50 p-4">
                      <AlertTriangle className="h-6 w-6 text-amber-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-amber-900">
                          Your situation may need additional support.
                        </p>
                        <p className="text-sm text-amber-800 mt-1">
                          Based on your answers, we recommend speaking with a probate lawyer.
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="text-sm font-medium text-[color:var(--muted-ink)]">Reasons:</p>
                      <ul className="space-y-1 text-sm text-[color:var(--muted-ink)]">
                        {result.issues.map((issue, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-red-500 mt-1">*</span>
                            {issue}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row">
                      <Button asChild size="lg" variant="outline" className="flex-1">
                        <Link href="/call">
                          <Phone className="h-4 w-4 mr-2" />
                          Talk to Us Anyway
                        </Link>
                      </Button>
                      <Button asChild size="lg" variant="secondary" className="flex-1">
                        <Link href="/">Back to Home</Link>
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Navigation */}
            {step !== "result" && (
              <div className="flex justify-between pt-4 border-t">
                <Button variant="ghost" onClick={prevStep} disabled={step === "location"}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
                <Button
                  onClick={nextStep}
                  disabled={
                    (step === "location" && answers.estateInBC === null) ||
                    (step === "executor" && answers.isExecutor === null) ||
                    (step === "will" && answers.hasWill === null) ||
                    (step === "complexity" && answers.estateValue === null)
                  }
                >
                  {step === "complexity" ? "See Results" : "Next"}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Back to home link */}
        <div className="mt-6 text-center">
          <Link href="/" className="text-sm text-[color:var(--muted-ink)] hover:text-[color:var(--brand)]">
            Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
