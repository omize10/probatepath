"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, ArrowLeft, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { WarningCallout } from "@/components/ui/warning-callout";
import { getOnboardState, saveOnboardState, type FitAnswers, type CommunicationPreference } from "@/lib/onboard/state";

interface PendingIntakeData {
  id: string;
  quizAnswers: FitAnswers | null;
  recommendedTier: string | null;
  selectedTier: string | null;
  grantType: string | null;
  redFlags: string[] | null;
  status: string;
  phone: string | null;
}

export default function OnboardEmailPhonePage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [confirmEmail, setConfirmEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [communicationPreference, setCommunicationPreference] = useState<CommunicationPreference>("email");
  const [referralFuneralHome, setReferralFuneralHome] = useState("");

  // Returning user state
  const [resumeData, setResumeData] = useState<PendingIntakeData | null>(null);
  const [showResumeBanner, setShowResumeBanner] = useState(false);
  const [checkingEmail, setCheckingEmail] = useState(false);

  useEffect(() => {
    const state = getOnboardState();
    if (state.isExecutor === undefined) {
      router.push("/onboard/executor");
      return;
    }
    if (!state.relationshipToDeceased) {
      router.push("/onboard/relationship");
      return;
    }
    if (state.email) {
      setEmail(state.email);
    }
    if (state.phone) {
      const digits = state.phone.replace(/\D/g, "").slice(-10);
      setPhone(formatPhone(digits));
    }
    if (state.communicationPreference) {
      setCommunicationPreference(state.communicationPreference);
    }
    if (state.referralFuneralHome) {
      setReferralFuneralHome(state.referralFuneralHome);
    }
  }, [router]);

  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, "");
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhone(formatPhone(e.target.value));
    setError("");
  };

  const isValidEmail = (val: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
  const isValidPhone = (val: string) => val.replace(/\D/g, "").length === 10;
  const emailsMatch =
    email.trim().toLowerCase() === confirmEmail.trim().toLowerCase();

  // Check for returning user when confirm email matches
  const checkReturningUser = useCallback(async (emailToCheck: string) => {
    if (!emailToCheck || !isValidEmail(emailToCheck)) return;
    setCheckingEmail(true);
    try {
      const res = await fetch(
        `/api/onboard/pending-intake?email=${encodeURIComponent(emailToCheck.toLowerCase())}`,
      );
      const data = await res.json();
      if (
        data.found &&
        data.pendingIntake?.quizAnswers &&
        Object.keys(data.pendingIntake.quizAnswers).length > 0
      ) {
        setResumeData(data.pendingIntake);
        setShowResumeBanner(true);
        // Pre-fill phone if we have it
        if (data.pendingIntake.phone && !phone) {
          const digits = data.pendingIntake.phone.replace(/\D/g, "").slice(-10);
          setPhone(formatPhone(digits));
        }
      } else {
        setResumeData(null);
        setShowResumeBanner(false);
      }
    } catch {
      // Silently fail — server check is best-effort
    } finally {
      setCheckingEmail(false);
    }
  }, [phone]);

  // Trigger check when emails match
  useEffect(() => {
    if (emailsMatch && email && isValidEmail(email) && confirmEmail) {
      checkReturningUser(email);
    } else {
      setShowResumeBanner(false);
    }
  }, [email, confirmEmail, emailsMatch, checkReturningUser]);

  const handleResume = () => {
    if (!resumeData) return;

    // Restore quiz state from server to localStorage
    const restoreData: Record<string, unknown> = {};
    if (resumeData.quizAnswers)
      restoreData.fitAnswers = resumeData.quizAnswers;
    if (resumeData.recommendedTier)
      restoreData.recommendedTier = resumeData.recommendedTier;
    if (resumeData.selectedTier)
      restoreData.selectedTier = resumeData.selectedTier;
    if (resumeData.grantType) restoreData.grantType = resumeData.grantType;
    if (resumeData.redFlags) restoreData.redFlags = resumeData.redFlags;

    const rawPhone = "+1" + phone.replace(/\D/g, "");
    saveOnboardState({
      email: email.trim().toLowerCase(),
      phone: rawPhone,
      pendingIntakeId: resumeData.id,
      ...restoreData,
    });

    // Navigate to the furthest step they reached
    if (resumeData.selectedTier) {
      router.push("/onboard/create-account");
    } else if (resumeData.recommendedTier) {
      router.push("/onboard/result");
    } else if (
      resumeData.quizAnswers &&
      Object.keys(resumeData.quizAnswers).length > 0
    ) {
      router.push("/onboard/screening");
    } else {
      router.push("/onboard/call-choice");
    }
  };

  const handleStartOver = () => {
    setShowResumeBanner(false);
    setResumeData(null);
  };

  const handleContinue = async () => {
    if (!email.trim()) {
      setError("Please enter your email");
      return;
    }
    if (!isValidEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }
    if (!emailsMatch) {
      setError("Email addresses don't match. Please try again.");
      return;
    }
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

    const rawPhone = "+1" + phone.replace(/\D/g, "");
    const normalizedEmail = email.trim().toLowerCase();

    // Save to localStorage
    saveOnboardState({
      email: normalizedEmail,
      phone: rawPhone,
      communicationPreference,
      referralFuneralHome: referralFuneralHome || undefined,
    });

    // Fire-and-forget: save to server
    fetch("/api/onboard/pending-intake", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: normalizedEmail, phone: rawPhone }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.id) {
          saveOnboardState({ pendingIntakeId: data.id });
        }
      })
      .catch(() => {});

    router.push("/onboard/call-choice");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (
      e.key === "Enter" &&
      email.trim() &&
      confirmEmail.trim() &&
      emailsMatch &&
      isValidPhone(phone)
    ) {
      handleContinue();
    }
  };

  return (
    <div className="space-y-8">
      <div className="space-y-2 text-center">
        <h1 className="font-serif text-3xl font-semibold text-[color:var(--brand)] sm:text-4xl">
          Welcome
        </h1>
        <p className="text-[color:var(--muted-ink)]">
          Please provide your email and phone number. We use email as our primary
          means of communicating updates and sharing important documents with you.
        </p>
      </div>

      {/* Returning user banner */}
      {showResumeBanner && resumeData && (
        <div className="rounded-xl bg-blue-50 border border-blue-200 p-4 space-y-3">
          <div className="flex items-start gap-3">
            <RefreshCw className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-blue-900">Welcome back!</p>
              <p className="text-sm text-blue-700">
                We saved your progress. Want to continue where you left off?
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleResume}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700"
            >
              Continue where I left off
            </Button>
            <Button onClick={handleStartOver} size="sm" variant="outline">
              Start over
            </Button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        <WarningCallout severity="warning">
          We&apos;ll send important legal documents to this email. Make sure you
          can access it and check it regularly.
        </WarningCallout>

        {/* Email */}
        <div className="space-y-2">
          <label
            htmlFor="email"
            className="text-sm font-medium text-[color:var(--brand)]"
          >
            Please provide your email
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
        </div>

        {/* Confirm email */}
        <div className="space-y-2">
          <label
            htmlFor="confirm-email"
            className="text-sm font-medium text-[color:var(--brand)]"
          >
            Confirm email address
          </label>
          <Input
            id="confirm-email"
            type="email"
            placeholder="you@example.com"
            value={confirmEmail}
            onChange={(e) => {
              setConfirmEmail(e.target.value);
              setError("");
            }}
            onKeyDown={handleKeyDown}
            className="h-14 text-lg"
          />
          {confirmEmail && !emailsMatch && (
            <p className="text-sm text-red-600">Emails don&apos;t match</p>
          )}
          {confirmEmail && emailsMatch && email && !checkingEmail && (
            <p className="text-sm text-green-600">Emails match</p>
          )}
        </div>

        {/* Phone */}
        <div className="space-y-2">
          <label
            htmlFor="phone"
            className="text-sm font-medium text-[color:var(--brand)]"
          >
            Phone number
          </label>
          <Input
            id="phone"
            type="tel"
            placeholder="(604) 555-1234"
            value={phone}
            onChange={handlePhoneChange}
            onKeyDown={handleKeyDown}
            className="h-14 text-lg"
          />
        </div>

        {/* Communication preference */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-[color:var(--brand)]">
            Do you prefer text or email for communications?
          </label>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setCommunicationPreference("email")}
              className={`flex-1 rounded-xl border-2 px-4 py-3 text-sm font-medium transition-colors ${
                communicationPreference === "email"
                  ? "border-[color:var(--brand)] bg-blue-50 text-[color:var(--brand)]"
                  : "border-[color:var(--border-muted)] text-[color:var(--muted-ink)] hover:border-[color:var(--brand)]"
              }`}
            >
              Email
            </button>
            <button
              type="button"
              onClick={() => setCommunicationPreference("text")}
              className={`flex-1 rounded-xl border-2 px-4 py-3 text-sm font-medium transition-colors ${
                communicationPreference === "text"
                  ? "border-[color:var(--brand)] bg-blue-50 text-[color:var(--brand)]"
                  : "border-[color:var(--border-muted)] text-[color:var(--muted-ink)] hover:border-[color:var(--brand)]"
              }`}
            >
              Text
            </button>
          </div>
        </div>

        {/* Funeral home referral (optional) */}
        <div className="space-y-2">
          <label
            htmlFor="referral"
            className="text-sm font-medium text-[color:var(--brand)]"
          >
            Were you referred by a funeral home or service provider?{" "}
            <span className="font-normal text-[color:var(--muted-ink)]">(optional)</span>
          </label>
          <select
            id="referral"
            value={referralFuneralHome}
            onChange={(e) => setReferralFuneralHome(e.target.value)}
            className="flex h-14 w-full rounded-2xl border border-[color:var(--border-muted)] bg-[color:var(--bg-surface)] px-4 py-2 text-base text-[color:var(--ink)] focus:border-[color:var(--brand)] focus:outline-none focus:ring-2 focus:ring-[color:var(--brand)] focus:ring-offset-2"
          >
            <option value="">Select one (optional)</option>
            <option value="none">No referral</option>
            <option value="first_memorial">First Memorial Funeral Services</option>
            <option value="mountain_view">Mountain View Funeral Home</option>
            <option value="forest_lawn">Forest Lawn Funeral Home</option>
            <option value="victory">Victory Memorial Park Funeral Centre</option>
            <option value="ocean_view">Ocean View Burial Park</option>
            <option value="other">Other</option>
          </select>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <Button
          onClick={handleContinue}
          disabled={
            !email.trim() ||
            !confirmEmail.trim() ||
            !emailsMatch ||
            !isValidPhone(phone) ||
            isLoading
          }
          size="lg"
          className="w-full h-14 text-lg"
        >
          Continue
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>

        <Button
          variant="ghost"
          onClick={() => router.push("/onboard/relationship")}
          className="w-full"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
      </div>

      <p className="text-center text-xs text-[color:var(--muted-ink)]">
        We&apos;ll never share your information or use it for marketing.
      </p>
    </div>
  );
}
