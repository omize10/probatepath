import { redirect } from "next/navigation";
import { NotAFitFlow } from "@/components/intake/not-a-fit-flow";
import { requirePortalAuth } from "@/lib/auth";
import { getMatterForUser } from "@/lib/matter/server";

interface MatterNotAFitPageProps {
  params: Promise<{ matterId: string }>;
}

export default async function MatterNotAFitPage({ params }: MatterNotAFitPageProps) {
  const resolvedParams = await params;
  const session = await requirePortalAuth(`/matters/${resolvedParams.matterId}/not-a-fit`);
  const userId = (session.user as { id?: string })?.id ?? null;
  if (!userId) {
    redirect("/portal");
  }

  const matter = await getMatterForUser(resolvedParams.matterId, userId);
  if (!matter) {
    redirect("/portal");
  }

  if (matter.rightFitStatus !== "NOT_FIT") {
    if (matter.draft && !(matter.draft.submittedAt ?? false)) {
      redirect(`/matters/${matter.id}/intake`);
    }
    redirect("/portal");
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[color:var(--ink-muted)]">Partner referral</p>
        <h1 className="font-serif text-4xl text-[color:var(--brand)]">Thanks for your answers—we’ll take it from here.</h1>
        <p className="max-w-3xl text-base text-[color:var(--ink-muted)]">
          This estate will be better served by a full-service law firm. We’re matching you with Open Door Law Corporation so you have a direct contact without repeating intake.
        </p>
      </div>
      <NotAFitFlow />
    </div>
  );
}
