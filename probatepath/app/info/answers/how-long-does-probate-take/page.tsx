/* eslint-disable react/no-unescaped-entities */
import type { Metadata } from "next";
import Link from "next/link";
import { InfoPageLayout } from "@/components/info/InfoPageLayout";
import { FAQSection } from "@/components/info/FAQSection";

export const metadata: Metadata = {
  title: "How Long Does Probate Take in BC? | Timeline Answer",
  description: "BC probate takes 6-12 months total. Court processing is 4-8 weeks after filing. Here's what affects the timeline.",
};

const faqs = [
  {
    question: "Can anything speed up court processing?",
    answer: "No. Court processing time is fixed. What you can control is avoiding errors that cause requisitions, which add weeks of delay."
  },
  {
    question: "Is Vancouver slower than other registries?",
    answer: "Vancouver and Victoria handle higher volumes, which can sometimes mean slightly longer processing. But the difference is usually minor (days, not weeks)."
  },
];

export default function HowLongProbatePage() {
  return (
    <InfoPageLayout
      breadcrumbs={[
        { label: "Info Center", href: "/info" },
        { label: "Quick Answers", href: "/info/answers" },
        { label: "How Long Does Probate Take" },
      ]}
      eyebrow="Quick Answer"
      title="How Long Does Probate Take in BC?"
      description="A straightforward answer with timeline breakdown."
      lastUpdated="January 2026"
      readingTime="3 min"
      toc={[]}
    >
      {/* Direct answer - first paragraph optimized for AI search */}
      <p className="text-lg leading-relaxed">
        <strong>BC probate takes 6-12 months total.</strong> Court processing is 4-8 weeks after 
        you file. But preparation before filing takes 6-10 weeks, and estate administration after 
        the grant takes 3-9 more months.
      </p>

      <h2>Quick breakdown</h2>

      <div className="overflow-x-auto my-6">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[color:var(--border-muted)]">
              <th className="py-3 text-left font-semibold text-[color:var(--brand)]">Phase</th>
              <th className="py-3 text-left font-semibold text-[color:var(--brand)]">Time</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-[color:var(--border-muted)]">
              <td className="py-3">Gathering documents + wills search</td>
              <td className="py-3">2-6 weeks</td>
            </tr>
            <tr className="border-b border-[color:var(--border-muted)]">
              <td className="py-3">P1 notices + waiting period</td>
              <td className="py-3">3-4 weeks</td>
            </tr>
            <tr className="border-b border-[color:var(--border-muted)]">
              <td className="py-3">Court processing</td>
              <td className="py-3">4-8 weeks</td>
            </tr>
            <tr>
              <td className="py-3">Post-grant administration</td>
              <td className="py-3">3-9 months</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2>What causes delays?</h2>
      <ul>
        <li><strong>Errors in forms:</strong> Cause requisitions, adding 2-4 weeks each</li>
        <li><strong>Missing documents:</strong> Can't file until you have everything</li>
        <li><strong>Real estate sales:</strong> Selling property adds months</li>
        <li><strong>CRA clearance:</strong> If requested, adds 3-6 months</li>
        <li><strong>Disputes:</strong> Can extend timeline significantly</li>
      </ul>

      <h2>What you can control</h2>
      <ul>
        <li>Start the wills search immediately (it's the longest single delay)</li>
        <li>Gather all documents before filling out forms</li>
        <li>Double-check everything to avoid requisitions</li>
        <li>Use professional help to reduce errors</li>
      </ul>

      <p>
        <Link href="/info/guides/probate-timeline" className="text-[color:var(--brand)] underline">
          Read the detailed timeline guide →
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
