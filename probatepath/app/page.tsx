import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  ClipboardCheck,
  FileText,
  ShieldCheck,
  Sparkles,
  Timer,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollFade } from "@/components/scroll-fade";
import { FAQAccordion } from "@/components/faq-accordion";

export const metadata: Metadata = {
  title: "BC probate documents in hours",
  description:
    "ProbatePath prepares filing-ready probate documents for British Columbia executors with a fixed 2,500 CAD fee, Canadian data hosting, and specialist support.",
};

const trustPoints = [
  { icon: ShieldCheck, label: "Built for BC probate" },
  { icon: CheckCircle2, label: "Clear fixed fee" },
  { icon: Sparkles, label: "Target delivery: <24 hrs (not guaranteed)" },
  { icon: FileText, label: "Hosted & encrypted in Canada" },
];

const whyCards = [
  {
    title: "Guided intake",
    description: "Modern, save-anytime intake that keeps executors organised and captures every required detail.",
    icon: Timer,
  },
  {
    title: "Specialist assembly",
    description: "BC probate specialists review for completeness before preparing forms, notices, and checklists.",
    icon: ClipboardCheck,
  },
  {
    title: "Court-ready documents",
    description: "Latest Supreme Court of BC forms plus a personalised cover letter and filing-ready package.",
    icon: FileText,
  },
  {
    title: "Secure delivery",
    description: "Documents and sensitive data remain encrypted and hosted in Canada. Nothing leaves without consent.",
    icon: ShieldCheck,
  },
];

const dayOneSteps = [
  "Finish guided intake in ~20 minutes (autosave on every field).",
  "Upload supporting documents or flag what’s pending.",
  "Receive a personalised checklist outlining signatures, notarisation, and registry expectations.",
  "Our team confirms timeline and scope before you pay court fees.",
];

const scopeHighlights = [
  "Single executor with a valid BC will",
  "Canadian assets + no active disputes",
  "We review for completeness before preparing the package",
  "Transparent 2,500 CAD fixed fee (plus GST/PST)",
];

const miniFaq = [
  {
    question: "Who is ProbatePath for?",
    answer: "Executors handling straightforward BC estates with a valid will, Canadian assets, and no ongoing disputes.",
  },
  {
    question: "How quickly will documents arrive?",
    answer: "Our target is under 24 hours after intake completion (not guaranteed depending on complexity).",
  },
  {
    question: "Is everything stored in Canada?",
    answer: "Yes. Intake data and documents are encrypted in transit and at rest on Canadian infrastructure.",
  },
];

