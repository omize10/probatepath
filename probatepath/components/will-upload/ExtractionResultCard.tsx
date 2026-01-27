'use client';

import { useEffect, useState } from "react";

type Status = "pending" | "confirmed" | "removed" | "edited";

export interface ExtractionResultCardProps {
  title: string;
  value: string;
  confidence?: string;
  status: Status;
  onConfirm: () => void;
  onRemove: () => void;
  onChange: (next: string) => void;
}

export function ExtractionResultCard({ title, value, confidence, status, onConfirm, onRemove, onChange }: ExtractionResultCardProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  useEffect(() => {
    setDraft(value);
  }, [value]);

  const saveEdit = () => {
    onChange(draft.trim());
    setEditing(false);
  };

  if (status === "removed") return null;

  return (
    <div
      className={`rounded-lg border bg-white p-4 shadow-sm ${
        status === "confirmed" ? "border-green-500" : status === "edited" ? "border-blue-500" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-700">{title}</p>
          {confidence ? <p className="text-xs text-slate-600">{confidence}</p> : null}
        </div>
        <div className="text-xs uppercase tracking-wide text-slate-600">
          {status === "pending" && "Pending"}
          {status === "confirmed" && "Confirmed"}
          {status === "edited" && "Edited"}
        </div>
      </div>

      <div className="mt-3 text-base text-[color:var(--ink)]">
        {editing ? (
          <textarea
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={2}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
          />
        ) : (
          <p className="whitespace-pre-wrap">{value}</p>
        )}
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => {
            setEditing(false);
            onConfirm();
          }}
          className="rounded-lg bg-green-50 px-3 py-1 text-sm font-medium text-green-700 transition hover:bg-green-100"
        >
          ✓ Confirm
        </button>
        <button
          type="button"
          onClick={onRemove}
          className="rounded-lg bg-red-50 px-3 py-1 text-sm font-medium text-red-700 transition hover:bg-red-100"
        >
          ✗ Remove
        </button>
        {editing ? (
          <button
            type="button"
            onClick={saveEdit}
            className="rounded-lg bg-blue-600 px-3 py-1 text-sm font-medium text-white transition hover:bg-blue-700"
          >
            Save
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="rounded-lg bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700 transition hover:bg-blue-100"
          >
            ✎ Edit
          </button>
        )}
      </div>
    </div>
  );
}
