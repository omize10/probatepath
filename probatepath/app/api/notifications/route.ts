import { NextResponse } from "next/server";
import { getServerAuth } from "@/lib/auth";
import { getUserNotifications, getUnreadCount, markAsRead, markAllAsRead } from "@/lib/notifications";

export async function GET() {
  const { session } = await getServerAuth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [notifications, unreadCount] = await Promise.all([
    getUserNotifications(session.user.id, 50),
    getUnreadCount(session.user.id),
  ]);

  return NextResponse.json({
    notifications: notifications.map((n) => ({
      id: n.id,
      type: n.type,
      title: n.title,
      body: n.body,
      href: n.href,
      readAt: n.readAt?.toISOString() ?? null,
      createdAt: n.createdAt.toISOString(),
    })),
    unreadCount,
  });
}

export async function POST(request: Request) {
  const { session } = await getServerAuth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();

  if (body.action === "markRead" && body.id) {
    await markAsRead(body.id, session.user.id);
    return NextResponse.json({ ok: true });
  }

  if (body.action === "markAllRead") {
    await markAllAsRead(session.user.id);
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
