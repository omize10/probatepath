import type { Metadata } from "next";
import Image from "next/image";
import { CTAPanel } from "@/components/cta-panel";
import { Section } from "@/components/section";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = {
  title: "How ProbatePath works",
  description:
    "See how ProbatePath guides BC executors from calm intake to filing-ready probate documents in three focused steps.",
};

const steps = [
  {
    title: "Answer guided questions",
    description:
      "Share will details, executor information, beneficiaries, assets, liabilities, and timelines through a structured online intake.",
  },
  {
    title: "We prepare your package",
    description:
      "Our specialists assemble the required Supreme Court of BC forms, notices, exhibits, and a personalised filing checklist.",
  },
  {
    title: "You file confidently",
    description:
      "Review, sign, and submit at the courthouse with our step-by-step instructions. We remain available for questions along the way.",
  },
];

const requirements = [
  "Executor government-issued identification",
  "Original will and any codicils",
  "Death certificate certified copy",
  "Inventory of estate assets and approximate values",
  "Contact details for beneficiaries and witnesses",
];

const preparationTips = [
  "Most users complete intake in 15–25 minutes.",
  "You can pause and return at any point without losing progress.",
  "Need help? Email hello@probatepath.ca and we reply within one business day.",
];

export default function HowItWorksPage() {
  return (
    <div className="space-y-20 pb-16">
      <header className="space-y-6">
        <Badge variant="outline">Process</Badge>
        <h1 className="font-serif text-4xl text-white sm:text-5xl">
          A focused process from intake to filing
        </h1>
        <p className="max-w-3xl text-base text-slate-300">
          ProbatePath keeps probate calm and predictable. Follow the guided intake, let our team assemble the filing-ready package, and arrive at the courthouse with everything you need.
        </p>
      </header>

      <Section className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          {steps.map((step, index) => (
            <Card key={step.title} className="border-white/12 bg-[#111217]/85">
              <CardHeader className="flex items-start gap-4">
                <span className="inline-flex h-11 w-11 flex-none items-center justify-center rounded-full border border-white/10 bg-[#0f1115] text-sm font-semibold text-white">
                  {index + 1}
                </span>
                <div className="space-y-2">
                  <CardTitle className="text-xl text-white">{step.title}</CardTitle>
                  <CardDescription>{step.description}</CardDescription>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>

        <aside className="space-y-8 lg:sticky lg:top-28">
          <Card className="border-white/12 bg-[#111217]">
            <CardHeader className="space-y-2">
              <CardTitle className="text-2xl text-white">What you’ll need</CardTitle>
              <CardDescription>
                Gather these before starting and intake will feel effortless.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-slate-200">
              <ul className="space-y-3">
                {requirements.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="mt-1 inline-flex h-2 w-2 flex-none rounded-full bg-[#ff6a00]" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#111217]">
            <Image
              src="/images/process-overview.svg"
              alt="ProbatePath intake steps displayed on a laptop and notebook"
              width={640}
              height={420}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-black/20 via-transparent to-black/40" />
          </div>
          <Card className="border-white/12 bg-[#111217]/85">
            <CardContent className="space-y-2 text-sm text-slate-300">
              {preparationTips.map((tip) => (
                <p key={tip}>{tip}</p>
              ))}
            </CardContent>
          </Card>
        </aside>
      </Section>

      <Section>
        <CTAPanel
          eyebrow="Ready when you are"
          title="Start the guided intake or reach out with questions."
          description="We confirm scope before any payment. If the estate requires work beyond the fixed fee, we discuss options so you stay in control."
          primaryAction={{ label: "Start intake", href: "/start" }}
          secondaryAction={{ label: "Ask a question", href: "/contact", variant: "ghost" }}
        />
      </Section>
    </div>
  );
}
