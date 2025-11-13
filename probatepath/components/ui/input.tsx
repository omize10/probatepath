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
        "w-full rounded-2xl border border-[#d7ddec] bg-white px-4 py-3 text-sm text-[#0f172a] shadow-sm transition",
        "placeholder:text-slate-400 hover:border-[#b8c4dd] focus:border-[#1e3a8a] focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/20",
        className,
      )}
      {...props}
    />
  );
});

Input.displayName = "Input";
