"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { FAQAccordion } from "@/components/faq-accordion";
import type { ComponentConfig } from "@puckeditor/core";

export type FAQSectionProps = {
  eyebrow: string;
  headline: string;
  description: string;
  items: string; // JSON string of {question, answer}[]
  showViewAll: boolean;
  viewAllLink: string;
  viewAllText: string;
};

export function FAQSection({
  eyebrow,
  headline,
  description,
  items,
  showViewAll,
  viewAllLink,
  viewAllText,
}: FAQSectionProps) {
  let parsed: { question: string; answer: string }[] = [];
  try {
    parsed = JSON.parse(items);
  } catch {
    parsed = [];
  }

  return (
    <section className="space-y-6">
      <div className="space-y-3 text-center">
        {eyebrow && (
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[color:var(--slate)]">{eyebrow}</p>
        )}
        <h2 className="font-serif text-3xl text-[color:var(--brand)]">{headline}</h2>
        {description && (
          <p className="mx-auto max-w-3xl text-base text-[color:var(--muted-ink)]">{description}</p>
        )}
      </div>
      <FAQAccordion items={parsed} />
      {showViewAll && (
        <div className="text-center">
          <Link
            href={viewAllLink}
            className="inline-flex items-center gap-2 text-sm font-semibold text-[color:var(--brand)] hover:text-[color:var(--accent-dark)]"
          >
            {viewAllText}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      )}
    </section>
  );
}

export const faqSectionConfig: ComponentConfig<FAQSectionProps> = {
  label: "FAQ Section",
  fields: {
    eyebrow: { type: "text", label: "Eyebrow Text" },
    headline: { type: "text", label: "Headline" },
    description: { type: "textarea", label: "Description" },
    items: { type: "textarea", label: "FAQ Items (JSON array of {question, answer})" },
    showViewAll: { type: "radio", label: "Show View All Link", options: [{ label: "Yes", value: true }, { label: "No", value: false }] },
    viewAllLink: { type: "text", label: "View All Link" },
    viewAllText: { type: "text", label: "View All Text" },
  },
  defaultProps: {
    eyebrow: "Questions",
    headline: "Frequently asked questions",
    description: "",
    items: JSON.stringify([
      { question: "Who is ProbateDesk for?", answer: "Executors handling straightforward BC estates with a valid will, Canadian assets, and no ongoing disputes." },
      { question: "How quickly will documents arrive?", answer: "Our target is 3 days after intake completion. Complex estates may take longer." },
    ]),
    showViewAll: true,
    viewAllLink: "/faqs",
    viewAllText: "View all FAQs",
  },
  render: (props) => <FAQSection {...props} />,
};
