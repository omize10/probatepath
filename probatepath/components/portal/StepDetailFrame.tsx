"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { JourneyStatus, JourneyStepId } from "@/lib/portal/journey";
import { updateJourneyStepStatus } from "@/lib/portal/journey-actions";
import { JourneyStatusBadge } from "@/components/portal/JourneyStatusBadge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type InstructionsContent = {
  heading: string;
  body: string[];
  buttonLabel: string;
};

type ConfirmContent = {
  statement: string;
  description?: string;
  buttonLabel: string;
};

type StepDetailFrameProps = {
  stepId: JourneyStepId;
  stepNumber: number;
  title: string;
  subtitle: string;
  status: JourneyStatus;
  instructions: InstructionsContent;
  confirm: ConfirmContent;
  children: ReactNode;
};

export function StepDetailFrame({
  stepId,
  stepNumber,
  title,
  subtitle,
  status,
  instructions,
  confirm,
  children,
}: StepDetailFrameProps) {
  const router = useRouter();
  const [localStatus, setLocalStatus] = useState<JourneyStatus>(status);
  const [showDetails, setShowDetails] = useState(status !== "not_started");
  const [pending, startTransition] = useTransition();
  const summaryRef = useRef<HTMLDivElement>(null);

  const statusCopy = useMemo(() => {
    if (localStatus === "done") {
      return "Step complete";
    }
    if (localStatus === "in_progress") {
      return "Currently in progress";
    }
    return "Not started";
  }, [localStatus]);

  const handleReveal = () => {
    setShowDetails(true);
    if (localStatus === "not_started") {
      startTransition(async () => {
        await updateJourneyStepStatus(stepId, "in_progress");
        setLocalStatus("in_progress");
        router.refresh();
      });
    }
    requestAnimationFrame(() => {
      summaryRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  const handleConfirm = () => {
    startTransition(async () => {
      await updateJourneyStepStatus(stepId, "done");
      setLocalStatus("done");
      router.refresh();
    });
  };

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[color:var(--ink-muted)]">
          Step {stepNumber}
        </p>
        <div className="flex flex-wrap items-center gap-4">
          <div>
            <h1 className="font-serif text-3xl text-[color:var(--ink)]">{title}</h1>
            <p className="mt-2 text-base text-[color:var(--ink-muted)]">{subtitle}</p>
          </div>
          <JourneyStatusBadge status={localStatus} />
        </div>
        <p className="text-sm text-[color:var(--ink-muted)]">{statusCopy}</p>
      </header>

      <section className="portal-card space-y-4 rounded-[32px] border border-[color:var(--border-muted)] bg-[color:var(--bg-muted)]/40 p-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[color:var(--ink-muted)]">
            {instructions.heading}
          </p>
          <div className="mt-3 space-y-2 text-sm text-[color:var(--ink-muted)]">
            {instructions.body.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </div>
        <div>
          <Button type="button" onClick={handleReveal} disabled={pending} className="px-6 py-5 text-base">
            {instructions.buttonLabel}
          </Button>
        </div>
      </section>

      <section ref={summaryRef} className={cn("space-y-6", !showDetails && "hidden")}>
        {children}
        <div className="portal-card space-y-4 rounded-[32px] border border-[color:var(--border-muted)] p-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[color:var(--ink-muted)]">
              Confirmation
            </p>
            <p className="mt-3 text-lg font-semibold text-[color:var(--ink)]">{confirm.statement}</p>
            {confirm.description ? (
              <p className="mt-2 text-sm text-[color:var(--ink-muted)]">{confirm.description}</p>
            ) : null}
          </div>
          <div className="flex flex-wrap gap-3">
            <Button
              type="button"
              disabled={localStatus === "done" || pending}
              onClick={handleConfirm}
              className="px-6 py-5 text-base"
            >
              {localStatus === "done" ? "Marked complete" : confirm.buttonLabel}
            </Button>
            <Button type="button" variant="secondary" asChild>
              <Link href="/portal">Back to portal</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
