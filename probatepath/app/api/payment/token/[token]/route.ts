import { NextResponse } from "next/server";
import { prisma, prismaEnabled } from "@/lib/prisma";

interface RouteParams {
  params: Promise<{ token: string }>;
}

/**
 * Validate a payment token and return prefill data
 * Called by the payment page to pre-populate the form
 */
export async function GET(request: Request, context: RouteParams) {
  if (!prismaEnabled) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  const { token } = await context.params;

  if (!token) {
    return NextResponse.json({ error: "Token required" }, { status: 400 });
  }

  try {
    const paymentToken = await prisma.paymentToken.findUnique({
      where: { token },
      include: {
        aiCall: {
          select: {
            recommendedTier: true,
            collectedData: true,
            grantType: true,
          },
        },
        user: {
          select: {
            email: true,
            name: true,
            phone: true,
          },
        },
      },
    });

    if (!paymentToken) {
      return NextResponse.json({ valid: false, error: "Token not found" }, { status: 404 });
    }

    // Check if expired
    if (new Date() > paymentToken.expiresAt) {
      return NextResponse.json({ valid: false, error: "Token expired" }, { status: 410 });
    }

    // Check if already used
    if (paymentToken.usedAt) {
      return NextResponse.json({ valid: false, error: "Token already used", used: true }, { status: 410 });
    }

    // Build prefill data from token, AI call, and user
    const prefillData = paymentToken.prefillData as Record<string, unknown> || {};
    const aiCallData = paymentToken.aiCall?.collectedData as Record<string, unknown> || {};

    const combinedPrefill = {
      tier: prefillData.tier || paymentToken.aiCall?.recommendedTier || "standard",
      name: prefillData.name || aiCallData.executor_name || aiCallData.executor_full_name || paymentToken.user?.name,
      email: prefillData.email || aiCallData.executor_email || paymentToken.user?.email,
      phone: prefillData.phone || aiCallData.executor_phone || paymentToken.user?.phone,
      grantType: paymentToken.aiCall?.grantType,
      fromAiCall: Boolean(paymentToken.aiCallId),
    };

    console.log("[payment/token] Token validated:", { token: token.substring(0, 8) + "..." });

    return NextResponse.json({
      valid: true,
      user_id: paymentToken.userId,
      ai_call_id: paymentToken.aiCallId,
      prefill_data: combinedPrefill,
      expires_at: paymentToken.expiresAt.toISOString(),
    });
  } catch (error) {
    console.error("[payment/token] Error validating token:", error);
    return NextResponse.json({ error: "Failed to validate token" }, { status: 500 });
  }
}

/**
 * Mark a payment token as used
 * Called after successful payment
 */
export async function POST(request: Request, context: RouteParams) {
  if (!prismaEnabled) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  const { token } = await context.params;

  if (!token) {
    return NextResponse.json({ error: "Token required" }, { status: 400 });
  }

  try {
    const paymentToken = await prisma.paymentToken.findUnique({
      where: { token },
    });

    if (!paymentToken) {
      return NextResponse.json({ error: "Token not found" }, { status: 404 });
    }

    if (paymentToken.usedAt) {
      return NextResponse.json({ error: "Token already used" }, { status: 410 });
    }

    // Mark as used
    await prisma.paymentToken.update({
      where: { token },
      data: { usedAt: new Date() },
    });

    console.log("[payment/token] Token marked as used:", { token: token.substring(0, 8) + "..." });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[payment/token] Error marking token as used:", error);
    return NextResponse.json({ error: "Failed to update token" }, { status: 500 });
  }
}
