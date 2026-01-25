import Link from "next/link";
import { redirect } from "next/navigation";
import { addDays, differenceInCalendarDays, format } from "date-fns";
import { requirePortalAuth } from "@/lib/auth";
import { resolvePortalMatter } from "@/lib/portal/server";
import { portalStatusLabels, hasReachedStatus } from "@/lib/portal/status";
import { markNoticesMailed } from "@/lib/cases";
import { PortalShell } from "@/components/portal/PortalShell";
import { P1NoticesWizard } from "@/components/portal/P1NoticesWizard";

function formatDate(value?: Date | null) {
  return value ? format(value, "MMM d, yyyy") : "date not recorded";
}

export async function markNoticesSentAction(formData: FormData) {
  "use server";
  const session = await requirePortalAuth("/portal/p1-notices");
  const userId = (session.user as { id?: string })?.id ?? null;
  const caseId = formData.get("caseId")?.toString();
  if (!userId || !caseId) {
    redirect("/portal");
  }
  const { prisma } = await import("@/lib/prisma");
  const owned = await prisma.matter.findFirst({ where: { id: caseId, userId } });
  if (!owned) redirect("/portal");

  const mailedAt = new Date();
  await markNoticesMailed({ caseId, mailedAt, portalStatus: "notices_waiting_21_days" });
  redirect("/portal/p1-notices");
}

export default async function P1NoticesPage() {
  const session = await requirePortalAuth("/portal/p1-notices");
  const userId = (session.user as { id?: string })?.id ?? null;
  const matter = await resolvePortalMatter(userId);
  if (!matter) redirect("/portal");

  const willSearchSent = matter.willSearchMailedAt ?? matter.p1MailedAt ?? null;
  const packetUrl = matter.p1PacketPdfUrl ?? null;
  const noticeUrl = matter.p1NoticePdfUrl ?? packetUrl ?? null;
  const mailedAt = matter.noticesMailedAt ?? null;
  const daysSince = mailedAt ? differenceInCalendarDays(new Date(), mailedAt) : null;
  const daysRemaining = daysSince !== null ? Math.max(0, 21 - daysSince) : null;
  const waitUntil = mailedAt ? addDays(mailedAt, 21) : null;
  const statusLabel =
    mailedAt && daysRemaining !== null && daysRemaining <= 0
      ? "Waiting period complete"
      : portalStatusLabels[matter.portalStatus] ?? matter.portalStatus;
  const nextUnlock =
    mailedAt && daysRemaining !== null && daysRemaining <= 0
      ? "Prepare probate filing"
      : mailedAt
        ? "Wait 21 days after notices"
        : "Send P1 notices";
  // For administration (intestate) cases, use intestateHeirs; for probate, use beneficiaries
  const recipientCount =
    matter.pathType === "administration"
      ? matter.intestateHeirs?.length ?? null
      : matter.beneficiaries?.length ?? null;
  const percent =
    mailedAt && daysRemaining !== null ? Math.min(100, Math.max(0, Math.round(((21 - daysRemaining) / 21) * 100))) : 0;

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

      <div className="mt-8 space-y-3">
        {mailedAt ? (
          <div className="space-y-4 rounded-2xl bg-white px-6 py-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">Notices sent</h2>
            <p className="text-sm text-gray-700">You told us you sent your P1 notices on {formatDate(mailedAt)}.</p>
            {daysRemaining !== null ? (
              daysRemaining > 0 ? (
                <div className="space-y-2 text-sm text-gray-700">
                  <p>
                    21-day countdown started. You have {daysRemaining} day(s) left. Earliest filing: {waitUntil ? formatDate(waitUntil) : "after wait"}.
                  </p>
                  <div className="h-3 w-full overflow-hidden rounded-full bg-gray-100">
                    <div
                      className="h-3 bg-gray-900 transition-all"
                      style={{ width: `${percent}%` }}
                      aria-label={`Progress ${percent}%`}
                    />
                  </div>
                  <p className="text-xs text-gray-600">We’ll keep your waiting period here. Check back anytime.</p>
                </div>
              ) : (
                <p className="text-sm text-gray-700">
                  Your 21-day waiting period is complete. You’re ready for your probate filing step (coming soon in the portal).
                </p>
              )
            ) : null}
            <div className="flex flex-wrap gap-3">
              <Link
                href="/portal"
                className="inline-flex items-center rounded-full bg-gray-900 px-5 py-2 text-sm font-semibold text-white transition hover:bg-black"
              >
                Back to portal
              </Link>
              {daysRemaining !== null && daysRemaining <= 0 ? (
                <button
                  disabled
                  className="inline-flex items-center rounded-full border border-gray-300 px-5 py-2 text-sm font-semibold text-gray-500"
                >
                  Probate filing step coming soon
                </button>
              ) : null}
            </div>
          </div>
        ) : (
          <P1NoticesWizard
            caseId={matter.id}
            pdfUrl={noticeUrl}
            packetUrl={packetUrl}
            recipientCount={recipientCount}
            showWillSearchWarning={!willSearchSent}
            pathType={matter.pathType ?? "probate"}
            onSubmitAction={markNoticesSentAction}
          />
        )}
      </div>
    </PortalShell>
  );
}
