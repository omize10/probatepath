"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toast";
import type { WillSearchRequest } from "@prisma/client";

type ExecutorFields = {
  email: string;
  fullName: string;
  phone: string;
  city: string;
  relationship: string;
};

type DeceasedFields = {
  fullName: string;
  dateOfDeath: string;
  dateOfBirth: string;
  placeOfBirth: string;
  marriedSurname: string;
  city: string;
  province: string;
  hasWill: boolean;
};

type MailingPreference = "service_bc_dropoff" | "courier" | "";
const mailingOptions: MailingPreference[] = ["service_bc_dropoff", "courier"];

function normalizeMailingPreference(value?: string | null | undefined): MailingPreference {
  if (value === "courier" || value === "service_bc_dropoff") {
    return value;
  }
  return "service_bc_dropoff";
}

type Props = {
  matterId?: string | null;
  initial?: WillSearchRequest | null;
};

const STATUS_LABELS = {
  idle: "Auto-save is inactive",
  saving: "Saving…",
  saved: "Saved",
  error: "Unable to save",
} as const;

function normalizeExecutor(saved?: WillSearchRequest | null): ExecutorFields {
  return {
    email: saved?.executorEmail ?? "",
    fullName: saved?.executorFullName ?? "",
    phone: saved?.executorPhone ?? "",
    city: saved?.executorCity ?? "",
    relationship: saved?.executorRelationship ?? "",
  };
}

function normalizeDeceased(saved?: WillSearchRequest | null): DeceasedFields {
  return {
    fullName: saved?.deceasedFullName ?? "",
    dateOfDeath: saved?.deceasedDateOfDeath ? saved.deceasedDateOfDeath.toISOString().slice(0, 10) : "",
    dateOfBirth: saved?.deceasedDateOfBirth ? saved.deceasedDateOfBirth.toISOString().slice(0, 10) : "",
    placeOfBirth: saved?.deceasedPlaceOfBirth ?? "",
    marriedSurname: saved?.deceasedMarriedSurname ?? "",
    city: saved?.deceasedCity ?? "",
    province: saved?.deceasedProvince ?? "British Columbia",
    hasWill: saved?.hasWill ?? false,
  };
}

