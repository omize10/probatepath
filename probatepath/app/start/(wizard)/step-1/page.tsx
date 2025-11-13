'use client';

import { useMemo, useState } from "react";
import { StepShell } from "@/components/wizard/StepShell";
import { FormRow } from "@/components/wizard/FormRow";
import { Input } from "@/components/ui/input";
import { useIntake } from "@/lib/intake/store";
import { extractErrors, welcomeSchema } from "@/lib/intake/schema";
import { useWizard } from "@/components/wizard/use-wizard";
import { saveIntakeStep } from "@/lib/intake/api";

export default function StepOnePage() {
  const { draft, update } = useIntake();
  const { goNext } = useWizard("welcome");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const values = draft.welcome;

  const isValid = useMemo(() => welcomeSchema.safeParse(values).success, [values]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const result = welcomeSchema.safeParse(values);
    if (!result.success) {
      setErrors(extractErrors(result.error));
      return;
    }
    setErrors({});
    await saveIntakeStep("welcome", values);
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
      image={{ src: "/images/steps-1.jpg", alt: "Executor completing welcome form" }}
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
        <div className="flex items-start gap-3 rounded-2xl border border-[#e2e8f0] bg-[#f7f8fa] p-4">
          <input
            id="welcome-consent"
            type="checkbox"
            checked={values.consent}
            onChange={(event) =>
              update("welcome", { ...values, consent: event.target.checked })
            }
            className="mt-1 h-4 w-4 rounded border-[#c7cfdf] bg-white text-[#ff6a00] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1e3a8a]"
            aria-invalid={errors.consent ? true : undefined}
            aria-describedby={errors.consent ? "welcome-consent-error" : undefined}
          />
          <label htmlFor="welcome-consent" className="text-sm text-[#0f172a]">
            I understand ProbatePath provides document preparation support and general information, not legal advice or representation.
          </label>
        </div>
        {errors.consent ? (
          <p id="welcome-consent-error" className="text-xs font-medium text-[#c2410c]">
            {errors.consent}
          </p>
        ) : null}
      </div>
    </StepShell>
  );
}
