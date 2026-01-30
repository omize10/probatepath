"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Eye, EyeOff, Loader2, CheckCircle2, Lock, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getOnboardState, saveOnboardState, TIER_INFO } from "@/lib/onboard/state";
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

  useEffect(() => {
    const state = getOnboardState();

    // Must have email and selected tier
    if (!state.email) {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
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
      // Create account
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name || email.split("@")[0],
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create account");
      }

      // Auto sign in
      const signInResult = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (signInResult?.error) {
        console.error("Auto sign-in failed:", signInResult.error);
        // Continue anyway - they can sign in later
      }

      // Save account created state
      saveOnboardState({ accountCreated: true });

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
          Set a password to secure your account. You&apos;ll use this to track your case.
        </p>
      </div>

      {/* Email display */}
      <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100">
            <Mail className="h-5 w-5 text-emerald-600" />
          </div>
          <div>
            <p className="text-sm text-emerald-700">Your account email</p>
            <p className="font-medium text-emerald-900">{email}</p>
          </div>
          <CheckCircle2 className="ml-auto h-5 w-5 text-emerald-500" />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name (optional) */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-[color:var(--brand)] mb-1">
            Your name (optional)
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Full name"
            className="w-full rounded-xl border border-[color:var(--border-muted)] px-4 py-3 text-[color:var(--brand)] placeholder:text-gray-400 focus:border-[color:var(--brand)] focus:outline-none focus:ring-1 focus:ring-[color:var(--brand)]"
          />
        </div>

        {/* Password */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-[color:var(--brand)] mb-1">
            Create a password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
              required
              minLength={8}
              className="w-full rounded-xl border border-[color:var(--border-muted)] pl-10 pr-12 py-3 text-[color:var(--brand)] placeholder:text-gray-400 focus:border-[color:var(--brand)] focus:outline-none focus:ring-1 focus:ring-[color:var(--brand)]"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-slate-700"
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
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type={showPassword ? "text" : "password"}
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter your password"
              required
              className="w-full rounded-xl border border-[color:var(--border-muted)] pl-10 pr-4 py-3 text-[color:var(--brand)] placeholder:text-gray-400 focus:border-[color:var(--brand)] focus:outline-none focus:ring-1 focus:ring-[color:var(--brand)]"
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
          <div className="rounded-xl bg-gray-50 border border-gray-200 p-4">
            <p className="text-xs text-slate-600 uppercase tracking-wide mb-1">Selected package</p>
            <div className="flex items-center justify-between">
              <span className="font-semibold text-[color:var(--brand)]">{tierInfo.name}</span>
              <span className="font-bold text-[color:var(--brand)]">${tierInfo.price.toLocaleString()}</span>
            </div>
          </div>
        )}

        <Button
          type="submit"
          size="lg"
          disabled={isLoading || !password || !confirmPassword}
          className="w-full h-14 text-lg font-semibold bg-emerald-600 hover:bg-emerald-700"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Creating account...
            </>
          ) : (
            "Create Account & Continue to Payment"
          )}
        </Button>
      </form>

      <Button variant="ghost" onClick={() => router.push("/onboard/result")} className="w-full">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>

      <p className="text-center text-xs text-slate-600">
        By creating an account, you agree to our Terms of Service and Privacy Policy.
      </p>
    </div>
  );
}
