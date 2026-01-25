"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getOnboardState, saveOnboardState } from "@/lib/onboard/state";

export default function OnboardEmailPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const state = getOnboardState();
    if (!state.name) {
      router.push("/onboard/name");
      return;
    }
    setName(state.name);
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

    setIsLoading(true);
    setError("");
    saveOnboardState({ email: email.trim().toLowerCase() });
    router.push("/onboard/phone");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && email.trim()) {
      handleContinue();
    }
  };

  const firstName = name.split(" ")[0];

  return (
    <div className="space-y-8">
      <div className="space-y-2 text-center">
        <h1 className="font-serif text-3xl font-semibold text-[color:var(--brand)] sm:text-4xl">
          Hi {firstName}
        </h1>
        <p className="text-[color:var(--muted-ink)]">
          We'll send updates about your case here.
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium text-[color:var(--brand)]">
            What's your email?
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
          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>

        <Button
          onClick={handleContinue}
          disabled={!email.trim() || isLoading}
          size="lg"
          className="w-full h-14 text-lg"
        >
          Continue
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>

        <Button
          variant="ghost"
          onClick={() => router.push("/onboard/name")}
          className="w-full"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
      </div>
    </div>
  );
}
