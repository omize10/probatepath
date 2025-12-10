'use client';

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";

type PhotoItem = {
  file: File;
  preview: string;
  quality: "ok" | "low";
};

interface PhotoUploadProps {
  onComplete: (extractionId: string) => void;
  onBack?: () => void;
}

const MAX_FILE_SIZE_MB = Number(process.env.NEXT_PUBLIC_MAX_FILE_SIZE_MB ?? process.env.MAX_FILE_SIZE_MB ?? "10") || 10;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

async function evaluateQuality(file: File): Promise<"ok" | "low"> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const width = img.naturalWidth;
      const height = img.naturalHeight;
      URL.revokeObjectURL(url);
      if (width < 1000 || height < 1000) {
        resolve("low");
        return;
      }
      resolve("ok");
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve("low");
    };
    img.src = url;
  });
}

export function PhotoUpload({ onComplete, onBack }: PhotoUploadProps) {
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const pageCountLabel = useMemo(() => {
    if (!photos.length) return null;
    return `Selected ${photos.length} photo${photos.length === 1 ? "" : "s"}`;
  }, [photos.length]);

  useEffect(() => {
    return () => {
      photos.forEach((photo) => URL.revokeObjectURL(photo.preview));
    };
  }, [photos]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;

    const allowed = files.filter((file) => ["image/jpeg", "image/png", "image/jpg", "image/webp"].includes(file.type));
    if (!allowed.length) {
      setError("Only JPG or PNG images are supported.");
      return;
    }
    if (allowed.some((file) => file.size > MAX_FILE_SIZE_BYTES)) {
      setError(`Images must be smaller than ${MAX_FILE_SIZE_MB}MB each.`);
      return;
    }

    const limited = allowed.slice(0, 1); // keep v1 simple and stable
    const prepared: PhotoItem[] = [];
    for (const file of limited) {
      const quality = await evaluateQuality(file);
      prepared.push({ file, preview: URL.createObjectURL(file), quality });
    }
    setPhotos(prepared);
    setError(limited.length < allowed.length ? "For now we upload one photo at a time. Using the first image you selected." : null);
  };

  const handleUpload = async () => {
    if (!photos.length || uploading) return;
    setUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("file", photos[0]!.file);
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
      <div className="flex flex-col gap-3 rounded-lg border border-dashed border-gray-300 bg-gray-50 p-6 text-center sm:flex-row sm:items-center sm:justify-between sm:text-left">
        <div>
          <p className="text-lg font-semibold text-gray-900">Take photo / choose photos</p>
          <p className="text-sm text-gray-600">
            Take clear, well-lit photos of each page. Avoid shadows or glare. For now, upload the clearest page first.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <label className="inline-flex cursor-pointer items-center justify-center rounded-lg bg-[color:var(--brand)] px-4 py-2 text-sm font-semibold text-white transition hover:brightness-110">
            <input type="file" accept="image/*" capture="environment" className="hidden" multiple onChange={handleFileChange} />
            <span>Use camera</span>
          </label>
          <label className="inline-flex cursor-pointer items-center justify-center rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-black">
            <input type="file" accept="image/*" multiple className="hidden" onChange={handleFileChange} />
            <span>Choose files</span>
          </label>
        </div>
      </div>

      {pageCountLabel ? <p className="text-sm font-medium text-gray-800">{pageCountLabel}</p> : null}

      {photos.length ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {photos.map((photo, index) => (
            <div key={photo.preview} className="overflow-hidden rounded-lg bg-white shadow-sm">
              <div className="aspect-square overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={photo.preview} alt={`Photo ${index + 1}`} className="h-full w-full object-cover" />
              </div>
              <div className="flex items-center justify-between px-3 py-2 text-sm text-gray-800">
                <div className="font-medium">Photo {index + 1}</div>
                {photo.quality === "low" ? (
                  <div className="flex items-center gap-1 text-amber-700">
                    <span>⚠️</span>
                    <span>May be low quality</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-green-700">
                    <span>✓</span>
                    <span>Looks clear</span>
                  </div>
                )}
              </div>
            </div>
          ))}
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
          disabled={!photos.length || uploading}
        >
          {uploading ? "Uploading and reading..." : "Upload and read my will"}
        </Button>
      </div>
      <p className="text-xs text-gray-500">We automatically delete uploads after 90 days.</p>
    </div>
  );
}
