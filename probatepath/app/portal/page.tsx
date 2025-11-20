import Link from "next/link";
import { redirect } from "next/navigation";
import { PortalShell } from "@/components/portal/PortalShell";
import { DraftStatusCard } from "@/components/portal/DraftStatusCard";
import { Button } from "@/components/ui/button";
import { requirePortalAuth } from "@/lib/auth";
import { resolvePortalMatter } from "@/lib/portal/server";
import { formatIntakeDraftRecord } from "@/lib/intake/format";
import { calculatePortalProgress } from "@/lib/intake/portal/validation";
import { journeySteps, getNextJourneyStep, normalizeJourneyState, journeyProgressPercent } from "@/lib/portal/journey";

function formatTimestamp(value?: Date | null) {
  if (!value) return null;
  return new Intl.DateTimeFormat("en-CA", { dateStyle: "medium", timeStyle: "short" }).format(value);
}

export default async function PortalDashboardPage() {
  const session = await requirePortalAuth("/portal");
  const userId = (session.user as { id?: string })?.id ?? null;
  const matter = await resolvePortalMatter(userId);

  if (!matter) {
    redirect("/start");
  }

  const draft = matter.draft ?? null;
  const normalizedDraft = draft ? formatIntakeDraftRecord(draft) : null;
  const progress = normalizedDraft ? calculatePortalProgress(normalizedDraft) : 0;
  const status: "draft" | "submitted" = draft?.submittedAt ? "submitted" : "draft";
  const lastSavedText = formatTimestamp(draft?.updatedAt ?? draft?.createdAt ?? null);
  const resumeHref = matter ? `/matters/${matter.id}/intake` : "/portal/intake";
  const journey = normalizeJourneyState(matter.journeyStatus ?? undefined);
  const journeyProgress = journeyProgressPercent(journey);
  const nextJourneyStep = getNextJourneyStep(journey);
  const continueHref = nextJourneyStep ? `/portal/steps/${nextJourneyStep.id}` : "/portal/steps";

  return (
    <PortalShell
      title="Welcome back—let’s finish your probate packet."
      description="Keep everything in one place: intake data, will searches, executors, beneficiaries, schedules, and printable forms."
    >
      <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
        <section className="portal-card space-y-5 rounded-[32px] border border-[color:var(--border-muted)] p-6">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[color:var(--ink-muted)]">
              Court packet progress
            </p>
            <div className="flex items-center gap-3">
              <div className="h-3 flex-1 rounded-full bg-[color:var(--bg-muted)]">
                <div
                  className="h-3 rounded-full bg-[color:var(--brand-navy)] transition-all"
                  style={{ width: `${journeyProgress}%` }}
                />
              </div>
              <span className="text-sm font-semibold text-[color:var(--ink)]">{journeyProgress}%</span>
            </div>
          </div>
          <div className="space-y-1 text-sm text-[color:var(--ink-muted)]">
            <p>
              Next recommended step:{" "}
              <span className="font-semibold text-[color:var(--ink)]">{nextJourneyStep?.title ?? "All steps complete"}</span>
            </p>
            <p>{nextJourneyStep?.subtitle ?? "Every required step is finished. You can still open any step to review details."}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button asChild className="px-6 py-5 text-base">
              <Link href={continueHref}>{nextJourneyStep ? "Start now" : "View Your Steps"}</Link>
            </Button>
            <Button asChild variant="secondary">
              <Link href="/portal/steps">View all steps</Link>
            </Button>
          </div>
          <div className="flex flex-wrap gap-4 text-sm font-semibold text-[color:var(--brand-navy)]">
            <Link href="/portal/documents" className="underline-offset-4 hover:underline">
              Open documents
            </Link>
            <Link href="/portal/help" className="underline-offset-4 hover:underline">
              Get help
            </Link>
          </div>
        </section>
        <DraftStatusCard status={status} progress={progress} lastSavedText={lastSavedText} resumeHref={resumeHref} />
      </div>
    </PortalShell>
  );
}
