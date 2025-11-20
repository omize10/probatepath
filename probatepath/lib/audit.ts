import type { NextRequest } from "next/server";
import { Prisma } from "@prisma/client";
import "server-only";
import { prisma } from "@/lib/prisma";

/**
 * Matter-scoped audit log (existing)
 */
export async function logAudit({
  matterId,
  actorId,
  action,
  meta,
}: {
  matterId: string;
  actorId?: string | null;
  action: string;
  meta?: Prisma.InputJsonValue | null;
}) {
  await prisma.auditLog.create({
    data: {
      matterId,
      actorId: actorId ?? null,
      action,
      meta: meta ?? Prisma.JsonNull,
    },
  });
}

/**
 * Extract client IP from request
 */
export function getIp(req?: NextRequest | Request): string | undefined {
  if (!req) return undefined;

  // Check for common proxy headers first
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }

  const realIp = req.headers.get("x-real-ip");
  if (realIp) {
    return realIp;
  }

  // Fallback to socket address if available
  if ("ip" in req) {
    return (req as unknown as { ip?: string }).ip;
  }

  return undefined;
}

/**
 * Extract user agent from request
 */
export function getUA(req?: NextRequest | Request): string | undefined {
  if (!req) return undefined;
  return req.headers.get("user-agent") ?? undefined;
}

interface LogSecurityAuditOptions {
  req?: NextRequest | Request;
  userId?: string | null;
  action: string;
  meta?: unknown;
  matterId?: string | null;
}

/**
 * Security/general audit log (auth events, portal access, etc.)
 * Never throws; logs warnings on failure
 */
export async function logSecurityAudit(
  opts: LogSecurityAuditOptions
): Promise<void> {
  try {
    const ip = getIp(opts.req);
    const ua = getUA(opts.req);

    await prisma.auditLog.create({
      data: {
        userId: opts.userId ?? null,
        matterId: opts.matterId ?? null,
        action: opts.action,
        ip,
        ua,
        meta: opts.meta ? (opts.meta as Prisma.InputJsonValue) : Prisma.JsonNull,
      },
    });
  } catch (err) {
    console.warn("[audit] Failed to log security audit event", {
      action: opts.action,
      error: err instanceof Error ? err.message : String(err),
    });
  }
}
