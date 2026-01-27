'use client';

import { useMemo, useState } from "react";
import { ExtractionResultCard } from "./ExtractionResultCard";

export type ExtractionResult = {
  extractionId: string;
  testatorName?: string | null;
  willDate?: string | null;
  executors: { name?: string; role?: string }[];
  beneficiaries: { name?: string; relationship?: string }[];
  hasCodicils?: boolean | null;
  handwrittenChanges?: boolean | null;
  issues: string[];
};

type ResultItem = {
  id: string;
  title: string;
  value: string;
  status: "pending" | "confirmed" | "removed" | "edited";
};

function buildItems(extraction: ExtractionResult): ResultItem[] {
  const items: ResultItem[] = [];
  if (extraction.testatorName) {
    items.push({ id: "testator", title: "Testator (Person who made the will)", value: extraction.testatorName, status: "pending" });
  }
  if (extraction.willDate) {
    items.push({ id: "willDate", title: "Will date", value: extraction.willDate, status: "pending" });
  }
  extraction.executors.forEach((executor, index) => {
    const role = executor.role ? ` (${executor.role})` : "";
    const value = [executor.name, role].filter(Boolean).join("") || "Unnamed executor";
    items.push({
      id: `executor-${index}`,
      title: "Executor",
      value,
      status: "pending",
    });
  });
  extraction.beneficiaries.forEach((beneficiary, index) => {
    const relationship = beneficiary.relationship ? ` (${beneficiary.relationship})` : "";
    const value = [beneficiary.name, relationship].filter(Boolean).join("") || "Beneficiary";
    items.push({
      id: `beneficiary-${index}`,
      title: "Beneficiary",
      value,
      status: "pending",
    });
  });
  if (typeof extraction.hasCodicils === "boolean") {
    items.push({
      id: "codicils",
      title: "Codicils (amendments)",
      value: extraction.hasCodicils ? "Yes" : "None detected",
      status: "pending",
    });
  }
  if (typeof extraction.handwrittenChanges === "boolean") {
    items.push({
      id: "handwritten",
      title: "Handwritten changes",
      value: extraction.handwrittenChanges ? "Handwritten changes detected" : "None detected",
      status: "pending",
    });
  }
  if (extraction.issues.length) {
    items.push({
      id: "issues",
      title: "Issues",
      value: extraction.issues.map((issue) => `• ${issue}`).join("\n"),
      status: "pending",
    });
  }
  return items;
}

export function ExtractionResults({ extraction }: { extraction: ExtractionResult }) {
  const [items, setItems] = useState<ResultItem[]>(() => buildItems(extraction));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const issues = useMemo(
    () => items.find((item) => item.id === "issues")?.value ?? "",
    [items]
  );

  const updateItem = (id: string, updater: (current: ResultItem) => ResultItem) => {
    setItems((prev) => prev.map((item) => (item.id === id ? updater(item) : item)));
  };

  const visibleItems = items.filter((item) => item.id !== "issues");

  const handleSave = async () => {
    setError(null);
    setSuccess(null);
    const testator = items.find((item) => item.id === "testator");
    const willDate = items.find((item) => item.id === "willDate");
    if (!testator || ["pending", "removed"].includes(testator.status)) {
      setError("Please confirm the testator name before continuing.");
      return;
    }
    if (!willDate || ["pending", "removed"].includes(willDate.status)) {
      setError("Please confirm the will date before continuing.");
      return;
    }

    setSaving(true);
    try {
      const confirmed = items
        .filter((item) => item.status !== "removed")
        .map((item) => ({
          id: item.id,
          title: item.title,
          value: item.value,
          status: item.status,
        }));
      const res = await fetch("/api/will-upload/results/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ extractionId: extraction.extractionId, confirmedItems: confirmed }),
      });
      if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        throw new Error(payload?.error ?? "Could not save your confirmation.");
      }
      setSuccess("Saved. You can continue with your intake answers.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      {issues ? (
        <div className="rounded-lg border-l-4 border-red-400 bg-red-50 px-4 py-3 text-sm text-[color:var(--ink)]">
          <p className="font-semibold">⚠️ Potential issues detected</p>
          <p className="mt-1 whitespace-pre-wrap text-gray-800">{issues}</p>
          <p className="mt-2 text-xs text-slate-700">These might cause problems at court. Consider talking to a BC lawyer.</p>
        </div>
      ) : null}

      {visibleItems.map((item) => (
        <ExtractionResultCard
          key={item.id}
          title={item.title}
          value={item.value}
          status={item.status}
          confidence="AI draft—please review"
          onConfirm={() => updateItem(item.id, (curr) => ({ ...curr, status: "confirmed" }))}
          onRemove={() => updateItem(item.id, (curr) => ({ ...curr, status: "removed" }))}
          onChange={(next) => updateItem(item.id, (curr) => ({ ...curr, status: "edited", value: next || curr.value }))}
        />
      ))}

      {error ? <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}
      {success ? <div className="rounded-lg bg-green-50 px-4 py-3 text-sm text-green-800">{success}</div> : null}

      <button
        type="button"
        onClick={handleSave}
        disabled={saving}
        className="w-full rounded-lg bg-blue-600 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400"
      >
        {saving ? "Saving..." : "Save and continue"}
      </button>
    </div>
  );
}
