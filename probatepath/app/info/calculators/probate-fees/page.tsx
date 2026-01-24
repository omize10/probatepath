/* eslint-disable react/no-unescaped-entities */
import type { Metadata } from "next";
import Link from "next/link";
import { InfoPageLayout } from "@/components/info/InfoPageLayout";
import { ProbateFeeCalculator } from "@/components/info/ProbateFeeCalculator";
import { FAQSection } from "@/components/info/FAQSection";

export const metadata: Metadata = {
  title: "BC Probate Fee Calculator 2026 | Estimate Your Court Costs",
  description: "Free BC probate fee calculator. Enter your estate value and instantly see the court filing fees, probate fees by bracket, and total costs for probate in British Columbia.",
  keywords: [
    "BC probate fee calculator",
    "probate fees calculator BC",
    "BC probate cost calculator",
    "estate administration tax calculator BC",
    "probate court fees BC",
    "British Columbia probate fees",
    "how much does probate cost in BC",
    "BC estate probate calculator",
    "probate fees British Columbia 2026",
    "calculate probate fees BC",
  ],
  openGraph: {
    title: "BC Probate Fee Calculator 2026 | Free Instant Estimate",
    description: "Enter your estate value and instantly calculate BC probate court fees. Includes filing fee + probate fee breakdown by bracket.",
    url: "https://probatedesk.ca/info/calculators/probate-fees",
    type: "website",
  },
};

const toc = [
  { id: "calculator", title: "Fee calculator", level: 2 },
  { id: "how-fees-work", title: "How BC probate fees work", level: 2 },
  { id: "fee-brackets", title: "Fee brackets", level: 2 },
  { id: "what-counts", title: "What counts as estate value", level: 2 },
  { id: "other-costs", title: "Other costs to plan for", level: 2 },
  { id: "faq", title: "FAQ", level: 2 },
];

const faqs = [
  {
    question: "How are BC probate fees calculated?",
    answer: "BC probate fees are calculated on the gross estate value (assets before debts) that passes through probate. The first $25,000 is free, the next $25,000 is charged at $6 per $1,000 (0.6%), and everything over $50,000 is charged at $14 per $1,000 (1.4%). There is also a flat $200 court filing fee.",
  },
  {
    question: "Do I pay probate fees on the full estate value?",
    answer: "No. You only pay on assets that actually go through probate. Joint assets (like a jointly-held house), accounts with named beneficiaries (RRSPs, TFSAs, life insurance), and assets held in trust are excluded from the probate value calculation.",
  },
  {
    question: "When do I have to pay the probate fees?",
    answer: "Probate fees are paid when you file your application at the BC Supreme Court registry. The $200 filing fee is paid at submission, and the probate fees (estate administration tax) are assessed based on the estate value declared in your application.",
  },
  {
    question: "Can I pay probate fees from the estate?",
    answer: "Yes. Probate fees are a legitimate estate expense. However, you typically need to pay them upfront before the grant is issued (since you need the grant to access estate funds). Many executors pay from personal funds and reimburse themselves once estate assets are accessible.",
  },
  {
    question: "Are BC probate fees the same as estate tax?",
    answer: "BC probate fees are technically called 'estate administration tax' but they are not an income tax or estate tax. They are a court fee for the probate process. Canada does not have a separate estate tax, though the deceased's final tax return may include deemed disposition of capital assets.",
  },
  {
    question: "How can I reduce the amount I pay in probate fees?",
    answer: "The main ways are: hold assets jointly (they pass outside probate), designate beneficiaries on registered accounts and insurance, use inter vivos trusts, or gift assets during your lifetime. Each strategy has trade-offs. For significant estates, get professional advice before making changes.",
  },
  {
    question: "Is there a maximum probate fee in BC?",
    answer: "No. There is no cap on BC probate fees. The 1.4% rate applies to all estate value over $50,000 regardless of how large the estate is. A $5 million estate would pay approximately $69,500 in probate fees plus the $200 filing fee.",
  },
  {
    question: "Do all provinces charge the same probate fees?",
    answer: "No. Probate fee structures vary significantly across Canada. Ontario charges 1.5% on estate value over $50,000. Alberta has a flat fee capped at $525. BC's rates (0.6% then 1.4%) are moderate compared to other provinces.",
  },
];

