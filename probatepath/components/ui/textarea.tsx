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
          "w-full rounded-xl border border-white/10 bg-[#0b1524] px-4 py-3 text-sm text-slate-100 shadow-sm transition focus:border-[#ff6a00] focus:outline-none focus:ring-2 focus:ring-[#ff6a00]/30",
          "placeholder:text-slate-500",
          className
        )}
        {...props}
      />
    );
  }
);

Textarea.displayName = "Textarea";
