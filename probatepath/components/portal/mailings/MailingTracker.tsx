"use client";

import { useState, useCallback } from "react";
import { PortalShell } from "@/components/portal/PortalShell";
import { addDays, differenceInDays, format } from "date-fns";

type Proof = { id: string; fileName: string; fileUrl: string; uploadedAt: string };

type Mailing = {
  id: string;
  beneficiaryId: string;
  beneficiaryName: string;
  beneficiaryAddress: string | null;
  deliveryMethod: string;
  status: string;
  printedAt: string | null;
  mailedAt: string | null;
  deliveredAt: string | null;
  trackingNumber: string | null;
  carrierName: string | null;
  notes: string | null;
  proofs: Proof[];
  // Confirmation fields
  confirmedMailedViaRegistered: boolean;
  confirmedCorrectAddress: boolean;
  confirmedUnderstand21Days: boolean;
  confirmationsCompletedAt: string | null;
};

type Beneficiary = {
  id: string;
  fullName: string;
  relationship: string;
  address: string;
};

type TrackerData = {
  matterId: string;
  beneficiaries: Beneficiary[];
  mailings: Mailing[];
  noticesMailedAt: string | null;
};

const STATUS_LABELS: Record<string, string> = {
  not_printed: "Not printed",
  printed: "Printed",
  mailed: "Mailed",
  delivered: "Delivered",
};

const STATUS_COLORS: Record<string, string> = {
  not_printed: "bg-slate-200 text-slate-800",
  printed: "bg-yellow-100 text-yellow-800",
  mailed: "bg-blue-100 text-blue-800",
  delivered: "bg-green-100 text-green-800",
};

const METHOD_LABELS: Record<string, string> = {
  registered_mail: "Registered mail",
  courier: "Courier",
  personal: "Personal delivery",
  electronic: "Electronic",
};

