'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";

interface ContextHelperProps {
  title: string;
  body: string;
  tips?: string[];
}

export function ContextHelper({ title, body, tips = [] }: ContextHelperProps) {
  const [open, setOpen] = useState(false);

  return (
    <aside className="rounded-3xl border border-[color:var(--border-muted)] bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-[color:var(--ink)]">{title}</p>
        <Button variant="ghost" className="text-xs font-semibold uppercase tracking-[0.35em]" onClick={() => setOpen((prev) => !prev)}>
          {open ? "Hide" : "Learn more"}
        </Button>
      </div>
      {open ? (
        <div className="mt-3 space-y-3 text-sm text-[color:var(--ink-muted)]">
          <p>{body}</p>
          {tips.length ? (
            <ul className="list-disc space-y-1 pl-5">
              {tips.map((tip) => (
                <li key={tip}>{tip}</li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}
    </aside>
  );
}
