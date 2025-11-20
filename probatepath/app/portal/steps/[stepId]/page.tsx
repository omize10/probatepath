import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { PortalShell } from "@/components/portal/PortalShell";
import { StepDetailFrame } from "@/components/portal/StepDetailFrame";
import { StepSummaryCard } from "@/components/portal/StepSummaryCard";
import { Button } from "@/components/ui/button";
import { requirePortalAuth } from "@/lib/auth";
import { resolvePortalMatter } from "@/lib/portal/server";
import {
  journeySteps,
  normalizeJourneyState,
  type JourneyStepId,
  type JourneyStatus,
} from "@/lib/portal/journey";
import { formatIntakeDraftRecord } from "@/lib/intake/format";
import type { Address, EstateIntake, PersonName } from "@/lib/intake/case-blueprint";

type StepPageProps = {
  params: {
    stepId: string;
  };
};

type PortalMatter = NonNullable<Awaited<ReturnType<typeof resolvePortalMatter>>>;
type NormalizedDraft = ReturnType<typeof formatIntakeDraftRecord>;

export default async function JourneyStepPage({ params }: StepPageProps) {
  const session = await requirePortalAuth("/portal");
  const userId = (session.user as { id?: string })?.id ?? null;
  const matter = await resolvePortalMatter(userId);
  if (!matter) {
    notFound();
  }

  const normalizedId = params.stepId as JourneyStepId;
  const step = journeySteps.find((item) => item.id === normalizedId);
  if (!step) {
    notFound();
  }

  const draft = matter.draft ? formatIntakeDraftRecord(matter.draft) : null;
  const journeyState = normalizeJourneyState(matter.journeyStatus ?? undefined);
  const status: JourneyStatus = journeyState[step.id]?.status ?? "not_started";
  const stepIndex = journeySteps.findIndex((item) => item.id === step.id);
  const summarySections = renderSummarySections(step.id, { estate: draft?.estateIntake, matter, draft });
  const instructions = getInstructions(step.id);
  const confirmCopy = getConfirmCopy(step.id);

  return (
    <PortalShell eyebrow="Your Steps" title={step.title} description={step.subtitle}>
      <StepDetailFrame
        stepId={step.id}
        stepNumber={stepIndex + 1}
        title={step.title}
        subtitle={instructions.lede ?? step.subtitle}
        status={status}
        instructions={{
          heading: "What happens next",
          body: instructions.body,
          buttonLabel: instructions.buttonLabel,
        }}
        confirm={confirmCopy}
      >
        {summarySections}
      </StepDetailFrame>
    </PortalShell>
  );
}

type StepContext = {
  estate: EstateIntake | null | undefined;
  matter: PortalMatter;
  draft: NormalizedDraft | null;
};

