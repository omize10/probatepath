import type { Metadata } from "next";
import { Fragment } from "react";
import Link from "next/link";
import { ArrowRight, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollFade } from "@/components/scroll-fade";

export const metadata: Metadata = {
  title: "Pricing - Probate Desk",
  description:
    "Clear, transparent pricing for BC probate document preparation. Choose the service level that fits your needs, from self-serve basics to premium white-glove support.",
};

const tiers = [
  {
    name: "Basic",
    price: 799,
    description: "For tech-savvy executors with simple estates",
    recommended: false,
    features: [
      { name: "Online intake questionnaire", included: true },
      { name: "Automated probate form generation", included: true },
      { name: "PDF filing instructions", included: true },
      { name: "Email support (48-hour response)", included: true },
      { name: "Human document review", included: false },
      { name: "Phone/video support", included: false },
      { name: "Requisition assistance", included: false },
      { name: "Post-grant guidance", included: false },
    ],
    cta: "Get Started",
    href: "/create-account",
  },
  {
    name: "Standard",
    price: 1499,
    description: "Most executors choose this for peace of mind",
    recommended: true,
    features: [
      { name: "Everything in Basic", included: true },
      { name: "Human review of all documents", included: true },
      { name: "Phone/video support (scheduled calls)", included: true },
      { name: "Free notarization in Vancouver", included: true, note: "or $50 credit elsewhere" },
      { name: "Post-grant checklist and templates", included: true },
      { name: "One requisition response included", included: true },
      { name: "Concierge support services", included: true },
      { name: "Priority same-day response", included: false },
    ],
    cta: "Get Started",
    href: "/create-account",
  },
  {
    name: "Premium",
    price: 2499,
    description: "White-glove service for complex estates",
    recommended: false,
    features: [
      { name: "Everything in Standard", included: true },
      { name: "Priority support (same-day response)", included: true },
      { name: "Dedicated case coordinator", included: true },
      { name: "Unlimited requisition assistance", included: true },
      { name: "Post-grant administration guidance", included: true },
      { name: "Tax filing reminders and CRA clearance guidance", included: true },
      { name: "Distribution templates and calculations", included: true },
      { name: "Comparable to lawyer at discounted price", included: true },
    ],
    cta: "Get Started",
    href: "/create-account",
  },
];

const addOns = [
  {
    name: "Rush Processing",
    price: 299,
    description: "Documents ready in 48 hours instead of 5-7 business days",
  },
  {
    name: "Additional Requisition Response",
    price: 199,
    description: "Beyond included allowance for requisition support",
  },
  {
    name: "Post-Grant Support Package",
    price: 399,
    description: "Extended guidance through estate distribution and closing",
  },
  {
    name: "Complex Asset Schedule",
    price: 149,
    description: "For estates with 10+ distinct asset categories",
  },
  {
    name: "Intestate Upgrade",
    price: 299,
    description: "Administration support when there's no valid will",
  },
];

const comparisonFeatures = [
  {
    category: "Core Service",
    features: [
      { name: "Online intake questionnaire", basic: true, standard: true, premium: true },
      { name: "BC probate forms (P1, P2, P3, P9, P10)", basic: true, standard: true, premium: true },
      { name: "PDF filing instructions", basic: true, standard: true, premium: true },
      { name: "Canadian data hosting (encrypted)", basic: true, standard: true, premium: true },
    ],
  },
  {
    category: "Support",
    features: [
      { name: "Email support", basic: "48-hour response", standard: "Business day response", premium: "Same-day response" },
      { name: "Phone/video consultations", basic: false, standard: "Scheduled calls", premium: "Priority scheduling" },
      { name: "Dedicated case coordinator", basic: false, standard: false, premium: true },
    ],
  },
  {
    category: "Document Quality",
    features: [
      { name: "Human document review", basic: false, standard: true, premium: true },
      { name: "Completeness verification", basic: false, standard: true, premium: true },
      { name: "Personalized filing cover letter", basic: false, standard: true, premium: true },
    ],
  },
  {
    category: "Requisition Support",
    features: [
      { name: "Requisition assistance", basic: false, standard: "1 response included", premium: "Unlimited" },
      { name: "Court correspondence review", basic: false, standard: "Basic guidance", premium: "Full support" },
    ],
  },
  {
    category: "Post-Grant Services",
    features: [
      { name: "Post-grant checklist", basic: false, standard: true, premium: true },
      { name: "Distribution templates", basic: false, standard: "Basic templates", premium: "Custom calculations" },
      { name: "Tax filing reminders", basic: false, standard: false, premium: true },
      { name: "CRA clearance guidance", basic: false, standard: false, premium: true },
    ],
  },
  {
    category: "Additional Benefits",
    features: [
      { name: "Notarization assistance", basic: false, standard: "Free in Vancouver or $50 credit", premium: "Free in Vancouver or $50 credit" },
      { name: "Delivery timeline", basic: "5-7 business days", standard: "5-7 business days", premium: "Priority 3-5 days" },
    ],
  },
];

