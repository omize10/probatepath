'use client';

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type RegisterFormVariant = "portal" | "start";

const VARIANT_COPY: Record<RegisterFormVariant, {
  eyebrow: string;
  title: string;
  description: string;
  passwordHint: string;
  buttonLabel: string;
  footerPrefix: string;
  footerLinkLabel: string;
}> = {
  portal: {
    eyebrow: "Create account",
    title: "Set up your portal login",
    description: "Use a strong password you control. We never store plaintext credentials.",
    passwordHint: "Minimum 12 characters.",
    buttonLabel: "Create account",
    footerPrefix: "Already have an account?",
    footerLinkLabel: "Sign in",
  },
  start: {
    eyebrow: "Start here",
    title: "Create your Probate Desk account",
    description: "This is the first step of the start-now flow. We store credentials locally so you can come back without sending confidential information to a server.",
    passwordHint: "Minimum 12 characters.",
    buttonLabel: "Create account",
    footerPrefix: "Already have an account?",
    footerLinkLabel: "Sign in",
  },
};

export function RegisterForm({ next, variant = "portal" }: { next: string; variant?: RegisterFormVariant }) {
  const copy = VARIANT_COPY[variant];
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const name = String(formData.get("name") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim().toLowerCase();
    const password = String(formData.get("password") ?? "");
    const confirm = String(formData.get("confirm") ?? "");

    if (!name || !email || !password) {
      setError("Fill in all required fields.");
      return;
    }
    if (password.length < 12) {
      setError("Use at least 12 characters for your password.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      if (!response.ok) {
        let message = "Unable to create your account right now.";
        try {
          const payload = await response.json();
          if (payload?.error) {
            message = payload.error;
          }
        } catch {
          // ignore body parse errors
        }
        throw new Error(message);
      }

      const callbackUrl = next.startsWith("/") ? next : "/start";
      const result = await signIn("credentials", {
        redirect: false,
        email,
        password,
        callbackUrl,
      });
      if (result?.error) {
        throw new Error(result.error);
      }
      router.push(result?.url ?? callbackUrl);
      router.refresh();
    } catch (err) {
      console.error("[register] Failed to create account", err);
      setError(err instanceof Error ? err.message : "Unable to create your account right now.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-lg space-y-8 rounded-3xl border border-[color:var(--border-muted)] bg-white p-8 shadow-[0_30px_90px_-60px_rgba(15,23,42,0.35)]">
      <div className="space-y-2 text-center">
        <p className="portal-badge text-[color:var(--ink-muted)]">{copy.eyebrow}</p>
        <h1 className="font-serif text-3xl text-[color:var(--ink)]">{copy.title}</h1>
        <p className="text-sm text-[color:var(--ink-muted)]">{copy.description}</p>
      </div>
      <form className="space-y-5" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <label htmlFor="name" className="text-sm font-semibold text-[color:var(--ink)]">Full name</label>
          <Input id="name" name="name" required autoComplete="name" placeholder="Carey Executor" />
        </div>
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-semibold text-[color:var(--ink)]">Email</label>
          <Input id="email" name="email" type="email" required autoComplete="email" placeholder="you@example.com" />
        </div>
        <div className="space-y-2">
          <label htmlFor="password" className="text-sm font-semibold text-[color:var(--ink)]">Password</label>
          <Input id="password" name="password" type="password" minLength={12} autoComplete="new-password" required />
          <p className="text-xs text-[color:var(--ink-muted)]">{copy.passwordHint}</p>
        </div>
        <div className="space-y-2">
          <label htmlFor="confirm" className="text-sm font-semibold text-[color:var(--ink)]">Confirm password</label>
          <Input id="confirm" name="confirm" type="password" minLength={12} autoComplete="new-password" required />
        </div>
        {error ? (
          <p className="rounded-2xl border border-[rgba(161,112,62,0.4)] bg-[rgba(161,112,62,0.1)] px-4 py-2 text-sm text-[color:var(--ink)]">
            {error}
          </p>
        ) : null}
        <Button type="submit" className="w-full" disabled={loading}>
          {copy.buttonLabel}
        </Button>
      </form>
      <p className="text-center text-sm text-[color:var(--ink-muted)]">
        {copy.footerPrefix}{' '}
        <Link href={`/login?next=${encodeURIComponent(next)}`} className="text-[color:var(--brand-navy)] underline-offset-4 hover:underline">
          {copy.footerLinkLabel}
        </Link>
      </p>
    </div>
  );
}
