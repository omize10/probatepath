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

      {/* OAuth Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-[color:var(--border-muted)]" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-2 text-[color:var(--ink-muted)]">Or continue with</span>
        </div>
      </div>

      {/* OAuth Buttons */}
      <div className="space-y-3">
        <button
          type="button"
          onClick={async () => {
            setIsLoading(true);
            await signIn("google", {
              callbackUrl: "/onboard/oauth-callback"
            });
          }}
          disabled={isLoading}
          className="flex w-full items-center justify-center gap-2 rounded-full border border-[color:var(--border-muted)] bg-white px-4 py-3 text-sm font-semibold text-[color:var(--ink)] transition hover:bg-gray-50 disabled:opacity-50"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Sign up with Google
        </button>

        <button
          type="button"
          onClick={async () => {
            setIsLoading(true);
            await signIn("azure-ad", {
              callbackUrl: "/onboard/oauth-callback"
            });
          }}
          disabled={isLoading}
          className="flex w-full items-center justify-center gap-2 rounded-full border border-[color:var(--border-muted)] bg-white px-4 py-3 text-sm font-semibold text-[color:var(--ink)] transition hover:bg-gray-50 disabled:opacity-50"
        >
          <svg className="h-5 w-5" viewBox="0 0 23 23">
            <path fill="#f25022" d="M0 0h11v11H0z"/>
            <path fill="#00a4ef" d="M12 0h11v11H12z"/>
            <path fill="#7fba00" d="M0 12h11v11H0z"/>
            <path fill="#ffb900" d="M12 12h11v11H12z"/>
          </svg>
          Sign up with Microsoft
        </button>
      </div>

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
