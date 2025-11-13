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
          "w-full rounded-2xl border border-[#d7ddec] bg-white px-4 py-3 text-sm text-[#0f172a] shadow-sm transition focus:border-[#1e3a8a] focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/20",
          "placeholder:text-slate-400",
          className
        )}
        {...props}
      />
    );
  }
);

Textarea.displayName = "Textarea";
