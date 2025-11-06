import type { ElementType, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SectionProps {
  children: ReactNode;
  className?: string;
  id?: string;
  as?: ElementType;
}

export function Section({ children, className, id, as: Component = "section" }: SectionProps) {
  return (
    <Component id={id} className={cn("space-y-8", className)}>
      {children}
    </Component>
  );
}
