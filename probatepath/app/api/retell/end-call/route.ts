import { NextResponse } from "next/server";
import { prisma, prismaEnabled } from "@/lib/prisma";
import { verifyRetellSignature } from "@/lib/retell/verify";
import { sendSMS } from "@/lib/sms";
import { z } from "zod";
import { AI_CALL_STATUS } from "@/lib/retell/types";
import type { Prisma } from "@prisma/client";

const EndCallSchema = z.object({
  call_id: z.string(),
  outcome: z.enum(["completed", "abandoned", "callback_scheduled", "not_qualified"]),
  send_payment_link: z.boolean().optional(),
});

const APP_URL = process.env.APP_URL || process.env.NEXTAUTH_URL || "http://localhost:3000";

/**
 * Finalize a call and trigger follow-up actions
 * Called by Retell when the call is ending
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

  const parsed = EndCallSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid payload", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { call_id, outcome, send_payment_link } = parsed.data;

  try {
    // Get the AI call record
    const aiCall = await prisma.aiCall.findUnique({
      where: { retellCallId: call_id },
      include: { user: true },
    });

    if (!aiCall) {
      return NextResponse.json({ error: "Call not found" }, { status: 404 });
    }

    // Map outcome to status
    const statusMap = {
      completed: AI_CALL_STATUS.COMPLETED,
      abandoned: AI_CALL_STATUS.ABANDONED,
      callback_scheduled: AI_CALL_STATUS.COMPLETED,
      not_qualified: AI_CALL_STATUS.COMPLETED,
    };

    // Update AI call record
    await prisma.aiCall.update({
      where: { id: aiCall.id },
      data: {
        status: statusMap[outcome],
        endedAt: new Date(),
      },
    });

    let paymentToken: string | null = null;
    let nextStep = "";

    switch (outcome) {
      case "completed":
        // Create payment token and send link
        if (send_payment_link !== false) {
          paymentToken = await createPaymentTokenForCall(aiCall);
          const phone = aiCall.phoneNumber || aiCall.user?.phone;
          if (phone) {
            await sendSMS({
              to: phone,
              body: `Thanks for calling ProbateDesk! Complete your payment here: ${APP_URL}/pay?token=${paymentToken}`,
            });
          }
        }
        nextStep = "payment";
        break;

      case "abandoned":
        // Schedule recovery reminders
        await scheduleRecoveryReminders(aiCall.id);
        nextStep = "recovery_scheduled";
        break;

      case "callback_scheduled":
        nextStep = "callback_pending";
        break;

      case "not_qualified":
        nextStep = "referred_to_lawyer";
        break;
    }

    console.log("[retell/end-call] Call ended:", { call_id, outcome, nextStep });

    return NextResponse.json({
      success: true,
      outcome,
      next_step: nextStep,
      payment_token: paymentToken,
      payment_url: paymentToken ? `${APP_URL}/pay?token=${paymentToken}` : null,
    });
  } catch (error) {
    console.error("[retell/end-call] Error:", error);
    return NextResponse.json({ error: "Failed to end call" }, { status: 500 });
  }
}

async function createPaymentTokenForCall(aiCall: { id: string; userId: string | null; recommendedTier: string | null; collectedData: unknown }): Promise<string> {
  const collectedData = (aiCall.collectedData as Record<string, unknown>) || {};
  const token = crypto.randomUUID().replace(/-/g, "");

  const prefillData = {
    tier: aiCall.recommendedTier || "standard",
    name: (collectedData.executor_name || collectedData.executor_full_name) as string | undefined,
    email: collectedData.executor_email as string | undefined,
    phone: collectedData.executor_phone as string | undefined,
  };

  await prisma.paymentToken.create({
    data: {
      token,
      userId: aiCall.userId,
      aiCallId: aiCall.id,
      prefillData: prefillData as Prisma.InputJsonValue,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    },
  });

  return token;
}

async function scheduleRecoveryReminders(aiCallId: string) {
  const now = new Date();

  // Schedule 1-hour reminder
  await prisma.reminder.upsert({
    where: { caseId_type: { caseId: aiCallId, type: "abandoned_call_1h" } },
    create: {
      caseId: aiCallId,
      type: "abandoned_call_1h",
      channel: "sms",
      dueAt: new Date(now.getTime() + 60 * 60 * 1000), // 1 hour
    },
    update: {
      dueAt: new Date(now.getTime() + 60 * 60 * 1000),
      sentAt: null,
    },
  });

  // Schedule 24-hour reminder
  await prisma.reminder.upsert({
    where: { caseId_type: { caseId: aiCallId, type: "abandoned_call_24h" } },
    create: {
      caseId: aiCallId,
      type: "abandoned_call_24h",
      channel: "email",
      dueAt: new Date(now.getTime() + 24 * 60 * 60 * 1000), // 24 hours
    },
    update: {
      dueAt: new Date(now.getTime() + 24 * 60 * 60 * 1000),
      sentAt: null,
    },
  });

  // Schedule 3-day reminder
  await prisma.reminder.upsert({
    where: { caseId_type: { caseId: aiCallId, type: "abandoned_call_3d" } },
    create: {
      caseId: aiCallId,
      type: "abandoned_call_3d",
      channel: "sms",
      dueAt: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000), // 3 days
    },
    update: {
      dueAt: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000),
      sentAt: null,
    },
  });

  console.log("[retell/end-call] Recovery reminders scheduled for AI call:", aiCallId);
}
