import { redirect } from "next/navigation";
import { requirePortalAuth } from "@/lib/auth";
import { resolvePortalMatter } from "@/lib/portal/server";
import { portalStatusLabels } from "@/lib/portal/status";
import type { PortalMatterVM } from "@/components/portal/PortalClient";
import { PortalClient } from "@/components/portal/PortalClient";

export default async function PortalPage() {
  const session = await requirePortalAuth("/portal");
  const userId = (session.user as { id?: string })?.id ?? null;
  const matter = await resolvePortalMatter(userId);

  if (!matter) {
    return (
      <PortalClient
        matter={{
          id: "",
          portalStatus: "intake_complete",
          statusLabel: "Intake not started",
          willSearchPackageReady: false,
          p1NoticesReady: false,
          standardProbatePackageReady: false,
          willSearchPreparedAt: null,
          willSearchMailedAt: null,
          noticesPreparedAt: null,
          noticesMailedAt: null,
          probatePackagePreparedAt: null,
          probateFiledAt: null,
          grantIssuedAt: null,
          willSearchPdfUrl: null,
          p1NoticePdfUrl: null,
          p1PacketPdfUrl: null,
          p1CoverLetterPdfUrl: null,
          probatePackagePdfUrl: null,
          registryName: null,
          registryAddress: null,
          reminders: [],
          beneficiaries: [],
          editHref: "/start",
          daysRemaining: null,
          noticesMailedAtDisplay: null,
          willSearchMailedAtDisplay: null,
        }}
        empty
      />
    );
  }

  // If intake isn’t completed yet, send the user to intake instead of showing a completed portal.
  if (!(matter.draft?.submittedAt ?? false)) {
    redirect(`/matters/${matter.id}/intake`);
  }

  // eslint-disable-next-line react-hooks/purity
  const now = Date.now();
  const daysRemaining =
    matter.noticesMailedAt !== null
      ? Math.max(0, 21 - Math.floor((now - matter.noticesMailedAt.getTime()) / (1000 * 60 * 60 * 24)))
      : null;

  const serialized: PortalMatterVM = {
    id: matter.id,
    caseCode: matter.caseCode ?? null,
    portalStatus: matter.portalStatus,
    statusLabel: portalStatusLabels[matter.portalStatus] ?? matter.portalStatus,
    willSearchPackageReady: matter.willSearchPackageReady,
    p1NoticesReady: matter.p1NoticesReady,
    standardProbatePackageReady: matter.standardProbatePackageReady,
    willSearchPreparedAt: matter.willSearchPreparedAt?.toISOString() ?? null,
    willSearchMailedAt: matter.willSearchMailedAt?.toISOString() ?? null,
    noticesPreparedAt: matter.noticesPreparedAt?.toISOString() ?? null,
    noticesMailedAt: matter.noticesMailedAt?.toISOString() ?? null,
    probatePackagePreparedAt: matter.probatePackagePreparedAt?.toISOString() ?? null,
    probateFiledAt: matter.probateFiledAt?.toISOString() ?? null,
    grantIssuedAt: matter.grantIssuedAt?.toISOString() ?? null,
    willSearchPdfUrl: matter.willSearchPdfUrl ?? null,
    p1NoticePdfUrl: matter.p1NoticePdfUrl ?? null,
    p1PacketPdfUrl: matter.p1PacketPdfUrl ?? null,
    p1CoverLetterPdfUrl: matter.p1CoverLetterPdfUrl ?? null,
    probatePackagePdfUrl: matter.probatePackagePdfUrl ?? null,
    registryName: matter.registryName ?? null,
    registryAddress: matter.registryAddress ?? null,
    reminders: (matter.reminders ?? []).map((r) => ({
      id: r.id,
      type: r.type,
      dueAt: r.dueAt?.toISOString() ?? null,
      sentAt: r.sentAt?.toISOString() ?? null,
    })),
    beneficiaries: (matter.beneficiaries ?? []).map((b) => ({
      id: b.id,
      name: b.fullName ?? b.name ?? "Recipient",
      relationship: b.relationship ?? b.type ?? null,
    })),
    editHref: `/matters/${matter.id}/intake`,
    daysRemaining,
    noticesMailedAtDisplay: matter.noticesMailedAt ? matter.noticesMailedAt.toLocaleDateString() : null,
    willSearchMailedAtDisplay: matter.willSearchMailedAt ? matter.willSearchMailedAt.toLocaleDateString() : null,
  };

  return <PortalClient matter={serialized} />;
}
