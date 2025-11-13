"use client";

import {
  Children,
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type HTMLAttributes,
  type ReactElement,
  type ReactNode,
} from "react";
import { ChevronDown } from "lucide-react";
import { cn, cloneWithClassName } from "@/lib/utils";

type AccordionType = "single" | "multiple";

type AccordionContextValue = {
  type: AccordionType;
  openValues: string[];
  toggleValue: (value: string) => void;
  isOpen: (value: string) => boolean;
};

const AccordionContext = createContext<AccordionContextValue | null>(null);

function useAccordionContext() {
  const context = useContext(AccordionContext);
  if (!context) {
    throw new Error("Accordion components must be used within <Accordion />");
  }
  return context;
}

export type AccordionProps = HTMLAttributes<HTMLDivElement> & {
  type?: AccordionType;
  defaultValue?: string | string[];
};

export function Accordion({
  type = "single",
  defaultValue,
  className,
  children,
  ...props
}: AccordionProps) {
  const initial = useMemo(() => {
    if (type === "multiple") {
      if (Array.isArray(defaultValue)) return defaultValue;
      return defaultValue ? [defaultValue] : [];
    }
    if (Array.isArray(defaultValue)) {
      return defaultValue.length > 0 ? [defaultValue[0]] : [];
    }
    return defaultValue ? [defaultValue] : [];
  }, [defaultValue, type]);

  const [openValues, setOpenValues] = useState<string[]>(initial);

  const toggleValue = useCallback(
    (value: string) => {
      setOpenValues((current) => {
        const isOpen = current.includes(value);
        if (type === "single") {
          return isOpen ? [] : [value];
        }
        if (isOpen) {
          return current.filter((item) => item !== value);
        }
        return [...current, value];
      });
    },
    [type]
  );

  const contextValue = useMemo<AccordionContextValue>(
    () => ({
      type,
      openValues,
      toggleValue,
      isOpen: (value: string) => openValues.includes(value),
    }),
    [openValues, toggleValue, type]
  );

  return (
    <AccordionContext.Provider value={contextValue}>
      <div
        className={cn("divide-y divide-[#e2e8f0] rounded-3xl border border-[#e2e8f0] bg-white", className)}
        {...props}
      >
        {children}
      </div>
    </AccordionContext.Provider>
  );
}

export type AccordionItemProps = HTMLAttributes<HTMLDivElement> & {
  value: string;
};

export function AccordionItem({ value, className, children, ...props }: AccordionItemProps) {
  const { isOpen } = useAccordionContext();
  const open = isOpen(value);

  return (
    <div
      data-open={open ? "true" : "false"}
      className={cn(
        "overflow-hidden transition-[background-color] duration-200",
        open && "bg-[#f7f8fa]",
        className
      )}
      {...props}
    >
      {Children.map(children as ReactNode, (child) => {
        if (!child || typeof child === "string" || typeof child === "number") {
          return child;
        }

        const element = child as ReactElement<{ value?: string; className?: string }>;
        if ("value" in element.props && element.props.value === undefined) {
          return cloneWithClassName(element, "", undefined, { value });
        }

        return child;
      })}
    </div>
  );
}

AccordionItem.displayName = "AccordionItem";

export type AccordionTriggerProps = HTMLAttributes<HTMLButtonElement> & {
  value?: string;
};

export function AccordionTrigger({ className, children, value, ...props }: AccordionTriggerProps) {
  const { toggleValue, isOpen } = useAccordionContext();
  if (!value) {
    throw new Error("<AccordionTrigger /> requires a value passed via props.");
  }
  const open = isOpen(value);

  return (
    <button
      type="button"
      className={cn(
        "flex w-full items-center justify-between gap-4 px-6 py-5 text-left text-sm font-medium text-[#0f172a] transition",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1e3a8a]",
        className
      )}
      aria-expanded={open}
      onClick={() => toggleValue(value)}
      {...props}
    >
      <span className="font-medium text-[#0f172a]">{children}</span>
      <ChevronDown
        className={cn(
          "h-5 w-5 flex-none text-slate-400 transition-transform duration-200",
          open && "rotate-180 text-[#ff6a00]"
        )}
        aria-hidden
      />
    </button>
  );
}

AccordionTrigger.displayName = "AccordionTrigger";

export type AccordionContentProps = HTMLAttributes<HTMLDivElement> & {
  value?: string;
};

export function AccordionContent({ className, children, value, ...props }: AccordionContentProps) {
  const { isOpen } = useAccordionContext();
  if (!value) {
    throw new Error("<AccordionContent /> requires a value passed via props.");
  }
  const open = isOpen(value);

  return (
    <div
      className={cn(
        "grid px-6 transition-[grid-template-rows,opacity] duration-200 ease-out",
        open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
      )}
      aria-hidden={!open}
      {...props}
    >
      <div className={cn("overflow-hidden pb-5 text-sm text-[#495067]", className)}>{children}</div>
    </div>
  );
}

AccordionContent.displayName = "AccordionContent";
