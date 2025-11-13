'use client';

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { validateSection } from "@/lib/intake/schema";
import { useIntake } from "@/lib/intake/store";
import {
  getStepIndex,
  wizardSteps,
  type StepId,
} from "@/lib/intake/steps";

const reviewStepHref = "/start/review";

export function Guard({ stepId }: { stepId: StepId }) {
  const router = useRouter();
  const { draft, hydrated } = useIntake();

  useEffect(() => {
    if (!hydrated) return;
    const currentIndex = getStepIndex(stepId);

    for (let index = 0; index < currentIndex; index += 1) {
      const step = wizardSteps[index];
      if (step.section && !validateSection(step.section, draft)) {
        router.replace(step.href);
        return;
      }
    }

    if (stepId === "done") {
      if (!validateSection("confirmation", draft)) {
        router.replace(reviewStepHref);
      }
    }
  }, [draft, hydrated, router, stepId]);

  return null;
}
