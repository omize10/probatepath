'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

type Stage = "landing" | "matching" | "match";

export function NotAFitFlow() {
  const router = useRouter();
  const [stage, setStage] = useState<Stage>("landing");
  const [progress, setProgress] = useState(10);

  useEffect(() => {
    if (stage !== "matching") return;
    setProgress(10);
    const timer = setTimeout(() => setStage("match"), 6500);
    const interval = setInterval(() => {
      setProgress((prev) => (prev >= 90 ? prev : prev + 8));
    }, 450);
    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [stage]);

  if (stage === "landing") {
    return (
      <div className="space-y-6 rounded-3xl border border-[color:var(--border-muted)] bg-white p-8 shadow-[0_35px_110px_-90px_rgba(15,23,42,0.5)]">
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[color:var(--ink-muted)]">Next step</p>
          <h1 className="font-serif text-4xl text-[color:var(--brand)]">We’re probably not the right fit for this estate</h1>
          <div className="space-y-3 text-base text-[color:var(--ink-muted)]">
            <p>Based on your answers, this estate looks like it needs full legal representation from a law firm.</p>
            <p>We don’t want you to be under-supported, so we can match you with a firm that handles the entire probate file for you.</p>
          </div>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button variant="secondary" className="flex-1" onClick={() => router.push("/start?retry=1")}>
            Go back and change my answers
          </Button>
          <Button className="flex-1" size="lg" onClick={() => setStage("matching")}>
            Match me with the best law firm for my estate
          </Button>
        </div>
      </div>
    );
  }

  if (stage === "matching") {
    return (
      <div className="space-y-6 rounded-3xl border border-[color:var(--border-muted)] bg-white p-8 shadow-[0_35px_110px_-90px_rgba(15,23,42,0.5)]" aria-live="polite">
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[color:var(--ink-muted)]">Matching</p>
          <h1 className="font-serif text-4xl text-[color:var(--brand)]">Finding the best law firm for you…</h1>
          <p className="text-base text-[color:var(--ink-muted)]">
            We’re matching you with a trusted partner based on the details of this estate.
          </p>
        </div>
        <div className="space-y-3">
          <div className="h-3 w-full rounded-full bg-[color:var(--bg-muted)]">
            <div className="h-3 rounded-full bg-[color:var(--brand)] transition-all" style={{ width: `${progress}%` }} />
          </div>
          <p className="text-sm text-[color:var(--ink-muted)]">Checking availability and experience…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 rounded-3xl border border-[color:var(--border-muted)] bg-white p-8 shadow-[0_35px_110px_-90px_rgba(15,23,42,0.5)]">
      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[color:var(--ink-muted)]">Referral confirmed</p>
        <h1 className="font-serif text-4xl text-[color:var(--brand)]">You’ve been matched with Open Door Law Corporation</h1>
        <div className="space-y-3 text-base text-[color:var(--ink-muted)]">
          <p>Based on your answers, Open Door Law Corporation appears to be the best fit for this estate.</p>
          <p>They can provide full legal representation for your probate matter from start to finish.</p>
        </div>
      </div>
      <div className="space-y-4 rounded-2xl border border-[color:var(--border-muted)] bg-[color:var(--bg-surface)] p-5">
        <div>
          <p className="text-sm font-semibold text-[color:var(--ink)]">Name</p>
          <p className="text-base text-[color:var(--ink-muted)]">Open Door Law Corporation</p>
        </div>
        <div>
          <p className="text-sm font-semibold text-[color:var(--ink)]">Address</p>
          <p className="text-base text-[color:var(--ink-muted)]">1030 Denman Street, Vancouver, British Columbia · Visit in person or call ahead to plan your drop-in.</p>
        </div>
        <div>
          <p className="text-sm font-semibold text-[color:var(--ink)]">Website</p>
          <a
            href="https://opendoorlaw.com"
            target="_blank"
            rel="noreferrer"
            className="text-base font-semibold text-[color:var(--brand)] underline-offset-4 hover:underline"
          >
            Visit their website
          </a>
        </div>
      </div>
      <div className="flex flex-wrap gap-4">
        <Button asChild>
          <Link href="https://opendoorlaw.com" target="_blank" rel="noreferrer">
            Visit their website
          </Link>
        </Button>
        <Button variant="secondary" asChild>
          <Link href="/contact?topic=open-door-referral">
            Request a callback
          </Link>
        </Button>
      </div>
      <p className="text-sm text-[color:var(--ink-muted)]">
        Prefer to come back later? <Link href="/" className="font-semibold text-[color:var(--brand)] underline-offset-4 hover:underline">Back to ProbateDesk home</Link>.
      </p>
    </div>
  );
}
