"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import type { Executor } from "@prisma/client";

type ExecutorForm = {
  id?: string;
  fullName: string;
  email: string;
  phone: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  province: string;
  postalCode: string;
  country: string;
  isPrimary: boolean;
  isAlternate: boolean;
  isRenouncing: boolean;
  isMinor: boolean;
  isDeceased: boolean;
  orderIndex: number;
};

type Props = {
  matterId: string;
  initialExecutors: Executor[];
};

const STATUS_LABELS = {
  idle: "Changes auto-save within a moment",
  saving: "Saving…",
  saved: "All changes saved",
  error: "Unable to save executors yet",
} as const;

function mapExecutor(executor: Executor, index: number): ExecutorForm {
  return {
    id: executor.id,
    fullName: executor.fullName,
    email: executor.email ?? "",
    phone: executor.phone ?? "",
    addressLine1: executor.addressLine1 ?? "",
    addressLine2: executor.addressLine2 ?? "",
    city: executor.city ?? "",
    province: executor.province ?? "",
    postalCode: executor.postalCode ?? "",
    country: executor.country ?? "",
    isPrimary: executor.isPrimary,
    isAlternate: executor.isAlternate,
    isRenouncing: executor.isRenouncing,
    isMinor: executor.isMinor,
    isDeceased: executor.isDeceased,
    orderIndex: executor.orderIndex ?? index,
  };
}

function blankExecutor(orderIndex: number): ExecutorForm {
  return {
    fullName: "",
    email: "",
    phone: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    province: "British Columbia",
    postalCode: "",
    country: "Canada",
    isPrimary: orderIndex === 0,
    isAlternate: false,
    isRenouncing: false,
    isMinor: false,
    isDeceased: false,
    orderIndex,
  };
}

