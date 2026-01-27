"use client";

import { useState } from "react";
import type { EstateIntake } from "@/lib/intake/case-blueprint";
import { QuestionCard } from "@/components/intake/question-card";

interface DeathCertificateStepProps {
  estate: EstateIntake;
  updatePrerequisites: (updates: Partial<EstateIntake["prerequisites"]>) => void;
  errors?: { hasDeathCertificate?: string };
}

export function DeathCertificateStep({
  estate,
  updatePrerequisites,
  errors,
}: DeathCertificateStepProps) {
  const [showBlocker, setShowBlocker] = useState(
    estate.prerequisites.hasDeathCertificate === "no"
  );

  const handleHasCertificate = () => {
    updatePrerequisites({
      hasDeathCertificate: "yes",
      deathCertificateConfirmedAt: new Date().toISOString(),
    });
    setShowBlocker(false);
  };

  const handleNoCertificate = () => {
    updatePrerequisites({
      hasDeathCertificate: "no",
      deathCertificateConfirmedAt: "",
    });
    setShowBlocker(true);
  };

  const handleNowHaveCertificate = () => {
    updatePrerequisites({
      hasDeathCertificate: "yes",
      deathCertificateConfirmedAt: new Date().toISOString(),
    });
    setShowBlocker(false);
  };

  if (showBlocker) {
    return (
      <div className="space-y-6">
        <div className="rounded-2xl border-2 border-amber-300 bg-amber-50 p-6 space-y-4">
          <div className="flex items-start gap-3">
            <svg className="h-6 w-6 text-amber-600 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <h3 className="text-lg font-semibold text-amber-900">You need a death certificate to proceed</h3>
              <p className="mt-1 text-sm text-amber-800">
                BC probate courts require the original death certificate. You cannot file for probate without it.
              </p>
            </div>
          </div>

          <div className="border-t border-amber-200 pt-4">
            <h4 className="font-semibold text-amber-900 mb-2">How to get a death certificate:</h4>
            <ul className="space-y-2 text-sm text-amber-800">
              <li className="flex items-start gap-2">
                <span className="text-amber-600 font-bold">1.</span>
                <span>Your funeral home usually provides 2 copies automatically as part of their service.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-600 font-bold">2.</span>
                <span>
                  Order additional copies online:{" "}
                  <a
                    href="https://ecos.vs.gov.bc.ca"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline font-medium text-amber-900 hover:text-amber-700"
                  >
                    ecos.vs.gov.bc.ca
                  </a>
                </span>
              </li>
            </ul>
          </div>

          <div className="border-t border-amber-200 pt-4">
            <h4 className="font-semibold text-amber-900 mb-2">Cost and timing:</h4>
            <div className="grid gap-2 sm:grid-cols-2 text-sm">
              <div className="rounded-lg bg-white p-3 border border-amber-200">
                <p className="font-semibold text-amber-900">Standard delivery</p>
                <p className="text-amber-700">$27 · 2-5 business days</p>
              </div>
              <div className="rounded-lg bg-white p-3 border border-amber-200">
                <p className="font-semibold text-amber-900">Courier (rush)</p>
                <p className="text-amber-700">$60 · Next business day</p>
              </div>
            </div>
          </div>

          <div className="border-t border-amber-200 pt-4 space-y-3">
            <button
              type="button"
              onClick={handleNowHaveCertificate}
              className="w-full rounded-full bg-amber-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-amber-700"
            >
              I now have the death certificate
            </button>

            {/* Dev mode skip button */}
            {process.env.NEXT_PUBLIC_DEV_MODE === "true" && (
              <button
                type="button"
                onClick={handleNowHaveCertificate}
                className="w-full rounded-full border-2 border-dashed border-purple-400 bg-purple-50 px-6 py-3 text-sm font-semibold text-purple-700 transition hover:bg-purple-100"
              >
                [DEV] Skip - Pretend I have certificate
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <QuestionCard
        title="Do you have the death certificate?"
        description="The death certificate is required to apply for probate in BC. The court will need to see the original."
        why="BC Supreme Court requires a certified copy of the death certificate as proof of death before granting probate or administration."
        where="Your funeral home typically provides copies. You can also order from BC Vital Statistics (ecos.vs.gov.bc.ca)."
      >
        <div className="space-y-3">
          <button
            type="button"
            onClick={handleHasCertificate}
            className={`w-full rounded-xl border-2 px-4 py-4 text-left transition ${
              estate.prerequisites.hasDeathCertificate === "yes"
                ? "border-[color:var(--brand)] bg-blue-50"
                : "border-[color:var(--border-muted)] hover:border-[color:var(--brand)]/50"
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`flex h-6 w-6 items-center justify-center rounded-full border-2 ${
                  estate.prerequisites.hasDeathCertificate === "yes"
                    ? "border-[color:var(--brand)] bg-[color:var(--brand)]"
                    : "border-gray-300"
                }`}
              >
                {estate.prerequisites.hasDeathCertificate === "yes" && (
                  <svg className="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </div>
              <div>
                <p className="font-semibold text-[color:var(--ink)]">Yes, I have the death certificate</p>
                <p className="text-sm text-[color:var(--ink-muted)]">I have the original or a certified copy ready</p>
              </div>
            </div>
          </button>

          <button
            type="button"
            onClick={handleNoCertificate}
            className={`w-full rounded-xl border-2 px-4 py-4 text-left transition ${
              estate.prerequisites.hasDeathCertificate === "no"
                ? "border-amber-500 bg-amber-50"
                : "border-[color:var(--border-muted)] hover:border-amber-300"
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`flex h-6 w-6 items-center justify-center rounded-full border-2 ${
                  estate.prerequisites.hasDeathCertificate === "no"
                    ? "border-amber-500 bg-amber-500"
                    : "border-gray-300"
                }`}
              >
                {estate.prerequisites.hasDeathCertificate === "no" && (
                  <svg className="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </div>
              <div>
                <p className="font-semibold text-[color:var(--ink)]">No, I don't have it yet</p>
                <p className="text-sm text-[color:var(--ink-muted)]">I need to obtain the death certificate first</p>
              </div>
            </div>
          </button>
        </div>
        {errors?.hasDeathCertificate && (
          <p className="mt-2 text-sm text-red-600">{errors.hasDeathCertificate}</p>
        )}
      </QuestionCard>
    </div>
  );
}
