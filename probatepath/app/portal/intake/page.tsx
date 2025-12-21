import { randomUUID } from "crypto";
import { redirect } from "next/navigation";
import type { Prisma } from "@prisma/client";
import { requirePortalAuth } from "@/lib/auth";
import { resolvePortalMatter } from "@/lib/portal/server";
import { prisma, prismaEnabled } from "@/lib/prisma";
import { initializeMatterStepProgress } from "@/lib/portal/step-progress";

export default async function PortalIntakePage() {
  const session = await requirePortalAuth("/portal/intake");
  const userId = (session.user as { id?: string })?.id ?? null;
  if (!userId) {
    redirect("/portal");
  }

  if (!prismaEnabled) {
    redirect("/start");
  }

  try {
    const matter = await resolvePortalMatter(userId);
    if (matter) {
      if (matter.rightFitStatus === "NOT_FIT") {
        redirect(`/matters/${matter.id}/not-a-fit`);
      }
      redirect(`/matters/${matter.id}/intake`);
    }

    const freshMatter = await prisma.matter.create({
      data: {
        userId,
        clientKey: randomUUID(),
        rightFitStatus: "ELIGIBLE",
        rightFitCompletedAt: new Date(),
      } satisfies Prisma.MatterUncheckedCreateInput,
    });
    await initializeMatterStepProgress(freshMatter.id);

    redirect(`/matters/${freshMatter.id}/intake`);
  } catch (error) {
    console.warn("[portal] Failed to create intake matter", { userId, error });
    redirect("/start?error=intake");
  }
}
