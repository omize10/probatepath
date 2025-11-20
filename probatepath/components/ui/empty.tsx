import type { ReactNode } from "react";

interface EmptyStateProps {
  title: string;
  description: string;
  action?: ReactNode;
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="rounded-3xl border border-[#1c2a44]/20 bg-white/90 p-8 text-center shadow-[0_40px_120px_-90px_rgba(15,23,42,0.8)]">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#eef2ff] text-[#1e3a8a]">
        <span className="text-lg font-semibold">i</span>
      </div>
      <div className="mt-6 space-y-2">
        <p className="text-lg font-semibold text-[#0f172a]">{title}</p>
        <p className="text-sm text-[#4b5563]">{description}</p>
      </div>
      {action ? <div className="mt-6 flex justify-center">{action}</div> : null}
    </div>
  );
}
