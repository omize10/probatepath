'use client';

import Image from "next/image";
import type { FormHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { StepId } from "@/lib/intake/steps";
import { Progress } from "@/components/wizard/Progress";
import { useWizard } from "@/components/wizard/use-wizard";
import useIsWizardDirty from '@/lib/intake/use-dirty';
import useUnsavedGuard from '@/lib/hooks/use-unsaved-guard';
import { useIntake } from "@/lib/intake/store";
import { calculateIntakeProgress } from "@/lib/intake/progress";

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
  image?: {
    src: string;
    alt: string;
  };
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
  image,
  ...formProps
}: StepShellProps) {
  const { steps, stepIndex, previous, goBack } = useWizard(stepId);
  const { draft } = useIntake();
  const overallProgress = calculateIntakeProgress(draft);

  const showBack = Boolean(previous) && !hideBack;
  const showNext = !hideNext;

  // unsaved guard: warn if the wizard has unsaved changes
  const isDirty = useIsWizardDirty();
  // call the guard (it internally attaches listeners)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { setIgnoreUntil } = useUnsavedGuard({ isDirty });

  return (
    <form
      className={cn(
        "rounded-3xl border border-[#e2e8f0] bg-white p-6 shadow-[0_45px_140px_-90px_rgba(15,23,42,0.35)] sm:p-8",
        className,
      )}
      {...formProps}
    >
      <div className="grid gap-8 lg:grid-cols-[0.65fr_0.35fr]">
        <div className="space-y-6">
          <Progress steps={steps} currentIndex={stepIndex} />
          <div className="space-y-4">
            <h1 className="font-serif text-3xl text-[#0f172a]">{title}</h1>
            {description ? <p className="max-w-2xl text-sm text-[#495067]">{description}</p> : null}
          </div>
          <div className="space-y-6">{children}</div>
          <div className="space-y-2 rounded-2xl border border-[#e2e8f0] bg-[#f7f8fa] p-4 text-xs text-[#6b7287]">
            <p>Your progress saves automatically on this device. You can return and finish later anytime.</p>
            <p className="text-[0.65rem] uppercase tracking-[0.35em] text-[#94a3b8]">
              Overall completion · {overallProgress}%
            </p>
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
                  variant="outline"
                  className="justify-center sm:min-w-[140px]"
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
                <Button type="submit" className="sm:min-w-[160px]" disabled={Boolean(isNextDisabled)}>
                  {isSubmitting ? "Saving…" : nextLabel}
                </Button>
              ) : null}
            </div>
          )}
        </div>
        {image ? (
          <div className="relative hidden min-h-[360px] overflow-hidden rounded-[32px] border border-[#e2e8f0] lg:block">
            <Image src={image.src} alt={image.alt} fill className="object-cover" />
          </div>
        ) : null}
      </div>
    </form>
  );
}
