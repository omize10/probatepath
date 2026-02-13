"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { Loader2 } from "lucide-react";
import { getOnboardState, saveOnboardState } from "@/lib/onboard/state";

export default function OAuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "loading") return;

    if (status === "unauthenticated") {
      // OAuth failed, redirect back to create account
      router.push("/onboard/create-account");
      return;
    }

    if (status === "authenticated" && session?.user) {
      // Complete onboarding for OAuth user
      completeOnboarding();
    }
  }, [status, session]);

  const completeOnboarding = async () => {
    try {
      const state = getOnboardState();

      // Must have required onboard data
      if (!state.selectedTier || !state.email || !state.phone) {
        setError("Onboarding data missing. Redirecting...");
        setTimeout(() => router.push("/onboard/email"), 2000);
        return;
      }

      // Get user info from session
      const userEmail = session?.user?.email;
      const userName = session?.user?.name || state.name || "";

      if (!userEmail) {
        setError("Email not found in session");
        return;
      }

      // Complete onboarding — create TierSelection + LeadSource
      await fetch("/api/onboard/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: userName,
          email: userEmail,
          phone: state.phone || "",
          tier: state.selectedTier || "premium",
          grantType: state.grantType || "probate",
          aiCallId: state.aiCallId,
          screening: state.fitAnswers || {},
          redFlags: state.redFlags || [],
        }),
      });

      // Mark PendingIntake as converted (fire-and-forget)
      fetch("/api/onboard/pending-intake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: userEmail,
          status: "converted_to_account",
        }),
      }).catch(() => {});

      // Save account created state
      saveOnboardState({ accountCreated: true, name: userName });

      // Redirect to payment
      router.push(`/pay?tier=${state.selectedTier}`);
    } catch (err) {
      console.error("[oauth-callback] Error completing onboarding:", err);
      setError("Failed to complete onboarding. Please try again.");
      setTimeout(() => router.push("/onboard/create-account"), 3000);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        {error ? (
          <>
            <div className="text-red-600 font-semibold">{error}</div>
            <div className="text-sm text-gray-600">Redirecting...</div>
          </>
        ) : (
          <>
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-emerald-600" />
            <div className="text-lg font-semibold text-[color:var(--brand)]">
              Completing your account setup...
            </div>
            <div className="text-sm text-[color:var(--text-tertiary)]">
              Please wait while we finalize your account
            </div>
          </>
        )}
      </div>
    </div>
  );
}
