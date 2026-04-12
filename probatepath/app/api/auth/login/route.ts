import { NextResponse } from "next/server";
import { AuthAuditType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { compare } from "bcrypt";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { logAuthEvent } from "@/lib/auth/log-auth-event";
import { logSecurityAudit } from "@/lib/audit";

// In-memory rate limit per IP+email combo to slow credential stuffing.
// 10 failures per 15 minutes → 429.
const FAIL_WINDOW_MS = 15 * 60 * 1000;
const MAX_FAILS = 10;
const failMap = new Map<string, { count: number; firstAt: number }>();
function recordFail(key: string): boolean {
  const now = Date.now();
  const entry = failMap.get(key);
  if (!entry || now - entry.firstAt > FAIL_WINDOW_MS) {
    failMap.set(key, { count: 1, firstAt: now });
    return false;
  }
  entry.count += 1;
  return entry.count > MAX_FAILS;
}
function clearFails(key: string) {
  failMap.delete(key);
}

export async function POST(request: Request) {
  try {
    const { email, password, rememberMe } = await request.json();

    // Input validation
    if (!email || !password) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const ip =
      (request.headers.get("x-forwarded-for") || "").split(",")[0].trim() ||
      request.headers.get("x-real-ip") ||
      "unknown";
    const rlKey = `${ip}|${String(email).toLowerCase()}`;
    const limited = (failMap.get(rlKey)?.count ?? 0) > MAX_FAILS;
    if (limited) {
      return NextResponse.json(
        { error: "Too many attempts. Please try again in 15 minutes." },
        { status: 429 },
      );
    }

    // Find user by email
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      recordFail(rlKey);
      try {
        await logSecurityAudit({ req: request, action: "auth.login_failed", meta: { email, reason: "no_user" } });
      } catch {}
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // Check password
  const match = await verifyPassword(password, user.passwordHash || "");
      if (!match) {
        recordFail(rlKey);
        try {
          await logSecurityAudit({ req: request, action: "auth.login_failed", meta: { email: user.email, reason: "invalid_password" } });
        } catch {}
        await logAuthEvent({
          action: AuthAuditType.LOGIN,
          userId: user.id,
          meta: { error: "invalid_password" }
        });
        return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
      }

    clearFails(rlKey);
    // Successful login
    try {
      await logSecurityAudit({ req: request, action: "auth.sign_in", userId: user.id, meta: { success: true } });
    } catch {}
    await logAuthEvent({ 
      action: AuthAuditType.LOGIN,
      userId: user.id,
      meta: { success: true }
    });

    // Store session token in DB
  const sessionToken = await hashPassword(`${user.id}-${Date.now()}`);
    await prisma.session.create({
      // Cast to any here to avoid type mismatches with generated Prisma types
      // (schema/types may be out-of-sync in certain dev states). This still
      // performs the DB write as expected.
      data: {
        sessionToken,
        userId: user.id,
        expires: new Date(Date.now() + (rememberMe ? 30 : 1) * 24 * 60 * 60 * 1000)
      } as any,
    });

    return NextResponse.json({
      ok: true,
      sessionToken
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}