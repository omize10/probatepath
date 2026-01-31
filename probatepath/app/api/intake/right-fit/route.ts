import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import type { Prisma, RightFitStatus, Tier, GrantType } from "@prisma/client";
import { auth } from "@/lib/auth";
import { prisma, prismaEnabled } from "@/lib/prisma";
import { resolvePortalMatter } from "@/lib/portal/server";
import { getNextCaseCode } from "@/lib/cases";
import { initializeMatterStepProgress } from "@/lib/portal/step-progress";

// New schema for tier recommendation answers
const fitAnswersSchema = z.object({
  hasWill: z.enum(["yes", "no", "not_sure"]).optional(),
  willProperlyWitnessed: z.enum(["yes", "no", "not_sure"]).optional(),
  willPreparedInBC: z.enum(["yes", "no", "not_sure"]).optional(),
  hasOriginalWill: z.union([z.boolean(), z.literal("can_get_it")]).optional(),
  beneficiariesAware: z.enum(["yes", "no", "partial"]).optional(),
  potentialDisputes: z.enum(["yes", "no", "not_sure"]).optional(),
  assetsOutsideBC: z.enum(["none", "other_provinces", "international"]).optional(),
});

const recommendationSchema = z.object({
  tier: z.enum(["basic", "premium", "white_glove", "open_door_law"]),
  reason: z.string(),
  grantType: z.enum(["probate", "administration"]),
});

const payloadSchema = z.object({
  answers: fitAnswersSchema,
  recommendation: recommendationSchema.optional(),
});

function toJson(answers: z.infer<typeof fitAnswersSchema>): Prisma.JsonObject {
  return {
    hasWill: answers.hasWill,
    willProperlyWitnessed: answers.willProperlyWitnessed,
    willPreparedInBC: answers.willPreparedInBC,
    hasOriginalWill: answers.hasOriginalWill,
    beneficiariesAware: answers.beneficiariesAware,
    potentialDisputes: answers.potentialDisputes,
    assetsOutsideBC: answers.assetsOutsideBC,
  } satisfies Prisma.JsonObject;
}

// Map tier recommendation to database tier enum
function mapTierToDB(recommendedTier: "basic" | "premium" | "white_glove"): Tier {
  // Map tier-recommendation.ts tiers to database Tier enum
  // basic → basic, premium → standard, white_glove → premium
  if (recommendedTier === "basic") return "basic";
  if (recommendedTier === "premium") return "standard";
  if (recommendedTier === "white_glove") return "premium";
  return "basic"; // fallback
}

async function upsertRightFitMatter(
  userId: string,
  status: RightFitStatus,
  answers: z.infer<typeof fitAnswersSchema>,
  recommendation?: z.infer<typeof recommendationSchema>
) {
  const matter = await resolvePortalMatter(userId);

  const needsNewMatter = !matter || Boolean(matter.draft?.submittedAt ?? false);
  if (needsNewMatter || !matter) {
    const nextCaseCode = await getNextCaseCode();
    const created = await prisma.matter.create({
      data: {
        userId,
        clientKey: randomUUID(),
        caseCode: nextCaseCode,
        rightFitStatus: status,
        rightFitCompletedAt: new Date(),
        rightFitAnswers: toJson(answers),
        // Add tier recommendation fields
        recommendedTier: recommendation?.tier && recommendation.tier !== "open_door_law"
          ? mapTierToDB(recommendation.tier)
          : undefined,
        tierRecommendationReason: recommendation?.reason,
        grantType: recommendation?.grantType,
      },
      select: { id: true },
    });
    await initializeMatterStepProgress(created.id);
    return created.id;
  }

  const updated = await prisma.matter.update({
    where: { id: matter.id },
    data: {
      rightFitStatus: status,
      rightFitCompletedAt: new Date(),
      rightFitAnswers: toJson(answers),
      // Add tier recommendation fields
      recommendedTier: recommendation?.tier && recommendation.tier !== "open_door_law"
        ? mapTierToDB(recommendation.tier)
        : undefined,
      tierRecommendationReason: recommendation?.reason,
      grantType: recommendation?.grantType,
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

  const { answers, recommendation } = parsed.data;

  // Determine right fit status
  let status: RightFitStatus;
  if (recommendation?.tier === "open_door_law") {
    status = "NOT_FIT"; // Open Door Law referral
  } else if (recommendation) {
    status = "RECOMMENDED"; // Has tier recommendation
  } else {
    // Backward compatibility: no recommendation provided
    status = "ELIGIBLE";
  }

  try {
    const matterId = await upsertRightFitMatter(userId, status, answers, recommendation);

    return NextResponse.json({
      matterId,
      recommendation: recommendation ? {
        tier: recommendation.tier,
        reason: recommendation.reason,
        grantType: recommendation.grantType,
      } : undefined,
    });
  } catch (error) {
    console.error("[right-fit] Failed to persist decision", error);
    return NextResponse.json({ error: "Unable to start intake right now." }, { status: 500 });
  }
}
