"use client";

import { forwardRef } from "react";
import type { TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>;

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, rows = 4, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        rows={rows}
        className={cn(
          "w-full rounded-2xl border border-[color:var(--border-input)] bg-[color:var(--bg-surface)] px-4 py-3 text-sm text-[color:var(--ink)] shadow-sm transition",
          "placeholder:text-[color:var(--text-placeholder)] hover:border-[rgba(15,26,42,0.35)] focus:border-[color:var(--brand)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--focus-ring)]",
          className
        )}
        {...props}
      />
    );
  }
);

Textarea.displayName = "Textarea";
