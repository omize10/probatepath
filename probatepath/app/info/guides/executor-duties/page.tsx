/* eslint-disable react/no-unescaped-entities */
import type { Metadata } from "next";
import Link from "next/link";
import { InfoPageLayout } from "@/components/info/InfoPageLayout";
import { FAQSection } from "@/components/info/FAQSection";
import { articleSchema } from "@/lib/info/schema";

export const metadata: Metadata = {
  title: "Executor Duties in BC | Your Legal Responsibilities",
  description: "Complete guide to executor duties in British Columbia. Learn your legal responsibilities, potential liabilities, and how to fulfill your role properly.",
  keywords: ["executor duties BC", "executor responsibilities", "estate executor BC", "executor obligations"],
};

const toc = [
  { id: "overview", title: "Overview", level: 2 },
  { id: "immediate", title: "Immediate duties", level: 2 },
  { id: "probate-duties", title: "Probate-related duties", level: 2 },
  { id: "financial", title: "Financial duties", level: 2 },
  { id: "distribution", title: "Distribution duties", level: 2 },
  { id: "liability", title: "Personal liability", level: 2 },
  { id: "compensation", title: "Executor compensation", level: 2 },
  { id: "declining", title: "Declining to act", level: 2 },
  { id: "faq", title: "FAQ", level: 2 },
];

const faqs = [
  {
    question: "Can I be sued as executor?",
    answer: "Yes. Executors can be personally liable for mistakes: distributing assets before paying debts, missing tax obligations, mismanaging investments, or breaching fiduciary duties. Proper documentation and following legal procedures protects you."
  },
  {
    question: "Do I have to accept the role of executor?",
    answer: "No. Being named in a will doesn't force you to act. You can renounce by filing Form P7 before you've intermeddled (started acting as executor). Once you've taken action on the estate, renouncing becomes complicated."
  },
  {
    question: "Can there be multiple executors?",
    answer: "Yes. Co-executors must act together and agree on decisions. This provides checks and balances but can slow things down if co-executors disagree."
  },
];

const schema = articleSchema({
  title: "Executor Duties in BC",
  description: "Complete guide to executor responsibilities in British Columbia",
  datePublished: "2025-01-01",
  dateModified: "2026-01-24",
  url: "https://probatedesk.ca/info/guides/executor-duties",
});

