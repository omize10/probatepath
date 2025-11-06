import type { Metadata } from "next";
import { FAQAccordion, type FAQItem } from "@/components/faq-accordion";
import { Section } from "@/components/section";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Frequently asked questions",
  description:
    "Find answers about ProbatePath eligibility, timelines, what’s included in the fixed fee, and how we protect your information.",
};

const faqs: FAQItem[] = [
  {
    question: "Who is ProbatePath built for?",
    answer:
      "Executors of straightforward British Columbia estates with a valid will, Canadian assets, and no active disputes. If something falls outside this scope, we discuss options before intake begins.",
  },
  {
    question: "What’s included in the fixed fee?",
    answer:
      "Scope confirmation, guided intake, document assembly, personalised filing instructions, a refinement round, and secure Canadian-hosted delivery for twelve months.",
  },
  {
    question: "How quickly will I receive my documents?",
    answer:
      "Most packages are delivered within 24 hours of completing intake. If timing may differ, we let you know before drafting starts.",
  },
  {
    question: "Do you help with beneficiary notices?",
    answer:
      "Yes. We generate notices, provide mailing guidance, and outline how to handle beneficiaries who live outside British Columbia.",
  },
  {
    question: "Can multiple executors work together in ProbatePath?",
    answer:
      "Absolutely. Intake captures each executor’s information so documents and instructions reflect shared responsibilities.",
  },
  {
    question: "How secure is the intake and document portal?",
    answer:
      "All data stays in Canada, encrypted in transit and at rest. Access is limited to the small team preparing your package, and you can request deletion at any time.",
  },
  {
    question: "Does ProbatePath file documents on my behalf?",
    answer:
      "You remain the filing executor. We prepare a detailed courthouse checklist, signing guidance, and remain reachable for questions throughout filing.",
  },
  {
    question: "What if the estate becomes complex or contested?",
    answer:
      "We pause the fixed-fee engagement and recommend speaking with independent legal counsel who can represent you. Your documents remain yours to share as needed.",
  },
  {
    question: "Are refunds available if I change my mind?",
    answer:
      "Fees paid before drafting are refundable. Once drafting begins, we complete the scope outlined at intake. We confirm readiness before that step so there are no surprises.",
  },
  {
    question: "How can I get help during intake?",
    answer:
      "Reply to any ProbatePath email or write to hello@probatepath.ca. Our specialists respond within one business day, often much sooner.",
  },
];

export default function FAQsPage() {
  return (
    <div className="space-y-16 pb-16">
      <header className="space-y-6">
        <Badge variant="outline">FAQs</Badge>
        <h1 className="font-serif text-4xl text-white sm:text-5xl">Frequently asked questions</h1>
        <p className="max-w-3xl text-base text-slate-300">
          ProbatePath exists to keep probate predictable. Explore common questions about eligibility, timelines, support, and how your information is protected.
        </p>
      </header>

      <Section>
        <FAQAccordion items={faqs} />
      </Section>
    </div>
  );
}
