'use client';

import { useEffect, useState } from "react";
import { PdfUpload } from "@/components/will-upload/PdfUpload";
import { PhotoUpload } from "@/components/will-upload/PhotoUpload";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface WillUploadModalProps {
  open: boolean;
  onClose: () => void;
  onComplete: (extractionId: string) => void;
}

type Mode = "disclaimer" | "select" | "pdf" | "photo";

export function WillUploadModal({ open, onClose, onComplete }: WillUploadModalProps) {
  // AI upload disabled; keep modal closed
  if (!open) return null;
  const [mode, setMode] = useState<Mode>("disclaimer");
  const [accepted, setAccepted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setMode("disclaimer");
      setAccepted(false);
      setSubmitting(false);
      setError(null);
    }
  }, [open]);

  const handleAccept = async () => {
    if (accepted || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/will-upload/disclaimer", { method: "POST" });
      if (!res.ok) {
        throw new Error("Unable to record acceptance.");
      }
      setAccepted(true);
      setMode("select");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to continue. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const canGoBack = mode === "pdf" || mode === "photo";
  const backButton = canGoBack ? (
    <button
      type="button"
      onClick={() => setMode("select")}
      className="text-sm font-semibold text-[color:var(--brand)] transition hover:underline"
    >
      ← Back to choose type
    </button>
  ) : null;

  let body: JSX.Element;
  if (!accepted || mode === "disclaimer") {
    body = (
      <div className="space-y-6">
        <DialogHeader>
          <DialogTitle>Upload your will to help fill in these questions</DialogTitle>
          <DialogDescription>
            We&apos;ll read the text and suggest answers for this intake. You&apos;ll review everything before it is saved.
          </DialogDescription>
        </DialogHeader>
        <div className="rounded-lg border-l-4 border-amber-400 bg-amber-50 p-4 text-sm text-gray-800">
          <p className="font-semibold text-amber-900">Before you continue</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>We read the will to extract information. We do not verify if it is legally valid.</li>
            <li>We don&apos;t interpret unclear terms or resolve disputes.</li>
            <li>If you have questions about the will itself, speak with a BC lawyer.</li>
          </ul>
        </div>
        <label className="flex items-start gap-3 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-800">
          <input
            type="checkbox"
            className="mt-0.5 h-4 w-4 rounded border-gray-300 text-[color:var(--brand)] focus:ring-[color:var(--brand)]"
            checked={accepted}
            disabled={submitting}
            onChange={(e) => e.target.checked && handleAccept()}
          />
          <span>I understand and want to continue</span>
        </label>
        {error ? <p className="text-sm font-medium text-red-600">{error}</p> : null}
      </div>
    );
  } else if (mode === "select") {
    body = (
      <div className="space-y-6">
        <DialogHeader>
          <DialogTitle>How would you like to upload?</DialogTitle>
          <DialogDescription>Choose PDF or photos. Files are auto-deleted after 90 days.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 md:grid-cols-2">
          <button
            type="button"
            onClick={() => setMode("pdf")}
            className="flex flex-col rounded-2xl border-2 border-gray-200 p-6 text-left transition hover:border-[color:var(--brand)] hover:bg-[color:var(--brand)]/5"
          >
            <span className="mb-3 text-4xl" aria-hidden>
              📄
            </span>
            <span className="font-semibold text-gray-900">Upload PDF</span>
            <span className="mt-1 text-sm text-gray-600">Best for digital wills or full scans.</span>
          </button>
          <button
            type="button"
            onClick={() => setMode("photo")}
            className="flex flex-col rounded-2xl border-2 border-gray-200 p-6 text-left transition hover:border-[color:var(--brand)] hover:bg-[color:var(--brand)]/5"
          >
            <span className="mb-3 text-4xl" aria-hidden>
              📸
            </span>
            <span className="font-semibold text-gray-900">Upload photos</span>
            <span className="mt-1 text-sm text-gray-600">Use your camera or choose clear images.</span>
          </button>
        </div>
      </div>
    );
  } else if (mode === "pdf") {
    body = (
      <div className="space-y-4">
        <div className="flex items-center justify-between">{backButton}</div>
        <PdfUpload onComplete={onComplete} />
      </div>
    );
  } else {
    body = (
      <div className="space-y-4">
        <div className="flex items-center justify-between">{backButton}</div>
        <PhotoUpload onComplete={onComplete} />
      </div>
    );
  }

  return (
    <Dialog open={open} onOpenChange={(next) => (!next ? onClose() : null)}>
      <DialogContent className={cn(mode === "pdf" || mode === "photo" ? "max-w-4xl" : "max-w-3xl")}>
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700 transition hover:bg-gray-200"
        >
          Close
        </button>
        {body}
      </DialogContent>
    </Dialog>
  );
}
