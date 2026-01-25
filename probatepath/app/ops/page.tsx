import Link from "next/link";
import type { Metadata } from "next";
import { portalStatusLabels } from "@/lib/portal/status";
import { listCases } from "@/lib/cases";
import { DeleteCaseButton } from "./DeleteCaseButton";

export const metadata: Metadata = {
  title: "Operations portal",
  description: "Staff dashboard for managing ProbateDesk cases.",
};

const dateFormatter = new Intl.DateTimeFormat("en-CA", { dateStyle: "medium" });

interface OpsPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function OpsPage({ searchParams }: OpsPageProps) {
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q : "";
  const cases = await listCases(q ? { q } : undefined);

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-[0.3em] text-[color:var(--ink-muted)]">Operations</p>
        <h1 className="font-serif text-4xl text-[color:var(--ink)]">Case dashboard</h1>
        <p className="text-sm text-[color:var(--ink-muted)]">Monitor every open file, jump to details, and keep portal statuses aligned with your prep work.</p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <form className="flex flex-wrap items-center gap-2">
          <input
            type="text"
            name="q"
            defaultValue={q}
            placeholder="Search case ID, name, or email"
            className="w-64 rounded-2xl border border-[color:var(--border-muted)] px-3 py-2 text-sm"
          />
          <button className="rounded-full bg-[color:var(--brand)] px-4 py-2 text-sm font-semibold text-white">Search</button>
        </form>
        <Link
          href="/ops/new-case"
          className="rounded-full bg-[color:var(--brand)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[color:var(--accent-dark)]"
        >
          + New Case
        </Link>
        {(process.env.NODE_ENV === "development" || process.env.NEXT_PUBLIC_DEV_MODE === "true") && (
          <Link
            href="/ops/dev"
            className="rounded-full border-2 border-dashed border-purple-400 bg-purple-50 px-4 py-2 text-sm font-semibold text-purple-700 transition hover:bg-purple-100"
          >
            Dev Tools
          </Link>
        )}
      </div>

      <div className="overflow-hidden rounded-3xl border border-[color:var(--border-muted)] bg-white shadow-[0_25px_80px_-60px_rgba(15,23,42,0.22)]">
        <div className="grid grid-cols-[2fr_2fr_auto_1fr_1fr_1fr_auto_auto] items-center gap-3 border-b border-[color:var(--border-muted)] px-4 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--ink-muted)] sm:px-6">
          <span>Case</span>
          <span>Email</span>
          <span>Type</span>
          <span>Status</span>
          <span>Created</span>
          <span>Updated</span>
          <span className="text-right">Open</span>
          <span></span>
        </div>

        {cases.length === 0 ? (
          <div className="px-6 py-10 text-sm text-[color:var(--ink-muted)]">
            No cases yet. Intake submissions will appear here automatically.
          </div>
        ) : (
          <div className="divide-y divide-[color:var(--border-muted)]">
            {cases.map((record) => (
              <div key={record.id} className="grid grid-cols-[2fr_2fr_auto_1fr_1fr_1fr_auto_auto] items-center gap-3 px-4 py-4 text-sm text-[color:var(--ink)] sm:px-6">
                <div className="truncate">
                  <p className="font-semibold">{record.user?.name || "Unnamed client"}</p>
                  <p className="text-xs text-[color:var(--ink-muted)]">
                    {record.caseCode ?? record.id.slice(0, 8)} • {record.draft?.decFullName ?? "Unknown deceased"}
                  </p>
                </div>
                <div className="truncate text-[color:var(--ink-muted)]">{record.user?.email ?? "No email"}</div>
                <div>
                  {record.pathType === "administration" ? (
                    <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800">
                      ADMIN
                    </span>
                  ) : (
                    <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-800">
                      PROBATE
                    </span>
                  )}
                </div>
                <div className="text-sm font-medium text-[color:var(--brand-navy)]">{portalStatusLabels[record.portalStatus]}</div>
                <div className="text-xs text-[color:var(--ink-muted)]">{dateFormatter.format(record.createdAt)}</div>
                <div className="text-xs text-[color:var(--ink-muted)]">{dateFormatter.format(record.updatedAt)}</div>
                <div className="text-right">
                  <Link
                    href={`/ops/cases/${record.id}`}
                    className="inline-flex items-center rounded-full bg-[color:var(--brand)] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[color:var(--accent-dark)] shadow-sm"
                  >
                    Open
                  </Link>
                </div>
                <div>
                  <DeleteCaseButton matterId={record.id} clientName={record.user?.name || "this case"} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
