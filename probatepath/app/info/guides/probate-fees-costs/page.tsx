/* eslint-disable react/no-unescaped-entities */
import type { Metadata } from "next";
import Link from "next/link";
import { InfoPageLayout } from "@/components/info/InfoPageLayout";
import { FAQSection } from "@/components/info/FAQSection";
import { articleSchema } from "@/lib/info/schema";

export const metadata: Metadata = {
  title: "BC Probate Fees and Costs 2025 | Complete Breakdown",
  description: "BC probate costs include $200 filing fee plus 1.4% on estate value over $50,000. See the full breakdown of court fees, professional costs, and other expenses.",
  keywords: ["BC probate fees", "probate cost BC", "estate administration tax BC", "probate fees calculator"],
};

const toc = [
  { id: "summary", title: "Cost summary", level: 2 },
  { id: "court-fees", title: "Court filing fee", level: 2 },
  { id: "probate-fees", title: "Probate fees", level: 2 },
  { id: "examples", title: "Example calculations", level: 2 },
  { id: "other-costs", title: "Other costs", level: 2 },
  { id: "professional-help", title: "Professional help costs", level: 2 },
  { id: "reduce-costs", title: "Reducing probate costs", level: 2 },
  { id: "faq", title: "FAQ", level: 2 },
];

const faqs = [
  {
    question: "Who pays the probate fees?",
    answer: "Probate fees are paid from the estate, not from the executor's personal funds. However, the executor often pays upfront and reimburses themselves from estate assets once they're accessible."
  },
  {
    question: "Are probate fees tax deductible?",
    answer: "Probate fees are an estate administration expense and can be claimed on the estate's tax return, reducing taxes owed by the estate."
  },
  {
    question: "What if I can't afford the fees upfront?",
    answer: "Some executors use personal funds temporarily. Others arrange with beneficiaries to contribute. In some cases, banks will release small amounts for estate administration costs before probate is complete."
  },
];

const schema = articleSchema({
  title: "BC Probate Fees and Costs 2025",
  description: "Complete breakdown of probate costs in British Columbia",
  datePublished: "2025-01-01",
  dateModified: "2025-12-13",
  url: "https://probatepath.ca/info/guides/probate-fees-costs",
});

