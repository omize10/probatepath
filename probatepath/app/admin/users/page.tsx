import React from "react";
import { requireAdminSession } from "@/lib/admin/auth";
import { prisma } from "@/lib/prisma";
import { encodeCursor } from "@/lib/admin/pagination";
import UsersFeed, { type UserItem } from "./UsersFeed";
import { redirect } from "next/navigation";

export default async function UsersPage() {
  const maybe = await requireAdminSession();
  if ((maybe as unknown as Response)?.status === 403) redirect(`/login?next=/admin/users`);

  const limit = 50;
  const rows = await prisma.user.findMany({ orderBy: { createdAt: "desc" }, take: limit + 1 });
  let nextCursor: string | null = null;
  const itemsRaw = rows;
  if (itemsRaw.length > limit) {
    const last = itemsRaw.pop()!;
    nextCursor = encodeCursor({ id: last.id, createdAt: last.createdAt.toISOString() });
  }

itemsRaw.map((u: any)
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Users</h1>
      <UsersFeed initialItems={items} initialNextCursor={nextCursor} />
    </div>
  );
}
