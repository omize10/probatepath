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
    <div className="space-y-16 pb-20 sm:space-y-20 sm:pb-24">
    <ScrollFade
      as="section"
      id="hero"
      className="relative isolate left-1/2 flex min-h-screen w-screen -translate-x-1/2 items-center overflow-hidden text-white -mt-12 sm:-mt-16"
    >
      <Image
        src="/images/Main_Image_Header.png"
        alt="Executor preparing probate documents"
        fill
        priority
        sizes="100vw"
        className="absolute inset-0 -z-20 h-full w-full object-cover object-right lg:object-right"
      />
      <div className="relative z-10 w-full px-6 py-16 sm:px-12 lg:px-[12%] lg:py-28">
        <div className="max-w-[680px] space-y-10 text-center text-white lg:-translate-y-2 lg:text-left">
          <div className="space-y-6">
            <h1 className="font-serif text-4xl leading-tight !text-white drop-shadow-[0_14px_36px_rgba(0,0,0,0.85)] sm:text-5xl lg:text-6xl xl:text-[4.5rem]">
              Your estate, organised step by step.
            </h1>
            <p className="text-lg !text-white drop-shadow-[0_10px_24px_rgba(0,0,0,0.65)]">
              ProbatePath prepares filing-ready Supreme Court forms, notices, and guidance for BC executors with a fixed 2,500 CAD fee.
              Every detail stays encrypted and hosted in Canada.
            </p>
          </div>
          <div className="flex w-full flex-col gap-3 sm:flex-row sm:justify-center lg:justify-start">
            <Button asChild size="lg" className="w-full !bg-white/15 text-white hover:!bg-white/25 sm:w-auto">
              <Link href="/create-account">Start intake</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="w-full !border-white/80 !bg-transparent text-white hover:!bg-white/10 sm:w-auto"
            >
              <Link href="/how-it-works">How it works</Link>
            </Button>
          </div>
          <div className="flex flex-col gap-6 text-center text-sm text-white md:flex-row md:items-start md:gap-12 md:text-left">
            <div className="space-y-1 text-white">
              <p className="text-2xl font-semibold !text-white drop-shadow-[0_6px_16px_rgba(0,0,0,0.65)]">2,500 CAD</p>
              <p className="!text-white drop-shadow-[0_6px_16px_rgba(0,0,0,0.65)]">Fixed preparation fee</p>
            </div>
            <div className="space-y-1 text-white">
              <p className="text-2xl font-semibold !text-white drop-shadow-[0_6px_16px_rgba(0,0,0,0.65)]">&lt;24 hours</p>
              <p className="!text-white drop-shadow-[0_6px_16px_rgba(0,0,0,0.65)]">Target delivery after intake</p>
            </div>
          </div>
        </div>
      </div>
    </ScrollFade>

      <ScrollFade
        as="section"
        className="grid gap-4 rounded-3xl border border-[color:var(--border-muted)] bg-[color:var(--bg-surface)] p-6 shadow-[0_40px_120px_-80px_rgba(14,26,42,0.2)] md:grid-cols-4"
      >
        {trustPoints.map((point, index) => (
          <ScrollFade
            key={point.label}
            delay={index * 0.1}
            className="flex items-start gap-3 text-sm text-[color:var(--brand)]"
          >
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[#f0f3f7] text-[color:var(--brand)]">
              <point.icon className="h-5 w-5" aria-hidden />
            </span>
            <span className="font-medium">{point.label}</span>
          </ScrollFade>
        ))}
      </ScrollFade>

      <ScrollFade as="section" className="space-y-12">
        <div className="space-y-4 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[color:var(--slate)]">Why ProbatePath</p>
          <h2 className="font-serif text-3xl text-[color:var(--brand)] sm:text-4xl">Premium support for straightforward BC estates</h2>
          <p className="mx-auto max-w-3xl text-base text-[color:var(--muted-ink)]">
            We blend technology with probate specialists so executors can move from intake to filing without second-guessing forms,
            signatures, or timelines.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {whyCards.map((card, index) => (
            <ScrollFade key={card.title} delay={index * 0.1} className="h-full">
              <Card className="h-full border-[color:var(--border-muted)] shadow-[0_25px_60px_-50px_rgba(15,23,42,0.18)] transition hover:-translate-y-0.5">
                <CardHeader className="space-y-5">
                  <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f0f3f7] text-[color:var(--brand)]">
                    <card.icon className="h-5 w-5" aria-hidden />
                  </span>
                  <CardTitle className="text-xl text-[color:var(--brand)]">{card.title}</CardTitle>
                  <CardDescription className="text-sm text-[color:var(--muted-ink)]">{card.description}</CardDescription>
                </CardHeader>
              </Card>
            </ScrollFade>
          ))}
        </div>
      </ScrollFade>

      <ScrollFade as="section" className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <div className="space-y-6">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[color:var(--slate)]">Day one experience</p>
          <h2 className="font-serif text-3xl text-[color:var(--brand)] sm:text-4xl">Exactly what happens when you start</h2>
          <p className="text-base text-[color:var(--muted-ink)]">
            From the first click, we set expectations, highlight signatures, and provide the same checklists we use internally so you
            always know what comes next.
          </p>
          <ul className="space-y-4">
            {dayOneSteps.map((step, index) => (
              <ScrollFade
                as="li"
                key={step}
                delay={index * 0.1}
                className="flex items-start gap-3 rounded-2xl border border-[color:var(--border-muted)] bg-[color:var(--bg-surface)] p-4 text-sm text-[color:var(--brand)]"
              >
                <span className="mt-1 h-2 w-2 rounded-full bg-[color:var(--accent)]" />
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

      <ScrollFade
        as="section"
        className="rounded-[32px] border border-[color:var(--border-muted)] bg-[color:var(--bg-surface)] p-10 shadow-[0_40px_90px_-70px_rgba(15,26,42,0.18)]"
      >
        <div className="space-y-6">
          <div className="space-y-3">
            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-[color:var(--brand)]">Scope confirmation</p>
            <h2 className="font-serif text-3xl text-[color:var(--brand)] sm:text-4xl">
              Let’s confirm your estate fits the fixed-fee scope
            </h2>
            <p className="text-sm text-[#333333]">
              Share a few details and we’ll confirm timing, fit, and next steps before you commit court fees. Everything stays private
              and encrypted in Canada.
            </p>
          </div>
          <ul className="grid gap-3 text-sm md:grid-cols-2">
            {scopeHighlights.map((item, index) => (
              <ScrollFade key={item} as="li" delay={index * 0.1} className="flex items-start gap-3 text-[color:var(--brand)]">
                <span className="mt-1 inline-flex h-7 w-7 flex-none items-center justify-center rounded-full bg-[#f0f3f7] text-[color:var(--brand)]">
                  <CheckCircle2 className="h-4 w-4" aria-hidden />
                </span>
                <span>{item}</span>
              </ScrollFade>
            ))}
          </ul>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/create-account">Start intake</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="tel:+16046893667">Call 604-689-3667 (Open Door Law)</Link>
            </Button>
          </div>
        </div>
      </ScrollFade>

      <ScrollFade as="section" className="space-y-6">
        <div className="space-y-3 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[color:var(--slate)]">Questions</p>
          <h2 className="font-serif text-3xl text-[color:var(--brand)]">Answers executors ask before starting</h2>
          <p className="mx-auto max-w-3xl text-base text-[color:var(--muted-ink)]">
            Visit the full FAQs for detailed policies, timelines, and document lists tailored to BC registries.
          </p>
        </div>
        <FAQAccordion items={miniFaq} />
        <div className="text-center">
          <Link
            href="/faqs"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[color:var(--brand)] hover:text-[color:var(--accent-dark)]"
          >
            View all FAQs
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </ScrollFade>
    </div>
  );
}
