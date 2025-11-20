import { NextResponse } from "next/server";
import type { Session } from "next-auth";
import { auth } from "@/lib/auth";

export function isAdmin(session?: Session | null): boolean {
  if (!session || !session.user) return false;
  const role = (session.user as { role?: string }).role;
  if (role === "ADMIN") return true;
  const email = session.user.email?.toLowerCase();
  const raw = process.env.ADMIN_EMAILS;
  if (!raw) return false;
  const list = raw.split(",").map((e) => e.trim().toLowerCase()).filter(Boolean);
  return !!(email && list.includes(email));
}

export async function requireAdminSession() {
  const session = await auth();
  if (!isAdmin(session)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  return { session } as { session: Session };
}
