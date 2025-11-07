'use client';

import { useMemo, useState } from "react";
import { StepShell } from "@/components/wizard/StepShell";
import { Summary } from "@/components/wizard/Summary";
import { Guard } from "@/components/wizard/Guard";
import { useIntake } from "@/lib/intake/store";
import { confirmationSchema, extractErrors } from "@/lib/intake/schema";
import { useWizard } from "@/components/wizard/use-wizard";

export default function ReviewPage() {
  const { draft, update } = useIntake();
  const { goNext } = useWizard("review");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const values = draft.confirmation;

  const isValid = useMemo(() => confirmationSchema.safeParse(values).success, [values]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const result = confirmationSchema.safeParse(values);
    if (!result.success) {
      setErrors(extractErrors(result.error));
      return;
    }
    setErrors({});
    goNext();
  };

  return (
    <>
      <Guard stepId="review" />
      <StepShell
        stepId="review"
        title="Review your information"
        description="Check the details before we generate your summary. You can edit any section and confirm when ready to proceed."
        nextLabel="Confirm and finish"
        isNextDisabled={!isValid}
        onSubmit={handleSubmit}
      >
        <Summary draft={draft} />

        <div className="space-y-2">
          <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-[#081127] p-4">
            <input
              id="review-confirm"
              type="checkbox"
              checked={values.confirmed}
              onChange={(event) =>
                update("confirmation", { confirmed: event.target.checked })
              }
              className="mt-1 h-4 w-4 rounded border-white/20 bg-transparent text-[#ff6a00] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ff6a00]"
              aria-invalid={errors.confirmed ? true : undefined}
              aria-describedby={errors.confirmed ? "review-confirm-error" : undefined}
            />
            <label htmlFor="review-confirm" className="text-sm text-slate-200">
              I confirm the information above is accurate to the best of my knowledge.
            </label>
          </div>
          {errors.confirmed ? (
            <p id="review-confirm-error" className="text-xs font-medium text-[#ffb703]">
              {errors.confirmed}
            </p>
          ) : null}
        </div>
      </StepShell>
    </>
  );
}
