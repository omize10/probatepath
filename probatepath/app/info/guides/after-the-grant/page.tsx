/* eslint-disable react/no-unescaped-entities */
import type { Metadata } from "next";
import Link from "next/link";
import { InfoPageLayout } from "@/components/info/InfoPageLayout";
import { FAQSection } from "@/components/info/FAQSection";
import { articleSchema } from "@/lib/info/schema";

export const metadata: Metadata = {
  title: "After the Grant | BC Estate Administration Guide",
  description: "Getting the grant of probate is not the end. Learn how to collect assets, pay debts, handle taxes, and distribute to beneficiaries in BC.",
  keywords: ["after probate", "estate administration BC", "distribute estate", "executor after grant"],
};

const toc = [
  { id: "overview", title: "Overview", level: 2 },
  { id: "collect-assets", title: "Collecting assets", level: 2 },
  { id: "pay-debts", title: "Paying debts", level: 2 },
  { id: "taxes", title: "Taxes", level: 2 },
  { id: "distribute", title: "Distribution", level: 2 },
  { id: "closing", title: "Closing the estate", level: 2 },
  { id: "timeline", title: "Typical timeline", level: 2 },
  { id: "faq", title: "FAQ", level: 2 },
];

const faqs = [
  {
    question: "How long should I wait before distributing?",
    answer: "At minimum, wait until you've identified all debts and paid known creditors. Many executors wait 6-12 months. Getting a CRA clearance certificate (which can take months) provides maximum protection but isn't always necessary for simple estates."
  },
  {
    question: "What if there's not enough money to pay all debts?",
    answer: "If the estate is insolvent, debts are paid in priority order set by law: funeral expenses, secured debts, taxes, then unsecured debts. Beneficiaries get nothing. This situation often needs legal advice."
  },
  {
    question: "Can beneficiaries demand faster distribution?",
    answer: "Beneficiaries have a right to reasonable progress, but not to reckless speed. As executor, you must protect the estate (and yourself) by ensuring debts and taxes are handled first. Document your reasoning."
  },
];

const schema = articleSchema({
  title: "After the Grant: Estate Administration in BC",
  description: "What happens after you receive the grant of probate in British Columbia",
  datePublished: "2025-01-01",
  dateModified: "2026-01-24",
  url: "https://probatedesk.com/info/guides/after-the-grant",
});

