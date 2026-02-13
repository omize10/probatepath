import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcrypt";
import { prisma } from "@/lib/prisma";
import { logSecurityAudit } from "@/lib/audit";

const bodySchema = z.object({
  email: z.string().email(),
  code: z.string().min(4).max(12),
});

const MAX_ATTEMPTS = 5;

type VerificationCodeMeta = {
  userId?: string | null;
  codeHash?: string;
  expiresAt?: string;
  attempts?: number;
  verifiedAt?: string | null;
  usedAt?: string | null;
  signInToken?: string;
  signInTokenExpiresAt?: string;
  signInTokenUsedAt?: string;
};

export async function POST(request: Request) {
  // Feature flag check
  if (process.env.ENABLE_EMAIL_CODE_AUTH !== 'true') {
    return NextResponse.json({ error: 'Feature not enabled' }, { status: 403 });
  }

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

  // User must exist for sign-in
  if (!user) {
    return NextResponse.json({ error: "Invalid" }, { status: 400 });
  }

  const entry = await prisma.emailLog.findFirst({
    where: { to: user.email, template: "verification-code" },
    orderBy: { createdAt: "desc" },
  });

  const meta = (entry?.meta ?? null) as unknown as VerificationCodeMeta | null;
  const codeHash = meta?.codeHash;
  const expiresAtIso = meta?.expiresAt;
  const attempts = typeof meta?.attempts === "number" ? meta.attempts : 0;
  const usedAt = meta?.usedAt ?? null;

  if (!entry || !codeHash || !expiresAtIso || usedAt) {
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
        action: "auth.verification_code_failed",
        meta: { attempts: attempts + 1 },
      });
    } catch {}
    return NextResponse.json({ error: "Invalid" }, { status: 400 });
  }

  const verifiedAt = new Date().toISOString();

  // Generate one-time sign-in token (valid for 2 minutes)
  const crypto = await import("crypto");
  const signInToken = crypto.randomBytes(32).toString("hex");
  const signInTokenExpiresAt = new Date(Date.now() + 2 * 60 * 1000).toISOString();

  await prisma.emailLog.update({
    where: { id: entry.id },
    data: {
      meta: {
        ...(meta ?? {}),
        verifiedAt,
        signInToken,
        signInTokenExpiresAt,
      } as any,
    },
  });

  try {
    await logSecurityAudit({
      req: request,
      userId: user.id,
      action: "auth.verification_code_verified",
    });
  } catch {}

  // Return success with one-time sign-in token
  return NextResponse.json({
    ok: true,
    userId: user.id,
    email: user.email,
    signInToken,
  });
}
