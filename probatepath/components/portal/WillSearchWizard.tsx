"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { PortalWizardShell } from "@/components/portal/PortalWizardShell";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { WarningCallout } from "@/components/ui/warning-callout";

interface WillSearchWizardProps {
  caseId: string;
  pdfUrl: string | null;
  onSubmitAction: (formData: FormData) => void | Promise<void>;
}

export function WillSearchWizard({ caseId, pdfUrl, onSubmitAction }: WillSearchWizardProps) {
  const [step, setStep] = useState(0);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const totalSteps = 5;

  const primaryLabel =
    step === 0
      ? "Start will search"
      : step === totalSteps - 1
      ? "I’ve mailed the will search"
      : step === 1
      ? "I’ve printed the form"
      : step === 2
      ? "I’ve signed and filled in payment"
      : step === 3
      ? "Envelope is ready"
      : "Next";

  const bodies = [
    {
      title: "Step 1: Will search",
      subtitle: "First we send a will search request to Vital Statistics.",
      body: (
        <p className="text-sm text-slate-700">
          A will search checks Vital Statistics for any registered wills. We’ll walk you through downloading, signing, and mailing the form so you can get your result.
        </p>
      ),
      backHref: "/portal",
    },
    {
      title: "Download your will search form",
      subtitle: "Print one copy of this form. You’ll sign and mail it in the next steps.",
      body: (
        <div className="space-y-3">
          {pdfUrl ? (
            <a
              href={pdfUrl}
              target="_blank"
              className="inline-flex items-center rounded-full border border-gray-900 px-4 py-2 text-sm font-semibold text-[color:var(--ink)] transition hover:bg-gray-900 hover:text-white"
            >
              Download form
            </a>
          ) : (
            <button
              disabled
              className="inline-flex items-center rounded-full border border-red-300 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700"
            >
              PDF not found (please upload in ops)
            </button>
          )}
          <p className="text-sm text-slate-700">If you cannot download it, contact support and we’ll resend it.</p>
        </div>
      ),
    },
    {
      title: "Sign the form and fill in payment",
      subtitle: "Sign where indicated for the applicant and add payment.",
      body: (
        <p className="text-sm text-slate-700">
          Enter your credit card details in the payment section (or follow any payment instructions on the form). Make sure every signature line for the applicant is signed.
        </p>
      ),
    },
    {
      title: "Prepare your mailing",
      subtitle: "Bundle the documents.",
      body: (
        <p className="text-sm text-slate-700">Put the signed will search form and a photocopy of the death certificate into an envelope.</p>
      ),
    },
    {
      title: "Mail it to Vital Statistics",
      subtitle: "Send the envelope.",
      body: (
        <div className="space-y-4">
          <p className="text-sm text-slate-700">Mail the envelope to the address printed on the form.</p>
          <WarningCallout severity="warning" title="Before you confirm">
            Only click the button below after you have actually mailed the envelope.
            This starts your case timeline and cannot be undone.
          </WarningCallout>
        </div>
      ),
    },
  ];

  const current = bodies[step];

  return (
    <PortalWizardShell
      title={current.title}
      subtitle={current.subtitle}
      step={step}
      totalSteps={totalSteps}
      primaryLabel={primaryLabel}
      onNext={
        step === totalSteps - 1
          ? undefined
          : () => {
              setStep((prev) => Math.min(prev + 1, totalSteps - 1));
            }
      }
      onBack={step > 0 && step !== 0 ? () => setStep((prev) => Math.max(prev - 1, 0)) : undefined}
      backHref={step === 0 ? "/portal" : undefined}
      primaryButtonOverride={
        step === totalSteps - 1 ? (
          <>
            {/* Hidden form for actual submission */}
            <form ref={formRef} action={onSubmitAction} className="hidden">
              <input type="hidden" name="caseId" value={caseId} />
            </form>
            {/* Button that opens confirmation dialog */}
            <button
              type="button"
              onClick={() => setShowConfirm(true)}
              disabled={isSubmitting}
              className="inline-flex items-center rounded-full bg-gray-900 px-5 py-2 text-sm font-semibold text-white transition hover:bg-black disabled:opacity-50"
            >
              {isSubmitting ? "Submitting..." : primaryLabel}
            </button>
          </>
        ) : undefined
      }
    >
      {current.body}
      {/* Dev mode skip button */}
      {process.env.NEXT_PUBLIC_DEV_MODE === "true" && step < totalSteps - 1 && (
        <button
          type="button"
          onClick={() => setStep(totalSteps - 1)}
          className="mt-4 w-full rounded-full border-2 border-dashed border-purple-400 bg-purple-50 px-6 py-3 text-sm font-semibold text-purple-700 transition hover:bg-purple-100"
        >
          [DEV] Skip to final step
        </button>
      )}

      {/* Confirmation dialog for will search mailed */}
      <ConfirmDialog
        open={showConfirm}
        onOpenChange={setShowConfirm}
        title="Confirm will search mailed"
        severity="warning"
        confirmMode="type"
        confirmWord="MAILED"
        description={`Once you confirm, this starts your case timeline.

Make sure you have:
• Actually mailed the envelope
• Included the signed will search form
• Included a copy of the death certificate

Type MAILED to confirm.`}
        confirmLabel="Confirm mailed"
        loading={isSubmitting}
        onConfirm={() => {
          setIsSubmitting(true);
          formRef.current?.requestSubmit();
        }}
      />
    </PortalWizardShell>
  );
}
