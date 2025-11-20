import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormRow } from "@/components/wizard/FormRow";
import { QuestionCard } from "@/components/intake/question-card";
import { ExplainToggle } from "@/components/intake/explain-toggle";
import type { PortalStepErrors } from "@/lib/intake/portal/validation";
import type { IntakeDraft } from "@/lib/intake/types";

interface DeceasedStepProps {
  draft: IntakeDraft;
  errors: PortalStepErrors;
  showErrors: boolean;
  updateDeceased: (updates: Partial<IntakeDraft["deceased"]>) => void;
}

export function DeceasedStep({ draft, errors, showErrors, updateDeceased }: DeceasedStepProps) {
  const deceased = draft.deceased;
  const fieldError = (key: keyof PortalStepErrors) => (showErrors ? errors[key] : undefined);

  return (
    <div className="space-y-6">
      <QuestionCard title="Full legal name" description="Match exactly what appears on the death certificate.">
        <FormRow fieldId="deceased-full-name" label="Full legal name" error={fieldError("deceasedFullName")} required>
          <Input
            value={deceased.fullName}
            onChange={(event) => updateDeceased({ fullName: event.target.value })}
            placeholder="First Middle Last"
          />
        </FormRow>
      </QuestionCard>

      <QuestionCard title="Key dates" description="Courts cross-check these dates across every schedule.">
        <div className="grid gap-4 md:grid-cols-2">
          <FormRow fieldId="deceased-date-of-death" label="Date of death" error={fieldError("deceasedDateOfDeath")} required>
            <Input
              type="date"
              value={deceased.dateOfDeath}
              onChange={(event) => updateDeceased({ dateOfDeath: event.target.value })}
            />
          </FormRow>
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
