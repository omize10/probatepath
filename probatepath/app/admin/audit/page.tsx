import React from "react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import AuditFeed, { type AuditItem } from "./AuditFeed";

function getAdminEmails() {
  const raw = process.env.ADMIN_EMAILS;
  if (!raw) return [];
  return raw.split(",").map((e) => e.trim().toLowerCase()).filter(Boolean);
}

export default async function AdminAuditPage() {
  const session = await auth();
  const adminEmails = getAdminEmails();
  const email = session?.user?.email?.toLowerCase();
  if (!email || (adminEmails.length > 0 && !adminEmails.includes(email))) {
    // Redirect to sign-in with next param
    redirect(`/login?next=/admin/audit`);
  }

  const limit = 50;
  // Fetch one extra to determine if there is a next cursor
  const rows = await prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: limit + 1,
    include: { user: true },
  });

  let nextCursor: string | null = null;
  const itemsRaw = rows;
  if (itemsRaw.length > limit) {
    const last = itemsRaw.pop()!;
    nextCursor = last.id;
  }

  const items: AuditItem[] = itemsRaw.map((it: any) => ({
    id: it.id,
    createdAt: it.createdAt.toISOString(),
    action: it.action,
    user: it.user ? { id: it.user.id, email: it.user.email } : null,
    matterId: it.matterId ?? null,
    ip: it.ip ?? null,
    ua: it.ua ?? null,
    meta: it.meta ?? null,
  }));

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Audit log</h1>
      <AuditFeed initialItems={items} initialNextCursor={nextCursor} />
    </div>
  );
}
