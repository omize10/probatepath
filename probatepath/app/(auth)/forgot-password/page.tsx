'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';

export default function ForgotPassword() {
  const { toast } = useToast();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handle = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch('/api/auth/request-password-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      toast({ title: 'If an account exists, we sent a reset code.' });
      router.push(`/reset-password?email=${encodeURIComponent(email.trim())}`);
    } catch {
      toast({ title: 'Something went wrong.', intent: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-md px-6 py-16">
      <div className="rounded-3xl border border-[color:var(--border-muted)] bg-white p-8 shadow-[0_30px_80px_-70px_rgba(15,23,42,0.25)] sm:p-10">
        <p className="portal-badge text-[color:var(--ink-muted)]">Reset your password</p>
        <h1 className="mt-4 font-serif text-3xl text-[color:var(--brand)]">
          Forgot your password?
        </h1>
        <p className="mt-3 text-sm leading-6 text-[color:var(--muted-ink)]">
          No problem — enter the email you used to sign up and we&apos;ll send a 6-digit code to reset it.
        </p>

        <form onSubmit={handle} className="mt-6 space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-[color:var(--brand)]"
            >
              Email
            </label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
              placeholder="you@example.com"
              className="mt-1 w-full"
            />
          </div>
          <Button type="submit" disabled={loading} size="lg" className="w-full">
            {loading ? 'Sending…' : 'Send reset code'}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-[color:var(--muted-ink)]">
          Remember it?{' '}
          <Link href="/login" className="font-semibold text-[color:var(--brand)] hover:underline">
            Back to sign in
          </Link>
        </p>
      </div>

      <p className="mx-auto mt-6 max-w-sm text-center text-xs text-[color:var(--ink-muted)]">
        Having trouble? Email{' '}
        <a href="mailto:hello@probatedesk.com" className="underline">
          hello@probatedesk.com
        </a>{' '}
        or call{' '}
        <a href="tel:+16046703534" className="underline">
          (604) 670-3534
        </a>
        .
      </p>
    </div>
  );
}
