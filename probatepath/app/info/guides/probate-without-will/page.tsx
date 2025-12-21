/* eslint-disable react/no-unescaped-entities */
import type { Metadata } from "next";
import Link from "next/link";
import { InfoPageLayout } from "@/components/info/InfoPageLayout";
import { FAQSection } from "@/components/info/FAQSection";
import { articleSchema } from "@/lib/info/schema";

export const metadata: Metadata = {
  title: "Probate Without a Will in BC | Intestacy Rules Explained",
  description: "When someone dies without a will in BC, intestacy rules determine who inherits. Learn who gets what, who can be administrator, and how the process works.",
  keywords: ["intestacy BC", "no will BC", "died without will", "intestate succession BC"],
};

const toc = [
  { id: "overview", title: "Overview", level: 2 },
  { id: "who-inherits", title: "Who inherits?", level: 2 },
  { id: "spouse-rules", title: "Spouse entitlements", level: 2 },
  { id: "no-spouse", title: "If no spouse", level: 2 },
  { id: "administrator", title: "Who can be administrator?", level: 2 },
  { id: "process", title: "The process", level: 2 },
  { id: "faq", title: "FAQ", level: 2 },
];

const faqs = [
  {
    question: "What if multiple people want to be administrator?",
    answer: "Priority goes in the order set by law: spouse first, then children, then parents, etc. If two people have equal priority (e.g., two adult children), they can apply jointly or one can get the others to renounce."
  },
  {
    question: "Can the deceased's wishes be considered even without a will?",
    answer: "No. Without a valid will, intestacy rules strictly determine distribution. What the deceased said they wanted, even in writing, doesn't count unless it meets will requirements."
  },
  {
    question: "What about common-law partners?",
    answer: "In BC, common-law partners who lived in a marriage-like relationship for at least 2 years have the same intestacy rights as married spouses."
  },
];

const schema = articleSchema({
  title: "Probate Without a Will in BC",
  description: "How intestacy works when someone dies without a will in British Columbia",
  datePublished: "2025-01-01",
  dateModified: "2025-12-13",
  url: "https://probatepath.ca/info/guides/probate-without-will",
});

