'use client';

import { useState } from "react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { WillUploadModal } from "@/components/intake/WillUploadModal";
import { AskHelper } from "@/components/intake/AskHelper";

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
  currentStepId: string;
  children: ReactNode;
  onNext: () => void;
  onBack?: () => void;
  disableNext?: boolean;
  nextLabel?: string;
  backLabel?: string;
  saveStatus: SaveStatus;
  saveError?: string | null;
}

export function IntakeWizardLayout({
  stepIndex,
  totalSteps,
  title,
  description,
  info,
  currentStepId,
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
  const [willUploadOpen, setWillUploadOpen] = useState(false);
  const [extractionId, setExtractionId] = useState<string | null>(null);
  const [helperOpenKey, setHelperOpenKey] = useState<number | null>(null);

  const handleWillUploadComplete = (id: string) => {
    setWillUploadOpen(false);
    setExtractionId(id);
    setHelperOpenKey((key) => (key ?? 0) + 1);
  };

  const showWillUpload =
    currentStepId?.includes("will") || currentStepId?.includes("executor") || currentStepId?.includes("beneficiar");

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
          {showWillUpload ? (
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => setWillUploadOpen(true)}
                className="w-full rounded-lg bg-[color:var(--brand)] px-4 py-3 text-sm font-semibold text-white transition hover:brightness-110"
              >
                Upload your will
              </button>
              <p className="text-xs text-[color:var(--ink-muted)] text-center">We’ll help fill will-related answers.</p>
            </div>
          ) : null}
          <AskHelper currentStepId={currentStepId} extractionId={extractionId} autoOpenKey={helperOpenKey} />
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
        </aside>
      </div>
      <WillUploadModal open={willUploadOpen} onClose={() => setWillUploadOpen(false)} onComplete={handleWillUploadComplete} />
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
