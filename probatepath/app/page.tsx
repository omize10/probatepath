import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CheckCircle2, ShieldCheck, Timer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TestimonialsSection } from "@/components/marketing/TestimonialsSection";
import { NotLawFirmSection } from "@/components/marketing/NotLawFirmSection";
import { ReceiptComparison } from "@/components/marketing/ReceiptComparison";
import { CinematicTimeline } from "@/components/marketing/CinematicTimeline";
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
  { icon: Timer, label: "Save thousands in legal fees" },
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
  {
    question: "What about court probate fees?",
    answer: "Court fees are set by the BC government and paid directly to the court when you file. These are separate from our service fees and depend on the estate value.",
  },
];

export default function HomePage() {
  return (
    <div className="space-y-16 pb-20 sm:space-y-20 sm:pb-24">
      {/* Hero */}
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
                  Probate, without the lawyer&apos;s bill.
                </h1>
                <p className="text-xl !text-white drop-shadow-[0_10px_24px_rgba(0,0,0,0.65)]">
                  BC probate and administration forms prepared by specialists.
                </p>
              </div>
              <div className="mt-10 flex w-full flex-col gap-3 sm:flex-row sm:justify-center lg:justify-start">
                <Button asChild size="lg" className="w-full !bg-white/15 text-white hover:!bg-white/25 sm:w-auto">
                  <Link href="/onboard/executor">
                    Get started
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="w-full !border-white/80 !bg-transparent text-white hover:!bg-white/10 sm:w-auto"
                >
                  <Link href="#how-it-works">How it works</Link>
                </Button>
              </div>
              <div className="mt-8 flex flex-col gap-6 text-center text-sm text-white md:mt-10 md:flex-row md:items-start md:gap-12 md:text-left">
                <div className="space-y-1 text-white">
                  <p className="text-2xl font-semibold !text-white drop-shadow-[0_6px_16px_rgba(0,0,0,0.65)]">Starting at $799</p>
                  <p className="!text-white drop-shadow-[0_6px_16px_rgba(0,0,0,0.65)]">Flexible service tiers</p>
                </div>
                <div className="space-y-1 text-white">
                  <p className="text-2xl font-semibold !text-white drop-shadow-[0_6px_16px_rgba(0,0,0,0.65)]">Court Ready in 3 Days<Link href="/turnaround" className="hover:underline"><sup className="text-[8px] ml-0.5">*</sup></Link></p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ScrollFade>

      {/* Trust Points Bar */}
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

      {/* Receipt Comparison */}
      <section>
        <ReceiptComparison />
      </section>

      {/* How It Works - Timeline */}
      <section id="how-it-works" className="relative left-1/2 w-screen -translate-x-1/2">
        <CinematicTimeline />
      </section>

      {/* Testimonials */}
      <ScrollFade>
        <TestimonialsSection />
      </ScrollFade>

      {/* Not a Law Firm - Feature CTA */}
      <NotLawFirmSection />

      {/* FAQ */}
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
