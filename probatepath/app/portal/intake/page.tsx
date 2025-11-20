'use client';

import { useMemo, useState } from "react";
import Link from "next/link";
import { z } from "zod";
import { PortalShell } from "@/components/portal/PortalShell";
import { StepShell } from "@/components/portal/StepShell";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { usePortalStore, updatePortalDraft } from "@/lib/portal/store";
import type { PortalDraft } from "@/lib/portal/mock";
import { downloadJson } from "@/lib/portal/docs";
import { useToast } from "@/components/ui/toast";

const steps = [
  { id: "welcome", title: "Welcome & consent", description: "We autosave every keystroke. Enter the executor email and confirm consent.", image: "/portal/hero.jpg", alt: "Portal welcome" },
  { id: "executor", title: "Executor details", description: "Who is leading the filing? Share contact info so the documents populate correctly.", image: "/portal/trust-1.jpg", alt: "Executor details" },
  { id: "deceased", title: "Deceased information", description: "These answers populate the court forms and registry cover letter.", image: "/portal/trust-2.jpg", alt: "Deceased details" },
  { id: "willSearch", title: "Will search helper", description: "Document your search and prep the request packet.", image: "/portal/willsearch-1.jpg", alt: "Will search" },
  { id: "notices", title: "Notices", description: "List everyone getting section 121 notices and log the delivery method.", image: "/portal/notices-1.jpg", alt: "Notices" },
  { id: "review", title: "Review & confirm", description: "Double-check everything before marking it complete.", image: "/portal/assemble-2.jpg", alt: "Review" },
  { id: "done", title: "All done", description: "Download the JSON summary or jump to assembly.", image: "/portal/hero.jpg", alt: "Done" },
] as const;

type StepId = (typeof steps)[number]["id"];

const mustBeTrue = (message: string) => z.boolean().refine((value) => value === true, { message });

const schemas: Partial<Record<StepId, z.ZodTypeAny>> = {
  welcome: z.object({
    email: z.string().email("Enter a valid email"),
    consent: mustBeTrue("Consent required"),
  }),
  executor: z.object({
    fullName: z.string().min(2, "Name required"),
    phone: z.string().min(7, "Phone required"),
    city: z.string().min(2, "City required"),
    relation: z.string().min(2, "Relation required"),
  }),
  deceased: z.object({
    fullName: z.string().min(2, "Name required"),
    dateOfDeath: z.string().min(1, "Date required"),
    city: z.string().min(2, "City required"),
    province: z.string().min(2, "Province required"),
    hadWill: z.enum(["yes", "no"]),
  }),
  willSearch: z.object({
    searchAreas: z.string().min(5, "Add a short description"),
    mailingPreference: z.string().min(2, "Choose a method"),
    packetPrepared: mustBeTrue("Generate the packet"),
  }),
  notices: z.object({
    recipients: z.string().min(5, "List recipients"),
    deliveryMethod: z.string().min(2, "Select a method"),
    mailed: mustBeTrue("Mark as mailed"),
  }),
  review: z.object({
    confirmed: mustBeTrue("Confirm before continuing"),
  }),
};

export default function IntakePage() {
  const { toast } = useToast();
  const draft = usePortalStore((state) => state.draft);
  const [stepIndex, setStepIndex] = useState(0);

  const current = steps[stepIndex];
  const totalSteps = steps.length;

  const validation = useMemo(() => {
    const schema = schemas[current.id];
    if (!schema) return { success: true } as const;
    return schema.safeParse(getSectionValue(draft, current.id));
  }, [current.id, draft]);

  const fieldErrors = !validation.success && "error" in validation ? validation.error.flatten().fieldErrors : {};
  const nextDisabled = current.id !== "done" && !validation.success;

  const goNext = () => {
    if (current.id === "done") return;
    if (!validation.success) {
      return;
    }
    if (stepIndex < totalSteps - 1) {
      setStepIndex((prev) => prev + 1);
    }
  };

  const goBack = () => {
    if (stepIndex === 0) return;
    setStepIndex((prev) => prev - 1);
  };

  const handleDownload = () => {
    downloadJson("probatepath-intake.json", draft);
    toast({ title: "JSON ready", description: "Check your downloads folder.", intent: "success" });
  };

  if (current.id === "done") {
    return (
      <PortalShell title="Intake complete" description="Your answers stay in this browser. Download a backup anytime.">
        <div className="portal-card p-8">
          <p className="text-sm uppercase tracking-[0.3em] text-[color:var(--ink-muted)]">All steps finished</p>
          <h2 className="mt-3 font-serif text-3xl text-[color:var(--ink)]">Great work. Ready for assembly?</h2>
          <p className="mt-2 text-sm text-[color:var(--ink-muted)]">Resume the rolling checklist or jump into documents.</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button onClick={handleDownload}>
              Download JSON
            </Button>
            <Button asChild variant="secondary">
              <Link href="/portal/how-to-assemble">How to assemble</Link>
            </Button>
            <Button asChild variant="secondary">
              <Link href="/portal/process">Back to checklist</Link>
            </Button>
          </div>
        </div>
      </PortalShell>
    );
  }

  return (
    <PortalShell title="Portal intake" description="Autosave is on. Use this guided flow to keep every answer consistent with the BC probate forms.">
      <StepShell
        step={stepIndex + 1}
        totalSteps={totalSteps}
        title={current.title}
        description={current.description}
        image={current.image}
        imageAlt={current.alt}
        onNext={goNext}
        onBack={stepIndex > 0 ? goBack : undefined}
        nextLabel={stepIndex === totalSteps - 2 ? "Finish" : "Next"}
        nextDisabled={nextDisabled}
      >
        {renderStepFields(current.id, draft, fieldErrors)}
      </StepShell>
    </PortalShell>
  );
}

