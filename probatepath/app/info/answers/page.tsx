/* eslint-disable react/no-unescaped-entities */
import type { Metadata } from "next";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Quick Answers | Common BC Probate Questions",
  description: "Direct answers to common BC probate questions. How long does it take? Do I need probate for a house? Can I access bank accounts?",
};

const answers = [
  {
    title: "How long does probate take in BC?",
    description: "Court processing is 4-8 weeks. Total process is 6-12 months.",
    href: "/info/answers/how-long-does-probate-take",
  },
  {
    title: "Do I need probate for a house in BC?",
    description: "Usually yes, if it's in the deceased's name alone.",
    href: "/info/answers/do-i-need-probate-for-house",
  },
  {
    title: "Can I access bank accounts before probate?",
    description: "Sometimes, for small amounts or joint accounts.",
    href: "/info/answers/bank-accounts-before-probate",
  },
  {
    title: "What if I can't find the original will?",
    description: "You may still be able to probate a copy, but it's harder.",
    href: "/info/answers/what-if-no-original-will",
  },
  {
    title: "First 30 days as executor",
    description: "What to do immediately after someone dies.",
    href: "/info/answers/first-30-days-executor",
  },
  {
    title: "Probate costs vs. hiring a lawyer",
    description: "Compare DIY, Probate Desk, and full legal representation.",
    href: "/info/answers/probate-vs-lawyer-costs",
  },
];

export default function AnswersPage() {
  return (
    <div className="space-y-12 pb-20">
      <header className="space-y-4">
        <Badge variant="outline">Quick Answers</Badge>
        <h1 className="font-serif text-4xl text-[color:var(--brand)] sm:text-5xl">
          Common Questions
        </h1>
        <p className="max-w-3xl text-lg text-[color:var(--muted-ink)]">
          Direct answers to frequently asked BC probate questions.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        {answers.map((answer) => (
          <Link
            key={answer.href}
            href={answer.href}
            className="group rounded-2xl border border-[color:var(--border-muted)] bg-[color:var(--bg-surface)] p-6 transition hover:border-[color:var(--brand)]"
          >
            <h2 className="text-lg font-semibold text-[color:var(--brand)] group-hover:text-[color:var(--accent-dark)]">
              {answer.title}
            </h2>
            <p className="mt-2 text-sm text-[color:var(--muted-ink)]">{answer.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
