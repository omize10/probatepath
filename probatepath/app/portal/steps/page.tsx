import { PortalShell } from "@/components/portal/PortalShell";
import { JourneyStepsList } from "@/components/portal/JourneyStepsList";
import { requirePortalAuth } from "@/lib/auth";
import { resolvePortalMatter } from "@/lib/portal/server";
import { normalizeJourneyState } from "@/lib/portal/journey";

export default async function PortalStepsPage() {
  const session = await requirePortalAuth("/portal");
  const userId = (session.user as { id?: string })?.id ?? null;
  const matter = await resolvePortalMatter(userId);

  if (!matter) {
    return (
      <PortalShell
        title="Your steps"
        description="Complete the guided intake before working through the probate journey."
        eyebrow="Your Steps"
      >
        <div className="portal-card space-y-3 p-6 text-sm text-[color:var(--ink-muted)]">
          <p>You’ll see your personalized timeline as soon as a matter exists.</p>
        </div>
      </PortalShell>
    );
  }

  return (
    <PortalShell
      title="Your Steps"
      description="Follow each step in order. We’ll track your status and keep every action in context."
      eyebrow="Your Steps"
    >
      <JourneyStepsList journey={normalizeJourneyState(matter.journeyStatus ?? undefined)} />
    </PortalShell>
  );
}
