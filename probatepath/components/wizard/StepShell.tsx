'use client';

import type { FormHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { StepId } from "@/lib/intake/steps";
import { Progress } from "@/components/wizard/Progress";
import { useWizard } from "@/components/wizard/use-wizard";

interface StepShellProps extends FormHTMLAttributes<HTMLFormElement> {
  stepId: StepId;
  title: string;
  description?: string;
  children: ReactNode;
  isNextDisabled?: boolean;
  isSubmitting?: boolean;
  nextLabel?: string;
  backLabel?: string;
  hideBack?: boolean;
  hideNext?: boolean;
  customFooter?: ReactNode;
}

export function StepShell({
  stepId,
  title,
  description,
  children,
  isNextDisabled,
  isSubmitting,
  nextLabel = "Next",
  backLabel = "Back",
  hideBack = false,
  hideNext = false,
  customFooter,
  className,
  ...formProps
}: StepShellProps) {
  const { steps, stepIndex, previous, goBack } = useWizard(stepId);

  const showBack = Boolean(previous) && !hideBack;
  const showNext = !hideNext;

  return (
    <form
      className={cn(
        "space-y-8 rounded-3xl border border-white/10 bg-[#0b1524]/90 p-8 shadow-[0_50px_140px_-80px_rgba(255,106,0,0.35)]",
        className,
      )}
      {...formProps}
    >
      <Progress steps={steps} currentIndex={stepIndex} />
      <div className="space-y-4">
        <h1 className="font-serif text-3xl text-white">{title}</h1>
        {description ? <p className="max-w-2xl text-sm text-slate-300">{description}</p> : null}
      </div>
      <div className="space-y-6">{children}</div>
      <div className="space-y-4 rounded-2xl border border-white/10 bg-[#081127] p-4 text-xs text-slate-400">
        <p>Your progress saves automatically on this device. You can return and finish later anytime.</p>
      </div>
      {customFooter ? (
        customFooter
      ) : (
        <div
          className={cn(
            "flex flex-col gap-3 sm:flex-row sm:items-center",
            showBack ? "sm:justify-between" : "sm:justify-end",
          )}
        >
          {showBack ? (
            <Button
              type="button"
              variant="ghost"
              className="justify-center border border-white/10 sm:min-w-[140px]"
              onClick={() => {
                if (previous) {
                  goBack();
                }
              }}
            >
              {backLabel}
            </Button>
          ) : null}
          {showNext ? (
            <Button
              type="submit"
              className="sm:min-w-[160px]"
              disabled={Boolean(isNextDisabled)}
            >
              {isSubmitting ? "Saving…" : nextLabel}
            </Button>
          ) : null}
        </div>
      )}
    </form>
  );
}
