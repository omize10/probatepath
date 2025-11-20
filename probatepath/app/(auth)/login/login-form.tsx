'use client';

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function LoginForm({ next }: { next: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");
    if (!email || !password) {
      setError("Enter your email and password.");
      return;
    }
    setLoading(true);
    setError(null);
    const callbackUrl = next.startsWith("/") ? next : "/portal";
    const result = await signIn("credentials", {
      redirect: false,
      email,
      password,
      callbackUrl,
    });
    if (result?.error) {
      setError(result.error);
      setLoading(false);
      return;
    }
    router.push(result?.url ?? callbackUrl);
  };

  return (
    <div className="mx-auto w-full max-w-lg space-y-8 rounded-3xl border border-[color:var(--border-muted)] bg-white p-8 shadow-[0_30px_90px_-60px_rgba(15,23,42,0.35)]">
      <div className="space-y-2 text-center">
        <p className="portal-badge text-[color:var(--ink-muted)]">Sign in</p>
        <h1 className="font-serif text-3xl text-[color:var(--ink)]">Access your portal</h1>
        <p className="text-sm text-[color:var(--ink-muted)]">Secure email + password login. Cookies keep you signed in for 7 days.</p>
      </div>
      <form className="space-y-5" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-semibold text-[color:var(--ink)]">Email</label>
          <Input id="email" name="email" type="email" required autoComplete="email" placeholder="you@example.com" />
        </div>
        <div className="space-y-2">
          <label htmlFor="password" className="text-sm font-semibold text-[color:var(--ink)]">Password</label>
          <Input id="password" name="password" type="password" required autoComplete="current-password" />
        </div>
        {error ? (
          <p className="rounded-2xl border border-[color:var(--warning)]/40 bg-[color:var(--warning)]/10 px-4 py-2 text-sm text-[color:var(--ink)]">
            {error}
          </p>
        ) : null}
        <Button type="submit" className="w-full" disabled={loading}>
          Sign in
        </Button>
      </form>
      <p className="text-center text-sm text-[color:var(--ink-muted)]">
        Need an account?{' '}
        <Link href={`/register?next=${encodeURIComponent(next)}`} className="text-[color:var(--brand-navy)] underline-offset-4 hover:underline">
          Create one
        </Link>
      </p>
    </div>
  );
}
