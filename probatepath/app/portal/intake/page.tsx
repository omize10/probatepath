import { randomUUID } from "crypto";
import { redirect } from "next/navigation";
import { requirePortalAuth } from "@/lib/auth";
import { resolvePortalMatter } from "@/lib/portal/server";
import { prisma, prismaEnabled } from "@/lib/prisma";

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
    if (matter?.rightFitStatus === "NOT_FIT") {
      redirect(`/matters/${matter.id}/not-a-fit`);
    }
    if (matter && !(matter.draft?.submittedAt ?? false)) {
      redirect(`/matters/${matter.id}/intake`);
    }

    const newMatter = await prisma.matter.create({
      data: {
        userId,
        clientKey: randomUUID(),
        rightFitStatus: "ELIGIBLE",
        rightFitCompletedAt: new Date(),
      },
    });

    redirect(`/matters/${newMatter.id}/intake`);
  } catch (error) {
    console.warn("[portal] Failed to create intake matter", { userId, error });
    redirect("/start?error=intake");
  }
}
