import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { CTAPanel } from "@/components/cta-panel";
import { Section } from "@/components/section";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "ProbatePath offers a single 2,500 CAD fee for filing-ready BC probate documents, with clear notes on what is and isn’t included.",
};

const included = [
  "Scope confirmation before payment so you know the engagement fits",
  "Guided intake with specialist review for completeness",
  "Drafting of required Supreme Court of BC probate forms and notices",
  "Personalised signing instructions and courthouse checklist",
  "One round of refinements within seven days of delivery",
  "Secure Canadian-hosted portal with 12 months of access",
];

const notIncluded = [
  "Supreme Court of British Columbia filing fees (paid directly to the court)",
  "Courier, mail, or notarization costs for affidavits and notices",
  "Complex estate scenarios such as disputes, foreign assets, or trusts",
  "In-person courthouse attendance or representation",
];

const assurancePoints = [
  "We flag complexity early and provide alternate options if needed.",
  "Payment is collected in two instalments: 50% at intake, 50% on delivery.",
  "Receipts and tax breakdown (GST/PST) are issued automatically.",
];

export default function PricingPage() {
  return (
    <div className="space-y-20 pb-16">
      <header className="space-y-6">
        <Badge variant="outline">Pricing</Badge>
        <h1 className="font-serif text-4xl text-white sm:text-5xl">Fixed fee, no surprises</h1>
        <p className="max-w-3xl text-base text-slate-300">
          ProbatePath keeps pricing simple so executors can focus on the estate. Our fixed 2,500 CAD fee covers everything required to prepare a filing-ready package.
        </p>
      </header>

      <Section className="grid gap-12 lg:grid-cols-[1.2fr_0.8fr]">
        <Card className="border-white/12 bg-[#0b1524]">
          <CardHeader className="space-y-6">
            <div className="space-y-3">
              <CardTitle className="text-5xl text-white">$2,500 CAD</CardTitle>
              <CardDescription>
                GST and PST apply. Fees are charged in two instalments: half at intake and half once your documents are delivered.
              </CardDescription>
            </div>
            <Separator className="bg-white/10" />
          </CardHeader>
          <CardContent className="grid gap-8 lg:grid-cols-2">
            <div className="space-y-4 text-sm text-slate-200">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                What’s included
              </p>
              <ul className="space-y-3">
                {included.map((item) => (
                  <li key={item} className="flex items-start gap-3 rounded-2xl border border-white/10 bg-[#081127]/90 p-4">
                    <span className="mt-1 inline-flex h-2 w-2 flex-none rounded-full bg-[#ff6a00]" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="space-y-4 text-sm text-slate-300">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                What’s not included
              </p>
              <ul className="space-y-3">
                {notIncluded.map((item) => (
                  <li key={item} className="flex items-start gap-3 rounded-2xl border border-white/10 bg-[#081127]/60 p-4">
                    <span className="mt-1 inline-flex h-2 w-2 flex-none rounded-full bg-white/40" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4 border-t border-white/10 pt-6 text-sm text-slate-300 sm:flex-row sm:items-center sm:justify-between">
            <p className="max-w-md">
              Unsure if your estate qualifies? We scope every engagement personally and alert you if anything falls outside the flat fee.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/start"
                className="inline-flex items-center justify-center rounded-full bg-[#ff6a00] px-6 py-3 text-sm font-semibold text-[#050713] transition hover:bg-[#ff7a1f]"
              >
                Start intake
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center rounded-full border border-white/15 px-6 py-3 text-sm font-semibold text-slate-100 transition hover:border-white/30"
              >
                Ask a question
              </Link>
            </div>
          </CardFooter>
        </Card>

        <div className="space-y-8">
          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0b1524]">
            <Image
              src="/images/pricing-overview.svg"
              alt="ProbatePath pricing summary displayed on screen"
              width={560}
              height={420}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-black/25 via-transparent to-black/40" />
          </div>
          <Card className="border-white/12 bg-[#0b1524]/85">
            <CardContent className="space-y-3 text-sm text-slate-300">
              {assurancePoints.map((point) => (
                <p key={point}>{point}</p>
              ))}
            </CardContent>
          </Card>
        </div>
      </Section>

      <Section>
        <CTAPanel
          eyebrow="Need a second look?"
          title="Let’s confirm your estate fits the fixed-fee scope."
          description="Share a few details and we’ll review eligibility together. If you need extra services, we’ll outline clear next steps before you decide."
          primaryAction={{ label: "Book a call", href: "/contact" }}
          secondaryAction={{ label: "Start intake", href: "/start", variant: "ghost" }}
        />
      </Section>
    </div>
  );
}
