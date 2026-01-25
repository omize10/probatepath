"use client";

import type { ReactNode, HTMLAttributes } from "react";
import { AlertTriangle, AlertCircle, Info } from "lucide-react";
import { cn } from "@/lib/utils";

type Severity = "info" | "warning" | "danger";

interface WarningCalloutProps extends HTMLAttributes<HTMLDivElement> {
  severity?: Severity;
  title?: string;
  children: ReactNode;
  /** Hide the icon */
  hideIcon?: boolean;
}

const severityConfig: Record<Severity, { icon: typeof Info; styles: string; iconColor: string }> = {
  info: {
    icon: Info,
    styles: "border-blue-200 bg-blue-50 text-blue-900",
    iconColor: "text-blue-600",
  },
  warning: {
    icon: AlertCircle,
    styles: "border-amber-200 bg-amber-50 text-amber-900",
    iconColor: "text-amber-600",
  },
  danger: {
    icon: AlertTriangle,
    styles: "border-red-200 bg-red-50 text-red-900",
    iconColor: "text-red-600",
  },
};

export function WarningCallout({
  severity = "warning",
  title,
  children,
  hideIcon = false,
  className,
  ...props
}: WarningCalloutProps) {
  const config = severityConfig[severity];
  const Icon = config.icon;

  return (
    <div
      role="alert"
      className={cn(
        "rounded-lg border p-4",
        config.styles,
        className
      )}
      {...props}
    >
      <div className="flex gap-3">
        {!hideIcon && (
          <Icon className={cn("h-5 w-5 flex-shrink-0 mt-0.5", config.iconColor)} />
        )}
        <div className="flex-1 min-w-0">
          {title && (
            <p className="font-semibold mb-1">{title}</p>
          )}
          <div className="text-sm">{children}</div>
        </div>
      </div>
    </div>
  );
}
