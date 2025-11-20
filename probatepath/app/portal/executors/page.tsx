import Link from "next/link";
import { PortalShell } from "@/components/portal/PortalShell";
import { ExecutorsEditor } from "@/components/portal/ExecutorsEditor";
import { requirePortalAuth } from "@/lib/auth";
import { resolvePortalMatter } from "@/lib/portal/server";
import { Button } from "@/components/ui/button";

export default async function ExecutorsPage() {
  const session = await requirePortalAuth("/portal/executors");
  const userId = (session.user as { id?: string })?.id ?? null;
  const matter = await resolvePortalMatter(userId);
  const matterId = matter?.id;

  return (
    <PortalShell
      title="Executors"
      description="List each executor so we can keep the application accurate and trigger supplemental schedules when needed."
    >
      {matterId ? (
        <ExecutorsEditor matterId={matterId} initialExecutors={matter.executors} />
      ) : (
        <div className="portal-card space-y-3 rounded-3xl border border-[color:var(--border-muted)] bg-white p-8 text-sm text-[color:var(--ink-muted)]">
          <p>Create your matter via the intake wizard before editing executors.</p>
          <Button asChild variant="secondary">
            <Link href="/portal/intake">Open intake wizard</Link>
          </Button>
        </div>
      )}
    </PortalShell>
  );
}
