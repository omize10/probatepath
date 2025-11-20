'use client';

import Link from "next/link";
import { PortalShell } from "@/components/portal/PortalShell";

const faqs = [
  {
    question: "What does ProbatePath provide?",
    answer: "Document preparation, filing-ready checklists, and BC-focused process guidance. Executors remain self-represented and responsible for filing fees.",
  },
  {
    question: "Where is my data stored?",
    answer: "Intake answers and documents stay on this device via localStorage until you choose to export them.",
  },
  {
    question: "Need to talk to someone?",
    answer: "Email hello@probatepath.ca for document clarification. We respond within one business day.",
  },
];

export default function HelpPage() {
  return (
    <PortalShell title="Help & contact" description="Find fast answers and get in touch with the ProbatePath team.">
      <div className="grid gap-6 lg:grid-cols-[0.6fr_0.4fr]">
        <div className="space-y-4">
          {faqs.map((faq) => (
            <div key={faq.question} className="portal-card space-y-3 p-6">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[color:var(--ink-muted)]">FAQ</p>
              <p className="text-lg font-semibold text-[color:var(--ink)]">{faq.question}</p>
              <p className="text-sm text-[color:var(--ink-muted)]">{faq.answer}</p>
            </div>
          ))}
        </div>
        <div className="space-y-4">
          <div className="portal-card space-y-4 p-6">
            <p className="text-sm uppercase tracking-[0.3em] text-[color:var(--ink-muted)]">Contact us</p>
            <p className="text-2xl font-serif text-[color:var(--ink)]">Need a human?</p>
            <p className="text-sm text-[color:var(--ink-muted)]">Email us for document prep questions, timeline updates, or portal help.</p>
            <Link href="mailto:hello@probatepath.ca" className="text-lg font-semibold text-[color:var(--brand-navy)]">
              hello@probatepath.ca
            </Link>
            <p className="text-xs text-[color:var(--ink-muted)]">
              We provide document preparation and general information only. We do not provide legal advice or representation.
            </p>
          </div>
        </div>
      </div>
    </PortalShell>
  );
}
