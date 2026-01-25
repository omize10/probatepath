"use client";

import Link from "next/link";
import { PortalShell } from "@/components/portal/PortalShell";
import { portalStatusLabels } from "@/lib/portal/status";
import { AnimatedStatus } from "@/components/portal/progress/AnimatedStatus";
import { JourneyTimeline } from "@/components/portal/progress/JourneyTimeline";
import { OperationalTransparency } from "@/components/portal/progress/OperationalTransparency";

type SerializableDate = string | null;

export interface PortalReminder {
  id: string;
  type: string;
  dueAt: SerializableDate;
  sentAt: SerializableDate;
}

export interface PortalBeneficiary {
  id: string;
  name: string;
  relationship?: string | null;
}

export interface PortalMatterVM {
  id: string;
  caseCode?: string | null;
  statusLabel: string;
  portalStatus: string;
  pathType: "probate" | "administration";
  willSearchPackageReady: boolean;
  p1NoticesReady: boolean;
  standardProbatePackageReady: boolean;
  willSearchPreparedAt: SerializableDate;
  willSearchMailedAt: SerializableDate;
  noticesPreparedAt: SerializableDate;
  noticesMailedAt: SerializableDate;
  probatePackagePreparedAt: SerializableDate;
  probateFiledAt: SerializableDate;
  grantIssuedAt?: SerializableDate;
  willSearchPdfUrl: string | null;
  p1NoticePdfUrl: string | null;
  p1PacketPdfUrl?: string | null;
  p1CoverLetterPdfUrl?: string | null;
  probatePackagePdfUrl: string | null;
  registryName?: string | null;
  registryAddress?: string | null;
  reminders: PortalReminder[];
  beneficiaries: PortalBeneficiary[];
  editHref: string;
  daysRemaining: number | null;
  noticesMailedAtDisplay: string | null;
  willSearchMailedAtDisplay?: string | null;
  // Will search certificate tracking
  willSearchCertificateUploaded: boolean;
}

