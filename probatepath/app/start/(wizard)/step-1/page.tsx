'use client';

import { useMemo, useState } from "react";
import { StepShell } from "@/components/wizard/StepShell";
import { FormRow } from "@/components/wizard/FormRow";
import { Input } from "@/components/ui/input";
import { useIntake } from "@/lib/intake/store";
import { extractErrors, welcomeSchema } from "@/lib/intake/schema";
import { useWizard } from "@/components/wizard/use-wizard";

export default function StepOnePage() {
  const { draft, update } = useIntake();
  const { goNext } = useWizard("welcome");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const values = draft.welcome;

  const isValid = useMemo(() => welcomeSchema.safeParse(values).success, [values]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const result = welcomeSchema.safeParse(values);
    if (!result.success) {
      setErrors(extractErrors(result.error));
      return;
    }
    setErrors({});
    goNext();
  };

  return (
    <StepShell
      stepId="welcome"
      title="Start your ProbatePath intake"
      description="We use this email to tie your saved draft to your device. Your intake stays private until you choose to share it with us."
      hideBack
      isNextDisabled={!isValid}
      onSubmit={handleSubmit}
    >
      <FormRow
        fieldId="welcome-email"
        label="Email"
        description="We’ll use this to send intake links and updates."
        error={errors.email}
        required
      >
        <Input
          id="welcome-email"
          type="email"
          value={values.email}
          onChange={(event) =>
            update("welcome", { ...values, email: event.target.value })
          }
          placeholder="you@example.com"
          autoComplete="email"
        />
      </FormRow>

      <div className="space-y-2">
        <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-[#081127] p-4">
          <input
            id="welcome-consent"
            type="checkbox"
            checked={values.consent}
            onChange={(event) =>
              update("welcome", { ...values, consent: event.target.checked })
            }
            className="mt-1 h-4 w-4 rounded border-white/20 bg-transparent text-[#ff6a00] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ff6a00]"
            aria-invalid={errors.consent ? true : undefined}
            aria-describedby={errors.consent ? "welcome-consent-error" : undefined}
          />
          <label htmlFor="welcome-consent" className="text-sm text-slate-200">
            I understand ProbatePath provides document preparation support and general information, not legal advice or representation.
          </label>
        </div>
        {errors.consent ? (
          <p id="welcome-consent-error" className="text-xs font-medium text-[#ffb703]">
            {errors.consent}
          </p>
        ) : null}
      </div>
    </StepShell>
  );
}
