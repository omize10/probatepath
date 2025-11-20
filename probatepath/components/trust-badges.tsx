import { Check } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface TrustBadgesProps {
  items: Array<{ label: string; icon?: ReactNode } | string>;
  className?: string;
}

export function TrustBadges({ items, className }: TrustBadgesProps) {
  return (
    <div
      className={cn(
        "grid gap-4 rounded-3xl border border-[color:var(--border-muted)] bg-[color:var(--bg-surface)] p-6 text-sm text-[#333333] sm:grid-cols-2 lg:grid-cols-4",
        className,
      )}
    >
      {items.map((item, index) => {
        const content = typeof item === "string" ? { label: item } : item;
        return (
          <div key={typeof content.label === "string" ? content.label : index} className="flex items-start gap-3">
            <span className="mt-0.5 inline-flex h-6 w-6 flex-none items-center justify-center rounded-full border border-[color:var(--border-muted)] bg-[#f0f3f7] text-[color:var(--brand)]">
              {content.icon ?? <Check className="h-3.5 w-3.5" />}
            </span>
            <span>{content.label}</span>
          </div>
        );
      })}
    </div>
  );
}
