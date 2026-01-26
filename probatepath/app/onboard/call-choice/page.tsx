"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Phone, FileText, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getOnboardState, saveOnboardState } from "@/lib/onboard/state";

export default function OnboardCallChoicePage() {
  const router = useRouter();

  useEffect(() => {
    const state = getOnboardState();
    if (!state.phone) {
      router.push("/onboard/phone");
      return;
    }
  }, [router]);

  const handleScheduleCall = () => {
    saveOnboardState({ scheduledCall: true });
    router.push("/onboard/schedule");
  };

  const handleContinueWithoutCall = () => {
    saveOnboardState({ scheduledCall: false });
    router.push("/onboard/screening");
  };

  return (
    <div className="space-y-8">
      <div className="space-y-2 text-center">
        <h1 className="font-serif text-3xl font-semibold text-[color:var(--brand)] sm:text-4xl">
          Thanks for providing your information!
        </h1>
        <p className="text-[color:var(--muted-ink)]">
          We&apos;d be happy to give you a quick call to explain our process and answer any questions.
        </p>
      </div>

      <div className="space-y-4">
        {/* Option A: Schedule a Call (LARGER, recommended) */}
        <button
          onClick={handleScheduleCall}
          className="relative w-full p-6 text-left rounded-2xl border-2 border-[color:var(--brand)] bg-[color:var(--brand)]/5
                     hover:bg-[color:var(--brand)]/10 transition-all duration-200 group"
        >
          {/* Recommended badge */}
          <div className="absolute -top-3 left-4 px-2 py-0.5 bg-[color:var(--brand)] text-white text-xs font-medium rounded-full flex items-center gap-1">
            <Star className="w-3 h-3" />
            Recommended
          </div>

          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[color:var(--brand)]/10 flex items-center justify-center">
              <Phone className="w-6 h-6 text-[color:var(--brand)]" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-[color:var(--brand)]">
                Schedule a Quick Call
              </h3>
              <p className="mt-1 text-[color:var(--muted-ink)]">
                One of our associates will walk you through how ProbateDesk works and help you choose the right option.
              </p>
              <p className="mt-2 text-sm text-[color:var(--muted-ink)]">
                Takes about 10 minutes.
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
              <FileText className="w-5 h-5 text-gray-500" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-[color:var(--brand)]">
                Continue on Your Own
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
