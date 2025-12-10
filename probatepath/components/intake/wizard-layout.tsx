'use client';

import { useState, type ReactNode } from "react";
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
  children: ReactNode;
  onNext: () => void;
  onBack?: () => void;
  disableNext?: boolean;
  nextLabel?: string;
  backLabel?: string;
  saveStatus: SaveStatus;
  saveError?: string | null;
  currentStepId?: string;
}

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
  currentStepId = "",
}: IntakeWizardLayoutProps) {
  const statusCopy = getSaveCopy(saveStatus, saveError);
  const [willUploadOpen, setWillUploadOpen] = useState(false);
  const [extractionId, setExtractionId] = useState<string | null>(null);

  // Determine if we should show the upload button on this step
  const shouldShowUploadButton =
    currentStepId.includes("will") ||
    currentStepId.includes("executor") ||
    currentStepId.includes("beneficiar") ||
    currentStepId.includes("family");

  const handleWillUploadComplete = (newExtractionId: string) => {
    setWillUploadOpen(false);
    setExtractionId(newExtractionId);
  };

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
        <aside className="space-y-4">
          {shouldShowUploadButton && (
            <div className="space-y-3 rounded-3xl border border-[color:var(--border-muted)] bg-white p-4">
              <Button
                onClick={() => setWillUploadOpen(true)}
                className="w-full"
              >
                <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                Upload your will
              </Button>
              <p className="text-xs text-center text-[color:var(--ink-muted)]">
                We will read it to help answer will questions
              </p>
            </div>
          )}

          <div className="rounded-3xl border border-[color:var(--border-muted)] bg-white p-6">
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
          </div>

          <div className="h-[500px]">
            <AskHelper currentStepId={currentStepId} extractionId={extractionId} />
          </div>
        </aside>
      </div>

      <WillUploadModal
        open={willUploadOpen}
        onClose={() => setWillUploadOpen(false)}
        onComplete={handleWillUploadComplete}
      />
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
