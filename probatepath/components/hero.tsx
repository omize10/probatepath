import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { Button, type ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type HeroAction = {
  label: string;
  href: string;
  variant?: ButtonProps["variant"];
};

type HeroImage = {
  src: string;
  alt: string;
  width: number;
  height: number;
};

interface HeroProps {
  eyebrow?: string;
  title: string;
  description: string;
  primaryAction: HeroAction;
  secondaryAction?: HeroAction;
  image?: HeroImage;
  className?: string;
  children?: ReactNode;
}

export function Hero({
  eyebrow,
  title,
  description,
  primaryAction,
  secondaryAction,
  image,
  className,
  children,
}: HeroProps) {
  return (
    <section
      className={cn(
        "grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center",
        className,
      )}
    >
      <div className="space-y-8">
        {eyebrow ? (
          <span className="inline-flex items-center rounded-full border border-white/15 bg-white/5 px-4 py-1 text-xs font-semibold uppercase tracking-[0.32em] text-slate-200">
            {eyebrow}
          </span>
        ) : null}
        <h1 className="font-serif text-4xl text-white sm:text-5xl">{title}</h1>
        <p className="max-w-xl text-base leading-relaxed text-slate-300">{description}</p>
        <div className="flex flex-wrap items-center gap-4">
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
      {image ? (
        <div className="relative">
          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0b1524] shadow-[0_45px_120px_-60px_rgba(0,0,0,0.85)]">
            <Image
              src={image.src}
              alt={image.alt}
              width={image.width}
              height={image.height}
              className="h-full w-full object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-br from-black/15 via-transparent to-black/35" />
          </div>
        </div>
      ) : null}
    </section>
  );
}
