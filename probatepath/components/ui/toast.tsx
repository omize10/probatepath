"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastIntent = "default" | "success" | "warning" | "error";

export type ToastOptions = {
  title?: string;
  description?: string;
  duration?: number;
  intent?: ToastIntent;
};

type ToastRecord = ToastOptions & {
  id: number;
};

type ToastContextValue = {
  toast: (options: ToastOptions) => void;
  dismiss: (id: number) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a <ToastProvider />");
  }
  return context;
}

type ToastProviderProps = {
  children: ReactNode;
};

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<ToastRecord[]>([]);
  const timers = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map());
  const [mounted, setMounted] = useState(false);

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
    const timer = timers.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timers.current.delete(id);
    }
  }, []);

  const toast = useCallback(
    ({ duration = 4000, ...payload }: ToastOptions) => {
      const id = Date.now() + Math.random();
      setToasts((current) => [...current, { id, duration, ...payload }]);

      if (Number.isFinite(duration) && duration > 0) {
        const timer = setTimeout(() => dismiss(id), duration);
        timers.current.set(id, timer);
      }
    },
    [dismiss]
  );

  useEffect(() => {
    const timersMap = timers.current;
    return () => {
      timersMap.forEach((timer) => clearTimeout(timer));
      timersMap.clear();
    };
  }, []);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  const contextValue = useMemo(() => ({ toast, dismiss }), [toast, dismiss]);

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      {mounted ? <ToastViewport toasts={toasts} onDismiss={dismiss} /> : null}
    </ToastContext.Provider>
  );
}

type ToastViewportProps = {
  toasts: ToastRecord[];
  onDismiss: (id: number) => void;
};

function ToastViewport({ toasts, onDismiss }: ToastViewportProps) {
  if (typeof window === "undefined") {
    return null;
  }

  return createPortal(
    <div className="pointer-events-none fixed top-4 right-4 z-[80] flex w-full max-w-sm flex-col gap-3 sm:top-6 sm:right-6">
      <AnimatePresence initial={false}>
        {toasts.map(({ id, title, description, intent = "default" }) => (
          <motion.div
            key={id}
            layout
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className={cn(
              "pointer-events-auto overflow-hidden rounded-2xl border border-[#dbe3f4] bg-white/95 p-4 text-sm text-[#0f172a] shadow-[0_25px_70px_-50px_rgba(15,23,42,0.45)] backdrop-blur",
              intent === "success" && "border-[#c6f6d5] bg-[#f0fff4]",
              intent === "warning" && "border-[#fde68a] bg-[#fffbeb]",
              intent === "error" && "border-[#fecaca] bg-[#fff5f5]"
            )}
            role="status"
          >
            <div className="flex items-start gap-3">
              <div className="flex-1 space-y-1">
                {title ? <p className="text-sm font-semibold text-[#0f172a]">{title}</p> : null}
                {description ? <p className="text-xs text-[#4b5563]">{description}</p> : null}
              </div>
              <button
                type="button"
                className="rounded-full p-1 text-slate-400 transition hover:text-[#0f172a] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1e3a8a]"
                onClick={() => onDismiss(id)}
                aria-label="Dismiss notification"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>,
    document.body
  );
}
