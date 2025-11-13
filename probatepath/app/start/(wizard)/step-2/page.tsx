'use client';

import { useMemo, useState } from "react";
import { StepShell } from "@/components/wizard/StepShell";
import { FormRow } from "@/components/wizard/FormRow";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Guard } from "@/components/wizard/Guard";
import { useIntake } from "@/lib/intake/store";
import { executorSchema, extractErrors } from "@/lib/intake/schema";
import { useWizard } from "@/components/wizard/use-wizard";
import { saveIntakeStep } from "@/lib/intake/api";

export default function StepTwoPage() {
  const { draft, update } = useIntake();
  const { goNext } = useWizard("executor");
  const [submitErrors, setSubmitErrors] = useState<Record<string, string>>({});

  const values = draft.executor;

  const validationResult = useMemo(() => executorSchema.safeParse(values), [values]);
  const isValid = validationResult.success;
  const liveErrors = validationResult.success ? {} : extractErrors(validationResult.error);
  const errors = { ...liveErrors, ...submitErrors };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const result = executorSchema.safeParse(values);
    if (!result.success) {
      setSubmitErrors(extractErrors(result.error));
      return;
    }
    setSubmitErrors({});
    await saveIntakeStep("executor", values);
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
        image={{ src: "/images/steps-2.jpg", alt: "Executor completing contact section" }}
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
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <FormRow fieldId="executor-address-line1" label="Address line 1" error={errors.addressLine1} required>
            <Input
              id="executor-address-line1"
              value={values.addressLine1}
              onChange={(event) => update("executor", { ...values, addressLine1: event.target.value })}
              placeholder="1200 Howe Street"
            />
          </FormRow>
          <FormRow fieldId="executor-address-line2" label="Address line 2" error={errors.addressLine2}>
            <Input
              id="executor-address-line2"
              value={values.addressLine2}
              onChange={(event) => update("executor", { ...values, addressLine2: event.target.value })}
              placeholder="Unit 1502"
            />
          </FormRow>
          <FormRow fieldId="executor-province" label="Province" error={errors.province} required>
            <Input
              id="executor-province"
              value={values.province}
              onChange={(event) => update("executor", { ...values, province: event.target.value })}
              placeholder="British Columbia"
            />
          </FormRow>
          <FormRow fieldId="executor-postal-code" label="Postal code" error={errors.postalCode} required>
            <Input
              id="executor-postal-code"
              value={values.postalCode}
              onChange={(event) => update("executor", { ...values, postalCode: event.target.value })}
              placeholder="V6Z 2L4"
            />
          </FormRow>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <FormRow fieldId="executor-pronouns" label="Preferred pronouns" error={errors.preferredPronouns}>
            <Input
              id="executor-pronouns"
              value={values.preferredPronouns}
              onChange={(event) => update("executor", { ...values, preferredPronouns: event.target.value })}
              placeholder="They/them"
            />
          </FormRow>
          <FormRow
            fieldId="executor-communication"
            label="Preferred communication method"
            error={errors.communicationPreference}
            required
          >
            <select
              id="executor-communication"
              value={values.communicationPreference}
              onChange={(event) =>
                update("executor", {
                  ...values,
                  communicationPreference: event.target.value as typeof values.communicationPreference,
                })
              }
              className="w-full rounded-2xl border border-[#d7ddec] bg-white px-4 py-3 text-sm text-[#0f172a] shadow-sm transition focus:border-[#1e3a8a] focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/20"
            >
              <option value="email">Email</option>
              <option value="phone">Phone</option>
              <option value="either">Either</option>
            </select>
          </FormRow>
          <FormRow fieldId="executor-availability" label="Availability window" error={errors.availabilityWindow}>
            <Input
              id="executor-availability"
              value={values.availabilityWindow}
              onChange={(event) => update("executor", { ...values, availabilityWindow: event.target.value })}
              placeholder="Weekdays 9–3 PT"
            />
          </FormRow>
          <FormRow fieldId="executor-timezone" label="Time zone" error={errors.timeZone} required>
            <Input
              id="executor-timezone"
              value={values.timeZone}
              onChange={(event) => update("executor", { ...values, timeZone: event.target.value })}
              placeholder="Pacific Time (PT)"
            />
          </FormRow>
        </div>

        <div className="grid gap-6">
          <FormRow fieldId="executor-employer" label="Current employer (optional)" error={errors.employer}>
            <Input
              id="executor-employer"
              value={values.employer}
              onChange={(event) => update("executor", { ...values, employer: event.target.value })}
              placeholder="Employer or role"
            />
          </FormRow>
          <FormRow
            fieldId="executor-support-contacts"
            label="Who else is supporting you?"
            description="List family members, advisors, or friends assisting with probate."
            error={errors.supportContacts}
          >
            <Textarea
              id="executor-support-contacts"
              value={values.supportContacts}
              onChange={(event) => update("executor", { ...values, supportContacts: event.target.value })}
              rows={3}
            />
          </FormRow>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <FormRow
            fieldId="executor-emergency-name"
            label="Emergency contact name"
            error={errors.emergencyContactName}
            required
          >
            <Input
              id="executor-emergency-name"
              value={values.emergencyContactName}
              onChange={(event) => update("executor", { ...values, emergencyContactName: event.target.value })}
            />
          </FormRow>
          <FormRow
            fieldId="executor-emergency-phone"
            label="Emergency contact phone"
            error={errors.emergencyContactPhone}
            required
          >
            <Input
              id="executor-emergency-phone"
              value={values.emergencyContactPhone}
              onChange={(event) => update("executor", { ...values, emergencyContactPhone: event.target.value })}
            />
          </FormRow>
        </div>

        <div className="grid gap-6">
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
              className="w-full rounded-2xl border border-[#d7ddec] bg-white px-4 py-3 text-sm text-[#0f172a] shadow-sm transition focus:border-[#1e3a8a] focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/20"
            >
              <option value="partner">Partner</option>
              <option value="child">Child</option>
              <option value="relative">Relative</option>
              <option value="friend">Friend</option>
              <option value="other">Other</option>
            </select>
          </FormRow>
          <FormRow fieldId="executor-alternate" label="Is there an alternate executor?" error={errors.alternateExecutor} required>
            <select
              id="executor-alternate"
              value={values.alternateExecutor}
              onChange={(event) =>
                update("executor", {
                  ...values,
                  alternateExecutor: event.target.value as typeof values.alternateExecutor,
                })
              }
              className="w-full rounded-2xl border border-[#d7ddec] bg-white px-4 py-3 text-sm text-[#0f172a] shadow-sm transition focus:border-[#1e3a8a] focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/20"
            >
              <option value="no">No</option>
              <option value="yes">Yes</option>
            </select>
          </FormRow>
          <FormRow
            fieldId="executor-alternate-details"
            label="Alternate executor details (if any)"
            error={errors.alternateExecutorDetails}
          >
            <Textarea
              id="executor-alternate-details"
              value={values.alternateExecutorDetails}
              onChange={(event) => update("executor", { ...values, alternateExecutorDetails: event.target.value })}
              rows={3}
            />
          </FormRow>
        </div>
      </StepShell>
    </>
  );
}
