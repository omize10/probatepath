import Link from "next/link";
import type { ReactNode } from "react";
import type { JourneyStepId, JourneyStatus } from "@/lib/portal/journey";
import type { PortalMatter } from "@/lib/portal/server";
import type { IntakeDraft } from "@/lib/intake/types";
import type { PersonName, Address } from "@/lib/intake/case-blueprint";
import { getFormPdfUrl, getPhase1PacketUrl, getWillSearchPdfUrl } from "@/lib/portal/downloads";

export type StepFlowContext = {
  matter: PortalMatter;
  draft: IntakeDraft | null;
};

export type StepPageConfig = {
  slug: string;
  title: string;
  description?: string;
  body: ReactNode;
  ctaLabel: string;
  statusOnSubmit?: JourneyStatus;
};

export type StepFlowConfig = {
  stepId: JourneyStepId;
  pages: StepPageConfig[];
};

const flowMap: Record<JourneyStepId, (context: StepFlowContext) => StepFlowConfig> = {
  "review-info": buildReviewInfoFlow,
  "will-search": buildWillSearchFlow,
  "executors-beneficiaries": buildExecutorsBeneficiariesFlow,
  "assets-debts": buildAssetsDebtsFlow,
  "review-forms": buildReviewFormsFlow,
  "sign-notarize": buildSignNotarizeFlow,
  "file-court": buildFileCourtFlow,
};

export function getStepFlow(stepId: JourneyStepId, context: StepFlowContext): StepFlowConfig | null {
  const builder = flowMap[stepId];
  if (!builder) return null;
  return builder(context);
}

function buildReviewInfoFlow({ draft }: StepFlowContext): StepFlowConfig {
  const estate = draft?.estateIntake;
  const deceased = estate?.deceased;
  const applicant = estate?.applicant;

  return {
    stepId: "review-info",
    pages: [
      {
        slug: "overview",
        title: "Review your basic info",
        description: "Confirm the deceased’s details and your own contact info before we generate forms.",
        body: (
          <div className="space-y-3 text-sm">
            <p>We’ll use this info on every form. Make sure it matches the death certificate and your ID.</p>
            <InfoRow label="Deceased name" value={formatName(deceased?.name)} />
            <InfoRow label="Date of death" value={formatDate(deceased?.dateOfDeath)} />
            <InfoRow label="Applicant name" value={formatName(applicant?.name)} />
            <InfoRow label="Email" value={applicant?.contact?.email} />
            <InfoRow label="Phone" value={applicant?.contact?.phone} />
            <Link href="/portal/info" className={secondaryButtonSm}>
              Open Your Info
            </Link>
          </div>
        ),
        ctaLabel: "Looks good",
        statusOnSubmit: "in_progress",
      },
      {
        slug: "deceased",
        title: "Confirm deceased details",
        body: (
          <div className="space-y-3 text-sm">
            <InfoRow label="Legal name" value={formatName(deceased?.name)} />
            <InfoRow label="Date of death" value={formatDate(deceased?.dateOfDeath)} />
            <InfoRow label="Place of death" value={formatLocation(deceased?.placeOfDeath?.city, deceased?.placeOfDeath?.province, deceased?.placeOfDeath?.country)} />
            <InfoRow label="Date of birth" value={formatDate(deceased?.dateOfBirth)} />
            <InfoRow label="Last address" value={formatAddress(deceased?.address)} />
            <Link href="/portal/intake?step=deceased-basics" className={secondaryButtonSm}>
              Edit deceased info
            </Link>
          </div>
        ),
        ctaLabel: "Confirm deceased details",
        statusOnSubmit: "in_progress",
      },
      {
        slug: "applicant",
        title: "Confirm applicant details",
        body: (
          <div className="space-y-3 text-sm">
            <InfoRow label="Applicant name" value={formatName(applicant?.name)} />
            <InfoRow label="Relationship" value={displayText(applicant?.relationship)} />
            <InfoRow label="Email" value={applicant?.contact?.email} />
            <InfoRow label="Phone" value={applicant?.contact?.phone} />
            <InfoRow label="Mailing address" value={formatAddress(applicant?.address)} />
            <Link href="/portal/intake?step=applicant" className={secondaryButtonSm}>
              Edit applicant info
            </Link>
          </div>
        ),
        ctaLabel: "Confirm applicant details",
        statusOnSubmit: "in_progress",
      },
      {
        slug: "complete",
        title: "Info confirmed",
        description: "We’ll reflect these confirmations in your step tracker.",
        body: (
          <div className="space-y-3 text-sm">
            <p>If you find more changes later, you can always reopen this step or edit via Your Info.</p>
          </div>
        ),
        ctaLabel: "Mark complete",
        statusOnSubmit: "done",
      },
    ],
  };
}

