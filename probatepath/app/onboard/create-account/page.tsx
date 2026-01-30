"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Eye, EyeOff, Loader2, Lock, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getOnboardState, saveOnboardState, savePendingIntake, TIER_INFO } from "@/lib/onboard/state";
import { signIn } from "next-auth/react";

export default function OnboardCreateAccountPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTier, setSelectedTier] = useState<string | null>(null);
  const [existingAccount, setExistingAccount] = useState(false);

  useEffect(() => {
    const state = getOnboardState();

    // Must have email and selected tier
    if (!state.email || !state.phone) {
      router.push("/onboard/email");
      return;
    }
    if (!state.selectedTier) {
      router.push("/onboard/result");
      return;
    }

    setEmail(state.email);
    setName(state.name || "");
    setSelectedTier(state.selectedTier);
  }, [router]);

  const isValidEmail = (val: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setExistingAccount(false);

    // Validation
    if (!name.trim() || name.trim().length < 2) {
      setError("Please enter your full legal name");
      return;
    }
    if (!email.trim() || !isValidEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    setIsLoading(true);

    try {
      // If email was changed, update localStorage and server
      const state = getOnboardState();
      const normalizedEmail = email.trim().toLowerCase();
      if (normalizedEmail !== state.email) {
        saveOnboardState({ email: normalizedEmail });
        savePendingIntake({ email: normalizedEmail });
      }

      // Create account
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: normalizedEmail,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 409) {
          setExistingAccount(true);
          setIsLoading(false);
          return;
        }
        throw new Error(data.error || "Failed to create account");
      }

      // Auto sign in
      const signInResult = await signIn("credentials", {
        email: normalizedEmail,
        password,
        redirect: false,
      });

      if (signInResult?.error) {
        console.error("Auto sign-in failed:", signInResult.error);
      }

      // Complete onboarding — create TierSelection + LeadSource
      const completeState = getOnboardState();
      await fetch("/api/onboard/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: normalizedEmail,
          phone: completeState.phone || "",
          tier: completeState.selectedTier || "premium",
          grantType: completeState.grantType || "probate",
          aiCallId: completeState.aiCallId,
          screening: completeState.fitAnswers || {},
          redFlags: completeState.redFlags || [],
        }),
      }).catch((err) => {
        console.error("[create-account] onboard/complete failed:", err);
      });

      // Mark PendingIntake as converted (fire-and-forget)
      if (completeState.email) {
        fetch("/api/onboard/pending-intake", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: normalizedEmail,
            status: "converted_to_account",
          }),
        }).catch(() => {});
      }

      // Save account created state
      saveOnboardState({ accountCreated: true, name: name.trim() });

      // Proceed to payment
      router.push(`/pay?tier=${selectedTier}`);
    } catch (err) {
      console.error("Registration error:", err);
      setError(err instanceof Error ? err.message : "Something went wrong");
      setIsLoading(false);
    }
  };

  const tierInfo = selectedTier ? TIER_INFO[selectedTier as keyof typeof TIER_INFO] : null;

  return (
    <div className="space-y-8">
      <div className="space-y-2 text-center">
        <h1 className="font-serif text-3xl font-semibold text-[color:var(--brand)] sm:text-4xl">
          Create your account
        </h1>
        <p className="text-[color:var(--muted-ink)]">
          Almost there. Let&apos;s set up your account so you can access your
          personalized probate pathway.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email (editable) */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-[color:var(--brand)] mb-1">
            Email address
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError(null);
              setExistingAccount(false);
            }}
            required
            className="w-full rounded-xl border border-[color:var(--border-muted)] px-4 py-3 text-[color:var(--brand)] placeholder:text-[color:var(--text-placeholder)] focus:border-[color:var(--brand)] focus:outline-none focus:ring-1 focus:ring-[color:var(--brand)]"
          />
        </div>

        {/* Existing account warning */}
        {existingAccount && (
          <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-sm text-amber-800">
            <p>
              Looks like you already have an account with this email.{" "}
              <Link href="/login" className="font-semibold underline hover:text-amber-900">
                Log in instead
              </Link>{" "}
              or use a different email.
            </p>
          </div>
        )}

        {/* Full legal name (required) */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-[color:var(--brand)] mb-1">
            Full legal name
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[color:var(--text-placeholder)]" />
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your full legal name"
              required
              minLength={2}
              className="w-full rounded-xl border border-[color:var(--border-muted)] pl-10 pr-4 py-3 text-[color:var(--brand)] placeholder:text-[color:var(--text-placeholder)] focus:border-[color:var(--brand)] focus:outline-none focus:ring-1 focus:ring-[color:var(--brand)]"
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-[color:var(--brand)] mb-1">
            Create a password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[color:var(--text-placeholder)]" />
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
              required
              minLength={8}
              className="w-full rounded-xl border border-[color:var(--border-muted)] pl-10 pr-12 py-3 text-[color:var(--brand)] placeholder:text-[color:var(--text-placeholder)] focus:border-[color:var(--brand)] focus:outline-none focus:ring-1 focus:ring-[color:var(--brand)]"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[color:var(--text-placeholder)] hover:text-[color:var(--text-secondary)]"
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Confirm Password */}
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-[color:var(--brand)] mb-1">
            Confirm password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[color:var(--text-placeholder)]" />
            <input
              type={showPassword ? "text" : "password"}
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter your password"
              required
              className="w-full rounded-xl border border-[color:var(--border-muted)] pl-10 pr-4 py-3 text-[color:var(--brand)] placeholder:text-[color:var(--text-placeholder)] focus:border-[color:var(--brand)] focus:outline-none focus:ring-1 focus:ring-[color:var(--brand)]"
            />
          </div>
        </div>

        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-800">
            {error}
          </div>
        )}

        {/* Selected tier reminder */}
        {tierInfo && (
          <div className="rounded-xl bg-gray-50 border border-[color:var(--border-subtle)] p-4">
            <p className="text-xs text-[color:var(--text-tertiary)] uppercase tracking-wide mb-1">Selected package</p>
            <div className="flex items-center justify-between">
              <span className="font-semibold text-[color:var(--brand)]">{tierInfo.name}</span>
              <span className="font-bold text-[color:var(--brand)]">${tierInfo.price.toLocaleString()}</span>
            </div>
          </div>
        )}

        <Button
          type="submit"
          size="lg"
          disabled={isLoading || !password || !confirmPassword || !name.trim()}
          className="w-full h-14 text-lg font-semibold bg-emerald-600 hover:bg-emerald-700"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Creating account...
            </>
          ) : (
            "Create Account"
          )}
        </Button>
      </form>

      <Button variant="ghost" onClick={() => router.push("/onboard/result")} className="w-full">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>

      <p className="text-center text-xs text-[color:var(--text-tertiary)]">
        By creating an account, you agree to our Terms of Service and Privacy Policy.
      </p>
    </div>
  );
}
