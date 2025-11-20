import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin/auth";
import { auditQuery } from "@/lib/admin/schemas";
import { decodeCursor, encodeCursor, applyCursorArgs } from "@/lib/admin/pagination";
import { prisma } from "@/lib/prisma";
import { listAuthAudits } from "@/lib/auth/log-auth-event";
import { checkRateLimit } from "@/lib/admin/rate";

export async function GET(request: Request) {
  // admin guard
  const maybe = await requireAdminSession();
  if ((maybe as unknown as Response)?.status === 403) return maybe as unknown as Response;

  // rate limit (key by IP)
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? request.headers.get("x-real-ip") ?? "local";
  if (!checkRateLimit(ip)) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

  // parse query
  const url = new URL(request.url);
  const parsed = auditQuery.safeParse(Object.fromEntries(url.searchParams));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.message }, { status: 400 });
  }
  const q = parsed.data;

  try {
    if (q.type === "auth") {
      const items = await listAuthAudits(q.limit);
      return NextResponse.json({ items, nextCursor: null });
    }

    // Build where clause
    const where: any = {};
    if (q.action) {
      where.action = q.action;
    } else if (q.type === "security") {
      where.OR = [
        { action: { startsWith: "auth." } },
        { action: { startsWith: "portal." } },
        { action: { startsWith: "intake." } },
      ];
    }

    if (q.user) {
      where.user = { email: { contains: q.user, mode: "insensitive" } };
    }

    if (q.from || q.to) {
      where.createdAt = {};
      if (q.from) where.createdAt.gte = new Date(q.from);
      if (q.to) where.createdAt.lte = new Date(q.to);
    }

    const cursor = decodeCursor(q.cursor);
    const { take, orderBy, cursor: cursorArg, skip } = applyCursorArgs(cursor, q.limit);

    const rows = await prisma.auditLog.findMany({
      where,
      orderBy,
      take,
      cursor: cursorArg as any,
      skip,
      include: { user: true },
    });

    let nextCursor: string | null = null;
    let items = rows;
    if (rows.length > q.limit) {
      const last = rows.pop() as any;
      nextCursor = encodeCursor({ id: last.id, createdAt: last.createdAt.toISOString() });
      items = rows;
    }

    const out = items.map((it) => {
      const metaRaw = it.meta;
      let meta: unknown = metaRaw ?? null;
      try {
        const s = JSON.stringify(metaRaw ?? null);
        if (s.length > 10240) {
          meta = { redacted: true, size: s.length };
        }
      } catch (e) {
        meta = null;
      }

      return {
        id: it.id,
        action: it.action,
        meta,
        ip: it.ip ?? null,
        ua: it.ua ?? null,
        createdAt: it.createdAt,
        user: it.user ? { id: it.user.id, email: it.user.email } : null,
        matterId: it.matterId ?? null,
      };
    });

    return NextResponse.json({ items: out, nextCursor });
  } catch (error) {
    console.error("[admin] Failed to list audits", error);
    return NextResponse.json({ error: "Unable to load audits" }, { status: 500 });
  }
}
