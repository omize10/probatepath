"use client";

import { useState, useRef } from "react";

interface WillSearchCertificateUploadProps {
  matterId: string;
  existingCertificateUrl?: string | null;
  certificateUploadedAt?: string | null;
  certificateVerified?: boolean;
  onUploaded?: () => void;
}

export function WillSearchCertificateUpload({
  matterId,
  existingCertificateUrl,
  certificateUploadedAt,
  certificateVerified,
  onUploaded,
}: WillSearchCertificateUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(existingCertificateUrl ?? null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ["application/pdf", "image/jpeg", "image/png"];
    if (!validTypes.includes(file.type)) {
      setError("Please upload a PDF, JPG, or PNG file.");
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError("File is too large. Maximum size is 10MB.");
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`/api/matters/${matterId}/will-search-certificate`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Upload failed");
      }

      const data = await response.json();
      setUploadedUrl(data.certificateUrl);
      onUploaded?.();
    } catch (err: any) {
      setError(err.message || "Failed to upload certificate");
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemove = async () => {
    if (!confirm("Are you sure you want to remove this certificate?")) return;

    try {
      const response = await fetch(`/api/matters/${matterId}/will-search-certificate`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to remove certificate");
      }

      setUploadedUrl(null);
      onUploaded?.();
    } catch (err: any) {
      setError(err.message || "Failed to remove certificate");
    }
  };

  if (uploadedUrl) {
    return (
      <div className="rounded-xl border border-green-200 bg-green-50 p-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <svg className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="font-medium text-green-800">Certificate uploaded</p>
            </div>
            {certificateUploadedAt && (
              <p className="text-sm text-green-700">
                Uploaded on {new Date(certificateUploadedAt).toLocaleDateString()}
              </p>
            )}
            {certificateVerified && (
              <p className="text-xs text-green-600">Verified by our team</p>
            )}
          </div>
          <button
            onClick={handleRemove}
            className="text-sm text-red-600 hover:text-red-800 transition"
          >
            Remove
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 space-y-3">
      <div className="space-y-1">
        <p className="font-medium text-amber-900">Upload your will search certificate</p>
        <p className="text-sm text-amber-800">
          When you receive your certificate from BC Vital Statistics, upload it here for your records.
        </p>
      </div>

      <div>
        <label className="relative cursor-pointer">
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={handleFileChange}
            disabled={uploading}
            className="sr-only"
          />
          <span
            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${
              uploading
                ? "bg-gray-200 text-gray-600 cursor-not-allowed"
                : "bg-amber-600 text-white hover:bg-amber-700"
            }`}
          >
            {uploading ? (
              <>
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Uploading...
              </>
            ) : (
              <>
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                Choose file
              </>
            )}
          </span>
        </label>
        <p className="mt-2 text-xs text-amber-700">PDF, JPG, or PNG up to 10MB</p>
      </div>

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      {/* Dev mode skip button */}
      {process.env.NEXT_PUBLIC_DEV_MODE === "true" && (
        <button
          type="button"
          onClick={async () => {
            console.log("[DEV] Skipping will search certificate upload");
            try {
              const response = await fetch(`/api/matters/${matterId}/will-search-certificate`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ devSkip: true }),
              });
              if (response.ok) {
                setUploadedUrl("/dev-placeholder-certificate.pdf");
                onUploaded?.();
              }
            } catch (err) {
              console.error("[DEV] Skip failed:", err);
            }
          }}
          className="w-full rounded-full border-2 border-dashed border-purple-400 bg-purple-50 px-6 py-3 text-sm font-semibold text-purple-700 transition hover:bg-purple-100"
        >
          [DEV] Skip certificate upload for testing
        </button>
      )}
    </div>
  );
}
