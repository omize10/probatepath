import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type SummaryItem = {
  label: string;
  value: ReactNode;
};

type StepSummaryCardProps = {
  title: string;
  description?: string;
  items?: SummaryItem[];
  children?: ReactNode;
  footer?: ReactNode;
  muted?: boolean;
};

export function StepSummaryCard({ title, description, items, children, footer, muted }: StepSummaryCardProps) {
  return (
    <div
      className={cn(
        "rounded-[32px] border border-[color:var(--border-muted)] p-6",
        muted ? "bg-[color:var(--bg-muted)]/60" : "bg-[color:var(--bg-surface)]",
      )}
    >
      <div className="space-y-2">
        <h3 className="font-serif text-xl text-[color:var(--ink)]">{title}</h3>
        {description ? <p className="text-sm text-[color:var(--ink-muted)]">{description}</p> : null}
      </div>
      {items && items.length > 0 ? (
        <dl className="mt-4 space-y-3">
          {items.map((item) => (
            <div key={item.label} className="flex flex-col gap-1 border-b border-dashed border-[color:var(--border-muted)] pb-3 last:border-none last:pb-0">
              <dt className="text-xs font-semibold uppercase tracking-[0.3em] text-[color:var(--ink-muted)]">
                {item.label}
              </dt>
              <dd className="text-sm text-[color:var(--ink)]">{item.value || <span className="text-[color:var(--ink-muted)]">Not provided yet</span>}</dd>
            </div>
          ))}
        </dl>
      ) : null}
      {children ? <div className="mt-4 space-y-2 text-sm text-[color:var(--ink-muted)]">{children}</div> : null}
      {footer ? <div className="mt-4">{footer}</div> : null}
    </div>
  );
}
