"use client";

import { useState, useEffect, type ReactNode } from "react";
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface ForcedPauseProps {
  /** Number of seconds to wait before enabling */
  seconds: number;
  /** Message to show during countdown */
  message?: string;
  /** Children (typically a button) that will be disabled until pause completes */
  children: ReactNode;
  /** Additional message shown after countdown */
  confirmMessage?: string;
  /** Callback when pause completes */
  onComplete?: () => void;
  className?: string;
}

export function ForcedPause({
  seconds,
  message = "Please take a moment to review",
  children,
  confirmMessage = "I have reviewed and understand",
  onComplete,
  className,
}: ForcedPauseProps) {
  const [remaining, setRemaining] = useState(seconds);
  const [acknowledged, setAcknowledged] = useState(false);

  // Countdown timer
  useEffect(() => {
    if (remaining <= 0) return;

    const timer = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [remaining]);

  // Notify when complete
  useEffect(() => {
    if (remaining === 0 && acknowledged && onComplete) {
      onComplete();
    }
  }, [remaining, acknowledged, onComplete]);

  const isComplete = remaining === 0 && acknowledged;

  return (
    <div className={cn("space-y-4", className)}>
      {/* Countdown display */}
      {remaining > 0 && (
        <div className="flex items-center justify-center gap-3 p-4 rounded-lg bg-gray-100 border border-gray-200">
          <Clock className="h-5 w-5 text-slate-600 animate-pulse" />
          <div className="text-center">
            <p className="text-sm text-slate-700">{message}</p>
            <p className="text-2xl font-mono font-bold text-[color:var(--ink)] mt-1">
              {remaining}s
            </p>
          </div>
        </div>
      )}

      {/* Acknowledgment checkbox - appears after countdown */}
      {remaining === 0 && !acknowledged && (
        <label className="flex items-start gap-3 p-4 rounded-lg bg-amber-50 border border-amber-200 cursor-pointer hover:bg-amber-100 transition-colors">
          <input
            type="checkbox"
            checked={acknowledged}
            onChange={(e) => setAcknowledged(e.target.checked)}
            className="mt-0.5 h-5 w-5 rounded border-gray-300 text-green-600 focus:ring-green-500"
          />
          <span className="text-sm text-amber-900 font-medium">
            {confirmMessage}
          </span>
        </label>
      )}

      {/* Children with disabled state */}
      <div className={cn(!isComplete && "opacity-50 pointer-events-none")}>
        {children}
      </div>

      {/* Helper text when disabled */}
      {!isComplete && remaining === 0 && !acknowledged && (
        <p className="text-sm text-center text-slate-600">
          Check the box above to continue
        </p>
      )}
    </div>
  );
}
