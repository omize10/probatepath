import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { canonicalizeJourneyStatus, journeySteps, type JourneyState } from "@/lib/portal/journey";
import { JourneyStatusBadge } from "@/components/portal/JourneyStatusBadge";
import { Button } from "@/components/ui/button";

type JourneyStepsListProps = {
  journey: JourneyState;
};

const statusCopy: Record<string, { headline: string; subcopy: string }> = {
  not_started: {
    headline: "Not started",
    subcopy: "Open the step to begin.",
  },
  in_progress: {
    headline: "In progress",
    subcopy: "You can pick up where you left off.",
  },
  done: {
    headline: "Completed",
    subcopy: "You can still reopen to review or edit.",
  },
};

function ctaLabelForStatus(status: string) {
  if (status === "done") return "Review";
  if (status === "in_progress") return "Resume";
  return "Start";
}

export function JourneyStepsList({ journey }: JourneyStepsListProps) {
  return (
    <div className="space-y-5">
      {journeySteps.map((step, index) => {
        const entry = journey[step.id];
        const status = canonicalizeJourneyStatus(entry?.status ?? "not_started");
        const href = `/portal/steps/${step.id}/flow`;
        const copy = statusCopy[status];
        const ctaLabel = ctaLabelForStatus(status);

        return (
          <div
            key={step.id}
            className="portal-card flex flex-col gap-5 rounded-[32px] border border-[color:var(--border-muted)] p-6 md:flex-row md:items-center md:justify-between"
          >
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[color:var(--ink-muted)]">
                Step {index + 1}
              </p>
              <div className="space-y-2">
                <JourneyStatusBadge status={status} />
                <h3 className="font-serif text-2xl text-[color:var(--ink)]">{step.title}</h3>
                <p className="text-sm text-[color:var(--ink-muted)]">{step.subtitle}</p>
              </div>
            </div>
            <div className="flex flex-col items-start gap-3 md:items-end">
              <div className="text-sm text-[color:var(--ink-muted)]">
                <p className="font-semibold text-[color:var(--ink)]">{copy?.headline}</p>
                <p>{copy?.subcopy}</p>
              </div>
              <div className="flex flex-col items-start gap-2 md:items-end">
                <Button asChild className="flex items-center gap-2">
                  <Link href={href}>
                    {ctaLabel}
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
