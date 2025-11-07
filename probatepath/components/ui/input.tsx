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
        "w-full rounded-xl border border-white/12 bg-[#081127] px-4 py-3 text-sm text-slate-100 shadow-sm transition",
        "placeholder:text-slate-500 hover:border-white/20 focus:border-[#ff6a00] focus:outline-none focus:ring-2 focus:ring-[#ff6a00]/30",
        className,
      )}
      {...props}
    />
  );
});

Input.displayName = "Input";
