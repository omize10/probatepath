import Link from "next/link";
import type { Metadata } from "next";
import { DevTools } from "./DevTools";

export const metadata: Metadata = {
  title: "Dev Tools - Operations",
  description: "Development and testing tools for ProbateDesk",
};

export default function DevToolsPage() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-[0.3em] text-[color:var(--ink-muted)]">Operations</p>
        <h1 className="font-serif text-4xl text-[color:var(--ink)]">Dev Tools</h1>
        <p className="text-sm text-[color:var(--ink-muted)]">Test email, SMS, cron jobs, and other system functions.</p>
      </div>

      <DevTools />

      <Link href="/ops" className="inline-flex items-center text-sm text-[color:var(--brand)] hover:underline">
        ← Back to dashboard
      </Link>
    </div>
  );
}
