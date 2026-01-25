import { NextResponse } from "next/server";
import { prisma, prismaEnabled } from "@/lib/prisma";
import { verifyRetellSignature } from "@/lib/retell/verify";
import { z } from "zod";
import { TierRecommendation, TIER_PRICES } from "@/lib/retell/types";

const RecommendTierSchema = z.object({
  call_id: z.string(),
});

/**
 * Calculate and return recommended service tier based on collected data
 * Called by Retell when AI has collected enough information for tier recommendation
 */
export async function POST(request: Request) {
  if (!prismaEnabled) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  const rawBody = await request.text();
  const signature = request.headers.get("x-retell-signature");

  if (!verifyRetellSignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = RecommendTierSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid payload", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { call_id } = parsed.data;

  try {
    // Get the AI call record
    const aiCall = await prisma.aiCall.findUnique({
      where: { retellCallId: call_id },
    });

    if (!aiCall) {
      return NextResponse.json({ error: "Call not found" }, { status: 404 });
    }

    // Get collected data
    const collectedData = (aiCall.collectedData as Record<string, unknown>) || {};
    const qualificationFlags = (aiCall.qualificationFlags as Record<string, unknown>) || {};

    // Calculate tier recommendation
    const recommendation = calculateTierRecommendation(collectedData, qualificationFlags);

    // Update AI call record
    await prisma.aiCall.update({
      where: { id: aiCall.id },
      data: {
        recommendedTier: recommendation.tier,
      },
    });

    console.log("[retell/recommend-tier] Recommendation:", { call_id, tier: recommendation.tier });

    return NextResponse.json({
      success: true,
      ...recommendation,
    });
  } catch (error) {
    console.error("[retell/recommend-tier] Error:", error);
    return NextResponse.json({ error: "Failed to recommend tier" }, { status: 500 });
  }
}

function calculateTierRecommendation(
  collectedData: Record<string, unknown>,
  qualificationFlags: Record<string, unknown>
): TierRecommendation {
  const reasoning: string[] = [];
  let tier: "basic" | "standard" | "premium" = "basic";

  // Parse estate value
  const estateValue = parseEstateValue(collectedData.estate_value || collectedData.estate_value_range);
  const hasRealProperty = Boolean(collectedData.has_property || collectedData.has_real_property || collectedData.anyRealProperty);
  const hasMultipleBeneficiaries = Boolean(collectedData.multiple_beneficiaries || collectedData.multipleBeneficiaries);
  const isAdministration = collectedData.has_will === false || collectedData.grantType === "administration";

  // Estate value thresholds
  if (estateValue > 500000) {
    tier = "premium";
    reasoning.push("Estate value over $500,000 - premium support recommended");
  } else if (estateValue > 100000) {
    tier = "standard";
    reasoning.push("Estate value between $100,000 and $500,000");
  } else {
    reasoning.push("Estate value under $100,000 - basic package suitable");
  }

  // Complexity factors that bump up tier
  if (hasRealProperty && tier === "basic") {
    tier = "standard";
    reasoning.push("Real property in BC increases complexity");
  }

  if (hasMultipleBeneficiaries && tier === "basic") {
    tier = "standard";
    reasoning.push("Multiple beneficiaries require additional documentation");
  }

  if (isAdministration && tier === "basic") {
    tier = "standard";
    reasoning.push("Administration (no will) cases require additional forms");
  }

  // Yellow flags from qualification
  if (qualificationFlags.minorBeneficiaries) {
    if (tier !== "premium") tier = "standard";
    reasoning.push("Minor beneficiaries require additional care");
  }

  if (qualificationFlags.businessOwnership) {
    tier = "premium";
    reasoning.push("Business interests require premium support");
  }

  if (qualificationFlags.noOriginalWill) {
    if (tier === "basic") tier = "standard";
    reasoning.push("Missing original will requires extra documentation");
  }

  return {
    tier,
    price: TIER_PRICES[tier],
    reasoning,
  };
}

function parseEstateValue(value: unknown): number {
  if (typeof value === "number") return value;
  if (typeof value !== "string") return 0;

  // Parse range strings like "<100k", "100k-500k", ">500k"
  const lower = value.toLowerCase();
  if (lower.includes("<") || lower.includes("under") || lower.includes("less")) {
    if (lower.includes("25")) return 20000;
    if (lower.includes("50")) return 40000;
    if (lower.includes("100")) return 75000;
    return 50000;
  }
  if (lower.includes(">") || lower.includes("over") || lower.includes("more")) {
    if (lower.includes("500")) return 750000;
    if (lower.includes("1m") || lower.includes("million")) return 1500000;
    return 600000;
  }
  if (lower.includes("-") || lower.includes("to")) {
    if (lower.includes("25") && lower.includes("100")) return 60000;
    if (lower.includes("100") && lower.includes("500")) return 300000;
    if (lower.includes("500") && (lower.includes("1m") || lower.includes("million"))) return 750000;
  }

  // Try to parse as number
  const num = parseInt(value.replace(/[^0-9]/g, ""), 10);
  return isNaN(num) ? 100000 : num;
}
