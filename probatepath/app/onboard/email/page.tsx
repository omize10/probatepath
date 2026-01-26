"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { WarningCallout } from "@/components/ui/warning-callout";
import { getOnboardState, saveOnboardState } from "@/lib/onboard/state";

export default function OnboardEmailPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [confirmEmail, setConfirmEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const state = getOnboardState();
    // Check previous steps
    if (state.isExecutor === undefined) {
      router.push("/onboard/executor");
      return;
    }
    if (!state.relationshipToDeceased) {
      router.push("/onboard/relationship");
      return;
    }
    if (state.email) {
      setEmail(state.email);
    }
  }, [router]);

  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleContinue = () => {
    if (!email.trim()) {
      setError("Please enter your email");
      return;
    }
    if (!isValidEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }
    if (email.trim().toLowerCase() !== confirmEmail.trim().toLowerCase()) {
      setError("Email addresses don't match. Please try again.");
      return;
    }

    setIsLoading(true);
    setError("");
    saveOnboardState({ email: email.trim().toLowerCase() });
    router.push("/onboard/phone");
  };

  const emailsMatch = email.trim().toLowerCase() === confirmEmail.trim().toLowerCase();

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && email.trim() && confirmEmail.trim() && emailsMatch) {
      handleContinue();
    }
  };

  return (
    <div className="space-y-8">
      <div className="space-y-2 text-center">
        <h1 className="font-serif text-3xl font-semibold text-[color:var(--brand)] sm:text-4xl">
          Welcome
        </h1>
        <p className="text-[color:var(--muted-ink)]">
          Please provide your email address. We use email as our primary way of communicating updates about your case.
        </p>
      </div>

      <div className="space-y-4">
        <WarningCallout severity="warning">
          We&apos;ll send important legal documents to this email. Make sure you can access it and check it regularly.
        </WarningCallout>

        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium text-[color:var(--brand)]">
            Email address
          </label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError("");
            }}
            onKeyDown={handleKeyDown}
            autoFocus
            className="h-14 text-lg"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="confirm-email" className="text-sm font-medium text-[color:var(--brand)]">
            Confirm email address
          </label>
          <Input
            id="confirm-email"
            type="email"
            placeholder="you@example.com"
            value={confirmEmail}
            onChange={(e) => {
              setConfirmEmail(e.target.value);
              setError("");
            }}
            onKeyDown={handleKeyDown}
            className="h-14 text-lg"
          />
          {confirmEmail && !emailsMatch && (
            <p className="text-sm text-red-600">Emails don&apos;t match</p>
          )}
          {confirmEmail && emailsMatch && email && (
            <p className="text-sm text-green-600">Emails match</p>
          )}
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <Button
          onClick={handleContinue}
          disabled={!email.trim() || !confirmEmail.trim() || !emailsMatch || isLoading}
          size="lg"
          className="w-full h-14 text-lg"
        >
          Continue
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>

        <Button
          variant="ghost"
          onClick={() => router.push("/onboard/relationship")}
          className="w-full"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
      </div>
    </div>
  );
}
