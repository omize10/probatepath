import Link from "next/link";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { PortalShell } from "@/components/portal/PortalShell";
import { StepFlowLayout } from "@/components/portal/step-flow/StepFlowLayout";
import { Button } from "@/components/ui/button";
import { requirePortalAuth } from "@/lib/auth";
import { resolvePortalMatter } from "@/lib/portal/server";
import { prisma } from "@/lib/prisma";
import { formatIntakeDraftRecord } from "@/lib/intake/format";
import {
  canonicalizeJourneyStatus,
  normalizeJourneyState,
  setJourneyStateValue,
  type JourneyStepId,
  type JourneyStatus,
  type JourneyState,
} from "@/lib/portal/journey";
import { getStepFlow } from "@/lib/portal/step-flows";

interface FlowPageProps {
  params: Promise<{ stepId: string; pageSlug: string }>;
}

export default async function StepFlowPage({ params }: FlowPageProps) {
  const resolvedParams = await params;
  const session = await requirePortalAuth("/portal");
  const userId = (session.user as { id?: string })?.id ?? null;
  const matter = await resolvePortalMatter(userId);
  if (!matter) {
    redirect("/portal");
  }

  const stepId = resolvedParams.stepId as JourneyStepId;
  const journeyStateSnapshot = normalizeJourneyState(matter.journeyStatus ?? undefined);
  const draft = matter.draft ? formatIntakeDraftRecord(matter.draft) : null;
  const flowDefinition = getStepFlow(stepId, { matter, draft });
  if (!flowDefinition) return renderPlaceholder(stepId);
  const pages = flowDefinition.pages;
  if (!pages.length) return renderPlaceholder(stepId);

  const progressRow = matter.stepProgress?.find((row) => row.stepKey === stepId);
  const normalizedSlug = resolveSlug(resolvedParams.pageSlug, pages[0].slug);
  const currentIndex = pages.findIndex((page) => page.slug === normalizedSlug);
  if (currentIndex === -1) {
    const resumeIndex = resolveResumeIndex(pages.length, progressRow?.pageIndex ?? 0, progressRow?.status ?? null);
    const targetSlug = pages[resumeIndex]?.slug ?? pages[0].slug;
    redirect(`/portal/steps/${stepId}/flow/${targetSlug}`);
  }

  await persistCurrentPage({
    matterId: matter.id,
    stepId,
    pageIndex: currentIndex,
    existing: progressRow,
    journeyState: journeyStateSnapshot,
  });

  const page = pages[currentIndex];
  const nextPage = pages[currentIndex + 1] ?? null;
  const previousPage = pages[currentIndex - 1] ?? null;
  const nextSlug = nextPage ? nextPage.slug : "";
  const isFinalPage = nextPage === null;
  const statusForSubmit: JourneyStatus = isFinalPage ? "done" : "in_progress";

  async function advanceStep(formData: FormData) {
    "use server";
    const matterId = String(formData.get("matterId") ?? "");
    const targetStepId = formData.get("stepId") as JourneyStepId | null;
    const nextTarget = String(formData.get("nextSlug") ?? "");
    const currentIndexRaw = formData.get("currentIndex");
    const totalPagesRaw = formData.get("totalPages");
    const currentSlug = String(formData.get("currentSlug") ?? "");
    const currentIndexValue = Number(currentIndexRaw ?? "0");
    const totalPagesValue = Number(totalPagesRaw ?? pages.length);

    if (!matterId || !targetStepId) {
      throw new Error("Missing step context.");
    }

    console.log("[portal] advanceStep submit", {
      matterId,
      targetStepId,
      nextTarget,
      currentIndexValue,
      totalPagesValue,
    });

    const matterRecord = await prisma.matter.findUnique({
      where: { id: matterId },
      select: { id: true, journeyStatus: true },
    });
    if (!matterRecord) {
      throw new Error("Matter not found.");
    }

    const normalizedState = normalizeJourneyState(matterRecord.journeyStatus ?? undefined);
    const maxIndex = Math.max((Number.isFinite(totalPagesValue) ? totalPagesValue : pages.length) - 1, 0);
    const requestedNextIndex = nextTarget ? pages.findIndex((p) => p.slug === nextTarget) : -1;
    const fallbackIndex = Number.isFinite(currentIndexValue) ? Math.max(0, Math.min(currentIndexValue, maxIndex)) : 0;
    const safePageIndex = requestedNextIndex >= 0 ? Math.min(Math.max(requestedNextIndex, 0), maxIndex) : fallbackIndex;
    const finalStatus: JourneyStatus = requestedNextIndex === -1 ? "done" : safePageIndex >= maxIndex ? "done" : "in_progress";
    const nextState = setJourneyStateValue(normalizedState, targetStepId, finalStatus);
    const newStatus = nextState[targetStepId].status;

    const metadataPayload = buildMetadata(targetStepId, currentSlug, formData);

    try {
      console.log("[portal] persist step progress", {
        matterId,
        stepId: targetStepId,
        status: newStatus,
        safePageIndex,
      });
      await prisma.$transaction([
        prisma.matterStepProgress.upsert({
          where: { matterId_stepKey: { matterId, stepKey: targetStepId } },
          create: {
            matterId,
            stepKey: targetStepId,
            status: newStatus,
            pageIndex: safePageIndex,
            ...(metadataPayload ? { metadata: metadataPayload } : {}),
          },
          update: {
            status: newStatus,
            pageIndex: safePageIndex,
            ...(metadataPayload ? { metadata: metadataPayload } : {}),
          },
        }),
        prisma.matter.update({
          where: { id: matterId },
          data: { journeyStatus: nextState },
        }),
      ]);
      console.log("[portal] persist step progress success", { matterId, stepId: targetStepId });
    } catch (error) {
      console.warn("[portal] Failed to persist step progress", error);
    }

    revalidatePath("/portal");
    revalidatePath("/portal/steps");
    revalidatePath(`/portal/steps/${targetStepId}`);

    const validNextSlug = pages.find((p) => p.slug === nextTarget)?.slug ?? pages[pages.length - 1].slug ?? pages[0].slug;
    const cacheBust = Date.now();
    const destination =
      nextPage === null || !nextTarget
        ? `/portal/steps/${targetStepId}?r=${cacheBust}`
        : `/portal/steps/${targetStepId}/flow/${validNextSlug}?r=${cacheBust}`;
    redirect(destination);
  }

  return (
    <PortalShell
      eyebrow="Your Steps"
      title={formatStepTitle(stepId)}
      description="Work through each action with clear instructions and links."
    >
      <StepFlowLayout
        stepTitle={formatStepTitle(stepId)}
        pageTitle={page.title}
        pageDescription={page.description}
        body={page.body}
        currentIndex={currentIndex}
        totalPages={pages.length}
        action={advanceStep}
        hiddenFields={{
          matterId: matter.id,
          stepId,
          currentIndex: currentIndex.toString(),
          totalPages: pages.length.toString(),
          nextSlug,
          status: statusForSubmit,
          currentSlug: normalizedSlug,
        }}
        ctaLabel={page.ctaLabel}
        secondaryHref={previousPage ? `/portal/steps/${stepId}/flow/${previousPage.slug}` : `/portal/steps/${stepId}`}
        secondaryLabel={previousPage ? "Back" : "Back to overview"}
      />
    </PortalShell>
  );
}

