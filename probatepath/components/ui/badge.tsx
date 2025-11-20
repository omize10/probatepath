"use client";

import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: "default" | "outline";
};

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium uppercase tracking-[0.24em]",
        variant === "default" && "bg-[color:var(--brand)] text-white",
        variant === "outline" && "border border-[color:var(--border-muted)] text-[color:var(--brand)]",
        className
      )}
      {...props}
    />
  );
}
