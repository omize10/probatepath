import Link from "next/link";
import { redirect } from "next/navigation";
import type { PortalStatus } from "@prisma/client";
import { cookies } from "next/headers";
import { requirePortalAuth } from "@/lib/auth";
import { resolvePortalMatter } from "@/lib/portal/server";
import { PortalShell } from "@/components/portal/PortalShell";
import { markProbateFiled, updatePortalState } from "@/lib/cases";
import { CourtFileNumberForm } from "./CourtFileNumberForm";
import { GrantUploadForm } from "./GrantUploadForm";
import { markGrantReceivedAction } from "./actions";

const MAX_STEP = 8;

type SearchParams = { step?: string | string[] };

function clampStep(value?: string | string[]) {
  const raw = Array.isArray(value) ? value[0] : value;
  const parsed = Number(raw ?? 1);
  if (Number.isNaN(parsed) || parsed < 1) return 1;
  if (parsed > MAX_STEP) return MAX_STEP;
  return parsed;
}

export async function advanceProbateStepAction(formData: FormData) {
  "use server";
  const session = await requirePortalAuth("/portal/probate-filing");
  const userId = (session.user as { id?: string })?.id ?? null;
  const caseId = formData.get("caseId")?.toString();
  const nextStep = clampStep(formData.get("nextStep")?.toString());

  if (!userId || !caseId) redirect("/portal");

  const { prisma } = await import("@/lib/prisma");
  const matter = await prisma.matter.findFirst({ where: { id: caseId, userId } });
  if (!matter) redirect("/portal");

  const allowedStatuses: PortalStatus[] = [
    "notices_waiting_21_days",
    "probate_package_ready",
    "probate_filing_ready",
    "probate_filing_in_progress",
    "probate_filed",
    "waiting_for_grant",
    "grant_complete",
  ];
  const currentPortalStatus = matter.portalStatus as PortalStatus;
  const waitFinished =
    currentPortalStatus === "notices_waiting_21_days" &&
    matter.noticesMailedAt !== null &&
    Math.max(0, 21 - Math.floor((Date.now() - matter.noticesMailedAt.getTime()) / (1000 * 60 * 60 * 24))) === 0;

  if (!allowedStatuses.includes(currentPortalStatus) || (currentPortalStatus === "notices_waiting_21_days" && !waitFinished)) {
    redirect("/portal");
  }

  // Final submission: mark filed and show the waiting state.
  if (nextStep >= MAX_STEP) {
    await markProbateFiled({ caseId, filedAt: new Date(), portalStatus: "probate_filed" });
    const cookieStore = await cookies();
    cookieStore.set(`portal:probate-step:${caseId}`, String(MAX_STEP), { path: "/portal/probate-filing", httpOnly: true });
    redirect(`/portal/probate-filing?step=${MAX_STEP}`);
  }

  if (currentPortalStatus === "probate_filing_ready" || currentPortalStatus === "notices_waiting_21_days") {
    try {
      await updatePortalState(caseId, { portalStatus: "probate_filing_in_progress" });
    } catch (err) {
      console.error("[probate-filing] failed to promote status", { caseId, err });
    }
  }

  const cookieStore = await cookies();
  cookieStore.set(`portal:probate-step:${caseId}`, String(nextStep), { path: "/portal/probate-filing", httpOnly: true });

  redirect(`/portal/probate-filing?step=${nextStep}`);
}

function StepShell({
  step,
  title,
  description,
  pathType,
  children,
}: {
  step: number;
  title: string;
  description: string;
  pathType: string;
  children: React.ReactNode;
}) {
  const filingLabel = pathType === "administration" ? "Administration filing" : "Probate filing";
  return (
    <div className="rounded-2xl bg-white px-6 py-6 shadow-sm">
      <div className="flex flex-col gap-2 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[color:var(--ink-muted)]">Step 3: {filingLabel}</p>
          <p className="text-xs text-[color:var(--ink-muted)]">
            Step {step} of {MAX_STEP}
          </p>
        </div>
      </div>
      <div className="space-y-2">
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
        <p className="text-sm text-gray-700">{description}</p>
      </div>
      <div className="mt-4 space-y-3">{children}</div>
    </div>
  );
}

