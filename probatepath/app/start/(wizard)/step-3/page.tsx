'use client';

import { useMemo, useState } from "react";
import { StepShell } from "@/components/wizard/StepShell";
import { FormRow } from "@/components/wizard/FormRow";
import { Input } from "@/components/ui/input";
import { Guard } from "@/components/wizard/Guard";
import { useIntake } from "@/lib/intake/store";
import { deceasedSchema, extractErrors } from "@/lib/intake/schema";
import { useWizard } from "@/components/wizard/use-wizard";

export default function StepThreePage() {
  const { draft, update } = useIntake();
  const { goNext } = useWizard("deceased");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const values = draft.deceased;

  const isValid = useMemo(() => deceasedSchema.safeParse(values).success, [values]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const result = deceasedSchema.safeParse(values);
    if (!result.success) {
      setErrors(extractErrors(result.error));
      return;
    }
    setErrors({});
    goNext();
  };

  return (
    <>
      <Guard stepId="deceased" />
      <StepShell
        stepId="deceased"
        title="About the deceased"
        description="These details help us ensure the correct forms and notices are prepared."
        isNextDisabled={!isValid}
        onSubmit={handleSubmit}
      >
        <div className="grid gap-6">
          <FormRow
            fieldId="deceased-full-name"
            label="Full legal name"
            error={errors.fullName}
            required
          >
            <Input
              id="deceased-full-name"
              value={values.fullName}
              onChange={(event) =>
                update("deceased", { ...values, fullName: event.target.value })
              }
              placeholder="Taylor Morgan"
            />
          </FormRow>
          <FormRow
            fieldId="deceased-date"
            label="Date of death"
            error={errors.dateOfDeath}
            required
          >
            <Input
              id="deceased-date"
              type="date"
              value={values.dateOfDeath}
              onChange={(event) =>
                update("deceased", { ...values, dateOfDeath: event.target.value })
              }
              max={new Date().toISOString().split("T")[0]}
            />
          </FormRow>
          <FormRow
            fieldId="deceased-city-province"
            label="City and province where the person passed away"
            error={errors.cityProvince}
            required
          >
            <Input
              id="deceased-city-province"
              value={values.cityProvince}
              onChange={(event) =>
                update("deceased", { ...values, cityProvince: event.target.value })
              }
              placeholder="Victoria, BC"
            />
          </FormRow>
          <div className="space-y-3">
            <p className="text-sm font-semibold text-slate-200">Did the deceased leave a will?</p>
            <div className="flex flex-col gap-3 sm:flex-row">
              {(["yes", "no"] as const).map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => update("deceased", { ...values, hadWill: option })}
                  className={cnRadio(option === values.hadWill)}
                >
                  {option === "yes" ? "Yes" : "No"}
                </button>
              ))}
            </div>
            {errors.hadWill ? (
              <p className="text-xs font-medium text-[#ffb703]">{errors.hadWill}</p>
            ) : null}
          </div>
        </div>
      </StepShell>
    </>
  );
}

function cnRadio(active: boolean) {
  return [
    "rounded-2xl border px-5 py-3 text-sm font-semibold transition sm:flex-1",
    active
      ? "border-[#ff6a00]/50 bg-[#ff6a00]/10 text-white"
      : "border-white/10 bg-[#0f1115] text-slate-200 hover:border-[#ff6a00]/30",
  ].join(" ");
}
