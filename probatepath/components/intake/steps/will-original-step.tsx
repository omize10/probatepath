"use client";

import { useState, useEffect } from "react";
import type { EstateIntake } from "@/lib/intake/case-blueprint";
import { QuestionCard } from "@/components/intake/question-card";
import { YesNoButtons } from "@/components/intake/patterns/yes-no-buttons";
import { Input } from "@/components/ui/input";

interface WillOriginalStepProps {
  matterId: string;
  estate: EstateIntake;
  updateWill: (updates: Partial<EstateIntake["will"]>) => void;
  errors?: {
    hasOriginal?: string;
    storageLocation?: string;
  };
}

export function WillOriginalStep({
  matterId,
  estate,
  updateWill,
  errors,
}: WillOriginalStepProps) {
  const will = estate.will;
  const [showWarning, setShowWarning] = useState(will.hasOriginal === "no");
  const [flagCreated, setFlagCreated] = useState(false);

  useEffect(() => {
    setShowWarning(will.hasOriginal === "no");
  }, [will.hasOriginal]);

  // Create flag when user selects "no" and hasn't created one yet
  useEffect(() => {
    const createFlag = async () => {
      if (will.hasOriginal === "no" && !flagCreated && matterId) {
        try {
          await fetch(`/api/matters/${matterId}/flags`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              flagType: "NO_ORIGINAL_WILL",
              severity: "HIGH",
              description: "User indicated they only have a copy of the will, not the original.",
            }),
          });
          setFlagCreated(true);
        } catch (error) {
          console.error("Failed to create flag:", error);
        }
      }
    };
    createFlag();
  }, [will.hasOriginal, flagCreated, matterId]);

  const handleOriginalChange = (answer: string) => {
    updateWill({ hasOriginal: answer as "yes" | "no" | "unknown" });
    if (answer === "no") {
      setShowWarning(true);
    } else {
      setShowWarning(false);
    }
  };

  return (
    <div className="space-y-6">
      <QuestionCard
        title="Do you have the ORIGINAL signed will?"
        description="Not a photocopy. The wet-ink original that was signed by the deceased."
        why="BC courts require the original will. They keep it permanently as part of the court record. A photocopy alone is usually not enough."
        where="Check safes, safety deposit boxes, law firms, or among important papers."
      >
        <YesNoButtons
          value={will.hasOriginal}
          onChange={handleOriginalChange}
          options={[
            { label: "Yes, I have the original", value: "yes" },
            { label: "No, I only have a copy", value: "no" },
            { label: "I'm not sure", value: "unknown" },
          ]}
        />
        {errors?.hasOriginal && (
          <p className="mt-2 text-sm text-red-600">{errors.hasOriginal}</p>
        )}
      </QuestionCard>

      {showWarning && (
        <div className="rounded-2xl border-2 border-amber-300 bg-amber-50 p-6 space-y-4">
          <div className="flex items-start gap-3">
            <svg className="h-6 w-6 text-amber-600 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <h3 className="text-lg font-semibold text-amber-900">
                Important: Probate with only a copy is more complicated
              </h3>
              <p className="mt-2 text-sm text-amber-800">
                Without the original will, you may need to:
              </p>
            </div>
          </div>

          <ul className="ml-9 space-y-2 text-sm text-amber-800 list-disc">
            <li>Prove the original was not revoked or destroyed by the deceased</li>
            <li>Provide additional affidavits explaining the circumstances</li>
            <li>Possibly face extra court questions or delays</li>
            <li>Have a higher risk of the application being rejected</li>
          </ul>

          <div className="border-t border-amber-200 pt-4 ml-9">
            <p className="text-sm text-amber-900 font-medium">
              Our team will review your file and may reach out with additional requirements.
            </p>
          </div>

          <div className="flex flex-wrap gap-3 ml-9">
            <button
              type="button"
              onClick={() => handleOriginalChange("yes")}
              className="rounded-full border border-amber-300 px-4 py-2 text-sm font-semibold text-amber-800 hover:bg-amber-100 transition"
            >
              Go back — I'll find the original
            </button>
            <button
              type="button"
              onClick={() => setShowWarning(false)}
              className="rounded-full bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-700 transition"
            >
              I understand — continue anyway
            </button>
            {/* Dev mode skip button */}
            {process.env.NEXT_PUBLIC_DEV_MODE === "true" && (
              <button
                type="button"
                onClick={() => {
                  console.log("[DEV] Skipping original will requirement");
                  handleOriginalChange("yes");
                }}
                className="rounded-full border-2 border-dashed border-purple-400 bg-purple-50 px-4 py-2 text-sm font-semibold text-purple-700 hover:bg-purple-100 transition"
              >
                [DEV] Skip — pretend I have original
              </button>
            )}
          </div>
        </div>
      )}

      {!showWarning && (
        <QuestionCard
          title="Where is the will stored?"
          description="Tell us where the original (or the copy you have) is located."
        >
          <Input
            value={will.storageLocation}
            onChange={(e) => updateWill({ storageLocation: e.target.value })}
            placeholder="e.g., In a fireproof safe at home, or at Smith & Jones Law"
          />
          {errors?.storageLocation && (
            <p className="mt-2 text-sm text-red-600">{errors.storageLocation}</p>
          )}
        </QuestionCard>
      )}
    </div>
  );
}
