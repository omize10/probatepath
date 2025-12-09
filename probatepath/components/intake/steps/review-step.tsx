import Link from "next/link";
import { QuestionCard } from "@/components/intake/question-card";
import { FormRow } from "@/components/wizard/FormRow";
import type { PortalStepErrors } from "@/lib/intake/portal/validation";
import type { IntakeDraft } from "@/lib/intake/types";

interface ReviewStepProps {
  draft: IntakeDraft;
  errors: PortalStepErrors;
  showErrors: boolean;
  updateConfirmation: (confirmed: boolean) => void;
  journeyHref: string;
  infoHref: string;
  documentsHref: string;
  helpHref: string;
}

export function ReviewStep({ draft, errors, showErrors, updateConfirmation, journeyHref, infoHref, documentsHref, helpHref }: ReviewStepProps) {
  const err = (key: keyof PortalStepErrors) => (showErrors ? errors[key] : undefined);

  return (
    <div className="space-y-6">
      <QuestionCard title="Quick summary" description="Spot-check the highlights below. Use the step indicator to jump back if needed.">
        <ul className="space-y-2 text-sm text-[color:var(--ink)]">
          <li><strong>Deceased:</strong> {draft.deceased.fullName || "Add name"}</li>
          <li><strong>Executor:</strong> {draft.executor.fullName || "Add name"}</li>
          <li><strong>Estate value:</strong> {draft.will.estateValueRange}</li>
          <li><strong>Original will:</strong> {draft.will.willLocation || "Add location"}</li>
        </ul>
      </QuestionCard>

      <QuestionCard title="Confirm accuracy" description="You can keep editing later. We just need your acknowledgement before syncing everything.">
        <FormRow fieldId="review-confirm" label="" error={err("confirmed")} required>
          <div className="flex items-start gap-3 rounded-2xl border border-[color:var(--border-muted)] bg-[color:var(--bg-muted)] p-4">
            <input
              id="review-confirm"
              type="checkbox"
              checked={draft.confirmation.confirmed}
              onChange={(event) => updateConfirmation(event.target.checked)}
              className="mt-1 h-4 w-4 rounded border-[color:var(--border-muted)] text-[color:var(--brand-navy)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--brand-navy)]"
            />
            <label htmlFor="review-confirm" className="text-sm text-[color:var(--ink)]">
              I confirm this information is accurate to the best of my knowledge.
            </label>
          </div>
        </FormRow>
      </QuestionCard>

      <QuestionCard title="What happens next" description="Everything you just saved flows directly into the rest of the portal.">
        <ul className="space-y-3 text-sm text-[color:var(--ink-muted)]">
          <li>
            <strong className="text-[color:var(--ink)]">Portal home</strong> is where new steps unlock after we prepare documents. View it anytime on{" "}
            <Link href={journeyHref} className="text-[color:var(--brand-navy)] underline-offset-4 hover:underline">
              {journeyHref}
            </Link>
            .
          </li>
          <li>
            <strong className="text-[color:var(--ink)]">Your Info</strong> lets you tweak details later without redoing the full intake. Visit <Link href={infoHref} className="text-[color:var(--brand-navy)] underline-offset-4 hover:underline">Your Info</Link>.
          </li>
          <li>
            <strong className="text-[color:var(--ink)]">Documents</strong> is where you download P1, P3/P4, and the Phase 1 packet. Jump to <Link href={documentsHref} className="text-[color:var(--brand-navy)] underline-offset-4 hover:underline">Documents</Link> anytime.
          </li>
          <li>
            <strong className="text-[color:var(--ink)]">Help</strong> explains probate filing, witnessing, and Service BC submissions. The Help centre lives at <Link href={helpHref} className="text-[color:var(--brand-navy)] underline-offset-4 hover:underline">Help</Link>.
          </li>
        </ul>
      </QuestionCard>
    </div>
  );
}
