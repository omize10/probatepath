'use client';

import { forwardRef } from "react";
import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export type CardProps = HTMLAttributes<HTMLDivElement>;

export const Card = forwardRef<HTMLDivElement, CardProps>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "group relative overflow-hidden rounded-3xl border border-[color:var(--border-muted)] bg-[color:var(--bg-surface)] p-8 shadow-[0_35px_100px_-60px_rgba(15,23,42,0.25)] transition-all duration-300",
      "hover:-translate-y-0.5 hover:border-[color:var(--brand)] hover:shadow-[0_40px_120px_-70px_rgba(15,23,42,0.35)]",
      className
    )}
    {...props}
  />
));

Card.displayName = "Card";

export const CardHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("mb-6 space-y-3", className)} {...props} />
  )
);

CardHeader.displayName = "CardHeader";

export const CardTitle = forwardRef<HTMLHeadingElement, HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3 ref={ref} className={cn("font-serif text-2xl text-[color:var(--brand)]", className)} {...props} />
  )
);

CardTitle.displayName = "CardTitle";

export const CardDescription = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      className={cn("text-sm leading-relaxed text-[#333333]", className)}
      {...props}
    />
  )
);

CardDescription.displayName = "CardDescription";

export const CardContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("space-y-4", className)} {...props} />
  )
);

CardContent.displayName = "CardContent";

export const CardFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("mt-8 flex items-center gap-3", className)} {...props} />
  )
);

CardFooter.displayName = "CardFooter";
