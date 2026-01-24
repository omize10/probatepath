import { redirect } from "next/navigation";
import { requirePortalAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { MailingTracker } from "@/components/portal/mailings/MailingTracker";

export default async function P1TrackerPage() {
  const session = await requirePortalAuth("/portal");
  const userId = (session.user as { id?: string })?.id;
  if (!userId) redirect("/portal");

  const matter = await prisma.matter.findFirst({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
      beneficiaries: true,
      beneficiaryMailings: { include: { proofs: true }, orderBy: { createdAt: "asc" } },
    },
  });

  if (!matter) redirect("/portal");

  const serialized = {
    matterId: matter.id,
    beneficiaries: matter.beneficiaries.map((b) => ({
      id: b.id,
      fullName: b.fullName,
      relationship: b.relationshipLabel ?? b.type,
      address: [b.addressLine1, b.addressLine2, b.city, b.province, b.postalCode]
        .filter(Boolean)
        .join(", "),
    })),
    mailings: matter.beneficiaryMailings.map((m) => ({
      id: m.id,
      beneficiaryId: m.beneficiaryId,
      beneficiaryName: m.beneficiaryName,
      deliveryMethod: m.deliveryMethod,
      status: m.status,
      printedAt: m.printedAt?.toISOString() ?? null,
      mailedAt: m.mailedAt?.toISOString() ?? null,
      deliveredAt: m.deliveredAt?.toISOString() ?? null,
      trackingNumber: m.trackingNumber,
      carrierName: m.carrierName,
      notes: m.notes,
      proofs: m.proofs.map((p) => ({
        id: p.id,
        fileName: p.fileName,
        fileUrl: p.fileUrl,
        uploadedAt: p.uploadedAt.toISOString(),
      })),
    })),
    noticesMailedAt: matter.noticesMailedAt?.toISOString() ?? null,
  };

  return <MailingTracker data={serialized} />;
}