function buildWillSearchFlow({ matter, draft }: StepFlowContext): StepFlowConfig {
  const estate = draft?.estateIntake;
  const deceased = estate?.deceased;
  const applicant = estate?.applicant;
  const downloadHref = getWillSearchPdfUrl(matter.id, { download: true });
  const previewHref = getWillSearchPdfUrl(matter.id);
  const deceasedName = formatName(deceased?.name);
  const dateOfDeath = formatDate(deceased?.dateOfDeath);
  const dateOfBirth = formatDate(deceased?.dateOfBirth);
  const applicantEmail = applicant?.contact?.email ?? "";
  const applicantPhone = applicant?.contact?.phone ?? "";

  return {
    stepId: "will-search",
    pages: [
      {
        slug: "download",
        title: "Download your will registry search form",
        description: "We pre-filled the Vital Statistics (VSA 532) request with your intake answers.",
        body: (
          <div className="space-y-4">
            <p>Download the packet, print it on letter paper, and keep the PDF handy in case you need a fresh copy.</p>
            <div className="flex flex-wrap gap-3">
              <a href={downloadHref} target="_blank" rel="noreferrer" className={primaryButton}>
                Download packet
              </a>
              <a href={previewHref} target="_blank" rel="noreferrer" className={ghostButton}>
                Preview PDF
              </a>
              <Link href="/portal/documents#will-search" className={secondaryButton}>
                See in Documents
              </Link>
            </div>
            <p className="text-xs text-[color:var(--ink-muted)]">We keep the latest version ready under Documents so you can re-download anytime.</p>
          </div>
        ),
        ctaLabel: "Continue",
        statusOnSubmit: "in_progress",
      },
      {
        slug: "sign",
        title: "Sign with black ink",
        description: "Sign page 2 and initial any corrections. Attach photocopies of two pieces of ID.",
        body: (
          <ul className="list-disc space-y-2 pl-5">
            <li>Use black ink and stay inside the signature box.</li>
            <li>Initial any corrections—no correction fluid.</li>
            <li>Include photocopies of two pieces of executor ID (one photo ID).</li>
          </ul>
        ),
        ctaLabel: "I’ve signed it",
        statusOnSubmit: "in_progress",
      },
      {
        slug: "fill-details",
        title: "Fill in the remaining details",
        description: "Copy these exact spellings onto the form so Vital Statistics can find the record quickly.",
        body: (
          <div className="space-y-4">
            <ReadOnlyInput label="Deceased name" value={deceasedName} />
            <ReadOnlyInput label="Date of death" value={dateOfDeath} />
            <ReadOnlyInput label="Date of birth" value={dateOfBirth} />
            <ReadOnlyInput label="Executor contact" value={[applicantEmail, applicantPhone].filter(Boolean).join(" · ")} />
            <p className="text-xs text-[color:var(--ink-muted)]">
              Need to update anything? Edit the original intake answers so every form stays consistent.
            </p>
            <Link href="/portal/intake?step=deceased-basics" className={secondaryButtonSm}>
              Edit details in intake
            </Link>
          </div>
        ),
        ctaLabel: "Details filled",
        statusOnSubmit: "in_progress",
      },
      {
        slug: "mail",
        title: "Mail or drop it off (mail only, no email)",
        description: "Vital Statistics only accepts mailed or in-person submissions. Include payment to the Minister of Finance.",
        body: (
          <div className="space-y-3">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-[color:var(--ink-muted)]">Mailing address</p>
              <div className="mt-2 rounded-2xl bg-[color:var(--bg-muted)] p-4 font-semibold text-[color:var(--ink)]">
                <p>Vital Statistics Agency</p>
                <p>PO Box 9657 Stn Prov Govt</p>
                <p>Victoria, BC V8W 9P3</p>
              </div>
            </div>
            <ul className="list-disc space-y-2 pl-5 text-sm">
              <li>Include a cheque or money order payable to the “Minister of Finance”.</li>
              <li>Use tracked mail or deliver at Service BC so you get a receipt.</li>
              <li>Keep the photocopies of your ID and the tracking receipt for your records.</li>
            </ul>
            <Link href="/portal/help#will-search" className={ghostButton}>
              Read full mailing instructions
            </Link>
          </div>
        ),
        ctaLabel: "I’ve mailed it",
        statusOnSubmit: "in_progress",
      },
      {
        slug: "tracking",
        title: "Record when you mailed it",
        description: "We’ll remind you to look for the confirmation letter and keep the tracking details handy.",
        body: (
          <div className="space-y-4">
            <label className="block space-y-1">
              <span className="text-sm font-semibold text-[color:var(--ink)]">Mailing date</span>
              <input
                type="date"
                name="mailedDate"
                className="w-full rounded-2xl border border-[color:var(--border-muted)] px-3 py-2 text-sm"
              />
            </label>
            <label className="block space-y-1">
              <span className="text-sm font-semibold text-[color:var(--ink)]">Tracking number (optional)</span>
              <input
                type="text"
                name="trackingNumber"
                placeholder="e.g. Canada Post tracking #"
                className="w-full rounded-2xl border border-[color:var(--border-muted)] px-3 py-2 text-sm"
              />
            </label>
            <p className="text-xs text-[color:var(--ink-muted)]">We store this locally so you can refer to it if Vital Statistics reaches out.</p>
          </div>
        ),
        ctaLabel: "Save tracking info",
        statusOnSubmit: "in_progress",
      },
      {
        slug: "done",
        title: "Will search submitted",
        description: "Watch for a confirmation letter in the mail. You can upload a copy under Documents once it arrives.",
        body: (
          <p>
            Expect a response from Vital Statistics within a few weeks. Once you receive the letter, upload a scan under Documents → Will search so
            everything stays in one place.
          </p>
        ),
        ctaLabel: "Finish",
        statusOnSubmit: "done",
      },
    ],
  };
}

