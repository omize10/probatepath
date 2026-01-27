import Link from "next/link";
import { redirect } from "next/navigation";
import { addDays, format } from "date-fns";
import { requirePortalAuth } from "@/lib/auth";
import { resolvePortalMatter } from "@/lib/portal/server";
import { portalStatusLabels, hasReachedStatus } from "@/lib/portal/status";
import { markWillSearchMailed } from "@/lib/cases";
import { PortalShell } from "@/components/portal/PortalShell";
import { WillSearchWizard } from "@/components/portal/WillSearchWizard";
import { WillSearchCertificateUpload } from "@/components/portal/WillSearchCertificateUpload";

function formatDate(value?: Date | null) {
  return value ? format(value, "MMM d, yyyy") : "date not recorded";
}

export async function markWillSearchSentAction(formData: FormData) {
  "use server";
  const session = await requirePortalAuth("/portal/will-search");
  const userId = (session.user as { id?: string })?.id ?? null;
  const caseId = formData.get("caseId")?.toString();
  if (!userId || !caseId) {
    redirect("/portal");
  }
  const { prisma } = await import("@/lib/prisma");
  const owned = await prisma.matter.findFirst({ where: { id: caseId, userId } });
  if (!owned) redirect("/portal");

  const mailedAt = new Date();
  await markWillSearchMailed({ caseId, mailedAt, portalStatus: "will_search_sent" });
  redirect("/portal/will-search");
}

export default async function WillSearchPage() {
  const session = await requirePortalAuth("/portal/will-search");
  const userId = (session.user as { id?: string })?.id ?? null;
  const matter = await resolvePortalMatter(userId);
  if (!matter) redirect("/portal");

  const statusLabel = portalStatusLabels[matter.portalStatus] ?? matter.portalStatus;
  const ready = hasReachedStatus(matter.portalStatus, "will_search_ready") || matter.willSearchPackageReady || Boolean(matter.willSearchPreparedAt);
  if (!ready) {
    redirect("/portal");
  }

  const mailedAt = matter.willSearchMailedAt ?? matter.p1MailedAt ?? null;
  const waitingUntil = mailedAt ? addDays(mailedAt, 21) : null;
  const nextUnlock = mailedAt ? "Send P1 notices" : "Start will search";
  const willSearchUrl = matter.willSearchPdfUrl ?? null;

  return (
    <PortalShell
      title="We’ll guide you step by step."
      description="Download your documents, follow the checklist, and mark milestones as you go."
      eyebrow="Client portal"
      actions={
        <Link
          href={`/matters/${matter.id}/intake`}
          className="inline-flex items-center rounded-full border border-[color:var(--brand)] px-4 py-2 text-sm font-semibold text-[color:var(--brand)] transition hover:bg-[color:var(--brand)] hover:text-white"
        >
          Edit your answers
        </Link>
      }
    >
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-[color:var(--border-muted)] bg-white p-4 text-sm text-[color:var(--ink)] shadow-sm">
          <p className="text-xs uppercase tracking-[0.3em] text-[color:var(--ink-muted)]">Status</p>
          <p className="pt-1 text-lg font-semibold text-[color:var(--brand-navy)]">{statusLabel}</p>
        </div>
        <div className="rounded-2xl border border-[color:var(--border-muted)] bg-white p-4 text-sm text-[color:var(--ink)] shadow-sm">
          <p className="text-xs uppercase tracking-[0.3em] text-[color:var(--ink-muted)]">Case ID</p>
          <p className="pt-1 font-mono text-sm text-[color:var(--ink-muted)]">{matter.caseCode ?? matter.id}</p>
        </div>
        <div className="rounded-2xl border border-[color:var(--border-muted)] bg-white p-4 text-sm text-[color:var(--ink)] shadow-sm">
          <p className="text-xs uppercase tracking-[0.3em] text-[color:var(--ink-muted)]">Next unlock</p>
          <p className="pt-1 text-[color:var(--ink)]">{nextUnlock}</p>
        </div>
      </div>

      <div className="mt-8">
        {mailedAt ? (
          <div className="space-y-4">
            <div className="space-y-3 rounded-2xl bg-white px-6 py-6 shadow-sm">
              <h2 className="text-lg font-semibold text-[color:var(--ink)]">Will search sent</h2>
              <p className="text-sm text-slate-700">You told us you mailed your will search on {formatDate(mailedAt)}.</p>
              <p className="text-sm text-slate-700">
                Vital Statistics usually takes a few weeks to respond. Keep the result with your probate documents. You can continue with notices next.
              </p>
              <div className="flex flex-wrap gap-3 pt-2">
                <Link
                  href="/portal/p1-notices"
                  className="inline-flex items-center rounded-full bg-gray-900 px-5 py-2 text-sm font-semibold text-white transition hover:bg-black"
                >
                  Continue to P1 notices
                </Link>
                {waitingUntil ? (
                  <p className="text-xs text-slate-700">Earliest next step: {formatDate(waitingUntil)} (21-day wait after notices will start there).</p>
                ) : null}
              </div>
            </div>

            {/* Certificate upload section */}
            <div className="rounded-2xl bg-white px-6 py-6 shadow-sm space-y-3">
              <h3 className="text-lg font-semibold text-[color:var(--ink)]">Will search certificate</h3>
              <p className="text-sm text-slate-700">
                When your certificate arrives from Vital Statistics, upload it here. This certificate is required for your court filing.
              </p>
              <WillSearchCertificateUpload
                matterId={matter.id}
                existingCertificateUrl={matter.willSearchCertificateUrl}
                certificateUploadedAt={matter.willSearchCertificateUploadedAt?.toISOString()}
                certificateVerified={matter.willSearchCertificateVerified}
              />
            </div>
          </div>
        ) : (
          <WillSearchWizard caseId={matter.id} pdfUrl={willSearchUrl} onSubmitAction={markWillSearchSentAction} />
        )}
      </div>
    </PortalShell>
  );
}
