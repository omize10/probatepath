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
          "w-full rounded-2xl border border-[color:var(--border-muted)] bg-[color:var(--bg-surface)] px-4 py-3 text-sm text-[color:var(--ink)] shadow-sm transition",
          "placeholder:text-[rgba(68,82,102,0.8)] hover:border-[rgba(15,26,42,0.35)] focus:border-[color:var(--brand)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(15,26,42,0.2)]",
          className
        )}
        {...props}
      />
    );
  }
);

Textarea.displayName = "Textarea";
