import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormRow } from "@/components/wizard/FormRow";
import { QuestionCard } from "@/components/intake/question-card";
import { YesNoPill } from "@/components/intake/yes-no-pill";
import type { PortalStepErrors } from "@/lib/intake/portal/validation";
import type { IntakeDraft } from "@/lib/intake/types";

interface OtherQuestionsStepProps {
  draft: IntakeDraft;
  errors: PortalStepErrors;
  showErrors: boolean;
  updateDeceased: (updates: Partial<IntakeDraft["deceased"]>) => void;
  updateWill: (updates: Partial<IntakeDraft["will"]>) => void;
}

export function OtherQuestionsStep({ draft, errors, showErrors, updateDeceased, updateWill }: OtherQuestionsStepProps) {
  const { deceased, will } = draft;
  const err = (key: keyof PortalStepErrors) => (showErrors ? errors[key] : undefined);

  return (
    <div className="space-y-6">
      <QuestionCard title="Family and prior relationships" description="These answers help us determine who needs notice and whether affidavits about relationships are required.">
        <div className="grid gap-4 md:grid-cols-2">
          <FormRow fieldId="other-prior-unions" label="Any prior marriages or unions?" error={err("deceasedPriorUnions")} required>
            <YesNoPill value={deceased.hadPriorUnions} onChange={(value) => updateDeceased({ hadPriorUnions: value })} questionId="other-prior-unions" />
          </FormRow>
          <FormRow fieldId="other-children" label="Number of children" error={err("deceasedChildrenCount")}>
            <Input value={deceased.childrenCount} onChange={(event) => updateDeceased({ childrenCount: event.target.value })} />
          </FormRow>
        </div>
        <FormRow fieldId="other-assets-outside" label="Assets outside Canada?" error={err("deceasedAssetsOutsideCanada")} required>
          <YesNoPill value={deceased.assetsOutsideCanada} onChange={(value) => updateDeceased({ assetsOutsideCanada: value })} questionId="other-assets-outside" />
        </FormRow>
        <FormRow fieldId="other-assets-details" label="Foreign asset details" error={err("deceasedAssetsOutsideDetails")}>
          <Textarea
            rows={3}
            value={deceased.assetsOutsideDetails}
            onChange={(event) => updateDeceased({ assetsOutsideDetails: event.target.value })}
            placeholder="List property or accounts outside Canada"
          />
        </FormRow>
        <FormRow fieldId="other-digital-notes" label="Digital estate notes" error={err("deceasedDigitalEstateNotes")}>
          <Textarea
            rows={3}
            value={deceased.digitalEstateNotes}
            onChange={(event) => updateDeceased({ digitalEstateNotes: event.target.value })}
            placeholder="Passwords, Apple ID legacy contacts, etc."
          />
        </FormRow>
      </QuestionCard>

      <QuestionCard title="Filing preferences" description="Helps us plan timelines and document delivery.">
        <FormRow fieldId="other-probate-registry" label="Preferred probate registry" error={err("willProbateRegistry")}>
          <Input value={will.probateRegistry} onChange={(event) => updateWill({ probateRegistry: event.target.value })} placeholder="Vancouver" />
        </FormRow>
        <div className="grid gap-4 md:grid-cols-2">
          <FormRow fieldId="other-delivery" label="Document delivery preference" error={err("willDocumentPreference")}>
            <Input
              value={will.documentDeliveryPreference}
              onChange={(event) => updateWill({ documentDeliveryPreference: event.target.value })}
              placeholder="Secure download, courier, etc."
            />
          </FormRow>
          <FormRow fieldId="other-expected" label="Target filing date" error={err("willExpectedFilingDate")}>
            <Input type="date" value={will.expectedFilingDate} onChange={(event) => updateWill({ expectedFilingDate: event.target.value })} />
          </FormRow>
        </div>
        <FormRow fieldId="other-special-requests" label="Special requests" error={err("willSpecialRequests")}>
          <Textarea
            rows={3}
            value={will.specialRequests}
            onChange={(event) => updateWill({ specialRequests: event.target.value })}
            placeholder="Accessibility needs, courier instructions, etc."
          />
        </FormRow>
      </QuestionCard>
    </div>
  );
}
