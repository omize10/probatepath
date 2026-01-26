"use client";

import { useState, useTransition, useRef } from "react";
import { useRouter } from "next/navigation";

// Types matching Prisma schema
type FlagType =
  | "NO_ORIGINAL_WILL"
  | "DIFFERENT_WILL_FOUND"
  | "MINOR_BENEFICIARY"
  | "DISABLED_BENEFICIARY"
  | "FOREIGN_ASSETS"
  | "BUSINESS_INTERESTS"
  | "EXPECTED_DISPUTE"
  | "POSSIBLY_INSOLVENT"
  | "PRIORITY_CONFLICT"
  | "COMPLEX_FAMILY"
  | "INTESTATE_CASE"
  | "OTHER";

type FlagSeverity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
type FlagStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED" | "DISMISSED";

interface MatterNote {
  id: string;
  content: string;
  createdAt: string;
  user: {
    name: string | null;
    email: string | null;
  };
}

interface MatterFlag {
  id: string;
  flagType: FlagType;
  severity: FlagSeverity;
  status: FlagStatus;
  description: string | null;
  createdAt: string;
  resolvedAt: string | null;
}

interface NotesAndFlagsProps {
  matterId: string;
  notes: MatterNote[];
  flags: MatterFlag[];
}

const FLAG_TYPE_LABELS: Record<FlagType, string> = {
  NO_ORIGINAL_WILL: "No Original Will",
  DIFFERENT_WILL_FOUND: "Different Will Found",
  MINOR_BENEFICIARY: "Minor Beneficiary",
  DISABLED_BENEFICIARY: "Disabled Beneficiary",
  FOREIGN_ASSETS: "Foreign Assets",
  BUSINESS_INTERESTS: "Business Interests",
  EXPECTED_DISPUTE: "Expected Dispute",
  POSSIBLY_INSOLVENT: "Possibly Insolvent",
  PRIORITY_CONFLICT: "Priority Conflict",
  COMPLEX_FAMILY: "Complex Family",
  INTESTATE_CASE: "Intestate Case",
  OTHER: "Other",
};

const SEVERITY_COLORS: Record<FlagSeverity, string> = {
  LOW: "bg-gray-100 text-gray-700",
  MEDIUM: "bg-yellow-100 text-yellow-800",
  HIGH: "bg-orange-100 text-orange-800",
  CRITICAL: "bg-red-100 text-red-800",
};

const STATUS_COLORS: Record<FlagStatus, string> = {
  OPEN: "bg-blue-100 text-blue-800",
  IN_PROGRESS: "bg-purple-100 text-purple-800",
  RESOLVED: "bg-green-100 text-green-800",
  DISMISSED: "bg-gray-100 text-gray-700",
};

