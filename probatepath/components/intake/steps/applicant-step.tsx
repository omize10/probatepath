import { Input } from "@/components/ui/input";
import { FormRow } from "@/components/wizard/FormRow";
import { QuestionCard } from "@/components/intake/question-card";
import type { PortalStepErrors } from "@/lib/intake/portal/validation";
import type { IntakeDraft } from "@/lib/intake/types";

interface ApplicantStepProps {
  draft: IntakeDraft;
  errors: PortalStepErrors;
  showErrors: boolean;
  updateWelcome: (updates: Partial<IntakeDraft["welcome"]>) => void;
  updateExecutor: (updates: Partial<IntakeDraft["executor"]>) => void;
}

export function ApplicantStep({ draft, errors, showErrors, updateWelcome, updateExecutor }: ApplicantStepProps) {
  const { welcome, executor } = draft;
  const err = (key: keyof PortalStepErrors) => (showErrors ? errors[key] : undefined);

  return (
    <div className="space-y-6">
      <QuestionCard title="Your contact information" description="We use this to send portal updates and file the application under your name.">
        <div className="grid gap-4 md:grid-cols-2">
          <FormRow fieldId="applicant-full-name" label="Full name" error={err("executorFullName")} required>
            <Input value={executor.fullName} onChange={(event) => updateExecutor({ fullName: event.target.value })} placeholder="Jordan Smith" />
          </FormRow>
          <FormRow fieldId="applicant-relation" label="Relationship to the deceased" error={err("executorRelation")} required>
            <select
              value={executor.relationToDeceased}
              onChange={(event) => updateExecutor({ relationToDeceased: event.target.value as typeof executor.relationToDeceased })}
              className="w-full rounded-2xl border border-[color:var(--border-muted)] bg-white px-4 py-3 text-sm"
            >
              <option value="partner">Partner</option>
              <option value="child">Child</option>
              <option value="relative">Relative</option>
              <option value="friend">Friend</option>
              <option value="other">Other</option>
            </select>
          </FormRow>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <FormRow fieldId="applicant-email" label="Email" error={err("welcomeEmail")} required>
            <Input type="email" value={welcome.email} onChange={(event) => updateWelcome({ email: event.target.value })} placeholder="you@example.com" />
          </FormRow>
          <FormRow fieldId="applicant-phone" label="Phone" error={err("executorPhone")}>
            <Input
              value={executor.phone}
              onChange={(event) => updateExecutor({ phone: event.target.value })}
              placeholder="+1 (604) 670-3534"
            />
          </FormRow>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <FormRow fieldId="applicant-city" label="City" error={err("executorCity")} required>
            <Input value={executor.city} onChange={(event) => updateExecutor({ city: event.target.value })} placeholder="Vancouver" />
          </FormRow>
          <FormRow fieldId="applicant-timezone" label="Time zone" error={err("executorTimeZone")} required>
            <Input value={executor.timeZone} onChange={(event) => updateExecutor({ timeZone: event.target.value })} placeholder="Pacific Time" />
          </FormRow>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <FormRow fieldId="applicant-address1" label="Address line 1" error={err("executorAddress1")} required>
            <Input value={executor.addressLine1} onChange={(event) => updateExecutor({ addressLine1: event.target.value })} placeholder="123 Beach Ave" />
          </FormRow>
          <FormRow fieldId="applicant-address2" label="Address line 2" error={err("executorAddress2")}>
            <Input value={executor.addressLine2} onChange={(event) => updateExecutor({ addressLine2: event.target.value })} placeholder="Unit 1202" />
          </FormRow>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <FormRow fieldId="applicant-province" label="Province" error={err("executorProvince")} required>
            <Input value={executor.province} onChange={(event) => updateExecutor({ province: event.target.value })} placeholder="BC" />
          </FormRow>
          <FormRow fieldId="applicant-postal" label="Postal code" error={err("executorPostalCode")} required>
            <Input value={executor.postalCode} onChange={(event) => updateExecutor({ postalCode: event.target.value })} placeholder="V6B 1A1" />
          </FormRow>
        </div>
      </QuestionCard>

      <QuestionCard title="Communication preferences" description="Tell us how and when to reach you for quick clarifications.">
        <div className="grid gap-4 md:grid-cols-2">
          <FormRow fieldId="applicant-pronouns" label="Preferred pronouns" error={err("executorPronouns")}>
            <Input value={executor.preferredPronouns} onChange={(event) => updateExecutor({ preferredPronouns: event.target.value })} placeholder="They/them" />
          </FormRow>
          <FormRow fieldId="applicant-employer" label="Employer or role" error={err("executorEmployer")}>
            <Input value={executor.employer} onChange={(event) => updateExecutor({ employer: event.target.value })} placeholder="Consultant" />
          </FormRow>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <FormRow fieldId="applicant-communication" label="Preferred contact method" error={err("executorCommunication")} required>
            <select
              value={executor.communicationPreference}
              onChange={(event) => updateExecutor({ communicationPreference: event.target.value as typeof executor.communicationPreference })}
              className="w-full rounded-2xl border border-[color:var(--border-muted)] bg-white px-4 py-3 text-sm"
            >
              <option value="email">Email</option>
              <option value="phone">Phone</option>
              <option value="either">Either</option>
            </select>
          </FormRow>
          <FormRow fieldId="applicant-availability" label="Availability window" error={err("executorAvailability")}>
            <Input value={executor.availabilityWindow} onChange={(event) => updateExecutor({ availabilityWindow: event.target.value })} placeholder="Weekdays 9-3 PT" />
          </FormRow>
        </div>
        <FormRow fieldId="applicant-consent" label="Consent" error={err("welcomeConsent")} required>
          <div className="flex items-start gap-3 rounded-2xl border border-[color:var(--border-muted)] bg-[color:var(--bg-muted)] p-4">
            <input
              id="welcome-consent"
              type="checkbox"
              checked={welcome.consent}
              onChange={(event) => updateWelcome({ consent: event.target.checked })}
              className="mt-1 h-4 w-4 rounded border-[color:var(--border-muted)] text-[color:var(--brand-navy)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--brand-navy)]"
            />
            <label htmlFor="welcome-consent" className="text-sm text-[color:var(--ink)]">
              I understand Probate Desk provides document preparation support and general information, not legal advice.
            </label>
          </div>
        </FormRow>
      </QuestionCard>
    </div>
  );
}
