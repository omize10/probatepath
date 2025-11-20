'use client';

import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface RightPanelInfo {
  title: string;
  body: string;
  tips: string[];
}

export type SaveStatus = "idle" | "saving" | "saved" | "error";

interface IntakeWizardLayoutProps {
  stepIndex: number;
  totalSteps: number;
  title: string;
  description: string;
  info: RightPanelInfo;
  children: ReactNode;
  onNext: () => void;
  onBack?: () => void;
  disableNext?: boolean;
  nextLabel?: string;
  backLabel?: string;
  saveStatus: SaveStatus;
  saveError?: string | null;
}

const lawyerLink = process.env.NEXT_PUBLIC_OPEN_DOOR_LAW_URL ?? "https://opendoorlaw.ca";

export function IntakeWizardLayout({
  stepIndex,
  totalSteps,
  title,
  description,
  info,
  children,
  onNext,
  onBack,
  disableNext,
  nextLabel = "Save and continue",
  backLabel = "Back",
  saveStatus,
  saveError,
}: IntakeWizardLayoutProps) {
  const statusCopy = getSaveCopy(saveStatus, saveError);

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-[color:var(--border-muted)] bg-white p-6 shadow-[0_30px_120px_-80px_rgba(15,23,42,0.5)]">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[color:var(--ink-muted)]">
          Step {stepIndex + 1} of {totalSteps}
        </p>
        <div className="mt-4 space-y-3">
          <h1 className="font-serif text-3xl text-[color:var(--ink)]">{title}</h1>
          <p className="text-sm text-[color:var(--ink-muted)]">{description}</p>
        </div>
      </div>
      <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
        <div className="space-y-6">
          {children}
          <div className="rounded-3xl border border-[color:var(--border-muted)] bg-white px-5 py-4 text-sm text-[color:var(--ink-muted)]">
            {statusCopy}
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
            <Button
              variant="outline"
              className={cn("sm:w-40", !onBack && "invisible")}
              onClick={onBack}
              disabled={!onBack}
            >
              {backLabel}
            </Button>
            <Button className="sm:w-48" onClick={onNext} disabled={Boolean(disableNext)}>
              {nextLabel}
            </Button>
          </div>
        </div>
        <aside className="space-y-4 rounded-3xl border border-[color:var(--border-muted)] bg-white p-6">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.35em] text-[color:var(--ink-muted)]">More information</p>
            <h2 className="font-serif text-xl text-[color:var(--ink)]">{info.title}</h2>
            <p className="text-sm text-[color:var(--ink-muted)]">{info.body}</p>
          </div>
          <ul className="list-disc space-y-2 pl-4 text-sm text-[color:var(--ink-muted)]">
            {info.tips.map((tip) => (
              <li key={tip}>{tip}</li>
            ))}
          </ul>
          <div className="rounded-2xl border border-dashed border-[color:var(--border-muted)] bg-[color:var(--bg-muted)] p-4 text-sm">
            <p className="font-semibold text-[color:var(--ink)]">Prefer a lawyer?</p>
            <p className="mt-1 text-[color:var(--ink-muted)]">
              Open Door Law handles probate matters across BC. We can refer you if you would rather a law firm take over.
            </p>
            <a
              href={lawyerLink}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex items-center text-sm font-semibold text-[color:var(--brand-navy)] underline-offset-4 hover:underline"
            >
              Learn about legal help →
            </a>
          </div>
        </aside>
      </div>
    </div>
  );
}

function getSaveCopy(status: SaveStatus, error?: string | null) {
  if (status === "saving") {
    return "Saving your answers…";
  }
  if (status === "saved") {
    return "All changes saved to your matter.";
  }
  if (status === "error") {
    return error ? `We’ll keep retrying. ${error}` : "Unable to sync right now. We’ll retry automatically.";
  }
  return "Your answers save automatically as you go.";
}
