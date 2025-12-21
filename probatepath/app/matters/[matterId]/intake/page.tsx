import { redirect } from "next/navigation";
import { MatterIntakeWizard } from "@/components/intake/matter-intake-wizard";
import { requirePortalAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { prismaEnabled } from "@/lib/prisma";
import { formatIntakeDraftRecord } from "@/lib/intake/format";
import { defaultIntakeDraft } from "@/lib/intake/types";
import { normalizePortalStepId, getPortalStepIndex, type PortalStepId } from "@/lib/intake/portal/steps";
import { findFirstIncompletePortalStep } from "@/lib/intake/portal/validation";
import { getWillFilesForMatter, serializeWillFiles } from "@/lib/will-files";
import type { WillFileClient } from "@/lib/will-files/types";

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

  const willFiles = await getWillFilesForMatter(resolvedParams.matterId);
  const serializedWillFiles: WillFileClient[] = serializeWillFiles(willFiles);
  const draftRecord = matter.draft ? formatIntakeDraftRecord(matter.draft) : defaultIntakeDraft;
  const enhancedDraft = {
    ...draftRecord,
    estateIntake: {
      ...draftRecord.estateIntake,
      willUpload: {
        hasFiles: serializedWillFiles.length > 0,
        lastUploadedAt: serializedWillFiles[serializedWillFiles.length - 1]?.createdAt ?? "",
      },
    },
  };
  const requestedStep = normalizePortalStepId(typeof resolvedSearchParams?.step === "string" ? resolvedSearchParams?.step : null);
  const firstIncomplete = findFirstIncompletePortalStep(enhancedDraft);

  const resolvedStep = requestedStep ?? (prismaEnabled ? firstIncomplete : "applicant-name-contact");

  return (
    <MatterIntakeWizard
      matterId={resolvedParams.matterId}
      initialDraft={enhancedDraft}
      initialWillFiles={serializedWillFiles}
      currentStep={resolvedStep}
      journeyHref="/portal"
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
