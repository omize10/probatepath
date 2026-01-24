import { redirect } from "next/navigation";
import { requirePortalAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { RequisitionManager } from "@/components/portal/post-grant/RequisitionManager";

export default async function RequisitionsPage() {
  const session = await requirePortalAuth("/portal");
  const userId = (session.user as { id?: string })?.id;
  if (!userId) redirect("/portal");

  const matter = await prisma.matter.findFirst({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: { requisitions: { orderBy: { receivedAt: "desc" } } },
  });

  if (!matter) redirect("/portal");

  const serialized = {
    matterId: matter.id,
    requisitions: matter.requisitions.map((r) => ({
      id: r.id,
      status: r.status,
      description: r.description,
      courtNotes: r.courtNotes,
      responseNotes: r.responseNotes,
      fileUrl: r.fileUrl,
      responseFileUrl: r.responseFileUrl,
      receivedAt: r.receivedAt.toISOString(),
      dueAt: r.dueAt?.toISOString() ?? null,
      resolvedAt: r.resolvedAt?.toISOString() ?? null,
    })),
  };

  return <RequisitionManager data={serialized} />;
}