export function NotesCard({ matterId, notes }: { matterId: string; notes: MatterNote[] }) {
  const [isPending, startTransition] = useTransition();
  const [newNote, setNewNote] = useState("");
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    startTransition(async () => {
      const response = await fetch(`/api/matters/${matterId}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newNote }),
      });

      if (response.ok) {
        setNewNote("");
        router.refresh();
      }
    });
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString("en-CA", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  return (
    <div className="space-y-4 rounded-3xl border border-[color:var(--border-muted)] bg-white p-6 shadow-[0_25px_80px_-60px_rgba(15,23,42,0.22)]">
      <header className="space-y-1">
        <p className="text-xs uppercase tracking-[0.3em] text-[color:var(--ink-muted)]">Notes</p>
        <h3 className="font-serif text-xl text-[color:var(--ink)]">Case Notes</h3>
        <p className="text-sm text-[color:var(--ink-muted)]">
          Add internal notes for this case. Notes are visible to all ops team members.
        </p>
      </header>

      <form ref={formRef} onSubmit={handleSubmit} className="space-y-3">
        <textarea
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          placeholder="Add a note..."
          rows={3}
          className="w-full rounded-xl border border-[color:var(--border-muted)] px-4 py-3 text-sm focus:border-[color:var(--brand)] focus:outline-none"
        />
        <button
          type="submit"
          disabled={isPending || !newNote.trim()}
          className="rounded-full bg-[color:var(--brand)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[color:var(--accent-dark)] disabled:opacity-50"
        >
          {isPending ? "Adding..." : "Add Note"}
        </button>
      </form>

      <div className="space-y-3">
        {notes.length === 0 ? (
          <p className="text-sm text-[color:var(--ink-muted)]">No notes yet.</p>
        ) : (
          notes.map((note) => (
            <div
              key={note.id}
              className="rounded-xl border border-[color:var(--border-muted)] bg-[color:var(--bg-muted)] p-4"
            >
              <p className="text-sm text-[color:var(--ink)] whitespace-pre-wrap">{note.content}</p>
              <p className="mt-2 text-xs text-[color:var(--ink-muted)]">
                {note.user.name || note.user.email || "Unknown"} · {formatDate(note.createdAt)}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export function FlagsCard({ matterId, flags }: { matterId: string; flags: MatterFlag[] }) {
  const [isPending, startTransition] = useTransition();
  const [showForm, setShowForm] = useState(false);
  const [flagType, setFlagType] = useState<FlagType>("OTHER");
  const [severity, setSeverity] = useState<FlagSeverity>("MEDIUM");
  const [description, setDescription] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    startTransition(async () => {
      const response = await fetch(`/api/matters/${matterId}/flags`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ flagType, severity, description }),
      });

      if (response.ok) {
        setShowForm(false);
        setFlagType("OTHER");
        setSeverity("MEDIUM");
        setDescription("");
        router.refresh();
      }
    });
  };

  const handleUpdateStatus = async (flagId: string, newStatus: FlagStatus) => {
    startTransition(async () => {
      const response = await fetch(`/api/matters/${matterId}/flags/${flagId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        router.refresh();
      }
    });
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString("en-CA", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  const openFlags = flags.filter((f) => f.status !== "RESOLVED" && f.status !== "DISMISSED");
  const closedFlags = flags.filter((f) => f.status === "RESOLVED" || f.status === "DISMISSED");

  return (
    <div className="space-y-4 rounded-3xl border border-[color:var(--border-muted)] bg-white p-6 shadow-[0_25px_80px_-60px_rgba(15,23,42,0.22)]">
      <header className="space-y-1">
        <p className="text-xs uppercase tracking-[0.3em] text-[color:var(--ink-muted)]">Flags</p>
        <h3 className="font-serif text-xl text-[color:var(--ink)]">Case Flags</h3>
        <p className="text-sm text-[color:var(--ink-muted)]">
          Flag issues or concerns that need attention. Flags help prioritize cases.
        </p>
      </header>

      {!showForm ? (
        <button
          onClick={() => setShowForm(true)}
          className="rounded-full border border-[color:var(--brand)] px-4 py-2 text-sm font-semibold text-[color:var(--brand)] transition hover:bg-[color:var(--brand)] hover:text-white"
        >
          Add Flag
        </button>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3 rounded-xl border border-[color:var(--border-muted)] p-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="space-y-1">
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--ink-muted)]">
                Flag Type
              </span>
              <select
                value={flagType}
                onChange={(e) => setFlagType(e.target.value as FlagType)}
                className="w-full rounded-xl border border-[color:var(--border-muted)] px-3 py-2 text-sm"
              >
                {Object.entries(FLAG_TYPE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-1">
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--ink-muted)]">
                Severity
              </span>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value as FlagSeverity)}
                className="w-full rounded-xl border border-[color:var(--border-muted)] px-3 py-2 text-sm"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="CRITICAL">Critical</option>
              </select>
            </label>
          </div>
          <label className="block space-y-1">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--ink-muted)]">
              Description (optional)
            </span>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full rounded-xl border border-[color:var(--border-muted)] px-3 py-2 text-sm"
            />
          </label>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={isPending}
              className="rounded-full bg-[color:var(--brand)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[color:var(--accent-dark)] disabled:opacity-50"
            >
              {isPending ? "Adding..." : "Add Flag"}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="rounded-full border border-[color:var(--border-muted)] px-4 py-2 text-sm font-semibold text-[color:var(--ink-muted)] hover:bg-[color:var(--bg-muted)]"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Open flags */}
      {openFlags.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--ink-muted)]">
            Open ({openFlags.length})
          </p>
          {openFlags.map((flag) => (
            <div
              key={flag.id}
              className="rounded-xl border border-[color:var(--border-muted)] p-4 space-y-2"
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${SEVERITY_COLORS[flag.severity]}`}>
                  {flag.severity}
                </span>
                <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS_COLORS[flag.status]}`}>
                  {flag.status.replace("_", " ")}
                </span>
                <span className="text-sm font-semibold text-[color:var(--ink)]">
                  {FLAG_TYPE_LABELS[flag.flagType]}
                </span>
              </div>
              {flag.description && (
                <p className="text-sm text-[color:var(--ink-muted)]">{flag.description}</p>
              )}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs text-[color:var(--ink-muted)]">Created {formatDate(flag.createdAt)}</p>
                <div className="flex gap-1">
                  {flag.status === "OPEN" && (
                    <button
                      onClick={() => handleUpdateStatus(flag.id, "IN_PROGRESS")}
                      disabled={isPending}
                      className="rounded-full border border-[color:var(--border-muted)] px-3 py-1 text-xs font-semibold text-[color:var(--ink)] hover:bg-[color:var(--bg-muted)]"
                    >
                      In Progress
                    </button>
                  )}
                  <button
                    onClick={() => handleUpdateStatus(flag.id, "RESOLVED")}
                    disabled={isPending}
                    className="rounded-full border border-green-300 px-3 py-1 text-xs font-semibold text-green-700 hover:bg-green-50"
                  >
                    Resolve
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(flag.id, "DISMISSED")}
                    disabled={isPending}
                    className="rounded-full border border-[color:var(--border-muted)] px-3 py-1 text-xs text-[color:var(--ink-muted)] hover:bg-[color:var(--bg-muted)]"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Closed flags */}
      {closedFlags.length > 0 && (
        <details className="space-y-2">
          <summary className="cursor-pointer text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--ink-muted)]">
            Closed ({closedFlags.length})
          </summary>
          <div className="mt-2 space-y-2">
            {closedFlags.map((flag) => (
              <div
                key={flag.id}
                className="rounded-xl border border-[color:var(--border-muted)] bg-[color:var(--bg-muted)] p-3 opacity-75"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS_COLORS[flag.status]}`}>
                    {flag.status}
                  </span>
                  <span className="text-sm text-[color:var(--ink)]">
                    {FLAG_TYPE_LABELS[flag.flagType]}
                  </span>
                </div>
                {flag.resolvedAt && (
                  <p className="mt-1 text-xs text-[color:var(--ink-muted)]">
                    Closed {formatDate(flag.resolvedAt)}
                  </p>
                )}
              </div>
            ))}
          </div>
        </details>
      )}

      {flags.length === 0 && <p className="text-sm text-[color:var(--ink-muted)]">No flags yet.</p>}
    </div>
  );
}

export function NotesAndFlags({ matterId, notes, flags }: NotesAndFlagsProps) {
  return (
    <div className="space-y-6">
      <FlagsCard matterId={matterId} flags={flags} />
      <NotesCard matterId={matterId} notes={notes} />
    </div>
  );
}