export default function ExecutorDutiesPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />

      <InfoPageLayout
        breadcrumbs={[
          { label: "Info Center", href: "/info" },
          { label: "Guides", href: "/info/guides" },
          { label: "Executor Duties" },
        ]}
        eyebrow="Guide"
        title="Executor Duties in BC"
        description="Your legal responsibilities as an executor in British Columbia, from the moment of death through final distribution."
        lastUpdated="January 2026"
        readingTime="12 min"
        toc={toc}
      >
        <h2 id="overview" className="scroll-mt-24">Overview</h2>

        <p className="text-lg leading-relaxed">
          As executor, you're legally responsible for managing and distributing the deceased's 
          estate according to their will and BC law. This includes <strong>securing assets, paying 
          debts, filing taxes, and distributing to beneficiaries</strong>. You have a fiduciary 
          duty to act in the best interests of the estate and beneficiaries, not yourself.
        </p>

        <h2 id="immediate" className="scroll-mt-24">Immediate duties (first weeks)</h2>

        <h3>Locate and secure the will</h3>
        <ul>
          <li>Find the original signed will (not a copy)</li>
          <li>Check the deceased's home, safety deposit box, lawyer's office</li>
          <li>Secure the document - you'll need to file it with the court</li>
        </ul>

        <h3>Arrange the funeral</h3>
        <ul>
          <li>Follow any wishes expressed in the will</li>
          <li>Pay costs from estate funds (or your own, to be reimbursed)</li>
          <li>Keep all receipts</li>
        </ul>

        <h3>Secure estate assets</h3>
        <ul>
          <li>Lock the deceased's home</li>
          <li>Redirect mail</li>
          <li>Secure vehicles</li>
          <li>Notify banks (to freeze accounts from unauthorized access)</li>
          <li>Cancel subscriptions and services</li>
        </ul>

        <h3>Obtain death certificates</h3>
        <ul>
          <li>Order 5-10 certified copies (you'll need them for banks, CRA, etc.)</li>
          <li>Available through the funeral home or Vital Statistics</li>
        </ul>

        <div className="rounded-2xl border border-[color:var(--border-muted)] bg-[color:var(--bg-muted)] p-6 my-8">
          <p className="font-semibold text-[color:var(--brand)]">Keep a log</p>
          <p className="mt-2 text-[color:var(--muted-ink)]">Start a simple log right away: date, action taken, documents collected. It will save you from disputes later.</p>
        </div>

        <h2 id="probate-duties" className="scroll-mt-24">Probate-related duties</h2>

        <h3>Determine if probate is needed</h3>
        <ul>
          <li>Contact financial institutions to ask their requirements</li>
          <li>Check if real estate is in deceased's name alone</li>
          <li>See our guide: <Link href="/info/guides/when-do-you-need-probate" className="text-[color:var(--brand)] underline">When Do You Need Probate?</Link></li>
        </ul>

        <h3>Apply for probate (if required)</h3>
        <ul>
          <li>Complete the wills notice search</li>
          <li>Send P1 notices to all required parties</li>
          <li>Prepare and file the application package</li>
          <li>Pay filing fees and probate fees</li>
          <li>Respond to any court requisitions</li>
        </ul>

        <h3>Notify beneficiaries</h3>
        <ul>
          <li>Inform everyone named in the will</li>
          <li>Provide a copy of the will if requested</li>
          <li>Keep beneficiaries updated on progress</li>
        </ul>

        <h2 id="financial" className="scroll-mt-24">Financial duties</h2>

        <h3>Create an estate inventory</h3>
        <ul>
          <li>List all assets with values as of the death date</li>
          <li>List all debts and liabilities</li>
          <li>This forms the basis of Form P10/P11</li>
        </ul>

        <h3>Open an estate bank account</h3>
        <ul>
          <li>All estate funds should flow through one account</li>
          <li>Makes tracking and accounting much easier</li>
          <li>Don't mix estate funds with personal funds</li>
        </ul>

        <h3>Collect estate assets</h3>
        <ul>
          <li>Present grant to banks and brokerages</li>
          <li>Transfer or sell real estate</li>
          <li>Collect any amounts owed to the deceased</li>
        </ul>

        <h3>Pay debts and expenses</h3>
        <ul>
          <li>Pay funeral costs</li>
          <li>Pay outstanding bills (utilities, credit cards, etc.)</li>
          <li>Pay estate administration costs</li>
          <li><strong>Important:</strong> Pay debts BEFORE distributing to beneficiaries</li>
        </ul>

        <h3>Handle taxes</h3>
        <ul>
          <li>File the deceased's final ("terminal") tax return</li>
          <li>File any trust returns if the estate earns income</li>
          <li>Consider requesting a CRA clearance certificate before distributing</li>
        </ul>

        <div className="rounded-2xl border border-[color:var(--border-muted)] bg-[color:var(--bg-surface)] p-6 my-8">
          <p className="font-semibold text-[color:var(--brand)]">Communication rhythm</p>
          <p className="mt-2 text-[color:var(--muted-ink)]">Update beneficiaries at key milestones: after filing, after the grant arrives, before distribution. Short factual emails prevent misunderstandings.</p>
        </div>

        <h2 id="distribution" className="scroll-mt-24">Distribution duties</h2>

        <h3>Follow the will exactly</h3>
        <ul>
          <li>Distribute specific gifts as directed</li>
          <li>Calculate residue (what's left) properly</li>
          <li>You cannot deviate from the will's instructions</li>
        </ul>

        <h3>Get releases</h3>
        <ul>
          <li>Have beneficiaries sign releases acknowledging receipt</li>
          <li>Protects you from future claims</li>
        </ul>

        <h3>Keep records</h3>
        <ul>
          <li>Document every transaction</li>
          <li>Keep receipts for all expenses paid</li>
          <li>Maintain a running ledger of estate funds</li>
          <li>Beneficiaries can request an accounting</li>
        </ul>

        <h2 id="liability" className="scroll-mt-24">Personal liability</h2>

        <p>Executors can be held personally liable for:</p>

        <ul>
          <li><strong>Distributing too early:</strong> If you distribute to beneficiaries before paying all debts, you may have to repay creditors from your own pocket</li>
          <li><strong>Missing taxes:</strong> CRA can pursue you personally for unpaid taxes</li>
          <li><strong>Mismanaging assets:</strong> Letting assets depreciate, bad investments, theft</li>
          <li><strong>Breach of fiduciary duty:</strong> Self-dealing, favoring one beneficiary, not acting in estate's best interest</li>
          <li><strong>Delay:</strong> Unreasonable delays that cause losses</li>
        </ul>

        <div className="rounded-2xl border border-[color:var(--border-muted)] bg-[color:var(--bg-muted)] p-6 my-8">
          <p className="font-semibold text-[color:var(--brand)]">How to protect yourself</p>
          <ul className="mt-2 space-y-1 text-[color:var(--muted-ink)]">
            <li>Document everything</li>
            <li>Don't distribute until debts are paid</li>
            <li>Get CRA clearance before final distribution</li>
            <li>Get releases from beneficiaries</li>
            <li>When in doubt, get professional advice</li>
          </ul>
        </div>

        <h2 id="compensation" className="scroll-mt-24">Executor compensation</h2>

        <p>Executors are entitled to reasonable compensation for their work. In BC:</p>

        <ul>
          <li>The will may specify compensation</li>
          <li>If not, you can claim "reasonable compensation" (typically 3-5% of estate value)</li>
          <li>Must be agreed by beneficiaries or approved by court</li>
          <li>Some executors (especially family members) waive compensation</li>
        </ul>

        <p>
          Compensation is separate from reimbursement for out-of-pocket expenses, which you're 
          entitled to regardless.
        </p>

        <h2 id="declining" className="scroll-mt-24">Declining to act</h2>

        <p>You don't have to accept the role of executor. Options:</p>

        <ul>
          <li><strong>Renounce:</strong> File Form P7 before taking any action on the estate. You completely give up the role.</li>
          <li><strong>Reserve:</strong> Let another named executor act first, but keep your right to step in later.</li>
        </ul>

        <div className="rounded-2xl border-l-4 border-[color:var(--warning)] bg-[color:var(--bg-muted)] p-5 my-6">
          <p className="font-semibold text-[color:var(--brand)]">Warning: Don't "intermeddle"</p>
          <p className="mt-1 text-[color:var(--muted-ink)]">
            Once you've started acting as executor (paying bills, collecting assets, dealing 
            with institutions), you may be unable to renounce. Decide before taking action.
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
