'use client';

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { QuestionCard } from "@/components/intake/question-card";
import { YesNoButtons } from "@/components/intake/patterns/yes-no-buttons";
import type { EligibilityAnswers } from "@/lib/intake/eligibility";
import { evaluateEligibility } from "@/lib/intake/eligibility";

const initialAnswers: EligibilityAnswers = {
  estateInBC: null,
  isExecutor: null,
  willStraightforward: null,
  assetsCommon: null,
  complexAssetsNotes: "",
};

type Decision = ReturnType<typeof evaluateEligibility> | null;

type EligibilityGateProps = {
  isAuthed?: boolean;
};

export function EligibilityGate({ isAuthed = false }: EligibilityGateProps) {
  const router = useRouter();
  const { status: sessionStatus } = useSession();
  const hasPortalSession = isAuthed || sessionStatus === "authenticated";
  const [answers, setAnswers] = useState<EligibilityAnswers>(initialAnswers);
  const [decision, setDecision] = useState<Decision>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const unanswered = useMemo(() => {
    const missing: string[] = [];
    if (!answers.estateInBC) missing.push("estateInBC");
    if (!answers.isExecutor) missing.push("isExecutor");
    if (!answers.willStraightforward) missing.push("willStraightforward");
    if (!answers.assetsCommon) missing.push("assetsCommon");
    return missing;
  }, [answers]);

  const showResult = decision !== null;

  const handleContinue = async () => {
    if (submitting) return;
    if (unanswered.length > 0) {
      setErrors(
        unanswered.reduce<Record<string, string>>((acc, key) => {
          acc[key] = "Please choose an answer to continue.";
          return acc;
        }, {}),
      );
      setDecision(null);
      return;
    }
    setErrors({});
    setSubmitError(null);
    const localDecision = evaluateEligibility(answers);
    setDecision(localDecision);

    if (!hasPortalSession) {
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch("/api/intake/right-fit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          answers: {
            estateInBC: answers.estateInBC!,
            isExecutor: answers.isExecutor!,
            willStraightforward: answers.willStraightforward!,
            assetsCommon: answers.assetsCommon!,
            complexAssetsNotes: answers.complexAssetsNotes ?? "",
          },
        }),
      });
      const payload = (await response.json().catch(() => null)) as
        | {
            matterId?: string;
            decision?: { status: "eligible" | "not_fit"; reasons?: string[] };
            error?: string;
          }
        | null;
      if (!response.ok || !payload?.matterId || !payload?.decision) {
        const message = payload?.error ?? "Unable to continue right now.";
        throw new Error(message);
      }
      const normalizedDecision: Decision =
        payload.decision.status === "eligible"
          ? { status: "eligible", reasons: payload.decision.reasons ?? [] }
          : { status: "not_fit", reasons: payload.decision.reasons ?? [] };
      setDecision(normalizedDecision);
      if (normalizedDecision.status === "eligible") {
        router.push("/portal/pricing");
        return;
      }
      router.push(`/matters/${payload.matterId}/not-a-fit`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to continue right now.";
      setSubmitError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const reset = () => {
    setDecision(null);
    setErrors({});
    setSubmitError(null);
  };

  return (
    <div className="mx-auto max-w-5xl space-y-10 py-12">
      <header className="space-y-5 rounded-3xl border border-[color:var(--border-muted)] bg-white p-8 text-[color:var(--ink)] shadow-[0_40px_160px_-120px_rgba(15,23,42,0.75)]">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[color:var(--ink-muted)]">Start here</p>
        <h1 className="font-serif text-4xl">Is ProbateDesk the right fit for you?</h1>
        <p className="text-base text-[color:var(--ink-muted)]">
          We start every file with a quick eligibility check so we can confirm ProbateDesk matches your estate before you dive into intake.
        </p>
      </header>

      <section className="space-y-6 rounded-3xl border border-[color:var(--border-muted)] bg-[color:var(--bg-surface)] p-6">
        <QuestionCard
          title="Is this estate being probated in British Columbia?"
          description="ProbateDesk is built solely for the Supreme Court of BC."
          helpers={[
            {
              title: "Why we ask this",
              body: "Our intake, checklists, and document assembly are mapped to BC rules. We’re not yet supporting other provinces.",
            },
            {
              title: "Where you find this",
              body: "If the deceased lived or died in BC and you’re filing at a BC Supreme Court registry, choose Yes.",
            },
          ]}
        >
          <YesNoButtons value={answers.estateInBC} onChange={(value) => setAnswers((prev) => ({ ...prev, estateInBC: value as EligibilityAnswers["estateInBC"] }))} />
          {errors.estateInBC ? <p className="text-xs text-[color:var(--error)]">{errors.estateInBC}</p> : null}
        </QuestionCard>

        <QuestionCard
          title="Are you the executor or court-appointed administrator?"
          description="We work directly with the person who has legal authority to apply."
          helpers={[
            {
              title: "Why we ask this",
              body: "To prepare filings and serve notices we must work with the named executor or administrator.",
            },
            {
              title: "Where you find this",
              body: "Your name appears in the will or the court order appointing you as administrator.",
            },
          ]}
        >
          <YesNoButtons
            value={answers.isExecutor}
            onChange={(value) => setAnswers((prev) => ({ ...prev, isExecutor: value as EligibilityAnswers["isExecutor"] }))}
            options={[
              { label: "Yes", value: "yes" },
              { label: "No", value: "no" },
              { label: "I'm helping the executor", value: "helper" },
            ]}
          />
          {errors.isExecutor ? <p className="text-xs text-[color:var(--error)]">{errors.isExecutor}</p> : null}
        </QuestionCard>

        <QuestionCard
          title="Is the will straightforward and not being disputed?"
          description="Disputed wills and litigation require full legal representation."
          helpers={[
            {
              title: "Why we ask this",
              body: "ProbateDesk is for uncontested estates. Active disputes or suspected challenges require full legal representation.",
            },
            {
              title: "Examples",
              body: "Red flags include: beneficiaries arguing about the will, threatened lawsuits, or allegations of undue influence.",
            },
          ]}
        >
          <YesNoButtons
            value={answers.willStraightforward}
            onChange={(value) => setAnswers((prev) => ({ ...prev, willStraightforward: value as EligibilityAnswers["willStraightforward"] }))}
            options={[
              { label: "Yes", value: "yes" },
              { label: "No", value: "no" },
              { label: "There is no will", value: "no-will" },
            ]}
          />
          {errors.willStraightforward ? <p className="text-xs text-[color:var(--error)]">{errors.willStraightforward}</p> : null}
        </QuestionCard>

        <QuestionCard
          title="Does the estate mostly consist of common assets?"
          description="Think home, Canadian bank or investment accounts, vehicle, and personal belongings."
          helpers={[
            {
              title: "Why we ask this",
              body: "Complex assets (private corporations, foreign property, intricate trusts) usually need bespoke legal work.",
            },
            {
              title: "Where you find this",
              body: "Review the will, statements, or conversations with the deceased’s financial advisor.",
            },
          ]}
        >
          <YesNoButtons
            value={answers.assetsCommon}
            onChange={(value) => setAnswers((prev) => ({ ...prev, assetsCommon: value as EligibilityAnswers["assetsCommon"] }))}
          />
          {answers.assetsCommon === "no" ? (
            <div className="space-y-2">
              <label className="text-sm font-semibold text-[color:var(--ink)]">Briefly describe the complex assets</label>
              <Textarea value={answers.complexAssetsNotes} onChange={(event) => setAnswers((prev) => ({ ...prev, complexAssetsNotes: event.target.value }))} />
            </div>
          ) : null}
          {errors.assetsCommon ? <p className="text-xs text-[color:var(--error)]">{errors.assetsCommon}</p> : null}
        </QuestionCard>

        <div className="flex flex-wrap items-center gap-4 pt-4">
          <Button size="lg" onClick={handleContinue} disabled={submitting}>
            {submitting ? "Processing..." : "Continue"}
          </Button>
          <button
            type="button"
            className="text-sm font-semibold text-[color:var(--brand)] underline-offset-4 hover:underline"
            onClick={() => {
              setAnswers(initialAnswers);
              reset();
            }}
          >
            Clear answers
          </button>
        </div>
        {submitError ? <p className="text-sm text-[color:var(--error)]">{submitError}</p> : null}
      </section>

      {showResult ? <EligibilityResult decision={decision!} onReset={reset} isAuthed={hasPortalSession} /> : null}
    </div>
  );
}

