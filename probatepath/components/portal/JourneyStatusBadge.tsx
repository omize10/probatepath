"use client";

import type { JourneyStatus } from "@/lib/portal/journey";
import { cn } from "@/lib/utils";

type Props = {
  status: JourneyStatus;
};

export function JourneyStatusBadge({ status }: Props) {
  const label = status === "done" ? "Done" : status === "in_progress" ? "In progress" : "Not started";
  const color =
    status === "done"
      ? "bg-[#f0f3f7] text-[color:var(--brand-navy)]"
      : status === "in_progress"
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
