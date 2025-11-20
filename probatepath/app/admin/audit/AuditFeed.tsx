"use client";

import React, { useState } from "react";

export type AuditItem = {
  id: string;
  createdAt: string; // ISO
  action: string;
  user: { id: string; email: string } | null;
  matterId: string | null;
  ip: string | null;
  ua: string | null;
  meta: unknown;
};

export default function AuditFeed({
  initialItems,
  initialNextCursor,
}: {
  initialItems: AuditItem[];
  initialNextCursor: string | null;
}) {
  const [items, setItems] = useState<AuditItem[]>(initialItems);
  const [nextCursor, setNextCursor] = useState<string | null>(initialNextCursor);
  const [loading, setLoading] = useState(false);

  async function loadMore() {
    if (!nextCursor || loading) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/audit?type=security&limit=50&cursor=${encodeURIComponent(nextCursor)}`);
      if (!res.ok) {
        console.error("Failed to load audit page", await res.text());
        setLoading(false);
        return;
      }
      const data = await res.json();
      if (!data || !Array.isArray(data.items)) {
        console.error("Unexpected audit API response", data);
        setLoading(false);
        return;
      }
      const newItems: AuditItem[] = data.items.map((it: any) => ({
        id: it.id,
        createdAt: it.createdAt,
        action: it.action,
        user: it.user ?? null,
        matterId: it.matterId ?? null,
        ip: it.ip ?? null,
        ua: it.ua ?? null,
        meta: it.meta ?? null,
      }));
      setItems((prev) => [...prev, ...newItems]);
      setNextCursor(data.nextCursor ?? null);
    } catch (err) {
      console.error("Failed to fetch audit logs", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left">
              <th className="px-3 py-2">Date</th>
              <th className="px-3 py-2">User</th>
              <th className="px-3 py-2">Action</th>
              <th className="px-3 py-2">Matter</th>
              <th className="px-3 py-2">IP</th>
              <th className="px-3 py-2">UA</th>
              <th className="px-3 py-2">Meta</th>
            </tr>
          </thead>
          <tbody>
            {items.map((it) => (
              <tr key={it.id} className="border-t">
                <td className="px-3 py-2 align-top">{new Date(it.createdAt).toISOString()}</td>
                <td className="px-3 py-2 align-top">{it.user ? it.user.email : "-"}</td>
                <td className="px-3 py-2 align-top">{it.action}</td>
                <td className="px-3 py-2 align-top">{it.matterId ?? "-"}</td>
                <td className="px-3 py-2 align-top">{it.ip ?? "-"}</td>
                <td className="px-3 py-2 align-top"><code className="break-words">{it.ua ?? "-"}</code></td>
                <td className="px-3 py-2 align-top"><pre className="whitespace-pre-wrap">{JSON.stringify(it.meta ?? null)}</pre></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {nextCursor ? (
        <div className="mt-4">
          <button
            onClick={loadMore}
            disabled={loading}
            className="rounded px-3 py-2 bg-gray-100"
          >
            {loading ? "Loading…" : "Load more"}
          </button>
        </div>
      ) : null}
    </div>
  );
}
