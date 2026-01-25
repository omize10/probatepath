"use client";

import { useState } from "react";
import { saveCourtFileNumberAction } from "./actions";

interface CourtFileNumberFormProps {
  caseId: string;
  existingFileNumber: string | null;
}

export function CourtFileNumberForm({ caseId, existingFileNumber }: CourtFileNumberFormProps) {
  const [fileNumber, setFileNumber] = useState(existingFileNumber ?? "");
  const [isPending, setIsPending] = useState(false);

  if (existingFileNumber) {
    return (
      <div className="text-sm text-green-700">
        Court file number saved: <span className="font-mono font-semibold">{existingFileNumber}</span>
      </div>
    );
  }

  return (
    <form
      action={async (formData) => {
        setIsPending(true);
        try {
          await saveCourtFileNumberAction(formData);
        } catch {
          setIsPending(false);
        }
      }}
      className="flex flex-col gap-3 sm:flex-row sm:items-end"
    >
      <input type="hidden" name="caseId" value={caseId} />
      <div className="flex-1">
        <label htmlFor="courtFileNumber" className="block text-xs font-medium text-gray-700 mb-1">
          Court file number
        </label>
        <input
          type="text"
          id="courtFileNumber"
          name="courtFileNumber"
          value={fileNumber}
          onChange={(e) => setFileNumber(e.target.value)}
          placeholder="e.g., VAN-S-S-123456"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>
      <button
        type="submit"
        disabled={isPending || !fileNumber.trim()}
        className="inline-flex items-center justify-center rounded-full bg-amber-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isPending ? "Saving..." : "Save file number"}
      </button>
    </form>
  );
}