const webAppSchema = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "BC Probate Fee Calculator",
  description: "Free calculator to estimate probate court costs in British Columbia based on estate value",
  url: "https://probatedesk.ca/info/calculators/probate-fees",
  applicationCategory: "FinanceApplication",
  operatingSystem: "Any",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "CAD",
  },
  author: {
    "@type": "Organization",
    name: "ProbateDesk",
    url: "https://probatedesk.ca",
  },
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((faq) => ({
    "@type": "Question",
    name: faq.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: faq.answer,
    },
  })),
};

export default function ProbateFeeCalculatorPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <InfoPageLayout
        breadcrumbs={[
          { label: "Info Center", href: "/info" },
          { label: "Calculators" },
          { label: "Probate Fee Calculator" },
        ]}
        eyebrow="Free tool"
        title="BC Probate Fee Calculator"
        description="Enter your estate value below to instantly calculate the probate court fees you'll need to pay in British Columbia. Updated for 2026."
        lastUpdated="January 2026"
        readingTime="Interactive tool"
        toc={toc}
      >
        <h2 id="calculator" className="scroll-mt-24">Calculate your probate fees</h2>

        <p>
          Enter the <strong>gross value of assets that will pass through probate</strong> to see your
          estimated court costs. The calculator applies the current BC probate fee brackets automatically.
        </p>

        <div className="my-8 not-prose">
          <ProbateFeeCalculator />
        </div>

        <h2 id="how-fees-work" className="scroll-mt-24">How BC probate fees work</h2>

        <p>
          British Columbia charges two types of court costs when you apply for a grant of probate:
        </p>

        <ol>
          <li>
            <strong>Court filing fee ($200):</strong> A flat fee paid when you submit your probate
            application to the BC Supreme Court registry. This is the same regardless of estate size.
          </li>
          <li>
            <strong>Probate fees (estate administration tax):</strong> A graduated fee based on the
            gross value of the estate. This is the larger cost for most estates and is calculated using
            the bracket system below.
          </li>
        </ol>

        <h2 id="fee-brackets" className="scroll-mt-24">BC probate fee brackets</h2>

        <p>
          Probate fees in BC use a tiered bracket system similar to income tax. Each portion of the
          estate value is taxed at its bracket rate:
        </p>

        <div className="overflow-x-auto my-8">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[color:var(--border-muted)]">
                <th className="py-3 text-left font-semibold text-[color:var(--brand)]">Estate Value Bracket</th>
                <th className="py-3 text-left font-semibold text-[color:var(--brand)]">Rate</th>
                <th className="py-3 text-left font-semibold text-[color:var(--brand)]">Per $1,000</th>
                <th className="py-3 text-left font-semibold text-[color:var(--brand)]">Max for Bracket</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-[color:var(--border-muted)]">
                <td className="py-3">First $25,000</td>
                <td className="py-3 text-green-700 font-medium">0%</td>
                <td className="py-3">$0</td>
                <td className="py-3">$0</td>
              </tr>
              <tr className="border-b border-[color:var(--border-muted)]">
                <td className="py-3">$25,001 to $50,000</td>
                <td className="py-3">0.6%</td>
                <td className="py-3">$6</td>
                <td className="py-3">$150</td>
              </tr>
              <tr>
                <td className="py-3">Over $50,000</td>
                <td className="py-3">1.4%</td>
                <td className="py-3">$14</td>
                <td className="py-3">No maximum</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h2 id="what-counts" className="scroll-mt-24">What counts as estate value for probate fees</h2>

        <p>
          Only assets that <strong>pass through probate</strong> are included in the fee calculation.
          Understanding this distinction can significantly affect your total costs:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6 not-prose">
          <div className="rounded-xl border border-red-200 bg-red-50/50 p-5">
            <p className="text-sm font-semibold text-red-900 mb-3">Included in probate value</p>
            <ul className="space-y-2 text-sm text-red-800">
              <li className="flex items-start gap-2"><span className="mt-0.5 shrink-0">&#x2022;</span> Real estate in deceased's name alone</li>
              <li className="flex items-start gap-2"><span className="mt-0.5 shrink-0">&#x2022;</span> Bank accounts (sole name, no beneficiary)</li>
              <li className="flex items-start gap-2"><span className="mt-0.5 shrink-0">&#x2022;</span> Investment/brokerage accounts (sole name)</li>
              <li className="flex items-start gap-2"><span className="mt-0.5 shrink-0">&#x2022;</span> Vehicles registered to deceased</li>
              <li className="flex items-start gap-2"><span className="mt-0.5 shrink-0">&#x2022;</span> Personal property of significant value</li>
              <li className="flex items-start gap-2"><span className="mt-0.5 shrink-0">&#x2022;</span> Business interests/shares</li>
            </ul>
          </div>
          <div className="rounded-xl border border-green-200 bg-green-50/50 p-5">
            <p className="text-sm font-semibold text-green-900 mb-3">NOT included (pass outside probate)</p>
            <ul className="space-y-2 text-sm text-green-800">
              <li className="flex items-start gap-2"><span className="mt-0.5 shrink-0">&#x2022;</span> Jointly held property (passes to survivor)</li>
              <li className="flex items-start gap-2"><span className="mt-0.5 shrink-0">&#x2022;</span> RRSPs/RRIFs/TFSAs with named beneficiary</li>
              <li className="flex items-start gap-2"><span className="mt-0.5 shrink-0">&#x2022;</span> Life insurance with named beneficiary</li>
              <li className="flex items-start gap-2"><span className="mt-0.5 shrink-0">&#x2022;</span> Pension death benefits</li>
              <li className="flex items-start gap-2"><span className="mt-0.5 shrink-0">&#x2022;</span> Assets held in a trust</li>
              <li className="flex items-start gap-2"><span className="mt-0.5 shrink-0">&#x2022;</span> CPP/OAS death benefit</li>
            </ul>
          </div>
        </div>

        <h2 id="other-costs" className="scroll-mt-24">Other costs to plan for</h2>

        <p>
          Probate fees are just one part of the total cost. Here are other common expenses executors encounter:
        </p>

        <div className="overflow-x-auto my-8">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[color:var(--border-muted)]">
                <th className="py-3 text-left font-semibold text-[color:var(--brand)]">Expense</th>
                <th className="py-3 text-left font-semibold text-[color:var(--brand)]">Typical Cost</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-[color:var(--border-muted)]">
                <td className="py-3">Commissioner/notary for affidavits</td>
                <td className="py-3">$50 - $150</td>
              </tr>
              <tr className="border-b border-[color:var(--border-muted)]">
                <td className="py-3">BC Wills Registry search (VSA 532)</td>
                <td className="py-3">~$20</td>
              </tr>
              <tr className="border-b border-[color:var(--border-muted)]">
                <td className="py-3">Certified copies of grant</td>
                <td className="py-3">$40 each</td>
              </tr>
              <tr className="border-b border-[color:var(--border-muted)]">
                <td className="py-3">Death certificates (additional copies)</td>
                <td className="py-3">$27 each</td>
              </tr>
              <tr className="border-b border-[color:var(--border-muted)]">
                <td className="py-3">Registered mail for P1 notices</td>
                <td className="py-3">$15 - $25 per beneficiary</td>
              </tr>
              <tr className="border-b border-[color:var(--border-muted)]">
                <td className="py-3">Land title search/transfer</td>
                <td className="py-3">$50 - $200+</td>
              </tr>
              <tr className="border-b border-[color:var(--border-muted)]">
                <td className="py-3">ProbateDesk document preparation</td>
                <td className="py-3">$799 - $2,499</td>
              </tr>
              <tr>
                <td className="py-3">Lawyer (full service alternative)</td>
                <td className="py-3">$3,000 - $15,000+</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="rounded-2xl border border-[color:var(--brand)]/20 bg-blue-50/30 p-5 my-6 not-prose">
          <p className="text-sm font-semibold text-[color:var(--brand)]">Save on professional costs</p>
          <p className="mt-2 text-sm text-gray-700">
            ProbateDesk prepares all your probate forms for $799-$2,499 — a fraction of the $3,000-$15,000+
            lawyers charge. We handle P1 notices, probate package assembly, and filing guidance.{" "}
            <Link href="/how-it-works" className="text-[color:var(--brand)] underline font-medium">
              Learn how it works →
            </Link>
          </p>
        </div>

        <p className="mt-8">
          <Link href="/info/guides/probate-fees-costs" className="text-[color:var(--brand)] underline">
            Read the full BC Probate Fees and Costs guide →
          </Link>
        </p>

        <FAQSection faqs={faqs} />
      </InfoPageLayout>
    </>
  );
}