function buildExecutorsBeneficiariesFlow({ draft }: StepFlowContext): StepFlowConfig {
  const estate = draft?.estateIntake;
  const executors = estate?.applicant ? [estate.applicant, ...(estate.applicant.coApplicants ?? [])] : [];
  const beneficiariesCount = estate?.beneficiaries?.people?.length ?? 0;

  return {
    stepId: "executors-beneficiaries",
    pages: [
      {
        slug: "executors",
        title: "Confirm executors",
        description: "Make sure all acting executors are listed with mailing addresses.",
        body: (
          <div className="space-y-3 text-sm">
            <p>These names flow into the affidavits and notices.</p>
            <InfoRow label="Executors listed" value={executors.length ? executors.map((ex) => formatName(ex.name)).join(", ") : "None added yet"} />
            <Link href="/portal/executors" className={secondaryButtonSm}>
              Edit executors
            </Link>
          </div>
        ),
        ctaLabel: "Executors confirmed",
        statusOnSubmit: "in_progress",
      },
      {
        slug: "beneficiaries",
        title: "Confirm beneficiaries",
        description: "Add every beneficiary and their mailing address.",
        body: (
          <div className="space-y-3 text-sm">
            <InfoRow label="Beneficiaries listed" value={beneficiariesCount ? `${beneficiariesCount} beneficiary(ies)` : "None added yet"} />
            <Link href="/portal/beneficiaries" className={secondaryButtonSm}>
              Edit beneficiaries
            </Link>
          </div>
        ),
        ctaLabel: "Beneficiaries confirmed",
        statusOnSubmit: "in_progress",
      },
      {
        slug: "complete",
        title: "Executors & beneficiaries confirmed",
        description: "We’ll carry these into the schedules and notices.",
        body: <p>Revisit this step anytime if an executor steps down or a beneficiary changes.</p>,
        ctaLabel: "Mark complete",
        statusOnSubmit: "done",
      },
    ],
  };
}

