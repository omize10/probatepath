'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Phone, PhoneCall, Check, AlertCircle, Loader2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getOnboardState, saveOnboardState } from '@/lib/onboard/state';

type CallStatus = 'initiating' | 'ringing' | 'in_progress' | 'completed' | 'failed';

export default function OnboardCallPage() {
  const router = useRouter();
  const [state, setState] = useState<{ name?: string; phone?: string; email?: string }>({});
  const [callStatus, setCallStatus] = useState<CallStatus>('initiating');
  const [callId, setCallId] = useState<string | null>(null);
  const [error, setError] = useState('');

  // Load state on mount
  useEffect(() => {
    const onboardState = getOnboardState();
    if (!onboardState.phone) {
      router.push('/onboard/phone');
      return;
    }
    setState({
      name: onboardState.name,
      phone: onboardState.phone,
      email: onboardState.email,
    });
  }, [router]);

  // Trigger outbound call when state is ready
  useEffect(() => {
    if (!state.phone || callId) return;

    async function initiateCall() {
      try {
        const res = await fetch('/api/retell/outbound-call', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            phone_number: state.phone,
            name: state.name,
            email: state.email,
          }),
        });
        const data = await res.json();

        if (data.success && data.call_id) {
          setCallId(data.call_id);
          setCallStatus('ringing');
          saveOnboardState({ aiCallId: data.call_id });
        } else {
          setError(data.error || 'Failed to initiate call');
          setCallStatus('failed');
        }
      } catch (err) {
        console.error('[onboard/call] Error:', err);
        setError('Failed to connect. Please try again.');
        setCallStatus('failed');
      }
    }

    initiateCall();
  }, [state.phone, state.name, state.email, callId]);

  // Poll for call completion
  useEffect(() => {
    if (!callId || callStatus === 'completed' || callStatus === 'failed') return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/retell/call-status?call_id=${callId}`);
        const data = await res.json();

        if (data.status === 'completed' || data.status === 'ended') {
          setCallStatus('completed');
          clearInterval(interval);
        } else if (data.status === 'in_progress' || data.status === 'connected') {
          setCallStatus('in_progress');
        }
      } catch (err) {
        // Keep polling on error
      }
    }, 3000);

    // Stop polling after 10 minutes
    const timeout = setTimeout(() => {
      clearInterval(interval);
    }, 10 * 60 * 1000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [callId, callStatus]);

  const canContinue = callStatus === 'completed';

  const handleContinue = () => {
    router.push('/onboard/screening');
  };

  const handleCantTalk = () => {
    saveOnboardState({ aiCallId: 'skipped' });
    router.push('/onboard/explainer');
  };

  const formatPhone = (phone: string) => {
    const digits = phone.replace(/\D/g, '').slice(-10);
    if (digits.length === 10) {
      return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
    }
    return phone;
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8">

      {/* Phone animation area */}
      <div className="flex flex-col items-center">
        {callStatus === 'initiating' && (
          <>
            <div className="rounded-full bg-[color:var(--bg-muted)] p-8 mb-4">
              <Loader2 className="h-16 w-16 text-[color:var(--brand)] animate-spin" />
            </div>
            <p className="text-xl font-medium text-[color:var(--brand)]">Connecting...</p>
          </>
        )}

        {callStatus === 'ringing' && (
          <>
            <div className="rounded-full bg-green-100 p-8 mb-4 animate-pulse">
              <Phone className="h-16 w-16 text-green-600 animate-bounce" />
            </div>
            <p className="text-xl font-medium text-[color:var(--brand)]">Calling you now</p>
            <p className="text-[color:var(--muted-ink)] mt-1">{formatPhone(state.phone || '')}</p>
            <p className="text-sm text-green-600 mt-2">Pick up your phone!</p>
          </>
        )}

        {callStatus === 'in_progress' && (
          <>
            <div className="rounded-full bg-green-100 p-8 mb-4">
              <PhoneCall className="h-16 w-16 text-green-600" />
            </div>
            <p className="text-xl font-medium text-[color:var(--brand)]">Call in progress</p>
            <p className="text-sm text-[color:var(--muted-ink)] mt-1">Take your time</p>
          </>
        )}

        {callStatus === 'completed' && (
          <>
            <div className="rounded-full bg-green-100 p-8 mb-4">
              <Check className="h-16 w-16 text-green-600" />
            </div>
            <p className="text-xl font-medium text-[color:var(--brand)]">Call complete</p>
            <p className="text-sm text-[color:var(--muted-ink)] mt-1">Thanks for chatting with us!</p>
          </>
        )}

        {callStatus === 'failed' && (
          <>
            <div className="rounded-full bg-red-100 p-8 mb-4">
              <AlertCircle className="h-16 w-16 text-red-600" />
            </div>
            <p className="text-xl font-medium text-red-700">Couldn't connect</p>
            {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
          </>
        )}
      </div>

      {/* Continue button */}
      <div className="w-full max-w-sm space-y-3">
        <Button
          onClick={handleContinue}
          disabled={!canContinue}
          size="lg"
          className={`w-full h-14 text-lg ${
            canContinue
              ? ''
              : 'bg-gray-200 text-gray-400 cursor-not-allowed hover:bg-gray-200'
          }`}
        >
          Continue
        </Button>

        {/* Helper text when button disabled */}
        {!canContinue && callStatus !== 'failed' && (
          <p className="text-sm text-center text-[color:var(--muted-ink)]">
            Please speak with our team to continue
          </p>
        )}
      </div>

      {/* Didn't get call */}
      {(callStatus === 'ringing' || callStatus === 'failed') && (
        <p className="text-sm text-[color:var(--muted-ink)]">
          Didn't get a call?{' '}
          <a href="tel:+16046703534" className="underline text-[color:var(--brand)] hover:no-underline">
            Call us: (604) 670-3534
          </a>
        </p>
      )}

      {/* Can't talk option */}
      <button
        onClick={handleCantTalk}
        className="text-sm text-[color:var(--muted-ink)] underline hover:no-underline"
      >
        Can't talk right now?
      </button>

      {/* Back button */}
      <Button variant="ghost" onClick={() => router.push('/onboard/phone')} className="mt-4">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>
    </div>
  );
}
