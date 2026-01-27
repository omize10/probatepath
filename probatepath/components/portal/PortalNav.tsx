"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { NotificationBell } from "@/components/portal/notifications/NotificationBell";

const NAV_LINKS = [
  { href: "/portal", label: "Home" },
  { href: "/portal/documents", label: "Documents" },
  { href: "/portal/help", label: "Help" },
];

type PortalNavProps = {
  statusLabel: string;
  pathType?: "probate" | "administration";
};

export function PortalNav({ statusLabel, pathType = "probate" }: PortalNavProps) {
  const pathname = usePathname();
  void statusLabel; // status handled elsewhere; keep prop for compatibility
  const workspaceLabel = pathType === "administration" ? "Your guided court workspace" : "Your guided probate workspace";
  const normalizedPath = pathname ?? "";

  const isDocuments = normalizedPath === "/portal/documents" || normalizedPath.startsWith("/portal/documents/");
  const isHelp = normalizedPath === "/portal/help" || normalizedPath.startsWith("/portal/help/");
  const isHome = normalizedPath.startsWith("/portal") && !isDocuments && !isHelp;

  return (
    <div className="border-b bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex flex-col items-start leading-none">
            <span className="text-xl font-bold tracking-tight sm:text-2xl" style={{ color: 'var(--brand)' }}>
              ProbateDesk<span className="text-[#445266]">.com</span>
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#445266]">
              Done
            </span>
          </Link>
          <div className="leading-tight">
            <p className="text-sm font-semibold text-[color:var(--ink)] sm:text-base">Portal</p>
            <p className="text-xs text-slate-600">{workspaceLabel}</p>
          </div>
        </div>
        <nav className="flex items-center gap-4 text-sm font-medium">
          {NAV_LINKS.map((item) => {
            const isActive =
              item.href === "/portal"
                ? isHome
                : item.href === "/portal/documents"
                  ? isDocuments
                  : isHelp;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "border-b-2 border-transparent pb-1 text-slate-600 transition hover:text-[color:var(--ink)]",
                  isActive && "border-[color:var(--ink)] text-[color:var(--ink)]",
                )}
                aria-current={isActive ? "page" : undefined}
              >
                {item.label}
              </Link>
            );
          })}
          <NotificationBell />
        </nav>
      </div>
    </div>
  );
}
