import { AuthAuditType, Prisma } from "@prisma/client";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { logSecurityAudit } from "@/lib/audit";

async function extractClientInfo(source?: Request | { headers?: Headers }) {
  if (source && "headers" in source && source.headers) {
    return {
      ip: source.headers.get("x-forwarded-for")?.split(",")[0]?.trim(),
      userAgent: source.headers.get("user-agent") ?? undefined,
    };
  }
  try {
    const headerStore = await headers();
    return {
      ip: headerStore.get("x-forwarded-for")?.split(",")[0]?.trim(),
      userAgent: headerStore.get("user-agent") ?? undefined,
    };
  } catch {
    return { ip: undefined, userAgent: undefined };
  }
}

export async function logAuthEvent({
  action,
  userId,
  email,
  meta,
  req,
}: {
  action: AuthAuditType;
  userId?: string;
  email?: string;
  meta?: Record<string, unknown>;
  req?: Request | { headers?: Headers };
}) {
  try {
    const client = await extractClientInfo(req);
    const metaValue: Prisma.InputJsonValue | undefined = meta
      ? (meta as Prisma.InputJsonValue)
      : email
        ? ({ email } as Prisma.InputJsonValue)
        : undefined;
    await prisma.authAuditLog.create({
      data: {
        userId: userId ?? null,
        type: action,
        ip: client.ip,
        userAgent: client.userAgent,
        meta: metaValue,
      },
    });
    // Mirror into the general security audit log for admin visibility
    try {
      const actionMap: Record<string, string> = {
        REGISTER: "auth.register",
        LOGIN: "auth.login",
        LOGOUT: "auth.logout",
      };
      const secAction = actionMap[action as unknown as string] ?? `auth.${String(action).toLowerCase()}`;
      await logSecurityAudit({
        req: req as Request | undefined,
        userId: userId ?? null,
        action: secAction,
        meta: meta ?? (email ? { email } : undefined),
      });
    } catch (e) {
      // non-fatal
    }
  } catch (error) {
    console.error("[audit] Failed to log auth event", error);
  }
}

export async function listAuthAudits(limit: number) {
  const entries = await prisma.authAuditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
    include: { user: true },
  });
  return entries.map((entry) => ({
    id: entry.id,
    type: entry.type,
    createdAt: entry.createdAt,
    ip: entry.ip,
    userAgent: entry.userAgent,
    user: entry.user ? { id: entry.user.id, email: entry.user.email } : undefined,
    meta: entry.meta,
  }));
}
