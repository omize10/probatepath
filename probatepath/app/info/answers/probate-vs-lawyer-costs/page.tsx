/* eslint-disable react/no-unescaped-entities */
import type { Metadata } from "next";
import Link from "next/link";
import { InfoPageLayout } from "@/components/info/InfoPageLayout";
import { FAQSection } from "@/components/info/FAQSection";

export const metadata: Metadata = {
  title: "Probate Costs: DIY vs. ProbatePath vs. Lawyer | Comparison",
  description: "Compare the costs of handling BC probate yourself, using ProbatePath, or hiring a lawyer. Real numbers and what you get for each option.",
};

const faqs = [
  {
    question: "When should I definitely hire a lawyer?",
    answer: "If there's a dispute or potential litigation, complex business assets, significant foreign assets, or an insolvent estate. Also if you're uncomfortable handling legal documents."
  },
  {
    question: "Can I start with ProbatePath and switch to a lawyer later?",
    answer: "Yes. Some people use ProbatePath for document preparation and consult a lawyer only if issues arise. You're not locked in."
  },
];

export default function ProbateVsLawyerCostsPage() {
  return (
    <InfoPageLayout
      breadcrumbs={[
        { label: "Info Center", href: "/info" },
        { label: "Quick Answers", href: "/info/answers" },
        { label: "Cost Comparison" },
      ]}
      eyebrow="Quick Answer"
      title="Probate Costs: DIY vs. ProbatePath vs. Lawyer"
      description="What each option costs and what you get."
      lastUpdated="December 2025"
      readingTime="4 min"
      toc={[]}
    >
      <p className="text-lg leading-relaxed">
        <strong>DIY costs $0 but takes the most time and has the highest error risk. 
        ProbatePath is $2,500 fixed. Lawyers charge $3,000-$15,000+</strong> depending on 
        complexity. All options still require you to pay court fees separately.
      </p>

      <h2>Cost comparison</h2>

      <div className="overflow-x-auto my-8">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[color:var(--border-muted)]">
              <th className="py-3 text-left font-semibold text-[color:var(--brand)]">Option</th>
              <th className="py-3 text-left font-semibold text-[color:var(--brand)]">Cost</th>
              <th className="py-3 text-left font-semibold text-[color:var(--brand)]">What You Get</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-[color:var(--border-muted)]">
              <td className="py-3 font-medium">DIY</td>
              <td className="py-3">$0</td>
              <td className="py-3">You figure everything out yourself</td>
            </tr>
            <tr className="border-b border-[color:var(--border-muted)]">
              <td className="py-3 font-medium">ProbatePath</td>
              <td className="py-3">$2,500 fixed</td>
              <td className="py-3">All forms prepared, step-by-step guidance, document portal</td>
            </tr>
            <tr className="border-b border-[color:var(--border-muted)]">
              <td className="py-3 font-medium">Notary</td>
              <td className="py-3">$1,500-$3,500</td>
              <td className="py-3">Form preparation (limited scope, no legal advice)</td>
            </tr>
            <tr>
              <td className="py-3 font-medium">Lawyer</td>
              <td className="py-3">$3,000-$15,000+</td>
              <td className="py-3">Full legal representation, advice, handles complications</td>
            </tr>
          </tbody>
        </table>
      </div>

      <p><em>Note: All options require separate payment of court filing fees ($200) and probate fees (based on estate value).</em></p>

      <h2>When each makes sense</h2>

      <h3>DIY is reasonable if:</h3>
      <ul>
        <li>Very simple estate (one bank account, no real estate)</li>
        <li>You're comfortable with legal documents</li>
        <li>You have time to research and handle paperwork</li>
        <li>No family disputes or complications</li>
      </ul>

      <h3>ProbatePath is good if:</h3>
      <ul>
        <li>Standard BC estate with house, bank accounts, investments</li>
        <li>You want forms done correctly without DIY research</li>
        <li>You want a fixed, predictable cost</li>
        <li>No major disputes or unusual complexity</li>
      </ul>

      <h3>A lawyer is worth it if:</h3>
      <ul>
        <li>Disputes or potential litigation</li>
        <li>Complex business interests</li>
        <li>Significant foreign assets</li>
        <li>Estate might be insolvent</li>
        <li>Will has problems (missing, altered, contested)</li>
        <li>You want someone to handle everything</li>
      </ul>

      <p>
        <Link href="/info/guides/probate-fees-costs" className="text-[color:var(--brand)] underline">
          See the full probate cost breakdown →
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