function resolveSlug(requested: string | undefined, fallback: string): string {
  if (!requested) return fallback;
  return requested;
}

function resolveResumeIndex(totalPages: number, pageIndex: number, status: string | null): number {
  if (totalPages === 0) return 0;
  const maxIndex = totalPages - 1;
  const normalizedStatus = canonicalizeJourneyStatus(status ?? null);
  const safeIndex = Number.isFinite(pageIndex) ? Math.max(0, Math.min(pageIndex, maxIndex)) : 0;
  if (normalizedStatus === "done") {
    return maxIndex;
  }
  return safeIndex;
}

async function persistCurrentPage({
  matterId,
  stepId,
  pageIndex,
  existing,
  journeyState,
}: {
  matterId: string;
  stepId: JourneyStepId;
  pageIndex: number;
  existing?: { status: string; pageIndex: number };
  journeyState: JourneyState;
}) {
  const normalizedStatus = normalizeProgressStatus(existing?.status);
  const nextStatus: JourneyStatus = normalizedStatus === "not_started" ? "in_progress" : normalizedStatus;
  const statusChanged = normalizedStatus !== nextStatus;
  const indexChanged = !existing || existing.pageIndex !== pageIndex;
  if (!statusChanged && !indexChanged) {
    return;
  }
  const operations: Prisma.PrismaPromise<unknown>[] = [
    prisma.matterStepProgress.upsert({
      where: { matterId_stepKey: { matterId, stepKey: stepId } },
      create: { matterId, stepKey: stepId, status: nextStatus, pageIndex },
      update: { status: nextStatus, pageIndex },
    }),
  ];
  console.log("[portal] persistCurrentPage", {
    matterId,
    stepId,
    pageIndex,
    status: nextStatus,
    statusChanged,
    indexChanged,
  });
  if (statusChanged) {
    const nextJourneyState = setJourneyStateValue(journeyState, stepId, nextStatus);
    operations.push(
      prisma.matter.update({
        where: { id: matterId },
        data: { journeyStatus: nextJourneyState },
      }),
    );
  }
  try {
    await prisma.$transaction(operations);
    console.log("[portal] persistCurrentPage success", { matterId, stepId });
  } catch (error) {
    console.warn("[portal] Failed to persist current step page", { matterId, stepId, error });
  }
}

