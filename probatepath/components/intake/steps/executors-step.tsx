import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormRow } from "@/components/wizard/FormRow";
import { QuestionCard } from "@/components/intake/question-card";
import { YesNoPill } from "@/components/intake/yes-no-pill";
import type { PortalStepErrors } from "@/lib/intake/portal/validation";
import type { IntakeDraft } from "@/lib/intake/types";

interface ExecutorsStepProps {
  draft: IntakeDraft;
  errors: PortalStepErrors;
  showErrors: boolean;
  updateExecutor: (updates: Partial<IntakeDraft["executor"]>) => void;
}

export function ExecutorsStep({ draft, errors, showErrors, updateExecutor }: ExecutorsStepProps) {
  const { executor } = draft;
  const err = (key: keyof PortalStepErrors) => (showErrors ? errors[key] : undefined);

  return (
    <div className="space-y-6">
      <QuestionCard title="Support team" description="Tell us who else is involved so we know how to communicate.">
        <FormRow fieldId="executor-support" label="Other people helping you" error={err("executorSupportContacts")}>
          <Textarea
            value={executor.supportContacts}
            onChange={(event) => updateExecutor({ supportContacts: event.target.value })}
            rows={3}
            placeholder="List co-executors, siblings, advisors, or friends"
          />
        </FormRow>
        <div className="grid gap-4 md:grid-cols-2">
          <FormRow fieldId="executor-emergency-name" label="Emergency contact name" error={err("executorEmergencyName")} required>
            <Input value={executor.emergencyContactName} onChange={(event) => updateExecutor({ emergencyContactName: event.target.value })} />
          </FormRow>
          <FormRow fieldId="executor-emergency-phone" label="Emergency contact phone" error={err("executorEmergencyPhone")} required>
            <Input value={executor.emergencyContactPhone} onChange={(event) => updateExecutor({ emergencyContactPhone: event.target.value })} />
          </FormRow>
        </div>
      </QuestionCard>

      <QuestionCard title="Alternate executors" description="Share details so we can build the supplemental schedules correctly.">
        <FormRow fieldId="executor-alternate" label="Is there an alternate executor?" error={err("executorAlternate")} required>
          <YesNoPill value={executor.alternateExecutor} onChange={(value) => updateExecutor({ alternateExecutor: value })} questionId="executor-alternate" />
        </FormRow>
        <FormRow fieldId="executor-alternate-details" label="Alternate executor details" error={err("executorAlternateDetails")}>
          <Textarea
            value={executor.alternateExecutorDetails}
            onChange={(event) => updateExecutor({ alternateExecutorDetails: event.target.value })}
            rows={3}
            placeholder="Names, contact info, or why someone is unable/unwilling to act"
          />
        </FormRow>
      </QuestionCard>
    </div>
  );
}