export function ExecutorsEditor({ matterId, initialExecutors }: Props) {
  const [executors, setExecutors] = useState<ExecutorForm[]>(
    initialExecutors.length > 0 ? initialExecutors.map(mapExecutor) : [blankExecutor(0)],
  );
  const [status, setStatus] = useState<keyof typeof STATUS_LABELS>("idle");
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const debounce = useRef<NodeJS.Timeout | null>(null);
  const skipInitial = useRef(true);

  const payload = useMemo(
    () => executors.map((executor, index) => ({ ...executor, orderIndex: index })),
    [executors],
  );

  const statusText = STATUS_LABELS[status];

  const save = async () => {
    if (!matterId) return;
    setStatus("saving");
    setError(null);
    try {
      const response = await fetch(`/api/matter/${matterId}/executors`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ executors: payload }),
      });
      if (!response.ok) {
        throw new Error("Unable to save executor details.");
      }
      const data = await response.json();
      setExecutors(
        (data.executors ?? payload).map((executor: ExecutorForm) => ({
          ...executor,
          email: executor.email ?? "",
          phone: executor.phone ?? "",
          addressLine1: executor.addressLine1 ?? "",
          addressLine2: executor.addressLine2 ?? "",
          city: executor.city ?? "",
          province: executor.province ?? "",
          postalCode: executor.postalCode ?? "",
          country: executor.country ?? "",
        })),
      );
      setStatus("saved");
      setTimeout(() => setStatus("idle"), 1200);
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Unable to save yet");
      toast({ title: "Unable to save", description: "Try again in a few moments.", intent: "warning" });
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

  const handleChange = (index: number, field: keyof ExecutorForm, value: string | boolean) => {
    setExecutors((current) =>
      current.map((executor, idx) =>
        idx === index
          ? {
              ...executor,
              [field]: value,
              isPrimary: field === "isPrimary" && value ? true : executor.isPrimary,
            }
          : field === "isPrimary" && value
          ? { ...executor, isPrimary: false }
          : executor,
      ),
    );
  };

  const handleAdd = () => {
    setExecutors((current) => [...current, blankExecutor(current.length)]);
  };

  const handleRemove = (index: number) => {
    setExecutors((current) => current.filter((_, idx) => idx !== index));
  };

  const setPrimary = (index: number) => {
    setExecutors((current) =>
      current.map((executor, idx) => ({ ...executor, isPrimary: idx === index })),
    );
  };

  return (
    <div className="portal-card space-y-6 p-6">
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-[0.3em] text-[color:var(--ink-muted)]">Executors</p>
        <h2 className="text-2xl font-serif text-[color:var(--ink)]">Executor & estate team</h2>
        <p className="text-sm text-[color:var(--ink-muted)]">
          Add every executor so we can automatically craft schedules and notices. Autosaving happens behind the scenes.
        </p>
      </div>

      <div className="space-y-4">
        {executors.map((executor, index) => (
          <div key={`${executor.id ?? "new"}-${index}`} className="rounded-2xl border border-[color:var(--border-muted)] p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-[color:var(--ink)]">
                  {executor.fullName || `Executor ${index + 1}`}
                </p>
                <p className="text-xs text-[color:var(--ink-muted)]">
                  {executor.isPrimary ? "Primary" : executor.isAlternate ? "Alternate" : "Additional"}
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={() => setPrimary(index)}>
                  {executor.isPrimary ? "Primary" : "Set as primary"}
                </Button>
                {executors.length > 1 ? (
                  <Button variant="ghost" size="sm" onClick={() => handleRemove(index)}>
                    Remove
                  </Button>
                ) : null}
              </div>
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <label className="space-y-1 text-sm text-[color:var(--ink-muted)]">
                Full name
                <Input value={executor.fullName} onChange={(event) => handleChange(index, "fullName", event.target.value)} />
              </label>
              <label className="space-y-1 text-sm text-[color:var(--ink-muted)]">
                Email
                <Input type="email" value={executor.email} onChange={(event) => handleChange(index, "email", event.target.value)} />
              </label>
              <label className="space-y-1 text-sm text-[color:var(--ink-muted)]">
                Phone
                <Input value={executor.phone} onChange={(event) => handleChange(index, "phone", event.target.value)} />
              </label>
              <label className="space-y-1 text-sm text-[color:var(--ink-muted)]">
                City
                <Input value={executor.city} onChange={(event) => handleChange(index, "city", event.target.value)} />
              </label>
              <label className="space-y-1 text-sm text-[color:var(--ink-muted)]">
                Province
                <Input value={executor.province} onChange={(event) => handleChange(index, "province", event.target.value)} />
              </label>
              <label className="space-y-1 text-sm text-[color:var(--ink-muted)]">
                Postal code
                <Input value={executor.postalCode} onChange={(event) => handleChange(index, "postalCode", event.target.value)} />
              </label>
            </div>
            <div className="mt-3 grid gap-3 md:grid-cols-3">
              <label className="flex items-center gap-2 text-sm text-[color:var(--ink-muted)]">
                <input
                  type="checkbox"
                  checked={executor.isAlternate}
                  onChange={(event) => handleChange(index, "isAlternate", event.target.checked)}
                  className="h-4 w-4 accent-[color:var(--brand)]"
                />
                Alternate executor
              </label>
              <label className="flex items-center gap-2 text-sm text-[color:var(--ink-muted)]">
                <input
                  type="checkbox"
                  checked={executor.isRenouncing}
                  onChange={(event) => handleChange(index, "isRenouncing", event.target.checked)}
                  className="h-4 w-4 accent-[color:var(--brand)]"
                />
                Renouncing
              </label>
              <label className="flex items-center gap-2 text-sm text-[color:var(--ink-muted)]">
                <input
                  type="checkbox"
                  checked={executor.isMinor}
                  onChange={(event) => handleChange(index, "isMinor", event.target.checked)}
                  className="h-4 w-4 accent-[color:var(--brand)]"
                />
                Minor
              </label>
            </div>
            <div className="mt-2 grid gap-3 md:grid-cols-2">
              <label className="flex items-center gap-2 text-sm text-[color:var(--ink-muted)]">
                <input
                  type="checkbox"
                  checked={executor.isDeceased}
                  onChange={(event) => handleChange(index, "isDeceased", event.target.checked)}
                  className="h-4 w-4 accent-[color:var(--brand)]"
                />
                Deceased
              </label>
              <label className="space-y-1 text-sm text-[color:var(--ink-muted)]">
                Address
                <Input
                  value={executor.addressLine1}
                  onChange={(event) => handleChange(index, "addressLine1", event.target.value)}
                  placeholder="Street"
                />
              </label>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between text-sm text-[color:var(--ink-muted)]">
        <p>{statusText}</p>
        {error ? <p className="text-[color:var(--warning)]">{error}</p> : null}
      </div>

      <div className="flex flex-wrap gap-3">
        <Button variant="ghost" onClick={handleAdd}>
          Add another executor
        </Button>
      </div>
    </div>
  );
}
