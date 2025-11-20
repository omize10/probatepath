"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toast";
import type { Beneficiary } from "@prisma/client";

type BeneficiaryForm = {
  id?: string;
  type: Beneficiary["type"];
  status: Beneficiary["status"];
  fullName: string;
  relationshipLabel: string;
  isMinor: boolean;
  dateOfBirth: string;
  addressLine1: string;
  city: string;
  province: string;
  postalCode: string;
  country: string;
  shareDescription: string;
  notes: string;
};

type Props = {
  matterId: string;
  initialBeneficiaries: Beneficiary[];
};

const typeOptions: Beneficiary["type"][] = [
  "SPOUSE",
  "CHILD",
  "STEPCHILD",
  "GRANDCHILD",
  "PARENT",
  "SIBLING",
  "OTHER_FAMILY",
  "CHARITY",
  "OTHER",
];
const statusOptions: Beneficiary["status"][] = ["ALIVE", "DECEASED_BEFORE_WILL", "DECEASED_AFTER_WILL", "UNKNOWN"];

const STATUS_LABELS = {
  idle: "Changes auto-save within a moment",
  saving: "Saving…",
  saved: "All changes saved",
  error: "Unable to save beneficiaries yet",
} as const;

function mapBeneficiary(beneficiary: Beneficiary): BeneficiaryForm {
  return {
    id: beneficiary.id,
    type: beneficiary.type,
    status: beneficiary.status,
    fullName: beneficiary.fullName,
    relationshipLabel: beneficiary.relationshipLabel ?? "",
    isMinor: beneficiary.isMinor,
    dateOfBirth: beneficiary.dateOfBirth ? beneficiary.dateOfBirth.toISOString().slice(0, 10) : "",
    addressLine1: beneficiary.addressLine1 ?? "",
    city: beneficiary.city ?? "",
    province: beneficiary.province ?? "British Columbia",
    postalCode: beneficiary.postalCode ?? "",
    country: beneficiary.country ?? "Canada",
    shareDescription: beneficiary.shareDescription ?? "",
    notes: beneficiary.notes ?? "",
  };
}

function blankBeneficiary(): BeneficiaryForm {
  return {
    type: "OTHER",
    status: "ALIVE",
    fullName: "",
    relationshipLabel: "",
    isMinor: false,
    dateOfBirth: "",
    addressLine1: "",
    city: "",
    province: "British Columbia",
    postalCode: "",
    country: "Canada",
    shareDescription: "",
    notes: "",
  };
}

