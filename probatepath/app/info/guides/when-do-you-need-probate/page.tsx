/* eslint-disable react/no-unescaped-entities */
import type { Metadata } from "next";
import Link from "next/link";
import { InfoPageLayout } from "@/components/info/InfoPageLayout";
import { FAQSection } from "@/components/info/FAQSection";
import { articleSchema } from "@/lib/info/schema";
import { CheckCircle, XCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "When Do You Need Probate in BC? | Requirements Explained",
  description: "Not every BC estate needs probate. Learn when probate is required, when you can skip it, and how to tell which situation applies to you.",
  keywords: ["when is probate required", "do I need probate BC", "probate requirements BC", "avoid probate BC"],
};

const toc = [
  { id: "quick-answer", title: "Quick answer", level: 2 },
  { id: "need-probate", title: "You likely need probate if", level: 2 },
  { id: "skip-probate", title: "You might skip probate if", level: 2 },
  { id: "bank-thresholds", title: "Bank thresholds", level: 2 },
  { id: "real-estate", title: "Real estate rules", level: 2 },
  { id: "decision-tree", title: "Decision tree", level: 2 },
  { id: "faq", title: "FAQ", level: 2 },
];

const faqs = [
  {
    question: "What if the bank says I need probate but the estate is small?",
    answer: "Banks set their own thresholds and policies. You can try asking for a supervisor, providing extra documentation, or trying a different branch. Some banks release small amounts with a notarized declaration and indemnity agreement instead of probate."
  },
  {
    question: "Do joint bank accounts need probate?",
    answer: "No. Joint accounts with right of survivorship pass automatically to the surviving owner. The bank just needs a death certificate. The money never becomes part of the estate."
  },
  {
    question: "What about RRSPs and TFSAs?",
    answer: "If there's a named beneficiary, these pass directly to that person without probate. If the estate is named as beneficiary (or no beneficiary was named), probate is usually required."
  },
  {
    question: "Can I transfer a car without probate?",
    answer: "ICBC has a simplified process for vehicles in estates under $25,000 total value. For larger estates, you'll typically need probate to transfer vehicle ownership."
  },
];

const schema = articleSchema({
  title: "When Do You Need Probate in BC?",
  description: "Learn when probate is required in British Columbia and when you can skip it",
  datePublished: "2025-01-01",
  dateModified: "2026-01-24",
  url: "https://probatedesk.com/info/guides/when-do-you-need-probate",
});

