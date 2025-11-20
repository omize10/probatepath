'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function VerifyLanding() {
  const params = useSearchParams();
  const token = params?.get('token') ?? '';
  const router = useRouter();
  const [status, setStatus] = useState<'idle'|'loading'|'success'|'error'>('idle');

  useEffect(() => {
    if (!token) return;
    (async () => {
      setStatus('loading');
      const res = await fetch('/api/auth/verify', { method: 'POST', body: JSON.stringify({ token }), headers: { 'Content-Type': 'application/json' } });
      if (res.ok) {
        setStatus('success');
        setTimeout(() => router.push('/portal'), 1200);
      } else {
        setStatus('error');
      }
    })();
  }, [token, router]);

  return (
    <div className="p-8">
      {status === 'idle' && <p>Preparing...</p>}
      {status === 'loading' && <p>Verifying...</p>}
      {status === 'success' && <p>Email verified — redirecting to portal…</p>}
      {status === 'error' && <p>Verification failed or link expired. Try resending verification from your account.</p>}
    </div>
  );
}