function EligibilityResult({
  decision,
  onReset,
  isAuthed,
}: {
  decision: NonNullable<Decision>;
  onReset: () => void;
  isAuthed: boolean;
}) {
  if (decision.status === "eligible") {
    return (
      <section className="space-y-4 rounded-3xl border border-[color:var(--border-muted)] bg-gradient-to-br from-[#e8ebf3] to-white p-8 shadow-[0_50px_150px_-120px_rgba(15,23,42,0.65)]">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[color:var(--ink-muted)]">You’re a fit</p>
        <h2 className="font-serif text-3xl text-[color:var(--brand)]">Good news — ProbateDesk looks right for this estate.</h2>
        <p className="text-base text-[color:var(--ink-muted)]">
          We’ll guide you through a calm, structured intake, build your Case Blueprint, and assemble the court-ready probate package.
        </p>
        <div>
          <p className="text-sm font-semibold text-[color:var(--ink)]">What happens now</p>
          <ul className="mt-2 list-disc space-y-2 pl-6 text-sm text-[color:var(--ink-muted)]">
            <li>Complete detailed intake (about 20 minutes, autosave on every field).</li>
            <li>Our specialists review for completeness and flag anything unusual.</li>
            <li>We prepare the Case Blueprint, notices, and filing instructions.</li>
          </ul>
        </div>
        {isAuthed ? (
          <div className="flex flex-wrap items-center gap-4">
            <Button size="lg" asChild>
              <Link href="/portal/pricing">Continue to pricing</Link>
            </Button>
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-4">
            <Button size="lg" asChild>
              <Link href={`/create-account?next=${encodeURIComponent("/start")}`}>Create your account to continue</Link>
            </Button>
            <Link href={`/login?next=${encodeURIComponent("/start")}`} className="text-sm font-semibold text-[color:var(--brand)] underline-offset-4 hover:underline">
              Already have an account? Sign in
            </Link>
          </div>
        )}
      </section>
    );
  }

  return (
    <section className="space-y-4 rounded-3xl border border-[color:var(--error)] bg-white p-8 shadow-[0_30px_120px_-100px_rgba(164,50,50,0.8)]">
      <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[color:var(--error)]">Needs a law firm</p>
      <h2 className="font-serif text-3xl text-[color:var(--error)]">We’re probably not the right fit for this estate.</h2>
      <p className="text-sm text-[color:var(--ink-muted)]">
        This estate looks like it needs full legal representation. We don’t want you to be under-supported, so we’ll match you with a law firm that can take the whole file.
      </p>
      <p className="text-sm text-[color:var(--ink-muted)]">Here’s what stood out from your answers:</p>
      <ul className="mt-2 list-disc space-y-2 pl-6 text-sm text-[color:var(--ink-muted)]">
        {decision.reasons.map((reason) => (
          <li key={reason}>{reason}</li>
        ))}
      </ul>
      {isAuthed ? (
        <p className="text-sm font-semibold text-[color:var(--ink)]">Hang tight—we’ll redirect you to our partner referral flow.</p>
      ) : (
        <div className="flex flex-wrap items-center gap-4">
          <Button size="lg" asChild>
            <Link href={`/create-account?next=${encodeURIComponent("/start")}`}>Create an account to continue</Link>
          </Button>
          <Link href={`/login?next=${encodeURIComponent("/start")}`} className="text-sm font-semibold text-[color:var(--brand)] underline-offset-4 hover:underline">
            Already have an account? Sign in
          </Link>
        </div>
      )}
      <button type="button" className="text-sm font-semibold text-[color:var(--brand)] underline-offset-4 hover:underline" onClick={onReset}>
        Go back and change my answers
      </button>
    </section>
  );
}
