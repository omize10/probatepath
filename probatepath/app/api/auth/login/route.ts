import { NextResponse } from "next/server";
import { AuthAuditType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { compare } from "bcrypt";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { logAuthEvent } from "@/lib/auth/log-auth-event";
import { logSecurityAudit } from "@/lib/audit";

export async function POST(request: Request) {
  try {
    const { email, password, rememberMe } = await request.json();

    // Input validation
    if (!email || !password) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Find user by email
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      try {
        await logSecurityAudit({ req: request, action: "auth.login_failed", meta: { email, reason: "no_user" } });
      } catch {}
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // Check password
  const match = await verifyPassword(password, user.passwordHash || "");
      if (!match) {
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