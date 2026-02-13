'use client';

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function LoginForm({ next, emailCodeAuthEnabled }: { next: string; emailCodeAuthEnabled: boolean }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'password' | 'email-code'>('password');
  const [step, setStep] = useState<'email' | 'code'>('email');
  const [email, setEmail] = useState('');

  const handlePasswordSubmit = async (event: FormEvent<HTMLFormElement>) => {
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

  const handleRequestCode = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const emailValue = String(formData.get("email") ?? "").trim();
    if (!emailValue) {
      setError("Enter your email address.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/auth/request-verification-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailValue }),
      });
      if (!response.ok) {
        const data = await response.json();
        setError(data.error || 'Failed to send verification code');
        setLoading(false);
        return;
      }
      setEmail(emailValue);
      setStep('code');
      setLoading(false);
    } catch (err) {
      setError('Failed to send verification code');
      setLoading(false);
    }
  };

  const handleVerifyCode = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const code = String(formData.get("code") ?? "").trim();
    if (!code) {
      setError("Enter the verification code.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/auth/verify-code-signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code }),
      });
      const data = await response.json();
      if (!response.ok) {
        if (data.error === 'TooManyAttempts') {
          setError('Too many failed attempts. Please request a new code.');
        } else if (data.error === 'Expired') {
          setError('Code expired. Please request a new code.');
        } else {
          setError('Invalid code. Please try again.');
        }
        setLoading(false);
        return;
      }
      // Code verified, now sign in with the signInToken
      const callbackUrl = next.startsWith("/") ? next : "/portal";
      const result = await signIn("credentials", {
        redirect: false,
        email: data.email,
        password: data.signInToken, // Use signInToken from verification
        callbackUrl,
      });
      if (result?.error) {
        setError('Sign-in failed. Please try again.');
        setLoading(false);
        return;
      }
      router.push(result?.url ?? callbackUrl);
    } catch (err) {
      setError('Failed to verify code');
      setLoading(false);
    }
  };

  const resetEmailCodeFlow = () => {
    setStep('email');
    setEmail('');
    setError(null);
  };

  return (
    <div className="mx-auto w-full max-w-lg space-y-8 rounded-3xl border border-[color:var(--border-muted)] bg-white p-8 shadow-[0_30px_90px_-60px_rgba(15,23,42,0.35)]">
      <div className="space-y-2 text-center">
        <p className="portal-badge text-[color:var(--ink-muted)]">Sign in</p>
        <h1 className="font-serif text-3xl text-[color:var(--ink)]">Access your portal</h1>
        <p className="text-sm text-[color:var(--ink-muted)]">
          {mode === 'password'
            ? 'Secure email + password login. Cookies keep you signed in for 7 days.'
            : step === 'email'
            ? 'Sign in with a verification code sent to your email.'
            : 'Enter the code we sent to your email.'}
        </p>
      </div>

      {/* Mode Toggle (only show if email code auth is enabled) */}
      {emailCodeAuthEnabled && mode === 'password' && (
        <div className="text-center">
          <button
            type="button"
            onClick={() => setMode('email-code')}
            className="text-sm text-[color:var(--brand-navy)] underline-offset-4 hover:underline"
          >
            Sign in with email code instead
          </button>
        </div>
      )}

      {mode === 'password' ? (
        <form className="space-y-5" onSubmit={handlePasswordSubmit}>
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-semibold text-[color:var(--ink)]">Email</label>
            <Input id="email" name="email" type="email" required autoComplete="email" placeholder="you@example.com" />
          </div>
          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-semibold text-[color:var(--ink)]">Password</label>
            <Input id="password" name="password" type="password" required autoComplete="current-password" />
          </div>
          {error ? (
            <p className="rounded-2xl border border-[rgba(161,112,62,0.4)] bg-[rgba(161,112,62,0.1)] px-4 py-2 text-sm text-[color:var(--ink)]">
              {error}
            </p>
          ) : null}
          <Button type="submit" className="w-full" disabled={loading}>
            Sign in
          </Button>
        </form>
      ) : step === 'email' ? (
        <form className="space-y-5" onSubmit={handleRequestCode}>
          <div className="space-y-2">
            <label htmlFor="email-code" className="text-sm font-semibold text-[color:var(--ink)]">Email</label>
            <Input id="email-code" name="email" type="email" required autoComplete="email" placeholder="you@example.com" />
            <p className="text-xs text-[color:var(--ink-muted)]">Enter your email to receive a verification code</p>
          </div>
          {error ? (
            <p className="rounded-2xl border border-[rgba(161,112,62,0.4)] bg-[rgba(161,112,62,0.1)] px-4 py-2 text-sm text-[color:var(--ink)]">
              {error}
            </p>
          ) : null}
          <Button type="submit" className="w-full" disabled={loading}>
            Send code
          </Button>
          <button
            type="button"
            onClick={() => setMode('password')}
            className="w-full text-sm text-[color:var(--ink-muted)] hover:text-[color:var(--ink)]"
          >
            Back to password sign-in
          </button>
        </form>
      ) : (
        <form className="space-y-5" onSubmit={handleVerifyCode}>
          <div className="space-y-2">
            <label htmlFor="code" className="text-sm font-semibold text-[color:var(--ink)]">Verification code</label>
            <Input
              id="code"
              name="code"
              type="text"
              required
              placeholder="000000"
              maxLength={6}
              pattern="[0-9]{6}"
              autoComplete="off"
            />
            <p className="text-xs text-[color:var(--ink-muted)]">Please enter the code that was sent to you in the box below</p>
          </div>
          {error ? (
            <p className="rounded-2xl border border-[rgba(161,112,62,0.4)] bg-[rgba(161,112,62,0.1)] px-4 py-2 text-sm text-[color:var(--ink)]">
              {error}
            </p>
          ) : null}
          <Button type="submit" className="w-full" disabled={loading}>
            Sign in
          </Button>
          <button
            type="button"
            onClick={resetEmailCodeFlow}
            className="w-full text-sm text-[color:var(--ink-muted)] hover:text-[color:var(--ink)]"
          >
            Request a new code
          </button>
        </form>
      )}

      {/* Only show OAuth options in password mode */}
      {mode === 'password' && (
        <>
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
              onClick={() => {
                setLoading(true);
                signIn("google", { callbackUrl: next.startsWith("/") ? next : "/portal" });
              }}
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-full border border-[color:var(--border-muted)] bg-white px-4 py-2 text-sm font-semibold text-[color:var(--ink)] transition hover:bg-gray-50 disabled:opacity-50"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Sign in with Google
            </button>

            <button
              type="button"
              onClick={() => {
                setLoading(true);
                signIn("azure-ad", { callbackUrl: next.startsWith("/") ? next : "/portal" });
              }}
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-full border border-[color:var(--border-muted)] bg-white px-4 py-2 text-sm font-semibold text-[color:var(--ink)] transition hover:bg-gray-50 disabled:opacity-50"
            >
              <svg className="h-5 w-5" viewBox="0 0 23 23">
                <path fill="#f25022" d="M0 0h11v11H0z"/>
                <path fill="#00a4ef" d="M12 0h11v11H12z"/>
                <path fill="#7fba00" d="M0 12h11v11H0z"/>
                <path fill="#ffb900" d="M12 12h11v11H12z"/>
              </svg>
              Sign in with Microsoft
            </button>
          </div>
        </>
      )}

      <p className="text-center text-sm text-[color:var(--ink-muted)]">
        New to ProbateDesk?{' '}
        <Link href="/onboard/executor" className="text-[color:var(--brand-navy)] underline-offset-4 hover:underline">
          Get started with probate
        </Link>
      </p>
    </div>
  );
}
