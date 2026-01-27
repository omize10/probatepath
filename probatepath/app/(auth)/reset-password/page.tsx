'use client';

import { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import { signIn } from 'next-auth/react';

export default function ResetPassword() {
  const params = useSearchParams();
  const token = params?.get('token') ?? '';
  const emailParam = params?.get('email') ?? '';
  const router = useRouter();
  const { toast } = useToast();
  const [code, setCode] = useState('');
  const [resetToken, setResetToken] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  if (!token && !emailParam) {
    return (
      <div className="p-8 max-w-md mx-auto">
        <div className="rounded-lg bg-yellow-50 border border-yellow-200 p-4">
          <h2 className="font-semibold text-yellow-800 mb-2">Invalid Reset Link</h2>
          <p className="text-sm text-yellow-700 mb-4">
            Please request a new password reset.
          </p>
          <Button
            onClick={() => router.push('/forgot-password')}
            variant="outline"
            className="w-full"
          >
            Request Reset Code
          </Button>
        </div>
      </div>
    );
  }

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setVerifying(true);
    try {
      const res = await fetch('/api/auth/verify-password-reset-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailParam, code }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (data.error === 'Expired') {
          toast({ title: 'Code expired', description: 'Request a new code.', intent: 'error' });
          router.push('/forgot-password');
          return;
        }
        if (data.error === 'TooManyAttempts') {
          toast({ title: 'Too many attempts', description: 'Request a new code.', intent: 'error' });
          router.push('/forgot-password');
          return;
        }
        toast({ title: 'Invalid code', description: 'Please try again.', intent: 'error' });
        return;
      }

      if (!data.resetToken) {
        toast({ title: 'Unable to verify code', intent: 'error' });
        return;
      }

      setResetToken(data.resetToken);
      toast({ title: 'Code verified. Set a new password.', intent: 'success' });
    } catch (err) {
      console.error('Verify code error:', err);
      toast({ title: 'Verification failed', description: 'Please try again.', intent: 'error' });
    } finally {
      setVerifying(false);
    }
  };

  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (password.length < 8) {
      toast({ title: 'Password must be at least 8 characters', intent: 'error' });
      return;
    }
    if (password !== confirmPassword) {
      toast({ title: 'Passwords do not match', intent: 'error' });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(token ? { token, newPassword: password } : { resetToken, newPassword: password })
      });

      if (!res.ok) {
        const data = await res.json();
        if (data.error === 'Expired') {
          toast({ 
            title: 'Reset link expired',
            description: 'Please request a new reset link.',
            intent: 'error'
          });
          router.push('/forgot-password');
          return;
        }
        throw new Error(data.error || 'Failed to reset password');
      }

      const data = await res.json();
      toast({ title: 'Password updated successfully', intent: 'success' });
      
      // Attempt sign in with new password
      const signInResult = await signIn('credentials', {
        redirect: false,
        email: data.email ?? emailParam,
        password,
        callbackUrl: '/portal'
      });

      if (signInResult?.error) {
        console.warn('Auto-login failed:', signInResult.error);
        router.push('/login');
        return;
      }

      router.push('/portal');
    } catch (err) {
      console.error('Reset error:', err);
      toast({ 
        title: 'Reset failed',
        description: err instanceof Error ? err.message : 'Please try again',
        intent: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="p-8 max-w-md mx-auto">
        <h1 className="text-2xl font-serif mb-6">Reset your password</h1>

        {!resetToken ? (
          <form onSubmit={handleVerifyCode} className="space-y-4">
            <p className="text-sm text-slate-700">
              Enter the 6-digit code we emailed to <span className="font-medium">{emailParam}</span>.
            </p>
            <div>
              <label htmlFor="code" className="block text-sm font-medium mb-1">
                Reset code
              </label>
              <Input
                id="code"
                inputMode="numeric"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
                className="w-full"
              />
            </div>
            <Button type="submit" disabled={verifying} className="w-full">
              {verifying ? 'Verifying...' : 'Verify code'}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => router.push('/forgot-password')}
            >
              Send a new code
            </Button>
          </form>
        ) : (
          <form onSubmit={handleSetPassword} className="space-y-6">
            <div className="space-y-4">
              <div>
                <label htmlFor="password" className="block text-sm font-medium mb-1">
                  New password
                </label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength={8}
                  required
                  className="w-full"
                />
                <p className="text-xs text-slate-600 mt-1">
                  Must be at least 8 characters
                </p>
              </div>

              <div>
                <label htmlFor="confirm-password" className="block text-sm font-medium mb-1">
                  Confirm new password
                </label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  minLength={8}
                  required
                  className="w-full"
                />
              </div>
            </div>

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? 'Updating...' : 'Set new password'}
            </Button>
          </form>
        )}
      </div>
    );
  }

  return (
    <div className="p-8 max-w-md mx-auto">
      <h1 className="text-2xl font-serif mb-6">Reset your password</h1>
      <form onSubmit={handleSetPassword} className="space-y-6">
        <div className="space-y-4">
          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-1">
              New password
            </label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={8}
              required
              className="w-full"
            />
            <p className="text-xs text-slate-600 mt-1">
              Must be at least 8 characters
            </p>
          </div>

          <div>
            <label htmlFor="confirm-password" className="block text-sm font-medium mb-1">
              Confirm new password
            </label>
            <Input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              minLength={8}
              required
              className="w-full"
            />
          </div>
        </div>

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? 'Updating...' : 'Set new password'}
        </Button>

        <p className="text-center text-sm text-slate-600">
          Remember your password?{' '}
          <a href="/login" className="text-[color:var(--brand)] hover:underline">
            Sign in
          </a>
        </p>
      </form>
    </div>
  );
}
