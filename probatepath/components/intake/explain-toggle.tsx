'use client';

import { useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface ExplainToggleProps {
  label?: string;
  children: ReactNode;
}

export function ExplainToggle({ label = "How do I know this?", children }: ExplainToggleProps) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-2xl border border-[color:var(--border-muted)] bg-[color:var(--bg-muted)]">
      <button
        type="button"
        className="flex w-full items-center justify-between px-4 py-3 text-sm font-semibold text-[color:var(--brand-navy)]"
        onClick={() => setOpen((prev) => !prev)}
      >
        {label}
        <ChevronDown className={cn("h-4 w-4 transition", open && "rotate-180")} />
      </button>
      {open ? (
        <div className="border-t border-[color:var(--border-muted)] px-4 py-3 text-sm text-[color:var(--ink-muted)]">{children}</div>
      ) : null}
    </div>
  );
}
