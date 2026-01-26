"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getOnboardState, saveOnboardState, type ReferralSource } from "@/lib/onboard/state";

const BC_FUNERAL_HOMES = [
  "First Memorial Funeral Services",
  "Forest Lawn Funeral Home",
  "Kearney Funeral Services",
  "Ocean View Funeral Home",
  "Victory Memorial Park",
  "Mount Pleasant Funeral Centre",
  "Hamilton's Funeral Home",
  "Riverside Funeral Home",
  "Armstrong Funeral Home",
  "Alternatives Funeral & Cremation Services",
  "Boal Chapel",
  "Burquitlam Funeral Home",
  "Glenhaven Memorial Chapel",
  "Henderson's Funeral Home",
  "Parkview Funeral Chapel",
  "Sands Funeral Chapel",
  "Schoening Funeral Service",
  "Yates Memorial Services",
];

export default function OnboardReferralPage() {
  const router = useRouter();
  const [referralSource, setReferralSource] = useState<ReferralSource>(null);
  const [funeralHome, setFuneralHome] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const state = getOnboardState();
    if (state.referralSource !== undefined) {
      setReferralSource(state.referralSource);
    }
    if (state.referralFuneralHome) {
      setFuneralHome(state.referralFuneralHome);
    }
  }, []);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredSuggestions = BC_FUNERAL_HOMES.filter((home) =>
    home.toLowerCase().includes(funeralHome.toLowerCase())
  ).slice(0, 6);

  const handleContinue = () => {
    setIsLoading(true);
    saveOnboardState({
      referralSource,
      referralFuneralHome: referralSource === "funeral_home" ? funeralHome : undefined,
    });
    router.push("/onboard/email");
  };

  const canContinue = referralSource !== null && (referralSource !== "funeral_home" || funeralHome.trim());

  return (
    <div className="space-y-8">
      <div className="space-y-2 text-center">
        <h1 className="font-serif text-3xl font-semibold text-[color:var(--brand)] sm:text-4xl">
          How did you find us?
        </h1>
        <p className="text-[color:var(--muted-ink)]">
          This helps us understand how people discover ProbateDesk.
        </p>
      </div>

      <div className="space-y-6">
        {/* Referral Source Options */}
        <div className="space-y-3">
          <p className="text-sm font-medium text-[color:var(--brand)]">
            Were you referred by a funeral home?
          </p>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setReferralSource("funeral_home")}
              className={`rounded-xl border-2 p-4 text-center transition-all ${
                referralSource === "funeral_home"
                  ? "border-[color:var(--brand)] bg-[color:var(--brand)]/5"
                  : "border-[color:var(--border-muted)] hover:border-[color:var(--brand)]/50"
              }`}
            >
              <span className={`font-medium ${referralSource === "funeral_home" ? "text-[color:var(--brand)]" : "text-[color:var(--muted-ink)]"}`}>
                Yes
              </span>
            </button>
            <button
              onClick={() => {
                setReferralSource("other");
                setFuneralHome("");
              }}
              className={`rounded-xl border-2 p-4 text-center transition-all ${
                referralSource && referralSource !== "funeral_home"
                  ? "border-[color:var(--brand)] bg-[color:var(--brand)]/5"
                  : "border-[color:var(--border-muted)] hover:border-[color:var(--brand)]/50"
              }`}
            >
              <span className={`font-medium ${referralSource && referralSource !== "funeral_home" ? "text-[color:var(--brand)]" : "text-[color:var(--muted-ink)]"}`}>
                No
              </span>
            </button>
          </div>
        </div>

        {/* Funeral Home Input */}
        {referralSource === "funeral_home" && (
          <div className="space-y-2">
            <label htmlFor="funeral-home" className="text-sm font-medium text-[color:var(--brand)]">
              Which funeral home?
            </label>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[color:var(--muted-ink)]" />
              <Input
                ref={inputRef}
                id="funeral-home"
                type="text"
                placeholder="Start typing to search..."
                value={funeralHome}
                onChange={(e) => {
                  setFuneralHome(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                className="h-14 pl-12 text-lg"
              />

              {/* Suggestions Dropdown */}
              {showSuggestions && funeralHome && filteredSuggestions.length > 0 && (
                <div
                  ref={suggestionsRef}
                  className="absolute z-10 mt-1 w-full rounded-xl border border-[color:var(--border-muted)] bg-white py-2 shadow-lg"
                >
                  {filteredSuggestions.map((home) => (
                    <button
                      key={home}
                      onClick={() => {
                        setFuneralHome(home);
                        setShowSuggestions(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm hover:bg-[color:var(--bg-surface)] text-[color:var(--brand)]"
                    >
                      {home}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <p className="text-xs text-[color:var(--muted-ink)]">
              Don&apos;t see your funeral home? Just type the name.
            </p>
          </div>
        )}

        {/* Other Source Options (shown if they said No) */}
        {referralSource && referralSource !== "funeral_home" && (
          <div className="space-y-3">
            <p className="text-sm font-medium text-[color:var(--brand)]">
              How did you hear about us?
            </p>
            <div className="grid grid-cols-1 gap-2">
              {[
                { value: "google" as ReferralSource, label: "Google / Search" },
                { value: "friend" as ReferralSource, label: "Friend or family" },
                { value: "other" as ReferralSource, label: "Other" },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setReferralSource(option.value)}
                  className={`rounded-xl border-2 p-3 text-left transition-all ${
                    referralSource === option.value
                      ? "border-[color:var(--brand)] bg-[color:var(--brand)]/5"
                      : "border-[color:var(--border-muted)] hover:border-[color:var(--brand)]/50"
                  }`}
                >
                  <span className={`font-medium ${referralSource === option.value ? "text-[color:var(--brand)]" : "text-[color:var(--muted-ink)]"}`}>
                    {option.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        <Button
          onClick={handleContinue}
          disabled={!canContinue || isLoading}
          size="lg"
          className="w-full h-14 text-lg"
        >
          Continue
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </div>

      <p className="text-center text-xs text-[color:var(--muted-ink)]">
        This information helps us improve our service.
      </p>
    </div>
  );
}
