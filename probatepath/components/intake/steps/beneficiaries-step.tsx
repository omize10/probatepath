import { Textarea } from "@/components/ui/textarea";
import { FormRow } from "@/components/wizard/FormRow";
import { QuestionCard } from "@/components/intake/question-card";
import { YesNoPill } from "@/components/intake/yes-no-pill";
import type { PortalStepErrors } from "@/lib/intake/portal/validation";
import type { IntakeDraft } from "@/lib/intake/types";

interface BeneficiariesStepProps {
  draft: IntakeDraft;
  errors: PortalStepErrors;
  showErrors: boolean;
  updateWill: (updates: Partial<IntakeDraft["will"]>) => void;
}

export function BeneficiariesStep({ draft, errors, showErrors, updateWill }: BeneficiariesStepProps) {
  const { will } = draft;
  const err = (key: keyof PortalStepErrors) => (showErrors ? errors[key] : undefined);

  return (
    <div className="space-y-6">
      <QuestionCard title="Beneficiary overview" description="High-level details help us prepare the P9 notices and beneficiary schedules.">
        <FormRow fieldId="beneficiaries-multiple" label="Are there multiple beneficiaries?" error={err("willMultipleBeneficiaries")} required>
          <YesNoPill
            value={will.multipleBeneficiaries}
            onChange={(value) => updateWill({ multipleBeneficiaries: value })}
            questionId="beneficiaries-multiple"
          />
        </FormRow>
        <FormRow fieldId="beneficiaries-special" label="Any special circumstances?" error={err("willSpecialCircumstances")}>
          <Textarea
            rows={3}
            value={will.specialCircumstances}
            onChange={(event) => updateWill({ specialCircumstances: event.target.value })}
            placeholder="e.g., estranged children, minors, dependants with disabilities"
          />
        </FormRow>
        <FormRow fieldId="beneficiaries-charitable" label="Charitable gifts" error={err("willCharitableGifts")}>
          <Textarea
            rows={3}
            value={will.charitableGifts}
            onChange={(event) => updateWill({ charitableGifts: event.target.value })}
            placeholder="e.g., $5,000 to BC Cancer Foundation"
          />
        </FormRow>
      </QuestionCard>
    </div>
  );
}
