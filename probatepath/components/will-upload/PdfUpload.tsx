'use client';

import { useState, type DragEvent } from "react";
import { Button } from "@/components/ui/button";

interface PdfUploadProps {
  onComplete: (extractionId: string) => void;
  onBack?: () => void;
}

const MAX_FILE_SIZE_MB = Number(process.env.NEXT_PUBLIC_MAX_FILE_SIZE_MB ?? process.env.MAX_FILE_SIZE_MB ?? "10") || 10;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

export function PdfUpload({ onComplete, onBack }: PdfUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);

  const onFileSelected = (incoming?: File) => {
    if (!incoming) return;
    if (incoming.type !== "application/pdf") {
      setError("Please upload a PDF file.");
      setFile(null);
      return;
    }
    if (incoming.size > MAX_FILE_SIZE_BYTES) {
      setError(`File must be smaller than ${MAX_FILE_SIZE_MB}MB.`);
      setFile(null);
      return;
    }
    setFile(incoming);
    setError(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    onFileSelected(selected ?? undefined);
  };

  const handleDrop = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);
    const dropped = e.dataTransfer.files?.[0];
    onFileSelected(dropped ?? undefined);
  };

  const handleUpload = async () => {
    if (!file || uploading) return;
    setUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/will-upload/upload", { method: "POST", body: formData });
      if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        throw new Error(payload?.error ?? "Upload failed.");
      }
      const payload = (await res.json()) as { uploadId?: string };
      if (!payload?.uploadId) {
        throw new Error("Upload did not return an ID.");
      }

      const extractRes = await fetch("/api/will-upload/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uploadId: payload.uploadId }),
      });
      if (!extractRes.ok) {
        const data = await extractRes.json().catch(() => ({}));
        throw new Error(data?.error ?? "Extraction failed.");
      }
      const extractPayload = (await extractRes.json()) as { extractionId?: string };
      const extractionId = extractPayload?.extractionId;
      if (!extractionId) {
        throw new Error("Extraction did not return an ID.");
      }
      setUploading(false);
      onComplete(extractionId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed. Please try again.");
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div
        className={`rounded-xl border-2 border-dashed p-10 text-center transition ${
          dragging ? "border-[color:var(--brand)] bg-[color:var(--brand)]/5" : "border-gray-300 hover:border-[color:var(--brand)]"
        }`}
      >
        <input type="file" accept=".pdf" onChange={handleFileChange} className="hidden" id="pdf-upload-input" />
        <label
          htmlFor="pdf-upload-input"
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={(e) => {
            e.preventDefault();
            setDragging(false);
          }}
          onDrop={handleDrop}
          className="block cursor-pointer space-y-2"
        >
          <div className="text-6xl">📄</div>
          <p className="text-lg font-semibold text-gray-900">Drag and drop your PDF here</p>
          <p className="text-sm text-gray-600">or click to browse</p>
          <p className="mt-2 text-xs text-gray-500">Maximum file size: {MAX_FILE_SIZE_MB}MB · Accepted format: PDF</p>
        </label>
      </div>

      {file ? (
        <div className="rounded-lg bg-green-50 px-4 py-3 text-sm text-gray-800">
          ✓ {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
        </div>
      ) : null}

      {error ? <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}

      <div className="flex flex-col gap-3 sm:flex-row">
        {onBack ? (
          <Button
            type="button"
            variant="outline"
            className="sm:w-36"
            onClick={onBack}
            disabled={uploading}
          >
            Back
          </Button>
        ) : null}
        <Button
          type="button"
          className="flex-1"
          onClick={handleUpload}
          disabled={!file || uploading}
        >
          {uploading ? "Uploading and reading..." : "Upload and read my will"}
        </Button>
      </div>
      <p className="text-xs text-gray-500">We automatically delete uploads after 90 days.</p>
    </div>
  );
}
