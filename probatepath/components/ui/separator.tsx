'use client';

import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export type SeparatorProps = HTMLAttributes<HTMLDivElement>;

export function Separator({ className, ...props }: SeparatorProps) {
  return (
    <div
      role="separator"
      className={cn("h-px w-full bg-gradient-to-r from-transparent via-[#dbe3f4] to-transparent", className)}
      {...props}
    />
  );
}
