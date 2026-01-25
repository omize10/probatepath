import { NextResponse } from "next/server";
import { prisma, prismaEnabled } from "@/lib/prisma";
import { getServerAuth } from "@/lib/auth";
import { z } from "zod";

const CreateTokenSchema = z.object({
  ai_call_id: z.string().optional(),
  prefill_data: z.object({
    tier: z.enum(["basic", "standard", "premium"]).optional(),
    name: z.string().optional(),
    email: z.string().email().optional(),
    phone: z.string().optional(),
  }),
  expires_in_days: z.number().min(1).max(30).optional().default(7),
});

/**
 * Create a payment token with prefill data
 * Used for generating secure payment links after AI calls or for manual creation
 */
export async function POST(request: Request) {
  if (!prismaEnabled) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  // This endpoint can be called without auth (from Retell) or with auth (from internal)
  const { session } = await getServerAuth();
  const userId = (session?.user as { id?: string })?.id;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = CreateTokenSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid payload", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { ai_call_id, prefill_data, expires_in_days } = parsed.data;

  try {
    // Generate secure token
    const token = crypto.randomUUID().replace(/-/g, "");
    const expiresAt = new Date(Date.now() + expires_in_days * 24 * 60 * 60 * 1000);

    // If ai_call_id provided, get the user from there
    let tokenUserId: string | undefined = userId;
    if (ai_call_id && !tokenUserId) {
      const aiCall = await prisma.aiCall.findUnique({
        where: { id: ai_call_id },
        select: { userId: true },
      });
      tokenUserId = aiCall?.userId ?? undefined;
    }

    const paymentToken = await prisma.paymentToken.create({
      data: {
        token,
        userId: tokenUserId,
        aiCallId: ai_call_id,
        prefillData: prefill_data,
        expiresAt,
      },
    });

    const APP_URL = process.env.APP_URL || process.env.NEXTAUTH_URL || "http://localhost:3000";

    console.log("[payment/token] Created token:", { token: token.substring(0, 8) + "...", expiresAt });

    return NextResponse.json({
      success: true,
      token,
      url: `${APP_URL}/pay?token=${token}`,
      expires_at: expiresAt.toISOString(),
    });
  } catch (error) {
    console.error("[payment/token] Error creating token:", error);
    return NextResponse.json({ error: "Failed to create token" }, { status: 500 });
  }
}
