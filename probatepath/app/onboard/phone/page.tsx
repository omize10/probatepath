"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getOnboardState, saveOnboardState, type CommunicationPreference } from "@/lib/onboard/state";

export default function OnboardPhonePage() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [preference, setPreference] = useState<CommunicationPreference | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const state = getOnboardState();
    if (!state.email) {
      router.push("/onboard/email");
      return;
    }
    if (state.phone) {
      // Format the stored phone number for display
      const digits = state.phone.replace(/\D/g, "").slice(-10);
      setPhone(formatPhone(digits));
    }
    if (state.communicationPreference) {
      setPreference(state.communicationPreference);
    }
  }, [router]);

  const formatPhone = (value: string) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, "");

    // Format as (XXX) XXX-XXXX
    if (digits.length <= 3) {
      return digits;
    } else if (digits.length <= 6) {
      return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    } else {
      return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value);
    setPhone(formatted);
    setError("");
  };

  const isValidPhone = (phone: string) => {
    const digits = phone.replace(/\D/g, "");
    return digits.length === 10;
  };

  const handleContinue = () => {
    if (!phone.trim()) {
      setError("Please enter your phone number");
      return;
    }
    if (!isValidPhone(phone)) {
      setError("Please enter a 10-digit phone number");
      return;
    }
    if (!preference) {
      setError("Please select your communication preference");
      return;
    }

    setIsLoading(true);
    setError("");
    // Store raw digits for API calls
    const rawPhone = "+1" + phone.replace(/\D/g, "");
    saveOnboardState({ phone: rawPhone, communicationPreference: preference });
    router.push("/onboard/call-choice");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && phone.trim() && preference) {
      handleContinue();
    }
  };

  return (
    <div className="space-y-8">
      <div className="space-y-2 text-center">
        <h1 className="font-serif text-3xl font-semibold text-[color:var(--brand)] sm:text-4xl">
          How can we reach you?
        </h1>
        <p className="text-[color:var(--muted-ink)]">
          We&apos;ll only contact you about your case.
        </p>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <label htmlFor="phone" className="text-sm font-medium text-[color:var(--brand)]">
            Please provide the best phone number for you
          </label>
          <Input
            id="phone"
            type="tel"
            placeholder="(604) 555-1234"
            value={phone}
            onChange={handlePhoneChange}
            onKeyDown={handleKeyDown}
            autoFocus
            className="h-14 text-lg"
          />
        </div>

        <div className="space-y-3">
          <label className="text-sm font-medium text-[color:var(--brand)]">
            Do you prefer text or email for updates?
          </label>
          <div className="grid gap-2">
            <button
              type="button"
              onClick={() => setPreference("text")}
              className={`w-full h-12 text-left px-4 rounded-xl border-2 transition-all font-medium
                ${preference === "text"
                  ? "border-[color:var(--brand)] bg-[color:var(--brand)]/5 text-[color:var(--brand)]"
                  : "border-[color:var(--border-muted)] hover:border-[color:var(--brand)]/50"
                }`}
            >
              Text message
            </button>
            <button
              type="button"
              onClick={() => setPreference("email")}
              className={`w-full h-12 text-left px-4 rounded-xl border-2 transition-all font-medium
                ${preference === "email"
                  ? "border-[color:var(--brand)] bg-[color:var(--brand)]/5 text-[color:var(--brand)]"
                  : "border-[color:var(--border-muted)] hover:border-[color:var(--brand)]/50"
                }`}
            >
              Email
            </button>
            <button
              type="button"
              onClick={() => setPreference("either")}
              className={`w-full h-12 text-left px-4 rounded-xl border-2 transition-all font-medium
                ${preference === "either"
                  ? "border-[color:var(--brand)] bg-[color:var(--brand)]/5 text-[color:var(--brand)]"
                  : "border-[color:var(--border-muted)] hover:border-[color:var(--brand)]/50"
                }`}
            >
              Either is fine
            </button>
          </div>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <Button
          onClick={handleContinue}
          disabled={!phone.trim() || !preference || isLoading}
          size="lg"
          className="w-full h-14 text-lg"
        >
          Continue
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>

        <Button
          variant="ghost"
          onClick={() => router.push("/onboard/email")}
          className="w-full"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
      </div>

      <p className="text-center text-xs text-[color:var(--muted-ink)]">
        We&apos;ll never share your number or use it for marketing.
      </p>
    </div>
  );
}
