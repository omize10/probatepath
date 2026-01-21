import { randomUUID } from "crypto";
import { redirect } from "next/navigation";
import type { Prisma } from "@prisma/client";
import { requirePortalAuth } from "@/lib/auth";
import { resolvePortalMatter } from "@/lib/portal/server";
import { prisma, prismaEnabled } from "@/lib/prisma";
import { initializeMatterStepProgress } from "@/lib/portal/step-progress";

// Helper to check if an error is a Next.js redirect (which is thrown intentionally)
function isRedirectError(error: unknown): boolean {
  return (
    error instanceof Error &&
    "digest" in error &&
    typeof (error as { digest?: string }).digest === "string" &&
    (error as { digest: string }).digest.startsWith("NEXT_REDIRECT")
  );
}

export default async function PortalIntakePage() {
  const session = await requirePortalAuth("/portal/intake");
  const userId = (session.user as { id?: string })?.id ?? null;
  if (!userId) {
    redirect("/portal");
  }

  if (!prismaEnabled) {
    redirect("/start");
  }

  // First, check if user already has a matter (outside try-catch to avoid catching redirect errors)
  const existingMatter = await resolvePortalMatter(userId);
  if (existingMatter) {
    if (existingMatter.rightFitStatus === "NOT_FIT") {
      redirect(`/matters/${existingMatter.id}/not-a-fit`);
    }
    redirect(`/matters/${existingMatter.id}/intake`);
  }

  // No existing matter - create a new one
  try {
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
    // Re-throw redirect errors - they are intentional and should not be caught
    if (isRedirectError(error)) {
      throw error;
    }
    console.warn("[portal] Failed to create intake matter", { userId, error });
    redirect("/start?error=intake");
  }
}
