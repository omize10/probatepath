'use client';

import { useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  getNextStep,
  getPreviousStep,
  getStepById,
  getStepIndex,
  wizardSteps,
  type StepId,
} from "@/lib/intake/steps";

export function useWizard(stepId: StepId) {
  const router = useRouter();
  const index = getStepIndex(stepId);
  const current = getStepById(stepId);
  const total = wizardSteps.length;
  const next = getNextStep(stepId);
  const previous = getPreviousStep(stepId);

  const goto = useCallback(
    (target: StepId) => {
      router.push(getStepById(target).href);
    },
    [router],
  );

  const gotoIndex = useCallback(
    (targetIndex: number) => {
      const step = wizardSteps[targetIndex];
      if (step) {
        router.push(step.href);
      }
    },
    [router],
  );

  return useMemo(
    () => ({
      steps: wizardSteps,
      current,
      stepIndex: index,
      total,
      next,
      previous,
      goNext: () => {
        if (next) {
          router.push(next.href);
        }
      },
      goBack: () => {
        if (previous) {
          router.push(previous.href);
        }
      },
      goto,
      gotoIndex,
    }),
    [current, goto, gotoIndex, index, next, previous, router, total],
  );
}
