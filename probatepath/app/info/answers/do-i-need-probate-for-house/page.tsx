/* eslint-disable react/no-unescaped-entities */
import type { Metadata } from "next";
import Link from "next/link";
import { InfoPageLayout } from "@/components/info/InfoPageLayout";
import { FAQSection } from "@/components/info/FAQSection";

export const metadata: Metadata = {
  title: "Do I Need Probate for a House in BC? | Quick Answer",
  description: "In BC, you usually need probate to transfer a house if it was in the deceased's name alone. Joint tenancy is the main exception.",
};

const faqs = [
  {
    question: "How do I know if the house was joint tenancy?",
    answer: "Check the property title at the Land Title Office. It will show the ownership type. You can also check the original transfer documents from when the property was purchased."
  },
  {
    question: "Can I sell the house without probate?",
    answer: "No. To sell, you need to transfer title to your name first (as executor), which requires the grant. The buyer's lawyer will require proof of your authority."
  },
];

export default function ProbateForHousePage() {
  return (
    <InfoPageLayout
      breadcrumbs={[
        { label: "Info Center", href: "/info" },
        { label: "Quick Answers", href: "/info/answers" },
        { label: "Probate for a House" },
      ]}
      eyebrow="Quick Answer"
      title="Do I Need Probate for a House in BC?"
      description="When probate is required for BC real estate."
      lastUpdated="January 2026"
      readingTime="3 min"
      toc={[]}
    >
      <p className="text-lg leading-relaxed">
        <strong>Usually yes.</strong> If the house was in the deceased's name alone, you need 
        probate to transfer or sell it. The Land Title Office requires a grant before they'll 
        change ownership. The <strong>main exception</strong> is joint tenancy – if the property 
        was held jointly with right of survivorship, it passes automatically to the surviving owner.
      </p>

      <h2>You need probate if:</h2>
      <ul>
        <li>The house was in the deceased's name alone</li>
        <li>The house was held as "tenants in common" (deceased's share doesn't auto-transfer)</li>
      </ul>

      <h2>You don't need probate if:</h2>
      <ul>
        <li>The house was held in joint tenancy with right of survivorship</li>
        <li>You just need to file a "transmission" application at Land Title with a death certificate</li>
      </ul>

      <h2>How to check ownership type</h2>
      <ol>
        <li>Order a title search from the Land Title Office (~$15)</li>
        <li>Look for "Joint Tenants" or "Tenants in Common"</li>
        <li>If it just shows the deceased's name alone, probate is required</li>
      </ol>

      <p>
        <Link href="/info/guides/when-do-you-need-probate" className="text-[color:var(--brand)] underline">
          Read the full guide on when probate is required →
        </Link>
      </p>
      <p>
        <Link href="/info/guides/bc-probate-guide" className="text-[color:var(--brand)] underline">
          Return to the Complete BC Probate Guide →
        </Link>
      </p>

      <FAQSection faqs={faqs} />
    </InfoPageLayout>
  );
}
