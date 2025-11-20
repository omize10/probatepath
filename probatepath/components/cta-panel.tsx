import Link from "next/link";
import type { ReactNode } from "react";
import { Button, type ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type CTAAction = {
  label: string;
  href: string;
  variant?: ButtonProps["variant"];
  className?: string;
};

interface CTAPanelProps {
  eyebrow?: string;
  title: string;
  description?: string;
  primaryAction: CTAAction;
  secondaryAction?: CTAAction;
  className?: string;
  children?: ReactNode;
}

export function CTAPanel({
  eyebrow,
  title,
  description,
  primaryAction,
  secondaryAction,
  className,
  children,
}: CTAPanelProps) {
  return (
    <div
      className={cn(
        "rounded-3xl border border-[color:var(--border-muted)] bg-[color:var(--bg-surface)] p-8 text-[color:var(--ink)] shadow-[0_30px_80px_-65px_rgba(15,26,42,0.25)] sm:p-10",
        className,
      )}
    >
      <div className="space-y-5">
        {eyebrow ? (
          <span className="inline-flex items-center rounded-full border border-[color:var(--border-muted)] bg-[#f0f3f7] px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--brand)]">
            {eyebrow}
          </span>
        ) : null}
        <div className="space-y-3">
          <h3 className="font-serif text-2xl text-[color:var(--brand)] sm:text-3xl">{title}</h3>
          {description ? <p className="max-w-2xl text-sm leading-relaxed text-[#333333]">{description}</p> : null}
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Button asChild size="lg" variant={primaryAction.variant} className={primaryAction.className}>
            <Link href={primaryAction.href}>{primaryAction.label}</Link>
          </Button>
          {secondaryAction ? (
            <Button
              asChild
              size="lg"
              variant={secondaryAction.variant ?? "ghost"}
              className={cn(
                secondaryAction.variant ? undefined : "border border-white/15",
                secondaryAction.className,
              )}
            >
              <Link href={secondaryAction.href}>{secondaryAction.label}</Link>
            </Button>
          ) : null}
        </div>
        {children}
      </div>
    </div>
  );
}
