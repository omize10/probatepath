import { NextResponse } from "next/server";
import { prisma, prismaEnabled } from "@/lib/prisma";
import { getServerAuth } from "@/lib/auth";
import { z } from "zod";

const CreateTokenSchema = z.object({
  ai_call_id: z.string().optional(),
  prefill_data: z.object({
    // Accept both legacy and new tier names
    tier: z.enum(["basic", "standard", "premium", "essentials", "guided", "full_service"]).optional(),
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

  // Auth model: either an authenticated user creates a token for themselves,
  // OR the Retell webhook-handling path creates one for an ai_call_id it just
  // processed (in which case we look up the call's user). Previously this
  // accepted anonymous calls supplying arbitrary ai_call_id values (IDOR).
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

  // Reject anonymous calls that don't reference an ai_call_id. Anonymous
  // callers must be the Retell path, which always passes ai_call_id.
  if (!userId && !ai_call_id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Generate secure token
    const token = crypto.randomUUID().replace(/-/g, "");
    const expiresAt = new Date(Date.now() + expires_in_days * 24 * 60 * 60 * 1000);

    // Resolve the owning user. If signed in, use that user. Otherwise look up
    // the ai_call and require it to exist (anonymous callers cannot invent
    // arbitrary call IDs to generate payment links for other users).
    let tokenUserId: string | undefined = userId;
    if (ai_call_id) {
      const aiCall = await prisma.aiCall.findUnique({
        where: { id: ai_call_id },
        select: { userId: true, id: true },
      });
      if (!aiCall) {
        return NextResponse.json({ error: "AI call not found" }, { status: 404 });
      }
      // Anonymous caller: must match the call's own user context.
      // Authenticated caller: must own the call OR the call has no user yet.
      if (!userId) {
        tokenUserId = aiCall.userId ?? undefined;
      } else if (aiCall.userId && aiCall.userId !== userId) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
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
