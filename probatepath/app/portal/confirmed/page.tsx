'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  CheckCircle,
  Phone,
  FileText,
  Mail,
  Clock,
  ArrowRight,
  Sparkles,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getOnboardState, clearOnboardState } from "@/lib/onboard/state";

export default function PortalConfirmedPage() {
  const [userName, setUserName] = useState<string>("");
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    // Get name from onboard state
    const state = getOnboardState();
    if (state.name) {
      setUserName(state.name.split(" ")[0]); // First name only
    }

    // Clear onboard state after display
    clearOnboardState();

    // Hide confetti after animation
    const timer = setTimeout(() => setShowConfetti(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative mx-auto max-w-2xl space-y-8 px-4 py-12 sm:px-6 lg:px-8">
      {/* Confetti animation */}
      {showConfetti && (
        <div className="pointer-events-none fixed inset-0 overflow-hidden">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-confetti"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 2}s`,
              }}
            >
              <div
                className="h-3 w-3 rotate-45"
                style={{
                  backgroundColor: ['#0f172a', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'][
                    Math.floor(Math.random() * 5)
                  ],
                }}
              />
            </div>
          ))}
        </div>
      )}

      {/* Success header */}
      <div className="text-center">
        <div className="relative mx-auto mb-6 flex h-24 w-24 items-center justify-center">
          <div className="absolute inset-0 animate-ping rounded-full bg-green-200 opacity-75" />
          <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="h-14 w-14 text-green-600" />
          </div>
        </div>
        <h1 className="font-serif text-4xl text-[color:var(--brand)] sm:text-5xl">
          You're All Set{userName ? `, ${userName}` : ""}!
        </h1>
        <p className="mt-4 text-lg text-[color:var(--muted-ink)]">
          Welcome to Full Service. We handle everything from here.
        </p>
      </div>

      {/* Key message */}
      <Card className="border-green-200 bg-green-50">
        <CardContent className="flex items-center gap-4 p-6">
          <div className="flex h-12 w-12 flex-none items-center justify-center rounded-full bg-green-100">
            <Phone className="h-6 w-6 text-green-700" />
          </div>
          <div>
            <p className="font-semibold text-green-800">
              Your dedicated case coordinator will contact you within 24 hours
            </p>
            <p className="text-sm text-green-700">
              Check your email for confirmation details
            </p>
          </div>
        </CardContent>
      </Card>

      {/* What happens next */}
      <Card className="border-[color:var(--border-muted)]">
        <CardContent className="p-6">
          <h2 className="mb-6 flex items-center gap-2 text-xl font-semibold text-[color:var(--brand)]">
            <Sparkles className="h-5 w-5" />
            What Happens Next
          </h2>

          <div className="space-y-6">
            {/* Step 1 */}
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[color:var(--brand)] text-white">
                  <Phone className="h-5 w-5" />
                </div>
                <div className="mt-2 h-full w-px bg-[color:var(--border-muted)]" />
              </div>
              <div className="pb-6">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-[color:var(--brand)]">Initial Call</h3>
                  <span className="rounded-full bg-[color:var(--bg-muted)] px-2 py-0.5 text-xs text-[color:var(--muted-ink)]">
                    Within 24 hours
                  </span>
                </div>
                <p className="mt-1 text-sm text-[color:var(--muted-ink)]">
                  Your case coordinator will call to introduce themselves and schedule a convenient time
                  for your 30-minute consultation with our lawyer.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[color:var(--brand)] text-white">
                  <Shield className="h-5 w-5" />
                </div>
                <div className="mt-2 h-full w-px bg-[color:var(--border-muted)]" />
              </div>
              <div className="pb-6">
                <h3 className="font-semibold text-[color:var(--brand)]">Lawyer Consultation</h3>
                <p className="mt-1 text-sm text-[color:var(--muted-ink)]">
                  A 30-minute call with our lawyer to review your situation, answer questions,
                  and collect all the details we need. You just talk, we handle the paperwork.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[color:var(--brand)] text-white">
                  <FileText className="h-5 w-5" />
                </div>
                <div className="mt-2 h-full w-px bg-[color:var(--border-muted)]" />
              </div>
              <div className="pb-6">
                <h3 className="font-semibold text-[color:var(--brand)]">We Prepare Everything</h3>
                <p className="mt-1 text-sm text-[color:var(--muted-ink)]">
                  Our team prepares all your probate documents, handles the filing,
                  and deals with the court if any issues arise.
                </p>
              </div>
            </div>

            {/* Step 4 */}
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[color:var(--brand)] text-white">
                  <Mail className="h-5 w-5" />
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-[color:var(--brand)]">Stay Informed</h3>
                <p className="mt-1 text-sm text-[color:var(--muted-ink)]">
                  We keep you updated at every step. Check your email and dashboard for progress,
                  and reach out anytime if you have questions.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* No action required message */}
      <div className="rounded-2xl border border-blue-200 bg-blue-50 p-6 text-center">
        <Clock className="mx-auto h-8 w-8 text-blue-600" />
        <p className="mt-2 font-semibold text-blue-800">No action required right now</p>
        <p className="mt-1 text-sm text-blue-700">
          Sit back and relax. We'll reach out to you shortly.
        </p>
      </div>

      {/* Actions */}
      <div className="space-y-4">
        <Link href="/portal">
          <Button size="lg" className="w-full">
            Go to Dashboard
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
        <p className="text-center text-sm text-[color:var(--muted-ink)]">
          Questions?{" "}
          <a
            href="mailto:support@probatedesk.com"
            className="font-medium text-[color:var(--brand)] underline hover:no-underline"
          >
            support@probatedesk.com
          </a>
          {" "}or call{" "}
          <a
            href="tel:+16046703534"
            className="font-medium text-[color:var(--brand)] underline hover:no-underline"
          >
            (604) 670-3534
          </a>
        </p>
      </div>

      {/* CSS for confetti animation */}
      <style jsx>{`
        @keyframes confetti {
          0% {
            transform: translateY(-100vh) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
        .animate-confetti {
          animation: confetti linear forwards;
        }
      `}</style>
    </div>
  );
}