function renderStepFields(step: StepId, draft: PortalDraft, errors: Record<string, string[] | undefined>) {
  const showError = (key: string) => (errors[key]?.[0] ? <p className="text-xs font-medium text-[color:var(--warning)]">{errors[key]?.[0]}</p> : null);

  switch (step) {
    case "welcome":
      return (
        <div className="space-y-4">
          <div>
            <label htmlFor="welcome-email" className="text-sm font-semibold text-[color:var(--ink)]">
              Executor email
            </label>
            <Input
              id="welcome-email"
              type="email"
              value={draft.intake.welcome.email}
              onChange={(event) => updatePortalDraft((d) => { d.intake.welcome.email = event.target.value; })}
            />
            {showError("email")}
          </div>
          <label className="inline-flex items-center gap-3 text-sm text-[color:var(--ink)]">
            <input
              type="checkbox"
              checked={draft.intake.welcome.consent}
              onChange={(event) => updatePortalDraft((d) => { d.intake.welcome.consent = event.target.checked; })}
              className="h-4 w-4 rounded border-[color:var(--border-muted)]"
              style={{ accentColor: "var(--brand-orange)" }}
            />
            I consent to using ProbatePath for document preparation and understand executors remain self-represented.
          </label>
          {showError("consent")}
        </div>
      );
    case "executor":
      return (
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Full name"
            id="executor-name"
            value={draft.intake.executor.fullName}
            onChange={(value) => updatePortalDraft((d) => { d.intake.executor.fullName = value; })}
            error={errors.fullName?.[0]}
          />
          <Field
            label="Phone"
            id="executor-phone"
            value={draft.intake.executor.phone}
            onChange={(value) => updatePortalDraft((d) => { d.intake.executor.phone = value; })}
            error={errors.phone?.[0]}
          />
          <Field
            label="City"
            id="executor-city"
            value={draft.intake.executor.city}
            onChange={(value) => updatePortalDraft((d) => { d.intake.executor.city = value; })}
            error={errors.city?.[0]}
          />
          <Field
            label="Relation"
            id="executor-relation"
            value={draft.intake.executor.relation}
            onChange={(value) => updatePortalDraft((d) => { d.intake.executor.relation = value; })}
            error={errors.relation?.[0]}
          />
        </div>
      );
    case "deceased":
      return (
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Full name"
            id="deceased-name"
            value={draft.intake.deceased.fullName}
            onChange={(value) => updatePortalDraft((d) => { d.intake.deceased.fullName = value; })}
            error={errors.fullName?.[0]}
          />
          <div>
            <label htmlFor="deceased-date" className="text-sm font-semibold text-[color:var(--ink)]">
              Date of death
            </label>
            <Input
              id="deceased-date"
              type="date"
              value={draft.intake.deceased.dateOfDeath}
              onChange={(event) => updatePortalDraft((d) => { d.intake.deceased.dateOfDeath = event.target.value; })}
            />
            {showError("dateOfDeath")}
          </div>
          <Field
            label="City"
            id="deceased-city"
            value={draft.intake.deceased.city}
            onChange={(value) => updatePortalDraft((d) => { d.intake.deceased.city = value; })}
            error={errors.city?.[0]}
          />
          <Field
            label="Province"
            id="deceased-province"
            value={draft.intake.deceased.province}
            onChange={(value) => updatePortalDraft((d) => { d.intake.deceased.province = value; })}
            error={errors.province?.[0]}
          />
          <div className="sm:col-span-2">
            <label htmlFor="deceased-will" className="text-sm font-semibold text-[color:var(--ink)]">
              Did they leave a will?
            </label>
            <select
              id="deceased-will"
              value={draft.intake.deceased.hadWill}
              onChange={(event) => updatePortalDraft((d) => { d.intake.deceased.hadWill = event.target.value as "yes" | "no"; })}
              className="mt-1 w-full rounded-2xl border border-[color:var(--border-muted)] bg-white px-4 py-3 text-sm text-[color:var(--ink)] focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-[color:var(--brand-orange)]"
            >
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
            {showError("hadWill")}
          </div>
        </div>
      );
    case "willSearch":
      return (
        <div className="space-y-4">
          <label className="text-sm font-semibold text-[color:var(--ink)]" htmlFor="will-search-areas">
            Where have you searched so far?
          </label>
          <Textarea
            id="will-search-areas"
            rows={4}
            value={draft.intake.willSearch.searchAreas}
            onChange={(event) => updatePortalDraft((d) => { d.intake.willSearch.searchAreas = event.target.value; })}
          />
          {showError("searchAreas")}
          <div>
            <label htmlFor="will-mailing" className="text-sm font-semibold text-[color:var(--ink)]">
              Mailing preference
            </label>
            <select
              id="will-mailing"
              value={draft.intake.willSearch.mailingPreference}
              onChange={(event) => updatePortalDraft((d) => { d.intake.willSearch.mailingPreference = event.target.value; })}
              className="mt-1 w-full rounded-2xl border border-[color:var(--border-muted)] bg-white px-4 py-3 text-sm text-[color:var(--ink)] focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-[color:var(--brand-orange)]"
            >
              <option value="service-bc">Service BC drop-off</option>
              <option value="courier">Courier with tracking</option>
            </select>
            {showError("mailingPreference")}
          </div>
          <Button type="button" variant="outline" onClick={() => updatePortalDraft((d) => { d.intake.willSearch.packetPrepared = true; })}>
            Generate request packet (mock)
          </Button>
          {showError("packetPrepared")}
        </div>
      );
    case "notices":
      return (
        <div className="space-y-4">
          <label htmlFor="notices-recipients" className="text-sm font-semibold text-[color:var(--ink)]">
            Who receives notice?
          </label>
          <Textarea
            id="notices-recipients"
            rows={4}
            value={draft.intake.notices.recipients}
            onChange={(event) => updatePortalDraft((d) => { d.intake.notices.recipients = event.target.value; })}
          />
          {showError("recipients")}
          <div>
            <label htmlFor="notices-delivery" className="text-sm font-semibold text-[color:var(--ink)]">
              Delivery method
            </label>
            <select
              id="notices-delivery"
              value={draft.intake.notices.deliveryMethod}
              onChange={(event) => updatePortalDraft((d) => { d.intake.notices.deliveryMethod = event.target.value; })}
              className="mt-1 w-full rounded-2xl border border-[color:var(--border-muted)] bg-white px-4 py-3 text-sm text-[color:var(--ink)] focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-[color:var(--brand-orange)]"
            >
              <option value="email">Email</option>
              <option value="registered">Registered mail</option>
              <option value="courier">Courier</option>
            </select>
            {showError("deliveryMethod")}
          </div>
          <Button type="button" variant="outline" onClick={() => updatePortalDraft((d) => { d.intake.notices.mailed = true; })}>
            Mark mailed
          </Button>
          {showError("mailed")}
        </div>
      );
    case "review":
      return (
        <div className="space-y-4">
          <div className="rounded-3xl border border-[color:var(--border-muted)] bg-white p-4 text-sm text-[color:var(--ink)]">
            <p className="font-semibold text-[color:var(--ink)]">Summary</p>
            <ul className="mt-2 space-y-1">
              <li>Email: {draft.intake.welcome.email || "—"}</li>
              <li>Executor: {draft.intake.executor.fullName || "—"} ({draft.intake.executor.city || "City"})</li>
              <li>Deceased: {draft.intake.deceased.fullName || "—"}</li>
              <li>Will search: {draft.intake.willSearch.searchAreas ? "Documented" : "Pending"}</li>
              <li>Notices: {draft.intake.notices.recipients ? "Listed" : "Pending"}</li>
            </ul>
          </div>
          <label className="inline-flex items-center gap-3 text-sm text-[color:var(--ink)]">
            <input
              type="checkbox"
              checked={draft.intake.review.confirmed}
              onChange={(event) => updatePortalDraft((d) => { d.intake.review.confirmed = event.target.checked; })}
              className="h-4 w-4 rounded border-[color:var(--border-muted)]"
              style={{ accentColor: "var(--brand-orange)" }}
            />
            Looks good — I confirm this summary matches my records.
          </label>
          {showError("confirmed")}
        </div>
      );
    default:
      return null;
  }
}

function Field({ label, id, value, onChange, error }: { label: string; id: string; value: string; onChange: (value: string) => void; error?: string }) {
  return (
    <div>
      <label htmlFor={id} className="text-sm font-semibold text-[color:var(--ink)]">
        {label}
      </label>
      <Input
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
      {error ? <p className="text-xs font-medium text-[color:var(--warning)]">{error}</p> : null}
    </div>
  );
}

function getSectionValue(draft: PortalDraft, step: StepId) {
  switch (step) {
    case "welcome":
      return draft.intake.welcome;
    case "executor":
      return draft.intake.executor;
    case "deceased":
      return {
        fullName: draft.intake.deceased.fullName,
        dateOfDeath: draft.intake.deceased.dateOfDeath,
        city: draft.intake.deceased.city,
        province: draft.intake.deceased.province,
        hadWill: draft.intake.deceased.hadWill,
      };
    case "willSearch":
      return draft.intake.willSearch;
    case "notices":
      return draft.intake.notices;
    case "review":
      return draft.intake.review;
    default:
      return {};
  }
}
