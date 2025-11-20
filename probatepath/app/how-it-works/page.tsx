import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollFade } from "@/components/scroll-fade";

export const metadata: Metadata = {
  title: "How ProbatePath works",
  description:
    "Guided intake, optional will search support, specialist assembly, and self-filing confidence for BC probate executors.",
};

const timelineCards = [
  {
    title: "Answer guided questions (15–25 min)",
    body: "Work through executor, deceased, and asset prompts with autosave and inline guidance. Pause anytime.",
    bullets: ["Executor & deceased details", "Will + codicils status", "Assets & property overview", "Key dates + locations"],
    image: "/images/steps-1.jpg",
    link: { label: "See what you’ll need", href: "#prep-list" },
  },
  {
    title: "We assemble your package",
    body: "Specialists check for gaps, apply the latest BC forms, and add personalised instructions with signing tabs.",
    bullets: ["Completeness checks", "Latest BC forms + notices", "Personalised cover letter", "Filing checklist"],
    image: "/images/steps-3.jpg",
  },
  {
    title: "You swear, mail, and track",
    body: "Attend notarisation, sign, and courier everything with the included labels. Track responses and defects.",
    bullets: [
      "Affidavit signatures & notarisation steps",
      "Mailing instructions with courier labels",
      "Track responses and defect support",
      "Portal reminders to keep moving",
    ],
    image: "/images/steps-6.jpg",
  },
];

const previewStrips = [
  {
    title: "Will search toolkit",
    description: "Generate the registry request packet with cover letter, ID checklist, and envelope labels.",
    href: "/portal/how-to-assemble",
    image: "/images/envelope.jpg",
  },
  {
    title: "Self-filing walkthrough",
    description: "See every step of assemble, notarise, mail, and respond inside the portal tutorial.",
    href: "/portal/how-to-assemble",
    image: "/images/tutorial-card.jpg",
  },
];

const prepList = [
  "Government-issued ID for the executor",
  "Original will + any codicils",
  "Death certificate copy",
  "Snapshot of assets & liabilities",
  "Beneficiary names and contact info",
];

const includedList = [
  "Guided intake with autosave + reminders",
  "Specialist completeness review",
  "Court forms & notices (latest versions)",
  "Personalised checklist + cover letter",
  "Email support from BC probate specialists",
];

const goodFit = [
  "Single executor (or acting executor)",
  "Valid BC will and Canadian assets",
  "No active disputes or litigation",
];

const notFit = ["Contested estates", "Complex trusts or multiple jurisdictions", "Situations requiring legal representation"];

