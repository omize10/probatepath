/* eslint-disable react/no-unescaped-entities */
import type { Metadata } from "next";
import Link from "next/link";
import { InfoPageLayout } from "@/components/info/InfoPageLayout";
import { FAQSection } from "@/components/info/FAQSection";
import { articleSchema } from "@/lib/info/schema";

export const metadata: Metadata = {
  title: "What is Probate in BC? | Clear Explanation for Executors",
  description: "Probate is the court process that confirms an executor's authority to deal with a deceased person's estate in BC. Learn what it means and why it matters.",
  keywords: ["what is probate", "probate meaning", "probate BC", "grant of probate"],
};

const toc = [
  { id: "definition", title: "What probate means", level: 2 },
  { id: "why-exists", title: "Why probate exists", level: 2 },
  { id: "what-court-does", title: "What the court does", level: 2 },
  { id: "grant-document", title: "The grant document", level: 2 },
  { id: "who-needs-grant", title: "Who needs to see it", level: 2 },
  { id: "misconceptions", title: "Common misconceptions", level: 2 },
  { id: "practical", title: "Practical steps", level: 2 },
  { id: "faq", title: "FAQ", level: 2 },
];

const faqs = [
  {
    question: "Is probate the same as reading the will?",
    answer: "No. Reading the will is informal. Probate is a formal court process that legally confirms the executor's authority. The will doesn't need to be 'read' in court."
  },
  {
    question: "Does probate transfer ownership of assets?",
    answer: "Probate confirms the executor's authority to transfer assets. The actual transfer happens after, when the executor presents the grant to banks and registries."
  },
  {
    question: "Is probate public?",
    answer: "Yes. Once granted, probate becomes a public record. Anyone can search court records to see basic details of the estate."
  },
  {
    question: "Can you avoid probate with a will?",
    answer: "No. Having a will actually requires probate if assets exceed certain thresholds. Joint assets and beneficiary designations avoid probate regardless of whether there's a will."
  },
];

const schema = articleSchema({
  title: "What is Probate in BC?",
  description: "A clear explanation of what probate means in British Columbia",
  datePublished: "2025-01-01",
  dateModified: "2025-12-13",
  url: "https://probatedesk.ca/info/guides/what-is-probate",
});

