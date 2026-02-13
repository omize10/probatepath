import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollFade } from "@/components/scroll-fade";

export const metadata: Metadata = {
  title: "Get Started — BC Probate Help from $799",
  description:
    "ProbateDesk prepares your BC probate filing package for a fixed fee. No lawyers, no surprise bills. Check if you qualify in 2 minutes.",
};

export default function GetStartedPage() {
  return (
    <div className="space-y-0">
      {/* Hero Section - Full-bleed dark background */}
      <ScrollFade
        as="section"
        className="relative left-1/2 w-screen -translate-x-1/2 overflow-hidden bg-[#080f1c] -mt-12 sm:-mt-16 min-h-[70vh] flex items-center justify-center py-24 sm:py-32 lg:py-40"
      >
        <div className="relative z-10 mx-auto max-w-[680px] px-6 text-center">
          <h1 className="font-serif text-5xl leading-tight text-white sm:text-6xl lg:text-7xl">
            Probate, without the lawyer&apos;s bill.
          </h1>
          <p className="mt-6 text-xl text-white/90">
            Answer a few questions. We handle the paperwork.
          </p>

          <div className="mt-10 flex justify-center">
            <Link href="/create-account?ref=landing" className="cta-clean-button">
              Get Started
              <ArrowRight className="ml-2 h-5 w-5" aria-hidden />
            </Link>
          </div>

          <p className="mt-8 text-sm text-white/60">
            From $799 · BC-specific · Fixed pricing · No legal jargon
          </p>
        </div>
      </ScrollFade>

      {/* We're Not a Law Firm Section - Full-bleed dark background */}
      <section className="relative left-1/2 w-screen -translate-x-1/2 overflow-hidden bg-[#080f1c] py-24 sm:py-32 lg:py-40">
        {/* Subtle gradient overlay for depth */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 80% 50% at 50% 50%, rgba(30, 40, 60, 0.3) 0%, transparent 60%)",
          }}
        />

        {/* Main content */}
        <div className="relative z-10 mx-auto max-w-4xl px-6 text-center">
          {/* Headline */}
          <ScrollFade>
            <h2 className="font-serif text-4xl leading-tight sm:text-5xl lg:text-6xl tracking-tight">
              <span className="text-white">We&apos;re not a law firm.</span>
              <br />
              <span className="text-gradient-animated">And that&apos;s the point.</span>
            </h2>
          </ScrollFade>

          {/* Supporting copy */}
          <ScrollFade delay={0.1}>
            <p className="mt-6 text-lg leading-relaxed text-white/70 max-w-2xl mx-auto sm:text-xl">
              No billable hours. No legal jargon. No $5,000 surprise invoices.
              <br className="hidden sm:block" />
              Just specialists who know BC probate inside and out, preparing your
              documents for a fixed, transparent price.
            </p>
          </ScrollFade>

          {/* CTA Button */}
          <ScrollFade delay={0.2}>
            <div className="mt-12">
              <Link href="/create-account?ref=landing" className="cta-clean-button">
                Get Started Now
                <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-200 group-hover:translate-x-1" />
              </Link>
            </div>
          </ScrollFade>

          {/* Trust indicator */}
          <ScrollFade delay={0.3}>
            <p className="mt-14 text-sm text-white/60">
              No payment required to check eligibility
            </p>
          </ScrollFade>
        </div>

        {/* Bottom gradient fade */}
        <div
          className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
          style={{
            background: "linear-gradient(to top, var(--bg-page) 0%, transparent 100%)",
          }}
        />
      </section>

      {/* How It Works Section - Light background */}
      <ScrollFade as="section" className="py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-6">
          {/* Eyebrow */}
          <p className="text-center text-sm font-semibold uppercase tracking-[0.3em] text-[color:var(--slate)]">
            How It Works
          </p>

          {/* Heading */}
          <h2 className="mt-3 text-center font-serif text-3xl text-[color:var(--brand)] sm:text-4xl">
            Three steps to your grant
          </h2>

          {/* Step Cards */}
          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
            {/* Step 1 */}
            <ScrollFade delay={0}>
              <div className="rounded-3xl border border-[color:var(--border-muted)] bg-white p-6 shadow-[0_40px_90px_-70px_rgba(15,23,42,0.25)] sm:p-8">
                <div className="flex flex-col items-center text-center">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#111827] text-2xl font-bold text-white">
                    1
                  </div>
                  <h3 className="mt-4 font-semibold text-xl text-[color:var(--brand)]">
                    Answer a few questions
                  </h3>
                  <p className="mt-2 text-sm text-[color:var(--muted-ink)]">
                    We check if your estate qualifies. Takes about 2 minutes.
                  </p>
                </div>
              </div>
            </ScrollFade>

            {/* Step 2 */}
            <ScrollFade delay={0.1}>
              <div className="rounded-3xl border border-[color:var(--border-muted)] bg-white p-6 shadow-[0_40px_90px_-70px_rgba(15,23,42,0.25)] sm:p-8">
                <div className="flex flex-col items-center text-center">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#111827] text-2xl font-bold text-white">
                    2
                  </div>
                  <h3 className="mt-4 font-semibold text-xl text-[color:var(--brand)]">
                    We prepare your forms
                  </h3>
                  <p className="mt-2 text-sm text-[color:var(--muted-ink)]">
                    Your full BC probate filing package, assembled and reviewed.
                  </p>
                </div>
              </div>
            </ScrollFade>

            {/* Step 3 */}
            <ScrollFade delay={0.2}>
              <div className="rounded-3xl border border-[color:var(--border-muted)] bg-white p-6 shadow-[0_40px_90px_-70px_rgba(15,23,42,0.25)] sm:p-8">
                <div className="flex flex-col items-center text-center">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#111827] text-2xl font-bold text-white">
                    3
                  </div>
                  <h3 className="mt-4 font-semibold text-xl text-[color:var(--brand)]">
                    You file with the court
                  </h3>
                  <p className="mt-2 text-sm text-[color:var(--muted-ink)]">
                    We walk you through signing, filing, and what comes after.
                  </p>
                </div>
              </div>
            </ScrollFade>
          </div>
        </div>
      </ScrollFade>

      {/* Objection Killers Section - FAQ Style */}
      <ScrollFade as="section" className="py-16 sm:py-20">
        <div className="mx-auto max-w-4xl space-y-6 px-6">
          {/* Q&A 1 */}
          <div className="rounded-2xl border border-[color:var(--border-muted)] bg-white p-6 sm:p-8">
            <h3 className="font-semibold text-lg text-[color:var(--brand)] mb-3">
              Is this a law firm?
            </h3>
            <p className="text-sm text-[color:var(--muted-ink)] leading-relaxed">
              No. ProbateDesk is a document preparation service for BC probate. We
              don&apos;t provide legal advice. For complex or contested estates,
              we&apos;ll tell you upfront and suggest you speak with a lawyer.
            </p>
          </div>

          {/* Q&A 2 */}
          <div className="rounded-2xl border border-[color:var(--border-muted)] bg-white p-6 sm:p-8">
            <h3 className="font-semibold text-lg text-[color:var(--brand)] mb-3">
              What if my estate doesn&apos;t qualify?
            </h3>
            <p className="text-sm text-[color:var(--muted-ink)] leading-relaxed">
              Our intake checks that in about 2 minutes. If it&apos;s not a fit,
              we&apos;ll explain why and point you in the right direction. No charge.
            </p>
          </div>

          {/* Q&A 3 */}
          <div className="rounded-2xl border border-[color:var(--border-muted)] bg-white p-6 sm:p-8">
            <h3 className="font-semibold text-lg text-[color:var(--brand)] mb-3">
              How long does this take?
            </h3>
            <p className="text-sm text-[color:var(--muted-ink)] leading-relaxed">
              Most clients finish intake in under 25 minutes. Your document package
              is typically ready within a few business days.
            </p>
          </div>
        </div>
      </ScrollFade>

      {/* Final CTA Section - Full-bleed dark background */}
      <ScrollFade
        as="section"
        className="relative left-1/2 w-screen -translate-x-1/2 overflow-hidden bg-[#080f1c] py-24 sm:py-32"
      >
        <div className="relative z-10 mx-auto max-w-4xl px-6 text-center">
          <h2 className="font-serif text-3xl text-white sm:text-4xl">
            Find out in 2 minutes if ProbateDesk can help.
          </h2>

          <div className="mt-10 flex justify-center">
            <Link href="/create-account?ref=landing" className="cta-clean-button">
              Check If You Qualify
              <ArrowRight className="ml-2 h-5 w-5" aria-hidden />
            </Link>
          </div>

          <p className="mt-8 text-sm text-white/60">
            No payment required to check eligibility.
          </p>
        </div>
      </ScrollFade>

      {/* Footer Disclaimer Line */}
      <div className="py-12 text-center">
        <p className="text-xs text-[color:var(--text-tertiary)] max-w-3xl mx-auto px-6">
          ProbateDesk is a document preparation service operated under Court Line
          Law. We are not a law firm and do not provide legal advice.
        </p>
      </div>
    </div>
  );
}
