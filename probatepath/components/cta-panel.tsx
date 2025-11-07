import Link from "next/link";
import type { ReactNode } from "react";
import { Button, type ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type CTAAction = {
  label: string;
  href: string;
  variant?: ButtonProps["variant"];
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
        "relative overflow-hidden rounded-3xl border border-white/15 bg-gradient-to-br from-[#1f1308] via-[#071021] to-[#071021] p-8 text-slate-200 sm:p-10",
        className,
      )}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,106,0,0.28),_transparent_55%)]" aria-hidden />
      <div className="relative space-y-5">
        {eyebrow ? (
          <span className="inline-flex items-center rounded-full border border-white/15 bg-black/30 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-200">
            {eyebrow}
          </span>
        ) : null}
        <div className="space-y-3">
          <h3 className="font-serif text-2xl text-white sm:text-3xl">{title}</h3>
          {description ? <p className="max-w-2xl text-sm leading-relaxed text-slate-300">{description}</p> : null}
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Button asChild size="lg" variant={primaryAction.variant}>
            <Link href={primaryAction.href}>{primaryAction.label}</Link>
          </Button>
          {secondaryAction ? (
            <Button
              asChild
              size="lg"
              variant={secondaryAction.variant ?? "ghost"}
              className={cn(
                secondaryAction.variant ? undefined : "border border-white/15",
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
