"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getOnboardState, saveOnboardState } from "@/lib/onboard/state";

export default function OnboardNamePage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const state = getOnboardState();
    if (state.name) {
      setName(state.name);
    }
  }, []);

  const handleContinue = () => {
    if (!name.trim()) return;

    setIsLoading(true);
    saveOnboardState({ name: name.trim() });
    router.push("/onboard/referral");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && name.trim()) {
      handleContinue();
    }
  };

  return (
    <div className="space-y-8">
      <div className="space-y-2 text-center">
        <h1 className="font-serif text-3xl font-semibold text-[color:var(--brand)] sm:text-4xl">
          Let's get started
        </h1>
        <p className="text-[color:var(--muted-ink)]">
          We'll guide you through BC probate, step by step.
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="name" className="text-sm font-medium text-[color:var(--brand)]">
            What's your name?
          </label>
          <Input
            id="name"
            type="text"
            placeholder="Your full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
            className="h-14 text-lg"
          />
        </div>

        <Button
          onClick={handleContinue}
          disabled={!name.trim() || isLoading}
          size="lg"
          className="w-full h-14 text-lg"
        >
          Continue
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </div>

      <p className="text-center text-xs text-[color:var(--muted-ink)]">
        Your information is secure and never shared.
      </p>
    </div>
  );
}
