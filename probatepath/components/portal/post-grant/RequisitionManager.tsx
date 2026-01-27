"use client";

import { useState, useCallback } from "react";
import { PortalShell } from "@/components/portal/PortalShell";
import { format } from "date-fns";

type Requisition = {
  id: string;
  status: string;
  description: string | null;
  courtNotes: string | null;
  responseNotes: string | null;
  fileUrl: string | null;
  responseFileUrl: string | null;
  receivedAt: string;
  dueAt: string | null;
  resolvedAt: string | null;
};

type RequisitionData = {
  matterId: string;
  requisitions: Requisition[];
};

const STATUS_LABELS: Record<string, string> = {
  received: "Received",
  responding: "Responding",
  resolved: "Resolved",
};

const STATUS_COLORS: Record<string, string> = {
  received: "bg-red-100 text-red-800",
  responding: "bg-amber-100 text-amber-800",
  resolved: "bg-green-100 text-green-800",
};

const COMMON_REQUISITIONS = [
  {
    title: "Missing or incorrect information on forms",
    description: "The court found errors or blanks in your submitted forms.",
    guidance: [
      "Review the requisition letter carefully to identify which fields need correction.",
      "Reprint the affected form with correct information.",
      "Get the corrected form re-notarized if it's an affidavit.",
      "Submit the corrected pages along with a cover letter referencing your file number.",
    ],
  },
  {
    title: "Missing documents or attachments",
    description: "The court needs additional documents not included in your original filing.",
    guidance: [
      "Check what document is requested (death certificate copy, will codicil, etc.).",
      "Obtain a certified copy if required (original or notarized copy).",
      "Submit with a cover letter referencing your file number and the requisition.",
    ],
  },
  {
    title: "Will attestation issues",
    description: "Problems with how the will was witnessed or signed.",
    guidance: [
      "This may require an Affidavit of Witness or Affidavit of Execution.",
      "Contact the witnesses to the will to provide a sworn statement.",
      "If witnesses are unavailable, you may need legal advice.",
    ],
  },
  {
    title: "Asset or value discrepancies",
    description: "The court questions the declared asset values.",
    guidance: [
      "Obtain current appraisals or account statements.",
      "File an amended P10/P11 with corrected values if needed.",
      "Include supporting documentation (bank statements, appraisals).",
    ],
  },
  {
    title: "Beneficiary notification issues",
    description: "The court needs proof that all beneficiaries were properly notified.",
    guidance: [
      "Provide copies of registered mail receipts or courier confirmations.",
      "If a beneficiary couldn't be located, provide evidence of search efforts.",
      "May need an affidavit describing notification attempts.",
    ],
  },
];

