import { redirect } from "next/navigation";
import { MatterIntakeWizard } from "@/components/intake/matter-intake-wizard";
import { requirePortalAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatIntakeDraftRecord } from "@/lib/intake/format";
import { defaultIntakeDraft } from "@/lib/intake/types";
import { normalizePortalStepId, getPortalStepIndex, type PortalStepId } from "@/lib/intake/portal/steps";
import { findFirstIncompletePortalStep } from "@/lib/intake/portal/validation";

interface MatterIntakePageProps {
  params: Promise<{ matterId: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function MatterIntakePage({ params, searchParams }: MatterIntakePageProps) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const stepParam = typeof resolvedSearchParams?.step === "string" ? `?step=${resolvedSearchParams.step}` : "";
  const session = await requirePortalAuth(`/matters/${resolvedParams.matterId}/intake${stepParam}`);
  const userId = (session.user as { id?: string })?.id ?? null;
  if (!userId) {
    redirect("/portal");
  }

  const matter = await prisma.matter.findFirst({
    where: { id: resolvedParams.matterId, userId },
    include: { draft: true },
  });

  if (!matter) {
    redirect("/portal");
  }

  if (matter.rightFitStatus === "NOT_FIT") {
    redirect(`/matters/${resolvedParams.matterId}/not-a-fit`);
  }

  const draftRecord = matter.draft ? formatIntakeDraftRecord(matter.draft) : defaultIntakeDraft;
  const requestedStep = normalizePortalStepId(typeof resolvedSearchParams?.step === "string" ? resolvedSearchParams?.step : null);
  const firstIncomplete = findFirstIncompletePortalStep(draftRecord);

  const resolvedStep = resolveStep(requestedStep, firstIncomplete);
  if (!requestedStep || resolvedStep !== requestedStep) {
    redirect(`/matters/${resolvedParams.matterId}/intake?step=${resolvedStep}`);
  }

  return (
    <MatterIntakeWizard
      matterId={resolvedParams.matterId}
      initialDraft={draftRecord}
      currentStep={resolvedStep}
      journeyHref="/portal/steps"
      infoHref="/portal/info"
      documentsHref="/portal/documents"
      helpHref="/portal/help"
    />
  );
}

function resolveStep(requested: PortalStepId | null, fallback: PortalStepId): PortalStepId {
  if (!requested) return fallback;
  const requestedIndex = getPortalStepIndex(requested);
  const fallbackIndex = getPortalStepIndex(fallback);
  if (requestedIndex > fallbackIndex) {
    return fallback;
  }
  return requested;
}