function normalizeProgressStatus(value?: string | null): JourneyStatus {
  return canonicalizeJourneyStatus(value ?? null);
}

function buildMetadata(stepId: JourneyStepId, slug: string, formData: FormData): Prisma.InputJsonValue | null {
  if (stepId === "will-search" && slug === "tracking") {
    const mailedDate = String(formData.get("mailedDate") ?? "").trim();
    const trackingNumber = String(formData.get("trackingNumber") ?? "").trim();
    if (!mailedDate && !trackingNumber) return null;
    return { mailedDate: mailedDate || null, trackingNumber: trackingNumber || null };
  }
  if (stepId === "assets-debts" && slug === "record-delivery") {
    const deliveryDate = String(formData.get("deliveryDate") ?? "").trim();
    const tracking = String(formData.get("deliveryTracking") ?? "").trim();
    if (!deliveryDate && !tracking) return null;
    return { deliveryDate: deliveryDate || null, deliveryTracking: tracking || null };
  }
  if (stepId === "sign-notarize" && slug === "post-signing") {
    const notes = String(formData.get("signingNotes") ?? "").trim();
    if (!notes) return null;
    return { signingNotes: notes };
  }
  if (stepId === "file-court") {
    if (slug === "deliver") {
      const method = String(formData.get("deliveryMethod") ?? "").trim();
      const tracking = String(formData.get("filingTracking") ?? "").trim();
      if (!method && !tracking) return null;
      return { deliveryMethod: method || null, filingTracking: tracking || null };
    }
    if (slug === "record-filing") {
      const filingDate = String(formData.get("filingDate") ?? "").trim();
      const registryLocation = String(formData.get("registryLocation") ?? "").trim();
      const grantNumber = String(formData.get("grantNumber") ?? "").trim();
      if (!filingDate && !registryLocation && !grantNumber) return null;
      return { filingDate: filingDate || null, registryLocation: registryLocation || null, grantNumber: grantNumber || null };
    }
  }
  return null;
}

function formatStepTitle(stepId: JourneyStepId) {
  return stepId.split("-").map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1)).join(" ");
}

function renderPlaceholder(stepId: JourneyStepId) {
  return (
    <PortalShell
      eyebrow="Your Steps"
      title="Guided flow coming soon"
      description="We’re rolling out interactive walkthroughs step-by-step. Use the overview while we finish this experience."
    >
      <div className="portal-card space-y-4 rounded-[32px] border border-[color:var(--border-muted)] p-6 text-sm text-[color:var(--ink-muted)]">
        <p>The guided walkthrough for this step isn’t live yet. Head back to the overview for detailed instructions.</p>
        <div className="flex flex-wrap gap-3">
          <Button asChild>
            <Link href={`/portal/steps/${stepId}`}>View overview</Link>
          </Button>
          <Button asChild variant="secondary">
            <Link href="/portal/steps">Back to Your Steps</Link>
          </Button>
        </div>
      </div>
    </PortalShell>
  );
}
