import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { FormRow } from "@/components/wizard/FormRow";
import { QuestionCard } from "@/components/intake/question-card";
import { ExplainToggle } from "@/components/intake/explain-toggle";
import { WarningCallout } from "@/components/ui/warning-callout";
import type { PortalStepErrors } from "@/lib/intake/portal/validation";
import type { IntakeDraft } from "@/lib/intake/types";

interface DeceasedStepProps {
  draft: IntakeDraft;
  errors: PortalStepErrors;
  showErrors: boolean;
  updateDeceased: (updates: Partial<IntakeDraft["deceased"]>) => void;
}

// Date validation helpers
function isFutureDate(dateStr: string): boolean {
  if (!dateStr) return false;
  const date = new Date(dateStr);
  return date > new Date();
}

function isWithin7Days(dateStr: string): boolean {
  if (!dateStr) return false;
  const date = new Date(dateStr);
  const today = new Date();
  const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
  return date >= sevenDaysAgo && date <= today;
}

function isOver2YearsAgo(dateStr: string): boolean {
  if (!dateStr) return false;
  const date = new Date(dateStr);
  const today = new Date();
  const twoYearsAgo = new Date(today.getTime() - 2 * 365 * 24 * 60 * 60 * 1000);
  return date < twoYearsAgo;
}

export function DeceasedStep({ draft, errors, showErrors, updateDeceased }: DeceasedStepProps) {
  const deceased = draft.deceased;
  const fieldError = (key: keyof PortalStepErrors) => (showErrors ? errors[key] : undefined);
  const [nameConfirmed, setNameConfirmed] = useState(false);

  return (
    <div className="space-y-6">
      <QuestionCard title="Full legal name" description="Match exactly what appears on the death certificate.">
        <WarningCallout severity="danger" title="This name must match the death certificate exactly">
          <p>The court compares this to your death certificate. Any mismatch will delay or reject your application.</p>
          <p className="mt-1 text-sm">Include middle names exactly as they appear. Check for spelling, hyphens, and legal suffixes (Jr., Sr., III).</p>
        </WarningCallout>
        <FormRow fieldId="deceased-full-name" label="Full legal name" error={fieldError("deceasedFullName")} required>
          <Input
            value={deceased.fullName}
            onChange={(event) => {
              updateDeceased({ fullName: event.target.value });
              setNameConfirmed(false); // Reset confirmation when name changes
            }}
            placeholder="First Middle Last"
          />
        </FormRow>
        {deceased.fullName && (
          <div className="mt-3 flex items-start gap-3 p-3 bg-gray-50 rounded-lg border">
            <Checkbox
              id="name-confirm"
              checked={nameConfirmed}
              onCheckedChange={(checked) => setNameConfirmed(checked === true)}
            />
            <label htmlFor="name-confirm" className="text-sm leading-tight cursor-pointer">
              <span className="font-medium">I confirm this name matches the death certificate exactly</span>
              <span className="block text-slate-600 mt-0.5">I have checked spelling, middle names, and any suffixes</span>
            </label>
          </div>
        )}
      </QuestionCard>

      <QuestionCard title="Key dates" description="Courts cross-check these dates across every schedule.">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <FormRow fieldId="deceased-date-of-death" label="Date of death" error={fieldError("deceasedDateOfDeath")} required>
              <Input
                type="date"
                value={deceased.dateOfDeath}
                onChange={(event) => updateDeceased({ dateOfDeath: event.target.value })}
              />
            </FormRow>
            {isFutureDate(deceased.dateOfDeath) && (
              <WarningCallout severity="danger" className="mt-2">
                This date is in the future. Please check the date.
              </WarningCallout>
            )}
            {isWithin7Days(deceased.dateOfDeath) && (
              <WarningCallout severity="warning" className="mt-2">
                If death occurred less than a week ago, you may not have received the death certificate yet. You'll need the death certificate to proceed.
              </WarningCallout>
            )}
            {isOver2YearsAgo(deceased.dateOfDeath) && (
              <WarningCallout severity="info" className="mt-2">
                Delayed probate applications (over 2 years) may have additional requirements. We'll help you navigate these.
              </WarningCallout>
            )}
          </div>
          <FormRow fieldId="deceased-birth-date" label="Date of birth" error={fieldError("deceasedBirthDate")}>
            <Input
              type="date"
              value={deceased.birthDate}
              onChange={(event) => updateDeceased({ birthDate: event.target.value })}
            />
          </FormRow>
        </div>
      </QuestionCard>

      <QuestionCard title="Residency and background" description="These details help us prepare the P1 and P3 forms without missing anything.">
        <div className="grid gap-4 md:grid-cols-2">
          <FormRow fieldId="deceased-city" label="City and province of death" error={fieldError("deceasedCityProvince")} required>
            <Input
              value={deceased.cityProvince}
              onChange={(event) => updateDeceased({ cityProvince: event.target.value })}
              placeholder="Victoria, BC"
            />
          </FormRow>
          <FormRow fieldId="deceased-place-of-birth" label="Place of birth" error={fieldError("deceasedPlaceOfBirth")}>
            <Input
              value={deceased.placeOfBirth}
              onChange={(event) => updateDeceased({ placeOfBirth: event.target.value })}
              placeholder="Edmonton, AB"
            />
          </FormRow>
          <FormRow fieldId="deceased-marital-status" label="Marital status" error={fieldError("deceasedMaritalStatus") }>
            <Input value={deceased.maritalStatus} onChange={(event) => updateDeceased({ maritalStatus: event.target.value })} placeholder="Married" />
          </FormRow>
          <FormRow fieldId="deceased-occupation" label="Occupation" error={fieldError("deceasedOccupation") }>
            <Input value={deceased.occupation} onChange={(event) => updateDeceased({ occupation: event.target.value })} placeholder="Retired teacher" />
          </FormRow>
        </div>
        <FormRow fieldId="deceased-residence" label="Primary residence" error={fieldError("deceasedResidenceAddress") }>
          <Textarea
            value={deceased.residenceAddress}
            onChange={(event) => updateDeceased({ residenceAddress: event.target.value })}
            rows={2}
            placeholder="Street, city, province"
          />
        </FormRow>
        <div className="grid gap-4 md:grid-cols-2">
          <FormRow fieldId="deceased-residence-type" label="Residence type" error={fieldError("deceasedResidenceType") }>
            <Input value={deceased.residenceType} onChange={(event) => updateDeceased({ residenceType: event.target.value })} placeholder="Condo" />
          </FormRow>
          <FormRow fieldId="deceased-years-bc" label="Years lived in BC" error={fieldError("deceasedYearsInBC") }>
            <Input value={deceased.yearsLivedInBC} onChange={(event) => updateDeceased({ yearsLivedInBC: event.target.value })} placeholder="25" />
          </FormRow>
        </div>
        <ExplainToggle>
          <p>Write what you know. If you don’t have an exact figure, give your best estimate and we’ll confirm during document review.</p>
        </ExplainToggle>
      </QuestionCard>
    </div>
  );
}
