import Link from "next/link";
import { PortalShell } from "@/components/portal/PortalShell";
import { BeneficiariesEditor } from "@/components/portal/BeneficiariesEditor";
import { requirePortalAuth } from "@/lib/auth";
import { resolvePortalMatter } from "@/lib/portal/server";
import { Button } from "@/components/ui/button";

export default async function BeneficiariesPage() {
  const session = await requirePortalAuth("/portal/beneficiaries");
  const userId = (session.user as { id?: string })?.id ?? null;
  const matter = await resolvePortalMatter(userId);
  const matterId = matter?.id;

  return (
    <PortalShell
      title="Beneficiaries"
      description="Capture every beneficiary, including minors and deceased relatives so our schedules stay complete."
    >
      {matterId ? (
        <BeneficiariesEditor matterId={matterId} initialBeneficiaries={matter.beneficiaries} />
      ) : (
        <div className="portal-card space-y-3 rounded-3xl border border-[color:var(--border-muted)] bg-white p-8 text-sm text-[color:var(--ink-muted)]">
          <p>Create your matter via the intake wizard before adding beneficiaries.</p>
          <Button asChild variant="secondary">
            <Link href="/portal/intake">Open intake wizard</Link>
          </Button>
        </div>
      )}
    </PortalShell>
  );
}
