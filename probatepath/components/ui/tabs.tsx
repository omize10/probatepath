"use client";

import {
  Children,
  createContext,
  useContext,
  useMemo,
  useState,
  type HTMLAttributes,
  type ReactElement,
  type ReactNode,
} from "react";
import { cn } from "@/lib/utils";

type TabsContextValue = {
  value: string;
  setValue: (value: string) => void;
};

const TabsContext = createContext<TabsContextValue | null>(null);

function useTabsContext() {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error("Tabs components must be used within <Tabs />");
  }
  return context;
}

export interface TabsProps extends HTMLAttributes<HTMLDivElement> {
  defaultValue: string;
}

export function Tabs({ defaultValue, className, children, ...props }: TabsProps) {
  const [value, setValue] = useState(defaultValue);
  const contextValue = useMemo(() => ({ value, setValue }), [value]);

  return (
    <TabsContext.Provider value={contextValue}>
      <div className={cn("space-y-6", className)} {...props}>
        {children}
      </div>
    </TabsContext.Provider>
  );
}

Tabs.displayName = "Tabs";

export function TabsList({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      role="tablist"
      className={cn(
        "inline-flex rounded-full border border-white/12 bg-[#0b1524]/80 p-1 text-sm text-slate-200",
        className,
      )}
      {...props}
    >
      {Children.map(children as ReactNode, (child) => {
        if (!child || typeof child === "string" || typeof child === "number") {
          return child;
        }
        const element = child as ReactElement<{ value?: string }>;
        if ("value" in element.props && element.props.value === undefined) {
          throw new Error("<TabsTrigger /> requires a value prop.");
        }
        return child;
      })}
    </div>
  );
}

TabsList.displayName = "TabsList";

export interface TabsTriggerProps extends HTMLAttributes<HTMLButtonElement> {
  value: string;
}

export function TabsTrigger({ value, className, children, ...props }: TabsTriggerProps) {
  const { value: activeValue, setValue } = useTabsContext();
  const isActive = activeValue === value;

  return (
    <button
      type="button"
      role="tab"
      aria-selected={isActive}
      data-state={isActive ? "active" : "inactive"}
      onClick={() => setValue(value)}
      className={cn(
        "inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-medium transition",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ff6a00]",
        isActive
          ? "bg-[#ff6a00] text-[#050713]"
          : "text-slate-300 hover:text-white",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

TabsTrigger.displayName = "TabsTrigger";

export interface TabsContentProps extends HTMLAttributes<HTMLDivElement> {
  value: string;
}

export function TabsContent({ value, className, children, ...props }: TabsContentProps) {
  const { value: activeValue } = useTabsContext();
  const isActive = activeValue === value;

  return (
    <div
      role="tabpanel"
      hidden={!isActive}
      className={cn(
        "space-y-4 rounded-3xl border border-white/10 bg-[#0b1524]/80 p-6 text-sm leading-relaxed text-slate-300",
        className,
      )}
      {...props}
    >
      {isActive ? children : null}
    </div>
  );
}

TabsContent.displayName = "TabsContent";
