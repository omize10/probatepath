import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  FileText,
  Handshake,
  ShieldCheck,
  Timer,
} from "lucide-react";
import { CTAPanel } from "@/components/cta-panel";
import { FAQAccordion } from "@/components/faq-accordion";
import { FeatureCards } from "@/components/feature-cards";
import { Hero } from "@/components/hero";
import { Section } from "@/components/section";
import { TrustBadges } from "@/components/trust-badges";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = {
  title: "BC probate documents in hours",
  description:
    "ProbatePath prepares filing-ready probate documents for British Columbia executors with a fixed 2,500 CAD fee, Canadian data residency, and calm support.",
  openGraph: {
    title: "ProbatePath — BC probate documents in hours",
    description:
      "Start online in minutes and receive a filing-ready probate package prepared by BC probate professionals.",
    url: "https://probatepath.ca/",
    siteName: "ProbatePath",
    type: "website",
    images: [
      {
        url: "/images/og-default.svg",
        width: 1200,
        height: 630,
        alt: "ProbatePath marketing imagery",
      },
    ],
  },
};

const trustPoints = [
  "Clear fixed fee — 2,500 CAD",
  "Security with encryption and Canadian data residency",
  "Purpose-built for BC probate filings",
  "Target delivery: within 24 hours after intake is complete",
];

const features = [
  {
    title: "Speed without pressure",
    description:
      "Finish the calm online intake in under thirty minutes and receive a precise, court-ready package shortly after.",
    icon: Timer,
  },
  {
    title: "Documents built for clarity",
    description:
      "We map your answers into the exact Supreme Court of BC forms and notices, formatted for quick review at the registry.",
    icon: FileText,
  },
  {
    title: "Specialist support",
    description:
      "BC probate professionals review for completeness and remain available to guide you through filing as the executor.",
    icon: Handshake,
  },
  {
    title: "Simple fixed fee",
    description:
      "One transparent price that covers intake review, drafting, and a round of refinements—no hourly surprises.",
    icon: ShieldCheck,
  },
];

const journeySteps = [
  {
    title: "Answer questions",
    detail:
      "Complete the guided intake covering will details, beneficiaries, inventory, and timelines in plain language.",
  },
  {
    title: "We assemble your package",
    detail:
      "ProbatePath specialists translate your responses into the required probate forms, notices, and filing checklist.",
  },
  {
    title: "You file with confidence",
    detail:
      "Sign, notarize where needed, and submit at the courthouse using the tailored checklist and support resources.",
  },
];

const miniFaq = [
  {
    question: "Who is ProbatePath built for?",
    answer:
      "Executors of straightforward BC estates with a valid will, Canadian assets, and no active disputes.",
  },
  {
    question: "How quickly will I receive documents?",
    answer:
      "Most packages are delivered within 24 hours after intake completion. We flag anything that may extend timing.",
  },
  {
    question: "Is my data stored in Canada?",
    answer:
      "Yes. Intake responses and documents are encrypted in transit and at rest on Canadian cloud infrastructure.",
  },
];

