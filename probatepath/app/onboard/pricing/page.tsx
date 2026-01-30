"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Star, ChevronDown, ChevronUp, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getOnboardState, saveOnboardState, TIER_INFO, type Tier, type GrantType } from "@/lib/onboard/state";

export default function OnboardPricingPage() {
  const router = useRouter();
  const [recommendedTier, setRecommendedTier] = useState<Tier>("premium");
  const [grantType, setGrantType] = useState<GrantType>("probate");
  const [expandedTier, setExpandedTier] = useState<Tier | null>(null);

  useEffect(() => {
    const state = getOnboardState();
    if (!state.recommendedTier) {
      router.push("/onboard/result");
      return;
    }
    setRecommendedTier(state.recommendedTier);
    setGrantType(state.grantType || "probate");
  }, [router]);

  const handleSelectTier = (tier: Tier) => {
    saveOnboardState({ selectedTier: tier });
    router.push("/onboard/create-account");
  };

  const toggleExpand = (tier: Tier) => {
    setExpandedTier(expandedTier === tier ? null : tier);
  };

  return (
    <div className="space-y-8 max-w-lg mx-auto">
      {/* Lawyer anchor */}
      <div className="rounded-xl bg-slate-100 border border-slate-200 p-6 space-y-2">
        <p className="text-sm text-slate-500 uppercase tracking-wide font-medium">
          Typical Lawyer Fees
        </p>
        <p className="text-3xl font-bold text-slate-700">$8,000 - $15,000</p>
        <p className="text-sm text-slate-500">
          Hourly billing. Surprise invoices. Weeks of back-and-forth.
        </p>
      </div>

      {/* Our pricing header */}
      <div className="text-center">
        <h1 className="font-serif text-2xl font-semibold text-[color:var(--brand)] sm:text-3xl">
          ProbateDesk: Fixed price, no surprises
        </h1>
      </div>

      {/* Recommended tier - prominent */}
      <div className="rounded-2xl border-2 border-[color:var(--brand)] bg-white shadow-lg overflow-hidden">
        <div className="bg-[color:var(--brand)] text-white px-4 py-2 flex items-center gap-2">
          <Star className="h-4 w-4 fill-current" />
          <span className="text-sm font-medium">Recommended for you</span>
        </div>

        <div className="p-6 space-y-4">
          <div className="flex items-baseline justify-between">
            <div>
              <h2 className="text-2xl font-bold text-[color:var(--brand)]">
                {TIER_INFO[recommendedTier].name}
              </h2>
              <p className="text-[color:var(--muted-ink)]">{TIER_INFO[recommendedTier].tagline}</p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-[color:var(--brand)]">
                ${TIER_INFO[recommendedTier].price.toLocaleString()}
              </p>
              <p className="text-sm text-[color:var(--muted-ink)]">one-time</p>
            </div>
          </div>

          <ul className="space-y-2">
            {TIER_INFO[recommendedTier].features.map((feature, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>

          <Button
            onClick={() => handleSelectTier(recommendedTier)}
            size="lg"
            className="w-full h-14 text-lg"
          >
            Continue with {TIER_INFO[recommendedTier].name}
          </Button>
        </div>
      </div>

      {/* Administration upsell */}
      {grantType === "administration" && recommendedTier === "basic" && (
        <div className="rounded-lg bg-amber-50 border border-amber-200 p-4 text-sm text-amber-800">
          <p>
            Most people doing Administration choose <strong>Premium</strong> to avoid delays from
            mistakes.
          </p>
        </div>
      )}

      {/* Other options */}
      <div className="space-y-3">
        <p className="text-sm text-center text-[color:var(--muted-ink)]">Other options</p>

        {(["basic", "premium", "white_glove"] as Tier[])
          .filter((tier) => tier !== recommendedTier)
          .map((tier) => (
            <div
              key={tier}
              className="rounded-xl border border-[color:var(--border-muted)] bg-white overflow-hidden"
            >
              <button
                onClick={() => toggleExpand(tier)}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-[color:var(--bg-muted)] transition-colors"
              >
                <div className="flex items-baseline gap-2">
                  <span className="font-medium text-[color:var(--brand)]">{TIER_INFO[tier].name}</span>
                  <span className="text-lg font-bold text-[color:var(--brand)]">
                    ${TIER_INFO[tier].price.toLocaleString()}
                  </span>
                </div>
                {expandedTier === tier ? (
                  <ChevronUp className="h-5 w-5 text-[color:var(--muted-ink)]" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-[color:var(--muted-ink)]" />
                )}
              </button>

              {expandedTier === tier && (
                <div className="px-4 pb-4 space-y-4">
                  <p className="text-sm text-[color:var(--muted-ink)]">{TIER_INFO[tier].tagline}</p>

                  <ul className="space-y-2">
                    {TIER_INFO[tier].features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <p className="text-xs text-[color:var(--muted-ink)]">
                    Best for: {TIER_INFO[tier].bestFor}
                  </p>

                  <Button onClick={() => handleSelectTier(tier)} variant="outline" className="w-full">
                    Choose {TIER_INFO[tier].name}
                  </Button>
                </div>
              )}
            </div>
          ))}
      </div>

      <Button variant="ghost" onClick={() => router.push("/onboard/result")} className="w-full">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>

      {/* Trust elements */}
      <div className="text-center space-y-2 pt-4 border-t border-[color:var(--border-muted)]">
        <p className="text-xs text-[color:var(--muted-ink)]">
          Supervised by BC lawyers. Secure payment. 30-day money-back guarantee.
        </p>
      </div>
    </div>
  );
}
