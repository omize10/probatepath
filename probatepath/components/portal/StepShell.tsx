'use client';

import Image from "next/image";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";

interface StepShellProps {
  step: number;
  totalSteps: number;
  title: string;
  description: string;
  image: string;
  imageAlt: string;
  children: ReactNode;
  onNext?: () => void;
  onBack?: () => void;
  nextLabel?: string;
  backLabel?: string;
  nextDisabled?: boolean;
}

export function StepShell({
  step,
  totalSteps,
  title,
  description,
  image,
  imageAlt,
  children,
  onNext,
  onBack,
  nextLabel = "Next",
  backLabel = "Back",
  nextDisabled,
}: StepShellProps) {
  const progress = Math.min(100, Math.max(0, (step / totalSteps) * 100));

  return (
    <div className="portal-card grid min-h-[70vh] gap-8 p-6 lg:grid-cols-[1.05fr_0.95fr] lg:p-10">
      <div className="flex flex-col">
        <div className="space-y-4">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[color:var(--ink-muted)]">
            Step {step} of {totalSteps}
          </p>
          <h2 className="font-serif text-3xl leading-tight text-[color:var(--ink)]">{title}</h2>
          <p className="text-base text-[color:var(--ink-muted)]">{description}</p>
          <div className="h-2 w-full overflow-hidden rounded-full bg-[color:var(--bg-muted)]">
            <div className="h-full rounded-full bg-[color:var(--brand-ink)] transition-[width]" style={{ width: `${progress}%` }} />
          </div>
        </div>
        <div className="mt-8 flex-1 space-y-5 text-sm text-[color:var(--ink)]">{children}</div>
        <div className="mt-10 flex flex-wrap items-center gap-4">
          {onBack ? (
            <Button type="button" variant="secondary" onClick={onBack}>
              {backLabel}
            </Button>
          ) : null}
          {onNext ? (
            <Button type="button" disabled={nextDisabled} onClick={onNext}>
              {nextLabel}
            </Button>
          ) : null}
        </div>
      </div>
      <div className="relative overflow-hidden rounded-[32px] border border-[color:var(--border-muted)] bg-white">
        <Image src={image} alt={imageAlt} width={960} height={960} className="h-full w-full object-cover" />
      </div>
    </div>
  );
}
