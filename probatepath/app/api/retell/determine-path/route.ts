import { NextResponse } from "next/server";
import { prisma, prismaEnabled } from "@/lib/prisma";
import { verifyRetellSignature } from "@/lib/retell/verify";
import { z } from "zod";

const DeterminePathSchema = z.object({
  call_id: z.string(),
  has_will: z.boolean(),
});

/**
 * Determine whether this is a probate (with will) or administration (no will) case
 * Called by Retell when AI determines will status
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

  const parsed = DeterminePathSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid payload", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { call_id, has_will } = parsed.data;

  try {
    // Get the AI call record
    const aiCall = await prisma.aiCall.findUnique({
      where: { retellCallId: call_id },
    });

    if (!aiCall) {
      return NextResponse.json({ error: "Call not found" }, { status: 404 });
    }

    const grantType = has_will ? "probate" : "administration";

    // Update AI call record
    await prisma.aiCall.update({
      where: { id: aiCall.id },
      data: {
        grantType,
        collectedData: {
          ...(aiCall.collectedData as object || {}),
          has_will,
        },
      },
    });

    // Update Matter if linked
    if (aiCall.matterId) {
      await prisma.matter.update({
        where: { id: aiCall.matterId },
        data: {
          pathType: grantType,
        },
      });
    }

    console.log("[retell/determine-path] Set path:", { call_id, grantType });

    // Return the forms needed for this path
    const formsNeeded = has_will
      ? ["P1", "P2", "P3", "P9", "P10"]  // Probate path
      : ["P1", "P2", "P5", "P9", "P10"]; // Administration path (P5 instead of P3)

    // Next questions to ask based on path
    const nextQuestions = has_will
      ? [
          "Do you have the original will?",
          "When was the will signed?",
          "Are there any codicils (amendments to the will)?",
        ]
      : [
          "Are you the spouse of the deceased?",
          "Are there any children of the deceased?",
          "Who else might have priority to administer the estate?",
        ];

    return NextResponse.json({
      success: true,
      path: grantType,
      forms_needed: formsNeeded,
      next_questions: nextQuestions,
    });
  } catch (error) {
    console.error("[retell/determine-path] Error:", error);
    return NextResponse.json({ error: "Failed to determine path" }, { status: 500 });
  }
}
