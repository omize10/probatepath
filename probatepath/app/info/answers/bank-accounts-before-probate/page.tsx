/* eslint-disable react/no-unescaped-entities */
import type { Metadata } from "next";
import Link from "next/link";
import { InfoPageLayout } from "@/components/info/InfoPageLayout";
import { FAQSection } from "@/components/info/FAQSection";

export const metadata: Metadata = {
  title: "Can I Access Bank Accounts Before Probate? | BC Answer",
  description: "Sometimes. Joint accounts pass immediately. Some banks release small amounts without probate. Here's what to expect.",
};

const faqs = [
  {
    question: "What if I need money for funeral costs?",
    answer: "Many banks will release funds specifically for funeral costs with a death certificate and funeral home invoice, even before probate. Ask the bank about their policy."
  },
  {
    question: "Can I use the deceased's debit card?",
    answer: "No. Using the deceased's cards or accounts without authorization is potentially fraudulent, even if you're the executor. Wait for proper access."
  },
];

export default function BankAccountsBeforeProbatePage() {
  return (
    <InfoPageLayout
      breadcrumbs={[
        { label: "Info Center", href: "/info" },
        { label: "Quick Answers", href: "/info/answers" },
        { label: "Bank Accounts Before Probate" },
      ]}
      eyebrow="Quick Answer"
      title="Can I Access Bank Accounts Before Probate?"
      description="What you can and can't access before the grant arrives."
      lastUpdated="December 2025"
      readingTime="3 min"
      toc={[]}
    >
      <p className="text-lg leading-relaxed">
        <strong>Sometimes.</strong> Joint accounts pass immediately to the surviving owner. 
        Accounts under $25,000-$50,000 may be released with a notarized declaration. But 
        significant sole-owner accounts are usually frozen until you have the grant of probate.
      </p>

      <h2>What you CAN access without probate:</h2>
      <ul>
        <li><strong>Joint accounts:</strong> Pass automatically to surviving owner. Just bring a death certificate.</li>
        <li><strong>Small accounts:</strong> Many banks release amounts under their threshold ($25,000-$50,000) with a death certificate and notarized indemnity.</li>
        <li><strong>Funeral costs:</strong> Some banks release limited funds for funeral expenses with a funeral home invoice.</li>
      </ul>

      <h2>What you usually CAN'T access:</h2>
      <ul>
        <li>Sole-owner accounts over the bank's threshold</li>
        <li>Investment accounts</li>
        <li>Safety deposit boxes (though some banks allow access with a notary present)</li>
      </ul>

      <h2>What to do</h2>
      <ol>
        <li>Visit each bank with the death certificate and your ID</li>
        <li>Ask: "What's your policy for releasing funds before probate?"</li>
        <li>Ask about their specific threshold amount</li>
        <li>Complete whatever forms they require</li>
      </ol>

      <p>Every bank has different policies. It's worth asking – you might get access sooner than expected.</p>

      <p>
        <Link href="/info/guides/bc-probate-guide" className="text-[color:var(--brand)] underline">
          Return to the Complete BC Probate Guide →
        </Link>
      </p>

      <FAQSection faqs={faqs} />
    </InfoPageLayout>
  );
}
