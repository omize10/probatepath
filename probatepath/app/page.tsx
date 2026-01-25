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
import { TestimonialsSection } from "@/components/marketing/TestimonialsSection";
import { ScrollFade } from "@/components/scroll-fade";
import { FAQAccordion } from "@/components/faq-accordion";

export const metadata: Metadata = {
  title: "BC probate documents in days",
  description:
    "ProbateDesk prepares filing-ready probate documents for British Columbia executors starting at $799 CAD, with flexible service tiers, Canadian data hosting, and specialist support.",
};

const trustPoints = [
  { icon: ShieldCheck, label: "Built for BC probate" },
  { icon: CheckCircle2, label: "Starting at $799" },
  { icon: Timer, label: "Save thousands in legal and notary fees" },
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
  "Transparent pricing from $799 to $2,499 depending on service level",
];

const miniFaq = [
  {
    question: "Who is ProbateDesk for?",
    answer: "Executors handling straightforward BC estates with a valid will, Canadian assets, and no ongoing disputes.",
  },
  {
    question: "How quickly will documents arrive?",
    answer: "Our target is 3 days after intake completion. Complex estates may take longer — we prioritize accuracy over speed.",
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
          <div className="relative">
            <div className="max-w-[680px] text-center text-white lg:-translate-y-2 lg:text-left">
              <div className="space-y-6">
                <h1 className="font-serif text-5xl leading-tight !text-white drop-shadow-[0_14px_36px_rgba(0,0,0,0.85)] sm:text-6xl lg:text-7xl xl:text-[5rem]">
                  Probate, without the lawyers bill.
                </h1>
                <p className="text-xl !text-white drop-shadow-[0_10px_24px_rgba(0,0,0,0.65)]">
                  BC probate and administration forms without legal invloment.
                </p>
              </div>
              <div className="mt-10 flex w-full flex-col gap-3 sm:flex-row sm:justify-center lg:justify-start">
                <Button asChild size="lg" className="w-full !bg-white/15 text-white hover:!bg-white/25 sm:w-auto">
                  <Link href="/onboard/name">
                    Get Started
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
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
              <div className="mt-8 flex flex-col gap-6 text-center text-sm text-white md:mt-10 md:flex-row md:items-start md:gap-12 md:text-left">
                <div className="space-y-1 text-white">
                  <p className="text-2xl font-semibold !text-white drop-shadow-[0_6px_16px_rgba(0,0,0,0.65)]">Starting at $799</p>
                  <p className="!text-white drop-shadow-[0_6px_16px_rgba(0,0,0,0.65)]">Flexible service tiers</p>
                </div>
                <div className="space-y-1 text-white">
                  <p className="text-2xl font-semibold !text-white drop-shadow-[0_6px_16px_rgba(0,0,0,0.65)]">Court Ready in 3 Days<Link href="/turnaround" className="text-sm align-super hover:underline">*</Link></p>
                  <p className="!text-white drop-shadow-[0_6px_16px_rgba(0,0,0,0.65)]">After intake completion</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ScrollFade>

      <ScrollFade
        as="section"
        className="grid gap-4 rounded-3xl border border-[color:var(--border-muted)] bg-[color:var(--bg-surface)] p-6 shadow-[0_40px_120px_-80px_rgba(14,26,42,0.2)] md:grid-cols-3 md:justify-items-center"
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

      {/* Simple Get Started Section */}
      <ScrollFade as="section" className="space-y-8">
        <div className="space-y-4 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[color:var(--slate)]">Get Started</p>
          <h2 className="font-serif text-3xl text-[color:var(--brand)] sm:text-4xl">Simple 5-minute setup</h2>
          <p className="mx-auto max-w-2xl text-base text-[color:var(--muted-ink)]">
            Tell us about your situation and we'll match you with the right service level. Takes about 5 minutes.
          </p>
        </div>
        <div className="mx-auto max-w-xl">
          <Card className="border-[color:var(--border-muted)] shadow-[0_25px_60px_-50px_rgba(15,23,42,0.18)]">
            <CardHeader className="space-y-6 p-8">
              <div className="flex items-center gap-4">
                <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-[#e8f4ff] text-[#2563eb]">
                  <Sparkles className="h-6 w-6" aria-hidden />
                </span>
                <div>
                  <CardTitle className="text-xl text-[color:var(--brand)]">Start Your Journey</CardTitle>
                  <CardDescription className="text-sm text-[color:var(--muted-ink)]">
                    We'll guide you through a few quick questions
                  </CardDescription>
                </div>
              </div>
              <ul className="space-y-3 text-sm text-[color:var(--muted-ink)]">
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <span>Quick screening to check if we're a fit</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <span>Personalized tier recommendation</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <span>No commitment required</span>
                </li>
              </ul>
              <Button asChild size="lg" className="w-full">
                <Link href="/onboard/name">
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardHeader>
          </Card>
        </div>
      </ScrollFade>

      <ScrollFade as="section" className="space-y-12">
        <div className="space-y-4 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[color:var(--slate)]">Why ProbateDesk</p>
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
            src="/images/7f15c393-fdc7-487d-b07e-4f6c8e7f0f39.png"
            alt="Executor reviewing timeline and checklist"
            width={720}
            height={540}
            className="h-full w-full object-cover"
            priority
          />
        </div>
      </ScrollFade>

      <ScrollFade>
        <TestimonialsSection />
      </ScrollFade>

      <ScrollFade
        as="section"
        className="rounded-[32px] border border-[color:var(--border-muted)] bg-[color:var(--bg-surface)] p-10 shadow-[0_40px_90px_-70px_rgba(15,26,42,0.18)]"
      >
        <div className="space-y-6">
          <div className="space-y-3">
            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-[color:var(--brand)]">Scope confirmation</p>
            <h2 className="font-serif text-3xl text-[color:var(--brand)] sm:text-4xl">
              Let's confirm your estate fits our service
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
              <Link href="/onboard/name">
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="tel:+16046703534">Call +1 (604) 670-3534</Link>
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
