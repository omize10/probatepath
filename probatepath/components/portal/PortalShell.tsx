"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PortalShellProps {
  title: string;
  description?: string;
  eyebrow?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function PortalShell({
  title,
  description,
  eyebrow = "BC-focused process",
  actions,
  children,
  className,
}: PortalShellProps) {
  return (
    <section className={cn("space-y-10", className)}>
      <div className="rounded-3xl border border-[color:var(--border-muted)] bg-white px-6 py-8 text-[color:var(--ink)] shadow-[0_25px_80px_-60px_rgba(15,23,42,0.25)] sm:px-10">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-4">
            {eyebrow ? <span className="portal-badge text-[color:var(--ink-muted)]">{eyebrow}</span> : null}
            <div className="space-y-3">
              <h1 className="font-serif text-3xl leading-tight sm:text-4xl">{title}</h1>
              {description ? <p className="text-base text-[color:var(--ink-muted)]">{description}</p> : null}
            </div>
          </div>
          {actions ? <div className="flex flex-wrap gap-3 text-sm">{actions}</div> : null}
        </div>
      </div>
      <div className="space-y-8">{children}</div>
    </section>
  );
}