export default function HowItWorksPage() {
  return (
    <div className="space-y-20 pb-28">
      <ScrollFade
        as="section"
        className="space-y-6 rounded-[32px] border border-[#e2e8f0] bg-white p-8 shadow-[0_40px_120px_-80px_rgba(15,23,42,0.4)] sm:p-12"
        once={false}
      >
        <div className="space-y-4">
          <h1 className="font-serif text-4xl text-[#0f172a] sm:text-5xl">How ProbatePath works</h1>
          <p className="max-w-3xl text-base text-[#495067]">
            Guided intake → specialist assembly → you file at the registry. Clear steps, saved progress, and Canadian hosting every step
            of the way.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button asChild size="lg">
            <Link href="/create-account">Start now</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/contact">Questions? Contact us</Link>
          </Button>
        </div>
        <div className="flex flex-wrap gap-3 text-sm text-[#0f172a]">
          {["Built for BC probate", "Clear fixed fee", "Hosted in Canada"].map((item) => (
            <span key={item} className="inline-flex items-center rounded-full border border-[#d7ddec] px-4 py-2">
              {item}
            </span>
          ))}
        </div>
      </ScrollFade>

      <ScrollFade as="section" className="space-y-8">
        <div className="flex items-center gap-3 text-[#1c2a44]">
          {[0, 1, 2].map((dot) => (
            <span key={dot} className="h-2 w-2 rounded-full bg-[#1c2a44]" />
          ))}
          <span className="text-sm font-semibold uppercase tracking-[0.4em] text-[#1c2a44]">Three core stages</span>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {timelineCards.map((stage) => (
            <Card key={stage.title} className="h-full border-[#d7ddec] shadow-[0_30px_100px_-70px_rgba(15,23,42,0.45)]">
              <div className="relative h-40 overflow-hidden rounded-t-[32px]">
                <Image src={stage.image} alt={stage.title} fill className="object-cover" />
              </div>
              <CardHeader className="space-y-3">
                <CardTitle className="text-xl text-[#0f172a]">{stage.title}</CardTitle>
                <CardDescription className="text-sm text-[#495067]">{stage.body}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-3 text-sm text-[#0f172a]">
                  {stage.bullets.map((bullet) => (
                    <li key={bullet} className="flex items-start gap-3">
                      <span className="mt-1 h-2 w-2 rounded-full bg-[#ff6a00]" />
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
                {stage.link ? (
                  <Link href={stage.link.href} className="inline-flex items-center text-sm font-semibold text-[#1c2a44] hover:text-[#ff6a00]">
                    {stage.link.label}
                    <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
                  </Link>
                ) : null}
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollFade>

      <ScrollFade as="section" className="grid gap-6 md:grid-cols-2">
        {previewStrips.map((strip) => (
          <Card key={strip.title} className="border-[#d7ddec] bg-[#0c3b6c]/5">
            <CardHeader className="space-y-3">
              <CardTitle className="text-xl text-[#0f172a]">{strip.title}</CardTitle>
              <CardDescription>{strip.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative h-40 overflow-hidden rounded-2xl border border-[#e2e8f0]">
                <Image src={strip.image} alt={strip.title} fill className="object-cover" />
              </div>
              <Button asChild variant="ghost" className="justify-start text-[#0c3b6c] hover:text-[#ff6a00]">
                <Link href={strip.href}>
                  Open tutorial
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </ScrollFade>

      <ScrollFade as="section" id="prep-list" className="grid gap-6 md:grid-cols-2">
        <Card className="border-[#d7ddec]">
          <CardHeader>
            <CardTitle>What you’ll need</CardTitle>
            <CardDescription>Gather these items to breeze through intake.</CardDescription>
          </CardHeader>
          <CardContent>
            <Checklist items={prepList} />
          </CardContent>
        </Card>
        <Card className="border-[#d7ddec]">
          <CardHeader>
            <CardTitle>What’s included</CardTitle>
            <CardDescription>Everything in the 2,500 CAD fixed fee.</CardDescription>
          </CardHeader>
          <CardContent>
            <Checklist items={includedList} />
          </CardContent>
        </Card>
      </ScrollFade>

      <ScrollFade as="section" className="grid gap-6 rounded-[28px] border border-[#e2e8f0] bg-white p-8 shadow-[0_40px_120px_-80px_rgba(15,23,42,0.4)] md:grid-cols-2">
        <div>
          <h2 className="font-serif text-2xl text-[#0f172a]">Are we the right fit?</h2>
          <p className="mt-3 text-sm text-[#495067]">
            We’re designed for straightforward, uncontested BC estates with a valid will and Canadian assets.
          </p>
          <Checklist items={goodFit} className="mt-4" />
        </div>
        <div>
          <h2 className="font-serif text-2xl text-[#0f172a]">Not a fit if…</h2>
          <p className="mt-3 text-sm text-[#495067]">We refer out matters that require litigation, bespoke legal advice, or multi-jurisdiction planning.</p>
          <Checklist items={notFit} className="mt-4" />
        </div>
      </ScrollFade>

      <ScrollFade as="section" className="space-y-6 rounded-[28px] border border-[#e2e8f0] bg-white p-8 shadow-[0_40px_120px_-80px_rgba(15,23,42,0.4)]">
        <h2 className="font-serif text-2xl text-[#0f172a]">Timeline & expectations</h2>
        <ul className="space-y-3 text-sm text-[#0f172a]">
          <li className="flex items-start gap-3">
            <span className="mt-1 h-2 w-2 rounded-full bg-[#ff6a00]" />
            <span>Most clients finish intake in ~15–25 minutes.</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="mt-1 h-2 w-2 rounded-full bg-[#ff6a00]" />
            <span>Target: package ready within 24 hours after intake completion (not guaranteed; timelines can vary).</span>
          </li>
        </ul>
      </ScrollFade>

      <ScrollFade as="section" className="space-y-4 rounded-[28px] border border-[#d7ddec] bg-[#f7f8fa] p-8">
        <h2 className="font-serif text-2xl text-[#0f172a]">Security & data residency</h2>
        <p className="text-sm text-[#495067]">
          Encryption in transit and at rest. Data is hosted in Canada and retained per your instructions.
        </p>
        <Link href="/legal" className="inline-flex items-center text-sm font-semibold text-[#1c2a44] hover:text-[#ff6a00]">
          Review our privacy commitments
          <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
        </Link>
      </ScrollFade>

      <ScrollFade as="section" className="rounded-[32px] border border-[#1c2a44]/20 bg-[#1c2a44] p-10 text-white shadow-[0_40px_120px_-80px_rgba(28,42,68,0.85)]">
        <div className="space-y-4">
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-white/70">Ready to start?</p>
          <h2 className="font-serif text-3xl sm:text-4xl">Begin your intake in minutes</h2>
          <p className="text-sm text-white/80">
            We’ll guide you through every field, confirm fit, and assemble your filing-ready package with Canadian-hosted security.
          </p>
          <Button asChild size="lg" className="bg-white text-[#1c2a44] hover:bg-white/90">
            <Link href="/create-account">Start now</Link>
          </Button>
        </div>
      </ScrollFade>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-[#e2e8f0] bg-white/95 p-4 shadow-[0_-20px_60px_-30px_rgba(15,23,42,0.35)] sm:hidden">
        <Button asChild className="w-full">
          <Link href="/create-account">Start now</Link>
        </Button>
      </div>
    </div>
  );
}

type ChecklistProps = {
  items: string[];
  className?: string;
};

function Checklist({ items, className }: ChecklistProps) {
  return (
    <ul className={["space-y-3 text-sm text-[#0f172a]", className].filter(Boolean).join(" ")}>
      {items.map((item) => (
        <li key={item} className="flex items-start gap-3">
          <span className="mt-1 inline-flex h-6 w-6 flex-none items-center justify-center rounded-full bg-[#fef4ed] text-[#ff6a00]">
            <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
          </span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}
