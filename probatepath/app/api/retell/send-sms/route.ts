import { NextResponse } from "next/server";
import { prisma, prismaEnabled } from "@/lib/prisma";
import { verifyRetellSignature } from "@/lib/retell/verify";
import { sendSMS } from "@/lib/sms";
import { z } from "zod";
import type { Prisma } from "@prisma/client";

const SendSMSSchema = z.object({
  call_id: z.string(),
  message_type: z.enum(["payment_link", "resume_link", "confirmation", "custom"]),
  custom_message: z.string().optional(),
});

const APP_URL = process.env.APP_URL || process.env.NEXTAUTH_URL || "http://localhost:3000";

/**
 * Send SMS during an AI call
 * Called by Retell when AI needs to send a text message to the caller
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

  const parsed = SendSMSSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid payload", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { call_id, message_type, custom_message } = parsed.data;

  try {
    // Get the AI call record with user
    const aiCall = await prisma.aiCall.findUnique({
      where: { retellCallId: call_id },
      include: { user: true },
    });

    if (!aiCall) {
      return NextResponse.json({ error: "Call not found" }, { status: 404 });
    }

    // Get phone number
    const phone = aiCall.phoneNumber || aiCall.user?.phone;
    if (!phone) {
      return NextResponse.json({ error: "No phone number available" }, { status: 400 });
    }

    // Build message based on type
    let message: string;
    switch (message_type) {
      case "payment_link":
        // Create payment token first
        const paymentToken = await createPaymentToken(aiCall);
        message = `Thanks for calling ProbateDesk! Complete your payment here: ${APP_URL}/pay?token=${paymentToken}`;
        break;

      case "resume_link":
        message = `Resume your ProbateDesk intake anytime: ${APP_URL}/portal`;
        break;

      case "confirmation":
        message = `Thank you for starting your probate journey with ProbateDesk. We'll be in touch soon!`;
        break;

      case "custom":
        if (!custom_message) {
          return NextResponse.json({ error: "Custom message required" }, { status: 400 });
        }
        message = custom_message;
        break;

      default:
        return NextResponse.json({ error: "Invalid message type" }, { status: 400 });
    }

    // Send SMS
    const result = await sendSMS({ to: phone, body: message });

    console.log("[retell/send-sms] SMS sent:", { call_id, message_type, success: result.success });

    return NextResponse.json({
      success: result.success,
      error: result.error,
    });
  } catch (error) {
    console.error("[retell/send-sms] Error:", error);
    return NextResponse.json({ error: "Failed to send SMS" }, { status: 500 });
  }
}

async function createPaymentToken(aiCall: { id: string; userId: string | null; recommendedTier: string | null; collectedData: unknown }): Promise<string> {
  const collectedData = (aiCall.collectedData as Record<string, unknown>) || {};

  // Generate a secure token
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
