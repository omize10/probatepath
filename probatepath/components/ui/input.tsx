'use client';

import { forwardRef } from "react";
import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export type InputProps = InputHTMLAttributes<HTMLInputElement>;

export const Input = forwardRef<HTMLInputElement, InputProps>(({ className, type = "text", ...props }, ref) => {
  return (
    <input
      ref={ref}
      type={type}
      className={cn(
        "w-full rounded-2xl border border-[color:var(--border-muted)] bg-[color:var(--bg-surface)] px-4 py-3 text-sm text-[color:var(--ink)] shadow-sm transition",
        "placeholder:text-[color:var(--muted-ink)]/70 hover:border-[color:var(--brand)]/40 focus:border-[color:var(--brand)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ring)]/50",
        className,
      )}
      {...props}
    />
  );
});

Input.displayName = "Input";
