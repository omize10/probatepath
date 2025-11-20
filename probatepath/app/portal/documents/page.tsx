import { Button } from "@/components/ui/button";
import { PortalShell } from "@/components/portal/PortalShell";
import { requirePortalAuth } from "@/lib/auth";
import { resolvePortalMatter } from "@/lib/portal/server";

const documentTemplates = [
  { id: "p3", title: "P3 – Applicant’s affidavit", description: "Applicant affidavit form", route: "p3" },
  { id: "p4", title: "P4 – Inventory", description: "Estate inventory statement", route: "p4" },
  { id: "p10", title: "P10 – Executor’s oath", description: "Executor oath/declaration", route: "p10" },
  { id: "p11", title: "P11 – Consent to notice", description: "Notice of intention / consent", route: "p11" },
  { id: "p17", title: "P17 – Affidavit of service", description: "Proof of service for notices", route: "p17" },
  { id: "p20", title: "P20 – Affidavit of notice", description: "Final notice affidavit", route: "p20" },
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
      description="Preview, download, or package the real probate documents generated from your saved matter data."
    >
      <section className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-[color:var(--ink-muted)]">Will search & notices</p>
            <h2 className="mt-2 font-serif text-2xl text-[color:var(--ink)]">Primary documents</h2>
            <p className="text-sm text-[color:var(--ink-muted)]">
              Each PDF regenerates from the matter information we store for you. Preview before downloading to confirm every detail.
            </p>
          </div>
          {matterId ? (
            <Button size="sm" variant="secondary" asChild>
              <a href={`/api/matter/${matterId}/package/phase1/pdf`} target="_blank" rel="noreferrer">
                Download full package (Phase 1)
              </a>
            </Button>
          ) : (
            <p className="text-xs text-[color:var(--ink-muted)]">Finish the intake to assign a matter ID before generating documents.</p>
          )}
        </div>
        {matterId ? (
          <div className="grid gap-4 md:grid-cols-2">
            {willSearchRecord ? (
              <div className="portal-card space-y-3 p-6" key="will-search">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-[color:var(--ink-muted)]">WILL SEARCH</p>
                  <h3 className="text-lg font-semibold text-[color:var(--ink)]">Will Search Request (VSA 532)</h3>
                  <p className="text-sm text-[color:var(--ink-muted)]">We&apos;ve pre-filled your BC will-search form.</p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Button size="sm" variant="ghost" asChild>
                    <a href={`/api/will-search/${matterId}/pdf`} target="_blank" rel="noreferrer">
                      Preview
                    </a>
                  </Button>
                  <Button size="sm" variant="secondary" asChild>
                    <a href={`/api/will-search/${matterId}/pdf?download=1`} target="_blank" rel="noreferrer">
                      Download
                    </a>
                  </Button>
                </div>
              </div>
            ) : null}
            <div className="portal-card space-y-3 p-6" key="p1">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-[color:var(--ink-muted)]">NOTICE</p>
                <h3 className="text-lg font-semibold text-[color:var(--ink)]">Notice of proposed application (Form P1)</h3>
                <p className="text-sm text-[color:var(--ink-muted)]">Draft notice to the court and interested parties for this estate.</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button size="sm" variant="ghost" asChild>
                  <a href={`/api/forms/p1/${matterId}/pdf`} target="_blank" rel="noreferrer">
                    Preview
                  </a>
                </Button>
                <Button size="sm" variant="secondary" asChild>
                  <a href={`/api/forms/p1/${matterId}/pdf?download=1`} target="_blank" rel="noreferrer">
                    Download
                  </a>
                </Button>
              </div>
            </div>
            {documentTemplates.map((template) => (
              <div key={template.id} className="portal-card space-y-3 p-6">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-[color:var(--ink-muted)]">
                    {template.id.toUpperCase()}
                  </p>
                  <h3 className="text-lg font-semibold text-[color:var(--ink)]">{template.title}</h3>
                  <p className="text-sm text-[color:var(--ink-muted)]">{template.description}</p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Button size="sm" variant="ghost" asChild>
                    <a href={`/api/forms/${template.route}/${matterId}/pdf`} target="_blank" rel="noreferrer">
                      Preview
                    </a>
                  </Button>
                  <Button size="sm" variant="secondary" asChild>
                    <a
                      href={`/api/forms/${template.route}/${matterId}/pdf?download=1`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Download
                    </a>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-[color:var(--border-muted)] p-6 text-sm text-[color:var(--ink-muted)]">
            <p className="mb-3">Complete the intake to create a matter and unlock document generation.</p>
            <Button asChild size="sm" variant="secondary">
              <a href="/start/step-1">Open intake wizard</a>
            </Button>
          </div>
        )}
      </section>

      <section className="mt-10 space-y-6">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-[color:var(--ink-muted)]">Supplemental schedules</p>
          <h2 className="mt-2 font-serif text-2xl text-[color:var(--ink)]">Automatic supplements</h2>
        </div>
        {matterId ? (
          matter?.schedules && matter.schedules.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {matter.schedules.map((schedule) => (
                <div key={schedule.id} className="portal-card space-y-3 p-5">
                  <div>
                    <p className="text-[0.6rem] uppercase tracking-[0.4em] text-[color:var(--ink-muted)]">
                      {schedule.kind.replace(/_/g, " ").toLowerCase()}
                    </p>
                    <h3 className="text-lg font-semibold text-[color:var(--ink)]">{schedule.title}</h3>
                  </div>
                  <p className="text-sm text-[color:var(--ink-muted)]">{schedule.description ?? "Supplemental notes"}</p>
                  <div className="flex flex-wrap gap-3">
                    <Button size="sm" variant="ghost" asChild>
                      <a href={`/api/matter/${matterId}/schedules/${schedule.id}/pdf`} target="_blank" rel="noreferrer">
                        Preview
                      </a>
                    </Button>
                    <Button size="sm" variant="secondary" asChild>
                      <a
                        href={`/api/matter/${matterId}/schedules/${schedule.id}/pdf?download=1`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Download
                      </a>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-[color:var(--ink-muted)]">No supplemental schedules have been generated for this matter yet.</p>
          )
        ) : (
          <div className="rounded-2xl border border-dashed border-[color:var(--border-muted)] p-5 text-sm text-[color:var(--ink-muted)]">
            <p className="mb-3">Finish the intake so supplemental schedules can be created automatically.</p>
            <Button asChild size="sm" variant="secondary">
              <a href="/start/step-1">Open intake wizard</a>
            </Button>
          </div>
        )}
      </section>

      <section className="mt-10 space-y-3">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-[color:var(--ink-muted)]">Other documents</p>
          <h2 className="font-serif text-2xl text-[color:var(--ink)]">Coming soon</h2>
          <p className="text-sm text-[color:var(--ink-muted)]">Cover letters, registry checklists, and other helpers will surface here shortly.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {["Cover letter", "Registry checklist"].map((item) => (
            <div key={item} className="portal-card space-y-3 p-5 opacity-60">
              <h3 className="text-lg font-semibold text-[color:var(--ink)]">{item}</h3>
              <p className="text-sm text-[color:var(--ink-muted)]">Coming soon</p>
            </div>
          ))}
        </div>
      </section>
    </PortalShell>
  );
}
