'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Phone, PhoneCall, PhoneOff, PhoneMissed, Check, AlertCircle, Loader2, ArrowLeft, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { getOnboardState, saveOnboardState } from '@/lib/onboard/state';

type CallStatus = 'ready_check' | 'initiating' | 'ringing' | 'in_progress' | 'completed' | 'no_answer' | 'failed';

export default function OnboardCallPage() {
  const router = useRouter();
  const [state, setState] = useState<{ name?: string; phone?: string; email?: string }>({});
  const [callStatus, setCallStatus] = useState<CallStatus>('ready_check');
  const [callId, setCallId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [retryCount, setRetryCount] = useState(0);
  const [readyChecks, setReadyChecks] = useState({
    phoneNearby: false,
    canTalk: false,
    willAnswer: false,
  });

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

  // Initiate call function
  const initiateCall = useCallback(async () => {
    if (!state.phone) return;

    setCallStatus('initiating');
    setError('');
    setCallId(null);

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

      if (data.success && (data.call_id || data.ai_call_id)) {
        const id = data.call_id || data.ai_call_id;
        setCallId(id);
        setCallStatus('ringing');
        saveOnboardState({ aiCallId: id });
      } else {
        setError(data.error || 'Failed to initiate call');
        setCallStatus('failed');
      }
    } catch (err) {
      console.error('[onboard/call] Error:', err);
      setError('Failed to connect. Please try again.');
      setCallStatus('failed');
    }
  }, [state.phone, state.name, state.email]);

  // allReadyChecksComplete helper
  const allReadyChecksComplete = readyChecks.phoneNearby && readyChecks.canTalk && readyChecks.willAnswer;

  // Start the call when user confirms they're ready
  const handleStartCall = () => {
    if (allReadyChecksComplete) {
      setCallStatus('initiating');
      initiateCall();
    }
  };

  // Poll for call completion - faster polling (1 second)
  useEffect(() => {
    if (!callId) return;

    // Don't poll if already in terminal state
    const terminalStates: CallStatus[] = ['completed', 'no_answer', 'failed'];
    if (terminalStates.includes(callStatus)) return;

    const poll = async () => {
      try {
        const res = await fetch(`/api/retell/call-status?call_id=${callId}`);
        const data = await res.json();

        console.log('[call-status] Response:', data);

        // Map backend status to frontend status
        switch (data.status) {
          case 'completed':
          case 'ended':
            setCallStatus('completed');
            break;
          case 'in_progress':
          case 'connected':
            setCallStatus('in_progress');
            break;
          case 'no_answer':
          case 'voicemail':
          case 'abandoned':
            setCallStatus('no_answer');
            break;
          case 'failed':
            setCallStatus('failed');
            setError('Call could not be completed');
            break;
          case 'initiated':
          case 'ringing':
            setCallStatus('ringing');
            break;
          // Keep current status for unknown
        }

        // Also check the ended flag
        if (data.ended && callStatus === 'ringing') {
          // Call ended while still showing ringing - probably no answer
          if (data.status === 'no_answer' || data.status === 'voicemail') {
            setCallStatus('no_answer');
          } else if (data.status === 'completed') {
            setCallStatus('completed');
          }
        }
      } catch (err) {
        console.error('[call-status] Poll error:', err);
      }
    };

    // Poll immediately, then every 1 second for fast updates
    poll();
    const interval = setInterval(poll, 1000);

    // Stop polling after 5 minutes
    const timeout = setTimeout(() => {
      clearInterval(interval);
      if (callStatus === 'ringing' || callStatus === 'in_progress') {
        setCallStatus('no_answer');
      }
    }, 5 * 60 * 1000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [callId, callStatus]);

  // Allow continuing after call ends (any terminal state)
  const terminalStates: CallStatus[] = ['completed', 'no_answer', 'failed'];
  const canContinue = terminalStates.includes(callStatus);

  const handleContinue = () => {
    router.push('/onboard/screening');
  };

  const handleRetry = () => {
    setRetryCount((c) => c + 1);
    setCallId(null);
    initiateCall();
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
      {/* Ready Check - Pre-call confirmation */}
      {callStatus === 'ready_check' && (
        <div className="w-full max-w-md space-y-6">
          <div className="text-center space-y-2">
            <div className="rounded-full bg-blue-100 p-6 w-20 h-20 mx-auto flex items-center justify-center mb-4">
              <Phone className="h-10 w-10 text-blue-600" />
            </div>
            <h2 className="font-serif text-2xl font-semibold text-[color:var(--brand)]">
              Ready for your call?
            </h2>
            <p className="text-[color:var(--muted-ink)]">
              We're about to call {formatPhone(state.phone || '')}
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
            <p className="font-medium text-blue-900">Please confirm:</p>

            <label className="flex items-start gap-3 cursor-pointer">
              <Checkbox
                checked={readyChecks.phoneNearby}
                onCheckedChange={(checked) =>
                  setReadyChecks(prev => ({ ...prev, phoneNearby: checked === true }))
                }
                className="mt-0.5"
              />
              <span className="text-sm text-blue-800">My phone is nearby and charged</span>
            </label>

            <label className="flex items-start gap-3 cursor-pointer">
              <Checkbox
                checked={readyChecks.canTalk}
                onCheckedChange={(checked) =>
                  setReadyChecks(prev => ({ ...prev, canTalk: checked === true }))
                }
                className="mt-0.5"
              />
              <span className="text-sm text-blue-800">I can talk for 5-10 minutes without interruption</span>
            </label>

            <label className="flex items-start gap-3 cursor-pointer">
              <Checkbox
                checked={readyChecks.willAnswer}
                onCheckedChange={(checked) =>
                  setReadyChecks(prev => ({ ...prev, willAnswer: checked === true }))
                }
                className="mt-0.5"
              />
              <span className="text-sm text-blue-800">I'll answer calls from unknown numbers</span>
            </label>
          </div>

          <Button
            onClick={handleStartCall}
            disabled={!allReadyChecksComplete}
            size="lg"
            className="w-full h-14 text-lg"
          >
            <Phone className="mr-2 h-5 w-5" />
            I'm ready, call me now
          </Button>

          <button
            onClick={handleCantTalk}
            className="w-full text-sm text-[color:var(--muted-ink)] underline hover:no-underline"
          >
            Can't talk right now? Continue without a call
          </button>
        </div>
      )}

      {/* Phone animation area */}
      <div className="flex flex-col items-center">
        {/* Initiating - Spinning loader */}
        {callStatus === 'initiating' && (
          <>
            <div className="rounded-full bg-[color:var(--bg-muted)] p-8 mb-4">
              <Loader2 className="h-16 w-16 text-[color:var(--brand)] animate-spin" />
            </div>
            <p className="text-xl font-medium text-[color:var(--brand)]">Connecting...</p>
            <p className="text-sm text-[color:var(--muted-ink)] mt-1">Setting up your call</p>
          </>
        )}

        {/* Ringing - Animated bouncing phone with pulse ring */}
        {callStatus === 'ringing' && (
          <>
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-green-400 animate-ping opacity-25" style={{ animationDuration: '1.5s' }} />
              <div className="absolute inset-0 rounded-full bg-green-300 animate-pulse opacity-40" />
              <div className="relative rounded-full bg-green-100 p-8 mb-4">
                <Phone className="h-16 w-16 text-green-600 animate-bounce" style={{ animationDuration: '0.6s' }} />
              </div>
            </div>
            <p className="text-xl font-medium text-green-700 mt-4">Calling you now!</p>
            <p className="text-lg text-[color:var(--brand)] mt-1">{formatPhone(state.phone || '')}</p>
            <p className="text-sm text-green-600 mt-3 font-medium animate-pulse">Pick up your phone!</p>
          </>
        )}

        {/* In Progress - Glowing active call icon */}
        {callStatus === 'in_progress' && (
          <>
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-green-400 opacity-20 animate-pulse" />
              <div className="rounded-full bg-green-100 p-8 mb-4 ring-4 ring-green-300 ring-opacity-50">
                <PhoneCall className="h-16 w-16 text-green-600" />
              </div>
            </div>
            <p className="text-xl font-medium text-green-700 mt-4">Call in progress</p>
            <p className="text-sm text-[color:var(--muted-ink)] mt-1">Take your time, we're here to help</p>
            <div className="flex items-center gap-1 mt-3">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
            </div>
          </>
        )}

        {/* Completed - Success checkmark */}
        {callStatus === 'completed' && (
          <>
            <div className="rounded-full bg-green-100 p-8 mb-4 ring-4 ring-green-200">
              <Check className="h-16 w-16 text-green-600" />
            </div>
            <p className="text-xl font-medium text-green-700">Call complete!</p>
            <p className="text-sm text-[color:var(--muted-ink)] mt-1">Thanks for chatting with us</p>
          </>
        )}

        {/* No Answer - Phone with missed indicator */}
        {callStatus === 'no_answer' && (
          <>
            <div className="rounded-full bg-amber-100 p-8 mb-4 ring-4 ring-amber-200">
              <PhoneMissed className="h-16 w-16 text-amber-600" />
            </div>
            <p className="text-xl font-medium text-amber-700">Looks like you missed our call</p>
            <p className="text-sm text-[color:var(--muted-ink)] mt-1">No worries! Let's try again</p>
          </>
        )}

        {/* Failed - Error state */}
        {callStatus === 'failed' && (
          <>
            <div className="rounded-full bg-red-100 p-8 mb-4 ring-4 ring-red-200">
              <PhoneOff className="h-16 w-16 text-red-600" />
            </div>
            <p className="text-xl font-medium text-red-700">Couldn't connect</p>
            {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
          </>
        )}
      </div>

      {/* Action buttons */}
      <div className="w-full max-w-sm space-y-3">
        {/* Continue button - for all terminal states (completed, no_answer, failed) */}
        {canContinue && (
          <Button onClick={handleContinue} size="lg" className="w-full h-14 text-lg">
            Continue
          </Button>
        )}

        {/* Skip retry after multiple failed attempts - show continue option instead */}
        {(callStatus === 'no_answer' || callStatus === 'failed') && retryCount < 2 && (
          <Button onClick={handleRetry} size="lg" variant="outline" className="w-full h-14 text-lg">
            <RotateCcw className="mr-2 h-5 w-5" />
            Try calling again
          </Button>
        )}

        {/* Disabled continue for active states */}
        {(callStatus === 'initiating' || callStatus === 'ringing' || callStatus === 'in_progress') && (
          <>
            <Button
              disabled
              size="lg"
              className="w-full h-14 text-lg bg-gray-200 text-gray-400 cursor-not-allowed hover:bg-gray-200"
            >
              Continue
            </Button>
            <p className="text-sm text-center text-[color:var(--muted-ink)]">
              Please speak with our team to continue
            </p>
          </>
        )}
      </div>

      {/* Didn't get call - show for ringing, no_answer, failed */}
      {(callStatus === 'ringing' || callStatus === 'no_answer' || callStatus === 'failed') && (
        <p className="text-sm text-[color:var(--muted-ink)]">
          Prefer to call us?{' '}
          <a href="tel:+16046703534" className="underline text-[color:var(--brand)] hover:no-underline font-medium">
            (604) 670-3534
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