function buildAssetsDebtsFlow({ draft }: StepFlowContext): StepFlowConfig {
  const estate = draft?.estateIntake;
  const assets = estate?.assets;
  const debts = estate?.debts;

  return {
    stepId: "assets-debts",
    pages: [
      {
        slug: "notices-download",
        title: "Review assets and debts",
        description: "Capture a snapshot so affidavits and schedules stay accurate.",
        body: (
          <div className="space-y-3 text-sm">
            <InfoRow label="Real estate" value={assets?.bcProperties?.length ? `${assets.bcProperties.length} properties` : "None listed"} />
            <InfoRow label="Accounts" value={assets?.accounts?.length ? `${assets.accounts.length} accounts` : "None listed"} />
            <InfoRow label="Liabilities" value={debts?.liabilities?.length ? `${debts.liabilities.length} items` : "None listed"} />
            <Link href="/portal/intake?step=assets" className={secondaryButtonSm}>
              Update assets & debts
            </Link>
          </div>
        ),
        ctaLabel: "Continue",
        statusOnSubmit: "in_progress",
      },
      {
        slug: "serve",
        title: "Plan notices & delivery",
        description: "Registered mail or personal service works best. Keep tracking receipts.",
        body: (
          <ul className="list-disc space-y-2 pl-5 text-sm">
            <li>Use registered mail or courier with tracking to each beneficiary who needs notice.</li>
            <li>Keep copies of every letter and the tracking receipts.</li>
            <li>Upload proof later under Documents if you have it.</li>
          </ul>
        ),
        ctaLabel: "I understand",
        statusOnSubmit: "in_progress",
      },
      {
        slug: "record-delivery",
        title: "Record deliveries",
        description: "Add tracking details so you can find them later.",
        body: (
          <div className="space-y-3 text-sm">
            <label className="block space-y-1">
              <span className="text-sm font-semibold text-[color:var(--ink)]">Delivery date</span>
              <input name="deliveryDate" type="date" className="w-full rounded-2xl border border-[color:var(--border-muted)] px-3 py-2" />
            </label>
            <label className="block space-y-1">
              <span className="text-sm font-semibold text-[color:var(--ink)]">Tracking or courier ref</span>
              <input name="deliveryTracking" type="text" className="w-full rounded-2xl border border-[color:var(--border-muted)] px-3 py-2" />
            </label>
          </div>
        ),
        ctaLabel: "Save delivery info",
        statusOnSubmit: "in_progress",
      },
      {
        slug: "complete",
        title: "Assets & debts recorded",
        description: "Your affidavits and schedules will reflect these entries.",
        body: <p>Reopen this step if you uncover more assets or debts.</p>,
        ctaLabel: "Mark complete",
        statusOnSubmit: "done",
      },
    ],
  };
}

function buildReviewFormsFlow({ matter }: StepFlowContext): StepFlowConfig {
  const phase1Url = getPhase1PacketUrl(matter.id);
  const p1Url = getFormPdfUrl("p1", matter.id);
  const p3Url = getFormPdfUrl("p3", matter.id);
  const p4Url = getFormPdfUrl("p4", matter.id);
  const p9Url = getFormPdfUrl("p9", matter.id);
  const p10Url = getFormPdfUrl("p10", matter.id);
  const p11Url = getFormPdfUrl("p11", matter.id);
  const willUrl = getWillSearchPdfUrl(matter.id);

  return {
    stepId: "review-forms",
    pages: [
      {
        slug: "download",
        title: "Download your packet",
        description: "Open each PDF to confirm names, dates, and registry details.",
        body: (
          <div className="space-y-3 text-sm">
            <a href={phase1Url} target="_blank" rel="noreferrer" className={primaryButton}>
              Download Phase 1 packet
            </a>
            <div className="flex flex-wrap gap-3">
              <a href={p1Url} target="_blank" rel="noreferrer" className={secondaryButton}>
                Download P1
              </a>
              <a href={p3Url} target="_blank" rel="noreferrer" className={secondaryButton}>
                Download P3
              </a>
              <a href={p4Url} target="_blank" rel="noreferrer" className={secondaryButton}>
                Download P4
              </a>
              <a href={p9Url} target="_blank" rel="noreferrer" className={secondaryButton}>
                Download P9
              </a>
              <a href={p10Url} target="_blank" rel="noreferrer" className={secondaryButton}>
                Download P10
              </a>
              <a href={p11Url} target="_blank" rel="noreferrer" className={secondaryButton}>
                Download P11
              </a>
              <a href={willUrl} target="_blank" rel="noreferrer" className={secondaryButton}>
                Will search form
              </a>
            </div>
          </div>
        ),
        ctaLabel: "Continue",
        statusOnSubmit: "in_progress",
      },
      {
        slug: "checklist",
        title: "Checklist before signing",
        description: "Leave signature blocks empty until you meet the notary.",
        body: (
          <ul className="list-disc space-y-2 pl-5 text-sm">
            <li>Confirm spelling for all names and addresses.</li>
            <li>Check the registry location and filing details.</li>
            <li>Leave payment and signature sections blank until the appointment.</li>
          </ul>
        ),
        ctaLabel: "Checklist done",
        statusOnSubmit: "in_progress",
      },
      {
        slug: "complete",
        title: "Forms reviewed",
        description: "Everything looks good. Continue to signing.",
        body: <p>Bring printed copies to your signing appointment.</p>,
        ctaLabel: "Mark complete",
        statusOnSubmit: "done",
      },
    ],
  };
}