export default function HomePage() {
  return (
    <div className="space-y-24 pb-24">
      <ScrollFade as="section" id="hero" className="full-bleed relative min-h-screen overflow-hidden -mt-24 sm:-mt-28">
        <Image
          src="/images/hero.jpg"
          alt="Executor reviewing a probate package on a laptop"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/65 via-black/45 to-[#0f172a]/50" />
        <div className="relative z-10 flex min-h-[90vh] flex-col justify-center px-6 py-16 text-white sm:px-12 lg:px-20">
          <p className="text-sm font-semibold uppercase tracking-[0.4em] text-white/70">British Columbia</p>
          <h1 className="mt-4 font-serif text-4xl leading-tight sm:text-5xl lg:text-6xl">BC probate documents in hours.</h1>
          <p className="mt-6 max-w-2xl text-lg text-white/85">
            Fixed 2,500 CAD. You file. We prepare. Start online in minutes and get a filing-ready package assembled by BC probate
            specialists with Canadian hosting and encryption.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg" className="bg-[#ff6a00] text-white hover:bg-[#e45f00]">
              <Link href="/start">Start now</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border border-white/40 bg-transparent text-white hover:bg-white/10"
            >
              <Link href="/how-it-works">How it works</Link>
            </Button>
          </div>
        </div>
      </ScrollFade>

      <ScrollFade
        as="section"
        className="grid gap-4 rounded-3xl border border-[#e2e8f0] bg-white p-6 shadow-[0_40px_120px_-80px_rgba(15,23,42,0.4)] md:grid-cols-4"
      >
        {trustPoints.map((point, index) => (
          <ScrollFade
            key={point.label}
            delay={index * 0.1}
            className="flex items-start gap-3 text-sm text-[#0f172a]"
          >
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-[#fef4ed] text-[#ff6a00]">
              <point.icon className="h-5 w-5" aria-hidden />
            </span>
            <span className="font-medium">{point.label}</span>
          </ScrollFade>
        ))}
      </ScrollFade>

      <ScrollFade as="section" className="space-y-12">
        <div className="space-y-4 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#1c2a44]">Why ProbatePath</p>
          <h2 className="font-serif text-3xl text-[#0f172a] sm:text-4xl">Premium support for straightforward BC estates</h2>
          <p className="mx-auto max-w-3xl text-base text-[#495067]">
            We blend technology with probate specialists so executors can move from intake to filing without second-guessing forms,
            signatures, or timelines.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {whyCards.map((card, index) => (
            <ScrollFade key={card.title} delay={index * 0.1} className="h-full">
              <Card className="h-full border-[#d7ddec] shadow-[0_25px_80px_-60px_rgba(15,23,42,0.45)] transition hover:-translate-y-0.5">
                <CardHeader className="space-y-5">
                  <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f7f8fa] text-[#1c2a44]">
                    <card.icon className="h-5 w-5" aria-hidden />
                  </span>
                  <CardTitle className="text-xl text-[#0f172a]">{card.title}</CardTitle>
                  <CardDescription className="text-sm text-[#495067]">{card.description}</CardDescription>
                </CardHeader>
              </Card>
            </ScrollFade>
          ))}
        </div>
      </ScrollFade>

      <ScrollFade as="section" className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <div className="space-y-6">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#1c2a44]">Day one experience</p>
          <h2 className="font-serif text-3xl text-[#0f172a] sm:text-4xl">Exactly what happens when you start</h2>
          <p className="text-base text-[#495067]">
            From the first click, we set expectations, highlight signatures, and provide the same checklists we use internally so you
            always know what comes next.
          </p>
          <ul className="space-y-4">
            {dayOneSteps.map((step, index) => (
              <ScrollFade
                as="li"
                key={step}
                delay={index * 0.1}
                className="flex items-start gap-3 rounded-2xl border border-[#e2e8f0] bg-white p-4 text-sm text-[#0f172a]"
              >
                <span className="mt-1 h-2 w-2 rounded-full bg-[#ff6a00]" />
                <span>{step}</span>
              </ScrollFade>
            ))}
          </ul>
        </div>
        <div className="relative h-full overflow-hidden rounded-3xl shadow-[0_40px_120px_-70px_rgba(15,23,42,0.5)]">
          <Image
            src="/images/support-1.jpg"
            alt="Executor reviewing timeline and checklist"
            width={720}
            height={540}
            className="h-full w-full object-cover"
          />
        </div>
      </ScrollFade>

      <ScrollFade as="section" className="rounded-[32px] border border-[#1c2a44]/20 bg-[#1c2a44] p-10 text-white shadow-[0_40px_120px_-80px_rgba(28,42,68,0.85)]">
        <div className="space-y-6">
          <div className="space-y-3">
            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-white/70">Scope confirmation</p>
            <h2 className="font-serif text-3xl sm:text-4xl">Let’s confirm your estate fits the fixed-fee scope</h2>
            <p className="text-sm text-white/80">
              Share a few details and we’ll confirm timing, fit, and next steps before you commit court fees. Everything stays private
              and encrypted in Canada.
            </p>
          </div>
          <ul className="grid gap-3 text-sm md:grid-cols-2">
            {scopeHighlights.map((item, index) => (
              <ScrollFade key={item} as="li" delay={index * 0.1} className="flex items-start gap-3">
                <span className="mt-1 inline-flex h-6 w-6 flex-none items-center justify-center rounded-full bg-white/10 text-[#ffddb8]">
                  <CheckCircle2 className="h-4 w-4" aria-hidden />
                </span>
                <span>{item}</span>
              </ScrollFade>
            ))}
          </ul>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg" className="bg-[#ff6a00] text-white hover:bg-[#e45f00]">
              <Link href="/start">Start intake</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="ghost"
              className="border border-white/50 text-white hover:bg-white/10"
            >
              <Link href="tel:+16046893667">Call 604-689-3667 (Open Door Law)</Link>
            </Button>
          </div>
        </div>
      </ScrollFade>

      <ScrollFade as="section" className="space-y-6">
        <div className="space-y-3 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#1c2a44]">Questions</p>
          <h2 className="font-serif text-3xl text-[#0f172a]">Answers executors ask before starting</h2>
          <p className="mx-auto max-w-3xl text-base text-[#495067]">
            Visit the full FAQs for detailed policies, timelines, and document lists tailored to BC registries.
          </p>
        </div>
        <FAQAccordion items={miniFaq} />
        <div className="text-center">
          <Link
            href="/faqs"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#0c3b6c] hover:text-[#ff6a00]"
          >
            View all FAQs
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </ScrollFade>
    </div>
  );
}
