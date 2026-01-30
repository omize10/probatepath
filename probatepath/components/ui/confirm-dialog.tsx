"use client";

import { useState, useEffect, type ReactNode } from "react";
import { AlertTriangle, AlertCircle, Info, Check } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "./dialog";
import { Button } from "./button";
import { cn } from "@/lib/utils";

type Severity = "info" | "warning" | "danger";
type ConfirmMode = "button" | "type" | "checklist";

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string | ReactNode;
  severity?: Severity;
  confirmMode?: ConfirmMode;
  /** Word user must type to confirm (for type mode) */
  confirmWord?: string;
  /** Items user must check (for checklist mode) */
  checklistItems?: string[];
  onConfirm: () => void;
  onCancel?: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Show loading state after confirm */
  loading?: boolean;
}

const severityConfig: Record<Severity, { icon: typeof AlertTriangle; color: string; bg: string; border: string }> = {
  info: {
    icon: Info,
    color: "text-blue-600",
    bg: "bg-blue-50",
    border: "border-blue-200",
  },
  warning: {
    icon: AlertCircle,
    color: "text-amber-600",
    bg: "bg-amber-50",
    border: "border-amber-200",
  },
  danger: {
    icon: AlertTriangle,
    color: "text-red-600",
    bg: "bg-red-50",
    border: "border-red-200",
  },
};

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  severity = "warning",
  confirmMode = "button",
  confirmWord = "CONFIRM",
  checklistItems = [],
  onConfirm,
  onCancel,
  confirmLabel,
  cancelLabel = "Cancel",
  loading = false,
}: ConfirmDialogProps) {
  const [typedValue, setTypedValue] = useState("");
  const [checkedItems, setCheckedItems] = useState<Set<number>>(new Set());

  // Reset state when dialog opens/closes
  useEffect(() => {
    if (open) {
      setTypedValue("");
      setCheckedItems(new Set());
    }
  }, [open]);

  const config = severityConfig[severity];
  const Icon = config.icon;

  // Determine if confirm is enabled
  const isConfirmEnabled = (() => {
    switch (confirmMode) {
      case "type":
        return typedValue.toUpperCase() === confirmWord.toUpperCase();
      case "checklist":
        return checklistItems.length > 0 && checkedItems.size === checklistItems.length;
      default:
        return true;
    }
  })();

  const handleConfirm = () => {
    if (isConfirmEnabled && !loading) {
      onConfirm();
    }
  };

  const handleCancel = () => {
    onCancel?.();
    onOpenChange(false);
  };

  const toggleCheckItem = (index: number) => {
    const newChecked = new Set(checkedItems);
    if (newChecked.has(index)) {
      newChecked.delete(index);
    } else {
      newChecked.add(index);
    }
    setCheckedItems(newChecked);
  };

  const defaultConfirmLabel = confirmMode === "type" ? `Type "${confirmWord}" to confirm` : "Confirm";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className={cn("mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full", config.bg)}>
            <Icon className={cn("h-6 w-6", config.color)} />
          </div>
          <DialogTitle className="text-center">{title}</DialogTitle>
          {description && (
            <DialogDescription className="text-center whitespace-pre-line">
              {description}
            </DialogDescription>
          )}
        </DialogHeader>

        <div className="mt-4 space-y-4">
          {/* Type-to-confirm mode */}
          {confirmMode === "type" && (
            <div className={cn("rounded-lg border p-4", config.border, config.bg)}>
              <label className="block text-sm font-medium text-[color:var(--text-secondary)] mb-2">
                Type <span className="font-bold">{confirmWord}</span> to confirm:
              </label>
              <input
                type="text"
                value={typedValue}
                onChange={(e) => setTypedValue(e.target.value)}
                placeholder={confirmWord}
                className={cn(
                  "w-full rounded-lg border px-3 py-2 text-sm font-mono",
                  "focus:outline-none focus:ring-2 focus:ring-offset-1",
                  typedValue.toUpperCase() === confirmWord.toUpperCase()
                    ? "border-green-500 bg-green-50 focus:ring-green-500"
                    : "border-gray-300 focus:ring-blue-500"
                )}
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck={false}
              />
              {typedValue && typedValue.toUpperCase() === confirmWord.toUpperCase() && (
                <p className="mt-2 text-sm text-green-600 flex items-center gap-1">
                  <Check className="h-4 w-4" /> Ready to confirm
                </p>
              )}
            </div>
          )}

          {/* Checklist mode */}
          {confirmMode === "checklist" && checklistItems.length > 0 && (
            <div className={cn("rounded-lg border p-4 space-y-3", config.border, config.bg)}>
              <p className="text-sm font-medium text-[color:var(--text-secondary)] mb-2">
                Please confirm each item:
              </p>
              {checklistItems.map((item, index) => (
                <label
                  key={index}
                  className={cn(
                    "flex items-start gap-3 p-2 rounded-lg cursor-pointer transition-colors",
                    checkedItems.has(index) ? "bg-white/50" : "hover:bg-white/30"
                  )}
                >
                  <input
                    type="checkbox"
                    checked={checkedItems.has(index)}
                    onChange={() => toggleCheckItem(index)}
                    className="mt-0.5 h-5 w-5 rounded border-gray-300 text-green-600 focus:ring-green-500"
                  />
                  <span className={cn(
                    "text-sm",
                    checkedItems.has(index) ? "text-[color:var(--ink)]" : "text-[color:var(--text-secondary)]"
                  )}>
                    {item}
                  </span>
                </label>
              ))}
              {checkedItems.size === checklistItems.length && (
                <p className="mt-2 text-sm text-green-600 flex items-center gap-1">
                  <Check className="h-4 w-4" /> All items confirmed
                </p>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="mt-6">
          <Button variant="ghost" onClick={handleCancel} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button
            variant={severity === "danger" ? "primary" : "primary"}
            onClick={handleConfirm}
            disabled={!isConfirmEnabled || loading}
            className={cn(
              severity === "danger" && "bg-red-600 hover:bg-red-700",
              severity === "warning" && "bg-amber-600 hover:bg-amber-700"
            )}
          >
            {loading ? "Processing..." : confirmLabel || defaultConfirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
