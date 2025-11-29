import { Button } from "@/components/ui/button";
import { PortalShell } from "@/components/portal/PortalShell";
import { requirePortalAuth } from "@/lib/auth";
import { resolvePortalMatter } from "@/lib/portal/server";
import { getFormPdfUrl, getPhase1PacketUrl, getSchedulePdfUrl, getWillSearchPdfUrl } from "@/lib/portal/downloads";

const formTemplates = [
  { id: "p3", title: "P3 – Affidavit of applicant", description: "Sworn statement for the executor/applicant", route: "p3" },
  { id: "p4", title: "P4 – Inventory and valuation", description: "Assets & liabilities summary", route: "p4" },
  { id: "p9", title: "P9 – Affidavit of delivery", description: "Proves notices were delivered", route: "p9" },
  { id: "p10", title: "P10 – Assets and liabilities", description: "Detailed balance sheet", route: "p10" },
  { id: "p11", title: "P11 – Consent / nomination", description: "Used when a beneficiary consents to the filing", route: "p11" },
  { id: "p17", title: "P17 – Proof of service", description: "Alternate service affidavit", route: "p17" },
  { id: "p20", title: "P20 – Affidavit of notice", description: "Summarizes who received the P1 notice", route: "p20" },
];

export default async function DocumentsPage() {
  const session = await requirePortalAuth("/portal/documents");
  const userId = (session.user as { id?: string })?.id ?? null;
  const matter = await resolvePortalMatter(userId);
  const matterId = matter?.id;
  const willSearchRecord = matter?.willSearch?.[0] ?? null;

  return (
    <PortalShell
      title="Documents"
      description="Every form is generated from your intake data. Preview before printing, and re-download anytime."
    >
      <section id="will-search" className="space-y-4">
        <header className="space-y-1">
          <p className="text-xs uppercase tracking-[0.3em] text-[color:var(--ink-muted)]">Will search</p>
          <h2 className="font-serif text-2xl text-[color:var(--ink)]">Will Registry (VSA 532)</h2>
          <p className="text-sm text-[color:var(--ink-muted)]">Download the pre-filled request that you mail to Vital Statistics.</p>
        </header>
        {matterId ? (
          <div className="portal-card space-y-3 p-6">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-[color:var(--ink-muted)]">Vital Statistics</p>
              <h3 className="text-lg font-semibold text-[color:var(--ink)]">Will search packet</h3>
              <p className="text-sm text-[color:var(--ink-muted)]">Use this in the “Will search” step of your guided flow.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button size="sm" variant="ghost" asChild>
                <a href={getWillSearchPdfUrl(matterId)} target="_blank" rel="noopener noreferrer">
                  Preview
                </a>
              </Button>
              <Button size="sm" asChild>
                <a href={getWillSearchPdfUrl(matterId, { download: true })} target="_blank" rel="noopener noreferrer">
                  Download
                </a>
              </Button>
            </div>
            {willSearchRecord ? (
              <p className="text-xs text-[color:var(--ink-muted)]">
                Last prepared on {new Intl.DateTimeFormat("en-CA", { dateStyle: "medium" }).format(new Date(willSearchRecord.updatedAt ?? willSearchRecord.createdAt))}
              </p>
            ) : null}
          </div>
        ) : (
          <p className="text-sm text-[color:var(--ink-muted)]">Finish the intake to generate your will search packet.</p>
        )}
      </section>

      <section id="notices" className="space-y-4">
        <header className="space-y-1">
          <p className="text-xs uppercase tracking-[0.3em] text-[color:var(--ink-muted)]">Notices</p>
          <h2 className="font-serif text-2xl text-[color:var(--ink)]">Notice of proposed application (P1)</h2>
          <p className="text-sm text-[color:var(--ink-muted)]">Serve this on beneficiaries before filing. We regenerate it whenever your data changes.</p>
        </header>
        {matterId ? (
          <div className="portal-card space-y-3 p-6">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-[color:var(--ink-muted)]">Notice to recipients</p>
              <h3 className="text-lg font-semibold text-[color:var(--ink)]">Form P1</h3>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button size="sm" variant="ghost" asChild>
                <a href={getFormPdfUrl("p1", matterId)} target="_blank" rel="noopener noreferrer">
                  Preview
                </a>
              </Button>
              <Button size="sm" asChild>
                <a href={getFormPdfUrl("p1", matterId, { download: true })} target="_blank" rel="noopener noreferrer">
                  Download
                </a>
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-[color:var(--ink-muted)]">Complete the intake to unlock the notice forms.</p>
        )}
      </section>

      <section id="forms" className="space-y-4">
        <header className="space-y-1">
          <p className="text-xs uppercase tracking-[0.3em] text-[color:var(--ink-muted)]">Affidavits & schedules</p>
          <h2 className="font-serif text-2xl text-[color:var(--ink)]">Core BC probate forms</h2>
          <p className="text-sm text-[color:var(--ink-muted)]">Download each form individually. These are referenced throughout the “Review forms” and “Sign & notarize” steps.</p>
        </header>
        {matterId ? (
          <div className="grid gap-4 md:grid-cols-2">
            {formTemplates.map((template) => (
              <div key={template.id} className="portal-card space-y-3 p-6">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-[color:var(--ink-muted)]">{template.title}</p>
                  <p className="text-sm text-[color:var(--ink-muted)]">{template.description}</p>
                </div>
                <div className="flex flex-wrap gap-3">
              <Button size="sm" variant="ghost" asChild>
                <a href={getFormPdfUrl(template.route, matterId)} target="_blank" rel="noopener noreferrer">
                  Preview
                </a>
              </Button>
              <Button size="sm" asChild>
                <a href={getFormPdfUrl(template.route, matterId, { download: true })} target="_blank" rel="noopener noreferrer">
                  Download
                </a>
              </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-[color:var(--ink-muted)]">Finish the intake to enable these forms.</p>
        )}
      </section>

      <section id="packets" className="space-y-4">
        <header className="space-y-1">
          <p className="text-xs uppercase tracking-[0.3em] text-[color:var(--ink-muted)]">Packets & schedules</p>
          <h2 className="font-serif text-2xl text-[color:var(--ink)]">Combined downloads</h2>
          <p className="text-sm text-[color:var(--ink-muted)]">Use these when guided steps ask for a “packet” download.</p>
        </header>
        {matterId ? (
          <div className="space-y-4">
            <div className="portal-card space-y-3 p-6">
              <div>
                <h3 className="text-lg font-semibold text-[color:var(--ink)]">Phase 1 packet</h3>
                <p className="text-sm text-[color:var(--ink-muted)]">All core forms bundled for review and signing.</p>
              </div>
              <Button size="sm" asChild>
                <a href={getPhase1PacketUrl(matterId)} target="_blank" rel="noopener noreferrer">
                  Download packet
                </a>
              </Button>
            </div>
            {matter?.schedules?.length ? (
              <div className="grid gap-4 md:grid-cols-2">
                {matter.schedules.map((schedule) => (
                  <div key={schedule.id} className="portal-card space-y-3 p-5">
                    <div>
                      <p className="text-[0.6rem] uppercase tracking-[0.4em] text-[color:var(--ink-muted)]">{schedule.kind.replace(/_/g, " ")}</p>
                      <h3 className="text-lg font-semibold text-[color:var(--ink)]">{schedule.title}</h3>
                    </div>
                    <p className="text-sm text-[color:var(--ink-muted)]">{schedule.description ?? "Supplemental schedule"}</p>
                    <div className="flex flex-wrap gap-3">
                      <Button size="sm" variant="ghost" asChild>
                        <a href={getSchedulePdfUrl(matterId, schedule.id)} target="_blank" rel="noopener noreferrer">
                          Preview
                        </a>
                      </Button>
                      <Button size="sm" asChild>
                        <a href={getSchedulePdfUrl(matterId, schedule.id, { download: true })} target="_blank" rel="noopener noreferrer">
                          Download
                        </a>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-[color:var(--ink-muted)]">No supplemental schedules have been generated yet.</p>
            )}
          </div>
        ) : (
          <p className="text-sm text-[color:var(--ink-muted)]">Complete intake to unlock the combined packets.</p>
        )}
      </section>
    </PortalShell>
  );
}
