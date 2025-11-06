'use client';

import { useMemo, useState } from "react";
import { StepShell } from "@/components/wizard/StepShell";
import { FormRow } from "@/components/wizard/FormRow";
import { Input } from "@/components/ui/input";
import { Guard } from "@/components/wizard/Guard";
import { useIntake } from "@/lib/intake/store";
import { executorSchema, extractErrors } from "@/lib/intake/schema";
import { useWizard } from "@/components/wizard/use-wizard";

export default function StepTwoPage() {
  const { draft, update } = useIntake();
  const { goNext } = useWizard("executor");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const values = draft.executor;

  const isValid = useMemo(() => executorSchema.safeParse(values).success, [values]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const result = executorSchema.safeParse(values);
    if (!result.success) {
      setErrors(extractErrors(result.error));
      return;
    }
    setErrors({});
    goNext();
  };

  return (
    <>
      <Guard stepId="executor" />
      <StepShell
        stepId="executor"
        title="Executor details"
        description="Share the executor’s contact details so we can tailor instructions and future follow-ups."
        isNextDisabled={!isValid}
        onSubmit={handleSubmit}
      >
        <div className="grid gap-6">
          <FormRow
            fieldId="executor-full-name"
            label="Executor full name"
            error={errors.fullName}
            required
          >
            <Input
              id="executor-full-name"
              value={values.fullName}
              onChange={(event) =>
                update("executor", { ...values, fullName: event.target.value })
              }
              placeholder="Jordan Smith"
              autoComplete="name"
            />
          </FormRow>
          <FormRow
            fieldId="executor-email"
            label="Executor email"
            error={errors.email}
            required
          >
            <Input
              id="executor-email"
              type="email"
              value={values.email}
              onChange={(event) =>
                update("executor", { ...values, email: event.target.value })
              }
              placeholder="you@example.com"
              autoComplete="email"
            />
          </FormRow>
          <FormRow
            fieldId="executor-phone"
            label="Phone (optional)"
            hint="Helpful if we need quick clarification about beneficiaries or documents."
            error={errors.phone}
          >
            <Input
              id="executor-phone"
              value={values.phone}
              onChange={(event) =>
                update("executor", { ...values, phone: event.target.value })
              }
              placeholder="604-555-0199"
              autoComplete="tel"
            />
          </FormRow>
          <FormRow
            fieldId="executor-city"
            label="City"
            error={errors.city}
            required
          >
            <Input
              id="executor-city"
              value={values.city}
              onChange={(event) =>
                update("executor", { ...values, city: event.target.value })
              }
              placeholder="Vancouver, BC"
              autoComplete="address-level2"
            />
          </FormRow>
          <FormRow
            fieldId="executor-relation"
            label="Relationship to the deceased"
            error={errors.relationToDeceased}
            required
          >
            <select
              id="executor-relation"
              value={values.relationToDeceased}
              onChange={(event) =>
                update("executor", {
                  ...values,
                  relationToDeceased: event.target.value as typeof values.relationToDeceased,
                })
              }
              className="w-full rounded-2xl border border-white/10 bg-[#0f1115] px-4 py-3 text-sm text-slate-100 shadow-sm transition focus:border-[#ff6a00] focus:outline-none focus:ring-2 focus:ring-[#ff6a00]/30"
            >
              <option value="spouse">Spouse</option>
              <option value="child">Child</option>
              <option value="relative">Relative</option>
              <option value="friend">Friend</option>
              <option value="other">Other</option>
            </select>
          </FormRow>
        </div>
      </StepShell>
    </>
  );
}
