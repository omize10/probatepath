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
        variant === "default" && "bg-[#1e3a8a] text-white",
        variant === "outline" && "border border-[#d7def0] text-[#1e3a8a]",
        className
      )}
      {...props}
    />
  );
}
