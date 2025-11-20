'use client';

import { cloneElement, forwardRef, isValidElement } from "react";
import type { ButtonHTMLAttributes, ReactElement, ReactNode } from "react";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost";
type ButtonSize = "default" | "sm" | "lg" | "xl";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  asChild?: boolean;
  children?: ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-[color:var(--accent)] text-[color:var(--ink)] shadow-[0_18px_40px_-20px_rgba(242,122,33,0.55)] hover:bg-[color:var(--accent)]/90 focus-visible:outline-[color:var(--ring)]",
  secondary:
    "border border-[color:var(--ring)] bg-[color:var(--bg-surface)] text-[color:var(--brand)] hover:bg-[color:var(--bg-muted)] focus-visible:outline-[color:var(--ring)]",
  outline:
    "border border-[color:var(--border-muted)] bg-[color:var(--bg-surface)] text-[color:var(--brand)] hover:bg-[color:var(--bg-muted)] focus-visible:outline-[color:var(--ring)]",
  ghost:
    "border border-transparent text-[color:var(--brand)] hover:bg-[color:var(--bg-muted)] focus-visible:outline-[color:var(--ring)]",
};

const sizeClasses: Record<ButtonSize, string> = {
  default: "h-11 px-6 text-sm font-medium",
  sm: "h-9 px-4 text-sm",
  lg: "h-12 px-7 text-base",
  xl: "h-14 px-9 text-lg",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "default", asChild = false, children, ...props }, ref) => {
    const baseClasses = cn(
      "inline-flex items-center justify-center rounded-full transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2",
      variantClasses[variant] ?? variantClasses.primary,
      sizeClasses[size] ?? sizeClasses.default,
      "disabled:pointer-events-none disabled:opacity-50",
      className,
    );

    const { type, ...restProps } = props;

    if (asChild && isValidElement(children)) {
      const child = children as ReactElement<{ className?: string }>;

      return cloneElement(child as ReactElement<Record<string, unknown>>, {
        ...(restProps as Record<string, unknown>),
        className: cn(child.props.className, baseClasses),
      });
    }

    return (
      <button ref={ref} className={baseClasses} type={type ?? "button"} {...restProps}>
        {children}
      </button>
    );
  },
);

Button.displayName = "Button";