export function WillSearchForm({ matterId, initial }: Props) {
  const [executor, setExecutor] = useState(() => normalizeExecutor(initial));
  const [deceased, setDeceased] = useState(() => normalizeDeceased(initial));
  const [searchNotes, setSearchNotes] = useState(initial?.searchNotes ?? "");
  const [aliasesText, setAliasesText] = useState(() => (initial?.deceasedAliases && initial.deceasedAliases.length > 0 ? initial.deceasedAliases.join("\n") : ""));
  const [mailingPreference, setMailingPreference] = useState<MailingPreference>(
    normalizeMailingPreference(initial?.mailingPreference),
  );
  const [courierAddress, setCourierAddress] = useState(initial?.courierAddress ?? "");
  const [status, setStatus] = useState<keyof typeof STATUS_LABELS>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [resolvedMatterId, setResolvedMatterId] = useState(() => matterId ?? "");

  const statusText = useMemo(() => STATUS_LABELS[status], [status]);
  const { toast } = useToast();
  const skipInitial = useRef(true);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  const aliasList = useMemo(
    () =>
      aliasesText
        .split(/[\n,]+/)
        .map((alias) => alias.trim())
        .filter((alias, index, arr) => alias.length > 0 && arr.indexOf(alias) === index),
    [aliasesText],
  );

  useEffect(() => {
    if (matterId && !resolvedMatterId) {
      setResolvedMatterId(matterId);
    }
  }, [matterId, resolvedMatterId]);

  const payload = useMemo(
    () => ({
      matterId: resolvedMatterId || undefined,
      executor,
      deceased,
      deceasedExtraAliases: aliasList,
      searchNotes,
      mailingPreference,
      courierAddress: mailingPreference === "courier" ? courierAddress : "",
    }),
    [resolvedMatterId, executor, deceased, aliasList, searchNotes, mailingPreference, courierAddress],
  );

  const save = async ({ showToast = false } = {}) => {
    setStatus("saving");
    setErrorMessage(null);
    try {
      const response = await fetch("/api/will-search/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json().catch(() => null);
      if (response.status === 401 || response.status === 403) {
        throw new Error("Please sign in again to keep saving your will search.");
      }
      if (!response.ok || !result?.ok) {
        throw new Error(result?.error ?? "Unable to save will search yet.");
      }
      if (typeof result.matterId === "string" && result.matterId.length > 0 && result.matterId !== resolvedMatterId) {
        setResolvedMatterId(result.matterId);
      }
      setStatus("saved");
      if (showToast) {
        toast({ title: "Package ready", description: "We saved your details and regenerated schedules.", intent: "success" });
      }
      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to save will search.";
      setStatus("error");
      setErrorMessage(message);
      toast({ title: "Save failed", description: message, intent: "error" });
      return false;
    }
  };

  useEffect(() => {
    if (skipInitial.current) {
      skipInitial.current = false;
      return;
    }
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    debounceTimer.current = setTimeout(() => {
      void save();
    }, 450);
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [payload, matterId]);

  const handleGenerate = async () => {
    if (!executor.email || !executor.fullName || !deceased.fullName) {
      toast({
        title: "Missing information",
        description: "Please fill executor name, email, and deceased name before generating the package.",
        intent: "warning",
      });
      return;
    }
    const ok = await save({ showToast: true });
    if (ok) {
      window.location.href = "/portal/documents";
    }
  };

  return (
    <div className="portal-card space-y-8 p-6">
      <div className="space-y-3">
        <p className="text-xs uppercase tracking-[0.3em] text-[color:var(--ink-muted)]">Will search</p>
        <h2 className="text-2xl font-serif text-[color:var(--ink)]">Will search request (VSA 532)</h2>
        <p className="text-sm text-[color:var(--ink-muted)]">
          Tell us who is searching for the will and what you already know. Autosave keeps your progress safe.
        </p>
      </div>

      <div className="space-y-6">
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-[color:var(--ink)]">Executor details</h3>
            <p className="text-xs text-[color:var(--ink-muted)]">Full legal name (exactly as on your government ID, including all middle names).</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-1 text-sm text-[color:var(--ink-muted)]">
              Full legal name
              <Input
                value={executor.fullName}
                onChange={(event) => setExecutor((prev) => ({ ...prev, fullName: event.target.value }))}
                placeholder="E.g. Jordan Avery Larkin"
              />
            </label>
            <label className="space-y-1 text-sm text-[color:var(--ink-muted)]">
              Email
              <Input
                type="email"
                value={executor.email}
                onChange={(event) => setExecutor((prev) => ({ ...prev, email: event.target.value }))}
                placeholder="executor@example.com"
              />
            </label>
            <label className="space-y-1 text-sm text-[color:var(--ink-muted)]">
              Phone
              <Input value={executor.phone} onChange={(event) => setExecutor((prev) => ({ ...prev, phone: event.target.value }))} />
            </label>
            <label className="space-y-1 text-sm text-[color:var(--ink-muted)]">
              City
              <Input value={executor.city} onChange={(event) => setExecutor((prev) => ({ ...prev, city: event.target.value }))} />
            </label>
            <label className="space-y-1 text-sm text-[color:var(--ink-muted)]">
              Relationship to deceased
              <Input value={executor.relationship} onChange={(event) => setExecutor((prev) => ({ ...prev, relationship: event.target.value }))} />
            </label>
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-[color:var(--ink)]">Deceased details</h3>
            <p className="text-xs text-[color:var(--ink-muted)]">Full legal name (exactly as on the death certificate, including all middle names).</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-1 text-sm text-[color:var(--ink-muted)]">
              Full legal name
              <Input
                value={deceased.fullName}
                onChange={(event) => setDeceased((prev) => ({ ...prev, fullName: event.target.value }))}
                placeholder="E.g. Marissa June Holloway"
              />
            </label>
            <label className="space-y-1 text-sm text-[color:var(--ink-muted)]">
              Date of death
              <Input type="date" value={deceased.dateOfDeath} onChange={(event) => setDeceased((prev) => ({ ...prev, dateOfDeath: event.target.value }))} />
            </label>
            <label className="space-y-1 text-sm text-[color:var(--ink-muted)]">
              City
              <Input value={deceased.city} onChange={(event) => setDeceased((prev) => ({ ...prev, city: event.target.value }))} />
            </label>
            <label className="space-y-1 text-sm text-[color:var(--ink-muted)]">
              Province
              <Input value={deceased.province} onChange={(event) => setDeceased((prev) => ({ ...prev, province: event.target.value }))} />
            </label>
            <label className="flex items-center gap-2 text-sm text-[color:var(--ink-muted)]">
              <input
                type="checkbox"
                checked={deceased.hasWill}
                onChange={(event) => setDeceased((prev) => ({ ...prev, hasWill: event.target.checked }))}
              />
              Has a will donor slip? (check if you already found a will)
            </label>
          </div>
        </section>

        <section className="space-y-3">
          <label className="space-y-1 text-sm text-[color:var(--ink-muted)]">
            Other names or aliases they were known by
            <Textarea
              value={aliasesText}
              onChange={(event) => setAliasesText(event.target.value)}
              placeholder="Will, Bill, Billy"
            />
            <p className="text-xs text-[color:var(--ink-muted)]">
              Optional. Separate names with commas or new lines. Include nicknames or alternate spellings.
            </p>
          </label>
        </section>

        <section className="space-y-3">
          <label className="text-sm text-[color:var(--ink-muted)]">
            Where have you searched so far?
            <Textarea value={searchNotes} onChange={(event) => setSearchNotes(event.target.value)} placeholder="Service BC, Vancouver, etc." />
          </label>
        </section>

        <section className="space-y-2">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[color:var(--ink-muted)]">Mail preference</p>
          <div className="flex flex-wrap gap-4">
            {mailingOptions.map((option) => (
              <label key={option} className="inline-flex items-center gap-2 text-sm text-[color:var(--ink)]">
                <input
                  type="radio"
                  name="mailingPreference"
                  value={option}
                  checked={mailingPreference === option}
                  onChange={() => setMailingPreference(option)}
                  className="h-4 w-4 accent-[color:var(--brand)]"
                />
                {option === "courier" ? "Courier" : "Service BC drop-off"}
              </label>
            ))}
          </div>
          {mailingPreference === "courier" ? (
            <label className="text-sm text-[color:var(--ink-muted)]">
              Courier address
              <Textarea value={courierAddress} onChange={(event) => setCourierAddress(event.target.value)} placeholder="Name, street, city, postal code" />
            </label>
          ) : null}
        </section>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[color:var(--border-muted)] pt-4 text-xs text-[color:var(--ink-muted)]">
        <p>{statusText}</p>
        <div className="flex items-center gap-3">
          {errorMessage ? <p className="text-xs text-[color:var(--warning)]">{errorMessage}</p> : null}
          <Button onClick={handleGenerate} variant="secondary">
            Generate will search package
          </Button>
        </div>
      </div>
    </div>
  );
}
