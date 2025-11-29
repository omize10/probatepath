"use client";

import { canonicalizeJourneyStatus, type JourneyStatus } from "@/lib/portal/journey";
import { cn } from "@/lib/utils";

type Props = {
  status: JourneyStatus;
};

export function JourneyStatusBadge({ status }: Props) {
  const normalized = canonicalizeJourneyStatus(status);
  const label = normalized === "done" ? "Done" : normalized === "in_progress" ? "In progress" : "Not started";
  const color =
    normalized === "done"
      ? "bg-[#e6f4ea] text-[#0f9d58]"
      : normalized === "in_progress"
        ? "bg-[#faf8f5] text-[color:var(--ink-muted)]"
        : "bg-[#edeff3] text-[color:var(--ink-muted)]";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide",
        color,
      )}
    >
      <span className="inline-block h-2 w-2 rounded-full bg-current" aria-hidden="true" />
      {label}
    </span>
  );
}