export default function AfterTheGrantPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />

      <InfoPageLayout
        breadcrumbs={[
          { label: "Info Center", href: "/info" },
          { label: "Guides", href: "/info/guides" },
          { label: "After the Grant" },
        ]}
        eyebrow="Guide"
        title="After the Grant: Estate Administration"
        description="Getting the grant of probate is just the midpoint. Here's what comes next: collecting assets, paying debts, handling taxes, and distributing to beneficiaries."
        lastUpdated="January 2026"
        readingTime="12 min"
        toc={toc}
      >
        <h2 id="overview" className="scroll-mt-24">Overview</h2>

        <p className="text-lg leading-relaxed">
          The grant gives you legal authority to act. Now you must actually <strong>collect the 
          assets, pay the debts, file taxes, and distribute to beneficiaries</strong>. This phase 
          often takes longer than getting the grant itself – typically 3-9 months more.
        </p>

        <h2 id="collect-assets" className="scroll-mt-24">Collecting assets</h2>

        <p>With grant in hand, contact each institution holding estate assets:</p>

        <h3>Bank accounts</h3>
        <ul>
          <li>Bring the certified grant and your ID to each bank</li>
          <li>Complete their estate forms</li>
          <li>Have funds transferred to the estate account or issued as cheques</li>
          <li>Close the accounts once emptied</li>
        </ul>

        <h3>Investment accounts</h3>
        <ul>
          <li>Contact each broker/advisor</li>
          <li>Decide: transfer investments to beneficiaries or liquidate for cash</li>
          <li>Consider tax implications of selling (capital gains)</li>
        </ul>

        <h3>Real estate</h3>
        <ul>
          <li>File the grant at the Land Title Office</li>
          <li>Decide: transfer to beneficiary or sell</li>
          <li>If selling, list with an agent and handle the sale</li>
          <li>Pay out any mortgage</li>
        </ul>

        <h3>Vehicles</h3>
        <ul>
          <li>Contact ICBC</li>
          <li>Transfer to beneficiary or sell</li>
        </ul>

        <h3>Other assets</h3>
        <ul>
          <li>Safety deposit boxes (bank will give you access)</li>
          <li>Life insurance (contact insurer – may not require grant if beneficiary is named)</li>
          <li>Pensions and death benefits</li>
          <li>Amounts owed to the deceased</li>
        </ul>

        <h2 id="pay-debts" className="scroll-mt-24">Paying debts</h2>

        <p><strong>Critical rule:</strong> Pay debts BEFORE distributing to beneficiaries. If you distribute first and there aren't enough assets left to pay creditors, you can be personally liable.</p>

        <h3>What to pay:</h3>
        <ul>
          <li>Funeral expenses</li>
          <li>Outstanding bills (utilities, credit cards, loans)</li>
          <li>Mortgages and secured debts</li>
          <li>Taxes owing (see below)</li>
          <li>Professional fees (lawyers, accountants, probate services)</li>
          <li>Estate administration costs (bank fees, postage, etc.)</li>
        </ul>

        <h3>What NOT to pay:</h3>
        <ul>
          <li>Debts you're not sure are valid – investigate first</li>
          <li>Claims that seem inflated or fraudulent</li>
          <li>Time-barred debts (check limitation periods)</li>
        </ul>

        <div className="rounded-2xl border-l-4 border-[color:var(--warning)] bg-[color:var(--bg-muted)] p-5 my-6">
          <p className="font-semibold text-[color:var(--brand)]">Protect yourself</p>
          <p className="mt-1 text-[color:var(--muted-ink)]">
            Keep a "holdback" – don't distribute everything immediately. Reserve funds for 
            unexpected claims, final tax adjustments, and closing costs. A typical holdback 
            is 10-20% of the estate.
          </p>
        </div>

        <h2 id="taxes" className="scroll-mt-24">Taxes</h2>

        <h3>Terminal return (T1)</h3>
        <ul>
          <li>The deceased's final personal tax return</li>
          <li>Covers January 1 to date of death</li>
          <li>Due April 30 of the following year (or 6 months after death if death was in November/December)</li>
          <li>Report all income earned up to death</li>
          <li>Can trigger deemed disposition of capital assets</li>
        </ul>

        <h3>Estate trust returns (T3)</h3>
        <ul>
          <li>If the estate earns income after death (interest, rent, dividends)</li>
          <li>Required if the estate takes more than a year to settle</li>
          <li>Consider hiring an accountant</li>
        </ul>

        <h3>CRA clearance certificate</h3>
        <ul>
          <li>Optional but recommended</li>
          <li>CRA confirms all taxes are paid</li>
          <li>Protects executor from personal liability for taxes</li>
          <li>Can take 3-6 months to receive</li>
          <li>Request using Form TX19</li>
        </ul>

        <h2 id="distribute" className="scroll-mt-24">Distribution</h2>

        <h3>Follow the will exactly</h3>
        <ul>
          <li>Specific gifts go to named recipients</li>
          <li>Residue (what's left) is divided as the will directs</li>
          <li>You cannot change the distribution, even if it seems unfair</li>
        </ul>

        <h3>Prepare distribution statements</h3>
        <ul>
          <li>Show each beneficiary what the estate received</li>
          <li>Show what was paid out for debts and expenses</li>
          <li>Show their calculated share</li>
        </ul>

        <h3>Get releases</h3>
        <ul>
          <li>Have each beneficiary sign a release acknowledging receipt</li>
          <li>The release protects you from future claims</li>
          <li>Don't distribute final amounts without releases</li>
        </ul>

        <h2 id="closing" className="scroll-mt-24">Closing the estate</h2>

        <p>Final steps:</p>

        <ul>
          <li>Make final distributions</li>
          <li>Close the estate bank account</li>
          <li>File final tax returns</li>
          <li>Collect all releases from beneficiaries</li>
          <li>Keep records for at least 7 years (CRA requirement)</li>
        </ul>

        <p>There's no formal "closing" with the court. The estate is simply done when all assets are distributed and all obligations are met.</p>

        <h2 id="timeline" className="scroll-mt-24">Typical post-grant timeline</h2>

        <div className="overflow-x-auto my-8">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[color:var(--border-muted)]">
                <th className="py-3 text-left font-semibold text-[color:var(--brand)]">Phase</th>
                <th className="py-3 text-left font-semibold text-[color:var(--brand)]">Time</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-[color:var(--border-muted)]">
                <td className="py-3">Collecting financial assets</td>
                <td className="py-3">2-8 weeks</td>
              </tr>
              <tr className="border-b border-[color:var(--border-muted)]">
                <td className="py-3">Selling real estate (if applicable)</td>
                <td className="py-3">2-6 months</td>
              </tr>
              <tr className="border-b border-[color:var(--border-muted)]">
                <td className="py-3">Paying debts and expenses</td>
                <td className="py-3">1-3 months</td>
              </tr>
              <tr className="border-b border-[color:var(--border-muted)]">
                <td className="py-3">Filing tax returns</td>
                <td className="py-3">Depends on timing</td>
              </tr>
              <tr className="border-b border-[color:var(--border-muted)]">
                <td className="py-3">CRA clearance (if requested)</td>
                <td className="py-3">3-6 months</td>
              </tr>
              <tr>
                <td className="py-3">Final distribution</td>
                <td className="py-3">1-2 months</td>
              </tr>
            </tbody>
          </table>
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
