import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin/auth";
import { usersQuery } from "@/lib/admin/schemas";
import { decodeCursor, encodeCursor, applyCursorArgs } from "@/lib/admin/pagination";
import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/admin/rate";

export async function GET(request: Request) {
  const maybe = await requireAdminSession();
  if ((maybe as unknown as Response)?.status === 403) return maybe as unknown as Response;

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? request.headers.get("x-real-ip") ?? "local";
  if (!checkRateLimit(ip)) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

  const url = new URL(request.url);
  const parsed = usersQuery.safeParse(Object.fromEntries(url.searchParams));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.message }, { status: 400 });
  const q = parsed.data;

  try {
    const where: any = {};
    if (q.q) {
      where.OR = [
        { email: { contains: q.q, mode: "insensitive" } },
        { name: { contains: q.q, mode: "insensitive" } },
      ];
    }

    const cursor = decodeCursor(q.cursor);
    const { take, orderBy, cursor: cursorArg, skip } = applyCursorArgs(cursor, q.limit);

    const rows = await prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take,
      cursor: cursorArg as any,
      skip,
    });

    let nextCursor: string | null = null;
    let items = rows;
    if (rows.length > q.limit) {
      const last = rows.pop() as any;
      nextCursor = encodeCursor({ id: last.id, createdAt: last.createdAt.toISOString() });
      items = rows;
    }

    const out = items.map((u) => ({ id: u.id, email: u.email, name: u.name ?? null, role: u.role, createdAt: u.createdAt }));
    return NextResponse.json({ items: out, nextCursor });
  } catch (error) {
    console.error("[admin] Failed to list users", error);
    return NextResponse.json({ error: "Unable to list users" }, { status: 500 });
  }
}
