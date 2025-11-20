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
        "placeholder:text-[rgba(68,82,102,0.8)] hover:border-[rgba(15,26,42,0.35)] focus:border-[color:var(--brand)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(15,26,42,0.2)]",
        className,
      )}
      {...props}
    />
  );
});

Input.displayName = "Input";