export function BeneficiariesEditor({ matterId, initialBeneficiaries }: Props) {
  const [beneficiaries, setBeneficiaries] = useState<BeneficiaryForm[]>(
    initialBeneficiaries.length > 0 ? initialBeneficiaries.map(mapBeneficiary) : [blankBeneficiary()],
  );
  const [status, setStatus] = useState<keyof typeof STATUS_LABELS>("idle");
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const debounce = useRef<NodeJS.Timeout | null>(null);
  const skipInitial = useRef(true);

  const statusText = STATUS_LABELS[status];

  const payload = useMemo(() => beneficiaries, [beneficiaries]);

  const save = async () => {
    if (!matterId) return;
    setStatus("saving");
    setError(null);
    try {
      const response = await fetch(`/api/matter/${matterId}/beneficiaries`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ beneficiaries: payload }),
      });
      if (!response.ok) {
        throw new Error("Unable to save beneficiaries.");
      }
      const data = await response.json();
      setBeneficiaries(
        (data.beneficiaries ?? payload).map((beneficiary: BeneficiaryForm) => ({
          ...beneficiary,
          relationshipLabel: beneficiary.relationshipLabel ?? "",
          shareDescription: beneficiary.shareDescription ?? "",
          notes: beneficiary.notes ?? "",
          addressLine1: beneficiary.addressLine1 ?? "",
          city: beneficiary.city ?? "",
          province: beneficiary.province ?? "",
          postalCode: beneficiary.postalCode ?? "",
          country: beneficiary.country ?? "",
        })),
      );
      setStatus("saved");
      setTimeout(() => setStatus("idle"), 1200);
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Unable to save yet");
      toast({ title: "Save failed", description: "Try again soon.", intent: "warning" });
    }
  };

  useEffect(() => {
    if (skipInitial.current) {
      skipInitial.current = false;
      return;
    }
    if (debounce.current) {
      clearTimeout(debounce.current);
    }
    debounce.current = setTimeout(() => {
      void save();
    }, 500);
    return () => {
      if (debounce.current) {
        clearTimeout(debounce.current);
      }
    };
  }, [payload]);

  const handleChange = (index: number, field: keyof BeneficiaryForm, value: string | boolean) => {
    setBeneficiaries((current) =>
      current.map((beneficiary, idx) => (idx === index ? { ...beneficiary, [field]: value } : beneficiary)),
    );
  };

  const addBeneficiary = () => {
    setBeneficiaries((current) => [...current, blankBeneficiary()]);
  };

  const removeBeneficiary = (index: number) => {
    setBeneficiaries((current) => current.filter((_, idx) => idx !== index));
  };

  return (
    <div className="portal-card space-y-6 p-6">
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-[0.3em] text-[color:var(--ink-muted)]">Beneficiaries</p>
        <h2 className="text-2xl font-serif text-[color:var(--ink)]">Beneficiaries & shares</h2>
        <p className="text-sm text-[color:var(--ink-muted)]">
          List every beneficiary — including minors, charities, and any relatives who have passed. We handle additional schedules automatically.
        </p>
      </div>

      <div className="space-y-4">
        {beneficiaries.map((beneficiary, index) => (
          <div key={`${beneficiary.id ?? "new"}-${index}`} className="rounded-2xl border border-[color:var(--border-muted)] p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-[color:var(--ink)]">{beneficiary.fullName || `Beneficiary ${index + 1}`}</p>
              {beneficiaries.length > 1 ? (
                <Button variant="ghost" size="sm" onClick={() => removeBeneficiary(index)}>
                  Remove
                </Button>
              ) : null}
            </div>
            <div className="mt-3 grid gap-3 md:grid-cols-3">
              <label className="text-sm text-[color:var(--ink-muted)]">
                Type
                <select
                  value={beneficiary.type}
                  onChange={(event) => handleChange(index, "type", event.target.value)}
                  className="mt-1 w-full rounded-2xl border border-[color:var(--border-muted)] bg-[color:var(--bg-surface)] px-3 py-2 text-sm text-[color:var(--ink)]"
                >
                  {typeOptions.map((option) => (
                    <option key={option} value={option}>
                      {option.replace(/_/g, " ").toLowerCase()}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-sm text-[color:var(--ink-muted)]">
                Status
                <select
                  value={beneficiary.status}
                  onChange={(event) => handleChange(index, "status", event.target.value)}
                  className="mt-1 w-full rounded-2xl border border-[color:var(--border-muted)] bg-[color:var(--bg-surface)] px-3 py-2 text-sm text-[color:var(--ink)]"
                >
                  {statusOptions.map((option) => (
                    <option key={option} value={option}>
                      {option.replace(/_/g, " ").toLowerCase()}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex items-center gap-2 text-sm text-[color:var(--ink-muted)]">
                <input
                  type="checkbox"
                  checked={beneficiary.isMinor}
                  onChange={(event) => handleChange(index, "isMinor", event.target.checked)}
                  className="h-4 w-4 accent-[color:var(--brand)]"
                />
                Minor
              </label>
            </div>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              <label className="space-y-1 text-sm text-[color:var(--ink-muted)]">
                Full legal name
                <Input value={beneficiary.fullName} onChange={(event) => handleChange(index, "fullName", event.target.value)} />
              </label>
              <label className="space-y-1 text-sm text-[color:var(--ink-muted)]">
                Relationship
                <Input
                  value={beneficiary.relationshipLabel}
                  onChange={(event) => handleChange(index, "relationshipLabel", event.target.value)}
                />
              </label>
              <label className="space-y-1 text-sm text-[color:var(--ink-muted)]">
                Date of birth
                <Input type="date" value={beneficiary.dateOfBirth} onChange={(event) => handleChange(index, "dateOfBirth", event.target.value)} />
              </label>
              <label className="space-y-1 text-sm text-[color:var(--ink-muted)]">
                City
                <Input value={beneficiary.city} onChange={(event) => handleChange(index, "city", event.target.value)} />
              </label>
            </div>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              <label className="space-y-1 text-sm text-[color:var(--ink-muted)]">
                Share description
                <Textarea value={beneficiary.shareDescription} onChange={(event) => handleChange(index, "shareDescription", event.target.value)} />
              </label>
              <label className="space-y-1 text-sm text-[color:var(--ink-muted)]">
                Notes
                <Textarea value={beneficiary.notes} onChange={(event) => handleChange(index, "notes", event.target.value)} />
              </label>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between text-sm text-[color:var(--ink-muted)]">
        <p>{statusText}</p>
        {error ? <p className="text-[color:var(--warning)]">{error}</p> : null}
      </div>

      <Button variant="ghost" onClick={addBeneficiary}>
        Add beneficiary
      </Button>
    </div>
  );
}
