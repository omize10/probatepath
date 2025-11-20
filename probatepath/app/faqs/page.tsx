import type { Metadata } from "next";
import { Badge } from "@/components/ui/badge";
import { FAQAccordion } from "@/components/faq-accordion";

export const metadata: Metadata = {
  title: "Probate FAQs",
  description: "Answers to the most common questions executors ask before using ProbatePath.",
};

const faqs = [
  {
    question: "Who is ProbatePath built for?",
    answer:
      "Executors of straightforward BC estates with a valid will, Canadian assets, and no active disputes.",
  },
  {
    question: "Do I still need to go to court?",
    answer: "You submit the application yourself. We prepare forms and instructions so your filing is organised.",
  },
  {
    question: "How secure is my information?",
    answer:
      "Intake responses and documents are encrypted in transit and at rest, hosted in Canada, and never sold.",
  },
  {
    question: "How quickly will I receive documents?",
    answer:
      "Most packages are ready within 24 hours after intake completion. That’s a target, not a guarantee—timelines can vary.",
  },
  {
    question: "What if I need legal advice?",
    answer:
      "ProbatePath provides document preparation and general information. For legal advice, contact independent counsel.",
  },
  {
    question: "Is my data stored in Canada?",
    answer: "Yes—Canadian cloud infrastructure.",
  },
  {
    question: "How long does the overall process take?",
    answer:
      "Intake takes ~15–25 minutes. Wills Notice search ~20 business days. Court processing varies by registry (weeks–months).",
  },
  {
    question: "What’s included in the fixed fee?",
    answer:
      "Intake review for completeness, document assembly, filing checklist, and cover letter.",
  },
  {
    question: "What’s not included?",
    answer: "Court fees, postage/courier, notarisation/commissioning, complex-estate extras.",
  },
  {
    question: "Can multiple executors use ProbatePath?",
    answer: "V1 supports a single executor. Multi-executor support is planned.",
  },
];

export default function FAQsPage() {
  return (
    <div className="space-y-10 pb-16">
      <header className="space-y-4 text-center">
        <Badge variant="outline">
          FAQs
        </Badge>
        <h1 className="font-serif text-4xl text-[color:var(--brand)] sm:text-5xl">Probate questions, answered plainly</h1>
        <p className="mx-auto max-w-3xl text-base text-[#333333]">
          If you don’t see your question below, email hello@probatepath.ca and we’ll respond within one business day.
        </p>
      </header>

      <FAQAccordion items={faqs} />
    </div>
  );
}
