'use client';

import { forwardRef } from "react";
import type { LabelHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export type LabelProps = LabelHTMLAttributes<HTMLLabelElement>;

export const Label = forwardRef<HTMLLabelElement, LabelProps>(({ className, ...props }, ref) => (
  <label
    ref={ref}
    className={cn("text-sm font-semibold text-[#0f172a] transition-colors", className)}
    {...props}
  />
));

Label.displayName = "Label";
