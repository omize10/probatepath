'use client';

import { useMemo, useState } from "react";
import { StepShell } from "@/components/wizard/StepShell";
import { FormRow } from "@/components/wizard/FormRow";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Guard } from "@/components/wizard/Guard";
import { useIntake } from "@/lib/intake/store";
import { extractErrors, willSchema } from "@/lib/intake/schema";
import { useWizard } from "@/components/wizard/use-wizard";

export default function StepFourPage() {
  const { draft, update } = useIntake();
  const { goNext } = useWizard("will");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const values = draft.will;

  const isValid = useMemo(() => willSchema.safeParse(values).success, [values]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const result = willSchema.safeParse(values);
    if (!result.success) {
      setErrors(extractErrors(result.error));
      return;
    }
    setErrors({});
    goNext();
  };

  return (
    <>
      <Guard stepId="will" />
      <StepShell
        stepId="will"
        title="Will and estate details"
        description="Tell us where documents are stored and give a sense of the estate so we can confirm fit for the fixed fee."
        isNextDisabled={!isValid}
        onSubmit={handleSubmit}
      >
        <div className="grid gap-6">
          <FormRow
            fieldId="will-location"
            label="Where is the original will kept?"
            error={errors.willLocation}
            required
          >
            <Input
              id="will-location"
              value={values.willLocation}
              onChange={(event) =>
                update("will", { ...values, willLocation: event.target.value })
              }
              placeholder="Locked home file cabinet, downtown Vancouver apartment"
            />
          </FormRow>

          <FormRow
            fieldId="will-estate-value"
            label="Approximate estate value"
            error={errors.estateValueRange}
            required
          >
            <select
              id="will-estate-value"
              value={values.estateValueRange}
              onChange={(event) =>
                update("will", {
                  ...values,
                  estateValueRange: event.target.value as typeof values.estateValueRange,
                })
              }
              className="w-full rounded-2xl border border-white/10 bg-[#081127] px-4 py-3 text-sm text-slate-100 shadow-sm transition focus:border-[#ff6a00] focus:outline-none focus:ring-2 focus:ring-[#ff6a00]/30"
            >
              <option value="<$100k">Under $100,000</option>
              <option value="$100k-$500k">$100,000 – $500,000</option>
              <option value="$500k-$1M">$500,000 – $1M</option>
              <option value=">$1M">Over $1M</option>
            </select>
          </FormRow>

          <BinaryRow
            label="Does the estate include any real property (homes, land)?"
            value={values.anyRealProperty}
            onChange={(choice) => update("will", { ...values, anyRealProperty: choice })}
            error={errors.anyRealProperty}
          />

          <BinaryRow
            label="Are there multiple beneficiaries?"
            value={values.multipleBeneficiaries}
            onChange={(choice) =>
              update("will", { ...values, multipleBeneficiaries: choice })
            }
            error={errors.multipleBeneficiaries}
          />

          <FormRow
            fieldId="will-special"
            label="Any special circumstances we should know about? (optional)"
            description="Example: out-of-province beneficiaries, minors, trusts, overseas assets."
            error={errors.specialCircumstances}
          >
            <Textarea
              id="will-special"
              rows={4}
              value={values.specialCircumstances}
              onChange={(event) =>
                update("will", { ...values, specialCircumstances: event.target.value })
              }
              placeholder="Share anything that may affect timelines, notarisation, or court expectations."
            />
          </FormRow>
        </div>
      </StepShell>
    </>
  );
}

type YesNo = "yes" | "no";

interface BinaryRowProps {
  label: string;
  value: YesNo;
  onChange: (value: YesNo) => void;
  error?: string;
}

function BinaryRow({ label, value, onChange, error }: BinaryRowProps) {
  return (
    <div className="space-y-3">
      <p className="text-sm font-semibold text-slate-200">{label}</p>
      <div className="flex flex-col gap-3 sm:flex-row">
        {(["yes", "no"] as const).map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => onChange(option)}
            className={cnRadio(option === value)}
          >
            {option === "yes" ? "Yes" : "No"}
          </button>
        ))}
      </div>
      {error ? <p className="text-xs font-medium text-[#ffb703]">{error}</p> : null}
    </div>
  );
}

function cnRadio(active: boolean) {
  return [
    "rounded-2xl border px-5 py-3 text-sm font-semibold transition sm:flex-1",
    active
      ? "border-[#ff6a00]/50 bg-[#ff6a00]/10 text-white"
      : "border-white/10 bg-[#081127] text-slate-200 hover:border-[#ff6a00]/30",
  ].join(" ");
}
