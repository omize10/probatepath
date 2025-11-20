'use client';

import { useState } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import { downloadDocHtml } from "@/lib/portal/docs";

interface DocCardProps {
  title: string;
  description: string;
  html: string;
  disabled?: boolean;
  disabledReason?: string;
}

export function DocCard({ title, description, html, disabled, disabledReason }: DocCardProps) {
  const [previewOpen, setPreviewOpen] = useState(false);

  const handleDownload = () => {
    if (disabled) return;
    downloadDocHtml(`${title}.html`, html);
  };

  return (
    <div className="portal-card space-y-4 p-6">
      <div className="space-y-1">
        <p className="text-lg font-semibold text-[color:var(--ink)]">{title}</p>
        <p className="text-sm text-[color:var(--ink-muted)]">{description}</p>
        {disabled && disabledReason ? (
          <p className="text-xs text-[color:var(--warning)]">Finish: {disabledReason}</p>
        ) : null}
      </div>
      <div className="flex flex-wrap gap-3">
        <Button
          type="button"
          variant="secondary"
          onClick={() => setPreviewOpen(true)}
          disabled={disabled}
          title={disabled ? disabledReason : undefined}
        >
          Preview
        </Button>
        <Button type="button" onClick={handleDownload} disabled={disabled} title={disabled ? disabledReason : undefined}>
          Download
        </Button>
      </div>
      <DocPreviewModal open={previewOpen} html={html} title={title} onClose={() => setPreviewOpen(false)} />
    </div>
  );
}

interface DocPreviewModalProps {
  open: boolean;
  html: string;
  title: string;
  onClose: () => void;
}

function DocPreviewModal({ open, html, title, onClose }: DocPreviewModalProps) {
  if (!open || typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-6"
      role="dialog"
      aria-modal="true"
      aria-label={`${title} preview`}
    >
      <div className="max-h-[90vh] w-full max-w-3xl overflow-hidden rounded-3xl border border-white/15 bg-white text-[#0f172a] shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <p className="text-sm font-semibold text-[#0f172a]">{title}</p>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full px-3 py-1 text-sm font-semibold text-[#0f172a] transition hover:bg-slate-100"
          >
            Close
          </button>
        </div>
        <div className="max-h-[70vh] overflow-y-auto px-6 py-4 text-sm" dangerouslySetInnerHTML={{ __html: html }} />
      </div>
    </div>,
    document.body
  );
}
