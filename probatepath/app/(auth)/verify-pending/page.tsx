'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/toast';

export default function VerifyPending() {
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const resend = async () => {
    setLoading(true);
    const res = await fetch('/api/auth/resend-verification', { method: 'POST', body: JSON.stringify({ email }), headers: { 'Content-Type': 'application/json' } });
    setLoading(false);
    if (res.ok) toast({ title: 'If an account exists, we sent verification instructions.' });
    else toast({ title: 'Unable to send', intent: 'error' });
  };

  return (
    <div className="p-6">
      <p>Your account is not verified. Enter your email to resend the verification link.</p>
      <Input value={email} onChange={(e) => setEmail(e.target.value)} />
      <Button onClick={resend} disabled={loading}>{loading ? 'Sending…' : 'Resend verification'}</Button>
    </div>
  );
}
