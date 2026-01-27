"use client";

import { useState, useRef } from "react";

interface GrantUploadFormProps {
  caseId: string;
  existingUrl: string | null;
}

export function GrantUploadForm({ caseId, existingUrl }: GrantUploadFormProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(existingUrl);
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
      formData.append("caseId", caseId);

      const response = await fetch(`/api/matters/${caseId}/grant-document`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Upload failed");
      }

      const data = await response.json();
      setUploadedUrl(data.grantDocumentUrl);
    } catch (err: any) {
      setError(err.message || "Failed to upload grant document");
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  if (uploadedUrl) {
    return (
      <div className="rounded-lg border border-green-200 bg-green-50 p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg className="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm text-green-800">Grant document uploaded</span>
          </div>
          <a
            href={uploadedUrl}
            target="_blank"
            className="text-sm text-green-700 underline hover:text-green-900"
          >
            View
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-sm text-slate-700">Optional: Upload a copy of your grant document for your records.</p>
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
                ? "bg-gray-200 text-slate-700 cursor-not-allowed"
                : "border border-gray-300 bg-white text-slate-700 hover:bg-gray-50"
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
                Upload grant document
              </>
            )}
          </span>
        </label>
        <p className="mt-1 text-xs text-slate-600">PDF, JPG, or PNG up to 10MB</p>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