function StepForm({
  caseId,
  nextStep,
  cta,
  children,
}: {
  caseId: string;
  nextStep: number;
  cta: string;
  children?: React.ReactNode;
}) {
  return (
    <form action={advanceProbateStepAction} className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
      <input type="hidden" name="caseId" value={caseId} />
      <input type="hidden" name="nextStep" value={nextStep} />
      <button type="submit" className="inline-flex items-center rounded-full bg-gray-900 px-5 py-2 text-sm font-semibold text-white transition hover:bg-black">
        {cta}
      </button>
      <Link
        href="/portal"
        className="inline-flex items-center rounded-full border border-[color:var(--border-muted)] px-5 py-2 text-sm font-semibold text-[color:var(--ink)] transition hover:border-[color:var(--brand)] hover:text-[color:var(--brand)]"
      >
        Back to portal
      </Link>
      {children}
    </form>
  );
}

interface WaitingStepProps {
  caseId: string;
  portalStatus: PortalStatus;
  courtFileNumber: string | null;
  grantIssuedAt: Date | null;
  grantDocumentUrl: string | null;
  pathType: string;
}

function WaitingStep({ caseId, portalStatus, courtFileNumber, grantIssuedAt, grantDocumentUrl, pathType }: WaitingStepProps) {
  const grantLabel = pathType === "administration" ? "Grant of Administration" : "Grant of Probate";
  const applicationLabel = pathType === "administration" ? "administration application" : "probate application";

  // Grant has been received
  if (portalStatus === "grant_complete" || grantIssuedAt) {
    return (
      <div className="space-y-4">
        <div className="rounded-xl border border-green-200 bg-green-50 p-4">
          <div className="flex items-center gap-2">
            <svg className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="font-medium text-green-800">{grantLabel} received!</p>
          </div>
          {grantIssuedAt && (
            <p className="mt-1 text-sm text-green-700">
              Issued on {new Date(grantIssuedAt).toLocaleDateString("en-CA", { dateStyle: "long" })}
            </p>
          )}
          {courtFileNumber && (
            <p className="mt-1 text-sm text-green-700">
              Court file number: <span className="font-mono">{courtFileNumber}</span>
            </p>
          )}
        </div>
        <p className="text-sm text-gray-700">
          Congratulations! You can now begin administering the estate. Visit your portal to see the next steps.
        </p>
        <Link
          href="/portal"
          className="inline-flex items-center rounded-full bg-gray-900 px-5 py-2 text-sm font-semibold text-white transition hover:bg-black"
        >
          Continue to portal
        </Link>
      </div>
    );
  }

  // Waiting for grant (court file number entered)
  if (portalStatus === "waiting_for_grant" || courtFileNumber) {
    return (
      <div className="space-y-4">
        <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
          <p className="font-medium text-blue-900">Waiting for your {grantLabel}</p>
          {courtFileNumber && (
            <p className="mt-1 text-sm text-blue-700">
              Court file number: <span className="font-mono">{courtFileNumber}</span>
            </p>
          )}
        </div>
        <p className="text-sm text-gray-700">
          Your {applicationLabel} is with the court. Review times vary, but you should receive your {grantLabel.toLowerCase()} within a few weeks. We'll check in periodically.
        </p>
        <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 space-y-3">
          <p className="font-medium text-gray-900">Received your {grantLabel.toLowerCase()}?</p>
          <p className="text-sm text-gray-700">When the court issues your grant, let us know so we can update your file and show you the next steps.</p>
          <form action={markGrantReceivedAction}>
            <input type="hidden" name="caseId" value={caseId} />
            <button
              type="submit"
              className="inline-flex items-center rounded-full bg-green-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-green-700"
            >
              I've received my {grantLabel.toLowerCase()}
            </button>
          </form>
          <GrantUploadForm caseId={caseId} existingUrl={grantDocumentUrl} />
        </div>
        <Link
          href="/portal"
          className="inline-flex items-center rounded-full border border-[color:var(--border-muted)] px-5 py-2 text-sm font-semibold text-[color:var(--ink)] transition hover:border-[color:var(--brand)] hover:text-[color:var(--brand)]"
        >
          Back to portal
        </Link>
      </div>
    );
  }

  // Just filed - needs court file number
  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-700">Your {applicationLabel} has been filed.</p>
      <p className="text-sm text-gray-700">
        The court will review your materials and issue a {grantLabel.toLowerCase()} if everything is in order. This can take several weeks or longer depending on court workload.
      </p>
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 space-y-3">
        <p className="font-medium text-amber-900">Do you have your court file number?</p>
        <p className="text-sm text-amber-800">
          If you filed in person or received a confirmation, enter your court file number here. This helps us track your case.
        </p>
        <CourtFileNumberForm caseId={caseId} existingFileNumber={courtFileNumber} />
      </div>
      <Link
        href="/portal"
        className="inline-flex items-center rounded-full border border-[color:var(--border-muted)] px-5 py-2 text-sm font-semibold text-[color:var(--ink)] transition hover:border-[color:var(--brand)] hover:text-[color:var(--brand)]"
      >
        Back to portal
      </Link>
    </div>
  );
}

