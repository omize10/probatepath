"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { WarningCallout } from "@/components/ui/warning-callout";
import { ForcedPause } from "@/components/ui/forced-pause";

interface ProbateFilingConfirmProps {
  caseId: string;
  caseCode: string;
  pathType: string;
  onSubmitAction: (formData: FormData) => void | Promise<void>;
}

export function ProbateFilingConfirm({ caseId, caseCode, pathType, onSubmitAction }: ProbateFilingConfirmProps) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const isAdmin = pathType === "administration";
  const pathLabel = isAdmin ? "administration" : "probate";
  const confirmWord = "FILED";

  const handleConfirm = () => {
    setIsSubmitting(true);
    formRef.current?.requestSubmit();
  };

  return (
    <div className="space-y-4">
      {/* Instructions */}
      <div className="text-sm text-gray-700 space-y-2">
        <ul className="list-disc space-y-1 pl-5">
          <li>You can mail or bring this package to the Supreme Court registry that handles your {pathLabel} application.</li>
          <li>Use the address shown on your filing packet or on the court website.</li>
          <li>
            Write your CASE ID <span className="font-mono">{caseCode}</span> on the outside of the envelope.
          </li>
          <li>Processing can take several weeks or longer. This is normal.</li>
        </ul>
      </div>

      {/* Warning callout */}
      <WarningCallout severity="danger" title="This cannot be undone">
        <p>Only confirm after you have <strong>actually mailed or delivered</strong> your package to the court.</p>
        <p className="mt-2">Once you confirm, we will record that your {pathLabel} application has been filed.</p>
      </WarningCallout>

      {/* Forced pause before showing the button */}
      <ForcedPause
        seconds={10}
        message="Filing is irreversible. Please take a moment to verify you have actually mailed or filed your package."
        confirmMessage="I have read and understand this warning"
      >
        {/* Hidden form for submission */}
        <form ref={formRef} action={onSubmitAction} className="hidden">
          <input type="hidden" name="caseId" value={caseId} />
          <input type="hidden" name="nextStep" value="8" />
        </form>

        {/* Filing confirmation buttons */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <button
            type="button"
            onClick={() => setShowConfirm(true)}
            disabled={isSubmitting}
            className="inline-flex items-center rounded-full bg-gray-900 px-5 py-2 text-sm font-semibold text-white transition hover:bg-black disabled:opacity-50"
          >
            {isSubmitting ? "Processing..." : `I've mailed or filed my ${pathLabel} package`}
          </button>
          <Link
            href="/portal"
            className="inline-flex items-center rounded-full border border-[color:var(--border-muted)] px-5 py-2 text-sm font-semibold text-[color:var(--ink)] transition hover:border-[color:var(--brand)] hover:text-[color:var(--brand)]"
          >
            Back to portal
          </Link>
        </div>
      </ForcedPause>

      {/* Type-to-confirm dialog */}
      <ConfirmDialog
        open={showConfirm}
        onOpenChange={setShowConfirm}
        title={`Confirm ${pathLabel} filed`}
        severity="danger"
        confirmMode="type"
        confirmWord={confirmWord}
        description={`This action CANNOT be undone.

Only confirm if you have:
• Actually mailed or delivered the package to the court
• Kept your courier tracking number (if mailed)
• Made copies of everything for your records

Type ${confirmWord} to confirm your filing.`}
        confirmLabel="Confirm filed"
        loading={isSubmitting}
        onConfirm={handleConfirm}
      />
    </div>
  );
}
