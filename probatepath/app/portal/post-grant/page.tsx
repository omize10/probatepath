import { redirect } from "next/navigation";
import { requirePortalAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PostGrantDashboard } from "@/components/portal/post-grant/PostGrantDashboard";

export default async function PostGrantPage() {
  const session = await requirePortalAuth("/portal");
  const userId = (session.user as { id?: string })?.id;
  if (!userId) redirect("/portal");

  const matter = await prisma.matter.findFirst({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
      beneficiaries: true,
      postGrantAssets: { orderBy: { createdAt: "asc" } },
      postGrantDebts: { orderBy: { createdAt: "asc" } },
      distributions: { orderBy: { createdAt: "asc" } },
      beneficiaryReleases: { orderBy: { createdAt: "asc" } },
    },
  });

  if (!matter) redirect("/portal");

  const serialized = {
    matterId: matter.id,
    beneficiaries: matter.beneficiaries.map((b) => ({
      id: b.id,
      fullName: b.fullName,
      relationship: b.relationshipLabel ?? b.type,
      shareDescription: b.shareDescription,
    })),
    assets: matter.postGrantAssets.map((a) => ({
      id: a.id,
      name: a.name,
      category: a.category,
      institution: a.institution,
      accountNumber: a.accountNumber,
      estimatedValue: a.estimatedValue?.toString() ?? null,
      actualValue: a.actualValue?.toString() ?? null,
      status: a.status,
      contactedAt: a.contactedAt?.toISOString() ?? null,
      documentsSentAt: a.documentsSentAt?.toISOString() ?? null,
      fundsReceivedAt: a.fundsReceivedAt?.toISOString() ?? null,
      notes: a.notes,
    })),
    debts: matter.postGrantDebts.map((d) => ({
      id: d.id,
      creditor: d.creditor,
      category: d.category,
      amount: d.amount?.toString() ?? null,
      verifiedAmount: d.verifiedAmount?.toString() ?? null,
      status: d.status,
      verifiedAt: d.verifiedAt?.toISOString() ?? null,
      paidAt: d.paidAt?.toISOString() ?? null,
      notes: d.notes,
    })),
    distributions: matter.distributions.map((dist) => ({
      id: dist.id,
      beneficiaryId: dist.beneficiaryId,
      beneficiaryName: dist.beneficiaryName,
      sharePercent: dist.sharePercent?.toString() ?? null,
      shareAmount: dist.shareAmount?.toString() ?? null,
      paidAt: dist.paidAt?.toISOString() ?? null,
      method: dist.method,
      notes: dist.notes,
    })),
    releases: matter.beneficiaryReleases.map((r) => ({
      id: r.id,
      beneficiaryId: r.beneficiaryId,
      beneficiaryName: r.beneficiaryName,
      sentAt: r.sentAt?.toISOString() ?? null,
      signedAt: r.signedAt?.toISOString() ?? null,
      fileUrl: r.fileUrl,
      notes: r.notes,
    })),
  };

  return <PostGrantDashboard data={serialized} />;
}
