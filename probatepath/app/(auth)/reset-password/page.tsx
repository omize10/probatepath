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
  const router = useRouter();
  const { toast } = useToast();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  if (!token) {
    return (
      <div className="p-8 max-w-md mx-auto">
        <div className="rounded-lg bg-yellow-50 border border-yellow-200 p-4">
          <h2 className="font-semibold text-yellow-800 mb-2">Invalid Reset Link</h2>
          <p className="text-sm text-yellow-700 mb-4">
            This password reset link is invalid or has expired.
          </p>
          <Button
            onClick={() => router.push('/forgot-password')}
            variant="outline"
            className="w-full"
          >
            Request New Reset Link
          </Button>
        </div>
      </div>
    );
  }

  const handle = async (e: React.FormEvent) => {
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
        body: JSON.stringify({ token, newPassword: password })
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

      toast({ title: 'Password updated successfully', intent: 'success' });
      
      // Attempt sign in with new password
      const signInResult = await signIn('credentials', {
        redirect: false,
        email: undefined,
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

  return (
    <div className="p-8 max-w-md mx-auto">
      <h1 className="text-2xl font-serif mb-6">Reset your password</h1>
      <form onSubmit={handle} className="space-y-6">
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
            <p className="text-xs text-gray-500 mt-1">
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

        <Button 
          type="submit" 
          disabled={loading}
          className="w-full bg-[#ff6a00] text-white hover:bg-[#e45f00]"
        >
          {loading ? 'Updating...' : 'Set new password'}
        </Button>

        <p className="text-center text-sm text-gray-500">
          Remember your password?{' '}
          <a href="/login" className="text-[#ff6a00] hover:underline">
            Sign in
          </a>
        </p>
      </form>
    </div>
  );
}
