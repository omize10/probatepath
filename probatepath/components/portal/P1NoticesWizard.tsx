"use client";

import { useState } from "react";
import { PortalWizardShell } from "@/components/portal/PortalWizardShell";

interface P1NoticesWizardProps {
  caseId: string;
  pdfUrl: string | null;
  packetUrl?: string | null;
  recipientCount: number | null;
  showWillSearchWarning: boolean;
  onSubmitAction: (formData: FormData) => void | Promise<void>;
}

export function P1NoticesWizard({ caseId, pdfUrl, packetUrl, recipientCount, showWillSearchWarning, onSubmitAction }: P1NoticesWizardProps) {
  const [step, setStep] = useState(0);
  const totalSteps = 5;

  const primaryLabel =
    step === 0
      ? "Start notices"
      : step === totalSteps - 1
      ? "Confirm I’ve sent every notice"
      : step === 1
      ? "I’ve printed the notices"
      : step === 2
      ? "I’ve signed all copies"
      : step === 3
      ? "I’ve sent all notices"
      : "Next";

  const bodies = [
    {
      title: "Step 2: P1 notices",
      subtitle: "Now we send notice of your probate application to the people who must be told.",
      body: (
        <p className="text-sm text-gray-700">
          You’ll download the P1 notice, sign it, and send it to everyone entitled to notice. We’ll walk you through printing, signing, and mailing/emailing copies.
        </p>
      ),
      backHref: "/portal",
    },
    {
      title: "Download your P1 notice",
      subtitle: "Print one copy for each person who must receive notice.",
      body: (
        <div className="space-y-3">
          {pdfUrl ? (
            <div className="space-y-2">
              {packetUrl ? (
                <a
                  href={packetUrl}
                  target="_blank"
                  className="inline-flex items-center rounded-full bg-gray-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-black"
                >
                  Download P1 + cover letter packet (recommended)
                </a>
              ) : null}
              <a
                href={pdfUrl}
                target="_blank"
                className="inline-flex items-center rounded-full border border-gray-900 px-4 py-2 text-sm font-semibold text-gray-900 transition hover:bg-gray-900 hover:text-white"
              >
                Download P1 notice only
              </a>
            </div>
          ) : (
            <button
              disabled
              className="inline-flex items-center rounded-full border border-red-300 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700"
            >
              PDF not found (please upload in ops)
            </button>
          )}
          <p className="text-sm text-gray-700">
            Our records show {recipientCount ?? "at least one"} recipient(s). Print extra copies if you need them.
          </p>
        </div>
      ),
    },
    {
      title: "Sign the notice",
      subtitle: "Sign the original and make copies.",
      body: (
        <p className="text-sm text-gray-700">Sign the original notice. Then make photocopies so each person receives a signed copy.</p>
      ),
    },
    {
      title: "Send each notice",
      subtitle: "Mail or email each person entitled to notice.",
      body: (
        <p className="text-sm text-gray-700">
          For each person entitled to notice: mail the signed notice, or email a scanned copy and wait for them to reply confirming they got it. Most people simply mail the
          notices.
        </p>
      ),
    },
    {
      title: "21-day waiting period",
      subtitle: "Confirm you’ve sent every notice.",
      body: (
        <div className="space-y-2">
          <p className="text-sm text-gray-700">
            After you send your notices, you must wait 21 days before you file your probate application. The court needs to give recipients time to respond.
          </p>
          <p className="text-sm text-gray-700">Tap the button below once you’re sure you’ve sent every notice.</p>
        </div>
      ),
    },
  ];

  const current = bodies[step];

  return (
    <div className="space-y-4">
      {showWillSearchWarning ? (
        <div className="rounded-2xl border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-900">
          We haven’t recorded that you’ve mailed your will search yet. You can still prepare P1 notices, but make sure the will search is sent first.
        </div>
      ) : null}
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
            <form action={onSubmitAction}>
              <input type="hidden" name="caseId" value={caseId} />
              <button className="inline-flex items-center rounded-full bg-gray-900 px-5 py-2 text-sm font-semibold text-white transition hover:bg-black">
                {primaryLabel}
              </button>
            </form>
          ) : undefined
        }
      >
        {current.body}
      </PortalWizardShell>
    </div>
  );
}