export default function ProbateWithoutWillPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />

      <InfoPageLayout
        breadcrumbs={[
          { label: "Info Center", href: "/info" },
          { label: "Guides", href: "/info/guides" },
          { label: "Probate Without a Will" },
        ]}
        eyebrow="Guide"
        title="Probate Without a Will (Intestacy)"
        description="When someone dies without a valid will in BC, specific rules determine who inherits and who can administer the estate."
        lastUpdated="December 2025"
        readingTime="10 min"
        toc={toc}
      >
        <h2 id="overview" className="scroll-mt-24">Overview</h2>

        <p className="text-lg leading-relaxed">
          When someone dies without a valid will, they die "intestate." BC's <em>Wills, Estates 
          and Succession Act</em> (WESA) has specific rules for who inherits. <strong>The deceased's 
          wishes don't matter</strong> – distribution follows the statutory formula based on family 
          relationships.
        </p>

        <h2 id="who-inherits" className="scroll-mt-24">Who inherits?</h2>

        <p>BC intestacy rules prioritize close family members. The basic order:</p>

        <ol>
          <li><strong>Spouse</strong> (including common-law partners of 2+ years)</li>
          <li><strong>Children</strong> (biological and legally adopted)</li>
          <li><strong>Parents</strong></li>
          <li><strong>Siblings</strong></li>
          <li><strong>Nieces and nephews</strong></li>
          <li><strong>More distant relatives</strong></li>
          <li><strong>The government</strong> (if no relatives can be found)</li>
        </ol>

        <p>The specific split depends on the family situation.</p>

        <h2 id="spouse-rules" className="scroll-mt-24">Spouse entitlements</h2>

        <h3>Spouse only, no children</h3>
        <p>Spouse gets everything.</p>

        <h3>Spouse + children who are all children of both the spouse and deceased</h3>
        <p>Spouse gets everything. (The children eventually inherit from the surviving spouse.)</p>

        <h3>Spouse + children where at least one child is NOT the spouse's child</h3>
        <p>Spouse gets:</p>
        <ul>
          <li>All household furnishings</li>
          <li>First <strong>$300,000</strong> of the estate</li>
          <li><strong>50%</strong> of the remainder</li>
        </ul>
        <p>Children share the other 50% equally.</p>

        <div className="rounded-2xl border border-[color:var(--border-muted)] bg-[color:var(--bg-muted)] p-6 my-8">
          <p className="font-semibold text-[color:var(--brand)]">Example</p>
          <p className="mt-2 text-[color:var(--muted-ink)]">
            Estate worth $500,000. Deceased has spouse and one child from a previous relationship.
          </p>
          <ul className="mt-2 space-y-1 text-[color:var(--muted-ink)]">
            <li>Spouse gets: household items + $300,000 + 50% of remaining $200,000 = <strong>$400,000</strong></li>
            <li>Child gets: 50% of $200,000 = <strong>$100,000</strong></li>
          </ul>
        </div>

        <h2 id="no-spouse" className="scroll-mt-24">If there's no spouse</h2>

        <div className="overflow-x-auto my-8">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[color:var(--border-muted)]">
                <th className="py-3 text-left font-semibold text-[color:var(--brand)]">Situation</th>
                <th className="py-3 text-left font-semibold text-[color:var(--brand)]">Who inherits</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-[color:var(--border-muted)]">
                <td className="py-3">Has children</td>
                <td className="py-3">Children share equally</td>
              </tr>
              <tr className="border-b border-[color:var(--border-muted)]">
                <td className="py-3">No children, has parents</td>
                <td className="py-3">Parents share equally</td>
              </tr>
              <tr className="border-b border-[color:var(--border-muted)]">
                <td className="py-3">No children or parents, has siblings</td>
                <td className="py-3">Siblings share equally</td>
              </tr>
              <tr className="border-b border-[color:var(--border-muted)]">
                <td className="py-3">No close relatives</td>
                <td className="py-3">More distant relatives (nieces, nephews, cousins)</td>
              </tr>
              <tr>
                <td className="py-3">No relatives at all</td>
                <td className="py-3">Escheats to the BC government</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p>If a person who would have inherited has died, their share typically goes to their descendants (per stirpes).</p>

        <h2 id="administrator" className="scroll-mt-24">Who can be administrator?</h2>

        <p>Without a will, there's no executor. Someone must apply to be "administrator." Priority:</p>

        <ol>
          <li>Spouse</li>
          <li>Children</li>
          <li>Grandchildren</li>
          <li>Parents</li>
          <li>Siblings</li>
          <li>Any other next of kin</li>
        </ol>

        <p>
          Higher-priority people must either apply, renounce, or consent to someone else applying. 
          You can't just skip ahead in line.
        </p>

        <h2 id="process" className="scroll-mt-24">The intestacy probate process</h2>

        <p>The process is similar to probate with a will, with these differences:</p>

        <ul>
          <li>Apply for "grant of administration" instead of "grant of probate"</li>
          <li>Use <strong>Form P5</strong> instead of P3/P4</li>
          <li>No will to attach to the application</li>
          <li>Must show your priority to be administrator</li>
          <li>May need renunciations from higher-priority relatives</li>
          <li>Distribution follows intestacy rules, not instructions in a document</li>
        </ul>

        <div className="rounded-2xl border border-[color:var(--border-muted)] bg-[color:var(--bg-muted)] p-6 my-8">
          <p className="font-semibold text-[color:var(--brand)]">Extra caution</p>
          <p className="mt-2 text-[color:var(--muted-ink)]">Because there's no will to guide decisions, keep detailed notes of every choice and communication. It reduces the risk of family disputes.</p>
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
