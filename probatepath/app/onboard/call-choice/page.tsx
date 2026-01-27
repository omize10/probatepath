"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Phone, FileText, Star, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getOnboardState, saveOnboardState } from "@/lib/onboard/state";

export default function OnboardCallChoicePage() {
  const router = useRouter();
  const [calling, setCalling] = useState(false);
  const [callInitiated, setCallInitiated] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const state = getOnboardState();
    if (!state.phone) {
      router.push("/onboard/phone");
      return;
    }
  }, [router]);

  const handleCallMeNow = async () => {
    setCalling(true);
    setError(null);

    const state = getOnboardState();

    try {
      const response = await fetch("/api/retell/outbound-call", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone_number: state.phone,
          name: state.name,
          email: state.email,
          metadata: {
            source: "onboard_call_choice",
            relationship: state.relationshipToDeceased,
          },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to initiate call");
      }

      // Save call info to state
      saveOnboardState({
        scheduledCall: true,
        aiCallId: data.ai_call_id || data.call_id,
      });

      setCallInitiated(true);

      // Wait 3 seconds to show success, then proceed
      setTimeout(() => {
        router.push("/onboard/screening");
      }, 3000);
    } catch (err) {
      console.error("Call error:", err);
      setError(err instanceof Error ? err.message : "Something went wrong");
      setCalling(false);
    }
  };

  const handleContinueWithoutCall = () => {
    saveOnboardState({ scheduledCall: false });
    router.push("/onboard/screening");
  };

  // Show calling state
  if (calling || callInitiated) {
    return (
      <div className="space-y-8 text-center py-12">
        {callInitiated ? (
          <>
            <div className="mx-auto w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10 text-emerald-600" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold text-[color:var(--brand)]">
                We&apos;re calling you now!
              </h2>
              <p className="text-[color:var(--muted-ink)]">
                Please answer the incoming call from ProbateDesk.
              </p>
              <p className="text-sm text-[color:var(--muted-ink)]">
                Proceeding to questionnaire in a moment...
              </p>
            </div>
          </>
        ) : (
          <>
            <div className="mx-auto w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center">
              <Loader2 className="w-10 h-10 text-[color:var(--brand)] animate-spin" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold text-[color:var(--brand)]">
                Connecting your call...
              </h2>
              <p className="text-[color:var(--muted-ink)]">
                Please wait while we connect you with our team.
              </p>
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="space-y-2 text-center">
        <h1 className="font-serif text-3xl font-semibold text-[color:var(--brand)] sm:text-4xl">
          Let&apos;s get to know you first
        </h1>
        <p className="text-[color:var(--muted-ink)]">
          Before you pay anything, we&apos;d love to give you a quick call to make sure we&apos;re the right fit.
        </p>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-800">
          {error}
        </div>
      )}

      <div className="space-y-4">
        {/* Option A: Call Me Now (LARGER, recommended) */}
        <button
          onClick={handleCallMeNow}
          disabled={calling}
          className="relative w-full p-6 text-left rounded-2xl border-2 border-[color:var(--brand)] bg-blue-50
                     hover:bg-blue-100 transition-all duration-200 group disabled:opacity-50"
        >
          {/* Recommended badge */}
          <div className="absolute -top-3 left-4 px-2 py-0.5 bg-[color:var(--brand)] text-white text-xs font-medium rounded-full flex items-center gap-1">
            <Star className="w-3 h-3" />
            Recommended
          </div>

          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center">
              <Phone className="w-7 h-7 text-[color:var(--brand)]" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-[color:var(--brand)]">
                Call Me Now
              </h3>
              <p className="mt-1 text-[color:var(--muted-ink)]">
                We&apos;ll call you right now to walk you through how ProbateDesk works and answer any questions.
              </p>
              <p className="mt-2 text-sm font-medium text-emerald-600">
                Free • No obligation • Takes about 10 minutes
              </p>
            </div>
          </div>
        </button>

        {/* Option B: Continue on Your Own (smaller) */}
        <button
          onClick={handleContinueWithoutCall}
          className="w-full p-4 text-left rounded-xl border-2 border-[color:var(--border-muted)]
                     hover:border-[color:var(--brand)]/50 transition-all duration-200"
        >
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
              <FileText className="w-5 h-5 text-slate-700" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-[color:var(--brand)]">
                Continue Without a Call
              </h3>
              <p className="mt-0.5 text-sm text-[color:var(--muted-ink)]">
                Prefer to explore yourself? No problem. Proceed directly to our quick questionnaire.
              </p>
            </div>
          </div>
        </button>
      </div>

      <Button variant="ghost" onClick={() => router.push("/onboard/phone")} className="w-full">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>
    </div>
  );
}
