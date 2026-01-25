"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getOnboardState, saveOnboardState } from "@/lib/onboard/state";

export default function OnboardPhonePage() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const state = getOnboardState();
    if (!state.email) {
      router.push("/onboard/email");
      return;
    }
    if (state.phone) {
      setPhone(state.phone);
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

    setIsLoading(true);
    setError("");
    // Store raw digits for API calls
    const rawPhone = "+1" + phone.replace(/\D/g, "");
    saveOnboardState({ phone: rawPhone });
    router.push("/onboard/call");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && phone.trim()) {
      handleContinue();
    }
  };

  return (
    <div className="space-y-8">
      <div className="space-y-2 text-center">
        <h1 className="font-serif text-3xl font-semibold text-[color:var(--brand)] sm:text-4xl">
          One more thing
        </h1>
        <p className="text-[color:var(--muted-ink)]">
          We'll call you to walk through your options.
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="phone" className="text-sm font-medium text-[color:var(--brand)]">
            What's the best number to reach you?
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
          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>

        <Button
          onClick={handleContinue}
          disabled={!phone.trim() || isLoading}
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
        We'll never share your number or use it for marketing.
      </p>
    </div>
  );
}