export default function ProbateFeesCostsPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />

      <InfoPageLayout
        breadcrumbs={[
          { label: "Info Center", href: "/info" },
          { label: "Guides", href: "/info/guides" },
          { label: "Probate Fees and Costs" },
        ]}
        eyebrow="Guide"
        title="BC Probate Fees and Costs"
        description="A complete breakdown of what probate costs in British Columbia, including court fees, professional help, and other common expenses."
        lastUpdated="December 2025"
        readingTime="9 min"
        toc={toc}
      >
        <h2 id="summary" className="scroll-mt-24">Cost summary</h2>

        <p className="text-lg leading-relaxed">
          BC probate costs include a <strong>$200 court filing fee</strong> plus <strong>probate fees 
          of approximately 1.4%</strong> on estate value over $50,000. For a $500,000 estate, expect 
          about <strong>$6,650 in court costs</strong> alone, plus other expenses like commissioning 
          fees and professional help if used.
        </p>

        <h2 id="court-fees" className="scroll-mt-24">Court filing fee</h2>

        <p>
          Every probate application requires a <strong>$200 filing fee</strong> paid when you 
          submit your application to the registry. This is the same regardless of estate size.
        </p>

        <h2 id="probate-fees" className="scroll-mt-24">Probate fees (estate administration tax)</h2>

        <p>
          BC charges probate fees based on the gross value of the estate (assets before debts). 
          The fee structure is:
        </p>

        <div className="overflow-x-auto my-8">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[color:var(--border-muted)]">
                <th className="py-3 text-left font-semibold text-[color:var(--brand)]">Estate Value</th>
                <th className="py-3 text-left font-semibold text-[color:var(--brand)]">Fee Rate</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-[color:var(--border-muted)]">
                <td className="py-3">First $25,000</td>
                <td className="py-3">No fee</td>
              </tr>
              <tr className="border-b border-[color:var(--border-muted)]">
                <td className="py-3">$25,001 to $50,000</td>
                <td className="py-3">$6 per $1,000 (0.6%)</td>
              </tr>
              <tr>
                <td className="py-3">Over $50,000</td>
                <td className="py-3">$14 per $1,000 (1.4%)</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="rounded-2xl border border-[color:var(--border-muted)] bg-[color:var(--bg-muted)] p-6 my-8">
          <p className="font-semibold text-[color:var(--brand)]">What counts as "estate value"?</p>
          <p className="mt-2 text-[color:var(--muted-ink)]">
            Gross value of assets that pass through probate. This includes real estate, bank 
            accounts, investments, and vehicles in the deceased's name alone. It does NOT include 
            joint assets, accounts with beneficiaries, or life insurance with beneficiaries.
          </p>
        </div>

        <h2 id="examples" className="scroll-mt-24">Example calculations</h2>

        <div className="space-y-6 my-8">
          <div className="rounded-2xl border border-[color:var(--border-muted)] bg-[color:var(--bg-surface)] p-6">
            <p className="font-semibold text-[color:var(--brand)]">Example 1: $100,000 estate</p>
            <ul className="mt-3 space-y-1 text-[color:var(--muted-ink)]">
              <li>First $25,000: $0</li>
              <li>Next $25,000 (at 0.6%): $150</li>
              <li>Remaining $50,000 (at 1.4%): $700</li>
              <li>Probate fees: <strong>$850</strong></li>
              <li>Filing fee: $200</li>
              <li><strong>Total court costs: $1,050</strong></li>
            </ul>
          </div>

          <div className="rounded-2xl border border-[color:var(--border-muted)] bg-[color:var(--bg-surface)] p-6">
            <p className="font-semibold text-[color:var(--brand)]">Example 2: $500,000 estate</p>
            <ul className="mt-3 space-y-1 text-[color:var(--muted-ink)]">
              <li>First $25,000: $0</li>
              <li>Next $25,000 (at 0.6%): $150</li>
              <li>Remaining $450,000 (at 1.4%): $6,300</li>
              <li>Probate fees: <strong>$6,450</strong></li>
              <li>Filing fee: $200</li>
              <li><strong>Total court costs: $6,650</strong></li>
            </ul>
          </div>

          <div className="rounded-2xl border border-[color:var(--border-muted)] bg-[color:var(--bg-surface)] p-6">
            <p className="font-semibold text-[color:var(--brand)]">Example 3: $1,000,000 estate</p>
            <ul className="mt-3 space-y-1 text-[color:var(--muted-ink)]">
              <li>First $25,000: $0</li>
              <li>Next $25,000 (at 0.6%): $150</li>
              <li>Remaining $950,000 (at 1.4%): $13,300</li>
              <li>Probate fees: <strong>$13,450</strong></li>
              <li>Filing fee: $200</li>
              <li><strong>Total court costs: $13,650</strong></li>
            </ul>
          </div>
        </div>

        <h2 id="other-costs" className="scroll-mt-24">Other costs to expect</h2>

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
                <td className="py-3">Wills notice search</td>
                <td className="py-3">~$20</td>
              </tr>
              <tr className="border-b border-[color:var(--border-muted)]">
                <td className="py-3">Certified copies of grant</td>
                <td className="py-3">$40 each</td>
              </tr>
              <tr className="border-b border-[color:var(--border-muted)]">
                <td className="py-3">Death certificates</td>
                <td className="py-3">$27 each</td>
              </tr>
              <tr className="border-b border-[color:var(--border-muted)]">
                <td className="py-3">Registered mail for notices</td>
                <td className="py-3">$15-$25 per notice</td>
              </tr>
              <tr>
                <td className="py-3">Land title searches/transfers</td>
                <td className="py-3">$50-$200+</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h2 id="professional-help" className="scroll-mt-24">Professional help costs</h2>

        <div className="overflow-x-auto my-8">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[color:var(--border-muted)]">
                <th className="py-3 text-left font-semibold text-[color:var(--brand)]">Option</th>
                <th className="py-3 text-left font-semibold text-[color:var(--brand)]">Cost Range</th>
                <th className="py-3 text-left font-semibold text-[color:var(--brand)]">What You Get</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-[color:var(--border-muted)]">
                <td className="py-3">DIY (no help)</td>
                <td className="py-3">$0</td>
                <td className="py-3">You do everything yourself</td>
              </tr>
              <tr className="border-b border-[color:var(--border-muted)]">
                <td className="py-3 font-medium">Probate Desk</td>
                <td className="py-3">$799 - $2,499</td>
                <td className="py-3">All forms prepared, guidance throughout (tier-based)</td>
              </tr>
              <tr className="border-b border-[color:var(--border-muted)]">
                <td className="py-3">Notary</td>
                <td className="py-3">$1,500 - $3,500</td>
                <td className="py-3">Form preparation (limited scope)</td>
              </tr>
              <tr>
                <td className="py-3">Lawyer (full service)</td>
                <td className="py-3">$3,000 - $15,000+</td>
                <td className="py-3">Full legal representation</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h2 id="reduce-costs" className="scroll-mt-24">Ways to reduce probate costs</h2>

        <p>The only way to reduce probate fees is to reduce the estate value that goes through probate:</p>

        <ul>
          <li><strong>Joint ownership:</strong> Assets held jointly pass outside probate</li>
          <li><strong>Beneficiary designations:</strong> RRSPs, TFSAs, life insurance with named beneficiaries avoid probate</li>
          <li><strong>Multiple wills:</strong> Some use separate wills for different asset types (complex, needs legal advice)</li>
          <li><strong>Gifting:</strong> Assets given away before death aren't in the estate (tax implications)</li>
        </ul>

        <div className="rounded-2xl border-l-4 border-[color:var(--warning)] bg-[color:var(--bg-muted)] p-5 my-6">
          <p className="font-semibold text-[color:var(--brand)]">Warning</p>
          <p className="mt-1 text-[color:var(--muted-ink)]">
            Strategies to reduce probate fees can have unintended consequences: tax issues, 
            family disputes, loss of control over assets. Get professional advice before 
            making major changes to asset ownership.
          </p>
        </div>

        <p>
          <Link href="/info/guides/bc-probate-guide" className="text-[color:var(--brand)] underline">
            Return to the Complete BC Probate Guide →
          </Link>
        </p>

        <FAQSection faqs={faqs} />
      </InfoPageLayout>
    </>
  );
}
