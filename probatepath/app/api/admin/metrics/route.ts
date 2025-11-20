import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin/auth";
import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/admin/rate";

export async function GET(request: Request) {
  const maybe = await requireAdminSession();
  if ((maybe as unknown as Response)?.status === 403) return maybe as unknown as Response;

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? request.headers.get("x-real-ip") ?? "local";
  if (!checkRateLimit(ip)) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

  try {
    const now = new Date();
    const d1 = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const d7 = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const [users24h, users7d, logins24h, logins7d, failedLogins24h, intakesSaved24h, intakesSubmitted24h] = await Promise.all([
      prisma.user.count({ where: { createdAt: { gte: d1 } } }),
      prisma.user.count({ where: { createdAt: { gte: d7 } } }),
      prisma.auditLog.count({ where: { action: "auth.sign_in", createdAt: { gte: d1 } } }),
      prisma.auditLog.count({ where: { action: "auth.sign_in", createdAt: { gte: d7 } } }),
      prisma.auditLog.count({ where: { action: "auth.login_failed", createdAt: { gte: d1 } } }),
      prisma.auditLog.count({ where: { action: "intake.save", createdAt: { gte: d1 } } }),
      prisma.auditLog.count({ where: { action: "intake.submit", createdAt: { gte: d1 } } }),
    ]);

    return NextResponse.json({
      users: { d1: users24h, d7: users7d },
      logins: { d1: logins24h, d7: logins7d, failedD1: failedLogins24h },
      intake: { savedD1: intakesSaved24h, submittedD1: intakesSubmitted24h },
    });
  } catch (error) {
    console.error("[admin] Failed to compute metrics", error);
    return NextResponse.json({ error: "Unable to compute metrics" }, { status: 500 });
  }
}
