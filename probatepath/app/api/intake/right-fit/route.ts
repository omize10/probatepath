import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import type { Prisma, RightFitStatus } from "@prisma/client";
import { auth } from "@/lib/auth";
import { prisma, prismaEnabled } from "@/lib/prisma";
import { resolvePortalMatter } from "@/lib/portal/server";
import { evaluateEligibility, type EligibilityAnswers } from "@/lib/intake/eligibility";

const answerSchema = z.object({
  estateInBC: z.enum(["yes", "no", "unsure"] as const),
  isExecutor: z.enum(["yes", "no", "unsure", "helper"] as const),
  willStraightforward: z.enum(["yes", "no", "no-will"] as const),
  assetsCommon: z.enum(["yes", "no", "unsure"] as const),
  complexAssetsNotes: z.string().optional().default(""),
});

const payloadSchema = z.object({
  answers: answerSchema,
});

function toJson(answers: EligibilityAnswers): Prisma.JsonObject {
  return {
    estateInBC: answers.estateInBC,
    isExecutor: answers.isExecutor,
    willStraightforward: answers.willStraightforward,
    assetsCommon: answers.assetsCommon,
    complexAssetsNotes: answers.complexAssetsNotes ?? "",
  } satisfies Prisma.JsonObject;
}

async function upsertRightFitMatter(userId: string, status: RightFitStatus, answers: EligibilityAnswers) {
  let matter = await resolvePortalMatter(userId);

  const needsNewMatter = !matter || Boolean(matter.draft?.submittedAt ?? false);
  if (needsNewMatter) {
    matter = await prisma.matter.create({
      data: {
        userId,
        clientKey: randomUUID(),
      },
    });
  }

  const updated = await prisma.matter.update({
    where: { id: matter.id },
    data: {
      rightFitStatus: status,
      rightFitCompletedAt: new Date(),
      rightFitAnswers: toJson(answers),
    },
    select: { id: true },
  });

  return updated.id;
}

export async function POST(request: Request) {
  if (!prismaEnabled) {
    return NextResponse.json({ error: "Database is not configured." }, { status: 503 });
  }

  const session = await auth();
  const userId = (session?.user as { id?: string })?.id ?? null;
  if (!userId) {
    return NextResponse.json({ error: "You must be signed in to continue." }, { status: 401 });
  }

  const parsed = payloadSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid answers." }, { status: 400 });
  }

  const answers: EligibilityAnswers = parsed.data.answers;
  const decision = evaluateEligibility(answers);
  const status: RightFitStatus = decision.status === "eligible" ? "ELIGIBLE" : "NOT_FIT";

  try {
    const matterId = await upsertRightFitMatter(userId, status, answers);
    return NextResponse.json({
      matterId,
      decision,
    });
  } catch (error) {
    console.error("[right-fit] Failed to persist decision", error);
    return NextResponse.json({ error: "Unable to start intake right now." }, { status: 500 });
  }
}