function buildSignNotarizeFlow({ matter }: StepFlowContext): StepFlowConfig {
  const phase1Url = getPhase1PacketUrl(matter.id);

  return {
    stepId: "sign-notarize",
    pages: [
      {
        slug: "prep",
        title: "Prepare for signing",
        description: "Book a commissioner/notary and print your packet.",
        body: (
          <div className="space-y-3 text-sm">
            <a href={phase1Url} target="_blank" rel="noreferrer" className={primaryButton}>
              Download signing packet
            </a>
            <Link href="/portal/help#signing" className={secondaryButton}>
              Read signing tips
            </Link>
            <ul className="list-disc space-y-2 pl-5">
              <li>Bring two pieces of government ID.</li>
              <li>Do not sign until the commissioner instructs you.</li>
              <li>Attach exhibit tabs before the appointment if possible.</li>
            </ul>
          </div>
        ),
        ctaLabel: "Ready for appointment",
        statusOnSubmit: "in_progress",
      },
      {
        slug: "appointment",
        title: "At the appointment",
        description: "Sign and initial every required spot in black ink.",
        body: (
          <ul className="list-disc space-y-2 pl-5 text-sm">
            <li>Sign only when told to do so by the commissioner/notary.</li>
            <li>Initial every correction; no correction fluid.</li>
            <li>Ask for a receipt or stamp if available.</li>
          </ul>
        ),
        ctaLabel: "Signed",
        statusOnSubmit: "in_progress",
      },
      {
        slug: "post-signing",
        title: "After signing",
        description: "Record any notes or reminders.",
        body: (
          <div className="space-y-3 text-sm">
            <label className="block space-y-1">
              <span className="text-sm font-semibold text-[color:var(--ink)]">Notes (optional)</span>
              <textarea
                name="signingNotes"
                className="w-full rounded-2xl border border-[color:var(--border-muted)] px-3 py-2"
                rows={3}
              />
            </label>
            <p className="text-xs text-[color:var(--ink-muted)]">We’ll keep this with your step progress for later reference.</p>
          </div>
        ),
        ctaLabel: "Save notes",
        statusOnSubmit: "in_progress",
      },
      {
        slug: "complete",
        title: "Signing complete",
        description: "Move on to filing with the court.",
        body: <p>Keep the signed originals safe and scan a copy for your records.</p>,
        ctaLabel: "Mark complete",
        statusOnSubmit: "done",
      },
    ],
  };
}

