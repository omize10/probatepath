import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcrypt";
import { prisma } from "@/lib/prisma";
import { createPasswordResetSessionToken } from "@/lib/auth/password-reset-session";
import { logSecurityAudit } from "@/lib/audit";

const bodySchema = z.object({
  email: z.string().email(),
  code: z.string().min(4).max(12),
});

const MAX_ATTEMPTS = 5;

type ResetCodeMeta = {
  userId?: string;
  codeHash?: string;
  expiresAt?: string;
  attempts?: number;
  verifiedAt?: string | null;
  usedAt?: string | null;
};

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const email = parsed.data.email.trim().toLowerCase();
  const code = parsed.data.code.trim();
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) return NextResponse.json({ error: "Misconfigured" }, { status: 500 });

  const user = await prisma.user.findFirst({
    where: { email: { equals: email, mode: "insensitive" } },
  });

  // Always return the same error shape for non-existent users.
  if (!user) {
    return NextResponse.json({ error: "Invalid" }, { status: 400 });
  }

  const entry = await prisma.emailLog.findFirst({
    where: { to: user.email, template: "password-reset-code" },
    orderBy: { createdAt: "desc" },
  });

  const meta = (entry?.meta ?? null) as unknown as ResetCodeMeta | null;
  const userId = meta?.userId;
  const codeHash = meta?.codeHash;
  const expiresAtIso = meta?.expiresAt;
  const attempts = typeof meta?.attempts === "number" ? meta.attempts : 0;
  const usedAt = meta?.usedAt ?? null;

  if (!entry || !userId || !codeHash || !expiresAtIso || usedAt) {
    return NextResponse.json({ error: "Invalid" }, { status: 400 });
  }

  const expiresAt = new Date(expiresAtIso);
  if (!Number.isFinite(expiresAt.getTime()) || Date.now() > expiresAt.getTime()) {
    return NextResponse.json({ error: "Expired" }, { status: 400 });
  }

  if (attempts >= MAX_ATTEMPTS) {
    return NextResponse.json({ error: "TooManyAttempts" }, { status: 429 });
  }

  const ok = await bcrypt.compare(`${code}:${secret}`, codeHash);
  if (!ok) {
    await prisma.emailLog.update({
      where: { id: entry.id },
      data: {
        meta: {
          ...(meta ?? {}),
          attempts: attempts + 1,
        } as any,
      },
    });
    try {
      await logSecurityAudit({
        req: request,
        userId: user.id,
        action: "auth.password_reset_code_failed",
        meta: { attempts: attempts + 1 },
      });
    } catch {}
    return NextResponse.json({ error: "Invalid" }, { status: 400 });
  }

  const verifiedAt = new Date().toISOString();
  await prisma.emailLog.update({
    where: { id: entry.id },
    data: {
      meta: {
        ...(meta ?? {}),
        verifiedAt,
      } as any,
    },
  });

  try {
    await logSecurityAudit({
      req: request,
      userId: user.id,
      action: "auth.password_reset_code_verified",
    });
  } catch {}

  const resetToken = createPasswordResetSessionToken({ userId: user.id, emailLogId: entry.id });
  return NextResponse.json({ ok: true, resetToken });
}

