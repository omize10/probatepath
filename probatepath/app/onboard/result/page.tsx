"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, AlertTriangle, ArrowRight, Loader2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getOnboardState, TIER_INFO, type GrantType, type Tier } from "@/lib/onboard/state";

export default function OnboardResultPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [hasRedFlags, setHasRedFlags] = useState(false);
  const [redFlags, setRedFlags] = useState<string[]>([]);
  const [grantType, setGrantType] = useState<GrantType>("probate");
  const [recommendedTier, setRecommendedTier] = useState<Tier>("guided");
  const [showMatch, setShowMatch] = useState(false);

  useEffect(() => {
    const state = getOnboardState();
    if (!state.screening?.estateValue && !state.redFlags?.length) {
      router.push("/onboard/screening");
      return;
    }

    setRedFlags(state.redFlags || []);
    setHasRedFlags((state.redFlags || []).length > 0);
    setGrantType(state.grantType || "probate");
    setRecommendedTier(state.recommendedTier || "guided");

    // Simulate loading for red flag matching
    if ((state.redFlags || []).length > 0) {
      setTimeout(() => {
        setIsLoading(false);
        setTimeout(() => setShowMatch(true), 500);
      }, 2500);
    } else {
      setIsLoading(false);
    }
  }, [router]);

  const getRedFlagMessage = () => {
    if (redFlags.includes("dispute")) {
      return "Estates with potential disputes require a litigation specialist.";
    }
    if (redFlags.includes("foreign_assets")) {
      return "Foreign assets require specialized cross-border expertise.";
    }
    return "Your situation needs specialized legal help.";
  };

  const handleContinue = () => {
    router.push("/onboard/pricing");
  };

  // Red flag path - route to Open Door Law
  if (hasRedFlags) {
    return (
      <div className="space-y-8">
        <div className="space-y-2 text-center">
          <h1 className="font-serif text-3xl font-semibold text-[color:var(--brand)] sm:text-4xl">
            Your situation needs specialized help
          </h1>
          <p className="text-[color:var(--muted-ink)]">{getRedFlagMessage()}</p>
        </div>

        {isLoading ? (
          <div className="space-y-6 py-8">
            <div className="flex justify-center">
              <Loader2 className="h-12 w-12 animate-spin text-[color:var(--brand)]" />
            </div>
            <p className="text-center text-[color:var(--muted-ink)]">
              Finding the right firm for you...
            </p>
          </div>
        ) : (
          <div
            className={`space-y-6 transition-all duration-500 ${
              showMatch ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            <div className="rounded-2xl border-2 border-green-500 bg-green-50 p-6 space-y-4">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
                <div>
                  <p className="text-sm text-green-600 font-medium">Matched</p>
                  <p className="text-2xl font-bold text-green-900">Open Door Law</p>
                </div>
              </div>

              <p className="text-green-800">
                {redFlags.includes("dispute")
                  ? "Specialists in contested estates and will disputes"
                  : "Specialists in complex estates with international assets"}
              </p>

              <ul className="space-y-2 text-sm text-green-700">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  Experienced estate litigation team
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  Free initial consultation
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  Based in Vancouver, BC
                </li>
              </ul>
            </div>

            <Button
              onClick={() => window.open("https://opendoorlaw.com", "_blank")}
              size="lg"
              className="w-full h-14 text-lg"
            >
              Contact Open Door Law
              <ExternalLink className="ml-2 h-5 w-5" />
            </Button>

            <p className="text-center text-sm text-[color:var(--muted-ink)]">
              Not ready? We'll email you their contact information.
            </p>
          </div>
        )}
      </div>
    );
  }

  // Good fit path
  const tierInfo = TIER_INFO[recommendedTier];

  return (
    <div className="space-y-8">
      <div className="space-y-2 text-center">
        <div className="flex justify-center mb-4">
          <div className="rounded-full bg-green-100 p-4">
            <CheckCircle2 className="h-12 w-12 text-green-600" />
          </div>
        </div>
        <h1 className="font-serif text-3xl font-semibold text-[color:var(--brand)] sm:text-4xl">
          Good news - we can help
        </h1>
        <p className="text-[color:var(--muted-ink)]">Based on your answers, here's what you need.</p>
      </div>

      {/* Grant type card */}
      <div className="rounded-xl border-2 border-[color:var(--brand)] p-6 space-y-3">
        <p className="text-sm text-[color:var(--muted-ink)]">You need</p>
        <p className="text-2xl font-bold text-[color:var(--brand)]">
          {grantType === "probate" ? "Probate" : "Administration"}
        </p>

        {grantType === "administration" && (
          <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 mt-4">
            <div className="flex gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-amber-800">
                <p className="font-medium">Since there's no will, this is called Administration.</p>
                <p className="mt-1">
                  The court looks more closely at these cases. Small mistakes can cause delays.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Recommended tier preview */}
      <div className="rounded-xl bg-[color:var(--bg-muted)] p-6 space-y-2">
        <p className="text-sm text-[color:var(--muted-ink)]">Recommended for you</p>
        <div className="flex items-baseline justify-between">
          <p className="text-xl font-bold text-[color:var(--brand)]">{tierInfo.name}</p>
          <p className="text-2xl font-bold text-[color:var(--brand)]">
            ${tierInfo.price.toLocaleString()}
          </p>
        </div>
        <p className="text-sm text-[color:var(--muted-ink)]">{tierInfo.tagline}</p>
      </div>

      <Button onClick={handleContinue} size="lg" className="w-full h-14 text-lg">
        Continue to Pricing
        <ArrowRight className="ml-2 h-5 w-5" />
      </Button>
    </div>
  );
}