function buildFileCourtFlow(): StepFlowConfig {
  return {
    stepId: "file-court",
    pages: [
      {
        slug: "assemble",
        title: "Assemble the packet",
        description: "Put documents in order with tabs and payment ready.",
        body: (
          <ul className="list-disc space-y-2 pl-5 text-sm">
            <li>Order: P1, P3/P4, P9, P10/P11, schedules, notices, exhibits.</li>
            <li>Include originals where required (will, death certificate).</li>
            <li>Add payment (cheque/money order) to the registry.</li>
          </ul>
        ),
        ctaLabel: "Assembled",
        statusOnSubmit: "in_progress",
      },
      {
        slug: "deliver",
        title: "Deliver to the registry",
        description: "Choose in-person drop-off or tracked courier.",
        body: (
          <div className="space-y-3 text-sm">
            <label className="block space-y-1">
              <span className="text-sm font-semibold text-[color:var(--ink)]">Delivery method</span>
              <select name="deliveryMethod" className="w-full rounded-2xl border border-[color:var(--border-muted)] px-3 py-2">
                <option value="">Select</option>
                <option value="in_person">In person</option>
                <option value="courier">Courier</option>
              </select>
            </label>
            <label className="block space-y-1">
              <span className="text-sm font-semibold text-[color:var(--ink)]">Tracking number (optional)</span>
              <input name="filingTracking" type="text" className="w-full rounded-2xl border border-[color:var(--border-muted)] px-3 py-2" />
            </label>
          </div>
        ),
        ctaLabel: "Delivery planned",
        statusOnSubmit: "in_progress",
      },
      {
        slug: "record-filing",
        title: "Record filing details",
        description: "Keep registry location and date in one place.",
        body: (
          <div className="space-y-3 text-sm">
            <label className="block space-y-1">
              <span className="text-sm font-semibold text-[color:var(--ink)]">Filing date</span>
              <input name="filingDate" type="date" className="w-full rounded-2xl border border-[color:var(--border-muted)] px-3 py-2" />
            </label>
            <label className="block space-y-1">
              <span className="text-sm font-semibold text-[color:var(--ink)]">Registry location</span>
              <input name="registryLocation" type="text" className="w-full rounded-2xl border border-[color:var(--border-muted)] px-3 py-2" />
            </label>
            <label className="block space-y-1">
              <span className="text-sm font-semibold text-[color:var(--ink)]">Grant or file number (optional)</span>
              <input name="grantNumber" type="text" className="w-full rounded-2xl border border-[color:var(--border-muted)] px-3 py-2" />
            </label>
          </div>
        ),
        ctaLabel: "Save filing info",
        statusOnSubmit: "in_progress",
      },
      {
        slug: "complete",
        title: "Filed with the court",
        description: "Keep receipts and tracking handy while the registry processes your file.",
        body: <p>Reopen this step to add a grant number or respond to a defect letter.</p>,
        ctaLabel: "Mark complete",
        statusOnSubmit: "done",
      },
    ],
  };
}

// ---------- helpers ----------

function InfoRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="rounded-2xl border border-[color:var(--border-muted)] p-3">
      <p className="text-xs uppercase tracking-[0.3em] text-[color:var(--ink-muted)]">{label}</p>
      <p className="text-sm font-semibold text-[color:var(--ink)]">{value || "Not provided"}</p>
    </div>
  );
}

function ReadOnlyInput({ label, value }: { label: string; value?: string | null }) {
  return (
    <label className="block space-y-1 text-sm text-[color:var(--ink-muted)]">
      <span className="text-xs uppercase tracking-[0.3em] text-[color:var(--ink-muted)]">{label}</span>
      <input
        type="text"
        value={value || "Not provided"}
        readOnly
        className="mt-1 w-full rounded-2xl border border-[color:var(--border-muted)] bg-[color:var(--bg-muted)] px-4 py-2 font-semibold text-[color:var(--ink)]"
      />
    </label>
  );
}

function formatName(name?: PersonName) {
  if (!name) return "";
  return [name.first, name.middle1, name.last].filter(Boolean).join(" ").trim();
}

function formatDate(value?: string) {
  if (!value) return "";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return new Intl.DateTimeFormat("en-CA", { dateStyle: "long" }).format(parsed);
}

function displayText(value?: string | null) {
  return value && value.trim().length > 0 ? value : "Not provided";
}

function formatAddress(address?: Address) {
  if (!address) return "Not provided";
  const parts = [address.line1, address.line2, address.city, address.region, address.postalCode, address.country].filter(Boolean);
  return parts.join(", ") || "Not provided";
}

function formatLocation(city?: string, province?: string, country?: string) {
  return [city, province, country].filter(Boolean).join(", ") || "Not provided";
}

const primaryButton =
  "inline-flex items-center justify-center rounded-full bg-[color:var(--brand-navy)] px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90";
const secondaryButton =
  "inline-flex items-center justify-center rounded-full border border-[color:var(--border-muted)] px-4 py-3 text-sm font-semibold text-[color:var(--ink)] hover:bg-[color:var(--bg-muted)]";
const secondaryButtonSm =
  "inline-flex items-center justify-center rounded-full border border-[color:var(--border-muted)] px-3 py-2 text-xs font-semibold text-[color:var(--ink)] hover:bg-[color:var(--bg-muted)]";
const ghostButton =
  "inline-flex items-center justify-center rounded-full px-4 py-3 text-sm font-semibold text-[color:var(--brand-navy)] hover:bg-[color:var(--bg-muted)]";
