import Link from "next/link";
import { redirect } from "next/navigation";
import { PortalShell } from "@/components/portal/PortalShell";
import { Button } from "@/components/ui/button";
import { requirePortalAuth } from "@/lib/auth";
import { resolvePortalMatter } from "@/lib/portal/server";
import { canonicalizeJourneyStatus, journeySteps, type JourneyStepId } from "@/lib/portal/journey";
import { getStepFlow } from "@/lib/portal/step-flows";
import { formatIntakeDraftRecord } from "@/lib/intake/format";

interface StepFlowPageProps {
  params: Promise<{ stepId: string }>;
}

export default async function StepFlowPlaceholderPage({ params }: StepFlowPageProps) {
  const resolvedParams = await params;
  const session = await requirePortalAuth("/portal");
  const userId = (session.user as { id?: string })?.id ?? null;
  const matter = await resolvePortalMatter(userId);
  if (!matter) {
    redirect("/portal");
  }

  const stepId = resolvedParams.stepId as JourneyStepId;
  const step = journeySteps.find((entry) => entry.id === stepId);
  if (!step) {
    redirect("/portal/steps");
  }

  const draft = matter.draft ? formatIntakeDraftRecord(matter.draft) : null;
  const flow = getStepFlow(step.id, { matter, draft });
  if (flow && flow.pages.length > 0) {
    const progressRow = matter.stepProgress?.find((row) => row.stepKey === step.id);
    const resumeIndex = resolveResumeIndex(flow.pages.length, progressRow?.pageIndex ?? 0, progressRow?.status ?? null);
    const targetSlug = flow.pages[resumeIndex]?.slug ?? flow.pages[0].slug;
    redirect(`/portal/steps/${step.id}/flow/${targetSlug}`);
  }

  return (
    <PortalShell
      eyebrow="Your Steps"
      title={step.title}
      description="We’re building a guided version of this step. You can still work from the overview below."
    >
      <div className="portal-card space-y-4 rounded-[32px] border border-[color:var(--border-muted)] p-6 text-sm text-[color:var(--ink-muted)]">
        <p>
          The interactive walkthrough for <strong>{step.title}</strong> is on the way. In the meantime, follow the instructions on the overview page to
          keep moving forward.
        </p>
        <div className="flex flex-wrap gap-3">
          <Button asChild>
            <Link href={`/portal/steps/${step.id}`}>View overview</Link>
          </Button>
          <Button asChild variant="secondary">
            <Link href="/portal/steps">Back to steps</Link>
          </Button>
        </div>
      </div>
    </PortalShell>
  );
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
