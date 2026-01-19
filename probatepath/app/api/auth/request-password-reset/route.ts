import { NextResponse } from "next/server";
import { z } from "zod";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import { sendPasswordResetCodeEmail } from "@/lib/email/resend";
import { canSend } from "@/lib/email/throttle";
import { logEmail } from "@/lib/email";
import { logSecurityAudit } from "@/lib/audit";

const bodySchema = z.object({
  email: z.string().email(),
});

const CODE_TTL_MS = 10 * 60 * 1000;
const CODE_COST = 11;

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: true });
  }

  const email = parsed.data.email.trim().toLowerCase();
  let devCode: string | undefined;

  if (!canSend(`password-reset:${email}`)) {
    return NextResponse.json({ ok: true });
  }

  try {
    const user = await prisma.user.findFirst({
      where: { email: { equals: email, mode: "insensitive" } },
    });

    try {
      await logSecurityAudit({
        req: request,
        userId: user?.id ?? null,
        action: "auth.password_reset_requested",
        meta: { email, userExists: Boolean(user) },
      });
    } catch {}

    if (!user) {
      return NextResponse.json({ ok: true });
    }

    const secret = process.env.NEXTAUTH_SECRET;
    if (!secret) {
      console.error("[auth] NEXTAUTH_SECRET missing; cannot issue password reset codes");
      return NextResponse.json({ ok: true });
    }

    const code = String(crypto.randomInt(0, 1_000_000)).padStart(6, "0");
    const expiresAt = new Date(Date.now() + CODE_TTL_MS);
    const codeHash = await bcrypt.hash(`${code}:${secret}`, CODE_COST);

    const sendResult = await sendPasswordResetCodeEmail({ to: user.email, code });
    if (process.env.NODE_ENV !== "production" && (sendResult as any)?.simulated) {
      devCode = code;
    }
    await logEmail({
      to: user.email,
      subject: "Your Probate Desk password reset code",
      template: "password-reset-code",
      meta: {
        userId: user.id,
        codeHash,
        expiresAt: expiresAt.toISOString(),
        attempts: 0,
        verifiedAt: null,
        usedAt: null,
      },
    });
  } catch (error) {
    console.error("[auth] Failed to request password reset", error);
  }

  return NextResponse.json({ ok: true, ...(devCode ? { devCode } : {}) });
}
