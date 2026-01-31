"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ExternalLink, CheckCircle, Phone, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getOnboardState, saveOnboardState } from "@/lib/onboard/state";

export default function OnboardSpecialistPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [showResult, setShowResult] = useState(false);
  const [email, setEmail] = useState("");
  const [declinedHelp, setDeclinedHelp] = useState(false);

  useEffect(() => {
    const state = getOnboardState();
    if (!state.redirectedToSpecialist) {
      router.push("/onboard/screening");
      return;
    }
    if (state.email) {
      setEmail(state.email);
    }

    // 10-second loading animation
    const timer = setTimeout(() => {
      setIsLoading(false);
      setShowResult(true);
    }, 10000);

    return () => clearTimeout(timer);
  }, [router]);

  const handleConnect = () => {
    // Open Open Door Law in new tab
    window.open("https://www.opendoorlaw.ca", "_blank");
  };

  const handleDecline = () => {
    setDeclinedHelp(true);
  };

  if (isLoading) {
    return (
      <div className="space-y-8 text-center py-12">
        <div className="relative mx-auto w-20 h-20">
          {/* Animated spinner */}
          <div className="absolute inset-0 rounded-full border-4 border-[color:var(--border-muted)]"></div>
          <div className="absolute inset-0 rounded-full border-4 border-[color:var(--brand)] border-t-transparent animate-spin"></div>
        </div>

        <div className="space-y-2">
          <h1 className="font-serif text-2xl font-semibold text-[color:var(--brand)] sm:text-3xl">
            Finding the right help for your situation...
          </h1>
          <p className="text-[color:var(--muted-ink)]">
            We&apos;re matching you with a trusted specialist.
          </p>
        </div>

        {/* Progress dots */}
        <div className="flex justify-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[color:var(--brand)] animate-pulse"></div>
          <div className="w-2 h-2 rounded-full bg-[color:var(--brand)] animate-pulse delay-100"></div>
          <div className="w-2 h-2 rounded-full bg-[color:var(--brand)] animate-pulse delay-200"></div>
        </div>
      </div>
    );
  }

  if (declinedHelp) {
    return (
      <div className="space-y-8 text-center">
        <div className="space-y-2">
          <h1 className="font-serif text-2xl font-semibold text-[color:var(--brand)] sm:text-3xl">
            No problem
          </h1>
          <p className="text-[color:var(--muted-ink)]">
            If you change your mind, feel free to reach us at{" "}
            <a href="mailto:hello@probatedesk.com" className="text-[color:var(--brand)] underline">
              hello@probatedesk.com
            </a>
          </p>
          <p className="text-[color:var(--muted-ink)] mt-4">
            We wish you the best with your estate matter.
          </p>
        </div>

        <Button onClick={() => router.push("/")} className="w-full">
          Return to Homepage
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="space-y-2 text-center">
        <h1 className="font-serif text-2xl font-semibold text-[color:var(--brand)] sm:text-3xl">
          Your situation needs specialized expertise
        </h1>
        <p className="text-[color:var(--muted-ink)]">
          Our services are tailor-made for undisputed wills. We work with local
          law firms at preferred discounted prices to help ensure you get
          professional legal advice.
        </p>
        <p className="text-[color:var(--muted-ink)]">
          Based on your answers, we recommend working with an experienced estates
          lawyer who can provide personalized guidance for your situation.
        </p>
      </div>

      <div className="text-center">
        <p className="font-medium text-[color:var(--brand)]">
          Would you like us to connect you with a trusted firm?
        </p>
      </div>

      {/* Open Door Law Card */}
      <div className="rounded-2xl border-2 border-green-200 bg-green-50 p-6 space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle className="w-5 h-5 text-green-600" />
          </div>
          <span className="text-sm font-medium text-green-700">Match found</span>
        </div>

        <h3 className="text-xl font-semibold text-[color:var(--brand)]">
          Open Door Law Corporation
        </h3>

        <ul className="space-y-2 text-sm text-[color:var(--muted-ink)]">
          <li className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
            Vancouver-based law firm
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
            Highly experienced with wills &amp; estates
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
            Handles contested and complex wills
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
            Free consultations offered
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
            Discounted pricing for ProbateDesk clients
          </li>
        </ul>

        <Button onClick={handleConnect} className="w-full h-12 bg-green-600 hover:bg-green-700">
          Visit Open Door Law
          <ExternalLink className="ml-2 h-4 w-4" />
        </Button>
      </div>

      <Button variant="ghost" onClick={handleDecline} className="w-full">
        No thanks, I&apos;ll find my own
      </Button>

      <div className="text-center text-xs text-[color:var(--muted-ink)] space-y-1">
        <p className="flex items-center justify-center gap-1">
          <Phone className="w-3 h-3" />
          Questions? Call us at{" "}
          <a href="tel:+16046703534" className="underline hover:text-[color:var(--brand)]">
            (604) 670-3534
          </a>
        </p>
        <p className="flex items-center justify-center gap-1">
          <Mail className="w-3 h-3" />
          Or email{" "}
          <a href="mailto:hello@probatedesk.com" className="underline hover:text-[color:var(--brand)]">
            hello@probatedesk.com
          </a>
        </p>
      </div>
    </div>
  );
}
