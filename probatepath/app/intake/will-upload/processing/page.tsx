"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export const dynamic = "force-dynamic";

export default function ProcessingPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "processing">("idle");
  const [uploadId, setUploadId] = useState<string | null>(null);
  const [uploadIds, setUploadIds] = useState<string[]>([]);

  useEffect(() => {
    // Get params from URL
    const params = new URLSearchParams(window.location.search);
    const id = params.get("uploadId");
    const ids = params.get("uploadIds");

    setUploadId(id);
    setUploadIds(ids ? ids.split(",").map((i) => i.trim()).filter(Boolean) : []);
  }, []);

  useEffect(() => {
    if (!uploadId && uploadIds.length === 0) return;

    const start = async () => {
      setStatus("processing");
      try {
        const res = await fetch("/api/will-upload/extract", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            uploadId: uploadId ?? undefined,
            uploadIds: uploadIds.length ? uploadIds : undefined,
          }),
        });
        if (!res.ok) {
          const payload = await res.json().catch(() => ({}));
          throw new Error(payload?.error ?? "Failed to process your will.");
        }
        const payload = (await res.json()) as { extractionId?: string };
        if (!payload?.extractionId) {
          throw new Error("Extraction did not return an ID.");
        }
        router.push(`/intake/will-upload/results/${payload.extractionId}`);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
        setStatus("idle");
      }
    };
    start();
  }, [uploadId, uploadIds, router]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-white px-4 py-16">
      <div className="flex w-full max-w-md flex-col items-center rounded-2xl border border-gray-200 bg-white px-8 py-10 text-center shadow-sm">
        <div className="mb-6 h-14 w-14 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" aria-hidden />
        <h1 className="text-lg font-semibold text-[color:var(--ink)]">Reading your will...</h1>
        <p className="mt-2 text-sm text-slate-700">This may take 30-60 seconds.</p>
        {error ? (
          <div className="mt-4 w-full rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
            <button
              type="button"
              className="mt-3 w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
              onClick={() => location.reload()}
              disabled={status === "processing"}
            >
              Retry
            </button>
          </div>
        ) : null}
      </div>
    </main>
  );
}
