"use client";

import React, { useState } from "react";

export type UserItem = {
  id: string;
  email: string;
  name: string | null;
  role: string;
  createdAt: string; // ISO
};

export default function UsersFeed({ initialItems, initialNextCursor }: { initialItems: UserItem[]; initialNextCursor: string | null; }) {
  const [items, setItems] = useState<UserItem[]>(initialItems);
  const [nextCursor, setNextCursor] = useState<string | null>(initialNextCursor);
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState<string>("");
  const [searching, setSearching] = useState(false);

  async function loadMore() {
    if (!nextCursor || loading) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/users?limit=50&cursor=${encodeURIComponent(nextCursor)}${q ? `&q=${encodeURIComponent(q)}` : ""}`);
      if (!res.ok) {
        console.error("Failed to load users", await res.text());
        setLoading(false);
        return;
      }
      const data = await res.json();
      const newItems: UserItem[] = data.items.map((u: any) => ({ id: u.id, email: u.email, name: u.name ?? null, role: u.role, createdAt: new Date(u.createdAt).toISOString() }));
      setItems((p) => [...p, ...newItems]);
      setNextCursor(data.nextCursor ?? null);
    } catch (err) {
      console.error("Failed to fetch users", err);
    } finally {
      setLoading(false);
    }
  }

  async function doSearch(e?: React.FormEvent) {
    e?.preventDefault();
    setSearching(true);
    try {
      const res = await fetch(`/api/admin/users?limit=50${q ? `&q=${encodeURIComponent(q)}` : ""}`);
      if (!res.ok) {
        console.error("Search failed", await res.text());
        setSearching(false);
        return;
      }
      const data = await res.json();
      const newItems: UserItem[] = data.items.map((u: any) => ({ id: u.id, email: u.email, name: u.name ?? null, role: u.role, createdAt: new Date(u.createdAt).toISOString() }));
      setItems(newItems);
      setNextCursor(data.nextCursor ?? null);
    } catch (err) {
      console.error("Search error", err);
    } finally {
      setSearching(false);
    }
  }

  async function updateRole(userId: string, role: string) {
    try {
      const res = await fetch(`/api/admin/users/${encodeURIComponent(userId)}/role`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ role }) });
      if (!res.ok) {
        console.error("Failed to update role", await res.text());
        return;
      }
      setItems((prev) => prev.map((u) => (u.id === userId ? { ...u, role } : u)));
    } catch (err) {
      console.error("Role update error", err);
    }
  }

  return (
    <div>
      <form onSubmit={doSearch} className="mb-4">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by email or name" className="border px-2 py-1 mr-2" />
        <button type="submit" className="px-2 py-1 bg-gray-100">Search</button>
      </form>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left">
              <th className="px-3 py-2">Email</th>
              <th className="px-3 py-2">Name</th>
              <th className="px-3 py-2">Role</th>
              <th className="px-3 py-2">Created</th>
              <th className="px-3 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((u) => (
              <tr key={u.id} className="border-t">
                <td className="px-3 py-2 align-top">{u.email}</td>
                <td className="px-3 py-2 align-top">{u.name ?? "-"}</td>
                <td className="px-3 py-2 align-top">{u.role}</td>
                <td className="px-3 py-2 align-top">{new Date(u.createdAt).toISOString()}</td>
                <td className="px-3 py-2 align-top">
                  <select value={u.role} onChange={(e) => updateRole(u.id, e.target.value)}>
                    <option value="USER">USER</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {nextCursor ? (
        <div className="mt-4">
          <button onClick={loadMore} disabled={loading} className="rounded px-3 py-2 bg-gray-100">{loading ? "Loading…" : "Load more"}</button>
        </div>
      ) : null}
    </div>
  );
}
