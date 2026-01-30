"use client";

import { useEffect, useState } from "react";

type TransparencyStep = {
  label: string;
  done: boolean;
};

type OperationalTransparencyProps = {
  title?: string;
  steps: TransparencyStep[];
  completionMessage?: string;
};

export function OperationalTransparency({
  title = "What we're doing",
  steps,
  completionMessage = "All steps complete.",
}: OperationalTransparencyProps) {
  const [visibleCount, setVisibleCount] = useState(0);

  useEffect(() => {
    // Animate steps appearing one by one
    const doneCount = steps.filter((s) => s.done).length;
    if (visibleCount < doneCount) {
      const timer = setTimeout(() => {
        setVisibleCount((prev) => prev + 1);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [visibleCount, steps]);

  const allDone = steps.every((s) => s.done);
  const currentIndex = steps.findIndex((s) => !s.done);

  return (
    <div className="rounded-2xl border border-[color:var(--border-muted)] bg-white p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-[color:var(--ink)] mb-3">{title}</h3>
      <div className="space-y-2">
        {steps.map((step, i) => {
          const isActive = i === currentIndex;
          const isVisible = step.done || isActive;

          return (
            <div
              key={step.label}
              className={`flex items-center gap-2.5 transition-all duration-500 ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
              }`}
            >
              {step.done ? (
                <svg className="h-4 w-4 text-green-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              ) : isActive ? (
                <div className="h-4 w-4 shrink-0 flex items-center justify-center">
                  <div className="h-2 w-2 rounded-full bg-[color:var(--brand)] animate-pulse" />
                </div>
              ) : (
                <div className="h-4 w-4 shrink-0 flex items-center justify-center">
                  <div className="h-1.5 w-1.5 rounded-full bg-gray-400" />
                </div>
              )}
              <span className={`text-xs ${
                step.done ? "text-[color:var(--text-tertiary)]" :
                isActive ? "text-[color:var(--ink)] font-medium" :
                "text-[color:var(--text-tertiary)]"
              }`}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
      {allDone && (
        <div className="mt-3 rounded-lg bg-green-50 px-3 py-2 text-xs text-green-700 font-medium">
          {completionMessage}
        </div>
      )}
    </div>
  );
}