export function PortalClient({ matter, empty = false }: { matter: PortalMatterVM; empty?: boolean }) {
  const hasNoticesSent = Boolean(matter.noticesMailedAt);
  const daysRemaining = matter.daysRemaining;

  const portalStatus = matter.portalStatus;
  // Both conditions must be met to unlock filing
  const waitingPeriodComplete = hasNoticesSent && daysRemaining !== null && daysRemaining <= 0;
  const certificateUploaded = matter.willSearchCertificateUploaded;
  const waitFinished = waitingPeriodComplete && certificateUploaded;

  // Path-specific language
  const isAdministration = matter.pathType === "administration";
  const grantName = isAdministration ? "Grant of Administration" : "Grant of Probate";
  const grantedLabel = isAdministration ? "Administration granted" : "Probate granted";
  const filingLabel = isAdministration ? "court filing" : "probate filing";
  const applicationLabel = isAdministration ? "administration application" : "probate application";

  let displayStatus = matter.statusLabel;
  let nextUnlock = "Preparing documents";
  let primaryCta: { href: string; label: string } | null = null;

  switch (portalStatus) {
    case "intake_complete":
    case "will_search_prepping":
      nextUnlock = "Preparing documents";
      break;
    case "will_search_ready":
      nextUnlock = "Start will search";
      primaryCta = { href: "/portal/will-search", label: "Start your next step" };
      break;
    case "will_search_sent":
      nextUnlock = hasNoticesSent ? "Wait 21 days after notices" : "Prepare P1 notices";
      primaryCta = { href: hasNoticesSent ? "/portal/p1-notices" : "/portal/p1-notices", label: hasNoticesSent ? "View notices status" : "Continue to notices" };
      break;
    case "notices_waiting_21_days":
      if (hasNoticesSent && daysRemaining !== null) {
        if (daysRemaining > 0) {
          displayStatus = `Waiting ${daysRemaining} day(s) after notices`;
          nextUnlock = `Wait ${daysRemaining} day(s) after notices`;
          primaryCta = { href: "/portal/p1-notices", label: "View notices status" };
        } else if (!certificateUploaded) {
          // 21 days passed but certificate not uploaded
          displayStatus = "21-day wait complete – certificate needed";
          nextUnlock = "Upload will search certificate";
          primaryCta = { href: "/portal/will-search", label: "Upload certificate" };
        } else {
          displayStatus = "Waiting period complete";
          nextUnlock = `Prepare ${filingLabel}`;
          primaryCta = null; // show the CTA in the notices card to avoid duplicates
        }
      }
      break;
    case "probate_package_prepping":
    case "probate_package_ready":
    case "probate_filing_ready":
      displayStatus = portalStatusLabels[portalStatus] ?? displayStatus;
      nextUnlock = `File your ${filingLabel} package`;
      primaryCta = { href: "/portal/probate-filing?step=1", label: `Prepare ${filingLabel}` };
      break;
    case "probate_filing_in_progress":
      displayStatus = portalStatusLabels[portalStatus] ?? displayStatus;
      nextUnlock = `File your ${filingLabel} package`;
      primaryCta = { href: "/portal/probate-filing?step=1", label: `Continue ${filingLabel}` };
      break;
    case "probate_filed":
      displayStatus = "Application filed – waiting for grant";
      nextUnlock = "Waiting for court decision";
      primaryCta = { href: "/portal/probate-filing?step=8", label: "View filing status" };
      break;
    case "waiting_for_grant":
      displayStatus = "Waiting for grant";
      nextUnlock = `Waiting for ${grantName}`;
      break;
    case "grant_complete":
    case "post_grant_active":
      displayStatus = grantedLabel;
      nextUnlock = "Administer the estate";
      primaryCta = { href: "/portal/post-grant", label: "Start estate administration" };
      break;
    case "estate_closeout":
      displayStatus = "Closing the estate";
      nextUnlock = "Complete final steps";
      primaryCta = { href: "/portal/post-grant", label: "View closeout checklist" };
      break;
    default:
      nextUnlock = "Preparing documents";
  }

  if (matter.grantIssuedAt) {
    displayStatus = isAdministration ? "Grant received – administration complete" : "Grant received – probate complete";
    nextUnlock = grantedLabel;
    primaryCta = null;
  }


  if (empty) {
    return (
      <PortalShell
        title="We’ll guide you step by step."
        description="Start intake to create your case. We’ll keep your documents and progress here."
        eyebrow="Client portal"
        actions={
          <Link
            href="/start"
            className="inline-flex items-center rounded-full border border-[color:var(--brand)] px-4 py-2 text-sm font-semibold text-[color:var(--brand)] transition hover:bg-[color:var(--brand)] hover:text-white"
          >
            Start intake
          </Link>
        }
      >
        <div className="rounded-3xl border border-[color:var(--border-muted)] bg-white p-6 text-sm text-[color:var(--ink-muted)] shadow-sm">
          We couldn’t find an active case. Start the intake to get your personalized steps.
        </div>
      </PortalShell>
    );
  }

  return (
    <PortalShell
      title="We’ll guide you step by step."
      description="Download your documents, follow the checklist, and mark milestones as you go."
      eyebrow="Client portal"
      actions={
        <>
          {primaryCta ? (
            <Link
              href={primaryCta.href}
              className="inline-flex items-center rounded-full bg-[color:var(--brand)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[color:var(--accent-dark)] shadow-sm"
            >
              {primaryCta.label}
            </Link>
          ) : null}
          <Link
            href={matter.editHref}
            className="inline-flex items-center rounded-full border border-[color:var(--border-muted)] px-4 py-2 text-sm font-semibold text-[color:var(--ink)] transition hover:border-[color:var(--brand)] hover:text-[color:var(--brand)]"
          >
            Edit your answers
          </Link>
        </>
      }
    >
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-[color:var(--border-muted)] bg-white p-4 text-sm text-[color:var(--ink)] shadow-sm">
          <p className="text-xs uppercase tracking-[0.3em] text-[color:var(--ink-muted)]">Status</p>
          <p className="pt-1 text-lg font-semibold text-[color:var(--brand-navy)]">{displayStatus}</p>
        </div>
        <div className="rounded-2xl border border-[color:var(--border-muted)] bg-white p-4 text-sm text-[color:var(--ink)] shadow-sm">
          <p className="text-xs uppercase tracking-[0.3em] text-[color:var(--ink-muted)]">Case ID</p>
          <p className="pt-1 font-mono text-sm text-[color:var(--ink-muted)]">{matter.caseCode ?? matter.id}</p>
        </div>
        <div className="rounded-2xl border border-[color:var(--border-muted)] bg-white p-4 text-sm text-[color:var(--ink)] shadow-sm">
          <p className="text-xs uppercase tracking-[0.3em] text-[color:var(--ink-muted)]">Next unlock</p>
          <p className="pt-1 text-[color:var(--ink)]">{nextUnlock}</p>
        </div>
      </div>

      <div className="mt-6">
        <JourneyTimeline steps={buildJourneySteps(portalStatus, matter)} />
      </div>

      <div className="mt-6 space-y-6">
        {portalStatus === "intake_complete" || portalStatus === "will_search_prepping" ? (
          <section className="space-y-4">
            <AnimatedStatus
              status="preparing"
              label="We're preparing your packet"
              sublabel="This usually takes 2-3 business days."
            />
            <OperationalTransparency
              steps={[
                { label: "Reviewing your intake answers", done: true },
                { label: "Assembling your will search form", done: portalStatus === "will_search_prepping" },
                { label: "Preparing P1 notice templates", done: false },
                { label: "Building your court filing forms", done: false },
              ]}
              completionMessage="Your document packet is ready."
            />
            <div className="rounded-2xl bg-white px-6 py-4 shadow-sm">
              <p className="text-sm text-gray-700">
                When your packet is ready, we'll email and text you, and this page will unlock your next step.
              </p>
            </div>
            <NeedHelp />
            <Accordion />
          </section>
        ) : portalStatus === "will_search_ready" ? (
          <section className="space-y-4 rounded-2xl bg-white px-6 py-6 shadow-sm">
            <div className="space-y-2">
              <h2 className="text-lg font-semibold text-gray-900">Hooray – your packet is ready.</h2>
              <p className="text-sm text-gray-700">
                We've prepared your document packet based on your intake. Your next step is to start your will search and notices.
              </p>
            </div>
            <NeedHelp />
          </section>
        ) : portalStatus === "will_search_sent" && !hasNoticesSent ? (
          <section className="space-y-4">
            <div className="rounded-2xl bg-white px-6 py-4 shadow-sm space-y-2">
              <h2 className="text-lg font-semibold text-gray-900">Next: send P1 notices.</h2>
              <p className="text-sm text-gray-700">
                You told us you mailed your will search on {matter.willSearchMailedAtDisplay ?? "—"}. Now send the P1 notices.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Link href="/portal/p1-tracker" className="rounded-xl border border-[color:var(--border-muted)] bg-white p-4 hover:border-[color:var(--brand)] transition block">
                <p className="text-sm font-semibold text-gray-900">P1 notice tracker</p>
                <p className="text-xs text-gray-500 mt-0.5">Track delivery to each beneficiary.</p>
              </Link>
              <Link href="/portal/checklists" className="rounded-xl border border-[color:var(--border-muted)] bg-white p-4 hover:border-[color:var(--brand)] transition block">
                <p className="text-sm font-semibold text-gray-900">Checklists</p>
                <p className="text-xs text-gray-500 mt-0.5">Print and mailing verification guides.</p>
              </Link>
            </div>
            <NeedHelp />
          </section>
        ) : portalStatus === "notices_waiting_21_days" ? (
          <section className="space-y-4">
            <AnimatedStatus
              status={waitFinished ? "ready" : "waiting"}
              label={waitFinished ? "Waiting period complete" : "21-day waiting period"}
              sublabel={waitFinished
                ? `You're ready to file your ${applicationLabel}.`
                : `Notices sent on ${matter.noticesMailedAtDisplay ?? "—"}. ${daysRemaining ?? 0} day(s) remaining.`}
            />
            <div className="rounded-2xl bg-white px-6 py-4 shadow-sm space-y-3">
              {/* Waiting period status */}
              {daysRemaining !== null && daysRemaining > 0 ? (
                <div className="space-y-2">
                  <p className="text-sm text-gray-700">
                    You must wait {daysRemaining} day(s) from that date before filing.
                  </p>
                  {!certificateUploaded && (
                    <p className="text-sm text-amber-700">
                      You also need to upload your will search certificate from Vital Statistics.
                    </p>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-sm text-gray-700">Your 21-day waiting period is complete.</p>
                  {!certificateUploaded && (
                    <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 space-y-2">
                      <p className="text-sm font-semibold text-amber-800">Certificate required</p>
                      <p className="text-sm text-amber-700">
                        Before you can file your {applicationLabel}, you must upload your will search certificate from Vital Statistics.
                      </p>
                      <Link
                        href="/portal/will-search"
                        className="inline-flex items-center rounded-full bg-amber-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-amber-700"
                      >
                        Upload certificate
                      </Link>
                    </div>
                  )}
                </div>
              )}
              {/* Only show filing CTA when both conditions are met */}
              {waitFinished && (
                <Link
                  href="/portal/probate-filing?step=1"
                  className="inline-flex items-center rounded-full bg-[color:var(--brand)] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[color:var(--accent-dark)]"
                >
                  Continue to {filingLabel}
                </Link>
              )}
            </div>
            <NeedHelp />
          </section>
        ) : portalStatus === "probate_package_ready" ? (
          <section className="space-y-4 rounded-2xl bg-white px-6 py-6 shadow-sm">
            <div className="space-y-2">
              <h2 className="text-lg font-semibold text-gray-900">{isAdministration ? "Court filing package is ready." : "Probate filing package is ready."}</h2>
              <p className="text-sm text-gray-700">Download, get your affidavits notarized, and file with the registry.</p>
            </div>
            <NeedHelp />
          </section>
        ) : portalStatus === "probate_package_filed" || portalStatus === "waiting_for_grant" ? (
          <section className="space-y-4 rounded-2xl bg-white px-6 py-6 shadow-sm">
            <div className="space-y-2">
              <h2 className="text-lg font-semibold text-gray-900">Application filed</h2>
              <p className="text-sm text-gray-700">
                Your {isAdministration ? "court" : "probate"} package has been filed. The court is reviewing your application. This can take several weeks. We'll contact you if anything else is needed.
              </p>
            </div>
            <NeedHelp />
          </section>
        ) : portalStatus === "grant_complete" || portalStatus === "post_grant_active" || portalStatus === "estate_closeout" ? (
          <section className="space-y-4">
            <AnimatedStatus status="complete" label={grantedLabel} sublabel="You can now begin administering the estate." />
            <div className="grid gap-3 sm:grid-cols-2">
              <Link href="/portal/post-grant" className="rounded-xl border border-[color:var(--border-muted)] bg-white p-4 hover:border-[color:var(--brand)] transition block">
                <p className="text-sm font-semibold text-gray-900">Estate administration</p>
                <p className="text-xs text-gray-500 mt-0.5">Collect assets, pay debts, distribute to beneficiaries.</p>
              </Link>
              <Link href="/portal/requisitions" className="rounded-xl border border-[color:var(--border-muted)] bg-white p-4 hover:border-[color:var(--brand)] transition block">
                <p className="text-sm font-semibold text-gray-900">Requisitions</p>
                <p className="text-xs text-gray-500 mt-0.5">Handle court correction requests if any arise.</p>
              </Link>
              <Link href="/portal/p1-tracker" className="rounded-xl border border-[color:var(--border-muted)] bg-white p-4 hover:border-[color:var(--brand)] transition block">
                <p className="text-sm font-semibold text-gray-900">P1 notice tracker</p>
                <p className="text-xs text-gray-500 mt-0.5">Track delivery status of each beneficiary notice.</p>
              </Link>
              <Link href="/portal/checklists" className="rounded-xl border border-[color:var(--border-muted)] bg-white p-4 hover:border-[color:var(--brand)] transition block">
                <p className="text-sm font-semibold text-gray-900">Checklists and guides</p>
                <p className="text-xs text-gray-500 mt-0.5">Print, sign, and mail verification checklists.</p>
              </Link>
            </div>
            <NeedHelp />
          </section>
        ) : (
          <section className="space-y-4 rounded-2xl bg-white px-6 py-6 shadow-sm">
            <NeedHelp />
          </section>
        )}
      </div>
    </PortalShell>
  );
}

function NeedHelp() {
  return (
    <div className="space-y-1 rounded-2xl bg-[color:var(--bg-muted)] px-4 py-3 text-sm text-gray-700">
      <p className="font-semibold text-gray-900">Need help?</p>
      <p>
        If anything has changed or you need to update details, please call{" "}
        <a href="tel:6041234567" className="font-semibold text-gray-900">
          604-123-4567
        </a>{" "}
        or email{" "}
        <a href="mailto:help@probatedesk.ca" className="font-semibold text-gray-900">
          help@probatedesk.ca
        </a>
        .
      </p>
    </div>
  );
}

function Accordion() {
  const items = [
    {
      title: "How long will this take?",
      body: "Most files are ready in 2–3 business days. Very complex estates may take a bit longer.",
    },
    {
      title: "What are you doing behind the scenes?",
      body: "We're reviewing your intake, assembling the right BC court forms, and organizing them into a ready-to-sign packet.",
    },
    {
      title: "Do I need to do anything now?",
      body: "No. Just keep an eye on your email and phone. We'll let you know when it's time to start your will search and notices.",
    },
  ];
  return (
    <div className="divide-y divide-gray-200 rounded-2xl border border-gray-200">
      {items.map((item) => (
        <details key={item.title} className="px-4 py-3 text-sm text-gray-700">
          <summary className="cursor-pointer font-semibold text-gray-900">{item.title}</summary>
          <p className="mt-2 text-gray-700">{item.body}</p>
        </details>
      ))}
    </div>
  );
}

function getJourneySteps(isAdministration: boolean) {
  return [
    { id: "intake", label: "Intake submitted" },
    { id: "will-search", label: "Will search sent" },
    { id: "notices", label: "P1 notices mailed" },
    { id: "waiting", label: "21-day waiting period" },
    { id: "filing", label: isAdministration ? "Application filed at court" : "Probate filed at court" },
    { id: "grant", label: "Grant received" },
  ];
}

const STATUS_TO_STEP: Record<string, number> = {
  intake_complete: 0,
  will_search_prepping: 0,
  will_search_ready: 0,
  will_search_sent: 1,
  notices_in_progress: 2,
  notices_waiting_21_days: 3,
  probate_package_prepping: 3,
  probate_package_ready: 3,
  probate_filing_ready: 3,
  probate_filing_in_progress: 4,
  probate_filed: 4,
  waiting_for_grant: 4,
  grant_complete: 5,
  post_grant_active: 5,
  estate_closeout: 5,
  done: 5,
};

function buildJourneySteps(portalStatus: string, matter: PortalMatterVM) {
  const activeStep = STATUS_TO_STEP[portalStatus] ?? 0;
  const isAdministration = matter.pathType === "administration";
  const journeySteps = getJourneySteps(isAdministration);
  return journeySteps.map((step, i) => ({
    id: step.id,
    label: step.label,
    status: i < activeStep ? ("done" as const) :
            i === activeStep ? ("active" as const) :
            ("upcoming" as const),
    date: i === 1 && matter.willSearchMailedAtDisplay ? matter.willSearchMailedAtDisplay :
          i === 2 && matter.noticesMailedAtDisplay ? matter.noticesMailedAtDisplay :
          undefined,
  }));
}
