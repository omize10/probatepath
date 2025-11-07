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
        variant === "default" && "bg-[#ff6a00] text-[#050713]",
        variant === "outline" && "border border-white/20 text-slate-200",
        className
      )}
      {...props}
    />
  );
}
