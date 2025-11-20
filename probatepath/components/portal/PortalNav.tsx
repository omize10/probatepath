"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { usePortalStore } from "@/lib/portal/store";

const NAV_LINKS = [
  { href: "/portal", label: "Dashboard" },
  { href: "/portal/process", label: "My process" },
  { href: "/portal/how-to-assemble", label: "How to assemble" },
  { href: "/portal/intake", label: "Intake" },
  { href: "/portal/documents", label: "Documents" },
  { href: "/portal/help", label: "Help" },
];

export function PortalNav() {
  const pathname = usePathname();
  const { progress, ready } = usePortalStore((state) => ({
    progress: state.draft.progress,
    ready: state.ready,
  }));

  const displayStatus = ready ? `Draft saved · ${progress}%` : "Syncing";

  return (
    <div className="rounded-3xl border border-[color:var(--border-muted)] bg-[color:var(--bg-surface)] p-5 shadow-[0_25px_80px_-60px_rgba(15,23,42,0.18)]">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3 text-sm font-semibold text-[color:var(--ink)]">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[color:var(--brand-orange)] text-[color:var(--ink)]">
            PP
          </span>
          ProbatePath portal
        </div>
        <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.25em] text-[color:var(--ink-muted)]">
          <span className="rounded-full border border-[color:var(--border-muted)] bg-[color:var(--bg-muted)] px-4 py-1">
            {displayStatus}
          </span>
          <span className="hidden rounded-full border border-[color:var(--border-muted)] bg-[color:var(--bg-muted)] px-3 py-1 sm:inline-flex">
            YOU
          </span>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {NAV_LINKS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-medium transition",
                isActive
                  ? "bg-[color:var(--bg-muted)] text-[color:var(--brand-navy)]"
                  : "text-[color:var(--ink-muted)] hover:text-[color:var(--brand-navy)] hover:bg-[color:var(--bg-muted)]"
              )}
              aria-current={isActive ? "page" : undefined}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
