'use client';

import { useState, useRef } from "react";
import { DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface PhotoUploadProps {
  onComplete: (extractionId: string) => void;
  onBack?: () => void;
}

const MAX_FILE_SIZE_MB = parseInt(process.env.NEXT_PUBLIC_MAX_FILE_SIZE_MB ?? "10", 10);
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

export function PhotoUpload({ onComplete, onBack }: PhotoUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<string>("");
  const [qualityWarning, setQualityWarning] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const checkImageQuality = (file: File) => {
    return new Promise<void>((resolve) => {
      const img = new Image();
      const url = URL.createObjectURL(file);

      img.onload = () => {
        URL.revokeObjectURL(url);

        if (img.width < 1000 || img.height < 1000) {
          setQualityWarning(
            "Image resolution is low. For best results, use a higher quality photo with good lighting."
          );
        } else {
          setQualityWarning(null);
        }

        resolve();
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
        resolve();
      };

      img.src = url;
    });
  };

  const handleFileSelect = async (selectedFile: File) => {
    setError(null);
    setQualityWarning(null);

    // Validate file type
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/heic", "image/heif"];
    if (!validTypes.includes(selectedFile.type.toLowerCase())) {
      setError("Please select a JPEG or PNG image.");
      return;
    }

    // Validate file size
    if (selectedFile.size > MAX_FILE_SIZE_BYTES) {
      setError(`File size exceeds ${MAX_FILE_SIZE_MB}MB limit.`);
      return;
    }

    setFile(selectedFile);

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(selectedFile);

    // Check quality
    await checkImageQuality(selectedFile);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      handleFileSelect(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    setError(null);
    setProgress("Uploading your photo...");

    try {
      // Upload file
      const formData = new FormData();
      formData.append("file", file);

      const uploadResponse = await fetch("/api/will-upload/upload", {
        method: "POST",
        body: formData,
      });

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json();
        throw new Error(errorData.error || "Upload failed");
      }

      const { uploadId } = await uploadResponse.json();

      // Extract data
      setProgress("Reading your will with AI...");

      const extractResponse = await fetch("/api/will-upload/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uploadId }),
      });

      if (!extractResponse.ok) {
        const errorData = await extractResponse.json();
        throw new Error(errorData.error || "Extraction failed");
      }

      const { extractionId } = await extractResponse.json();

      setProgress("Done!");
      onComplete(extractionId);
    } catch (error) {
      console.error("Upload error:", error);
      setError(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setIsUploading(false);
      setProgress("");
    }
  };

  const isMobile = typeof window !== "undefined" && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  return (
    <div className="space-y-6">
      {onBack && (
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm text-[color:var(--ink-muted)] hover:text-[color:var(--ink)]"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>
      )}

      <DialogHeader>
        <DialogTitle>Upload Photo of Will</DialogTitle>
        <DialogDescription>
          Take a clear photo of your will or select from your photo library. Make sure all text is readable.
        </DialogDescription>
      </DialogHeader>

      {!file ? (
        <div className="space-y-4">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/heic,image/heif"
            capture={isMobile ? "environment" : undefined}
            onChange={handleFileInputChange}
            className="hidden"
          />

          {isMobile ? (
            <Button
              onClick={() => fileInputRef.current?.click()}
              className="w-full"
            >
              <svg className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Take Photo
            </Button>
          ) : (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="cursor-pointer rounded-2xl border-2 border-dashed border-[color:var(--border-muted)] bg-gray-50 p-8 text-center transition-all hover:border-blue-400"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-center">
                  <svg className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="font-semibold text-[color:var(--ink)]">Click to select an image</p>
                <p className="text-sm text-[color:var(--ink-muted)]">JPEG or PNG, maximum {MAX_FILE_SIZE_MB}MB</p>
              </div>
            </div>
          )}

          <div className="rounded-xl border border-blue-300 bg-blue-50 p-4 space-y-2">
            <p className="text-sm font-semibold text-blue-900">Tips for best results:</p>
            <ul className="list-disc space-y-1 pl-5 text-sm text-blue-900">
              <li>Use good lighting</li>
              <li>Make sure all text is clear and readable</li>
              <li>Avoid shadows and glare</li>
              <li>Capture the entire page</li>
            </ul>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="relative rounded-xl border border-[color:var(--border-muted)] overflow-hidden">
            {preview && (
              <img src={preview} alt="Will preview" className="w-full max-h-96 object-contain" />
            )}
          </div>

          <div className="flex items-center justify-between rounded-xl border border-[color:var(--border-muted)] bg-gray-50 p-3">
            <div className="flex items-center gap-3">
              <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="text-sm font-semibold text-[color:var(--ink)]">{file.name}</p>
                <p className="text-xs text-[color:var(--ink-muted)]">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                setFile(null);
                setPreview(null);
                setQualityWarning(null);
              }}
              className="text-sm text-red-600 hover:text-red-700"
            >
              Remove
            </button>
          </div>

          {qualityWarning && (
            <div className="rounded-xl border border-yellow-300 bg-yellow-50 p-3 text-sm text-yellow-800">
              {qualityWarning}
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-300 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {progress && (
        <div className="rounded-xl border border-blue-300 bg-blue-50 p-4 text-sm text-blue-700">
          {progress}
        </div>
      )}

      <div className="flex gap-3">
        {onBack && (
          <Button variant="outline" onClick={onBack} disabled={isUploading} className="flex-1">
            Back
          </Button>
        )}
        <Button
          onClick={handleUpload}
          disabled={!file || isUploading}
          className="flex-1"
        >
          {isUploading ? "Processing..." : "Upload and Extract"}
        </Button>
      </div>
    </div>
  );
}
