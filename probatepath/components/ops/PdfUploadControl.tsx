"use client";

import { useState, useRef, DragEvent } from "react";
import { useRouter } from "next/navigation";

type UploadKind = "will_search" | "p1_notice" | "p1_packet" | "probate_package";

interface PdfUploadControlProps {
  label: string;
  kind: UploadKind;
  matterId: string;
  currentUrl?: string | null;
}

export function PdfUploadControl({ label, kind, matterId, currentUrl }: PdfUploadControlProps) {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const router = useRouter();

  const handleFiles = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    const file = fileList[0];
    setUploading(true);
    setError(null);
    try {
      const data = new FormData();
      data.append("file", file);
      data.append("kind", kind);
      const res = await fetch(`/api/cases/${matterId}/documents`, { method: "POST", body: data });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `Upload failed (${res.status})`);
      }
      router.refresh();
    } catch (err: any) {
      setError(err?.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const onDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragActive(false);
    handleFiles(event.dataTransfer?.files ?? null);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="font-semibold text-[color:var(--ink)]">{label}</span>
        {currentUrl ? (
          <a
            href={currentUrl}
            target="_blank"
            className="text-xs font-semibold text-[color:var(--brand)] underline-offset-4 hover:underline"
          >
            View PDF
          </a>
        ) : (
          <span className="text-xs text-[color:var(--ink-muted)]">No PDF uploaded</span>
        )}
      </div>
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          setDragActive(false);
        }}
        onDrop={onDrop}
        className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed px-4 py-5 text-sm transition ${
          dragActive ? "border-[color:var(--brand)] bg-[color:var(--bg-muted)] text-[color:var(--brand)]" : "border-[color:var(--border-muted)] text-[color:var(--ink-muted)]"
        }`}
      >
        <p className="text-center">
          {uploading ? "Uploading…" : "Click to upload or drag a PDF here"}
        </p>
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>
      {error ? <p className="text-xs text-red-600">{error}</p> : null}
    </div>
  );
}
