import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollFade } from "@/components/scroll-fade";

export const metadata: Metadata = {
  title: "How ProbateDesk works",
  description:
    "Guided intake, optional will search support, specialist assembly, and self-filing confidence for BC probate executors.",
};

const timelineCards = [
  {
    title: "Answer guided questions (15–25 min)",
    body: "Work through executor, deceased, and asset prompts with autosave and inline guidance. Pause anytime.",
    bullets: ["Executor & deceased details", "Will + codicils status", "Assets & property overview", "Key dates + locations"],
    image: "/images/Screenshot 2025-11-27 at 8.01.30 PM.png",
    link: { label: "See what you’ll need", href: "#prep-list" },
  },
  {
    title: "We assemble your package",
    body: "Specialists check for gaps, apply the latest BC forms, and add personalised instructions with signing tabs.",
    bullets: ["Completeness checks", "Latest BC forms + notices", "Personalised cover letter", "Filing checklist"],
    image: "/images/AdobeStock_3017601323-1.jpg",
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
    image: "/images/9779055e-0a67-4e73-868c-1ba539e024e5.png",
  },
];

const previewStrips = [
  {
    title: "Will search toolkit",
    description: "Generate the registry request packet with cover letter, ID checklist, and envelope labels.",
    href: "/portal/how-to-assemble",
    image: null,
  },
  {
    title: "Self-filing walkthrough",
    description: "See every step of assemble, notarise, mail, and respond inside the portal tutorial.",
    href: "/portal/how-to-assemble",
    image: null,
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
  "BC court forms & notices",
  "PDF filing instructions",
  "Secure Canadian data hosting",
  "Flexible service tiers ($799 to $2,499)",
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
        className="space-y-6 rounded-[32px] border border-[color:var(--border-muted)] bg-[color:var(--bg-surface)] p-8 shadow-[0_40px_90px_-70px_rgba(15,23,42,0.25)] sm:p-12"
        once={false}
      >
        <div className="space-y-4">
          <h1 className="font-serif text-4xl text-[color:var(--brand)] sm:text-5xl">How ProbateDesk works</h1>
          <p className="max-w-3xl text-base text-[color:var(--muted-ink)]">
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
        <div className="flex flex-wrap gap-3 text-sm text-[color:var(--brand)]">
          {["Built for BC probate", "Starting at $799", "Hosted in Canada"].map((item) => (
            <span key={item} className="inline-flex items-center rounded-full border border-[color:var(--border-muted)] px-4 py-2">
              {item}
            </span>
          ))}
        </div>
      </ScrollFade>

      <ScrollFade as="section" className="space-y-8">
        <div className="flex items-center gap-3 text-[color:var(--slate)]">
          {[0, 1, 2].map((dot) => (
            <span key={dot} className="h-2 w-2 rounded-full bg-[color:var(--slate)]" />
          ))}
          <span className="text-sm font-semibold uppercase tracking-[0.4em] text-[color:var(--slate)]">Three core stages</span>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {timelineCards.map((stage) => (
            <Card
              key={stage.title}
              className="h-full border-[color:var(--border-muted)] shadow-[0_30px_80px_-70px_rgba(15,23,42,0.25)]"
            >
              <div className="relative h-40 overflow-hidden rounded-t-[32px]">
                <Image src={stage.image} alt={stage.title} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover" />
              </div>
              <CardHeader className="space-y-3">
                <CardTitle className="text-xl text-[color:var(--brand)]">{stage.title}</CardTitle>
                <CardDescription className="text-sm text-[color:var(--muted-ink)]">{stage.body}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-3 text-sm text-[color:var(--brand)]">
                  {stage.bullets.map((bullet) => (
                    <li key={bullet} className="flex items-start gap-3">
                      <span className="mt-1 h-2 w-2 rounded-full bg-[color:var(--accent)]" />
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
                {stage.link ? (
                  <Link
                    href={stage.link.href}
                    className="inline-flex items-center text-sm font-semibold text-[color:var(--brand)] hover:text-[color:var(--accent-dark)]"
                  >
                    {stage.link.label}
                    <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
                  </Link>
                ) : null}
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollFade>

      {/* Removed tutorial preview cards */}

      <ScrollFade as="section" id="prep-list" className="grid gap-6 md:grid-cols-2">
        <Card className="border-[color:var(--border-muted)]">
          <CardHeader>
            <CardTitle>What you’ll need</CardTitle>
            <CardDescription>Gather these items to breeze through intake.</CardDescription>
          </CardHeader>
          <CardContent>
            <Checklist items={prepList} />
          </CardContent>
        </Card>
        <Card className="border-[color:var(--border-muted)]">
          <CardHeader>
            <CardTitle>Service tiers</CardTitle>
            <CardDescription>Choose from Basic ($799), Standard ($1,499), or Premium ($2,499) based on your needs.</CardDescription>
          </CardHeader>
          <CardContent>
            <Checklist items={includedList} />
          </CardContent>
        </Card>
      </ScrollFade>

      <ScrollFade
        as="section"
        className="grid gap-6 rounded-[28px] border border-[color:var(--border-muted)] bg-[color:var(--bg-surface)] p-8 shadow-[0_40px_90px_-70px_rgba(15,23,42,0.25)] md:grid-cols-2"
      >
        <div>
          <h2 className="font-serif text-2xl text-[color:var(--brand)]">Are we the right fit?</h2>
          <p className="mt-3 text-sm text-[color:var(--muted-ink)]">
            We’re designed for straightforward, uncontested BC estates with a valid will and Canadian assets.
          </p>
          <Checklist items={goodFit} className="mt-4" />
        </div>
        <div>
          <h2 className="font-serif text-2xl text-[color:var(--brand)]">Not a fit if…</h2>
          <p className="mt-3 text-sm text-[color:var(--muted-ink)]">We refer out matters that require litigation, bespoke legal advice, or multi-jurisdiction planning.</p>
          <Checklist items={notFit} className="mt-4" />
        </div>
      </ScrollFade>

      <ScrollFade
        as="section"
        className="space-y-6 rounded-[28px] border border-[color:var(--border-muted)] bg-[color:var(--bg-surface)] p-8 shadow-[0_40px_90px_-70px_rgba(15,23,42,0.25)]"
      >
        <h2 className="font-serif text-2xl text-[color:var(--brand)]">Timeline & expectations</h2>
        <ul className="space-y-3 text-sm text-[color:var(--brand)]">
          <li className="flex items-start gap-3">
            <span className="mt-1 h-2 w-2 rounded-full bg-[color:var(--accent)]" />
            <span>Most clients finish intake in ~15–25 minutes.</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="mt-1 h-2 w-2 rounded-full bg-[color:var(--accent)]" />
            <span>Target: package ready within 24 hours after intake completion (not guaranteed; timelines can vary).</span>
          </li>
        </ul>
      </ScrollFade>

      <ScrollFade as="section" className="space-y-4 rounded-[28px] border border-[color:var(--border-muted)] bg-[color:var(--bg-muted)] p-8">
        <h2 className="font-serif text-2xl text-[color:var(--brand)]">Security & data residency</h2>
        <p className="text-sm text-[color:var(--muted-ink)]">
          Encryption in transit and at rest. Data is hosted in Canada and retained per your instructions.
        </p>
        <Link
          href="/legal"
          className="inline-flex items-center text-sm font-semibold text-[color:var(--brand)] hover:text-[color:var(--accent-dark)]"
        >
          Review our privacy commitments
          <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
        </Link>
      </ScrollFade>

      <ScrollFade
        as="section"
        className="rounded-[32px] border border-[color:var(--border-muted)] bg-[color:var(--bg-surface)] p-10 shadow-[0_40px_90px_-70px_rgba(15,23,42,0.2)]"
      >
        <div className="space-y-4">
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-[color:var(--ink-muted)]">Ready to start?</p>
          <h2 className="font-serif text-3xl text-[color:var(--brand)] sm:text-4xl">Begin your intake in minutes</h2>
          <p className="text-sm text-[color:var(--ink-muted)]">
            We’ll guide you through every field, confirm fit, and assemble your filing-ready package with Canadian-hosted security.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button asChild size="lg">
              <Link href="/create-account">Start now</Link>
            </Button>
            <Button asChild size="lg" variant="secondary">
              <Link href="/contact">Talk to a specialist</Link>
            </Button>
          </div>
        </div>
      </ScrollFade>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-[color:var(--border-muted)] bg-white/95 p-4 shadow-[0_-20px_60px_-30px_rgba(15,23,42,0.35)] sm:hidden">
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
    <ul className={["space-y-3 text-sm text-[color:var(--brand)]", className].filter(Boolean).join(" ")}>
      {items.map((item) => (
        <li key={item} className="flex items-start gap-3">
          <span className="mt-1 inline-flex h-6 w-6 flex-none items-center justify-center rounded-full bg-[#f0f3f7] text-[color:var(--brand)]">
            <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
          </span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}
