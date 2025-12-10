'use client';

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PdfUpload } from "./PdfUpload";
import { PhotoUpload } from "./PhotoUpload";

interface WillUploadModalProps {
  open: boolean;
  onClose: () => void;
  onComplete: (extractionId: string) => void;
}

export function WillUploadModal({ open, onClose, onComplete }: WillUploadModalProps) {
  const [accepted, setAccepted] = useState(false);
  const [mode, setMode] = useState<"select" | "pdf" | "photo">("select");
  const [isAccepting, setIsAccepting] = useState(false);

  const handleAccept = async () => {
    setIsAccepting(true);
    try {
      const response = await fetch("/api/will-upload/disclaimer", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to record disclaimer acceptance");
      }

      setAccepted(true);
    } catch (error) {
      console.error("Disclaimer error:", error);
      alert("Failed to record disclaimer acceptance. Please try again.");
    } finally {
      setIsAccepting(false);
    }
  };

  const handleClose = () => {
    setAccepted(false);
    setMode("select");
    onClose();
  };

  const handleComplete = (extractionId: string) => {
    handleClose();
    onComplete(extractionId);
  };

  const handleBack = () => {
    setMode("select");
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        {!accepted ? (
          // Disclaimer screen
          <div className="space-y-6">
            <DialogHeader>
              <DialogTitle>Upload your will to help fill in these questions</DialogTitle>
              <DialogDescription>
                We will read your will to suggest answers. You will review everything before saving.
              </DialogDescription>
            </DialogHeader>

            <div className="rounded-2xl border-2 border-yellow-400 bg-yellow-50 p-4 space-y-3">
              <p className="text-sm font-semibold text-yellow-900">Important disclaimer:</p>
              <ul className="list-disc space-y-2 pl-5 text-sm text-yellow-900">
                <li>This does not verify if the will is valid.</li>
                <li>It does not interpret unclear terms.</li>
                <li>If you have questions about the will itself, talk to a BC lawyer.</li>
              </ul>
            </div>

            <div className="flex items-center gap-3 rounded-xl border border-[color:var(--border-muted)] bg-gray-50 p-4">
              <input
                type="checkbox"
                id="disclaimer-checkbox"
                className="h-4 w-4 rounded border-gray-300"
                onChange={(e) => {
                  if (e.target.checked) {
                    handleAccept();
                  }
                }}
                disabled={isAccepting}
              />
              <label htmlFor="disclaimer-checkbox" className="text-sm text-[color:var(--ink)]">
                I understand and want to continue
              </label>
            </div>
          </div>
        ) : mode === "select" ? (
          // Upload type selection
          <div className="space-y-6">
            <DialogHeader>
              <DialogTitle>How would you like to upload your will?</DialogTitle>
              <DialogDescription>
                Choose the format that matches your will document.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 sm:grid-cols-2">
              <button
                onClick={() => setMode("pdf")}
                className="flex flex-col items-center gap-3 rounded-2xl border-2 border-[color:var(--border-muted)] bg-white p-6 transition-all hover:border-blue-500 hover:bg-blue-50"
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
                  <svg className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="text-center">
                  <p className="font-semibold text-[color:var(--ink)]">Upload PDF</p>
                  <p className="text-sm text-[color:var(--ink-muted)]">For digital wills or scans</p>
                </div>
              </button>

              <button
                onClick={() => setMode("photo")}
                className="flex flex-col items-center gap-3 rounded-2xl border-2 border-[color:var(--border-muted)] bg-white p-6 transition-all hover:border-blue-500 hover:bg-blue-50"
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                  <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div className="text-center">
                  <p className="font-semibold text-[color:var(--ink)]">Upload Photos</p>
                  <p className="text-sm text-[color:var(--ink-muted)]">For paper wills</p>
                </div>
              </button>
            </div>
          </div>
        ) : mode === "pdf" ? (
          <PdfUpload onComplete={handleComplete} onBack={handleBack} />
        ) : (
          <PhotoUpload onComplete={handleComplete} onBack={handleBack} />
        )}
      </DialogContent>
    </Dialog>
  );
}
