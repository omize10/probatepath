"use client";

import Link from "next/link";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PortalShell } from "@/components/portal/PortalShell";
import { setChecklistItem, usePortalStore } from "@/lib/portal/store";
import { useToast } from "@/components/ui/toast";
import { useEffect, useState } from "react";

const steps = [
  {
    id: "print",
    title: "Print your package",
    description: "Use the Phase 1 package from the Documents tab. Print all pages double-sided if possible.",
    bullets: ["Stack the forms in the order shown when you preview the package.", "Keep copies for yourself before signing."],
  },
  {
    id: "fill",
    title: "Fill in anything we can’t",
    description: "Likely just checkboxes, initials, or credit card info for official fees.",
    bullets: ["Go through each form and add any missing dates or boxes we can’t auto-fill.", "Use black ink and write legibly."],
  },
  {
    id: "sign",
    title: "Sign and date where indicated",
    description: "Executors need to sign the signatures section on the Green form front and back.",
    bullets: ["Sign in the presence of a commissioner of oaths or notary as required.", "Initial every page if the forms ask for it."],
  },
  {
    id: "pay",
    title: "Pay fees & submit",
    description: "Service BC drop-off is fastest. Courier if you can’t wait.",
    bullets: ["Include the fee receipt page in the package before you drop it with Service BC.", "If you courier, use the address confirmed in the mailing section."],
  },
  {
    id: "next",
    title: "What happens next",
    description: "Service BC reviews your packet and gives a filing date.",
    bullets: ["Expect a call or email if something needs more info.", "We’ll keep the portal updated when a registry note arrives."],
  },
];

export default function HowToAssemblePage() {
  const { toast } = useToast();
  const completed = usePortalStore((state) => state.checklist.assemble?.completed ?? false);
  const [confetti, setConfetti] = useState(false);
  const [confettiDots, setConfettiDots] = useState<Array<{ top: number; left: number }>>([]);

  const handleMarkComplete = () => {
    setChecklistItem("assemble", { completed: true });
    toast({ title: "Marked assemble complete", intent: "success" });
    setConfetti(true);
    setConfettiDots(
      Array.from({ length: 12 }, () => ({
        top: Math.random() * 100,
        left: Math.random() * 100,
      })),
    );
    setTimeout(() => {
      setConfetti(false);
      setConfettiDots([]);
    }, 3200);
  };

  useEffect(() => {
    return () => setConfetti(false);
  }, []);

  return (
    <PortalShell
      title="How to assemble Phase 1"
      description="A simple, no-jargon checklist for printing, signing, paying, and submitting your probate packet."
    >
      <div className="space-y-8">
        <div className="relative aspect-video w-full overflow-hidden rounded-[32px] border border-[color:var(--border-muted)] bg-black">
          <iframe
            title="How to assemble packet"
            src="https://www.youtube.com/embed/dQw4w9WgXcQ"
            className="h-full w-full"
            allow="autoplay; fullscreen"
            loading="lazy"
          ></iframe>
        </div>

        <div className="space-y-4">
          {steps.map((step, index) => (
            <div key={step.id} className="portal-card space-y-3 p-6">
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-[0.3em] text-[color:var(--ink-muted)]">
                  Step {index + 1}
                </p>
                <Sparkles className="h-5 w-5 text-[color:var(--brand)]" aria-hidden="true" />
              </div>
              <h3 className="text-2xl font-serif text-[color:var(--ink)]">{step.title}</h3>
              <p className="text-sm text-[color:var(--ink-muted)]">{step.description}</p>
              <ul className="grid gap-2 text-sm text-[color:var(--ink-muted)]">
                {step.bullets.map((bullet) => (
                  <li key={bullet} className="flex items-start gap-2">
                    <span className="mt-1 block h-1.5 w-1.5 rounded-full bg-[color:var(--brand)]" aria-hidden="true" />
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="portal-card relative overflow-hidden space-y-4 rounded-[40px] border border-white/20 bg-gradient-to-r from-[#ff7a18] to-[#ffb347] p-6 text-white/90 shadow-[0_35px_80px_-50px_rgba(15,23,42,0.65)]">
          {confetti ? (
            <div className="pointer-events-none absolute inset-0">
              {confettiDots.map((dot, index) => (
                <span
                  key={index}
                  className="absolute h-2 w-2 rounded-full bg-white/70"
                  style={{
                    top: `${dot.top}%`,
                    left: `${dot.left}%`,
                    opacity: 0.7,
                  }}
                />
              ))}
            </div>
          ) : null}
          <div className="relative space-y-2">
            <p className="text-xs uppercase tracking-[0.3em] text-white/80">Finalise assemble step</p>
            <p className="text-3xl font-serif text-white">Ready to mark this as done?</p>
            <p className="text-sm text-white/90">Marking this updates your checklist and keeps the registry on notice.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button type="button" onClick={handleMarkComplete} disabled={completed}>
              {completed ? "Already marked" : "Mark assemble complete"}
            </Button>
            <Button asChild variant="secondary">
              <Link href="/portal/documents">Open documents</Link>
            </Button>
          </div>
        </div>
      </div>
    </PortalShell>
  );
}
