/* eslint-disable react/no-unescaped-entities */
import type { Metadata } from "next";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { InfoCard } from "@/components/info/InfoCard";

export const metadata: Metadata = {
  title: "BC Probate Guides | In-Depth Executor Resources",
  description: "Comprehensive guides for BC executors. Learn about probate, forms, fees, timelines, executor duties, and estate administration.",
};

const guides = [
  {
    title: "The Complete BC Probate Guide",
    description: "Everything you need to know about probate in British Columbia, from start to finish. Our most comprehensive resource.",
    href: "/info/guides/bc-probate-guide",
    eyebrow: "Start here",
  },
  {
    title: "What is Probate?",
    description: "A clear explanation of what probate means, why it exists, and what the court actually does.",
    href: "/info/guides/what-is-probate",
  },
  {
    title: "When Do You Need Probate?",
    description: "Not every estate needs probate. Learn when it's required and when you might skip it.",
    href: "/info/guides/when-do-you-need-probate",
  },
  {
    title: "BC Probate Timeline",
    description: "How long each phase takes, from gathering documents to closing the estate.",
    href: "/info/guides/probate-timeline",
  },
  {
    title: "Probate Fees and Costs",
    description: "What probate actually costs in BC. Filing fees, probate fees, and other expenses explained.",
    href: "/info/guides/probate-fees-costs",
  },
  {
    title: "Grant of Probate vs Administration",
    description: "The different types of grants and when each one applies.",
    href: "/info/guides/grant-types",
  },
  {
    title: "BC Probate Forms Explained",
    description: "Every P-form broken down. Which ones you need and how to complete them.",
    href: "/info/guides/bc-probate-forms",
  },
  {
    title: "Executor Duties in BC",
    description: "Your legal responsibilities as an executor and how to fulfill them properly.",
    href: "/info/guides/executor-duties",
  },
  {
    title: "Probate Without a Will",
    description: "What happens when someone dies intestate. BC's rules for distributing the estate.",
    href: "/info/guides/probate-without-will",
  },
  {
    title: "After the Grant",
    description: "Post-grant administration: collecting assets, paying debts, taxes, and distribution.",
    href: "/info/guides/after-the-grant",
  },
];

export default function GuidesPage() {
  return (
    <div className="space-y-12 pb-20">
      <header className="space-y-4">
        <Badge variant="outline">Guides</Badge>
        <h1 className="font-serif text-4xl text-[color:var(--brand)] sm:text-5xl">
          BC Probate Guides
        </h1>
        <p className="max-w-3xl text-lg text-[color:var(--muted-ink)]">
          In-depth guides covering every aspect of probate in British Columbia. 
          Start with the complete guide, then dive into specific topics.
        </p>
      </header>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {guides.map((guide) => (
          <InfoCard key={guide.href} {...guide} />
        ))}
      </div>

      <section className="rounded-3xl bg-[color:var(--bg-muted)] p-8 text-center">
        <h2 className="font-serif text-2xl text-[color:var(--brand)]">
          Want someone to handle the paperwork?
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-[color:var(--muted-ink)]">
          ProbatePath prepares all your BC probate forms for a fixed $2,500 fee.
        </p>
        <Link
          href="/create-account"
          className="mt-6 inline-block rounded-full bg-[color:var(--brand)] px-6 py-3 font-semibold text-white hover:bg-[color:var(--accent-dark)]"
        >
          Start intake
        </Link>
      </section>
    </div>
  );
}
