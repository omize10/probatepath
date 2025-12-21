'use client';

import { useState } from 'react';
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
    const res = await fetch('/api/auth/request-password-reset', { method: 'POST', body: JSON.stringify({ email }), headers: { 'Content-Type': 'application/json' } });
    setLoading(false);
    const data = await res.json().catch(() => ({}));
    if (data?.devCode) {
      toast({ title: 'Dev mode reset code', description: String(data.devCode) });
    } else {
      toast({ title: 'If an account exists, we sent a reset code.' });
    }
    router.push(`/reset-password?email=${encodeURIComponent(email.trim())}`);
  };

  return (
    <form onSubmit={handle} className="p-6">
      <label htmlFor="email">Email</label>
      <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      <Button type="submit" disabled={loading}>{loading ? 'Sending…' : 'Send reset code'}</Button>
    </form>
  );
}
