"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, FileText, Image as ImageIcon, Loader2, RefreshCcw, ShieldCheck, UploadCloud, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  WILL_FILE_LIMITS,
  checkImageResolution,
  measureImageDimensions,
  validateImageSelection,
  validatePdfSelection,
  type WillFileKind,
} from "@/lib/will-files/will-storage.client";
import type { WillFileClient } from "@/lib/will-files/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

type WillUploadStepProps = {
  matterId: string;
  files: WillFileClient[];
  uploadStatus: { hasFiles: boolean; lastUploadedAt: string };
  onFilesChange: (files: WillFileClient[]) => void;
  errorMessage?: string;
};

const dateFormatter = new Intl.DateTimeFormat("en-CA", { dateStyle: "medium", timeStyle: "short" });

export function WillUploadStep({ matterId, files, uploadStatus, onFilesChange, errorMessage }: WillUploadStepProps) {
  const [mode, setMode] = useState<WillFileKind>(files.some((file) => file.fileType === "image") ? "image" : "pdf");
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const [replaceExisting, setReplaceExisting] = useState(mode === "pdf");
  const [issues, setIssues] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  const hasUploads = files.length > 0;
  const lastUploadedAt = uploadStatus.lastUploadedAt ? dateFormatter.format(new Date(uploadStatus.lastUploadedAt)) : null;

  const [acceptedDisclaimer, setAcceptedDisclaimer] = useState(false);
  const selectedFiles = mode === "pdf" ? (pdfFile ? [pdfFile] : []) : photoFiles;

  const checklist = useMemo(
    () => [
      "Make sure the whole page is visible",
      "No fingers or objects covering the text",
      "No strong glare or shadows",
      "Text should be sharp when you zoom in",
    ],
    [],
  );

  const fileLimitCopy =
    mode === "pdf"
      ? "Upload a single PDF up to 15MB."
      : `Upload up to ${WILL_FILE_LIMITS.maxImageFiles} photos (200KB–20MB each, ${Math.round(WILL_FILE_LIMITS.maxImageTotalBytes / 1024 / 1024)}MB total).`;

  async function handlePhotosSelected(list: FileList | null) {
    if (!list) return;
    if (!acceptedDisclaimer) {
      setIssues(["Please acknowledge the disclaimer before selecting files."]);
      return;
    }
    const next = Array.from(list);
    const validationErrors = validateImageSelection(next);
    const resolutionErrors: string[] = [];
    if (validationErrors.length === 0) {
      for (const file of next) {
        const dimensions = await measureImageDimensions(file);
        const resolution = checkImageResolution(dimensions);
        if (!resolution.ok && resolution.error) {
          resolutionErrors.push(`${file.name}: ${resolution.error}`);
        }
      }
    }
    const combinedErrors = [...validationErrors, ...resolutionErrors];
    if (combinedErrors.length) {
      setIssues(combinedErrors);
      setPhotoFiles([]);
      return;
    }
    setIssues([]);
    setSuccess(null);
    setPhotoFiles(next);
    // bump draft immediately for UX when DB fallback is used
    onFilesChange(
      next.map((file, index) => ({
        id: `local-${index}`,
        matterId,
        fileUrl: URL.createObjectURL(file),
        fileType: "image",
        originalFilename: file.name,
        pageIndex: index + 1,
        uploadedBy: null,
        createdAt: new Date().toISOString(),
      })),
    );
  }

  function handlePdfSelected(list: FileList | null) {
    const next = list?.[0];
    if (!next) return;
    if (!acceptedDisclaimer) {
      setIssues(["Please acknowledge the disclaimer before selecting files."]);
      return;
    }
    const validation = validatePdfSelection([next]);
    if (validation.length) {
      setIssues(validation);
      setPdfFile(null);
      return;
    }
    setIssues([]);
    setSuccess(null);
    setPdfFile(next);
    onFilesChange([
      {
        id: "local-pdf",
        matterId,
        fileUrl: URL.createObjectURL(next),
        fileType: "pdf",
        originalFilename: next.name,
        pageIndex: null,
        uploadedBy: null,
        createdAt: new Date().toISOString(),
      },
    ]);
  }

  async function handleUpload() {
    setIssues([]);
    setSuccess(null);
    if (!acceptedDisclaimer) {
      setIssues(["Please acknowledge the disclaimer before uploading."]);
      return;
    }
    const selection = selectedFiles;
    if (!selection.length) {
      setIssues(["Select file(s) to upload."]);
      return;
    }
    const basicValidation = mode === "pdf" ? validatePdfSelection(selection) : validateImageSelection(selection);
    if (basicValidation.length) {
      setIssues(basicValidation);
      return;
    }
    if (mode === "image") {
      const resolutionErrors: string[] = [];
      for (const file of selection) {
        const dimensions = await measureImageDimensions(file);
        const resolution = checkImageResolution(dimensions);
        if (!resolution.ok && resolution.error) {
          resolutionErrors.push(`${file.name}: ${resolution.error}`);
        }
      }
      if (resolutionErrors.length) {
        setIssues(resolutionErrors);
        return;
      }
    }

    const formData = new FormData();
    formData.append("kind", mode);
    formData.append("replace", mode === "pdf" || replaceExisting ? "true" : "false");
    selection.forEach((file) => formData.append("file", file));

    setUploading(true);
    try {
      const response = await fetch(`/api/matters/${matterId}/will-files`, {
        method: "POST",
        body: formData,
      });
      const payload = (await response.json().catch(() => ({}))) as { files?: WillFileClient[]; error?: string };
      if (!response.ok) {
        setIssues([payload?.error || "Upload failed. Try again."]);
        return;
      }
      const fallbackFiles =
        payload.files && payload.files.length
          ? payload.files
          : selectedFiles.map((file, index) => ({
              id: `local-${index}-${Date.now()}`,
              matterId,
              fileUrl: URL.createObjectURL(file),
              fileType: mode,
              originalFilename: file.name,
              pageIndex: mode === "image" ? index + 1 : null,
              uploadedBy: null,
              createdAt: new Date().toISOString(),
            }));
      onFilesChange(fallbackFiles);
      setSuccess("Will uploaded");
      setPdfFile(null);
      setPhotoFiles([]);
    } catch (error) {
      setIssues([error instanceof Error ? error.message : "Upload failed."]);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-[color:var(--border-muted)] bg-[color:var(--bg-surface)] p-6 shadow-sm">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-[color:var(--ink-muted)]">Step 1</p>
            <h3 className="font-serif text-2xl text-[color:var(--ink)]">Upload the will</h3>
            <p className="text-sm text-[color:var(--ink-muted)]">Start with a clear copy of the will so we can guide every later question.</p>
          </div>
          {uploadStatus.hasFiles ? (
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700">
              <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
              Will uploaded
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-700">
              <XCircle className="h-4 w-4" aria-hidden="true" />
              Upload needed
            </div>
          )}
        </div>

        {!uploadStatus.hasFiles ? (
          <div className="mt-4 rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-900">
            Please upload the will first so we can tailor the rest of the intake.
          </div>
        ) : null}

        {errorMessage ? (
          <div className="mt-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
            {errorMessage}
          </div>
        ) : null}

        <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <p className="font-semibold">Before you continue</p>
          <ul className="mt-2 list-disc space-y-1 pl-4">
            <li>We read the will to extract information. We do not verify if it is legally valid.</li>
            <li>We don’t interpret unclear terms or resolve disputes.</li>
            <li>If you have questions about the will itself, speak with a BC lawyer.</li>
          </ul>
          <label className="mt-3 flex items-start gap-2 text-sm text-[color:var(--ink)]">
            <input
              type="checkbox"
              className="mt-0.5 h-4 w-4 rounded border-[color:var(--border-muted)] text-[color:var(--brand)] focus:ring-[color:var(--brand)]"
              checked={acceptedDisclaimer}
              onChange={(event) => setAcceptedDisclaimer(event.target.checked)}
            />
            <span>I understand and want to continue</span>
          </label>
          {!acceptedDisclaimer ? (
            <p className="mt-1 text-xs text-amber-800">Check the box above to enable uploads.</p>
          ) : null}
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          <ModeButton
            active={mode === "pdf"}
            onClick={() => {
              setMode("pdf");
              setReplaceExisting(true);
              setIssues([]);
              setSuccess(null);
              setPhotoFiles([]);
            }}
          >
            <FileText className="h-4 w-4" aria-hidden="true" />
            Upload PDF of will
          </ModeButton>
          <ModeButton
            active={mode === "image"}
            onClick={() => {
              setMode("image");
              setReplaceExisting(false);
              setIssues([]);
              setSuccess(null);
              setPdfFile(null);
            }}
          >
            <ImageIcon className="h-4 w-4" aria-hidden="true" />
            Upload photos of the paper will
          </ModeButton>
        </div>

        <Separator className="my-4" />

        <div className="space-y-4">
          {mode === "image" ? (
            <div className="rounded-2xl bg-[color:var(--bg-muted)] px-4 py-3 text-sm text-[color:var(--ink-muted)]">
              <p className="mb-2 font-semibold text-[color:var(--ink)]">Photo checklist</p>
              <ul className="list-disc space-y-1 pl-4">
                {checklist.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ) : null}

          <div className="space-y-2 rounded-2xl border border-dashed border-[color:var(--border-muted)] bg-white px-4 py-4">
            <p className="text-sm font-semibold text-[color:var(--ink)]">{fileLimitCopy}</p>
            <p className="text-xs text-[color:var(--ink-muted)]">
              {mode === "pdf" ? "Replacing an upload will overwrite any previous photos or PDFs." : "Add pages or replace everything if needed."}
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Input
                type="file"
                accept={mode === "pdf" ? "application/pdf" : "image/jpeg,image/png"}
                multiple={mode === "image"}
                disabled={!acceptedDisclaimer}
                onChange={(event) => {
                  if (mode === "pdf") {
                    handlePdfSelected(event.target.files);
                  } else {
                    void handlePhotosSelected(event.target.files);
                  }
                }}
              />
              {mode === "image" ? (
                <label className="flex items-center gap-2 text-sm text-[color:var(--ink-muted)]">
                  <input
                    type="checkbox"
                    checked={replaceExisting}
                    onChange={(event) => setReplaceExisting(event.target.checked)}
                    className="h-4 w-4 rounded border-[color:var(--border-muted)]"
                  />
                  Replace existing pages instead of adding more
                </label>
              ) : (
                <p className="flex items-center gap-2 rounded-full bg-[color:var(--bg-muted)] px-3 py-1 text-xs font-semibold text-[color:var(--ink-muted)]">
                  <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                  Uploading a PDF will replace prior files
                </p>
              )}
            </div>
            {selectedFiles.length ? (
              <div className="rounded-2xl bg-[color:var(--bg-muted)] px-3 py-2 text-sm">
                <p className="mb-1 font-semibold text-[color:var(--ink)]">Ready to upload</p>
                <ul className="space-y-1 text-[color:var(--ink-muted)]">
                  {selectedFiles.map((file) => (
                    <li key={file.name} className="flex items-center justify-between">
                      <span>{file.name}</span>
                      <span className="text-xs">{Math.round(file.size / 1024 / 1024 * 10) / 10} MB</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>

          {issues.length ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
              <p className="mb-1 font-semibold">Fix these before continuing:</p>
              <ul className="list-disc space-y-1 pl-4">
                {issues.map((issue) => (
                  <li key={issue}>{issue}</li>
                ))}
              </ul>
            </div>
          ) : null}

          {success ? (
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700">
              <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
              {success}
            </div>
          ) : null}

          <div className="flex flex-wrap gap-3">
            <Button onClick={() => void handleUpload()} disabled={uploading} className="inline-flex items-center gap-2">
              {uploading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <UploadCloud className="h-4 w-4" aria-hidden="true" />}
              {uploading ? "Uploading..." : "Upload now"}
            </Button>
            {mode === "image" && hasUploads ? (
              <button
                type="button"
                className="inline-flex items-center gap-2 text-sm font-semibold text-[color:var(--ink-muted)] underline"
                onClick={() => setReplaceExisting(!replaceExisting)}
              >
                <RefreshCcw className="h-4 w-4" aria-hidden="true" />
                {replaceExisting ? "Switch to adding pages" : "Replace all pages instead"}
              </button>
            ) : null}
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-[color:var(--border-muted)] bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-semibold text-[color:var(--ink)]">Current will files</h4>
            <p className="text-sm text-[color:var(--ink-muted)]">
              {hasUploads ? "Review or download the uploaded pages." : "No will files uploaded yet."}
            </p>
          </div>
          {lastUploadedAt ? <p className="text-xs text-[color:var(--ink-muted)]">Updated {lastUploadedAt}</p> : null}
        </div>
        {hasUploads ? (
          <div className="mt-4 divide-y divide-[color:var(--border-muted)] rounded-2xl border border-[color:var(--border-muted)]">
            {files.map((file) => (
              <div key={file.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm">
                <div className="flex items-center gap-3">
                  {file.fileType === "pdf" ? <FileText className="h-4 w-4 text-[color:var(--brand)]" /> : <ImageIcon className="h-4 w-4 text-[color:var(--brand)]" />}
                  <div>
                    <p className="font-semibold text-[color:var(--ink)]">{file.originalFilename}</p>
                    <p className="text-xs text-[color:var(--ink-muted)]">
                      {file.fileType === "image" ? (file.pageIndex ? `Photo page ${file.pageIndex}` : "Photo") : "PDF"}
                      {" · "}
                      {dateFormatter.format(new Date(file.createdAt))}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <a
                    href={file.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm font-semibold text-[color:var(--brand)] underline"
                  >
                    View / download
                  </a>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-3 rounded-2xl bg-[color:var(--bg-muted)] px-4 py-3 text-sm text-[color:var(--ink-muted)]">
            Upload a PDF or clear photos to unlock the rest of the intake.
          </div>
        )}
      </div>
    </div>
  );
}

function ModeButton({ active, children, onClick }: { active: boolean; children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition",
        active
          ? "border-[color:var(--brand)] bg-[color:var(--bg-muted)] text-[color:var(--brand)] shadow-[0_10px_25px_-18px_rgba(15,26,42,0.35)]"
          : "border-[color:var(--border-muted)] text-[color:var(--ink-muted)] hover:text-[color:var(--ink)]",
      )}
    >
      {children}
    </button>
  );
}