// Checklist step: uses native required checkboxes to gate submission (no client hook needed)
function ChecklistStep({ caseId, nextStep, pathType }: { caseId: string; nextStep: number; pathType: string }) {
  const isAdmin = pathType === "administration";
  const items = isAdmin
    ? [
        "Signed and notarized P2, P5, and P9 forms",
        "The original death certificate",
        "A copy of each P1 notice you sent",
        "The will search result from Vital Statistics (showing no will registered)",
        "Consent forms from higher-priority heirs (if applicable)",
        "Any additional documents listed on the first page of your packet",
        "Photocopies of everything for your records",
      ]
    : [
        "Signed and notarized P2, P3, and P9 forms",
        "The original will (and any codicils)",
        "The original death certificate",
        "A copy of each P1 notice you sent",
        "The will search result from Vital Statistics",
        "Any additional documents listed on the first page of your packet",
        "Photocopies of everything for your records",
      ];

  return (
    <form action={advanceProbateStepAction} className="mt-6 flex flex-col gap-3">
      <input type="hidden" name="caseId" value={caseId} />
      <input type="hidden" name="nextStep" value={nextStep} />
      <ul className="space-y-2">
        {items.map((label, idx) => (
          <li key={label} className="flex items-start gap-3">
            <input id={`pkg-${idx}`} type="checkbox" className="mt-1 h-4 w-4 rounded border-gray-300" name={`pkg-${idx}`} required />
            <label htmlFor={`pkg-${idx}`} className="text-sm text-gray-700">
              {label}
            </label>
          </li>
        ))}
      </ul>
      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          className="inline-flex items-center rounded-full bg-[color:var(--ink)] px-5 py-2 text-sm font-semibold text-white transition hover:bg-black"
        >
          My package is assembled
        </button>
        <Link
          href="/portal"
          className="inline-flex items-center rounded-full border border-[color:var(--border-muted)] px-5 py-2 text-sm font-semibold text-[color:var(--ink)] transition hover:border-[color:var(--brand)] hover:text-[color:var(--brand)]"
        >
          Back to portal
        </Link>
      </div>
    </form>
  );
}

