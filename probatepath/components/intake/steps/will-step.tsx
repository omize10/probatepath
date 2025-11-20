import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormRow } from "@/components/wizard/FormRow";
import { QuestionCard } from "@/components/intake/question-card";
import { YesNoPill } from "@/components/intake/yes-no-pill";
import { ExplainToggle } from "@/components/intake/explain-toggle";
import type { PortalStepErrors } from "@/lib/intake/portal/validation";
import type { IntakeDraft } from "@/lib/intake/types";

interface WillStepProps {
  draft: IntakeDraft;
  errors: PortalStepErrors;
  showErrors: boolean;
  updateDeceased: (updates: Partial<IntakeDraft["deceased"]>) => void;
  updateWill: (updates: Partial<IntakeDraft["will"]>) => void;
}

export function WillStep({ draft, errors, showErrors, updateDeceased, updateWill }: WillStepProps) {
  const err = (key: keyof PortalStepErrors) => (showErrors ? errors[key] : undefined);
  const { deceased, will } = draft;

  return (
    <div className="space-y-6">
      <QuestionCard title="Original will" description="Tell us where the signed original lives and how it was executed.">
        <FormRow fieldId="will-had-will" label="Is there an original signed will?" error={err("deceasedHadWill")} required>
          <YesNoPill value={deceased.hadWill} onChange={(value) => updateDeceased({ hadWill: value })} questionId="will-had-will" />
        </FormRow>
        <FormRow fieldId="will-location" label="Where is the original stored?" error={err("willLocation")} required>
          <Textarea
            value={will.willLocation}
            onChange={(event) => updateWill({ willLocation: event.target.value })}
            rows={3}
            placeholder="Locked file cabinet at home, safety deposit box, etc."
          />
        </FormRow>
        <div className="grid gap-4 md:grid-cols-2">
          <FormRow fieldId="will-physical-date" label="Date on the physical will" error={err("willPhysicalDate")}>
            <Input type="date" value={will.physicalWillDate} onChange={(event) => updateWill({ physicalWillDate: event.target.value })} />
          </FormRow>
          <FormRow fieldId="will-electronic-date" label="Electronic will signing date" error={err("willElectronicDate")}>
            <Input type="date" value={will.electronicWillDate} onChange={(event) => updateWill({ electronicWillDate: event.target.value })} />
          </FormRow>
        </div>
        <ExplainToggle>
          <p>If you have only a copy, explain where the original might be. The registry requires the original document to issue a grant.</p>
        </ExplainToggle>
      </QuestionCard>

      <QuestionCard title="Codicils and notarisation" description="Let us know about any amendments or special signing circumstances.">
        <FormRow fieldId="will-has-codicils" label="Are there codicils or later amendments?" error={err("willHasCodicils")} required>
          <YesNoPill value={will.hasCodicils} onChange={(value) => updateWill({ hasCodicils: value })} questionId="will-has-codicils" />
        </FormRow>
        <FormRow fieldId="will-codicil-details" label="Codicil details" error={err("willCodicilDetails")}>
          <Textarea
            value={will.codicilDetails}
            onChange={(event) => updateWill({ codicilDetails: event.target.value })}
            rows={3}
            placeholder="Describe what changed and when"
          />
        </FormRow>
        <FormRow fieldId="will-notary" label="Do you need help coordinating notarisation?" error={err("willNeedsNotary")} required>
          <YesNoPill value={will.notaryNeeded} onChange={(value) => updateWill({ notaryNeeded: value })} questionId="will-notary" />
        </FormRow>
      </QuestionCard>
    </div>
  );
}