export default function HomePage() {
  return (
    <div className="space-y-24 pb-16">
      <Hero
        eyebrow="Calm probate preparation"
        title="BC probate documents in hours."
        description="Fixed 2,500 CAD. You file. We prepare. Start online in minutes and receive a filing-ready package prepared by BC probate professionals."
        primaryAction={{ label: "Start now", href: "/start" }}
        secondaryAction={{ label: "How it works", href: "/how-it-works", variant: "ghost" }}
        image={{
          src: "/images/hero-desk.svg",
          alt: "Organised probate documents on a dark desk",
          width: 720,
          height: 520,
        }}
      >
        <TrustBadges items={trustPoints} className="sm:grid-cols-2 lg:grid-cols-2" />
      </Hero>

      <Section className="space-y-12">
        <div className="space-y-4">
          <Badge variant="outline">Why ProbatePath</Badge>
          <h2 className="font-serif text-3xl text-white sm:text-4xl">
            Built for BC executors who want certainty
          </h2>
          <p className="max-w-3xl text-base text-slate-300">
            We combine automation with attentive review so every executor receives the exact paperwork, instructions, and reassurance needed to file smoothly.
          </p>
        </div>
        <FeatureCards features={features} />
      </Section>

      <Section className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
        <div className="space-y-6">
          <Badge variant="outline">Security & care</Badge>
          <h2 className="font-serif text-3xl text-white sm:text-4xl">
            Security that respects sensitive estate details
          </h2>
          <p className="max-w-3xl text-base text-slate-300">
            ProbatePath is engineered for confidential information. Encryption, audit trails, and Canadian hosting mean your documents stay private and under your control.
          </p>
          <ul className="space-y-3 text-sm text-slate-200">
            <li className="flex items-start gap-3">
              <span className="mt-1 inline-flex h-2 w-2 flex-none rounded-full bg-[#ff6a00]" />
              Encryption in transit and at rest using Canadian cloud infrastructure.
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-1 inline-flex h-2 w-2 flex-none rounded-full bg-[#ff6a00]" />
              Granular access controls so only the small BC probate team assigned to your file can review responses.
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-1 inline-flex h-2 w-2 flex-none rounded-full bg-[#ff6a00]" />
              Permanent deletion available on request—your data, your decision.
            </li>
          </ul>
        </div>
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0b1524]">
          <Image
            src="/images/security.svg"
            alt="Stylised illustration of a secure shield representing encrypted storage"
            width={560}
            height={360}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-black/25 via-transparent to-black/40" />
        </div>
      </Section>

      <Section className="space-y-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-4">
            <Badge variant="outline">How it works</Badge>
            <h2 className="font-serif text-3xl text-white sm:text-4xl">A focused three-step path</h2>
            <p className="max-w-2xl text-base text-slate-300">
              Most users complete intake in 15–25 minutes. From there, we prepare and quality-check your probate documents, then guide you through filing as the executor of record.
            </p>
          </div>
          <Link
            href="/how-it-works"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#ff6a00] transition hover:text-[#ff8840]"
            aria-label="Read more about how ProbatePath works"
          >
            Full process overview
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {journeySteps.map((step, index) => (
            <Card key={step.title} className="border-white/12 bg-[#0b1524]/90">
              <CardHeader className="space-y-4">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-[#081127] text-sm font-semibold text-white">
                  {index + 1}
                </span>
                <CardTitle className="text-xl text-white">{step.title}</CardTitle>
                <CardDescription>{step.detail}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </Section>

      <Section className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          <Badge variant="outline">Transparent pricing</Badge>
          <h2 className="font-serif text-3xl text-white sm:text-4xl">Fixed fee: 2,500 CAD</h2>
          <p className="max-w-2xl text-base text-slate-300">
            The fee includes intake review, document assembly, a round of refinements, and secure delivery. Court fees and courier costs remain separate and are paid directly by you.
          </p>
          <ul className="space-y-3 text-sm text-slate-200">
            <li className="flex items-start gap-3">
              <span className="mt-1 inline-flex h-2 w-2 flex-none rounded-full bg-[#ff6a00]" />
              Filing-ready Supreme Court of BC forms, notices, exhibits, and checklists.
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-1 inline-flex h-2 w-2 flex-none rounded-full bg-[#ff6a00]" />
              Intake support and scope confirmation before any payment is taken.
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-1 inline-flex h-2 w-2 flex-none rounded-full bg-[#ff6a00]" />
              Secure digital delivery with Canadian data residency for 12 months.
            </li>
          </ul>
          <div className="flex flex-wrap gap-4">
            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#ff6a00] transition hover:text-[#ff8840]"
            >
              View the full pricing breakdown
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
        <CTAPanel
          eyebrow="Not sure if you qualify?"
          title="Let’s confirm your estate fits the fixed-fee scope."
          description="Book a short call to review estate details, timing, and next steps. If we determine extra work is needed, we’ll outline options before you begin."
          primaryAction={{ label: "Start intake", href: "/start" }}
          secondaryAction={{ label: "Book a call", href: "/contact", variant: "ghost" }}
        />
      </Section>

      <Section className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0b1524]">
          <Image
            src="/images/support-team.svg"
            alt="Stylised illustration of the ProbatePath support team"
            width={560}
            height={360}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-black/20 via-transparent to-black/40" />
        </div>
        <div className="space-y-6">
          <Badge variant="outline">People + process</Badge>
          <h2 className="font-serif text-3xl text-white sm:text-4xl">A BC probate team that stays responsive</h2>
          <p className="text-base text-slate-300">
            We pair automation with human context. You'll hear from professionals who focus solely on probate preparation, providing calm answers without the pressure of hourly billing.
          </p>
          <ul className="space-y-3 text-sm text-slate-200">
            <li className="flex items-start gap-3">
              <span className="mt-1 inline-flex h-2 w-2 flex-none rounded-full bg-[#ff6a00]" />
              Dedicated inbox monitored by specialists with practical BC probate experience.
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-1 inline-flex h-2 w-2 flex-none rounded-full bg-[#ff6a00]" />
              Written responses within one business day—often within hours.
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-1 inline-flex h-2 w-2 flex-none rounded-full bg-[#ff6a00]" />
              Clear language, Canadian spelling, and an emphasis on executor empowerment.
            </li>
          </ul>
        </div>
      </Section>

      <Section className="space-y-10">
        <div className="space-y-4">
          <Badge variant="outline">Questions</Badge>
          <h2 className="font-serif text-3xl text-white sm:text-4xl">Answers at a glance</h2>
          <p className="max-w-3xl text-base text-slate-300">
            Here are three of the questions executors ask most often. Visit the FAQs for all the details, from eligibility to timelines and how we protect your information.
          </p>
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          {miniFaq.map((faq) => (
            <Card key={faq.question} className="border-white/12 bg-[#0b1524]/85">
              <CardHeader className="space-y-3">
                <CardTitle className="text-lg text-white">{faq.question}</CardTitle>
                <CardDescription>{faq.answer}</CardDescription>
                <Link
                  href="/faqs"
                  className="inline-flex items-center gap-2 text-xs font-semibold text-[#ff6a00] transition hover:text-[#ff8840]"
                >
                  View all FAQs
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </CardHeader>
            </Card>
          ))}
        </div>
      </Section>

      <Section className="space-y-6">
        <Badge variant="outline">Full FAQ library</Badge>
        <FAQAccordion
          items={[
            {
              question: "What estates fit the fixed-fee scope?",
              answer:
                "Estates with a valid will, an executor ready to file, Canadian assets, and no active disputes usually qualify. If something looks complex, we flag it before intake continues.",
            },
            {
              question: "Can you rush the package if a deadline is looming?",
              answer:
                "Yes. Share your timeline when you reach out and we will confirm whether an expedited turnaround is possible.",
            },
            {
              question: "How do you keep intake information secure?",
              answer:
                "All data stays in Canada, encrypted in transit and at rest. Access is limited to the small team preparing your documents.",
            },
            {
              question: "What if I need more than one round of edits?",
              answer:
                "A refinement round is included. If the estate circumstances change and require substantial revisions, we’ll scope the work with you first.",
            },
            {
              question: "Do you attend the courthouse with me?",
              answer:
                "ProbatePath prepares you to file as the executor. We supply checklists, signing instructions, and ongoing email support instead of in-person attendance.",
            },
            {
              question: "What happens if the estate becomes contested?",
              answer:
                "We pause the fixed-fee engagement and suggest you speak with independent legal counsel who can represent you. Your documents remain available for reference.",
            },
            {
              question: "Can multiple executors use ProbatePath?",
              answer:
                "Yes. We support co-executors. Intake will capture each person’s details so the package reflects joint responsibilities.",
            },
            {
              question: "Do you help with beneficiary notices?",
              answer:
                "We generate notices and a service checklist so you can mail or deliver them confidently, including guidance for out-of-province recipients.",
            },
            {
              question: "How long do I have access to my files?",
              answer:
                "Documents remain available in your secure vault for twelve months. Request permanent deletion anytime.",
            },
            {
              question: "Who can I contact with questions during intake?",
              answer:
                "Your welcome email includes a direct line to our probate support specialists. We reply within one business day, often much sooner.",
            },
          ]}
        />
      </Section>
    </div>
  );
}
