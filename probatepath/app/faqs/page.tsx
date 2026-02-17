import type { Metadata } from "next";
import { Badge } from "@/components/ui/badge";
import { FAQAccordion } from "@/components/faq-accordion";
import { getPageContent } from "@/lib/page-content";
import { PuckPage } from "@/lib/puck/render-page";

export const metadata: Metadata = {
  title: "Probate FAQs",
  description: "Answers to the most common questions executors ask before using ProbateDesk.",
};

const faqs = [
  {
    question: "Who is ProbateDesk built for?",
    answer:
      "Executors of straightforward BC estates with a valid will, Canadian assets, and no active disputes.",
  },
  {
    question: "How much does ProbateDesk cost?",
    answer:
      "We offer three service tiers: Basic ($799), Standard ($1,499), and Premium ($2,499). Choose based on the level of support you need. Most executors choose Standard for the peace of mind that comes with human document review and phone support.",
  },
  {
    question: "What's the difference between the tiers?",
    answer:
      "Basic includes automated form generation and email support. Standard adds human document review, phone support, free notarization in Vancouver, and one requisition response. Premium includes everything in Standard plus priority same-day support, a dedicated coordinator, and unlimited requisition assistance. Visit our pricing page for a complete comparison.",
  },
  {
    question: "Can I upgrade my tier later?",
    answer:
      "Yes. If you start with Basic or Standard and need additional support, contact us and we'll adjust your service level. You'll only pay the difference.",
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
      "Standard and Basic tiers: 5-7 business days. Premium tier: 3-5 business days priority. Add Rush Processing ($299) to any tier for 48-hour delivery.",
  },
  {
    question: "What if I need legal advice?",
    answer:
      "ProbateDesk provides document preparation and general information. For legal advice, contact independent counsel.",
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
    question: "What's not included in the service fees?",
    answer: "Court filing fees, postage/courier for notices, and BC probate fees are paid separately directly to the court based on estate value. These government fees are not included in our service fees.",
  },
  {
    question: "Can multiple executors use ProbateDesk?",
    answer: "V1 supports a single executor. Multi-executor support is planned.",
  },
];

export default async function FAQsPage() {
  const puckData = await getPageContent("faqs");
  if (puckData) return <PuckPage data={puckData} />;

  return (
    <div className="space-y-10 pb-16">
      <header className="space-y-4 text-center">
        <Badge variant="outline">
          FAQs
        </Badge>
        <h1 className="font-serif text-4xl text-[color:var(--brand)] sm:text-5xl">Probate questions, answered plainly</h1>
        <p className="mx-auto max-w-3xl text-base text-[#333333]">
          If you don’t see your question below, email hello@probatedesk.com and we’ll respond within one business day.
        </p>
      </header>

      <FAQAccordion items={faqs} />
    </div>
  );
}
