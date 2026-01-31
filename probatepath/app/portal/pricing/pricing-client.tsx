'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, X, Info, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TIER_CONFIGS, TIER_PRICES, type Tier } from "@/types/pricing";

interface AddOn {
  id: string;
  name: string;
  price: number;
  description: string;
}

const addOns: AddOn[] = [
  {
    id: "rush",
    name: "Rush Processing",
    price: 299,
    description: "Documents in 48 hours vs 5-7 days",
  },
  {
    id: "requisition",
    name: "Additional Requisition Response",
    price: 199,
    description: "Beyond included allowance",
  },
  {
    id: "post-grant",
    name: "Post-Grant Support Package",
    price: 399,
    description: "Extended distribution guidance",
  },
  {
    id: "complex-asset",
    name: "Complex Asset Schedule",
    price: 149,
    description: "For 10+ asset categories",
  },
  {
    id: "intestate",
    name: "Intestate Upgrade",
    price: 299,
    description: "Administration without will",
  },
];

interface PortalPricingClientProps {
  recommendedTier?: Tier | null;
  recommendationReason?: string | null;
}

export default function PortalPricingClient({
  recommendedTier = "standard",
  recommendationReason,
}: PortalPricingClientProps) {
  const router = useRouter();
  const [selectedTier, setSelectedTier] = useState<Tier | null>(recommendedTier || "standard");
  const [selectedAddOns, setSelectedAddOns] = useState<Set<string>>(new Set());
  const [showBasicUpsell, setShowBasicUpsell] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTierSelect = (tierId: Tier) => {
    if (tierId === "basic" && selectedTier !== "basic") {
      setShowBasicUpsell(true);
    } else {
      setSelectedTier(tierId);
    }
  };

  const confirmBasicSelection = () => {
    setSelectedTier("basic");
    setShowBasicUpsell(false);
  };

  const upgradeToStandard = () => {
    setSelectedTier("standard");
    setShowBasicUpsell(false);
  };

  const toggleAddOn = (addOnId: string) => {
    const newSelection = new Set(selectedAddOns);
    if (newSelection.has(addOnId)) {
      newSelection.delete(addOnId);
    } else {
      newSelection.add(addOnId);
    }
    setSelectedAddOns(newSelection);
  };

  const calculateTotal = () => {
    const tierPrice = selectedTier ? TIER_PRICES[selectedTier] : 0;
    const addOnPrice = Array.from(selectedAddOns).reduce((sum, id) => {
      const addOn = addOns.find((a) => a.id === id);
      return sum + (addOn?.price || 0);
    }, 0);
    return tierPrice + addOnPrice;
  };

  const selectedTierConfig = selectedTier ? TIER_CONFIGS.find((t) => t.name.toLowerCase() === selectedTier) : null;

  const handleContinue = async () => {
    if (!selectedTier) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/tier/select", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tier: selectedTier,
          addOns: Array.from(selectedAddOns),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to save tier selection");
      }

      const { tierSelectionId } = await response.json();

      // Store in sessionStorage for payment page
      sessionStorage.setItem("tierSelectionId", tierSelectionId);
      sessionStorage.setItem("selectedTier", selectedTier);
      sessionStorage.setItem("selectedAddOns", JSON.stringify(Array.from(selectedAddOns)));

      router.push("/portal/payment");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Determine which tier is recommended for this user
  const tierDisplayNames: Record<Tier, string> = {
    basic: "Basic",
    standard: "Standard",
    premium: "Premium",
  };

  return (
    <div className="mx-auto max-w-6xl space-y-12 px-4 py-12 sm:px-6 lg:px-8">
      <div className="space-y-4 text-center">
        <h1 className="font-serif text-4xl text-[color:var(--brand)] sm:text-5xl">Pick what matches your comfort level</h1>
        {recommendedTier && (
          <p className="mx-auto max-w-2xl text-base text-[color:var(--muted-ink)]">
            Based on your answers, we recommend the <strong>{tierDisplayNames[recommendedTier]} plan</strong> for your situation.
          </p>
        )}
        {!recommendedTier && (
          <p className="mx-auto max-w-2xl text-base text-[color:var(--muted-ink)]">
            Choose the plan that matches your comfort level and budget.
          </p>
        )}
      </div>

      {recommendationReason && (
        <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 flex-none text-blue-600" />
            <div className="text-sm">
              <p className="font-semibold text-blue-900">Why we recommend this tier</p>
              <p className="mt-1 text-blue-800">{recommendationReason}</p>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-center text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="space-y-8">
        <div className="grid gap-6 md:grid-cols-3">
          {TIER_CONFIGS.map((tier) => {
            const tierId = tier.name.toLowerCase() as Tier;
            const isRecommended = tierId === recommendedTier;
            return (
              <Card
                key={tierId}
                className={`relative cursor-pointer border-[color:var(--border-muted)] shadow-[0_25px_60px_-50px_rgba(15,23,42,0.18)] transition hover:-translate-y-0.5 ${
                  selectedTier === tierId
                    ? "border-2 border-[color:var(--brand)] shadow-[0_35px_80px_-55px_rgba(13,23,38,0.3)]"
                    : ""
                } ${isRecommended ? "mt-7 border-2 border-[color:var(--brand)]" : ""}`}
                onClick={() => handleTierSelect(tierId)}
              >
                {isRecommended && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                    <div className="rounded-full bg-[color:var(--brand)] px-4 py-1.5 shadow-md">
                      <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-white">
                        RECOMMENDED
                      </span>
                    </div>
                  </div>
                )}
                <CardHeader className="space-y-4 pb-6">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-xl text-[color:var(--brand)]">{tier.name}</CardTitle>
                    <input
                      type="radio"
                      name="tier"
                      checked={selectedTier === tierId}
                      onChange={() => handleTierSelect(tierId)}
                      className="h-5 w-5 cursor-pointer text-[color:var(--brand)]"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                  <div className="space-y-1">
                    <p className="text-3xl font-bold text-[color:var(--brand)]">
                      ${tier.price.toLocaleString()}
                      <span className="ml-1 text-sm font-normal text-[color:var(--muted-ink)]">CAD</span>
                    </p>
                    <p className="text-xs text-[color:var(--muted-ink)]">plus GST/PST</p>
                  </div>
                  <CardDescription className="text-sm text-[color:var(--muted-ink)]">{tier.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2 pt-6">
                  {tier.features.map((feature) => (
                    <div key={feature.name} className="flex items-start gap-2 text-sm">
                      {feature.included ? (
                        <span className="mt-0.5 inline-flex h-4 w-4 flex-none items-center justify-center rounded-full bg-[#f0f3f7] text-[color:var(--brand)]">
                          <Check className="h-3 w-3" aria-hidden />
                        </span>
                      ) : (
                        <span className="mt-0.5 inline-flex h-4 w-4 flex-none items-center justify-center rounded-full bg-[#f0f3f7] text-[color:var(--slate)]">
                          <X className="h-3 w-3" aria-hidden />
                        </span>
                      )}
                      <span className={feature.included ? "text-[color:var(--brand)]" : "text-[color:var(--slate)]"}>
                        {feature.name}
                        {feature.note && <span className="block text-xs text-[color:var(--muted-ink)]">{feature.note}</span>}
                      </span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {selectedTier === "standard" && (
          <div className="rounded-2xl border border-[color:var(--brand)] bg-[color:var(--bg-surface)] p-4">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 flex-none text-[color:var(--brand)]" />
              <div className="text-sm">
                <p className="font-semibold text-[color:var(--brand)]">Need priority support?</p>
                <p className="mt-1 text-[color:var(--muted-ink)]">
                  Premium includes same-day response times, a dedicated coordinator, and unlimited requisition assistance.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-6">
          <div>
            <h2 className="mb-4 text-center text-sm font-semibold uppercase tracking-[0.3em] text-[color:var(--slate)]">
              Optional add-ons
            </h2>
            <p className="mb-6 text-center text-sm text-[color:var(--muted-ink)]">
              Enhance your service with these optional extras. You can add them now or contact us later.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {addOns.map((addOn) => (
              <Card
                key={addOn.id}
                className={`cursor-pointer border-[color:var(--border-muted)] transition hover:shadow-[0_20px_50px_-40px_rgba(15,23,42,0.25)] ${
                  selectedAddOns.has(addOn.id) ? "border-2 border-[color:var(--brand)] bg-[color:var(--bg-muted)]" : ""
                }`}
                onClick={() => toggleAddOn(addOn.id)}
              >
                <CardHeader className="space-y-3 pb-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={selectedAddOns.has(addOn.id)}
                          onChange={() => toggleAddOn(addOn.id)}
                          className="h-4 w-4 cursor-pointer text-[color:var(--brand)]"
                          onClick={(e) => e.stopPropagation()}
                        />
                        <CardTitle className="text-base text-[color:var(--brand)]">{addOn.name}</CardTitle>
                      </div>
                      <CardDescription className="mt-2 text-sm text-[color:var(--muted-ink)]">{addOn.description}</CardDescription>
                    </div>
                    <span className="text-lg font-bold text-[color:var(--brand)]">+${addOn.price}</span>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>

        <div className="sticky bottom-0 rounded-3xl border-2 border-[color:var(--brand)] bg-[color:var(--bg-surface)] p-8 shadow-[0_-20px_60px_-40px_rgba(15,26,42,0.25)]">
          <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-[color:var(--muted-ink)]">Total</p>
              <p className="mt-1 font-serif text-4xl font-bold text-[color:var(--brand)]">
                ${calculateTotal().toLocaleString()}
                <span className="ml-2 text-lg font-normal text-[color:var(--muted-ink)]">CAD</span>
              </p>
              <p className="mt-1 text-xs text-[color:var(--muted-ink)]">plus GST/PST</p>
              {selectedTierConfig && (
                <p className="mt-2 text-sm text-[color:var(--muted-ink)]">
                  {selectedTierConfig.name} tier
                  {selectedAddOns.size > 0 && ` + ${selectedAddOns.size} add-on${selectedAddOns.size > 1 ? "s" : ""}`}
                </p>
              )}
            </div>
            <Button
              size="lg"
              disabled={!selectedTier || isSubmitting}
              onClick={handleContinue}
              className="w-full sm:w-auto"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Get started"
              )}
            </Button>
          </div>
          <div className="mt-4 text-center text-xs text-[color:var(--muted-ink)]">
            You're saving thousands compared to traditional law firm fees
          </div>
        </div>
      </div>

      <Dialog open={showBasicUpsell} onOpenChange={setShowBasicUpsell}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl text-[color:var(--brand)]">Most executors choose Standard</DialogTitle>
            <DialogDescription className="text-base text-[color:var(--muted-ink)]">
              The Basic tier is great for tech-savvy executors, but most people prefer the peace of mind that comes with human review and
              phone support.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-3">
              <p className="text-sm font-semibold text-[color:var(--brand)]">For just $700 more, Standard includes:</p>
              <ul className="space-y-2 text-sm text-[color:var(--muted-ink)]">
                <li className="flex items-start gap-2">
                  <Check className="mt-0.5 h-4 w-4 flex-none text-[color:var(--brand)]" />
                  <span>Human review of all documents before delivery</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="mt-0.5 h-4 w-4 flex-none text-[color:var(--brand)]" />
                  <span>Phone and video support for your questions</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="mt-0.5 h-4 w-4 flex-none text-[color:var(--brand)]" />
                  <span>Free notarization in Vancouver (or $50 credit)</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="mt-0.5 h-4 w-4 flex-none text-[color:var(--brand)]" />
                  <span>One requisition response included</span>
                </li>
              </ul>
            </div>
          </div>
          <DialogFooter className="flex-col gap-2 sm:flex-col">
            <Button onClick={upgradeToStandard} className="w-full">
              Switch to Standard
            </Button>
            <Button onClick={confirmBasicSelection} variant="outline" className="w-full">
              Continue with Basic
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
