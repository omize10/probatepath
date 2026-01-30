"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function DeleteCaseButton({ matterId, clientName }: { matterId: string; clientName: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    setDeleting(true);
    const res = await fetch(`/api/ops/cases/${matterId}`, { method: "DELETE" });
    if (res.ok) {
      router.refresh();
    } else {
      alert("Failed to delete case.");
    }
    setDeleting(false);
    setConfirming(false);
  }

  if (confirming) {
    return (
      <span className="inline-flex items-center gap-1">
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="rounded-full bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-60"
        >
          {deleting ? "..." : "Confirm"}
        </button>
        <button
          onClick={() => setConfirming(false)}
          className="rounded-full border border-[color:var(--border-muted)] px-3 py-1.5 text-xs font-semibold text-[color:var(--ink-muted)] hover:bg-gray-100"
        >
          Cancel
        </button>
      </span>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      title={`Delete ${clientName}`}
      className="rounded-full border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 transition"
    >
      Delete
    </button>
  );
}
