'use client';

import { cloneElement, forwardRef, isValidElement } from "react";
import type {
  ButtonHTMLAttributes,
  ForwardedRef,
  MutableRefObject,
  ReactElement,
  ReactNode,
} from "react";
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
    "bg-[#ff6a00] text-[#050713] shadow-[0_18px_44px_-24px_rgba(255,106,0,0.9)] hover:bg-[#ff7a1f] focus-visible:outline-[#ffb703]",
  secondary:
    "bg-[#1b1d27] text-slate-100 hover:bg-[#232633] focus-visible:outline-[#ffb703]",
  outline:
    "border border-white/15 bg-transparent text-slate-100 hover:border-[#ff6a00] hover:text-white focus-visible:outline-[#ffb703]",
  ghost:
    "border border-white/10 bg-transparent text-slate-200 hover:border-white/25 hover:text-white focus-visible:outline-[#ffb703]",
};

const sizeClasses: Record<ButtonSize, string> = {
  default: "h-11 px-6 text-sm font-medium",
  sm: "h-9 px-4 text-sm",
  lg: "h-12 px-7 text-base",
  xl: "h-14 px-9 text-lg",
};

function assignRef<T>(target: ForwardedRef<T> | undefined, value: T | null) {
  if (!target) {
    return;
  }

  if (typeof target === "function") {
    target(value);
    return;
  }

  try {
    (target as MutableRefObject<T | null>).current = value;
  } catch {
    // ignore if the ref is read-only
  }
}

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
      const childRef = (child as ReactElement & { ref?: ForwardedRef<HTMLButtonElement> }).ref;

      // eslint-disable-next-line react-hooks/refs -- merging forwarded refs when rendering `asChild`
      return cloneElement(child as ReactElement, {
        ...restProps,
        className: cn(child.props.className, baseClasses),
        ref: (node: HTMLButtonElement | null) => {
          assignRef(childRef, node);
          assignRef(ref, node);
        },
      } as any);
    }

    return (
      <button ref={ref} className={baseClasses} type={type ?? "button"} {...restProps}>
        {children}
      </button>
    );
  },
);

Button.displayName = "Button";
