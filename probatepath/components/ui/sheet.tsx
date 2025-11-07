"use client";

import {
  cloneElement,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type HTMLAttributes,
  type MouseEvent as ReactMouseEvent,
  type ReactElement,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

type SheetContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
};

const SheetContext = createContext<SheetContextValue | null>(null);

function useSheetContext() {
  const context = useContext(SheetContext);
  if (!context) {
    throw new Error("Sheet components must be used within <Sheet />");
  }
  return context;
}

export type SheetProps = {
  children: ReactNode;
};

export function Sheet({ children }: SheetProps) {
  const [open, setOpen] = useState(false);
  const value = useMemo(() => ({ open, setOpen }), [open]);
  return <SheetContext.Provider value={value}>{children}</SheetContext.Provider>;
}

export type SheetTriggerProps = {
  children: ReactElement;
  asChild?: boolean;
};

export function SheetTrigger({ children }: SheetTriggerProps) {
  const { setOpen } = useSheetContext();
  const trigger = children as ReactElement<{ onClick?: (event: ReactMouseEvent<HTMLElement>) => void }>;

  return cloneElement(trigger, {
    onClick: (event: ReactMouseEvent<HTMLElement>) => {
      trigger.props.onClick?.(event);
      setOpen(true);
    },
  });
}

export type SheetCloseProps = {
  children: ReactElement;
  asChild?: boolean;
};

export function SheetClose({ children }: SheetCloseProps) {
  const { setOpen } = useSheetContext();
  const closeElement = children as ReactElement<{ onClick?: (event: ReactMouseEvent<HTMLElement>) => void }>;

  return cloneElement(closeElement, {
    onClick: (event: ReactMouseEvent<HTMLElement>) => {
      closeElement.props.onClick?.(event);
      setOpen(false);
    },
  });
}

export type SheetContentProps = HTMLAttributes<HTMLDivElement> & {
  side?: "left" | "right" | "top" | "bottom";
};

export function SheetContent({ className, children, side = "right", ...props }: SheetContentProps) {
  const { open, setOpen } = useSheetContext();

  useEffect(() => {
    if (open) {
      document.body.style.setProperty("overflow", "hidden");
    } else {
      document.body.style.removeProperty("overflow");
    }
    return () => {
      document.body.style.removeProperty("overflow");
    };
  }, [open]);

  if (!open || typeof window === "undefined") {
    return null;
  }

  const portalTarget = document.body;

  const sideClasses: Record<Required<SheetContentProps>["side"], string> = {
    left: "inset-y-0 left-0 h-full w-[320px]",
    right: "inset-y-0 right-0 h-full w-[320px]",
    top: "top-0 left-0 w-full max-h-[85vh]",
    bottom: "bottom-0 left-0 w-full max-h-[85vh]",
  };

  return createPortal(
    <div className="fixed inset-0 z-[70] flex">
      <button
        type="button"
        aria-label="Close navigation overlay"
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={() => setOpen(false)}
      />
      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          "relative flex flex-col border-l border-white/10 bg-[#0b1524] p-6 shadow-[0_30px_80px_-40px_rgba(0,0,0,0.8)] transition",
          sideClasses[side],
          className
        )}
        {...props}
      >
        {children}
      </div>
    </div>,
    portalTarget
  );
}

export type SheetHeaderProps = HTMLAttributes<HTMLDivElement>;

export function SheetHeader({ className, children, ...props }: SheetHeaderProps) {
  return (
    <div className={cn("flex flex-col gap-1", className)} {...props}>
      {children}
    </div>
  );
}