export default function WhenNeedProbatePage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />

      <InfoPageLayout
        breadcrumbs={[
          { label: "Info Center", href: "/info" },
          { label: "Guides", href: "/info/guides" },
          { label: "When Do You Need Probate" },
        ]}
        eyebrow="Guide"
        title="When Do You Need Probate in BC?"
        description="Not every estate requires probate. The key factors are what assets exist, how they're held, and what institutions require before releasing them."
        lastUpdated="January 2026"
        readingTime="10 min"
        toc={toc}
      >
        <h2 id="quick-answer" className="scroll-mt-24">Quick answer</h2>
        
        <p className="text-lg leading-relaxed">
          <strong>You need probate in BC if</strong> the deceased owned real estate in their name 
          alone, or if financial institutions holding significant assets (typically over $25,000-$50,000) 
          require a grant before releasing funds. You can often <strong>skip probate if</strong> all 
          assets were held jointly, had named beneficiaries, or fall under institution thresholds.
        </p>

        <h2 id="need-probate" className="scroll-mt-24">You likely need probate if:</h2>

        <div className="space-y-4 my-6">
          {[ 
            "The deceased owned real estate (house, condo, land) in BC in their name alone",
            "Bank accounts or investments in their name alone exceed $25,000-$50,000",
            "The Land Title Office requires proof of executor authority to transfer property",
            "Any financial institution specifically asks for a grant of probate",
            "There are assets in multiple institutions that together exceed thresholds",
            "You need to sue someone on behalf of the estate or defend a lawsuit",
          ].map((item, i) => (
            <div key={i} className="flex gap-3 rounded-xl border border-[color:var(--border-muted)] bg-[color:var(--bg-surface)] p-4">
              <CheckCircle className="h-5 w-5 shrink-0 text-[color:var(--brand)]" />
              <p className="text-[color:var(--muted-ink)]">{item}</p>
            </div>
          ))}
        </div>

        <h2 id="skip-probate" className="scroll-mt-24">You might skip probate if:</h2>

        <div className="space-y-4 my-6">
          {[ 
            "All real estate was held in joint tenancy (passes automatically to survivor)",
            "All bank accounts were joint accounts with right of survivorship",
            "All registered accounts (RRSPs, TFSAs, RRIFs) have named beneficiaries",
            "Life insurance policies have named beneficiaries (not the estate)",
            "Total estate value is under $25,000 and institutions agree to release without probate",
            "All assets are personal belongings with no title registration",
          ].map((item, i) => (
            <div key={i} className="flex gap-3 rounded-xl border border-[color:var(--border-muted)] bg-[color:var(--bg-surface)] p-4">
              <XCircle className="h-5 w-5 shrink-0 text-[color:var(--slate)]" />
              <p className="text-[color:var(--muted-ink)]">{item}</p>
            </div>
          ))}
        </div>

        <h2 id="bank-thresholds" className="scroll-mt-24">Bank thresholds</h2>

        <p>
          Each financial institution sets its own threshold for when they'll require probate. 
          These aren't published officially and can change, but typical ranges are:
        </p>

        <div className="overflow-x-auto my-8">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[color:var(--border-muted)]">
                <th className="py-3 text-left font-semibold text-[color:var(--brand)]">Institution Type</th>
                <th className="py-3 text-left font-semibold text-[color:var(--brand)]">Typical Threshold</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-[color:var(--border-muted)]">
                <td className="py-3">Major banks (TD, RBC, BMO, etc.)</td>
                <td className="py-3">$25,000 - $75,000</td>
              </tr>
              <tr className="border-b border-[color:var(--border-muted)]">
                <td className="py-3">Credit unions</td>
                <td className="py-3">$10,000 - $50,000</td>
              </tr>
              <tr className="border-b border-[color:var(--border-muted)]">
                <td className="py-3">Investment brokers</td>
                <td className="py-3">$25,000 - $50,000</td>
              </tr>
              <tr>
                <td className="py-3">Insurance companies</td>
                <td className="py-3">Varies widely</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="rounded-2xl border border-[color:var(--border-muted)] bg-[color:var(--bg-muted)] p-6 my-8">
          <p className="font-semibold text-[color:var(--brand)]">Important</p>
          <p className="mt-2 text-[color:var(--muted-ink)]">
            Even under threshold, banks may still require probate if there's any complexity: 
            disputes, unclear beneficiaries, or concerns about the will. They're protecting 
            themselves from liability, so they err on the side of caution.
          </p>
        </div>

        <h2 id="real-estate" className="scroll-mt-24">Real estate rules</h2>

        <p>
          Real estate in BC almost always requires probate if it was in the deceased's name alone. 
          The Land Title Office needs to see a grant before they'll transfer the property.
        </p>

        <h3>Exceptions:</h3>
        <ul>
          <li>
            <strong>Joint tenancy:</strong> If the property was held in joint tenancy with right 
            of survivorship, it passes automatically to the surviving owner. You just need to 
            file a transmission application with a death certificate.
          </li>
          <li>
            <strong>Tenants in common:</strong> The deceased's share does require probate 
            because it doesn't automatically pass to the other owner.
          </li>
        </ul>

        <p>
          To find out how property is held, check the title at the Land Title Office or look 
          at the original transfer documents.
        </p>

        <h2 id="decision-tree" className="scroll-mt-24">Decision tree</h2>

        <p>Work through these questions:</p>

        <div className="space-y-4 my-8">
          <div className="rounded-2xl border border-[color:var(--border-muted)] bg-[color:var(--bg-surface)] p-6">
            <p className="font-semibold text-[color:var(--brand)]">1. Is there real estate in BC in the deceased's name alone?</p>
            <p className="mt-2 text-[color:var(--muted-ink)]">
              <strong>Yes:</strong> You almost certainly need probate.<br />
              <strong>No:</strong> Continue to question 2.
            </p>
          </div>

          <div className="rounded-2xl border border-[color:var(--border-muted)] bg-[color:var(--bg-surface)] p-6">
            <p className="font-semibold text-[color:var(--brand)]">2. Are there bank/investment accounts over $25,000 in the deceased's name alone?</p>
            <p className="mt-2 text-[color:var(--muted-ink)]">
              <strong>Yes:</strong> Contact each institution to ask their requirements. Most will require probate.<br />
              <strong>No:</strong> Continue to question 3.
            </p>
          </div>

          <div className="rounded-2xl border border-[color:var(--border-muted)] bg-[color:var(--bg-surface)] p-6">
            <p className="font-semibold text-[color:var(--brand)]">3. Do RRSPs, TFSAs, and life insurance have named beneficiaries?</p>
            <p className="mt-2 text-[color:var(--muted-ink)]">
              <strong>Yes:</strong> These pass outside the estate without probate.<br />
              <strong>No (or estate is beneficiary):</strong> Probate may be required depending on value.
            </p>
          </div>

          <div className="rounded-2xl border border-[color:var(--border-muted)] bg-[color:var(--bg-surface)] p-6">
            <p className="font-semibold text-[color:var(--brand)]">4. Is the total estate value under $25,000?</p>
            <p className="mt-2 text-[color:var(--muted-ink)]">
              <strong>Yes:</strong> You may be able to use small estate procedures or get institutions to release without probate.<br />
              <strong>No:</strong> Probate is likely required.
            </p>
          </div>
        </div>

        <h3>When in doubt</h3>
        <p>
          Call each financial institution holding assets and ask: "What do you need from me to 
          release these funds?" They'll tell you if they require probate or if they'll accept 
          other documentation.
        </p>

        <div className="rounded-2xl border border-[color:var(--border-muted)] bg-[color:var(--bg-muted)] p-6 my-8">
          <p className="font-semibold text-[color:var(--brand)]">Proof that helps with banks</p>
          <ul className="mt-2 space-y-1 text-[color:var(--muted-ink)]">
            <li>Death certificate</li>
            <li>Photo ID for the executor</li>
            <li>A notarized indemnity if asking for funds below threshold</li>
            <li>Copy of the will (if they will review it while you wait for probate)</li>
          </ul>
        </div>

        <p>
          <Link href="/info/guides/bc-probate-guide" className="text-[color:var(--brand)] underline">
            Read the full BC Probate Guide →
          </Link>
        </p>

        <FAQSection faqs={faqs} />

        <section className="mt-12 rounded-3xl bg-[color:var(--bg-muted)] p-8">
          <h2 className="font-serif text-2xl text-[color:var(--brand)]">Need probate?</h2>
          <p className="mt-4 text-[color:var(--muted-ink)]">
            ProbateDesk prepares all your BC probate forms starting at $799. We handle the paperwork
            so you can focus on the estate.
          </p>
          <Link
            href="/create-account"
            className="mt-6 inline-block rounded-full bg-[color:var(--brand)] px-6 py-3 font-semibold text-white hover:bg-[color:var(--accent-dark)]"
          >
            Start intake
          </Link>
        </section>
      </InfoPageLayout>
    </>
  );
}