export default async function ProbateFilingWizard({ searchParams }: { searchParams?: SearchParams }) {
  const session = await requirePortalAuth("/portal/probate-filing");
  const userId = (session.user as { id?: string })?.id ?? null;
  const matter = await resolvePortalMatter(userId);
  if (!matter) redirect("/portal");

  const currentStatus = matter.portalStatus as PortalStatus;
  const allowedStatuses: PortalStatus[] = [
    "notices_waiting_21_days",
    "probate_package_ready",
    "probate_filing_ready",
    "probate_filing_in_progress",
    "probate_filed",
    "waiting_for_grant",
    "grant_complete",
  ];
  const waitFinished =
    currentStatus === "notices_waiting_21_days" &&
    matter.noticesMailedAt !== null &&
    Math.max(0, 21 - Math.floor((Date.now() - matter.noticesMailedAt.getTime()) / (1000 * 60 * 60 * 24))) === 0;

  if (!allowedStatuses.includes(currentStatus) || (currentStatus === "notices_waiting_21_days" && !waitFinished)) {
    redirect("/portal");
  }

  let step = clampStep(searchParams?.step ?? "1");
  if (!searchParams?.step) {
    const cookieStore = await cookies();
    const saved = cookieStore.get(`portal:probate-step:${matter.id}`)?.value;
    if (saved) {
      step = clampStep(saved);
    }
  }

  // When still in the waiting/ready state, always reset to step 1 to avoid stale cookies.
  if (currentStatus === "notices_waiting_21_days" || currentStatus === "probate_filing_ready") {
    step = 1;
  }

  // If already filed/grant received, force the waiting view.
  if ((currentStatus === "probate_filed" || currentStatus === "waiting_for_grant" || currentStatus === "grant_complete") && step < MAX_STEP) {
    step = MAX_STEP;
  }

  const decedentName = matter.draft?.decFullName ?? "the deceased";
  const isAdmin = matter.pathType === "administration";
  const pathLabel = isAdmin ? "administration" : "probate";
  const grantLabel = isAdmin ? "Grant of Administration" : "Grant of Probate";
  const applicantRole = isAdmin ? "administrator" : "executor";

  const steps = [
    {
      title: `Download your ${pathLabel} filing packet`,
      description: "Print one complete copy of this packet. You will sign, notarize, and mail or file this package at court.",
      content: matter.probatePackagePdfUrl ? (
        <a
          href={matter.probatePackagePdfUrl}
          target="_blank"
          className="inline-flex items-center rounded-full bg-gray-900 px-5 py-2 text-sm font-semibold text-white transition hover:bg-black"
        >
          Download {pathLabel} filing packet
        </a>
      ) : (
        <button disabled className="inline-flex items-center rounded-full border border-red-300 bg-red-50 px-5 py-2 text-sm font-semibold text-red-700">
          PDF not found (please contact support)
        </button>
      ),
      cta: "I've downloaded my filing packet",
    },
    {
      title: "Find the P2 form in your packet",
      description: "In your packet, find the form labelled P2.",
      content: <p className="text-sm text-gray-700">You’ll sign P2 at home in the next step.</p>,
      cta: "I’ve found the P2 form",
    },
    {
      title: "Sign P2 at home",
      description: "Complete only what you are allowed to sign at home on P2.",
      content: (
        <ul className="list-disc space-y-1 pl-5 text-sm text-gray-700">
          <li>Sign where it says “Applicant’s signature” on P2.</li>
          <li>Do not write anywhere else on P2.</li>
          <li>Leave any sections clearly marked “For court use only” blank.</li>
          <li>If any part says it must be witnessed or notarized, do not sign that section yet.</li>
        </ul>
      ),
      cta: "I’ve signed P2 at home",
    },
    {
      title: "Get ready for your notary appointment",
      description: "Book a short appointment with a BC notary public or lawyer.",
      content: (
        <div className="space-y-2 text-sm text-gray-700">
          <ul className="list-disc space-y-1 pl-5">
            <li>Book an appointment with a BC notary public or lawyer.</li>
            <li>Bring your government-issued photo ID.</li>
          </ul>
          <div className="rounded-2xl border border-[color:var(--border-muted)] bg-[color:var(--bg-muted)] px-4 py-3">
            <p className="text-sm font-semibold text-gray-900">Share this with the notary/lawyer:</p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-gray-800">
              <li>I'm applying for {isAdmin ? "administration" : "probate"} for {decedentName}.</li>
              <li>This packet includes P2, {isAdmin ? "P5" : "P3"} (Affidavit of applicant), and P9 (Affidavit of delivery).</li>
              <li>I've already signed the applicant's section on P2 at home, as allowed.</li>
              <li>I need you to witness and complete the notary sections on the forms that require it, including {isAdmin ? "P5" : "P3"} and P9, and any other spots marked for a notary or lawyer.</li>
            </ul>
          </div>
        </div>
      ),
      cta: "I’ve booked my notary appointment",
    },
    {
      title: "Sign and notarize at your appointment",
      description: "The notary or lawyer will guide you through the signatures and notarization.",
      content: (
        <ul className="list-disc space-y-1 pl-5 text-sm text-gray-700">
          <li>At the appointment, the notary or lawyer will tell you where to sign and will complete the notary sections.</li>
          <li>Show them the script above if needed.</li>
          <li>Do not fill in anything they say they will complete.</li>
        </ul>
      ),
      cta: "My forms are signed and notarized",
    },
    {
      title: "Prepare your package",
      description: "Assemble everything the court needs in one envelope.",
      content: <ChecklistStep caseId={matter.id} nextStep={6 + 1} pathType={matter.pathType ?? "probate"} />,
      cta: null,
    },
    {
      title: "Mail or file at court",
      description: "Send your package to the Supreme Court registry that handles your application.",
      content: (
        <div className="space-y-2 text-sm text-gray-700">
          <ul className="list-disc space-y-1 pl-5">
            <li>You can mail or bring this package to the Supreme Court registry that handles your {pathLabel} application.</li>
            <li>Use the address shown on your filing packet or on the court website.</li>
            <li>
              Write your CASE ID <span className="font-mono">{matter.caseCode ?? matter.id}</span> on the outside of the envelope.
            </li>
            <li>Processing can take several weeks or longer. This is normal.</li>
          </ul>
        </div>
      ),
      cta: `I've mailed or filed my ${pathLabel} package`,
    },
    {
      title: `Waiting for your ${matter.pathType === "administration" ? "Grant of Administration" : "Grant of Probate"}`,
      description: `Your ${matter.pathType === "administration" ? "administration" : "probate"} application has been filed.`,
      content: (
        <WaitingStep
          caseId={matter.id}
          portalStatus={currentStatus}
          courtFileNumber={(matter as any).courtFileNumber ?? null}
          grantIssuedAt={matter.grantIssuedAt}
          grantDocumentUrl={(matter as any).grantDocumentUrl ?? null}
          pathType={matter.pathType ?? "probate"}
        />
      ),
      cta: null,
    },
  ];

  const currentStep = steps[Math.min(step, steps.length) - 1];

  return (
    <PortalShell
      title="We’ll guide you step by step."
      description="Download your documents, follow the checklist, and mark milestones as you go."
      eyebrow="Client portal"
      actions={
        <Link
          href="/portal"
          className="inline-flex items-center rounded-full border border-[color:var(--border-muted)] px-4 py-2 text-sm font-semibold text-[color:var(--ink)] transition hover:border-[color:var(--brand)] hover:text-[color:var(--brand)]"
        >
          Back to portal
        </Link>
      }
    >
      <StepShell step={step} title={currentStep.title} description={currentStep.description} pathType={matter.pathType ?? "probate"}>
        {currentStep.content}
        {currentStep.cta ? (
          <StepForm caseId={matter.id} nextStep={Math.min(step + 1, MAX_STEP)} cta={currentStep.cta} />
        ) : null}
      </StepShell>
    </PortalShell>
  );
}
