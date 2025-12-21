import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth/password";
import { logSecurityAudit } from "@/lib/audit";
import { passwordSigFromHash, verifyPasswordResetToken } from "@/lib/auth/password-reset";
import { verifyPasswordResetSessionToken } from "@/lib/auth/password-reset-session";

const bodySchema = z
  .object({
    newPassword: z.string().min(8),
    token: z.string().min(10).optional(),
    resetToken: z.string().min(10).optional(),
  })
  .refine((v) => Boolean(v.token) !== Boolean(v.resetToken), { message: "Provide token or resetToken" });

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const { token, resetToken, newPassword } = parsed.data;

  let userId: string | null = null;
  let emailLogId: string | null = null;

  if (token) {
    const verified = verifyPasswordResetToken(token);
    if (!verified.ok) {
      const status = verified.error === "Misconfigured" ? 500 : 400;
      const error = verified.error === "Expired" ? "Expired" : "Invalid";
      return NextResponse.json({ error }, { status });
    }
    userId = verified.userId;
  } else if (resetToken) {
    const verified = verifyPasswordResetSessionToken(resetToken);
    if (!verified.ok) {
      const status = verified.error === "Misconfigured" ? 500 : 400;
      const error = verified.error === "Expired" ? "Expired" : "Invalid";
      return NextResponse.json({ error }, { status });
    }
    userId = verified.userId;
    emailLogId = verified.emailLogId;
  }

  if (!userId) return NextResponse.json({ error: "Invalid" }, { status: 400 });

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return NextResponse.json({ error: "Invalid" }, { status: 400 });

  if (token) {
    const verified = verifyPasswordResetToken(token);
    if (!verified.ok) return NextResponse.json({ error: "Invalid" }, { status: 400 });
    // Token is bound to the user's current password hash so it becomes unusable after a successful reset.
    if (passwordSigFromHash(user.passwordHash) !== verified.passwordSig) {
      return NextResponse.json({ error: "Expired" }, { status: 400 });
    }
  } else if (emailLogId) {
    const entry = await prisma.emailLog.findUnique({ where: { id: emailLogId } });
    const meta = (entry?.meta ?? null) as any;
    const expiresAtIso = meta?.expiresAt as string | undefined;
    const verifiedAt = meta?.verifiedAt as string | null | undefined;
    const usedAt = meta?.usedAt as string | null | undefined;
    const metaUserId = meta?.userId as string | undefined;
    if (!entry || !expiresAtIso || !verifiedAt || usedAt || metaUserId !== user.id) {
      return NextResponse.json({ error: "Invalid" }, { status: 400 });
    }
    const expiresAt = new Date(expiresAtIso);
    if (!Number.isFinite(expiresAt.getTime()) || Date.now() > expiresAt.getTime()) {
      return NextResponse.json({ error: "Expired" }, { status: 400 });
    }
    await prisma.emailLog.update({
      where: { id: entry.id },
      data: {
        meta: {
          ...meta,
          usedAt: new Date().toISOString(),
        },
      } as any,
    });
  }

  const newHash = await hashPassword(newPassword);
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash: newHash },
  });

  try {
    await logSecurityAudit({ req: request, userId: user.id, action: "auth.password_reset_completed" });
  } catch {}

  return NextResponse.json({ ok: true, email: user.email });
}