export function RequisitionManager({ data }: { data: RequisitionData }) {
  const [requisitions, setRequisitions] = useState<Requisition[]>(data.requisitions);
  const [showUpload, setShowUpload] = useState(false);
  const [showGuide, setShowGuide] = useState(false);

  const updateRequisition = useCallback(async (id: string, updates: Record<string, unknown>) => {
    const res = await fetch(`/api/matters/${data.matterId}/requisitions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "update", id, ...updates }),
    });
    const json = await res.json();
    if (json.requisition) {
      setRequisitions((prev) => prev.map((r) => (r.id === id ? { ...json.requisition, receivedAt: json.requisition.receivedAt, dueAt: json.requisition.dueAt ?? null, resolvedAt: json.requisition.resolvedAt ?? null } : r)));
    }
  }, [data.matterId]);

  const uploadRequisition = useCallback(async (file: File, description: string, dueAt: string) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("description", description);
    if (dueAt) formData.append("dueAt", dueAt);

    const res = await fetch(`/api/matters/${data.matterId}/requisitions`, {
      method: "POST",
      body: formData,
    });
    const json = await res.json();
    if (json.requisition) {
      setRequisitions((prev) => [{ ...json.requisition, dueAt: json.requisition.dueAt ?? null, resolvedAt: json.requisition.resolvedAt ?? null }, ...prev]);
      setShowUpload(false);
    }
  }, [data.matterId]);

  const activeCount = requisitions.filter((r) => r.status !== "resolved").length;

  return (
    <PortalShell
      title="Court requisitions"
      description={activeCount > 0 ? `${activeCount} active requisition(s) to address` : "No active requisitions"}
      eyebrow="Court corrections"
      actions={
        <button
          onClick={() => setShowUpload(true)}
          className="inline-flex items-center rounded-full bg-[color:var(--brand)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[color:var(--accent-dark)]"
        >
          Upload requisition
        </button>
      }
    >
      <div className="space-y-4">
        {/* Upload form */}
        {showUpload && <UploadForm onSubmit={uploadRequisition} onCancel={() => setShowUpload(false)} />}

        {/* Active requisitions */}
        {requisitions.length === 0 ? (
          <div className="rounded-2xl border border-[color:var(--border-muted)] bg-white p-6 text-center">
            <p className="text-sm text-slate-600">
              No requisitions yet. If the court sends you a requisition letter, upload it here and we'll help you respond.
            </p>
          </div>
        ) : (
          requisitions.map((req) => (
            <RequisitionCard key={req.id} requisition={req} onUpdate={updateRequisition} />
          ))
        )}

        {/* Guidance section */}
        <div className="rounded-2xl border border-[color:var(--border-muted)] bg-white overflow-hidden">
          <button
            onClick={() => setShowGuide(!showGuide)}
            className="flex w-full items-center justify-between px-5 py-4 text-left hover:bg-gray-50 transition"
          >
            <div>
              <h3 className="text-sm font-semibold text-[color:var(--ink)]">Common requisition types and how to respond</h3>
              <p className="text-xs text-slate-600 mt-0.5">Click to expand guidance for each type.</p>
            </div>
            <svg className={`h-4 w-4 text-slate-600 transition ${showGuide ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {showGuide && (
            <div className="border-t border-gray-100 divide-y divide-gray-50">
              {COMMON_REQUISITIONS.map((item) => (
                <details key={item.title} className="px-5 py-3">
                  <summary className="cursor-pointer text-sm font-medium text-[color:var(--ink)]">
                    {item.title}
                    <span className="block text-xs text-slate-600 font-normal mt-0.5">{item.description}</span>
                  </summary>
                  <ol className="mt-2 space-y-1 pl-4">
                    {item.guidance.map((step, i) => (
                      <li key={i} className="text-xs text-slate-700 list-decimal">{step}</li>
                    ))}
                  </ol>
                </details>
              ))}
            </div>
          )}
        </div>
      </div>
    </PortalShell>
  );
}

function UploadForm({ onSubmit, onCancel }: { onSubmit: (file: File, description: string, dueAt: string) => void; onCancel: () => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [description, setDescription] = useState("");
  const [dueAt, setDueAt] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!file) return;
    setSubmitting(true);
    await onSubmit(file, description, dueAt);
    setSubmitting(false);
  };

  return (
    <div className="rounded-2xl border border-[color:var(--brand)]/20 bg-blue-50/30 p-5 space-y-3">
      <h3 className="text-sm font-semibold text-[color:var(--ink)]">Upload court requisition</h3>
      <div className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Requisition letter (PDF or image)</label>
          <input
            type="file"
            accept=".pdf,image/*"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">What is the court asking for?</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Briefly describe what the requisition is about..."
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm min-h-[60px]"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Response due date (if specified)</label>
          <input
            type="date"
            value={dueAt}
            onChange={(e) => setDueAt(e.target.value)}
            className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm"
          />
        </div>
      </div>
      <div className="flex gap-2">
        <button
          onClick={handleSubmit}
          disabled={!file || submitting}
          className="rounded-full bg-[color:var(--brand)] px-4 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
        >
          {submitting ? "Uploading..." : "Upload"}
        </button>
        <button onClick={onCancel} className="rounded-full border border-gray-200 px-4 py-1.5 text-xs font-medium text-slate-700">Cancel</button>
      </div>
    </div>
  );
}

function RequisitionCard({ requisition, onUpdate }: { requisition: Requisition; onUpdate: (id: string, updates: Record<string, unknown>) => Promise<void> }) {
  const [expanded, setExpanded] = useState(false);
  const [notes, setNotes] = useState(requisition.responseNotes ?? "");

  const isOverdue = requisition.dueAt && new Date(requisition.dueAt) < new Date() && requisition.status !== "resolved";

  return (
    <div className={`rounded-xl border overflow-hidden ${isOverdue ? "border-red-300 bg-red-50/30" : "border-[color:var(--border-muted)] bg-white"}`}>
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-gray-50/50 transition"
      >
        <div className="flex items-center gap-3">
          <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[requisition.status]}`}>
            {STATUS_LABELS[requisition.status]}
          </span>
          <span className="text-sm text-[color:var(--ink)]">{requisition.description || "Court requisition"}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-600">
          {isOverdue && <span className="text-red-600 font-medium">Overdue</span>}
          {requisition.dueAt && !isOverdue && requisition.status !== "resolved" && (
            <span>Due {format(new Date(requisition.dueAt), "MMM d")}</span>
          )}
          <span>{format(new Date(requisition.receivedAt), "MMM d, yyyy")}</span>
        </div>
      </button>

      {expanded && (
        <div className="border-t border-gray-100 px-4 py-4 space-y-3">
          {requisition.courtNotes && (
            <div>
              <p className="text-xs font-medium text-slate-600 mb-1">Court notes</p>
              <p className="text-sm text-slate-700">{requisition.courtNotes}</p>
            </div>
          )}

          <div>
            <p className="text-xs font-medium text-slate-600 mb-1">Your response notes</p>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              onBlur={() => {
                if (notes !== (requisition.responseNotes ?? "")) {
                  onUpdate(requisition.id, { responseNotes: notes || null });
                }
              }}
              placeholder="Notes on how you're responding..."
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm min-h-[60px]"
            />
          </div>

          <div className="flex gap-2">
            {requisition.status === "received" && (
              <button
                onClick={() => onUpdate(requisition.id, { status: "responding" })}
                className="rounded-full bg-amber-500 px-4 py-1.5 text-xs font-semibold text-white"
              >
                Start responding
              </button>
            )}
            {requisition.status === "responding" && (
              <button
                onClick={() => onUpdate(requisition.id, { status: "resolved" })}
                className="rounded-full bg-green-600 px-4 py-1.5 text-xs font-semibold text-white"
              >
                Mark resolved
              </button>
            )}
            {requisition.status === "resolved" && (
              <span className="text-xs text-green-700">
                Resolved {requisition.resolvedAt ? format(new Date(requisition.resolvedAt), "MMM d, yyyy") : ""}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
