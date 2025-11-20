import type { ReactNode } from "react";
import { MediaCard } from "@/components/portal/MediaCard";

interface ChecklistItemProps {
  title: string;
  description: string;
  learnMoreHref: string;
  media: {
    image: string;
    alt: string;
    caption: string;
    tips: string[];
  };
  actions?: ReactNode;
  children?: ReactNode;
  completed?: boolean;
}

export function ChecklistItem({ title, description, learnMoreHref, media, actions, children, completed }: ChecklistItemProps) {
  return (
    <div className="portal-card grid gap-6 p-6 lg:grid-cols-[0.6fr_0.4fr]">
      <div className="space-y-5">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[color:var(--ink-muted)]">{completed ? "Completed" : "In progress"}</p>
          <h3 className="font-serif text-2xl text-[color:var(--ink)]">{title}</h3>
          <p className="text-sm text-[color:var(--ink-muted)]">{description}</p>
          <a
            href={learnMoreHref}
            target="_blank"
            rel="noreferrer"
            className="text-xs font-semibold uppercase tracking-[0.3em] text-[color:var(--brand-navy)] hover:text-[color:var(--brand-ink)]"
          >
            Learn more
          </a>
        </div>
        <div className="space-y-4 text-sm text-[color:var(--ink-muted)]">{children}</div>
        {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
      </div>
      <MediaCard image={media.image} alt={media.alt} caption={media.caption} tips={media.tips} />
    </div>
  );
}
