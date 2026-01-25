import { NextResponse } from "next/server";
import { prisma, prismaEnabled } from "@/lib/prisma";
import { verifyRetellSignature } from "@/lib/retell/verify";
import { z } from "zod";
import { QualificationFlags, QualificationResult } from "@/lib/retell/types";

const QualifySchema = z.object({
  call_id: z.string(),
  flags: z.object({
    expectedDispute: z.boolean().optional(),
    minorBeneficiaries: z.boolean().optional(),
    foreignAssets: z.boolean().optional(),
    businessOwnership: z.boolean().optional(),
    noOriginalWill: z.boolean().optional(),
    estateInBC: z.boolean().optional(),
    isExecutor: z.boolean().optional(),
  }),
});

/**
 * Check eligibility/qualification for ProbateDesk services
 * Called by Retell when AI has collected eligibility information
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

  const parsed = QualifySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid payload", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { call_id, flags } = parsed.data;

  try {
    // Get the AI call record
    const aiCall = await prisma.aiCall.findUnique({
      where: { retellCallId: call_id },
    });

    if (!aiCall) {
      return NextResponse.json({ error: "Call not found" }, { status: 404 });
    }

    // Evaluate qualification
    const result = evaluateQualification(flags);

    // Update AI call record
    await prisma.aiCall.update({
      where: { id: aiCall.id },
      data: {
        qualificationResult: result.result,
        qualificationFlags: flags,
        collectedData: {
          ...(aiCall.collectedData as object || {}),
          qualification_flags: flags,
          qualification_result: result.result,
        },
      },
    });

    // Update Matter rightFitStatus if linked
    if (aiCall.matterId) {
      const rightFitStatus = result.result === "fit" ? "ELIGIBLE" : result.result === "not_fit" ? "NOT_FIT" : "UNKNOWN";
      await prisma.matter.update({
        where: { id: aiCall.matterId },
        data: {
          rightFitStatus,
          rightFitCompletedAt: new Date(),
          rightFitAnswers: flags,
        },
      });
    }

    console.log("[retell/qualify] Qualification result:", { call_id, result: result.result });

    return NextResponse.json({
      success: true,
      qualified: result.result === "fit",
      ...result,
    });
  } catch (error) {
    console.error("[retell/qualify] Error:", error);
    return NextResponse.json({ error: "Failed to qualify" }, { status: 500 });
  }
}

function evaluateQualification(flags: QualificationFlags & { estateInBC?: boolean; isExecutor?: boolean }): QualificationResult {
  const reasons: string[] = [];
  let result: "fit" | "not_fit" | "needs_review" = "fit";

  // Hard disqualifiers
  if (flags.estateInBC === false) {
    result = "not_fit";
    reasons.push("Estate is not located in British Columbia");
  }

  if (flags.isExecutor === false) {
    result = "not_fit";
    reasons.push("Caller is not named as executor or administrator");
  }

  if (flags.expectedDispute) {
    result = "not_fit";
    reasons.push("Expected dispute requires legal representation");
  }

  if (flags.foreignAssets) {
    result = "not_fit";
    reasons.push("Foreign assets require specialized legal advice");
  }

  // Soft flags - still fit but flag for review or recommend premium
  if (flags.minorBeneficiaries) {
    if (result === "fit") result = "needs_review";
    reasons.push("Minor beneficiaries may require additional documentation");
  }

  if (flags.businessOwnership) {
    if (result === "fit") result = "needs_review";
    reasons.push("Business interests may add complexity");
  }

  if (flags.noOriginalWill) {
    if (result === "fit") result = "needs_review";
    reasons.push("Missing original will requires additional steps");
  }

  // Determine recommended action
  let recommendedAction = "Continue with intake";
  if (result === "not_fit") {
    recommendedAction = "We recommend consulting with a probate lawyer for your situation.";
  } else if (result === "needs_review") {
    recommendedAction = "Continue with intake - a specialist will review your case.";
  }

  return { result, reasons, recommendedAction };
}
