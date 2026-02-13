import { NextResponse } from "next/server";
import { z } from "zod";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import { sendMessage } from "@/lib/messaging/service";
import { canSend } from "@/lib/email/throttle";
import { logEmail } from "@/lib/email";
import { logSecurityAudit } from "@/lib/audit";

const bodySchema = z.object({
  email: z.string().email(),
});

const CODE_TTL_MS = 10 * 60 * 1000; // 10 minutes
const CODE_COST = 11;

export async function POST(request: Request) {
  // Feature flag check
  if (process.env.ENABLE_EMAIL_CODE_AUTH !== 'true') {
    return NextResponse.json({ error: 'Feature not enabled' }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: true });
  }

  const email = parsed.data.email.trim().toLowerCase();
  let devCode: string | undefined;

  if (!canSend(`verification-code:${email}`)) {
    return NextResponse.json({ ok: true });
  }

  try {
    // Find user if exists (not required for verification codes)
    const user = await prisma.user.findFirst({
      where: { email: { equals: email, mode: "insensitive" } },
    });

    try {
      await logSecurityAudit({
        req: request,
        userId: user?.id ?? null,
        action: "auth.verification_code_requested",
        meta: { email, userExists: Boolean(user) },
      });
    } catch {}

    const secret = process.env.NEXTAUTH_SECRET;
    if (!secret) {
      console.error("[auth] NEXTAUTH_SECRET missing; cannot issue verification codes");
      return NextResponse.json({ ok: true });
    }

    const code = String(crypto.randomInt(0, 1_000_000)).padStart(6, "0");
    const expiresAt = new Date(Date.now() + CODE_TTL_MS);
    const codeHash = await bcrypt.hash(`${code}:${secret}`, CODE_COST);

    await sendMessage({
      templateKey: "verification_code",
      to: { email },
      variables: { code },
    });

    // In dev mode without RESEND_API_KEY, return the code for testing
    if (process.env.NODE_ENV !== "production" && !process.env.RESEND_API_KEY) {
      devCode = code;
    }

    // Log email meta for verification code
    await logEmail({
      to: email,
      subject: "Your ProbateDesk verification code",
      template: "verification-code",
      meta: {
        userId: user?.id ?? null,
        codeHash,
        expiresAt: expiresAt.toISOString(),
        attempts: 0,
        verifiedAt: null,
        usedAt: null,
      },
    });
  } catch (error) {
    console.error("[auth] Failed to request verification code", error);
  }

  return NextResponse.json({ ok: true, ...(devCode ? { devCode } : {}) });
}
