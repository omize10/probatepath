import type { ReactNode } from "react";
import Link from "next/link";
import { cookies } from "next/headers";

export default async function OpsLayout({ children }: { children: ReactNode }) {
  const cookieStore = await cookies();
  const hasPass = cookieStore.get("ops_auth")?.value === "1";

  if (!hasPass) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center pb-16">
        <div className="w-full max-w-md space-y-4 rounded-3xl border border-[color:var(--border-muted)] bg-white p-6 shadow-[0_25px_80px_-60px_rgba(15,23,42,0.22)]">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.3em] text-[color:var(--ink-muted)]">Restricted</p>
            <h1 className="font-serif text-2xl text-[color:var(--ink)]">Access denied</h1>
            <p className="text-sm text-[color:var(--ink-muted)]">Enter the ops password from the footer prompt to continue.</p>
          </div>
          <div className="text-sm text-[color:var(--ink-muted)]">Return to the homepage and use the "Ops" link.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-16">
      <nav className="flex gap-4 border-b border-[color:var(--border-muted)] pb-4">
        <Link href="/ops" className="text-sm font-semibold text-[color:var(--brand)] hover:text-[color:var(--accent-dark)]">
          Cases
        </Link>
        <Link href="/ops/callbacks" className="text-sm font-semibold text-[color:var(--brand)] hover:text-[color:var(--accent-dark)]">
          Callbacks
        </Link>
        <Link href="/ops/calendar" className="text-sm font-semibold text-[color:var(--brand)] hover:text-[color:var(--accent-dark)]">
          Calendar
        </Link>
        <Link href="/ops/messages" className="text-sm font-semibold text-[color:var(--brand)] hover:text-[color:var(--accent-dark)]">
          Messages
        </Link>
        <Link href="/ops/dev" className="text-sm font-semibold text-purple-600 hover:text-purple-800">
          Dev Tools
        </Link>
      </nav>
      {children}
    </div>
  );
}
