"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Phone, PhoneOff, Mic, MicOff, Loader2, CheckCircle2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type CallState = "ready" | "connecting" | "connected" | "ended" | "error";

const RETELL_AGENT_ID = process.env.NEXT_PUBLIC_RETELL_AGENT_ID || "";
const PHONE_NUMBER = process.env.NEXT_PUBLIC_PHONE_NUMBER || "(604) 670-3534";

export default function CallPage() {
  const [callState, setCallState] = useState<CallState>("ready");
  const [isMuted, setIsMuted] = useState(false);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [retellClient, setRetellClient] = useState<any>(null);

  // Timer for call duration
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (callState === "connected") {
      interval = setInterval(() => {
        setDuration((d) => d + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [callState]);

  // Format duration as MM:SS
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const startCall = useCallback(async () => {
    setCallState("connecting");
    setError(null);

    try {
      // Dynamically import Retell SDK (only on client)
      const { RetellWebClient } = await import("retell-client-js-sdk");

      const client = new RetellWebClient();
      setRetellClient(client);

      // Request microphone permission
      await navigator.mediaDevices.getUserMedia({ audio: true });

      // Start the call
      await client.startCall({
        accessToken: await getAccessToken(),
        sampleRate: 24000,
        emitRawAudioSamples: false,
      });

      // Set up event listeners
      client.on("call_started", () => {
        console.log("[call] Call started");
        setCallState("connected");
      });

      client.on("call_ended", () => {
        console.log("[call] Call ended");
        setCallState("ended");
      });

      client.on("error", (err: Error) => {
        console.error("[call] Error:", err);
        setError(err.message || "An error occurred during the call");
        setCallState("error");
      });

    } catch (err) {
      console.error("[call] Failed to start call:", err);
      setError(err instanceof Error ? err.message : "Failed to start call. Please try again.");
      setCallState("error");
    }
  }, []);

  const endCall = useCallback(() => {
    if (retellClient) {
      retellClient.stopCall();
    }
    setCallState("ended");
  }, [retellClient]);

  const toggleMute = useCallback(() => {
    if (retellClient) {
      if (isMuted) {
        retellClient.unmute();
      } else {
        retellClient.mute();
      }
      setIsMuted(!isMuted);
    }
  }, [retellClient, isMuted]);

  // Get access token from our API
  async function getAccessToken(): Promise<string> {
    const response = await fetch("/api/retell/access-token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ agentId: RETELL_AGENT_ID }),
    });
    const data = await response.json();
    if (!data.accessToken) {
      throw new Error("Failed to get access token");
    }
    return data.accessToken;
  }

  return (
    <div className="min-h-screen bg-[color:var(--bg-canvas)] py-12 px-4">
      <div className="mx-auto max-w-lg">
        <Card className="border-[color:var(--border-muted)] shadow-[0_25px_60px_-50px_rgba(15,23,42,0.18)]">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-[color:var(--brand)]">
              {callState === "ready" && "Ready to Talk?"}
              {callState === "connecting" && "Connecting..."}
              {callState === "connected" && "Connected"}
              {callState === "ended" && "Thanks for Calling!"}
              {callState === "error" && "Connection Issue"}
            </CardTitle>
            <CardDescription>
              {callState === "ready" &&
                "Speak with our AI assistant about your probate questions. It takes about 5 minutes."}
              {callState === "connecting" && "Please wait while we connect you..."}
              {callState === "connected" && `Call duration: ${formatDuration(duration)}`}
              {callState === "ended" && "Check your phone for next steps."}
              {callState === "error" && "Something went wrong."}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Ready State */}
            {callState === "ready" && (
              <>
                <div className="flex justify-center">
                  <div className="h-24 w-24 rounded-full bg-[#e8f4ff] flex items-center justify-center">
                    <Phone className="h-12 w-12 text-[#2563eb]" />
                  </div>
                </div>

                <Button onClick={startCall} size="lg" className="w-full h-14 text-lg">
                  <Phone className="h-5 w-5 mr-2" />
                  Start Call
                </Button>

                <div className="text-center space-y-2">
                  <p className="text-sm text-[color:var(--muted-ink)]">Or call us directly at</p>
                  <a
                    href={`tel:${PHONE_NUMBER.replace(/\D/g, "")}`}
                    className="text-lg font-semibold text-[color:var(--brand)] hover:underline"
                  >
                    {PHONE_NUMBER}
                  </a>
                </div>

                <div className="rounded-lg bg-[color:var(--bg-surface)] p-4 text-sm text-[color:var(--muted-ink)]">
                  <p className="font-medium text-[color:var(--brand)] mb-2">What to expect:</p>
                  <ul className="space-y-1">
                    <li>* We'll ask about your situation (5 min)</li>
                    <li>* You'll get instant answers to common questions</li>
                    <li>* We'll send next steps via text message</li>
                  </ul>
                </div>
              </>
            )}

            {/* Connecting State */}
            {callState === "connecting" && (
              <div className="flex flex-col items-center space-y-4 py-8">
                <div className="h-24 w-24 rounded-full bg-[#fef3c7] flex items-center justify-center animate-pulse">
                  <Loader2 className="h-12 w-12 text-[#d97706] animate-spin" />
                </div>
                <p className="text-[color:var(--muted-ink)]">Connecting you to our AI assistant...</p>
              </div>
            )}

            {/* Connected State */}
            {callState === "connected" && (
              <>
                <div className="flex justify-center">
                  <div className="h-24 w-24 rounded-full bg-green-100 flex items-center justify-center">
                    <div className="h-16 w-16 rounded-full bg-green-500 animate-pulse" />
                  </div>
                </div>

                <div className="text-center">
                  <p className="text-lg font-medium text-[color:var(--brand)]">Speaking with AI Assistant</p>
                  <p className="text-2xl font-bold text-[color:var(--brand)] mt-1">
                    {formatDuration(duration)}
                  </p>
                </div>

                <div className="flex justify-center gap-4">
                  <Button
                    variant={isMuted ? "secondary" : "outline"}
                    size="lg"
                    className="h-14 w-14 rounded-full p-0"
                    onClick={toggleMute}
                  >
                    {isMuted ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
                  </Button>
                  <Button
                    variant="secondary"
                    size="lg"
                    className="h-14 w-14 rounded-full p-0"
                    onClick={endCall}
                  >
                    <PhoneOff className="h-6 w-6" />
                  </Button>
                </div>

                <p className="text-center text-sm text-[color:var(--muted-ink)]">
                  {isMuted ? "You are muted" : "Speak normally - we can hear you"}
                </p>
              </>
            )}

            {/* Ended State */}
            {callState === "ended" && (
              <>
                <div className="flex justify-center">
                  <div className="h-24 w-24 rounded-full bg-green-100 flex items-center justify-center">
                    <CheckCircle2 className="h-12 w-12 text-green-600" />
                  </div>
                </div>

                <div className="text-center space-y-2">
                  <p className="text-lg font-medium text-[color:var(--brand)]">Call Complete</p>
                  <p className="text-sm text-[color:var(--muted-ink)]">
                    Duration: {formatDuration(duration)}
                  </p>
                </div>

                <div className="rounded-lg bg-[color:var(--bg-surface)] p-4 text-sm">
                  <p className="font-medium text-[color:var(--brand)] mb-2">What's next:</p>
                  <ul className="space-y-1 text-[color:var(--muted-ink)]">
                    <li>* Check your phone for a text with payment link</li>
                    <li>* Complete payment to start your intake</li>
                    <li>* Questions? Call us back anytime</li>
                  </ul>
                </div>

                <div className="flex flex-col gap-3">
                  <Button asChild size="lg" className="w-full">
                    <Link href="/portal">
                      Continue to Portal
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Link>
                  </Button>
                  <Button variant="outline" onClick={() => setCallState("ready")} className="w-full">
                    <Phone className="h-4 w-4 mr-2" />
                    Call Again
                  </Button>
                </div>
              </>
            )}

            {/* Error State */}
            {callState === "error" && (
              <>
                <div className="flex justify-center">
                  <div className="h-24 w-24 rounded-full bg-red-100 flex items-center justify-center">
                    <PhoneOff className="h-12 w-12 text-red-600" />
                  </div>
                </div>

                <div className="rounded-lg bg-red-50 p-4 text-sm text-red-800">
                  <p className="font-medium">Connection failed</p>
                  <p className="mt-1">{error || "Please check your microphone permissions and try again."}</p>
                </div>

                <div className="flex flex-col gap-3">
                  <Button onClick={() => setCallState("ready")} className="w-full">
                    Try Again
                  </Button>
                  <Button asChild variant="outline" className="w-full">
                    <a href={`tel:${PHONE_NUMBER.replace(/\D/g, "")}`}>
                      <Phone className="h-4 w-4 mr-2" />
                      Call {PHONE_NUMBER} Instead
                    </a>
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Back to home link */}
        <div className="mt-6 text-center">
          <Link href="/" className="text-sm text-[color:var(--muted-ink)] hover:text-[color:var(--brand)]">
            Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
