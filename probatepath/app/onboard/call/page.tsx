"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Phone, ArrowRight, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getOnboardState, saveOnboardState } from "@/lib/onboard/state";

export default function OnboardCallPage() {
  const router = useRouter();
  const [state, setState] = useState<{ name?: string; phone?: string; email?: string }>({});
  const [callStatus, setCallStatus] = useState<"idle" | "calling" | "connected" | "ended">("idle");
  const [showContinue, setShowContinue] = useState(false);
  const [error, setError] = useState("");
  const [callId, setCallId] = useState<string | null>(null);

  useEffect(() => {
    const onboardState = getOnboardState();
    if (!onboardState.phone) {
      router.push("/onboard/phone");
      return;
    }
    setState({
      name: onboardState.name,
      phone: onboardState.phone,
      email: onboardState.email,
    });

    // Show continue button after 5 seconds regardless of call status
    const timer = setTimeout(() => {
      setShowContinue(true);
    }, 5000);

    return () => clearTimeout(timer);
  }, [router]);

  const initiateCall = useCallback(async () => {
    if (!state.phone || !state.email) return;

    setCallStatus("calling");
    setError("");

    try {
      const response = await fetch("/api/retell/outbound-call", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: state.phone,
          name: state.name,
          email: state.email,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to initiate call");
      }

      setCallId(data.call_id);
      setCallStatus("connected");
      saveOnboardState({ aiCallId: data.call_id });
    } catch (err) {
      console.error("[onboard/call] Error initiating call:", err);
      setError(err instanceof Error ? err.message : "Failed to connect call");
      setCallStatus("idle");
      setShowContinue(true);
    }
  }, [state]);

  // Auto-initiate call when page loads
  useEffect(() => {
    if (state.phone && callStatus === "idle") {
      initiateCall();
    }
  }, [state.phone, callStatus, initiateCall]);

  const handleContinue = () => {
    // Save that they proceeded (with or without call)
    saveOnboardState({
      aiCallId: callId || "skipped",
    });
    router.push("/onboard/screening");
  };

  const formatPhoneDisplay = (phone: string) => {
    // Convert +1XXXXXXXXXX to (XXX) XXX-XXXX
    const digits = phone.replace(/\D/g, "").slice(-10);
    if (digits.length === 10) {
      return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
    }
    return phone;
  };

  return (
    <div className="space-y-8">
      <div className="space-y-2 text-center">
        <h1 className="font-serif text-3xl font-semibold text-[color:var(--brand)] sm:text-4xl">
          {callStatus === "calling" ? "Calling you now..." : "We're calling you"}
        </h1>
        <p className="text-[color:var(--muted-ink)]">
          {callStatus === "calling"
            ? "Pick up - we'll answer your questions"
            : callStatus === "connected"
            ? "On the call? Great! When you're done, continue below."
            : "Pick up to talk through your situation."}
        </p>
      </div>

      {/* Phone visual */}
      <div className="flex justify-center">
        <div
          className={`rounded-full p-8 ${
            callStatus === "calling"
              ? "bg-green-100 animate-pulse"
              : callStatus === "connected"
              ? "bg-green-100"
              : "bg-[color:var(--bg-muted)]"
          }`}
        >
          <Phone
            className={`h-16 w-16 ${
              callStatus === "calling" || callStatus === "connected"
                ? "text-green-600"
                : "text-[color:var(--brand)]"
            } ${callStatus === "calling" ? "animate-bounce" : ""}`}
          />
        </div>
      </div>

      {/* Phone number display */}
      {state.phone && (
        <p className="text-center text-lg font-medium text-[color:var(--brand)]">
          {formatPhoneDisplay(state.phone)}
        </p>
      )}

      {/* Error message */}
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-center">
          <p className="text-sm text-red-700">{error}</p>
          <p className="text-xs text-red-600 mt-1">Don't worry - you can continue without the call.</p>
        </div>
      )}

      {/* Status messages */}
      {callStatus === "connected" && (
        <div className="rounded-lg bg-green-50 border border-green-200 p-4 text-center">
          <p className="text-sm text-green-700">
            You should be receiving a call now. When you're done talking, click Continue.
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="space-y-3">
        {callStatus === "calling" && !showContinue && (
          <div className="flex justify-center py-4">
            <Loader2 className="h-6 w-6 animate-spin text-[color:var(--brand)]" />
          </div>
        )}

        {showContinue && (
          <>
            <Button onClick={handleContinue} size="lg" className="w-full h-14 text-lg">
              {callStatus === "connected" ? "I'm done - Continue" : "Continue"}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>

            {callStatus !== "connected" && (
              <p className="text-center text-xs text-[color:var(--muted-ink)]">
                Didn't get a call? No problem. You can continue without it.
              </p>
            )}
          </>
        )}

        <Button variant="ghost" onClick={() => router.push("/onboard/phone")} className="w-full">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
      </div>
    </div>
  );
}
