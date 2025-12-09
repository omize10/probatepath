"use client";

import Link from "next/link";
import { PortalShell } from "@/components/portal/PortalShell";
import { portalStatusLabels } from "@/lib/portal/status";

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
}

export function PortalClient({ matter, empty = false }: { matter: PortalMatterVM; empty?: boolean }) {
  const hasNoticesSent = Boolean(matter.noticesMailedAt);
  const daysRemaining = matter.daysRemaining;

  const portalStatus = matter.portalStatus;
  const waitFinished = hasNoticesSent && daysRemaining !== null && daysRemaining <= 0;

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
        } else {
          displayStatus = "Waiting period complete";
          nextUnlock = "Prepare probate filing";
          primaryCta = null; // show the CTA in the notices card to avoid duplicates
        }
      }
      break;
    case "probate_package_prepping":
    case "probate_package_ready":
    case "probate_filing_ready":
      displayStatus = portalStatusLabels[portalStatus] ?? displayStatus;
      nextUnlock = "File your probate package";
      primaryCta = { href: "/portal/probate-filing?step=1", label: "Prepare probate filing" };
      break;
    case "probate_filing_in_progress":
      displayStatus = portalStatusLabels[portalStatus] ?? displayStatus;
      nextUnlock = "File your probate package";
      primaryCta = { href: "/portal/probate-filing?step=1", label: "Continue probate filing" };
      break;
    case "probate_filed":
      displayStatus = "Application filed – waiting for grant";
      nextUnlock = "Waiting for court decision";
      primaryCta = { href: "/portal/probate-filing?step=8", label: "View filing status" };
      break;
    case "waiting_for_grant":
      displayStatus = "Waiting for grant";
      nextUnlock = "Waiting for grant of probate";
      break;
    case "grant_complete":
      displayStatus = "Probate granted";
      nextUnlock = "Probate granted";
      primaryCta = null;
      break;
    default:
      nextUnlock = "Preparing documents";
  }

  if (matter.grantIssuedAt) {
    displayStatus = "Grant received – probate complete";
    nextUnlock = "Probate granted";
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

      <div className="mt-8 space-y-6">
        {portalStatus === "intake_complete" || portalStatus === "will_search_prepping" ? (
          <section className="space-y-4 rounded-2xl bg-white px-6 py-6 shadow-sm">
            <div className="space-y-2">
              <h2 className="text-lg font-semibold text-gray-900">We’re preparing your packet.</h2>
              <p className="text-sm text-gray-700">
                We’re putting together your full probate document package based on your intake answers. This usually takes 2–3 business days.
              </p>
            </div>
            <p className="text-sm text-gray-700">
              When your packet is ready, we’ll email and text you, and this page will unlock your next step.
            </p>
            <NeedHelp />
            <Accordion />
          </section>
        ) : portalStatus === "will_search_ready" ? (
          <section className="space-y-4 rounded-2xl bg-white px-6 py-6 shadow-sm">
            <div className="space-y-2">
              <h2 className="text-lg font-semibold text-gray-900">Hooray – your packet is ready.</h2>
              <p className="text-sm text-gray-700">
                We’ve prepared your probate document packet based on your intake. Your next step is to start your will search and notices.
              </p>
            </div>
            <NeedHelp />
          </section>
        ) : portalStatus === "will_search_sent" && !hasNoticesSent ? (
          <section className="space-y-4 rounded-2xl bg-white px-6 py-6 shadow-sm">
            <div className="space-y-2">
              <h2 className="text-lg font-semibold text-gray-900">Next: send P1 notices.</h2>
              <p className="text-sm text-gray-700">
                You told us you mailed your will search on {matter.willSearchMailedAtDisplay ?? "—"}. Now send the P1 notices.
              </p>
            </div>
            <NeedHelp />
          </section>
        ) : portalStatus === "notices_waiting_21_days" ? (
          <section className="space-y-4 rounded-2xl bg-white px-6 py-6 shadow-sm">
            <div className="space-y-2">
              <h2 className="text-lg font-semibold text-gray-900">Notices sent</h2>
              <p className="text-sm text-gray-700">You told us you sent notices on {matter.noticesMailedAtDisplay ?? "—"}.</p>
              {daysRemaining !== null ? (
                daysRemaining > 0 ? (
                  <p className="text-sm text-gray-700">You must wait {daysRemaining} day(s) from that date before filing.</p>
                ) : (
                  <p className="text-sm text-gray-700">Your 21-day waiting period is complete. Filing will appear here once ready.</p>
                )
              ) : null}
            </div>
            {waitFinished ? (
              <Link
                href="/portal/probate-filing?step=1"
                className="inline-flex items-center rounded-full bg-gray-900 px-5 py-2 text-sm font-semibold text-white transition hover:bg-black"
              >
                Continue to probate filing
              </Link>
            ) : null}
            <NeedHelp />
          </section>
        ) : portalStatus === "probate_package_ready" ? (
          <section className="space-y-4 rounded-2xl bg-white px-6 py-6 shadow-sm">
            <div className="space-y-2">
              <h2 className="text-lg font-semibold text-gray-900">Probate filing package is ready.</h2>
              <p className="text-sm text-gray-700">Download, get your affidavits notarized, and file with the registry.</p>
            </div>
            <NeedHelp />
          </section>
        ) : portalStatus === "probate_package_filed" || portalStatus === "waiting_for_grant" ? (
          <section className="space-y-4 rounded-2xl bg-white px-6 py-6 shadow-sm">
            <div className="space-y-2">
              <h2 className="text-lg font-semibold text-gray-900">Application filed</h2>
              <p className="text-sm text-gray-700">
                Your probate package has been filed. The court is reviewing your application. This can take several weeks. We’ll contact you if anything else is needed.
              </p>
            </div>
            <NeedHelp />
          </section>
        ) : portalStatus === "grant_complete" ? (
          <section className="space-y-4 rounded-2xl bg-white px-6 py-6 shadow-sm">
            <div className="space-y-2">
              <h2 className="text-lg font-semibold text-gray-900">Probate granted</h2>
              <p className="text-sm text-gray-700">Congratulations. Keep an eye on your email for any post-grant next steps.</p>
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
        <a href="mailto:help@probatepath.ca" className="font-semibold text-gray-900">
          help@probatepath.ca
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
      body: "We’re reviewing your intake, assembling the right BC probate forms, and organizing them into a ready-to-sign packet.",
    },
    {
      title: "Do I need to do anything now?",
      body: "No. Just keep an eye on your email and phone. We’ll let you know when it’s time to start your will search and notices.",
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
