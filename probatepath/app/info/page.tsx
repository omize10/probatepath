/* eslint-disable react/no-unescaped-entities */
import type { Metadata } from "next";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { InfoCard } from "@/components/info/InfoCard";
import { RegistryCard } from "@/components/info/RegistryCard";
import { BookOpen, HelpCircle, MapPin, FileText } from "lucide-react";

export const metadata: Metadata = {
  title: "Info Center | BC Probate Help for Executors",
  description: "Everything BC executors need to know about probate. Guides, quick answers, registry locations, and step-by-step instructions for handling an estate.",
};

const guides = [
  {
    title: "The Complete BC Probate Guide",
    description: "Everything you need to know about probate in British Columbia, from start to finish.",
    href: "/info/guides/bc-probate-guide",
    eyebrow: "Comprehensive guide",
  },
  {
    title: "What is Probate?",
    description: "A clear explanation of what probate means and why the court is involved.",
    href: "/info/guides/what-is-probate",
  },
  {
    title: "When Do You Need Probate?",
    description: "Not every estate needs probate. Learn when it's required and when you can skip it.",
    href: "/info/guides/when-do-you-need-probate",
  },
  {
    title: "BC Probate Forms Explained",
    description: "A breakdown of every P-form and when to use each one.",
    href: "/info/guides/bc-probate-forms",
  },
  {
    title: "Executor Duties in BC",
    description: "Your legal responsibilities as an executor.",
    href: "/info/guides/executor-duties",
  },
  {
    title: "Probate Fees and Costs",
    description: "What probate costs in BC, including court fees and common expenses.",
    href: "/info/guides/probate-fees-costs",
  },
];

const answers = [
  { title: "How long does probate take?", href: "/info/answers/how-long-does-probate-take" },
  { title: "Do I need probate for a house?", href: "/info/answers/do-i-need-probate-for-house" },
  { title: "Can I access bank accounts before probate?", href: "/info/answers/bank-accounts-before-probate" },
  { title: "What if I can't find the original will?", href: "/info/answers/what-if-no-original-will" },
  { title: "First 30 days as executor", href: "/info/answers/first-30-days-executor" },
  { title: "Probate vs. lawyer costs compared", href: "/info/answers/probate-vs-lawyer-costs" },
];

const registries = [
  { name: "Vancouver", address: "800 Smithe St", phone: "604-660-2853", hours: "Mon-Fri 9-4", href: "/info/registries/vancouver" },
  { name: "Victoria", address: "850 Burdett Ave", phone: "250-356-1478", hours: "Mon-Fri 9-4", href: "/info/registries/victoria" },
  { name: "Surrey", address: "14340 57 Ave", phone: "604-572-2200", hours: "Mon-Fri 9-4", href: "/info/registries/surrey" },
  { name: "Kelowna", address: "1355 Water St", phone: "250-470-6900", hours: "Mon-Fri 9-4", href: "/info/registries/kelowna" },
];

export default function InfoCenterPage() {
  return (
    <div className="space-y-20 pb-20">
      {/* Hero */}
      <header className="space-y-6">
        <Badge variant="outline">Info Center</Badge>
        <h1 className="font-serif text-4xl text-[color:var(--brand)] sm:text-5xl lg:text-6xl">
          BC Probate Help
        </h1>
        <p className="max-w-3xl text-lg text-[color:var(--muted-ink)]">
          Everything you need to understand probate in British Columbia. Clear guides, quick answers, 
          and practical information for executors handling an estate.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/info/guides/bc-probate-guide"
            className="rounded-full bg-[color:var(--brand)] px-6 py-3 font-semibold text-white hover:bg-[color:var(--accent-dark)]"
          >
            Read the full guide
          </Link>
          <Link
            href="/create-account"
            className="rounded-full border border-[color:var(--border-muted)] bg-white/60 px-6 py-3 font-semibold !text-[#0a0d12] hover:bg-white/80 focus-visible:outline-offset-2"
          >
            Get started with ProbateDesk
          </Link>
        </div>
      </header>

      {/* Stats */}
      <section className="grid gap-4 rounded-3xl border border-[color:var(--border-muted)] bg-[color:var(--bg-surface)] p-6 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { icon: BookOpen, value: "9", label: "In-depth guides" },
          { icon: HelpCircle, value: "6", label: "Quick answers" },
          { icon: MapPin, value: "4", label: "Registry guides" },
          { icon: FileText, value: "25+", label: "Forms covered" },
        ].map((stat) => (
          <div key={stat.label} className="flex items-center gap-4">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f0f3f7]">
              <stat.icon className="h-5 w-5 text-[color:var(--brand)]" />
            </span>
            <div>
              <p className="text-2xl font-semibold text-[color:var(--brand)]">{stat.value}</p>
              <p className="text-sm text-[color:var(--muted-ink)]">{stat.label}</p>
            </div>
          </div>
        ))}
      </section>

      {/* Guides */}
      <section className="space-y-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[color:var(--slate)]">Guides</p>
          <h2 className="font-serif text-3xl text-[color:var(--brand)]">In-depth probate guides</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {guides.map((guide) => (
            <InfoCard key={guide.href} {...guide} />
          ))}
        </div>
      </section>

      {/* Quick Answers */}
      <section className="space-y-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[color:var(--slate)]">Quick answers</p>
          <h2 className="font-serif text-3xl text-[color:var(--brand)]">Common questions</h2>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {answers.map((answer) => (
            <Link
              key={answer.href}
              href={answer.href}
              className="flex items-center justify-between rounded-xl border border-[color:var(--border-muted)] bg-[color:var(--bg-surface)] p-4 transition hover:border-[color:var(--brand)]"
            >
              <span className="font-medium text-[color:var(--brand)]">{answer.title}</span>
              <span className="text-[color:var(--slate)]">→</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Registries */}
      <section className="space-y-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[color:var(--slate)]">Locations</p>
          <h2 className="font-serif text-3xl text-[color:var(--brand)]">BC Probate Registries</h2>
          <p className="mt-2 text-[color:var(--muted-ink)]">
            Find the registry closest to where the deceased lived.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {registries.map((registry) => (
            <RegistryCard key={registry.href} {...registry} />
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="rounded-3xl bg-[color:var(--brand)] p-8 text-center text-white sm:p-12">
        <h2 className="font-serif text-3xl text-white sm:text-4xl">Ready to get started?</h2>
        <p className="mx-auto mt-4 max-w-2xl text-white/80">
          ProbateDesk prepares all your BC probate forms starting at $799, with flexible service tiers.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link
            href="/create-account"
            className="rounded-full bg-white px-6 py-3 font-semibold !text-[#0a0d12] hover:bg-white/90"
          >
            Start intake
          </Link>
          <Link
            href="/how-it-works"
            className="rounded-full border border-white/70 px-6 py-3 font-semibold text-white hover:bg-white/10 focus-visible:outline-offset-2 focus-visible:outline-white/70"
          >
            See how it works
          </Link>
        </div>
      </section>
    </div>
  );
}
