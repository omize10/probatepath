'use client';

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { StepShell } from "@/components/wizard/StepShell";
import { Summary } from "@/components/wizard/Summary";
import { Guard } from "@/components/wizard/Guard";
import { useIntake } from "@/lib/intake/store";
import { confirmationSchema, extractErrors } from "@/lib/intake/schema";
import { useWizard } from "@/components/wizard/use-wizard";
import { submitIntake } from "@/lib/intake/api";

export default function ReviewPage() {
  const { draft, update } = useIntake();
  const { goNext } = useWizard("review");
  const router = useRouter();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const values = draft.confirmation;

  const isValid = useMemo(() => confirmationSchema.safeParse(values).success, [values]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const result = confirmationSchema.safeParse(values);
    if (!result.success) {
      setErrors(extractErrors(result.error));
      return;
    }
    setErrors({});
    setSubmitting(true);
    try {
      await submitIntake(draft);
      // Notify unsaved-guard to allow navigation temporarily
      try {
        window.dispatchEvent(new CustomEvent('intake:submitted'));
      } catch (err) {
        // noop
      }
      // Redirect to confirmation page instead of goNext (wizard step)
      router.push("/portal/confirmation");
    } catch (err) {
      console.error("Submit failed:", err);
      const msg = err instanceof Error ? err.message : String(err);
      setSubmitError(msg || "Failed to submit. Please try again.");
      setErrors({ _form: "Failed to submit. You can retry or download a JSON backup." });
      setSubmitting(false);
    }
  };

  const handleRetry = async () => {
    setSubmitError(null);
    setSubmitting(true);
    try {
      await submitIntake(draft);
      try {
        window.dispatchEvent(new CustomEvent('intake:submitted'));
      } catch {}
      router.push("/portal/confirmation");
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setSubmitError(msg || "Failed to submit. Please try again.");
      setSubmitting(false);
    }
  };

  const handleDownloadJson = () => {
    try {
      const payload = JSON.stringify(draft, null, 2);
      const blob = new Blob([payload], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = "probatepath-intake-draft.json";
      anchor.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Failed to download JSON", err);
    }
  };

  return (
    <>
      <Guard stepId="review" />
      <StepShell
        stepId="review"
        title="Review your information"
        description="Check the details before we generate your summary. You can edit any section and confirm when ready to proceed."
        nextLabel="Confirm and finish"
        isNextDisabled={!isValid || submitting}
        onSubmit={handleSubmit}
      >
        <Summary draft={draft} />

        <div className="space-y-2">
          <div className="flex items-start gap-3 rounded-2xl border border-[#e2e8f0] bg-[#f7f8fa] p-4">
            <input
              id="review-confirm"
              type="checkbox"
              checked={values.confirmed}
              onChange={(event) =>
                update("confirmation", { confirmed: event.target.checked })
              }
              className="mt-1 h-4 w-4 rounded border-[#c7cfdf] bg-white text-[#ff6a00] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1e3a8a]"
              aria-invalid={errors.confirmed ? true : undefined}
              aria-describedby={errors.confirmed ? "review-confirm-error" : undefined}
            />
            <label htmlFor="review-confirm" className="text-sm text-[#0f172a]">
              I confirm the information above is accurate to the best of my knowledge.
            </label>
          </div>
          {errors.confirmed ? (
            <p id="review-confirm-error" className="text-xs font-medium text-[#c2410c]">
              {errors.confirmed}
            </p>
          ) : null}
          {errors._form ? (
            <p className="text-xs font-medium text-[#c2410c]">
              {errors._form}
            </p>
          ) : null}
          {submitError ? (
            <div className="flex items-center gap-3">
              <p className="text-xs font-medium text-[#c2410c]">{submitError}</p>
              <div className="ml-2 flex gap-2">
                <button
                  type="button"
                  className="text-xs underline"
                  onClick={handleRetry}
                >
                  Retry
                </button>
                <button
                  type="button"
                  className="text-xs underline"
                  onClick={handleDownloadJson}
                >
                  Download draft JSON
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </StepShell>
    </>
  );
}
