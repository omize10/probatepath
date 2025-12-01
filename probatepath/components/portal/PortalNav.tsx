"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/portal", label: "Overview" },
  { href: "/portal/intake", label: "Intake wizard" },
  { href: "/portal/steps", label: "Your Steps" },
  { href: "/portal/info", label: "Your Info" },
  { href: "/portal/documents", label: "Documents" },
  { href: "/portal/help", label: "Help" },
];

type PortalNavProps = {
  statusLabel: string;
};

export function PortalNav({ statusLabel }: PortalNavProps) {
  const pathname = usePathname();
  const displayStatus = statusLabel || "Start intake";

  return (
    <div className="rounded-3xl border border-[color:var(--border-muted)] bg-[color:var(--bg-surface)] p-6 shadow-[0_25px_80px_-60px_rgba(15,23,42,0.18)]">
      <div className="space-y-3">
        <div className="flex items-center gap-3 text-sm font-semibold text-[color:var(--ink)]">
          <Image src="/images/PPlogo.png" alt="ProbatePath" width={360} height={90} className="h-[84px] w-auto" priority />
          <span className="text-xs uppercase tracking-[0.3em] text-[color:var(--ink-muted)]">Portal</span>
        </div>
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[color:var(--ink-muted)]">{displayStatus}</p>
      </div>
      <nav className="mt-6 space-y-1 text-sm font-medium text-[color:var(--ink-muted)]">
        {NAV_LINKS.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/portal" && pathname.startsWith(`${item.href}/`));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center justify-between rounded-2xl px-4 py-3 transition",
                isActive
                  ? "bg-[color:var(--bg-muted)] text-[color:var(--brand-navy)]"
                  : "text-[color:var(--ink-muted)] hover:text-[color:var(--brand-navy)] hover:bg-[color:var(--bg-muted)]",
              )}
              aria-current={isActive ? "page" : undefined}
            >
              <span>{item.label}</span>
              <span aria-hidden="true" className="text-xs">
                →
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
