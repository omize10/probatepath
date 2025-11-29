"use server";

import { revalidatePath } from "next/cache";
import { requirePortalAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { resolvePortalMatter } from "@/lib/portal/server";
import {
  normalizeJourneyState,
  setJourneyStateValue,
  type JourneyStepId,
  type JourneyStatus,
} from "@/lib/portal/journey";

export async function updateJourneyStepStatus(stepId: JourneyStepId, status: JourneyStatus) {
  const session = await requirePortalAuth("/portal");
  const userId = (session.user as { id?: string })?.id ?? null;
  if (!userId) {
    throw new Error("You must be signed in to update your steps.");
  }
  const matter = await resolvePortalMatter(userId);
  if (!matter) {
    throw new Error("A matter has not been created yet.");
  }

  const current = normalizeJourneyState(matter.journeyStatus ?? undefined);
  const nextState = setJourneyStateValue(current, stepId, status);

  await prisma.$transaction([
    prisma.matter.update({
      where: { id: matter.id },
      data: { journeyStatus: nextState },
    }),
    prisma.matterStepProgress.upsert({
      where: { matterId_stepKey: { matterId: matter.id, stepKey: stepId } },
      create: { matterId: matter.id, stepKey: stepId, status },
      update: { status },
    }),
  ]);

  revalidatePath("/portal");
  revalidatePath("/portal/steps");
  revalidatePath(`/portal/steps/${stepId}`);
}
