"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { CreditCard, Rocket, Loader2, CheckCircle2, Phone, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PROVINCES, TIER_PRICES, TIER_DISPLAY_NAMES, type Tier, type NewTier } from "@/types/pricing";
import { getOnboardState, clearOnboardState, type Tier as OnboardTier } from "@/lib/onboard/state";

interface PrefillData {
  tier?: Tier;
  name?: string;
  email?: string;
  phone?: string;
  grantType?: string;
  fromAiCall?: boolean;
}

// Map onboard tiers to Tier type
const mapOnboardTier = (tier: OnboardTier): NewTier => tier;

export default function PayPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams?.get("token") ?? null;
  const tierParam = searchParams?.get("tier") as Tier | null;

  const [isLoading, setIsLoading] = useState(!!token);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [prefillData, setPrefillData] = useState<PrefillData | null>(null);
  const [tokenValid, setTokenValid] = useState<boolean | null>(null);
  const [fromOnboard, setFromOnboard] = useState(false);
  const [grantType, setGrantType] = useState<string | null>(null);

  // Form state
  const [selectedTier, setSelectedTier] = useState<Tier>("guided");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");
  const [cardholderName, setCardholderName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [billingAddress, setBillingAddress] = useState("");
  const [city, setCity] = useState("");
  const [province, setProvince] = useState("BC");
  const [postalCode, setPostalCode] = useState("");

  // Load from onboard state or URL params
  useEffect(() => {
    const onboardState = getOnboardState();

    // Check if coming from onboard flow
    if (onboardState.selectedTier) {
      setFromOnboard(true);
      setSelectedTier(mapOnboardTier(onboardState.selectedTier));
      setGrantType(onboardState.grantType || null);

      // Prefill from onboard state
      if (onboardState.name) setCardholderName(onboardState.name);
      if (onboardState.email) setEmail(onboardState.email);
      if (onboardState.phone) {
        // Format phone for display
        const digits = onboardState.phone.replace(/\D/g, "").slice(-10);
        if (digits.length === 10) {
          setPhone(`(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`);
        }
      }
    } else if (tierParam) {
      // Coming from URL param (e.g., from old flow or direct link)
      setSelectedTier(tierParam);
    }

    setIsLoading(false);
  }, [tierParam]);

  // Validate token and get prefill data
  useEffect(() => {
    async function validateToken() {
      if (!token) return;

      setIsLoading(true);
      try {
        const response = await fetch(`/api/payment/token/${token}`);
        const data = await response.json();

        if (data.valid) {
          setTokenValid(true);
          setPrefillData(data.prefill_data);

          // Pre-fill form fields from token
          if (data.prefill_data.tier) {
            setSelectedTier(data.prefill_data.tier);
          }
          if (data.prefill_data.name) {
            setCardholderName(data.prefill_data.name);
          }
          if (data.prefill_data.email) {
            setEmail(data.prefill_data.email);
          }
          if (data.prefill_data.phone) {
            setPhone(data.prefill_data.phone);
          }
          if (data.prefill_data.grantType) {
            setGrantType(data.prefill_data.grantType);
          }
        } else {
          setTokenValid(false);
          setError(data.error || "Invalid or expired link");
        }
      } catch (err) {
        console.error("[pay] Token validation error:", err);
        setTokenValid(false);
        setError("Failed to validate payment link");
      } finally {
        setIsLoading(false);
      }
    }

    validateToken();
  }, [token]);

  const handleSubmit = async (skipped: boolean = false) => {
    setIsProcessing(true);
    setError(null);

    try {
      // Create or get tier selection
      const tierResponse = await fetch("/api/tier/select", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          selectedTier,
          screeningFlags: [],
        }),
      });

      if (!tierResponse.ok) {
        throw new Error("Failed to save tier selection");
      }

      const { tierSelectionId } = await tierResponse.json();

      // Process payment
      const paymentResponse = await fetch("/api/payment/beta", {
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

      if (!paymentResponse.ok) {
        const data = await paymentResponse.json();
        throw new Error(data.error || "Failed to process payment");
      }

      // Mark token as used if we have one
      if (token) {
        await fetch(`/api/payment/token/${token}`, { method: "POST" });
      }

      // Clear onboard state
      clearOnboardState();

      // Route based on tier
      const nextRoute = getNextRoute(selectedTier);
      router.push(nextRoute);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsProcessing(false);
    }
  };

  const getNextRoute = (tier: Tier): string => {
    // Map to new tier names if needed
    const normalizedTier = tier === "basic" ? "essentials" : tier === "standard" ? "guided" : tier === "premium" ? "full_service" : tier;

    switch (normalizedTier) {
      case "essentials":
        return "/portal/intake";
      case "guided":
        return "/portal/schedule";
      case "full_service":
        return "/portal/confirmed";
      default:
        return "/portal";
    }
  };

  const tierPrice = TIER_PRICES[selectedTier] || 1499;
  const tierName = TIER_DISPLAY_NAMES[selectedTier] || "Guided";

  // Loading state
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[color:var(--bg-canvas)]">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-[color:var(--brand)] mx-auto" />
          <p className="text-[color:var(--muted-ink)]">Loading...</p>
        </div>
      </div>
    );
  }

  // Invalid token state
  if (token && tokenValid === false) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[color:var(--bg-canvas)] px-4">
        <Card className="max-w-md w-full border-[color:var(--border-muted)]">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-[color:var(--brand)]">Link Expired</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-[color:var(--muted-ink)] text-center">
              This payment link has expired or already been used. Please start over.
            </p>
            <div className="flex flex-col gap-3">
              <Button asChild className="w-full">
                <Link href="/onboard/name">Start Over</Link>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link href="/">Back to Home</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[color:var(--bg-canvas)] py-12 px-4">
      <div className="mx-auto max-w-4xl space-y-8">
        {/* Header with back button for onboard flow */}
        {fromOnboard && (
          <Button
            variant="ghost"
            onClick={() => router.push("/onboard/pricing")}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Pricing
          </Button>
        )}

        {/* From AI Call Banner */}
        {prefillData?.fromAiCall && (
          <div className="rounded-2xl border-2 border-green-300 bg-green-50 p-6">
            <div className="flex items-start gap-4">
              <CheckCircle2 className="h-8 w-8 flex-none text-green-600" />
              <div>
                <h2 className="text-lg font-bold text-green-900">Based on Your Call</h2>
                <p className="mt-1 text-green-800">
                  We've pre-filled your information. Review and complete payment to continue.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Beta Banner */}
        <div className="rounded-2xl border-2 border-blue-300 bg-blue-50 p-6">
          <div className="flex items-start gap-4">
            <Rocket className="h-8 w-8 flex-none text-blue-600" />
            <div>
              <h2 className="text-lg font-bold text-blue-900">BETA TESTING</h2>
              <p className="mt-1 text-blue-800">
                Payment information is <strong>optional</strong> during our beta period.
              </p>
              <p className="mt-2 text-sm text-blue-700">Your card will not be charged.</p>
            </div>
          </div>
        </div>

        <div className="space-y-4 text-center">
          <h1 className="font-serif text-4xl text-[color:var(--brand)] sm:text-5xl">
            Complete Your Order
          </h1>
          <p className="mx-auto max-w-2xl text-base text-[color:var(--muted-ink)]">
            {grantType === "administration"
              ? "You're starting the administration process (no will)."
              : "You're starting the probate process."}
          </p>
        </div>

        {error && !token && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-center text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr]">
          <Card className="border-[color:var(--border-muted)] shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl text-[color:var(--brand)]">
                <CreditCard className="h-6 w-6" />
                Payment Details
              </CardTitle>
              <CardDescription className="text-sm text-[color:var(--muted-ink)]">
                All fields are optional during beta
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSubmit(false);
                }}
                className="space-y-6"
              >
                {/* Tier display (not editable from pay page) */}
                <div className="rounded-xl border-2 border-[color:var(--brand)] bg-[color:var(--bg-surface)] p-4">
                  <div className="flex items-baseline justify-between">
                    <div>
                      <p className="font-semibold text-[color:var(--brand)]">{tierName}</p>
                      <p className="text-sm text-[color:var(--muted-ink)]">
                        {selectedTier === "essentials" || selectedTier === "basic"
                          ? "You file, we guide"
                          : selectedTier === "guided" || selectedTier === "standard"
                          ? "We check, you file"
                          : "We handle everything"}
                      </p>
                    </div>
                    <p className="text-2xl font-bold text-[color:var(--brand)]">
                      ${tierPrice.toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-semibold text-[color:var(--brand)]">
                      Email
                    </label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="phone" className="text-sm font-semibold text-[color:var(--brand)]">
                      Phone
                    </label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="(604) 555-1234"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                </div>

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
                  <Button type="submit" size="lg" className="w-full h-14 text-lg" disabled={isProcessing}>
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
            <Card className="border-[color:var(--border-muted)] shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl text-[color:var(--brand)]">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-[color:var(--brand)]">{tierName} Package</span>
                    <span className="font-semibold text-[color:var(--brand)]">
                      ${tierPrice.toLocaleString()}
                    </span>
                  </div>
                  {grantType && (
                    <div className="flex justify-between text-sm">
                      <span className="text-[color:var(--muted-ink)]">Type</span>
                      <span className="capitalize text-[color:var(--brand)]">{grantType}</span>
                    </div>
                  )}
                </div>

                <div className="border-t-2 border-[color:var(--brand)] pt-3">
                  <div className="flex justify-between">
                    <span className="text-lg font-bold text-[color:var(--brand)]">Total</span>
                    <span className="text-2xl font-bold text-[color:var(--brand)]">
                      ${tierPrice.toLocaleString()} CAD
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-[color:var(--muted-ink)]">plus GST/PST at checkout</p>
                </div>

                <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4 text-xs text-blue-800">
                  <p className="font-semibold">Beta period - no charge</p>
                  <p className="mt-1">Your card will not be charged during the beta period.</p>
                </div>

                <div className="rounded-2xl border border-[color:var(--border-muted)] bg-[color:var(--bg-muted)] p-4 text-xs text-[color:var(--muted-ink)]">
                  <p className="font-semibold text-[color:var(--brand)]">What's next?</p>
                  <p className="mt-1">
                    {selectedTier === "essentials" || selectedTier === "basic"
                      ? "Continue to the intake questionnaire to enter your estate details."
                      : selectedTier === "guided" || selectedTier === "standard"
                      ? "Schedule a call with our team. We'll walk you through everything."
                      : "A lawyer will call you within 24 hours to get started."}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Need Help Card */}
            <Card className="border-[color:var(--border-muted)]">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-[color:var(--brand)]" />
                  <div>
                    <p className="text-sm font-medium text-[color:var(--brand)]">Need help?</p>
                    <a
                      href="tel:+16046703534"
                      className="text-sm text-[color:var(--muted-ink)] hover:underline"
                    >
                      Call (604) 670-3534
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Back to home link */}
        <div className="text-center">
          <Link href="/" className="text-sm text-[color:var(--muted-ink)] hover:text-[color:var(--brand)]">
            Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