export function MailingTracker({ data }: { data: TrackerData }) {
  const [mailings, setMailings] = useState<Mailing[]>(data.mailings);
  const [loading, setLoading] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const initialize = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/matters/${data.matterId}/mailings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "initialize" }),
      });
      const json = await res.json();
      if (json.mailings) setMailings(json.mailings);
    } finally {
      setLoading(false);
    }
  }, [data.matterId]);

  const updateMailing = useCallback(
    async (mailingId: string, updates: Record<string, unknown>) => {
      const res = await fetch(`/api/matters/${data.matterId}/mailings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "update", mailingId, ...updates }),
      });
      const json = await res.json();
      if (json.mailing) {
        setMailings((prev) =>
          prev.map((m) => (m.id === mailingId ? json.mailing : m))
        );
      }
    },
    [data.matterId]
  );

  const uploadProof = useCallback(
    async (mailingId: string, file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch(
        `/api/matters/${data.matterId}/mailings/${mailingId}/proof`,
        { method: "POST", body: formData }
      );
      const json = await res.json();
      if (json.proof) {
        setMailings((prev) =>
          prev.map((m) =>
            m.id === mailingId
              ? { ...m, proofs: [...m.proofs, json.proof] }
              : m
          )
        );
      }
    },
    [data.matterId]
  );

  const allDelivered = mailings.length > 0 && mailings.every((m) => m.status === "delivered");
  const allMailed = mailings.length > 0 && mailings.every((m) => m.status === "mailed" || m.status === "delivered");
  const totalCount = mailings.length;
  const deliveredCount = mailings.filter((m) => m.status === "delivered").length;
  const mailedCount = mailings.filter((m) => m.status === "mailed" || m.status === "delivered").length;

  return (
    <PortalShell
      title="P1 Notice Tracker"
      description="Track delivery of your P1 notices to each beneficiary."
      eyebrow="Notices"
    >
      {mailings.length === 0 ? (
        <div className="rounded-2xl border border-[color:var(--border-muted)] bg-white p-6 text-center">
          <p className="text-sm text-[color:var(--text-secondary)] mb-4">
            Set up tracking for each beneficiary who needs a P1 notice.
          </p>
          <button
            onClick={initialize}
            disabled={loading || data.beneficiaries.length === 0}
            className="inline-flex items-center rounded-full bg-[color:var(--brand)] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[color:var(--accent-dark)] disabled:opacity-60"
          >
            {loading ? "Setting up..." : "Initialize tracking"}
          </button>
          {data.beneficiaries.length === 0 && (
            <p className="mt-2 text-xs text-[color:var(--text-tertiary)]">No beneficiaries found in your intake.</p>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {/* Summary bar */}
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-[color:var(--border-muted)] bg-white p-3 text-center">
              <p className="text-xs uppercase tracking-widest text-[color:var(--text-tertiary)]">Total</p>
              <p className="text-2xl font-bold text-[color:var(--ink)]">{totalCount}</p>
            </div>
            <div className="rounded-xl border border-[color:var(--border-muted)] bg-white p-3 text-center">
              <p className="text-xs uppercase tracking-widest text-[color:var(--text-tertiary)]">Mailed</p>
              <p className="text-2xl font-bold text-blue-700">{mailedCount}</p>
            </div>
            <div className="rounded-xl border border-[color:var(--border-muted)] bg-white p-3 text-center">
              <p className="text-xs uppercase tracking-widest text-[color:var(--text-tertiary)]">Delivered</p>
              <p className="text-2xl font-bold text-green-700">{deliveredCount}</p>
            </div>
          </div>

          {allDelivered && (
            <div className="rounded-xl bg-green-50 border border-green-200 p-4 text-sm text-green-800">
              All notices have been delivered. Your 21-day waiting period is calculated from the last delivery date.
            </div>
          )}

          {allMailed && !allDelivered && (
            <div className="rounded-xl bg-blue-50 border border-blue-200 p-4 text-sm text-blue-800">
              All notices have been mailed. Update each to "Delivered" when you get confirmation.
            </div>
          )}

          {/* Individual mailing cards */}
          <div className="space-y-3">
            {mailings.map((mailing) => (
              <MailingCard
                key={mailing.id}
                mailing={mailing}
                expanded={expandedId === mailing.id}
                onToggle={() => setExpandedId(expandedId === mailing.id ? null : mailing.id)}
                onUpdate={updateMailing}
                onUploadProof={uploadProof}
              />
            ))}
          </div>
        </div>
      )}
    </PortalShell>
  );
}

function MailingCard({
  mailing,
  expanded,
  onToggle,
  onUpdate,
  onUploadProof,
}: {
  mailing: Mailing;
  expanded: boolean;
  onToggle: () => void;
  onUpdate: (id: string, updates: Record<string, unknown>) => Promise<void>;
  onUploadProof: (id: string, file: File) => Promise<void>;
}) {
  const [saving, setSaving] = useState(false);
  // Local state for checkboxes (synced with mailing data)
  const [checkbox1, setCheckbox1] = useState(mailing.confirmedMailedViaRegistered);
  const [checkbox2, setCheckbox2] = useState(mailing.confirmedCorrectAddress);
  const [checkbox3, setCheckbox3] = useState(mailing.confirmedUnderstand21Days);

  const daysRemaining = mailing.mailedAt
    ? Math.max(0, differenceInDays(addDays(new Date(mailing.mailedAt), 21), new Date()))
    : null;

  // All confirmations required before marking as mailed
  const allConfirmationsChecked = checkbox1 && checkbox2 && checkbox3;
  const hasProofUploaded = mailing.proofs.length > 0;
  const canMarkAsMailed = allConfirmationsChecked && hasProofUploaded;

  const handleCheckboxChange = async (
    field: "confirmedMailedViaRegistered" | "confirmedCorrectAddress" | "confirmedUnderstand21Days",
    value: boolean
  ) => {
    // Update local state immediately
    if (field === "confirmedMailedViaRegistered") setCheckbox1(value);
    if (field === "confirmedCorrectAddress") setCheckbox2(value);
    if (field === "confirmedUnderstand21Days") setCheckbox3(value);

    // Save to backend
    await onUpdate(mailing.id, { [field]: value });
  };

  const handleStatusAdvance = async () => {
    setSaving(true);
    const now = new Date().toISOString();
    let updates: Record<string, unknown> = {};

    if (mailing.status === "not_printed") {
      updates = { status: "printed", printedAt: now };
    } else if (mailing.status === "printed") {
      // When marking as mailed, also save confirmationsCompletedAt
      updates = { status: "mailed", mailedAt: now, confirmationsCompletedAt: now };
    } else if (mailing.status === "mailed") {
      updates = { status: "delivered", deliveredAt: now };
    }

    await onUpdate(mailing.id, updates);
    setSaving(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSaving(true);
    await onUploadProof(mailing.id, file);
    setSaving(false);
    e.target.value = "";
  };

  const nextAction = {
    not_printed: "Mark as printed",
    printed: "Mark as mailed",
    mailed: "Mark as delivered",
    delivered: null,
  }[mailing.status];

  return (
    <div className="rounded-xl border border-[color:var(--border-muted)] bg-white overflow-hidden">
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-gray-50 transition"
      >
        <div className="flex items-center gap-3">
          <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[mailing.status]}`}>
            {STATUS_LABELS[mailing.status]}
          </span>
          <span className="text-sm font-medium text-[color:var(--ink)]">{mailing.beneficiaryName}</span>
        </div>
        <div className="flex items-center gap-2">
          {daysRemaining !== null && mailing.status !== "delivered" && (
            <span className="text-xs text-[color:var(--text-tertiary)]">
              {daysRemaining > 0 ? `${daysRemaining}d remaining` : "21 days complete"}
            </span>
          )}
          <svg
            className={`h-4 w-4 text-[color:var(--text-tertiary)] transition ${expanded ? "rotate-180" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {expanded && (
        <div className="border-t border-[color:var(--border-subtle)] px-4 py-4 space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-[color:var(--text-tertiary)] mb-1">Delivery method</label>
              <select
                value={mailing.deliveryMethod}
                onChange={(e) => onUpdate(mailing.id, { deliveryMethod: e.target.value })}
                className="w-full rounded-lg border border-[color:var(--border-subtle)] px-3 py-1.5 text-sm"
              >
                {Object.entries(METHOD_LABELS).map(([val, label]) => (
                  <option key={val} value={val}>{label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-[color:var(--text-tertiary)] mb-1">Tracking number</label>
              <input
                type="text"
                defaultValue={mailing.trackingNumber ?? ""}
                onBlur={(e) => {
                  if (e.target.value !== (mailing.trackingNumber ?? "")) {
                    onUpdate(mailing.id, { trackingNumber: e.target.value || null });
                  }
                }}
                placeholder="Enter tracking number"
                className="w-full rounded-lg border border-[color:var(--border-subtle)] px-3 py-1.5 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[color:var(--text-tertiary)] mb-1">Carrier / notes</label>
            <input
              type="text"
              defaultValue={mailing.carrierName ?? ""}
              onBlur={(e) => {
                if (e.target.value !== (mailing.carrierName ?? "")) {
                  onUpdate(mailing.id, { carrierName: e.target.value || null });
                }
              }}
              placeholder="e.g., Canada Post, FedEx"
              className="w-full rounded-lg border border-[color:var(--border-subtle)] px-3 py-1.5 text-sm"
            />
          </div>

          {/* Timeline */}
          <div className="flex items-center gap-2 text-xs text-[color:var(--text-tertiary)]">
            {mailing.printedAt && <span>Printed {format(new Date(mailing.printedAt), "MMM d")}</span>}
            {mailing.printedAt && mailing.mailedAt && <span className="text-[color:var(--text-tertiary)]">→</span>}
            {mailing.mailedAt && <span>Mailed {format(new Date(mailing.mailedAt), "MMM d")}</span>}
            {mailing.mailedAt && mailing.deliveredAt && <span className="text-[color:var(--text-tertiary)]">→</span>}
            {mailing.deliveredAt && <span>Delivered {format(new Date(mailing.deliveredAt), "MMM d")}</span>}
          </div>

          {/* 21-day countdown per beneficiary */}
          {mailing.mailedAt && mailing.status !== "delivered" && daysRemaining !== null && (
            <div className="rounded-lg bg-blue-50 px-3 py-2 text-xs text-blue-800">
              21-day wait: {daysRemaining > 0
                ? `${daysRemaining} day(s) remaining (complete ${format(addDays(new Date(mailing.mailedAt), 21), "MMM d, yyyy")})`
                : "Complete"}
            </div>
          )}

          {/* Proof uploads */}
          <div>
            <p className="text-xs font-medium text-[color:var(--text-tertiary)] mb-2">
              Delivery proof {mailing.status === "printed" && !hasProofUploaded && (
                <span className="text-red-500 font-normal">(required before marking as mailed)</span>
              )}
            </p>
            {mailing.proofs.length > 0 && (
              <ul className="space-y-1 mb-2">
                {mailing.proofs.map((proof) => (
                  <li key={proof.id} className="flex items-center gap-2 text-xs text-[color:var(--text-secondary)]">
                    <svg className="h-3 w-3 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span>{proof.fileName}</span>
                    <span className="text-[color:var(--text-secondary)]">({format(new Date(proof.uploadedAt), "MMM d")})</span>
                  </li>
                ))}
              </ul>
            )}
            <label className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-[color:var(--border-subtle)] px-3 py-1.5 text-xs font-medium text-[color:var(--text-secondary)] hover:bg-gray-50 transition">
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              Upload receipt
              <input
                type="file"
                className="hidden"
                accept="image/*,.pdf"
                onChange={handleFileUpload}
                disabled={saving}
              />
            </label>
          </div>

          {/* Confirmation checkboxes - shown when status is "printed" */}
          {mailing.status === "printed" && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 space-y-3">
              <p className="text-sm font-semibold text-amber-800">
                Before marking as mailed, confirm the following:
              </p>
              <div className="space-y-2">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checkbox1}
                    onChange={(e) => handleCheckboxChange("confirmedMailedViaRegistered", e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-gray-300 text-[color:var(--brand)] focus:ring-[color:var(--brand)]"
                  />
                  <span className="text-sm text-[color:var(--text-secondary)]">
                    I confirm I mailed Form P1 to <strong>{mailing.beneficiaryName}</strong> via registered mail
                  </span>
                </label>
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checkbox2}
                    onChange={(e) => handleCheckboxChange("confirmedCorrectAddress", e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-gray-300 text-[color:var(--brand)] focus:ring-[color:var(--brand)]"
                  />
                  <span className="text-sm text-[color:var(--text-secondary)]">
                    I confirm I mailed to this address:{" "}
                    <strong>{mailing.beneficiaryAddress || "Address not provided"}</strong>
                  </span>
                </label>
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checkbox3}
                    onChange={(e) => handleCheckboxChange("confirmedUnderstand21Days", e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-gray-300 text-[color:var(--brand)] focus:ring-[color:var(--brand)]"
                  />
                  <span className="text-sm text-[color:var(--text-secondary)]">
                    I understand I cannot file the probate application until 21 days after this mailing date
                  </span>
                </label>
              </div>
              {!hasProofUploaded && (
                <p className="text-xs text-amber-700">
                  You must also upload your registered mail receipt above.
                </p>
              )}
            </div>
          )}

          {/* Action button */}
          {nextAction && (
            <div className="space-y-2">
              <button
                onClick={handleStatusAdvance}
                disabled={saving || (mailing.status === "printed" && !canMarkAsMailed)}
                className="inline-flex items-center rounded-full bg-[color:var(--brand)] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[color:var(--accent-dark)] disabled:opacity-60"
              >
                {saving ? "Saving..." : nextAction}
              </button>
              {mailing.status === "printed" && !canMarkAsMailed && (
                <p className="text-xs text-[color:var(--text-tertiary)]">
                  Complete all confirmations and upload receipt to enable this button.
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