export default function WhatIsProbatePage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />

      <InfoPageLayout
        breadcrumbs={[
          { label: "Info Center", href: "/info" },
          { label: "Guides", href: "/info/guides" },
          { label: "What is Probate" },
        ]}
        eyebrow="Guide"
        title="What is Probate in BC?"
        description="Probate is the court process that confirms an executor has legal authority to deal with a deceased person's estate. Here's what that actually means."
        lastUpdated="December 2025"
        readingTime="10 min"
        toc={toc}
      >
        {/* Direct answer for AI/featured snippets */}
        <p className="text-lg leading-relaxed">
          <strong>Probate</strong> is when the Supreme Court of British Columbia officially confirms 
          that a will is valid and that the named executor has authority to manage the deceased 
          person's estate. After probate, the court issues a "grant of probate" that the executor 
          uses to access bank accounts, transfer property, and distribute assets to beneficiaries.
        </p>

        <h2 id="definition" className="scroll-mt-24">What probate means</h2>
        
        <p>
          The word "probate" comes from the Latin <em>probare</em>, meaning "to prove." In BC, 
          probate is the process of proving to the court that:
        </p>
        
        <ul>
          <li>The document presented is the deceased's last valid will</li>
          <li>The person applying is the executor named in that will</li>
          <li>The executor should be given legal authority to act on behalf of the estate</li>
        </ul>

        <p>
          Once the court is satisfied, it issues an official certificate called a "grant of probate." 
          This document serves as proof that the executor has been verified by the court and has 
          legal authority to deal with the estate.
        </p>

        <div className="rounded-2xl border border-[color:var(--border-muted)] bg-[color:var(--bg-muted)] p-6 my-8">
          <p className="font-semibold text-[color:var(--brand)]">Why it matters</p>
          <p className="mt-2 text-[color:var(--muted-ink)]">
            Banks, the Land Title Office, ICBC, and investment firms will not accept a will on its own. 
            They need the court-stamped grant that proves the will has been vetted and the executor has authority.
          </p>
        </div>

        <h2 id="why-exists" className="scroll-mt-24">Why probate exists</h2>

        <p>
          Probate exists to protect everyone involved in an estate:
        </p>

        <ul>
          <li>
            <strong>Beneficiaries</strong> are protected because the court verifies the will is 
            genuine and the executor is the right person before assets are distributed
          </li>
          <li>
            <strong>Creditors</strong> have a chance to make claims against the estate before 
            assets disappear
          </li>
          <li>
            <strong>Financial institutions</strong> have legal certainty that they're releasing 
            assets to the correct person and won't face claims later
          </li>
          <li>
            <strong>Executors</strong> have official documentation proving their authority if 
            anyone questions their actions
          </li>
        </ul>

        <p>
          Without probate, banks and land registries would have no reliable way to verify that 
          someone claiming to be an executor actually has authority. They could face legal liability 
          if they released assets to the wrong person or an imposter.
        </p>

        <div className="grid gap-4 rounded-2xl border border-[color:var(--border-muted)] bg-[color:var(--bg-surface)] p-6 sm:grid-cols-2">
          <div>
            <p className="font-semibold text-[color:var(--brand)]">Who asks for probate?</p>
            <ul className="mt-2 space-y-1 text-[color:var(--muted-ink)]">
              <li>Banks when balances exceed their threshold</li>
              <li>Land Title Office for any solely owned property</li>
              <li>Brokerages for investment accounts</li>
              <li>Some insurers if the estate is the beneficiary</li>
            </ul>
          </div>
          <div>
            <p className="font-semibold text-[color:var(--brand)]">Who doesn't?</p>
            <ul className="mt-2 space-y-1 text-[color:var(--muted-ink)]">
              <li>Joint accounts with right of survivorship</li>
              <li>RRSPs/TFSAs with named beneficiaries</li>
              <li>Life insurance with a named beneficiary</li>
            </ul>
          </div>
        </div>

        <h2 id="what-court-does" className="scroll-mt-24">What the court actually does</h2>

        <p>
          The BC Supreme Court probate registry reviews your application to check:
        </p>

        <ol>
          <li>The will appears properly signed and witnessed according to BC law</li>
          <li>Required notices were sent to all beneficiaries and potential heirs</li>
          <li>The application forms are complete and internally consistent</li>
          <li>There are no obvious challenges, disputes, or red flags</li>
          <li>Probate fees have been calculated correctly and paid</li>
        </ol>

        <p>
          The court does <strong>not</strong>:
        </p>

        <ul>
          <li>Interpret what the will means or resolve ambiguities</li>
          <li>Decide if the will is "fair" or makes sense</li>
          <li>Supervise the executor's actions after the grant</li>
          <li>Verify that assets listed are accurate</li>
          <li>Meditate disputes between beneficiaries</li>
        </ul>

        <p>
          The court simply confirms the paperwork is in order and issues the grant. If disputes 
          arise later, those are handled through separate court proceedings.
        </p>

        <div className="rounded-2xl border border-[color:var(--border-muted)] bg-[color:var(--bg-surface)] p-6 my-8">
          <p className="font-semibold text-[color:var(--brand)]">Quick accuracy check</p>
          <ul className="mt-2 space-y-1 text-[color:var(--muted-ink)]">
            <li>Names match across will, death certificate, and forms</li>
            <li>Addresses for beneficiaries are current and complete</li>
            <li>Asset values are date-of-death, not today</li>
            <li>Staples on the original will are intact</li>
          </ul>
        </div>

        <h2 id="grant-document" className="scroll-mt-24">The grant document</h2>

        <p>
          When probate is complete, you receive a "grant of probate" document. This court-certified 
          certificate includes:
        </p>

        <ul>
          <li>The deceased's full legal name and date of death</li>
          <li>The executor's name and confirmation of their authority</li>
          <li>The court's official seal and registrar's signature</li>
          <li>A certified copy of the will attached as an exhibit</li>
          <li>The court file number for reference</li>
        </ul>

        <p>
          You'll typically order several "certified copies" of the grant (about $40 each). Banks, 
          land registries, and other institutions usually require an original certified copy with 
          the court's raised seal, not a photocopy.
        </p>

        <div className="rounded-2xl border border-[color:var(--border-muted)] bg-[color:var(--bg-muted)] p-6 my-8">
          <p className="font-semibold text-[color:var(--brand)]">How many copies do you need?</p>
          <p className="mt-2 text-[color:var(--muted-ink)]">
            Order one certified copy for each major institution: one for each bank, one for the 
            Land Title Office if there's real estate, one for your records. Most executors order 
            3-5 copies. You can always order more later, but it requires another trip to the registry.
          </p>
        </div>

        <h2 id="who-needs-grant" className="scroll-mt-24">Who needs to see the grant</h2>

        <p>
          After receiving the grant, you'll present it to various institutions:
        </p>

        <ul>
          <li><strong>Banks and credit unions:</strong> To close accounts and release funds to the estate</li>
          <li><strong>Investment brokers:</strong> To transfer or liquidate investment accounts</li>
          <li><strong>BC Land Title Office:</strong> To transfer real property into beneficiary names or to the estate for sale</li>
          <li><strong>Insurance companies:</strong> For policy payouts where the estate is the beneficiary</li>
          <li><strong>Pension administrators:</strong> For survivor benefits in some cases</li>
          <li><strong>CRA:</strong> For certain tax matters and clearance certificates</li>
          <li><strong>ICBC:</strong> To transfer vehicle ownership</li>
        </ul>

        <p>
          Each institution has its own forms and processes. The grant is your "key" that unlocks 
          access to estate assets. Without it, most institutions won't let you touch anything.
        </p>

        <h2 id="misconceptions" className="scroll-mt-24">Common misconceptions</h2>

        <div className="space-y-6 my-8">
          <div className="rounded-xl border border-[color:var(--border-muted)] p-5">
            <p className="font-semibold text-[color:var(--brand)]">
              ❌ "Probate validates whether the will is fair"
            </p>
            <p className="mt-2 text-[color:var(--muted-ink)]">
              The court doesn't judge whether the will is fair or makes sense. It only confirms 
              the will appears properly executed. A will that leaves everything to a stranger and 
              nothing to family can still be probated. Challenges to unfair wills happen separately.
            </p>
          </div>

          <div className="rounded-xl border border-[color:var(--border-muted)] p-5">
            <p className="font-semibold text-[color:var(--brand)]">
              ❌ "Probate means the government takes a big cut"
            </p>
            <p className="mt-2 text-[color:var(--muted-ink)]">
              BC probate fees are about 1.4% on estate value over $50,000. This is actually lower 
              than many other provinces. The government doesn't "take" estate assets. These are 
              just processing fees, similar to other court filing fees.
            </p>
          </div>

          <div className="rounded-xl border border-[color:var(--border-muted)] p-5">
            <p className="font-semibold text-[color:var(--brand)]">
              ❌ "Having a will means you avoid probate"
            </p>
            <p className="mt-2 text-[color:var(--muted-ink)]">
              It's the opposite. A will actually <em>requires</em> probate if assets exceed 
              certain thresholds. What avoids probate is how assets are held: joint ownership, 
              beneficiary designations on RRSPs and insurance, and trusts can all bypass probate.
            </p>
          </div>

          <div className="rounded-xl border border-[color:var(--border-muted)] p-5">
            <p className="font-semibold text-[color:var(--brand)]">
              ❌ "The executor gets paid from probate"
            </p>
            <p className="mt-2 text-[color:var(--muted-ink)]">
              Executor compensation is separate from probate. The will may specify compensation, 
              or the executor can claim "reasonable compensation" from the estate (typically 
              up to 5% of estate value). This isn't automatic and requires agreement or court approval.
            </p>
          </div>
        </div>

        <h2 id="practical" className="scroll-mt-24">Practical steps if you just became executor</h2>
        <ul>
          <li>Secure the home and valuables; redirect mail</li>
          <li>Find the original will and keep it untouched</li>
          <li>Order multiple death certificates</li>
          <li>Start the wills notice search immediately</li>
          <li>List every asset with how it's owned (sole, joint, beneficiary)</li>
          <li>Call banks to ask if they'll require a grant</li>
          <li>Read the full <Link href="/info/guides/bc-probate-guide" className="text-[color:var(--brand)] underline">BC Probate Guide</Link> for the full process</li>
        </ul>

        <FAQSection faqs={faqs} />

        <section className="mt-12 rounded-3xl bg-[color:var(--bg-muted)] p-8">
          <h2 className="font-serif text-2xl text-[color:var(--brand)]">Related guides</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <Link href="/info/guides/when-do-you-need-probate" className="rounded-xl border border-[color:var(--border-muted)] bg-white p-4 hover:border-[color:var(--brand)]">
              <p className="font-medium text-[color:var(--brand)]">When Do You Need Probate?</p>
              <p className="mt-1 text-sm text-[color:var(--muted-ink)]">Learn when probate is required</p>
            </Link>
            <Link href="/info/guides/bc-probate-guide" className="rounded-xl border border-[color:var(--border-muted)] bg-white p-4 hover:border-[color:var(--brand)]">
              <p className="font-medium text-[color:var(--brand)]">Complete BC Probate Guide</p>
              <p className="mt-1 text-sm text-[color:var(--muted-ink)]">The full process explained</p>
            </Link>
          </div>
        </section>
      </InfoPageLayout>
    </>
  );
}
