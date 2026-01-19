'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CreditCard, Rocket, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PROVINCES, TIER_PRICES, type Tier } from "@/types/pricing";

export default function PaymentPage() {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state - all optional
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");
  const [cardholderName, setCardholderName] = useState("");
  const [billingAddress, setBillingAddress] = useState("");
  const [city, setCity] = useState("");
  const [province, setProvince] = useState("BC");
  const [postalCode, setPostalCode] = useState("");

  // Data from previous page
  const [tierSelectionId, setTierSelectionId] = useState<string | null>(null);
  const [selectedTier, setSelectedTier] = useState<Tier | null>(null);

  useEffect(() => {
    // Retrieve data from sessionStorage
    const storedTierSelectionId = sessionStorage.getItem("tierSelectionId");
    const storedTier = sessionStorage.getItem("selectedTier") as Tier | null;

    if (!storedTierSelectionId || !storedTier) {
      // Redirect back to pricing if no selection
      router.push("/portal/pricing");
      return;
    }

    setTierSelectionId(storedTierSelectionId);
    setSelectedTier(storedTier);
  }, [router]);

  const handleSubmit = async (skipped: boolean = false) => {
    if (!tierSelectionId || !selectedTier) return;

    setIsProcessing(true);
    setError(null);

    try {
      const response = await fetch("/api/payment/beta", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tierSelectionId,
          cardNumber: skipped ? undefined : cardNumber,
          expiryDate: skipped ? undefined : expiry,
          cvc: skipped ? undefined : cvc,
          cardholderName: skipped ? undefined : cardholderName,
          billingAddress: skipped ? undefined : billingAddress,
          city: skipped ? undefined : city,
          province: skipped ? undefined : province,
          postalCode: skipped ? undefined : postalCode,
          skipped,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to save payment information");
      }

      const { nextRoute } = await response.json();

      // Clear sessionStorage
      sessionStorage.removeItem("tierSelectionId");
      sessionStorage.removeItem("selectedTier");
      sessionStorage.removeItem("selectedAddOns");

      // Route based on tier
      router.push(nextRoute);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsProcessing(false);
    }
  };

  const tierPrice = selectedTier ? TIER_PRICES[selectedTier] : 0;
  const tierName = selectedTier ? selectedTier.charAt(0).toUpperCase() + selectedTier.slice(1) : "";

  if (!tierSelectionId || !selectedTier) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[color:var(--brand)]" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8 px-4 py-12 sm:px-6 lg:px-8">
      {/* Beta Banner */}
      <div className="rounded-2xl border-2 border-blue-300 bg-blue-50 p-6">
        <div className="flex items-start gap-4">
          <Rocket className="h-8 w-8 flex-none text-blue-600" />
          <div>
            <h2 className="text-lg font-bold text-blue-900">BETA TESTING</h2>
            <p className="mt-1 text-blue-800">
              Payment information is <strong>optional</strong> during our beta period.
            </p>
            <p className="mt-2 text-sm text-blue-700">
              Full launch in 21 days. Your card will not be charged.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4 text-center">
        <h1 className="font-serif text-4xl text-[color:var(--brand)] sm:text-5xl">Payment Information</h1>
        <p className="mx-auto max-w-2xl text-base text-[color:var(--muted-ink)]">
          Enter your payment details below, or skip for now during the beta period.
        </p>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-center text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr]">
        <Card className="border-[color:var(--border-muted)] shadow-[0_30px_80px_-70px_rgba(15,23,42,0.25)]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl text-[color:var(--brand)]">
              <CreditCard className="h-6 w-6" />
              Payment details
            </CardTitle>
            <CardDescription className="text-sm text-[color:var(--muted-ink)]">
              All fields are optional during beta
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={(e) => { e.preventDefault(); handleSubmit(false); }} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="cardNumber" className="text-sm font-semibold text-[color:var(--brand)]">
                  Card number
                </label>
                <Input
                  id="cardNumber"
                  type="text"
                  placeholder="1234 5678 9012 3456"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label htmlFor="expiry" className="text-sm font-semibold text-[color:var(--brand)]">
                    Expiry date
                  </label>
                  <Input
                    id="expiry"
                    type="text"
                    placeholder="MM/YY"
                    value={expiry}
                    onChange={(e) => setExpiry(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="cvc" className="text-sm font-semibold text-[color:var(--brand)]">
                    CVC
                  </label>
                  <Input
                    id="cvc"
                    type="text"
                    placeholder="123"
                    value={cvc}
                    onChange={(e) => setCvc(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="cardholderName" className="text-sm font-semibold text-[color:var(--brand)]">
                  Cardholder name
                </label>
                <Input
                  id="cardholderName"
                  type="text"
                  placeholder="John Smith"
                  value={cardholderName}
                  onChange={(e) => setCardholderName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="billingAddress" className="text-sm font-semibold text-[color:var(--brand)]">
                  Billing address
                </label>
                <Input
                  id="billingAddress"
                  type="text"
                  placeholder="123 Main Street"
                  value={billingAddress}
                  onChange={(e) => setBillingAddress(e.target.value)}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <label htmlFor="city" className="text-sm font-semibold text-[color:var(--brand)]">
                    City
                  </label>
                  <Input
                    id="city"
                    type="text"
                    placeholder="Vancouver"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="province" className="text-sm font-semibold text-[color:var(--brand)]">
                    Province
                  </label>
                  <select
                    id="province"
                    value={province}
                    onChange={(e) => setProvince(e.target.value)}
                    className="flex h-12 w-full rounded-2xl border border-[color:var(--border-muted)] bg-[color:var(--bg-surface)] px-4 py-2 text-base text-[color:var(--ink)] focus:border-[color:var(--brand)] focus:outline-none focus:ring-2 focus:ring-[color:var(--brand)] focus:ring-offset-2"
                  >
                    {PROVINCES.map((p) => (
                      <option key={p.value} value={p.value}>
                        {p.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label htmlFor="postalCode" className="text-sm font-semibold text-[color:var(--brand)]">
                    Postal code
                  </label>
                  <Input
                    id="postalCode"
                    type="text"
                    placeholder="V6B 1A1"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-3 pt-4">
                <Button
                  type="submit"
                  size="lg"
                  className="w-full"
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    "Continue"
                  )}
                </Button>

                <Button
                  type="button"
                  size="lg"
                  variant="outline"
                  className="w-full"
                  disabled={isProcessing}
                  onClick={() => handleSubmit(true)}
                >
                  Skip for now
                </Button>
              </div>

              <p className="text-center text-xs text-[color:var(--muted-ink)]">
                By continuing, you agree to our Terms of Service and Privacy Policy.
              </p>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-[color:var(--border-muted)] shadow-[0_25px_60px_-50px_rgba(15,23,42,0.18)]">
            <CardHeader>
              <CardTitle className="text-xl text-[color:var(--brand)]">Order summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-[color:var(--brand)]">{tierName} Tier</span>
                  <span className="font-semibold text-[color:var(--brand)]">${tierPrice.toLocaleString()}</span>
                </div>
              </div>

              <div className="border-t-2 border-[color:var(--brand)] pt-3">
                <div className="flex justify-between">
                  <span className="text-lg font-bold text-[color:var(--brand)]">Total</span>
                  <span className="text-2xl font-bold text-[color:var(--brand)]">${tierPrice.toLocaleString()} CAD</span>
                </div>
                <p className="mt-1 text-xs text-[color:var(--muted-ink)]">plus GST/PST at checkout</p>
              </div>

              <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4 text-xs text-blue-800">
                <p className="font-semibold">Beta period - no charge</p>
                <p className="mt-1">
                  Your card will not be charged during the beta period. You can skip payment entirely if you prefer.
                </p>
              </div>

              <div className="rounded-2xl border border-[color:var(--border-muted)] bg-[color:var(--bg-muted)] p-4 text-xs text-[color:var(--muted-ink)]">
                <p className="font-semibold text-[color:var(--brand)]">What's next?</p>
                <p className="mt-1">
                  {selectedTier === "basic" ? (
                    "After payment, you'll continue to the intake questionnaire to enter your estate details."
                  ) : (
                    "After payment, you'll schedule a call with our team. We'll walk you through everything."
                  )}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
