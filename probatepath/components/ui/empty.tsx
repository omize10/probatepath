import type { ReactNode } from "react";

interface EmptyStateProps {
  title: string;
  description: string;
  action?: ReactNode;
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="rounded-3xl border border-[color:var(--border-muted)] bg-[color:var(--bg-surface)]/95 p-8 text-center shadow-[0_40px_120px_-90px_rgba(15,23,42,0.5)]">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#f0f3f7] text-[color:var(--brand)]">
        <span className="text-lg font-semibold">i</span>
      </div>
      <div className="mt-6 space-y-2">
        <p className="text-lg font-semibold text-[color:var(--brand)]">{title}</p>
        <p className="text-sm text-[#445266]">{description}</p>
      </div>
      {action ? <div className="mt-6 flex justify-center">{action}</div> : null}
    </div>
  );
}