function renderSummarySections(stepId: JourneyStepId, context: StepContext): ReactNode {
  const estate = context.estate;
  const applicant = estate?.applicant;
  const deceased = estate?.deceased;
  const placeOfDeath = deceased?.placeOfDeath;
  const assets = estate?.assets;
  const debts = estate?.debts;

  switch (stepId) {
    case "review-info":
      return (
        <div className="space-y-6">
          <StepSummaryCard
            title="Deceased details"
            description="Confirm the basics exactly as they appear on the death certificate."
            items={[
              { label: "Legal name", value: formatName(deceased?.name) },
              { label: "Date of death", value: formatDate(deceased?.dateOfDeath) },
              {
                label: "Place of death",
                value: buildLocationString(placeOfDeath?.city, placeOfDeath?.province, placeOfDeath?.country),
              },
              { label: "Date of birth", value: formatDate(deceased?.dateOfBirth) },
              { label: "Last address", value: formatAddress(deceased?.address) },
            ]}
            footer={
              <Link href="/portal/info" className="text-sm font-semibold text-[color:var(--brand-navy)] underline-offset-4 hover:underline">
                Edit in Your Info
              </Link>
            }
          />
          <StepSummaryCard
            title="Applicant details"
            description="These fields appear on every form and notice."
            items={[
              { label: "Legal name", value: formatName(applicant?.name) },
              { label: "Relationship to the deceased", value: displayText(applicant?.relationship || "") },
              { label: "Email", value: displayText(applicant?.contact?.email) },
              { label: "Phone", value: displayText(applicant?.contact?.phone) },
              { label: "Mailing address", value: formatAddress(applicant?.address) },
              {
                label: "Co-applicants listed",
                value: applicant?.coApplicants?.length
                  ? applicant.coApplicants.map((person) => formatName(person.name)).join(", ")
                  : "Only you are listed right now.",
              },
            ]}
            footer={
              <Link href="/portal/intake" className="text-sm font-semibold text-[color:var(--brand-navy)] underline-offset-4 hover:underline">
                Finish missing intake questions
              </Link>
            }
          />
        </div>
      );
    case "will-search":
      return (
        <div className="space-y-6">
          <StepSummaryCard
            title="Details that fill your wills notice request"
            description="Double-check the spelling and dates before printing and mailing the packet."
            items={[
              { label: "Deceased legal name", value: formatName(deceased?.name) },
              { label: "Date of birth", value: formatDate(deceased?.dateOfBirth) },
              { label: "Date of death", value: formatDate(deceased?.dateOfDeath) },
              {
                label: "Place of death",
                value: buildLocationString(placeOfDeath?.city, placeOfDeath?.province, placeOfDeath?.country),
              },
              { label: "Executor email", value: displayText(applicant?.contact?.email) },
              { label: "Executor phone", value: displayText(applicant?.contact?.phone) },
            ]}
            footer={
              <Link href="/portal/info" className="text-sm font-semibold text-[color:var(--brand-navy)] underline-offset-4 hover:underline">
                Edit personal details
              </Link>
            }
          />
          <StepSummaryCard
            title="Download wills notice package"
            description="Print the packet, add photocopies of your ID, and bring it to Service BC or mail it with the fee."
            footer={
              <div className="flex flex-wrap gap-3">
                <Button asChild>
                  <Link href="/portal/documents">Open documents</Link>
                </Button>
                {context.matter.id ? (
                  <Button asChild variant="secondary">
                    <a href={`/api/will-search/${context.matter.id}/pdf?download=1`} target="_blank" rel="noreferrer">
                      Download VSA 532
                    </a>
                  </Button>
                ) : null}
              </div>
            }
          >
            <ul className="list-disc space-y-2 pl-5">
              <li>Use black ink to sign the request after you print it.</li>
              <li>Include photocopies of two pieces of executor ID if you are mailing it in.</li>
              <li>Keep the receipt or Service BC confirmation letter for your records.</li>
            </ul>
          </StepSummaryCard>
          <StepSummaryCard
            title="How to sign and mail"
            description="Follow the same steps whether you mail or drop the packet off."
          >
            <ol className="list-decimal space-y-2 pl-5">
              <li>Sign the request and add any supporting exhibits or payment details.</li>
              <li>Mail it to Vital Statistics or deliver it at Service BC with the fee.</li>
              <li>Store your receipt or reference number in the portal once you have it.</li>
            </ol>
          </StepSummaryCard>
        </div>
      );
    case "executors-beneficiaries":
      return (
        <div className="space-y-6">
          <StepSummaryCard
            title="Executors linked to this matter"
            description="This list feeds the schedules and notices."
          >
            {context.matter.executors.length ? (
              <ul className="space-y-3 text-sm text-[color:var(--ink)]">
                {context.matter.executors.map((executor) => (
                  <li key={executor.id} className="rounded-2xl border border-[color:var(--border-muted)] p-3">
                    <p className="font-semibold">{executor.fullName}</p>
                    <p className="text-xs text-[color:var(--ink-muted)]">
                      {executor.city && executor.province ? `${executor.city}, ${executor.province}` : "Location not added"}
                    </p>
                    <p className="text-xs text-[color:var(--ink-muted)]">
                      {executor.isPrimary ? "Primary executor" : executor.isAlternate ? "Alternate executor" : "Executor"}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-[color:var(--ink-muted)]">No executors saved yet.</p>
            )}
            <Link href="/portal/executors" className="mt-4 inline-flex text-sm font-semibold text-[color:var(--brand-navy)] underline-offset-4 hover:underline">
              Edit executors
            </Link>
          </StepSummaryCard>
          <StepSummaryCard title="Beneficiaries and notice recipients">
            {context.matter.beneficiaries.length ? (
              <ul className="space-y-3 text-sm text-[color:var(--ink)]">
                {context.matter.beneficiaries.map((beneficiary) => (
                  <li key={beneficiary.id} className="rounded-2xl border border-[color:var(--border-muted)] p-3">
                    <p className="font-semibold">{beneficiary.fullName}</p>
                    <p className="text-xs text-[color:var(--ink-muted)]">
                      {beneficiary.relationshipLabel || beneficiary.type.toLowerCase()}
                    </p>
                    <p className="text-xs text-[color:var(--ink-muted)]">
                      Gift: {beneficiary.shareDescription || "Not recorded yet"}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-[color:var(--ink-muted)]">No beneficiaries recorded yet.</p>
            )}
            <div className="mt-4 flex flex-wrap gap-3">
              <Button asChild size="sm">
                <Link href="/portal/beneficiaries">Edit beneficiaries</Link>
              </Button>
              <Button asChild size="sm" variant="secondary">
                <Link href="/portal/info">View summary</Link>
              </Button>
            </div>
          </StepSummaryCard>
        </div>
      );
    case "assets-debts":
      return (
        <div className="space-y-6">
          <StepSummaryCard
            title="Assets overview"
            description="Everything you enter here syncs to the affidavits."
            items={[
              { label: "Real estate in BC", value: formatYesNo(assets?.hasBCRealEstate ?? null) },
              { label: "Properties listed", value: assets?.bcProperties?.length ?? 0 },
              { label: "Bank or investment accounts", value: formatYesNo(assets?.hasBankOrInvestments ?? null) },
              { label: "Accounts listed", value: assets?.accounts?.length ?? 0 },
              { label: "Vehicles recorded", value: assets?.vehicles?.length ?? 0 },
              { label: "Valuable items listed", value: assets?.valuableItems?.length ?? 0 },
            ]}
            footer={
              <Link href="/portal/intake" className="text-sm font-semibold text-[color:var(--brand-navy)] underline-offset-4 hover:underline">
                Add or edit assets in the intake
              </Link>
            }
          />
          <StepSummaryCard
            title="Debts and funeral costs"
            items={[
              { label: "Liabilities recorded", value: debts?.liabilities?.length ?? 0 },
              { label: "Funeral costs amount", value: displayText(debts?.funeralCostsAmount) },
              { label: "Funeral costs paid by", value: displayText(debts?.funeralCostsPaidBy) },
            ]}
          />
        </div>
      );
    case "review-forms":
      return (
        <div className="space-y-6">
          <StepSummaryCard
            title="Download your forms"
            description="Open each PDF, scan the details, and keep unsigned copies for the notary appointment."
            footer={
              <div className="flex flex-wrap gap-3">
                <Button asChild>
                  <Link href="/portal/documents">Open documents</Link>
                </Button>
                {context.matter.id ? (
                  <Button asChild variant="secondary">
                    <a href={`/api/matter/${context.matter.id}/package/phase1/pdf`} target="_blank" rel="noreferrer">
                      Download Phase 1 packet
                    </a>
                  </Button>
                ) : null}
              </div>
            }
          >
            <ul className="list-disc space-y-2 pl-5">
              <li>Check the names, dates, registry, and asset summaries in each PDF.</li>
              <li>Leave signature, oath, and payment sections blank until you are in front of the commissioner.</li>
              <li>Repeat downloads anytime after you edit your intake data.</li>
            </ul>
          </StepSummaryCard>
        </div>
      );
    case "sign-notarize":
      return (
        <div className="space-y-6">
          <StepSummaryCard
            title="Signing checklist"
            description="Bring the packet, two pieces of ID, and only sign in front of the commissioner or notary."
          >
            <ul className="list-disc space-y-2 pl-5">
              <li>Book a commissioner/notary and bring printed forms plus exhibit tabs.</li>
              <li>Sign and initial every required spot while the commissioner watches.</li>
              <li>Scan or photograph fully signed copies for your records.</li>
            </ul>
            <Button asChild className="mt-4">
              <Link href="/portal/how-to-assemble">Read signing tips</Link>
            </Button>
          </StepSummaryCard>
        </div>
      );
    case "file-court":
      return (
        <div className="space-y-6">
          <StepSummaryCard
            title="Filing instructions"
            description="After everything is signed, deliver the packet and keep your courier or drop-off receipt."
          >
            <ol className="list-decimal space-y-2 pl-5">
              <li>Stack the packet in the order we generated and add exhibit tabs.</li>
              <li>Deliver the packet in person or send by tracked courier to the correct registry.</li>
              <li>Record the courier tracking number, payment receipt, and any registry updates.</li>
            </ol>
            <div className="mt-4 flex flex-wrap gap-3">
              <Button asChild>
                <Link href="/portal/how-to-assemble">Assembly refresher</Link>
              </Button>
              <Button asChild variant="secondary">
                <Link href="/portal/help">Get filing help</Link>
              </Button>
            </div>
          </StepSummaryCard>
        </div>
      );
    default:
      return null;
  }
}

function getInstructions(stepId: JourneyStepId) {
  switch (stepId) {
    case "review-info":
      return {
        lede: "Before we build your court forms, double-check the basics.",
        body: [
          "When you press Next, you'll see the deceased's details plus your executor contact information.",
          "Correct anything that has changed before you move forward.",
        ],
        buttonLabel: "Next – review my basic info",
      };
    case "will-search":
      return {
        lede: "Generate, print, sign, and mail the wills notice packet.",
        body: [
          "We'll show you the details that go into the VSA 532 request and link the ready-to-print packet.",
          "Follow the mailing checklist and keep proof for your records.",
        ],
        buttonLabel: "Next – review wills notice details",
      };
    case "executors-beneficiaries":
      return {
        lede: "Review every executor and beneficiary on file.",
        body: [
          "We'll summarise who is listed on your schedules so you can fix spelling or missing addresses.",
          "Update anything in Your Info or the Executors/Beneficiaries tabs before marking this done.",
        ],
        buttonLabel: "Next – review executors & beneficiaries",
      };
    case "assets-debts":
      return {
        lede: "Make sure the inventory is complete before we generate affidavits.",
        body: [
          "We'll show a high-level summary of assets and liabilities captured in your intake.",
          "Edit the intake section if you need to add properties, accounts, or debts.",
        ],
        buttonLabel: "Next – review assets & debts",
      };
    case "review-forms":
      return {
        lede: "Download and read each court form yourself.",
        body: [
          "You'll get quick links to the P1, P3/P4, P9, P10/P11, schedules, and the Phase 1 packet.",
          "Open each file, check every detail, and only continue once you're satisfied.",
        ],
        buttonLabel: "Next – open the forms list",
      };
    case "sign-notarize":
      return {
        lede: "Plan the signing appointment and know what to bring.",
        body: [
          "We'll recap the signing checklist so you're ready for the commissioner or notary.",
          "Once you've signed everything, you can mark the step complete.",
        ],
        buttonLabel: "Next – view signing checklist",
      };
    case "file-court":
      return {
        lede: "File the packet with the registry once everything is signed.",
        body: [
          "You'll see a clear filing checklist to follow.",
          "When you've delivered or couriered the packet, confirm the step.",
        ],
        buttonLabel: "Next – view filing instructions",
      };
    default:
      return {
        lede: "",
        body: ["Review the information for this step."],
        buttonLabel: "Next",
      };
  }
}

function getConfirmCopy(stepId: JourneyStepId) {
  switch (stepId) {
    case "will-search":
      return {
        statement: "I've reviewed the details and mailed/delivered the wills notice package.",
        description: "Keep your proof of submission for your records. You can still re-download if needed.",
        buttonLabel: "I’ve mailed my wills notice package",
      };
    case "executors-beneficiaries":
      return {
        statement: "I've reviewed the executor and beneficiary list.",
        description: "Everyone who needs notice is listed and the details look right.",
        buttonLabel: "Confirm executor & beneficiary list",
      };
    case "assets-debts":
      return {
        statement: "I've reviewed the assets and debts summary.",
        description: "Anything missing has been added through the intake.",
        buttonLabel: "Confirm assets & debts",
      };
    case "review-forms":
      return {
        statement: "I've opened and reviewed each court form myself.",
        description: "Everything looks right and I'm ready to sign when the time comes.",
        buttonLabel: "Confirm I reviewed the forms",
      };
    case "sign-notarize":
      return {
        statement: "I've signed the affidavits and exhibits in front of a commissioner or notary.",
        description: "Scans or photos are stored safely for my reference.",
        buttonLabel: "Confirm signing is done",
      };
    case "file-court":
      return {
        statement: "I've filed or couriered the full packet to the registry.",
        description: "I saved the tracking or drop-off receipt so I can follow up.",
        buttonLabel: "Confirm filing complete",
      };
    default:
      return {
        statement: "I've reviewed this information and it is correct.",
        description: "If anything changes later, you can come back and update it.",
        buttonLabel: "Confirm and mark this step complete",
      };
  }
}

function formatName(name?: PersonName | null) {
  if (!name) return "Not provided yet";
  const tokens = [name.first, name.middle1, name.middle2, name.middle3, name.last, name.suffix]
    .map((token) => token?.trim())
    .filter(Boolean);
  return tokens.length ? tokens.join(" ") : "Not provided yet";
}

function formatAddress(address?: Address | null) {
  if (!address) return "Not provided yet";
  const lines = [address.line1, address.line2].filter(Boolean);
  const locality = [address.city, address.region].filter(Boolean).join(", ");
  const countryLine = [address.postalCode, address.country].filter(Boolean).join(" ");
  const joined = [...lines, locality, countryLine].filter(Boolean).join(" · ");
  return joined || "Not provided yet";
}

function formatDate(value?: string | null) {
  if (!value) return "Not provided yet";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return new Intl.DateTimeFormat("en-CA", { dateStyle: "long" }).format(date);
}

function buildLocationString(city?: string, province?: string, country?: string) {
  return [city, province, country].filter(Boolean).join(", ") || "Not provided yet";
}

function displayText(value?: string | null) {
  return value && value.trim().length > 0 ? value : "Not provided yet";
}

function formatYesNo(value?: "yes" | "no" | "unknown" | null) {
  if (!value) return "Not provided yet";
  switch (value) {
    case "yes":
      return "Yes";
    case "no":
      return "No";
    default:
      return "Not sure yet";
  }
}
