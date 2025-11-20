import type { Prisma } from "@prisma/client";

export type Cursor = { createdAt: string; id: string };

export function encodeCursor(c: Cursor): string {
  return Buffer.from(JSON.stringify(c)).toString("base64");
}

export function decodeCursor(s?: string | null): Cursor | undefined {
  if (!s) return undefined;
  try {
    const json = Buffer.from(s, "base64").toString("utf8");
    const parsed = JSON.parse(json);
    if (parsed && typeof parsed.id === "string" && typeof parsed.createdAt === "string") {
      return { id: parsed.id, createdAt: parsed.createdAt };
    }
  } catch (e) {
    // ignore
  }
  return undefined;
}

export function applyCursorArgs(cursor: Cursor | undefined, limit = 50) {
  const take = Math.min(Math.max(limit, 1), 100) + 1; // fetch one extra
  const orderBy: Prisma.Enumerable<Prisma.AuditLogOrderByWithRelationInput> = [
    { createdAt: "desc" },
    { id: "desc" },
  ];
  const cursorArg = cursor ? { id: cursor.id } : undefined;
  const skip = cursor ? 1 : 0;
  return { take, orderBy, cursor: cursorArg, skip } as const;
}
