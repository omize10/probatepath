import Link from "next/link";
import { PortalShell } from "@/components/portal/PortalShell";
import { WillSearchForm } from "@/components/portal/WillSearchForm";
import { requirePortalAuth } from "@/lib/auth";
import { resolvePortalMatter } from "@/lib/portal/server";
import { Button } from "@/components/ui/button";

export default async function PortalWillSearchPage() {
  const session = await requirePortalAuth("/portal/will-search");
  const userId = (session.user as { id?: string })?.id ?? null;
  const matter = await resolvePortalMatter(userId);
  const matterId = matter?.id;
  const initialRequest = matter?.willSearch?.[0] ?? null;

  return (
    <PortalShell
      title="Will search & notices"
      description="Enter the executor + deceased details so we can build your VSA 532 request and notice letters."
    >
      {matterId ? (
        <WillSearchForm matterId={matterId} initial={initialRequest} />
      ) : (
        <div className="portal-card space-y-3 rounded-3xl border border-[color:var(--border-muted)] bg-white p-8 text-sm text-[color:var(--ink-muted)]">
          <p>You don&apos;t have a matter yet. Start the intake wizard to create one, then return here to complete the VSA 532 form.</p>
          <Button asChild variant="secondary">
            <Link href="/portal/intake">Open intake wizard</Link>
          </Button>
        </div>
      )}
    </PortalShell>
  );
}
