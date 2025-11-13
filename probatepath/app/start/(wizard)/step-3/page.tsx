'use client';

import { useMemo, useState } from "react";
import { StepShell } from "@/components/wizard/StepShell";
import { FormRow } from "@/components/wizard/FormRow";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Guard } from "@/components/wizard/Guard";
import { useIntake } from "@/lib/intake/store";
import { deceasedSchema, extractErrors } from "@/lib/intake/schema";
import { useWizard } from "@/components/wizard/use-wizard";
import { saveIntakeStep } from "@/lib/intake/api";

export default function StepThreePage() {
  const { draft, update } = useIntake();
  const { goNext } = useWizard("deceased");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const values = draft.deceased;

  const isValid = useMemo(() => deceasedSchema.safeParse(values).success, [values]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const result = deceasedSchema.safeParse(values);
    if (!result.success) {
      setErrors(extractErrors(result.error));
      return;
    }
    setErrors({});
    await saveIntakeStep("deceased", values);
    goNext();
  };

  const updateField = (key: keyof typeof values, value: string) => {
    update("deceased", { ...values, [key]: value });
  };

  const renderToggle = (field: "hadWill" | "hadPriorUnions" | "assetsOutsideCanada", label: string) => (
    <div className="space-y-3">
      <p className="text-sm font-semibold text-[#0f172a]">{label}</p>
      <div className="flex flex-col gap-3 sm:flex-row">
        {(["yes", "no"] as const).map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => updateField(field, option)}
            className={cnRadio(values[field] === option)}
          >
            {option === "yes" ? "Yes" : "No"}
          </button>
        ))}
      </div>
      {errors[field] ? (
        <p className="text-xs font-medium text-[#c2410c]">{errors[field]}</p>
      ) : null}
    </div>
  );

  return (
    <>
      <Guard stepId="deceased" />
      <StepShell
        stepId="deceased"
        title="About the deceased"
        description="These details help us ensure the correct forms and notices are prepared."
        isNextDisabled={!isValid}
        onSubmit={handleSubmit}
        image={{ src: "/images/steps-4.jpg", alt: "Documents representing the deceased" }}
      >
        <div className="grid gap-6">
          <FormRow fieldId="deceased-full-name" label="Full legal name" error={errors.fullName} required>
            <Input id="deceased-full-name" value={values.fullName} onChange={(event) => updateField("fullName", event.target.value)} />
          </FormRow>
          <FormRow fieldId="deceased-date" label="Date of death" error={errors.dateOfDeath} required>
            <Input
              id="deceased-date"
              type="date"
              value={values.dateOfDeath}
              max={new Date().toISOString().split("T")[0]}
              onChange={(event) => updateField("dateOfDeath", event.target.value)}
            />
          </FormRow>
          <FormRow fieldId="deceased-city-province" label="City and province where the person passed away" error={errors.cityProvince} required>
            <Input
              id="deceased-city-province"
              value={values.cityProvince}
              onChange={(event) => updateField("cityProvince", event.target.value)}
              placeholder="Victoria, BC"
            />
          </FormRow>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <FormRow fieldId="deceased-birth-date" label="Date of birth" error={errors.birthDate}>
            <Input
              id="deceased-birth-date"
              type="date"
              value={values.birthDate}
              onChange={(event) => updateField("birthDate", event.target.value)}
            />
          </FormRow>
          <FormRow fieldId="deceased-place-of-birth" label="Place of birth" error={errors.placeOfBirth}>
            <Input
              id="deceased-place-of-birth"
              value={values.placeOfBirth}
              onChange={(event) => updateField("placeOfBirth", event.target.value)}
            />
          </FormRow>
          <FormRow fieldId="deceased-marital-status" label="Marital status" error={errors.maritalStatus}>
            <Input
              id="deceased-marital-status"
              value={values.maritalStatus}
              onChange={(event) => updateField("maritalStatus", event.target.value)}
              placeholder="Married"
            />
          </FormRow>
          <FormRow fieldId="deceased-occupation" label="Occupation" error={errors.occupation}>
            <Input
              id="deceased-occupation"
              value={values.occupation}
              onChange={(event) => updateField("occupation", event.target.value)}
              placeholder="Retired accountant"
            />
          </FormRow>
        </div>

        <div className="grid gap-6">
          <FormRow fieldId="deceased-residence-address" label="Primary residence" error={errors.residenceAddress}>
            <Input
              id="deceased-residence-address"
              value={values.residenceAddress}
              onChange={(event) => updateField("residenceAddress", event.target.value)}
              placeholder="123 Beach Avenue, Vancouver"
            />
          </FormRow>
          <FormRow fieldId="deceased-residence-type" label="Residence type" error={errors.residenceType}>
            <Input
              id="deceased-residence-type"
              value={values.residenceType}
              onChange={(event) => updateField("residenceType", event.target.value)}
              placeholder="Primary condo"
            />
          </FormRow>
          <FormRow fieldId="deceased-years-in-bc" label="Years lived in BC" error={errors.yearsLivedInBC}>
            <Input
              id="deceased-years-in-bc"
              value={values.yearsLivedInBC}
              onChange={(event) => updateField("yearsLivedInBC", event.target.value)}
              placeholder="25"
            />
          </FormRow>
        </div>

        {renderToggle("hadWill", "Did the deceased leave a will?")}

        <div className="grid gap-6 lg:grid-cols-2">
          <FormRow fieldId="deceased-children-count" label="Number of children" error={errors.childrenCount}>
            <Input
              id="deceased-children-count"
              value={values.childrenCount}
              onChange={(event) => updateField("childrenCount", event.target.value)}
              placeholder="2"
            />
          </FormRow>
          <FormRow fieldId="deceased-digital-notes" label="Digital estate notes" error={errors.digitalEstateNotes}>
            <Textarea
              id="deceased-digital-notes"
              value={values.digitalEstateNotes}
              onChange={(event) => updateField("digitalEstateNotes", event.target.value)}
              rows={3}
              placeholder="Passwords stored in manager, Apple ID legacy contact set, etc."
            />
          </FormRow>
        </div>

        {renderToggle("hadPriorUnions", "Any previous partnerships?")}
        {renderToggle("assetsOutsideCanada", "Assets outside Canada?")}

        <FormRow
          fieldId="deceased-foreign-assets"
          label="Foreign asset details"
          error={errors.assetsOutsideDetails}
        >
          <Textarea
            id="deceased-foreign-assets"
            value={values.assetsOutsideDetails}
            onChange={(event) => updateField("assetsOutsideDetails", event.target.value)}
            rows={3}
            placeholder="Condo in Seattle, RBC US account, etc."
          />
        </FormRow>
      </StepShell>
    </>
  );
}

function cnRadio(active: boolean) {
  return [
    "rounded-2xl border px-5 py-3 text-sm font-semibold transition sm:flex-1",
    active
      ? "border-[#ff6a00]/50 bg-[#fff3ec] text-[#0f172a]"
      : "border-[#d7ddec] bg-white text-[#495067] hover:border-[#1e3a8a]/40",
  ].join(" ");
}