export default function PricingPage() {
  return (
    <div className="space-y-20 pb-28">
      <ScrollFade
        as="section"
        className="space-y-6 rounded-[32px] border border-[color:var(--border-muted)] bg-[color:var(--bg-surface)] p-8 shadow-[0_40px_90px_-70px_rgba(15,23,42,0.25)] sm:p-12"
      >
        <div className="space-y-4 text-center">
          <h1 className="font-serif text-4xl text-[color:var(--brand)] sm:text-5xl">Transparent pricing for BC probate</h1>
          <p className="mx-auto max-w-3xl text-base text-[color:var(--muted-ink)]">
            Choose the service level that fits your needs. All tiers include secure Canadian data hosting, the latest BC Supreme Court
            forms, and guided intake. No hidden fees.
          </p>
        </div>
      </ScrollFade>

      <ScrollFade as="section" className="space-y-8">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[color:var(--slate)]">Three service tiers</p>
          <h2 className="mt-3 font-serif text-3xl text-[color:var(--brand)] sm:text-4xl">Pick what matches your comfort level</h2>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {tiers.map((tier, index) => (
            <ScrollFade key={tier.name} delay={index * 0.1} className="h-full">
              <Card
                className={`relative h-full border-[color:var(--border-muted)] shadow-[0_30px_80px_-70px_rgba(15,23,42,0.25)] transition hover:-translate-y-1 ${
                  tier.recommended ? "border-2 border-[color:var(--brand)] shadow-[0_40px_100px_-60px_rgba(13,23,38,0.35)]" : ""
                }`}
              >
                {tier.recommended && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="portal-badge">RECOMMENDED</span>
                  </div>
                )}
                <CardHeader className="space-y-4 pb-6">
                  <CardTitle className="text-2xl text-[color:var(--brand)]">{tier.name}</CardTitle>
                  <div className="space-y-1">
                    <p className="text-4xl font-bold text-[color:var(--brand)]">
                      ${tier.price.toLocaleString()}
                      <span className="ml-1 text-base font-normal text-[color:var(--muted-ink)]">CAD</span>
                    </p>
                    <p className="text-xs text-[color:var(--muted-ink)]">plus GST/PST</p>
                  </div>
                  <CardDescription className="text-sm text-[color:var(--muted-ink)]">{tier.description}</CardDescription>
                  {tier.recommended ? (
                    <Button asChild size="lg" className="w-full">
                      <Link href={tier.href}>{tier.cta}</Link>
                    </Button>
                  ) : (
                    <Button asChild size="lg" className="w-full" variant="outline">
                      <Link href={tier.href}>{tier.cta}</Link>
                    </Button>
                  )}
                </CardHeader>
                <CardContent className="space-y-3 pt-6">
                  {tier.features.map((feature) => (
                    <div key={feature.name} className="flex items-start gap-3 text-sm">
                      {feature.included ? (
                        <span className="mt-0.5 inline-flex h-5 w-5 flex-none items-center justify-center rounded-full bg-[#f0f3f7] text-[color:var(--brand)]">
                          <Check className="h-3 w-3" aria-hidden />
                        </span>
                      ) : (
                        <span className="mt-0.5 inline-flex h-5 w-5 flex-none items-center justify-center rounded-full bg-[#f0f3f7] text-[color:var(--slate)]">
                          <X className="h-3 w-3" aria-hidden />
                        </span>
                      )}
                      <span className={feature.included ? "text-[color:var(--brand)]" : "text-[color:var(--slate)]"}>
                        {feature.name}
                        {feature.note && <span className="block text-xs text-[color:var(--muted-ink)]">{feature.note}</span>}
                      </span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </ScrollFade>
          ))}
        </div>
      </ScrollFade>

      <ScrollFade as="section" className="space-y-8">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[color:var(--slate)]">Feature comparison</p>
          <h2 className="mt-3 font-serif text-3xl text-[color:var(--brand)] sm:text-4xl">See exactly what's included</h2>
        </div>

        <div className="overflow-hidden rounded-[32px] border border-[color:var(--border-muted)] bg-[color:var(--bg-surface)] shadow-[0_40px_90px_-70px_rgba(15,23,42,0.25)]">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[color:var(--border-muted)]">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[color:var(--brand)]">Feature</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-[color:var(--brand)]">Basic</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-[color:var(--brand)]">
                    Standard
                    <span className="ml-2 inline-flex items-center rounded-full bg-[#f0f3f7] px-2 py-0.5 text-[0.6rem] font-bold uppercase tracking-wider text-[color:var(--brand)]">
                      Recommended
                    </span>
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-[color:var(--brand)]">Premium</th>
                </tr>
              </thead>
              <tbody>
                {comparisonFeatures.map((section) => (
                  <Fragment key={section.category}>
                    <tr className="border-t border-[color:var(--border-muted)] bg-[color:var(--bg-muted)]">
                      <td colSpan={4} className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-[color:var(--brand)]">
                        {section.category}
                      </td>
                    </tr>
                    {section.features.map((feature, idx) => (
                      <tr key={`${section.category}-${idx}`} className="border-t border-[color:var(--border-muted)]">
                        <td className="px-6 py-4 text-sm text-[color:var(--muted-ink)]">{feature.name}</td>
                        <td className="px-6 py-4 text-center text-sm">
                          {renderFeatureValue(feature.basic)}
                        </td>
                        <td className="px-6 py-4 text-center text-sm">
                          {renderFeatureValue(feature.standard)}
                        </td>
                        <td className="px-6 py-4 text-center text-sm">
                          {renderFeatureValue(feature.premium)}
                        </td>
                      </tr>
                    ))}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </ScrollFade>

      <ScrollFade as="section" className="space-y-8">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[color:var(--slate)]">Optional add-ons</p>
          <h2 className="mt-3 font-serif text-3xl text-[color:var(--brand)] sm:text-4xl">Enhance your service</h2>
          <p className="mx-auto mt-3 max-w-2xl text-base text-[color:var(--muted-ink)]">
            Available at any tier. Add during intake or contact us later if your needs change.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {addOns.map((addon, index) => (
            <ScrollFade key={addon.name} delay={index * 0.1}>
              <Card className="h-full border-[color:var(--border-muted)] shadow-[0_25px_60px_-50px_rgba(15,23,42,0.18)]">
                <CardHeader className="space-y-3">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg text-[color:var(--brand)]">{addon.name}</CardTitle>
                    <span className="text-lg font-bold text-[color:var(--brand)]">+${addon.price}</span>
                  </div>
                  <CardDescription className="text-sm text-[color:var(--muted-ink)]">{addon.description}</CardDescription>
                </CardHeader>
              </Card>
            </ScrollFade>
          ))}
        </div>
      </ScrollFade>

      <ScrollFade
        as="section"
        className="rounded-[32px] border border-[color:var(--border-muted)] bg-[color:var(--bg-surface)] p-10 shadow-[0_40px_90px_-70px_rgba(15,23,42,0.2)]"
      >
        <div className="space-y-6 text-center">
          <h2 className="font-serif text-3xl text-[color:var(--brand)] sm:text-4xl">Ready to get started?</h2>
          <p className="mx-auto max-w-2xl text-base text-[color:var(--muted-ink)]">
            Begin your intake now. You'll select your service tier and any add-ons during the process. All pricing is transparent with no
            surprises.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button asChild size="lg">
              <Link href="/create-account">Start intake</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/how-it-works">How it works</Link>
            </Button>
          </div>
        </div>
      </ScrollFade>

      <ScrollFade
        as="section"
        className="space-y-6 rounded-[28px] border border-[color:var(--border-muted)] bg-[color:var(--bg-muted)] p-8"
      >
        <h3 className="font-serif text-2xl text-[color:var(--brand)]">Questions about pricing?</h3>
        <div className="space-y-4 text-sm text-[color:var(--muted-ink)]">
          <div>
            <p className="font-semibold text-[color:var(--brand)]">Can I upgrade my tier later?</p>
            <p className="mt-1">
              Yes. Contact us anytime if you need additional support or services. We'll adjust your invoice for the difference.
            </p>
          </div>
          <div>
            <p className="font-semibold text-[color:var(--brand)]">What if I don't need all the features?</p>
            <p className="mt-1">
              Choose Basic for self-serve support. It's designed for tech-savvy executors handling simple estates who are comfortable with
              minimal guidance.
            </p>
          </div>
          <div>
            <p className="font-semibold text-[color:var(--brand)]">Are court fees included?</p>
            <p className="mt-1">
              No. Our fees cover document preparation and support only. BC probate fees are separate and paid directly to the court based on
              estate value.
            </p>
          </div>
        </div>
        <Link
          href="/faqs"
          className="inline-flex items-center gap-2 text-sm font-semibold text-[color:var(--brand)] hover:text-[color:var(--accent-dark)]"
        >
          View all FAQs
          <ArrowRight className="h-4 w-4" />
        </Link>
      </ScrollFade>
    </div>
  );
}

function renderFeatureValue(value: boolean | string): React.ReactNode {
  if (typeof value === "boolean") {
    return value ? (
      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#f0f3f7] text-[color:var(--brand)]">
        <Check className="h-4 w-4" aria-hidden />
      </span>
    ) : (
      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#f0f3f7] text-[color:var(--slate)]">
        <X className="h-4 w-4" aria-hidden />
      </span>
    );
  }
  return <span className="text-[color:var(--brand)]">{value}</span>;
}
