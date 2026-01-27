"use client";

import type { ReactNode } from "react";
import Link from "next/link";

interface PortalWizardShellProps {
  title: string;
  subtitle?: string;
  step: number;
  totalSteps: number;
  children: ReactNode;
  primaryLabel: string;
  onNext?: () => void;
  primaryButtonOverride?: ReactNode;
  onBack?: () => void;
  backHref?: string;
  backLabel?: string;
}

export function PortalWizardShell({
  title,
  subtitle,
  step,
  totalSteps,
  children,
  primaryLabel,
  onNext,
  primaryButtonOverride,
  onBack,
  backHref,
  backLabel = "Back",
}: PortalWizardShellProps) {
  return (
    <div className="space-y-6 rounded-2xl bg-white px-6 py-6 shadow-sm">
      <div className="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-[color:var(--ink-muted)]">
        <span>
          Step {step + 1} of {totalSteps}
        </span>
      </div>
      <div className="space-y-2">
        <h2 className="text-lg font-semibold text-[color:var(--ink)]">{title}</h2>
        {subtitle ? <p className="text-sm text-slate-700">{subtitle}</p> : null}
      </div>
      <div className="text-sm text-gray-800">{children}</div>
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        {onBack || backHref ? (
          backHref ? (
            <Link href={backHref} className="text-sm font-semibold text-[color:var(--brand)] underline-offset-4 hover:underline">
              {backLabel}
            </Link>
          ) : (
            <button
              type="button"
              onClick={onBack}
              className="text-sm font-semibold text-[color:var(--brand)] underline-offset-4 hover:underline"
            >
              {backLabel}
            </button>
          )
        ) : (
          <div />
        )}
        {primaryButtonOverride ? (
          primaryButtonOverride
        ) : (
          <button
            type="button"
            onClick={onNext}
            className="inline-flex items-center rounded-full bg-gray-900 px-5 py-2 text-sm font-semibold text-white transition hover:bg-black"
          >
            {primaryLabel}
          </button>
        )}
      </div>
    </div>
  );
}
