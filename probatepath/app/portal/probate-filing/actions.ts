"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requirePortalAuth } from "@/lib/auth";

export async function saveCourtFileNumberAction(formData: FormData) {
  const session = await requirePortalAuth("/portal/probate-filing");
  const userId = (session.user as { id?: string })?.id ?? null;
  const caseId = formData.get("caseId")?.toString();
  const courtFileNumber = formData.get("courtFileNumber")?.toString()?.trim();

  if (!userId || !caseId) redirect("/portal");

  const { prisma } = await import("@/lib/prisma");
  const matter = await prisma.matter.findFirst({ where: { id: caseId, userId } });
  if (!matter) redirect("/portal");

  await prisma.matter.update({
    where: { id: caseId },
    data: {
      courtFileNumber,
      portalStatus: "waiting_for_grant",
    },
  });

  revalidatePath("/portal/probate-filing");
  redirect("/portal/probate-filing?step=8");
}

export async function markGrantReceivedAction(formData: FormData) {
  const session = await requirePortalAuth("/portal/probate-filing");
  const userId = (session.user as { id?: string })?.id ?? null;
  const caseId = formData.get("caseId")?.toString();

  if (!userId || !caseId) redirect("/portal");

  const { prisma } = await import("@/lib/prisma");
  const matter = await prisma.matter.findFirst({ where: { id: caseId, userId } });
  if (!matter) redirect("/portal");

  await prisma.matter.update({
    where: { id: caseId },
    data: {
      grantIssuedAt: new Date(),
      portalStatus: "grant_complete",
    },
  });

  revalidatePath("/portal/probate-filing");
  redirect("/portal");
}
