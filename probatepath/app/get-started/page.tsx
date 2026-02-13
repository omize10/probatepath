import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ScrollFade } from "@/components/scroll-fade";

export const metadata: Metadata = {
  title: "Get Started — BC Probate Help from $799",
  description:
    "ProbateDesk prepares your BC probate filing package for a fixed fee. No lawyers, no surprise bills. Check if you qualify in 2 minutes.",
};

export default function GetStartedPage() {
  return (
    <div className="space-y-0">
      {/* ── SECTION 1: Hero with background image ── */}
      <section className="relative isolate left-1/2 w-screen -translate-x-1/2 overflow-hidden -mt-12 sm:-mt-16">
        <Image
          src="/images/Main_Image_Header.png"
          alt="Executor preparing probate documents"
          fill
          priority
          sizes="100vw"
          className="absolute inset-0 -z-20 h-full w-full object-cover object-right lg:object-right"
        />
        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 -z-10 bg-black/50" />

        {/* Hero content */}
        <div className="relative z-10 mx-auto max-w-[680px] px-6 pt-32 pb-20 text-center sm:pt-36 sm:pb-24 lg:pt-44 lg:pb-28">
          <ScrollFade>
            <h1 className="font-serif text-5xl leading-tight !text-white drop-shadow-[0_14px_36px_rgba(0,0,0,0.85)] sm:text-6xl lg:text-7xl">
              Probate, without the lawyer&apos;s bill.
            </h1>
          </ScrollFade>

          <ScrollFade delay={0.1}>
            <p className="mt-5 text-xl !text-white drop-shadow-[0_10px_24px_rgba(0,0,0,0.65)]">
              Answer a few questions. We handle the paperwork.
            </p>
          </ScrollFade>

          <ScrollFade delay={0.15}>
            <div className="mt-8 flex justify-center">
              <Link href="/create-account?ref=landing" className="cta-clean-button">
                Get Started
                <ArrowRight className="ml-2 h-5 w-5" aria-hidden />
              </Link>
            </div>
          </ScrollFade>

          <ScrollFade delay={0.2}>
            <p className="mt-5 text-sm !text-white/60 drop-shadow-[0_6px_16px_rgba(0,0,0,0.65)]">
              From $799 · BC-specific · Fixed pricing · No legal jargon
            </p>
          </ScrollFade>

          {/* Price anchors matching homepage style */}
          <ScrollFade delay={0.25}>
            <div className="mt-8 flex flex-col gap-6 text-center text-sm md:flex-row md:justify-center md:gap-12">
              <div className="space-y-1">
                <p className="text-2xl font-semibold !text-white drop-shadow-[0_6px_16px_rgba(0,0,0,0.65)]">Starting at $799</p>
                <p className="!text-white/60 drop-shadow-[0_6px_16px_rgba(0,0,0,0.65)]">Flexible service tiers</p>
              </div>
              <div className="space-y-1">
                <p className="text-2xl font-semibold !text-white drop-shadow-[0_6px_16px_rgba(0,0,0,0.65)]">Court Ready in 3 Days</p>
                <p className="!text-white/60 drop-shadow-[0_6px_16px_rgba(0,0,0,0.65)]">After intake completion</p>
              </div>
            </div>
          </ScrollFade>
        </div>
      </section>

      {/* ── SECTION 2: How It Works (light background) ── */}
      <ScrollFade as="section" className="pt-12 pb-14 sm:pt-16 sm:pb-18">
        <div className="mx-auto max-w-5xl px-6">
          <p className="text-center text-sm font-semibold uppercase tracking-[0.3em] text-[color:var(--slate)]">
            How It Works
          </p>
          <h2 className="mt-3 text-center font-serif text-3xl text-[color:var(--brand)] sm:text-4xl">
            Three steps to your grant
          </h2>

          <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-3">
            {[
              {
                num: "1",
                title: "Answer a few questions",
                desc: "We check if your estate qualifies. Takes about 2 minutes.",
              },
              {
                num: "2",
                title: "We prepare your forms",
                desc: "Your full BC probate filing package, assembled and reviewed.",
              },
              {
                num: "3",
                title: "You file with the court",
                desc: "We walk you through signing, filing, and what comes after.",
              },
            ].map((step, i) => (
              <ScrollFade key={step.num} delay={i * 0.1}>
                <div className="h-full rounded-2xl border border-[color:var(--border-muted)] bg-white p-6 shadow-[0_25px_60px_-50px_rgba(15,23,42,0.18)] transition hover:-translate-y-1 hover:shadow-[0_30px_80px_-60px_rgba(15,23,42,0.25)]">
                  <div className="flex items-start gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#111827] text-lg font-bold text-white">
                      {step.num}
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg text-[color:var(--brand)] leading-snug">
                        {step.title}
                      </h3>
                      <p className="mt-1.5 text-sm text-[color:var(--muted-ink)] leading-relaxed">
                        {step.desc}
                      </p>
                    </div>
                  </div>
                </div>
              </ScrollFade>
            ))}
          </div>

          {/* CTA below steps */}
          <ScrollFade delay={0.3}>
            <div className="mt-10 flex justify-center">
              <Link href="/create-account?ref=landing" className="cta-clean-button !bg-[#111827] !text-white hover:!bg-[#1f2937]">
                Get Started
                <ArrowRight className="ml-2 h-5 w-5" aria-hidden />
              </Link>
            </div>
          </ScrollFade>
        </div>
      </ScrollFade>

      {/* ── SECTION 3: FAQ / Objection Killers (light background) ── */}
      <ScrollFade as="section" className="pb-14 sm:pb-18">
        <div className="mx-auto max-w-4xl space-y-4 px-6">
          {[
            {
              q: "Is this a law firm?",
              a: "No. ProbateDesk is a document preparation service for BC probate. We don\u2019t provide legal advice. For complex or contested estates, we\u2019ll tell you upfront and suggest you speak with a lawyer.",
            },
            {
              q: "What if my estate doesn\u2019t qualify?",
              a: "Our intake checks that in about 2 minutes. If it\u2019s not a fit, we\u2019ll explain why and point you in the right direction. No charge.",
            },
            {
              q: "How long does this take?",
              a: "Most clients finish intake in under 25 minutes. Your document package is typically ready within a few business days.",
            },
          ].map((item) => (
            <div
              key={item.q}
              className="rounded-2xl border border-[color:var(--border-muted)] bg-white p-6 shadow-[0_25px_60px_-50px_rgba(15,23,42,0.12)]"
            >
              <h3 className="text-lg font-semibold text-[color:var(--brand)]">
                {item.q}
              </h3>
              <p className="mt-2 text-sm text-[color:var(--muted-ink)] leading-relaxed">
                {item.a}
              </p>
            </div>
          ))}
        </div>
      </ScrollFade>

      {/* ── SECTION 4: "We're not a law firm" + Final CTA (dark, full-bleed) ── */}
      <ScrollFade
        as="section"
        className="relative left-1/2 w-screen -translate-x-1/2 overflow-hidden bg-[#080f1c] py-16 sm:py-24"
      >
        <div className="relative z-10 mx-auto max-w-3xl px-6 text-center">
          <h2 className="font-serif text-4xl leading-tight sm:text-5xl lg:text-6xl tracking-tight">
            <span className="text-white">We&apos;re not a law firm.</span>
            <br />
            <span className="text-gradient-animated">And that&apos;s the point.</span>
          </h2>

          <p className="mt-5 text-lg leading-relaxed text-white/70 max-w-2xl mx-auto sm:text-xl">
            No billable hours. No legal jargon. No $5,000 surprise invoices.
            <br className="hidden sm:block" />
            Just specialists who know BC probate inside and out, preparing your
            documents for a fixed, transparent price.
          </p>

          <p className="mt-10 font-serif text-2xl text-white/90 sm:text-3xl">
            Find out in 2 minutes if ProbateDesk can help.
          </p>

          <div className="mt-8 flex justify-center">
            <Link href="/create-account?ref=landing" className="cta-clean-button">
              Check If You Qualify
              <ArrowRight className="ml-2 h-5 w-5" aria-hidden />
            </Link>
          </div>

          <p className="mt-4 text-sm text-white/50">
            No payment required to check eligibility.
          </p>

          {/* Legal disclaimer */}
          <p className="mt-12 text-xs text-white/30 max-w-2xl mx-auto leading-relaxed">
            ProbateDesk is a document preparation service operated under Court Line
            Law. We are not a law firm and do not provide legal advice.
          </p>
        </div>
      </ScrollFade>
    </div>
  );
}
