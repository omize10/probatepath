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
        "relative overflow-hidden rounded-3xl border border-[#dbe3f4] bg-gradient-to-br from-[#eef2ff] via-white to-[#fef8f4] p-8 text-[#0f172a] sm:p-10",
        className,
      )}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(30,58,138,0.16),_transparent_55%)]" aria-hidden />
      <div className="relative space-y-5">
        {eyebrow ? (
          <span className="inline-flex items-center rounded-full border border-[#c7d3ea] bg-white/70 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[#1e3a8a]">
            {eyebrow}
          </span>
        ) : null}
        <div className="space-y-3">
          <h3 className="font-serif text-2xl text-[#0f172a] sm:text-3xl">{title}</h3>
          {description ? <p className="max-w-2xl text-sm leading-relaxed text-[#495067]">{description}</p> : null}
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
