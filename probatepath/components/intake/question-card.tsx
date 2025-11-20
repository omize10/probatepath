import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type HelperBlock = {
  title: string;
  body: string;
};

interface QuestionCardProps {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
  note?: string;
  why?: string;
  where?: string;
  examples?: string;
  helpers?: HelperBlock[];
}

export function QuestionCard({ title, description, children, className, note, why, where, examples, helpers }: QuestionCardProps) {
  const computedHelpers: HelperBlock[] = [];
  if (why) computedHelpers.push({ title: "Why we ask this", body: why });
  if (where) computedHelpers.push({ title: "Where you find this", body: where });
  if (examples) computedHelpers.push({ title: "Examples", body: examples });
  const mergedHelpers = helpers ? [...computedHelpers, ...helpers] : computedHelpers;

  return (
    <section className={cn("space-y-5 rounded-3xl border border-[color:var(--border-muted)] bg-white p-6 shadow-[0_30px_90px_-60px_rgba(15,23,42,0.35)]", className)}>
      <div>
        <p className="text-lg font-semibold text-[color:var(--ink)]">{title}</p>
        {description ? <p className="mt-1 text-sm text-[color:var(--ink-muted)]">{description}</p> : null}
      </div>
      <div className="space-y-4">{children}</div>
      {note ? <p className="rounded-2xl bg-[color:var(--bg-muted)]/60 p-3 text-xs text-[color:var(--ink-muted)]">{note}</p> : null}
      {mergedHelpers.length ? (
        <div className="divide-y divide-[color:var(--border-muted)] border-t border-[color:var(--border-muted)] pt-4">
          {mergedHelpers.map((helper) => (
            <details key={helper.title} className="group space-y-2 py-3 text-sm text-[color:var(--ink-muted)]">
              <summary className="flex cursor-pointer items-center justify-between text-sm font-semibold text-[color:var(--brand)] outline-none marker:hidden">
                {helper.title}
                <span className="text-xs uppercase tracking-[0.35em] text-[color:var(--ink-muted)] group-open:text-[color:var(--brand)]">Hide</span>
              </summary>
              <p>{helper.body}</p>
            </details>
          ))}
        </div>
      ) : null}
    </section>
  );
}
