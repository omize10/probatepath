import type { Metadata } from "next";
import Link from "next/link";
import { CTAPanel } from "@/components/cta-panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const included = [
  "Intake review for completeness",
  "Document assembly (P1, P3/P4, P9, P10/P11, notices)",
  "Cover letter and filing checklist",
  "Secure delivery and vault for 12 months",
];

const notIncluded = [
  "Supreme Court filing fees",
  "Postage/courier for notices",
  "Notarisation/commissioning",
  "Complex-estate extras (multiple executors, disputes)",
];

export const metadata: Metadata = {
  title: "Pricing",
  description: "ProbatePath charges a single 2,500 CAD fixed fee for BC probate document preparation.",
};

export default function PricingPage() {
  return (
    <div className="space-y-16 pb-16">
      <header className="space-y-4">
        <Badge variant="outline">
          Pricing
        </Badge>
        <h1 className="font-serif text-4xl text-[color:var(--brand)] sm:text-5xl">Transparent, fixed-fee probate support</h1>
        <p className="max-w-3xl text-base text-[color:var(--muted-ink)]">
          ProbatePath charges 2,500 CAD plus GST/PST. You stay in control of filing while we prepare every form and instruction. Court fees and out-of-pocket costs are paid directly to the registry.
        </p>
      </header>

      <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-3xl border-2 border-[color:var(--brand)] bg-[color:var(--bg-surface)] p-8 shadow-[0_35px_90px_-70px_rgba(15,26,42,0.35)]">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[color:var(--brand)]">Fixed fee</p>
          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:gap-6">
            <h2 className="font-serif text-5xl text-[color:var(--brand)]">$2,500 CAD</h2>
            <p className="text-sm text-[color:var(--muted-ink)]">GST/PST plus court filing fee (paid separately)</p>
          </div>
          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-[color:var(--brand)]">Included</h3>
              <ul className="mt-3 space-y-3 text-sm text-[color:var(--muted-ink)]">
                {included.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="mt-1 h-2 w-2 rounded-full bg-[color:var(--accent)]" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-[color:var(--brand)]">Not included</h3>
              <ul className="mt-3 space-y-3 text-sm text-[color:var(--muted-ink)]">
                {notIncluded.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="mt-1 h-2 w-2 rounded-full bg-[color:var(--border-muted)]" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="mt-8 text-sm text-[color:var(--muted-ink)]">
            <p>Payment schedule: 50% at intake review, 50% when documents are delivered.</p>
          </div>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg" className="flex-1">
              <Link href="/create-account">Start intake</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="flex-1">
              <Link href="/contact">Ask a question</Link>
            </Button>
          </div>
        </div>

        <div className="space-y-6">
          <CTAPanel
            eyebrow="Not sure if you qualify?"
            title="Let’s confirm your estate fits the fixed-fee scope."
            description="Call 604-689-3667 (Open Door Law) and we’ll walk through the estate, timeline, and next steps before you pay anything."
            primaryAction={{ label: "Start intake", href: "/create-account" }}
            secondaryAction={{
              label: "Call 604-689-3667",
              href: "tel:+16046893667",
              variant: "outline",
            }}
          />
          <div className="rounded-3xl border border-[color:var(--border-muted)] bg-[color:var(--bg-surface)] p-6 text-sm text-[color:var(--muted-ink)] shadow-[0_30px_80px_-70px_rgba(15,26,42,0.2)]">
            <p className="font-semibold text-[color:var(--brand)]">Need notarisation or commissioning?</p>
            <p className="mt-2">
              We can coordinate flat-fee notarisation appointments (typically ~10 minutes / ~$100) through our partner network. Just mention it during intake.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
