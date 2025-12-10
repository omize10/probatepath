'use client';

import Link from "next/link";
import { Upload } from "lucide-react";

export function WillUploadCTA() {
  return (
    <div className="rounded-2xl border border-[color:var(--border-muted)] bg-[color:var(--panel)] p-5 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-[0.3em] text-[color:var(--ink-muted)]">Save time</p>
          <h3 className="text-lg font-semibold text-[color:var(--ink)]">Upload your will to pre-fill answers</h3>
          <p className="text-sm text-[color:var(--ink-muted)]">
            We’ll read the will, draft answers, and you confirm before anything is saved.
          </p>
        </div>
        <Link
          href="/intake/will-upload"
          className="inline-flex items-center gap-2 rounded-full bg-[color:var(--brand)] px-4 py-2 text-sm font-semibold text-white transition hover:brightness-110"
        >
          <Upload className="h-4 w-4" />
          Upload will
        </Link>
      </div>
      <p className="mt-2 text-xs text-[color:var(--ink-muted)]">
        ⚠️ General information only. Not legal advice. Files auto-delete after 90 days.
      </p>
    </div>
  );
}
