"use client";

import { useState, useEffect, useCallback } from "react";
import { PortalShell } from "@/components/portal/PortalShell";

type Notification = {
  id: string;
  type: string;
  title: string;
  body: string;
  href: string | null;
  readAt: string | null;
  createdAt: string;
};

const TYPE_LABELS: Record<string, string> = {
  document_ready: "Document",
  countdown_milestone: "Countdown",
  action_required: "Action needed",
  status_update: "Status",
  system: "System",
};

const TYPE_COLORS: Record<string, string> = {
  document_ready: "bg-green-100 text-green-800",
  countdown_milestone: "bg-purple-100 text-purple-800",
  action_required: "bg-amber-100 text-amber-800",
  status_update: "bg-blue-100 text-blue-800",
  system: "bg-gray-100 text-slate-700",
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications");
      if (!res.ok) return;
      const data = await res.json();
      setNotifications(data.notifications ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const markRead = async (id: string) => {
    await fetch("/api/notifications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "markRead", id }),
    });
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, readAt: new Date().toISOString() } : n))
    );
  };

  const markAllRead = async () => {
    await fetch("/api/notifications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "markAllRead" }),
    });
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, readAt: n.readAt ?? new Date().toISOString() }))
    );
  };

  const unreadCount = notifications.filter((n) => !n.readAt).length;

  return (
    <PortalShell
      title="Notifications"
      description={unreadCount > 0 ? `${unreadCount} unread` : "All caught up"}
      eyebrow="Updates"
      actions={
        unreadCount > 0 ? (
          <button
            onClick={markAllRead}
            className="inline-flex items-center rounded-full border border-[color:var(--border-muted)] px-4 py-2 text-sm font-semibold text-[color:var(--ink)] transition hover:border-[color:var(--brand)] hover:text-[color:var(--brand)]"
          >
            Mark all as read
          </button>
        ) : undefined
      }
    >
      {loading ? (
        <div className="text-center py-12 text-sm text-slate-700">Loading notifications...</div>
      ) : notifications.length === 0 ? (
        <div className="rounded-2xl border border-[color:var(--border-muted)] bg-white p-8 text-center">
          <svg className="mx-auto h-10 w-10 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <p className="mt-3 text-sm text-slate-600">No notifications yet. We'll notify you when something needs your attention.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => {
            const isUnread = !n.readAt;
            return (
              <div
                key={n.id}
                className={`rounded-xl border overflow-hidden transition ${
                  isUnread
                    ? "border-[color:var(--brand)]/20 bg-blue-50/30"
                    : "border-[color:var(--border-muted)] bg-white"
                }`}
              >
                <div className="flex items-start gap-3 px-4 py-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium ${TYPE_COLORS[n.type] ?? TYPE_COLORS.system}`}>
                        {TYPE_LABELS[n.type] ?? "Update"}
                      </span>
                      <span className="text-[10px] text-slate-700">
                        {new Date(n.createdAt).toLocaleDateString("en-CA", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
                      </span>
                      {isUnread && <span className="h-2 w-2 rounded-full bg-[color:var(--brand)]" />}
                    </div>
                    <p className={`text-sm ${isUnread ? "font-semibold text-[color:var(--ink)]" : "text-slate-700"}`}>
                      {n.title}
                    </p>
                    <p className="text-xs text-slate-600 mt-0.5">{n.body}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {n.href && (
                      <a
                        href={n.href}
                        className="text-xs font-medium text-[color:var(--brand)] hover:underline"
                      >
                        View
                      </a>
                    )}
                    {isUnread && (
                      <button
                        onClick={() => markRead(n.id)}
                        className="text-xs text-slate-600 hover:text-slate-700"
                      >
                        Dismiss
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </PortalShell>
  );
}
