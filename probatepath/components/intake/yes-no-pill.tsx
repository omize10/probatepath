'use client';

import { cn } from "@/lib/utils";

interface YesNoPillProps {
  value?: "yes" | "no" | null;
  onChange: (value: "yes" | "no") => void;
  questionId: string;
  yesLabel?: string;
  noLabel?: string;
}

export function YesNoPill({ value, onChange, questionId, yesLabel = "YES", noLabel = "NO" }: YesNoPillProps) {
  return (
    <div className="flex flex-wrap gap-3" role="group" aria-labelledby={`${questionId}-label`}>
      {(["yes", "no"] as const).map((option) => {
        const selected = value === option;
        return (
          <button
            key={option}
            type="button"
            onClick={() => onChange(option)}
            className={cn(
              "h-14 w-32 rounded-full border-2 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--brand-navy)]",
              selected
                ? "border-[color:var(--brand-navy)] bg-[color:var(--brand-navy)] text-white"
                : "border-[color:var(--border-muted)] bg-white text-[color:var(--ink)] hover:border-[color:var(--brand-navy)]",
            )}
            aria-pressed={selected}
          >
            {option === "yes" ? yesLabel : noLabel}
          </button>
        );
      })}
    </div>
  );
}
