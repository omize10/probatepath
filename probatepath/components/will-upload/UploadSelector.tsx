'use client';

import { useState } from "react";
import { PdfUpload } from "@/components/will-upload/PdfUpload";
import { PhotoUpload } from "@/components/will-upload/PhotoUpload";

export function UploadSelector() {
  const [acknowledged, setAcknowledged] = useState(false);
  const [logging, setLogging] = useState(false);
  const [selected, setSelected] = useState<"pdf" | "photo" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const handleComplete = (extractionId: string) => {
    console.info("Will extraction complete", extractionId);
  };

  const handleAcknowledge = async (checked: boolean) => {
    setError(null);
    setAcknowledged(checked);
    if (!checked) return;
    try {
      setLogging(true);
      const res = await fetch("/api/will-upload/disclaimer", { method: "POST" });
      if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        throw new Error(payload?.error ?? "Failed to record acceptance. Please try again.");
      }
    } catch (err) {
      setAcknowledged(false);
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLogging(false);
    }
  };

  return (
    <div className="space-y-8">
      <header className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-600">The will</p>
        <h1 className="text-2xl font-semibold text-[color:var(--ink)]">Upload your will to help fill in these questions</h1>
        <p className="text-sm text-slate-700">
          We&apos;ll read your will and suggest answers. You review everything before saving.
        </p>
      </header>

      <div className="rounded-lg border-l-4 border-amber-400 bg-amber-50 p-4 text-sm text-gray-800">
        <p className="flex items-start gap-2">
          <span aria-hidden className="text-xl">
            ⚠️
          </span>
          <span>
            Uploading your will helps us suggest information for your intake forms. We do not verify that your will is legally
            valid or interpret unclear terms. If you have questions about your will, consult a BC lawyer.
          </span>
        </p>
      </div>

      <label className="flex items-start gap-3 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-800">
        <input
          type="checkbox"
          className="mt-0.5 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          checked={acknowledged}
          onChange={(e) => handleAcknowledge(e.target.checked)}
          disabled={logging}
        />
        <span>I understand and want to continue</span>
      </label>

      {error ? (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      ) : null}

      <div className="grid gap-3 lg:grid-cols-2">
        <button
          type="button"
          onClick={() => setSelected("pdf")}
          disabled={!acknowledged || logging}
          className={`flex h-full flex-col rounded-xl border px-6 py-5 text-left shadow-sm transition ${
            selected === "pdf" ? "border-blue-600 ring-2 ring-blue-100" : "border-gray-200 hover:border-blue-400"
          } ${!acknowledged ? "cursor-not-allowed opacity-60" : "bg-white"}`}
        >
          <div className="text-3xl">📄</div>
          <p className="mt-3 text-lg font-semibold text-[color:var(--ink)]">Upload PDF</p>
          <p className="mt-1 text-sm text-slate-700">Best for digital wills or scans.</p>
        </button>
        <button
          type="button"
          onClick={() => setSelected("photo")}
          disabled={!acknowledged || logging}
          className={`flex h-full flex-col rounded-xl border px-6 py-5 text-left shadow-sm transition ${
            selected === "photo" ? "border-blue-600 ring-2 ring-blue-100" : "border-gray-200 hover:border-blue-400"
          } ${!acknowledged ? "cursor-not-allowed opacity-60" : "bg-white"}`}
        >
          <div className="text-3xl">📸</div>
          <p className="mt-3 text-lg font-semibold text-[color:var(--ink)]">Upload Photos</p>
          <p className="mt-1 text-sm text-slate-700">Best for paper wills.</p>
        </button>
      </div>

      {selected === "pdf" ? (
        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <PdfUpload onComplete={handleComplete} />
        </section>
      ) : null}

      {selected === "photo" ? (
        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <PhotoUpload onComplete={handleComplete} />
        </section>
      ) : null}
    </div>
  );
}
