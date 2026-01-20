/* eslint-disable react/no-unescaped-entities */
import type { Metadata } from "next";
import Link from "next/link";
import { InfoPageLayout } from "@/components/info/InfoPageLayout";
import { FAQSection } from "@/components/info/FAQSection";
import { articleSchema } from "@/lib/info/schema";

export const metadata: Metadata = {
  title: "BC Probate Guide 2025 | Everything Executors Need to Know",
  description: "The complete guide to probate in British Columbia. Learn when you need it, what forms to file, how long it takes, what it costs, and what happens after the grant.",
  keywords: ["probate BC", "BC probate guide", "grant of probate BC", "executor BC", "probate British Columbia"],
  openGraph: {
    title: "BC Probate Guide 2025 | ProbateDesk",
    description: "The complete guide to probate in British Columbia for executors.",
    url: "https://probatedesk.ca/info/guides/bc-probate-guide",
    type: "article",
  },
};

const toc = [
  { id: "what-is-probate", title: "What is probate?", level: 2 },
  { id: "when-needed", title: "When do you need probate?", level: 2 },
  { id: "timeline", title: "How long does it take?", level: 2 },
  { id: "costs", title: "Fees and costs", level: 2 },
  { id: "grant-types", title: "Grant types", level: 2 },
  { id: "forms", title: "BC probate forms", level: 2 },
  { id: "executor-duties", title: "Executor duties", level: 2 },
  { id: "intestacy", title: "Without a will", level: 2 },
  { id: "after-grant", title: "After the grant", level: 2 },
  { id: "faq", title: "FAQ", level: 2 },
];

const faqs = [
  {
    question: "How long does probate take in BC?",
    answer: "Most straightforward BC probate applications take 4-8 weeks for court processing after filing. The entire process from death to estate closure typically takes 6-12 months."
  },
  {
    question: "How much does probate cost in BC?",
    answer: "BC probate costs include a $200 court filing fee plus probate fees of approximately 1.4% on estate value over $50,000. A $500,000 estate pays about $6,650 total."
  },
  {
    question: "Do all estates need probate in BC?",
    answer: "No. Joint assets, accounts with named beneficiaries (RRSPs, TFSAs, life insurance), and small estates under $25,000 may avoid probate."
  },
  {
    question: "Can I do probate without a lawyer in BC?",
    answer: "Yes. BC allows executors to handle probate themselves. ProbateDesk helps you prepare all forms starting at $799 depending on the service level you need."
  },
  {
    question: "What's the difference between probate and grant of administration?",
    answer: "Grant of probate is issued when there's a valid will. Grant of administration is issued when there's no will (intestacy) or the named executor can't act."
  },
];

const schema = articleSchema({
  title: "The Complete BC Probate Guide 2025",
  description: "Everything BC executors need to know about probate",
  datePublished: "2025-01-01",
  dateModified: "2025-12-13",
  url: "https://probatedesk.ca/info/guides/bc-probate-guide",
});

export default function BCProbateGuidePage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />

      <InfoPageLayout
        breadcrumbs={[
          { label: "Info Center", href: "/info" },
          { label: "Guides", href: "/info/guides" },
          { label: "BC Probate Guide" },
        ]}
        eyebrow="Comprehensive guide"
        title="The Complete BC Probate Guide"
        description="Everything you need to understand probate in British Columbia. This guide covers when probate is required, what forms you need, how long it takes, what it costs, and what to do after you receive the grant."
        lastUpdated="December 2025"
        readingTime="25 min"
        toc={toc}
      >
        {/* INTRO - Direct answer for AI snippets */}
        <p className="text-lg leading-relaxed">
          <strong>Probate</strong> in British Columbia is the court process that confirms an executor's 
          authority to deal with a deceased person's estate. The Supreme Court of BC reviews the will, 
          verifies the executor's identity, and issues a "grant of probate" that banks, land registries, 
          and other institutions require before releasing assets.
        </p>

        <p>
          This guide walks through every aspect of BC probate: when it's required, what forms to file, 
          how much it costs, how long it takes, and what happens after you receive the grant. It's built 
          to be a practical playbook you can follow in order without legal jargon.
        </p>

        <div className="my-8 grid gap-4 rounded-2xl border border-[color:var(--border-muted)] bg-[color:var(--bg-surface)] p-6 sm:grid-cols-2">
          <div>
            <p className="font-semibold text-[color:var(--brand)]">At a glance</p>
            <ul className="mt-2 space-y-1 text-[color:var(--muted-ink)]">
              <li>Probate confirms the will and the executor's authority</li>
              <li>Most estates take 6-12 months from start to finish</li>
              <li>Court costs are about 1.4% of estate value over $50,000</li>
              <li>Standard forms: P1, P2, P3/P4, P9, P10/P11</li>
              <li>You can do it yourself with careful paperwork</li>
            </ul>
          </div>
          <div>
            <p className="font-semibold text-[color:var(--brand)]">Fast path</p>
            <ol className="mt-2 space-y-1 text-[color:var(--muted-ink)]">
              <li>Order death certificates (5-10)</li>
              <li>Search for the original will and register a wills notice search</li>
              <li>List all assets and debts with values at death</li>
              <li>Send P1 notices and wait 21 days</li>
              <li>File the application package with fees</li>
            </ol>
          </div>
        </div>

        {/* SECTION: WHAT IS PROBATE */}
        <h2 id="what-is-probate" className="scroll-mt-24">What is probate in BC?</h2>
        
        <p>
          Probate is the legal process where the Supreme Court of British Columbia confirms that:
        </p>
        
        <ul>
          <li>The will presented is the deceased's last valid will</li>
          <li>The person applying (the executor) has authority to deal with the estate</li>
          <li>The court can issue an official document (the grant) proving this authority</li>
        </ul>

        <p>
          The grant of probate is a court-stamped certificate that tells financial institutions, 
          land registries, and other organizations: "This person has been verified by the court. 
          They have legal authority to access and distribute this estate." It attaches a certified copy 
          of the will and the registrar's signature and seal.
        </p>

        <p>
          Without probate, most banks won't release assets worth more than $25,000-$50,000. They want 
          the court's confirmation to protect themselves from claims by other potential beneficiaries 
          or creditors. The Land Title Office will not change property ownership without seeing a grant.
        </p>

        <div className="rounded-2xl border border-[color:var(--border-muted)] bg-[color:var(--bg-muted)] p-6 my-8">
          <p className="font-semibold text-[color:var(--brand)]">Key point</p>
          <p className="mt-2 text-[color:var(--muted-ink)]">
            Probate is governed by the <em>Wills, Estates and Succession Act</em> (WESA) and the 
            Supreme Court Civil Rules, Part 25. All probate forms (P1 through P25) are prescribed by these rules.
          </p>
        </div>

        <h3>Documents to gather on day one</h3>
        <ul>
          <li>Original will and any codicils (keep staples intact)</li>
          <li>Death certificate (order several certified copies)</li>
          <li>Government ID for the executor (passport or driver’s licence)</li>
          <li>Recent bank, investment, and pension statements</li>
          <li>Property tax notice or BC Assessment for each property</li>
          <li>List of beneficiaries with current contact details</li>
          <li>Any marriage, separation, or divorce documents (affects spouse status)</li>
        </ul>

        <p>
          <Link href="/info/guides/what-is-probate" className="text-[color:var(--brand)] underline">
            Read the full guide on what probate means →
          </Link>
        </p>

        <h3>What the court actually checks</h3>
        <ul>
          <li>Will signing: two adult witnesses, no beneficiary witnesses, and no obvious alterations</li>
          <li>Applicant identity: matches the executor named in the will</li>
          <li>Notices: everyone entitled received Form P1 and had 21 days to object</li>
          <li>Assets and fees: values are listed and probate fees calculated correctly</li>
          <li>Red flags: missing pages, staple marks, unexplained changes, or conflicting wills</li>
        </ul>

        <h3>If the will has problems</h3>
        <ul>
          <li><strong>Staples removed:</strong> File Form P16 explaining why and how the will was handled.</li>
          <li><strong>Handwritten changes:</strong> Use Form P4 (long form) and explain the alterations.</li>
          <li><strong>Missing original:</strong> You may attempt to prove a copy with extra affidavits. See <Link href="/info/answers/what-if-no-original-will" className="text-[color:var(--brand)] underline">no original will</Link>.</li>
          <li><strong>Foreign will:</strong> May require an affidavit of foreign law (Form P6).</li>
        </ul>

        <h3>What the court does NOT do</h3>
        <ul>
          <li>Police fairness of the will or mediate disputes</li>
          <li>Verify every asset value (they rely on your affidavit)</li>
          <li>Supervise the executor after the grant</li>
          <li>Guarantee against later claims from creditors or dependants</li>
        </ul>

        <h3>Quick glossary</h3>
        <ul>
          <li><strong>Grant:</strong> The court certificate proving executor authority.</li>
          <li><strong>Domicile:</strong> Where the deceased primarily lived; affects P10 vs P11.</li>
          <li><strong>Residue:</strong> What is left after paying debts and specific gifts.</li>
          <li><strong>Requisition:</strong> The court's written request for corrections.</li>
          <li><strong>Clearance certificate:</strong> CRA letter confirming taxes are paid.</li>
        </ul>

        <h3>Documents you file with the will</h3>
        <ul>
          <li>Original will with staples intact</li>
          <li>Any codicils (amendments)</li>
          <li>Original death certificate</li>
          <li>All completed probate forms</li>
          <li>Proof of notice delivery (P9 attachments)</li>
        </ul>

        {/* SECTION: WHEN DO YOU NEED PROBATE */}
        <h2 id="when-needed" className="scroll-mt-24">When do you need probate in BC?</h2>

        <p>
          Not every estate requires probate. The key question is whether assets are held in the 
          deceased's name alone and whether institutions will release them without court confirmation.
        </p>

        <h3>You likely need probate if:</h3>
        <ul>
          <li>The deceased owned real estate in BC in their name alone</li>
          <li>Bank accounts or investments exceed $25,000-$50,000 (depends on institution)</li>
          <li>The Land Title Office requires proof of executor authority</li>
          <li>Any institution specifically asks for a grant of probate</li>
          <li>There are multiple financial institutions involved and values add up</li>
          <li>You need to sue or defend a claim on behalf of the estate</li>
        </ul>

        <h3>You might NOT need probate if:</h3>
        <ul>
          <li>All assets were held jointly with right of survivorship</li>
          <li>All accounts have named beneficiaries (RRSPs, TFSAs, life insurance)</li>
          <li>The estate value is under $25,000</li>
          <li>Financial institutions agree to release funds with a notarized declaration</li>
        </ul>

        <p>
          <Link href="/info/guides/when-do-you-need-probate" className="text-[color:var(--brand)] underline">
            Read the full guide on when probate is required →
          </Link>
        </p>

        <h3>Decision flow you can follow today</h3>
        <ol>
          <li>List every asset with its ownership type (sole, joint, beneficiary).</li>
          <li>Call each bank and broker to ask, “Do you require probate for this balance?”</li>
          <li>Check property titles for "joint tenancy" wording; if missing, assume probate.</li>
          <li>If any single asset needs probate, plan to apply. You cannot partially probate.</li>
          <li>Document your calls and answers; it reassures beneficiaries you checked.</li>
        </ol>

        <h3>Asset-by-asset reality check</h3>
        <div className="overflow-x-auto my-6">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[color:var(--border-muted)]">
                <th className="py-3 text-left font-semibold text-[color:var(--brand)]">Asset</th>
                <th className="py-3 text-left font-semibold text-[color:var(--brand)]">Needs probate?</th>
                <th className="py-3 text-left font-semibold text-[color:var(--brand)]">Notes</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-[color:var(--border-muted)]">
                <td className="py-3">House in sole name</td>
                <td className="py-3">Yes</td>
                <td className="py-3">Land Title Office requires grant</td>
              </tr>
              <tr className="border-b border-[color:var(--border-muted)]">
                <td className="py-3">House in joint tenancy</td>
                <td className="py-3">No</td>
                <td className="py-3">File a transmission with death certificate</td>
              </tr>
              <tr className="border-b border-[color:var(--border-muted)]">
                <td className="py-3">Bank account $12,000</td>
                <td className="py-3">Maybe not</td>
                <td className="py-3">Many banks release under their threshold</td>
              </tr>
              <tr className="border-b border-[color:var(--border-muted)]">
                <td className="py-3">Investment account $80,000</td>
                <td className="py-3">Likely yes</td>
                <td className="py-3">Broker usually requires a grant</td>
              </tr>
              <tr className="border-b border-[color:var(--border-muted)]">
                <td className="py-3">RRSP with beneficiary</td>
                <td className="py-3">No</td>
                <td className="py-3">Paid directly to beneficiary</td>
              </tr>
              <tr>
                <td className="py-3">Vehicle</td>
                <td className="py-3">Depends</td>
                <td className="py-3">ICBC has simplified process under $25k</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3>Institution conversations to have early</h3>
        <ul>
          <li>Call each bank with a death certificate and ask their threshold</li>
          <li>Ask investment advisors if a notarized indemnity is acceptable for small accounts</li>
          <li>For property, order a title search to confirm ownership type</li>
          <li>Document every answer so you can show beneficiaries your due diligence</li>
        </ul>

        <h3>How to value common assets</h3>
        <ul>
          <li><strong>Bank accounts:</strong> Use the balance on the date of death (get a statement or bank letter).</li>
          <li><strong>Investments:</strong> Ask the broker for a date-of-death valuation or print the statement that covers that date.</li>
          <li><strong>Real estate:</strong> Use BC Assessment as a starting point; for accuracy, include a realtor's market letter.</li>
          <li><strong>Vehicles:</strong> Use an ICBC valuation or a reputable pricing guide (e.g., Canadian Black Book).</li>
          <li><strong>Personal property:</strong> Only list high-value items (art, jewelry); ordinary furniture is usually nominal.</li>
        </ul>

        <div className="my-8 rounded-2xl border border-[color:var(--border-muted)] bg-[color:var(--bg-surface)] p-6">
          <p className="font-semibold text-[color:var(--brand)]">Two quick examples</p>
          <p className="mt-2 text-[color:var(--muted-ink)]"><strong>Example 1:</strong> Vancouver condo in sole name + $40k in savings. Probate required for the condo, so you must apply even though the bank might not insist.</p>
          <p className="mt-3 text-[color:var(--muted-ink)]"><strong>Example 2:</strong> Joint house with spouse + RRSP with named beneficiary + $12k chequing. Likely no probate; the bank may release $12k with a death certificate and indemnity.</p>
        </div>

        {/* SECTION: TIMELINE */}
        <h2 id="timeline" className="scroll-mt-24">How long does BC probate take?</h2>

        <p>Here's a typical timeline for a straightforward BC estate:</p>

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
                <td className="py-3">Gathering documents</td>
                <td className="py-3">1-4 weeks</td>
              </tr>
              <tr className="border-b border-[color:var(--border-muted)]">
                <td className="py-3">Wills notice search</td>
                <td className="py-3">2-4 weeks</td>
              </tr>
              <tr className="border-b border-[color:var(--border-muted)]">
                <td className="py-3">Preparing forms</td>
                <td className="py-3">1-2 weeks</td>
              </tr>
              <tr className="border-b border-[color:var(--border-muted)]">
                <td className="py-3">P1 notices + waiting period</td>
                <td className="py-3">21+ days</td>
              </tr>
              <tr className="border-b border-[color:var(--border-muted)]">
                <td className="py-3">Court processing</td>
                <td className="py-3">4-8 weeks</td>
              </tr>
              <tr className="border-b border-[color:var(--border-muted)]">
                <td className="py-3">Post-grant administration</td>
                <td className="py-3">3-9 months</td>
              </tr>
              <tr>
                <td className="py-3 font-semibold">Total</td>
                <td className="py-3 font-semibold">6-12 months</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p>
          <Link href="/info/guides/probate-timeline" className="text-[color:var(--brand)] underline">
            Read the detailed probate timeline →
          </Link>
        </p>

        <h3>Week-by-week starter plan</h3>
        <ul>
          <li><strong>Week 1:</strong> Secure home, find will, order death certificates</li>
          <li><strong>Week 2:</strong> Mail wills notice search request, list all assets/debts</li>
          <li><strong>Week 3:</strong> Draft P1 notices, confirm addresses, gather beneficiary emails</li>
          <li><strong>Week 4:</strong> Send P1 by registered mail, start filling P2/P3/P10</li>
          <li><strong>Week 5:</strong> Wait out 21-day period, book notary appointment for affidavits</li>
          <li><strong>Week 6:</strong> Assemble package and file at the registry</li>
        </ul>

        <h3>Pre-filing checklist (print and tick)</h3>
        <ul>
          <li>☐ Original will located and kept in its original state</li>
          <li>☐ Wills notice search requested (keep the receipt)</li>
          <li>☐ All beneficiaries' addresses verified (mail and email)</li>
          <li>☐ Asset list complete with values as of death</li>
          <li>☐ Debts listed with creditor contact info</li>
          <li>☐ P1 notices drafted for every person entitled</li>
          <li>☐ Court registry chosen (nearest to deceased's residence)</li>
          <li>☐ Notary/commissioner booked for affidavits</li>
          <li>☐ Money set aside for fees ($200 filing + probate fee)</li>
        </ul>

        <h3>How to file: in person, courier, or mail</h3>
        <ul>
          <li><strong>In person:</strong> Fastest acknowledgment. You get a stamped copy showing the filing date.</li>
          <li><strong>Courier:</strong> Good if you live far from the registry. Include a return waybill.</li>
          <li><strong>Mail:</strong> Slowest but acceptable. Use tracked mail and pad timelines accordingly.</li>
        </ul>

        <h3>What slows everything down</h3>
        <ul>
          <li>Waiting to start the wills notice search (built-in 2-4 week delay)</li>
          <li>Incorrect addresses on P1 notices leading to redelivery</li>
          <li>Math errors on P10/P11 triggering a requisition</li>
          <li>Missing staple holes on the will (court questions authenticity)</li>
          <li>Disagreements between co-executors</li>
          <li>Backlogs at busy registries like Vancouver</li>
        </ul>

        <h3>10-step application sequence</h3>
        <ol>
          <li>Secure the will and order death certificates.</li>
          <li>Submit the wills notice search request (cannot file without it).</li>
          <li>Create the asset and debt inventory with date-of-death values.</li>
          <li>Draft and send P1 notices by registered mail; calendar the 21-day wait.</li>
          <li>Complete P2 with registry selection and fee calculation.</li>
          <li>Choose P3 (simple) or P4 (complex) and fill in details carefully.</li>
          <li>Complete P10 or P11 based on the deceased's domicile.</li>
          <li>Swear P3/P4, P9, and P10/P11 in front of a commissioner.</li>
          <li>Assemble the package with the original will, death certificate, and fees.</li>
          <li>File at the registry and track the file number for status checks.</li>
        </ol>

        <h3>Example: filing a simple Vancouver estate</h3>
        <ol>
          <li><strong>Facts:</strong> Will names daughter as executor. Assets: $550k condo (sole name), $60k chequing, $40k TFSA with beneficiary, Toyota Camry.</li>
          <li><strong>Decision:</strong> Probate required because of the condo and bank balance.</li>
          <li><strong>Week 1:</strong> Daughter finds the will, orders 8 death certificates, and locks the condo.</li>
          <li><strong>Week 2:</strong> Sends wills notice search; calls bank and confirms they need a grant.</li>
          <li><strong>Week 3:</strong> Sends P1 to the brother (beneficiary) by registered mail.</li>
          <li><strong>Week 4:</strong> Completes P2, P3, P9, and P10 using BC Assessment value for the condo and bank statement values.</li>
          <li><strong>Week 5:</strong> Swears affidavits at a notary, assembles the package, and files at the Vancouver registry with a cheque for fees.</li>
          <li><strong>Week 11:</strong> Receives the grant, orders 4 certified copies, and starts presenting them to the bank and Land Title Office.</li>
          <li><strong>Month 6:</strong> Pays debts, sells the condo, files taxes, holds back 15% until CRA clearance, then distributes.</li>
        </ol>

        {/* SECTION: COSTS */}
        <h2 id="costs" className="scroll-mt-24">BC probate fees and costs</h2>

        <h3>Court filing fee</h3>
        <p>A flat <strong>$200</strong> filing fee when you submit your application.</p>

        <h3>Probate fees (estate administration tax)</h3>
        <ul>
          <li>No fee on the first $25,000</li>
          <li>$6 per $1,000 (0.6%) on value $25,000-$50,000</li>
          <li>$14 per $1,000 (1.4%) on value over $50,000</li>
        </ul>

        <div className="rounded-2xl border border-[color:var(--border-muted)] bg-[color:var(--bg-muted)] p-6 my-8">
          <p className="font-semibold text-[color:var(--brand)]">Example: $500,000 estate</p>
          <p className="mt-2 text-[color:var(--muted-ink)]">
            $0 (first $25k) + $150 (next $25k) + $6,300 (remaining $450k) = <strong>$6,450</strong> probate fees + $200 filing = <strong>$6,650 total court costs</strong>
          </p>
        </div>

        <h3>Other costs</h3>
        <ul>
          <li>Commissioner/notary: $50-$150</li>
          <li>Wills notice search: ~$20</li>
          <li>Certified grant copies: $40 each</li>
          <li>Professional help: $799-$15,000+ depending on service level</li>
          <li>Registered mail for P1: $15-$25 per person</li>
          <li>Land title searches/transfers: $50-$200+</li>
        </ul>

        <p>
          <Link href="/info/guides/probate-fees-costs" className="text-[color:var(--brand)] underline">
            See the full breakdown of probate costs →
          </Link>
        </p>

        <div className="overflow-x-auto my-8">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[color:var(--border-muted)]">
                <th className="py-3 text-left font-semibold text-[color:var(--brand)]">Estate value</th>
                <th className="py-3 text-left font-semibold text-[color:var(--brand)]">Probate fees</th>
                <th className="py-3 text-left font-semibold text-[color:var(--brand)]">Total with $200 filing</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-[color:var(--border-muted)]">
                <td className="py-3">$150,000</td>
                <td className="py-3">$1,850</td>
                <td className="py-3">$2,050</td>
              </tr>
              <tr className="border-b border-[color:var(--border-muted)]">
                <td className="py-3">$300,000</td>
                <td className="py-3">$4,150</td>
                <td className="py-3">$4,350</td>
              </tr>
              <tr>
                <td className="py-3">$750,000</td>
                <td className="py-3">$10,450</td>
                <td className="py-3">$10,650</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3>Fee calculation checklist</h3>
        <ul>
          <li>Use date-of-death values (not today's values)</li>
          <li>List only assets that pass through probate</li>
          <li>Round to the nearest dollar for each asset before totaling</li>
          <li>Keep your math steps; the court may ask how you calculated</li>
        </ul>

        <h3>Paying the fees</h3>
        <ul>
          <li>Bring a cheque or money order payable to “Minister of Finance” when filing in person.</li>
          <li>If filing by mail or courier, include the cheque in the package.</li>
          <li>Some registries accept debit. Call ahead if you prefer to pay that way.</li>
          <li>Keep the stamped receipt; it is proof the application was accepted for processing.</li>
        </ul>

        <h3>Covering costs when the estate is frozen</h3>
        <ul>
          <li>Executors often pay fees personally, then reimburse from estate funds after the grant.</li>
          <li>Beneficiaries can contribute temporarily if everyone agrees in writing.</li>
          <li>Some banks release small amounts specifically for probate fees if you show invoices.</li>
        </ul>

        {/* SECTION: GRANT TYPES */}
        <h2 id="grant-types" className="scroll-mt-24">Grant of probate vs grant of administration</h2>

        <h3>Grant of probate</h3>
        <p>Issued when there's a valid will and the named executor is applying. Most common type.</p>

        <h3>Grant of administration with will annexed</h3>
        <p>Issued when there's a will but the named executor can't or won't act.</p>

        <h3>Grant of administration (intestacy)</h3>
        <p>Issued when there's no will. Estate distributed according to WESA intestacy rules.</p>

        <p>
          <Link href="/info/guides/grant-types" className="text-[color:var(--brand)] underline">
            Learn more about grant types →
          </Link>
        </p>

        <div className="overflow-x-auto my-8">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[color:var(--border-muted)]">
                <th className="py-3 text-left font-semibold text-[color:var(--brand)]">Scenario</th>
                <th className="py-3 text-left font-semibold text-[color:var(--brand)]">Grant type</th>
                <th className="py-3 text-left font-semibold text-[color:var(--brand)]">Main affidavit</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-[color:var(--border-muted)]">
                <td className="py-3">Valid will, executor applying</td>
                <td className="py-3">Grant of probate</td>
                <td className="py-3">P3 or P4</td>
              </tr>
              <tr className="border-b border-[color:var(--border-muted)]">
                <td className="py-3">Valid will, executor renounced</td>
                <td className="py-3">Admin with will annexed</td>
                <td className="py-3">P3 or P4 + P7 (renunciation)</td>
              </tr>
              <tr>
                <td className="py-3">No will</td>
                <td className="py-3">Grant of administration</td>
                <td className="py-3">P5</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3>Choosing the right registry</h3>
        <p>File in the probate registry closest to where the deceased lived. Higher volume registries (Vancouver, Victoria) can be slightly slower. For filing tips, see the <Link href="/info/registries/vancouver" className="text-[color:var(--brand)] underline">Vancouver registry guide</Link> or the <Link href="/info/registries/victoria" className="text-[color:var(--brand)] underline">Victoria registry guide</Link>.</p>

        <h3>How to choose the correct grant</h3>
        <ul>
          <li>If you are the executor named in a valid will, apply for a grant of probate.</li>
          <li>If the named executor refuses or has died, apply for administration with will annexed.</li>
          <li>If there is no will, apply for a grant of administration and follow intestacy rules.</li>
          <li>When in doubt, read the will's executor clause carefully—alternate executors may be named.</li>
        </ul>

        {/* SECTION: FORMS */}
        <h2 id="forms" className="scroll-mt-24">BC probate forms explained</h2>

        <p>Common forms for a standard "with will" application:</p>

        <div className="overflow-x-auto my-8">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[color:var(--border-muted)]">
                <th className="py-3 text-left font-semibold text-[color:var(--brand)]">Form</th>
                <th className="py-3 text-left font-semibold text-[color:var(--brand)]">Purpose</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-[color:var(--border-muted)]">
                <td className="py-3 font-medium">P1</td>
                <td className="py-3">Notice of proposed application (sent to beneficiaries)</td>
              </tr>
              <tr className="border-b border-[color:var(--border-muted)]">
                <td className="py-3 font-medium">P2</td>
                <td className="py-3">Submission for estate grant (cover sheet)</td>
              </tr>
              <tr className="border-b border-[color:var(--border-muted)]">
                <td className="py-3 font-medium">P3</td>
                <td className="py-3">Affidavit of applicant (short form, simple cases)</td>
              </tr>
              <tr className="border-b border-[color:var(--border-muted)]">
                <td className="py-3 font-medium">P4</td>
                <td className="py-3">Affidavit of applicant (long form, complex cases)</td>
              </tr>
              <tr className="border-b border-[color:var(--border-muted)]">
                <td className="py-3 font-medium">P9</td>
                <td className="py-3">Affidavit of delivery (proves P1 notices sent)</td>
              </tr>
              <tr className="border-b border-[color:var(--border-muted)]">
                <td className="py-3 font-medium">P10</td>
                <td className="py-3">Affidavit of assets and liabilities (BC domiciled)</td>
              </tr>
              <tr>
                <td className="py-3 font-medium">P11</td>
                <td className="py-3">Affidavit of assets and liabilities (non-BC domiciled)</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p>
          <Link href="/info/guides/bc-probate-forms" className="text-[color:var(--brand)] underline">
            See the complete forms reference →
          </Link>
        </p>

        <h3>Information you need before filling any form</h3>
        <ul>
          <li>Full legal name of the deceased exactly as on the will and death certificate</li>
          <li>Social insurance number (needed for tax filings later, not on the forms)</li>
          <li>Last address and place of death</li>
          <li>Names and addresses of every beneficiary and close relative</li>
          <li>Asset values at death with supporting statements</li>
          <li>Details of any previous marriages or separated spouses</li>
        </ul>

        <h3>Top mistakes that trigger a requisition</h3>
        <ul>
          <li>Missing or wrong dates on P1 and P9 (delivery dates must be clear)</li>
          <li>Using current account balances instead of date-of-death balances</li>
          <li>Staple holes missing from the will (court suspects a different will was attached)</li>
          <li>Affidavits signed before the jurat was completed or without location</li>
          <li>Leaving out a beneficiary because of an old address list</li>
        </ul>

        <h3>If the estate has assets outside BC</h3>
        <ul>
          <li>Use Form P11 if the deceased lived outside BC but owned BC assets.</li>
          <li>Foreign real estate usually needs a separate local process; list it for awareness but it may not be part of BC probate.</li>
          <li>Some banks with national presence still want a BC grant before releasing BC-held accounts.</li>
        </ul>

        <h3>Packaging tips that prevent requisitions</h3>
        <ul>
          <li>Keep the original will staples intact. If removed, explain with Form P16.</li>
          <li>Number pages in pencil at the top right to keep order while copying.</li>
          <li>Use paper clips, not staples, to hold each affidavit with exhibits.</li>
          <li>Place the P2 submission on top; the registry timestamps this first.</li>
          <li>Include a self-addressed envelope if you want the grant mailed back.</li>
        </ul>

        <h3>Proof of delivery for P1</h3>
        <ul>
          <li>Use registered mail or courier with tracking; keep the tracking printout.</li>
          <li>For hand delivery, have the recipient sign and date a simple acknowledgment.</li>
          <li>Attach the proof to P9. If the court cannot see how notices were delivered, they'll requisition.</li>
        </ul>

        <h3>What to do if you receive a requisition</h3>
        <ol>
          <li>Read it slowly. Each numbered point is a specific fix.</li>
          <li>Address every item, even if you think it's minor.</li>
          <li>Use a short cover letter summarizing how you fixed each point.</li>
          <li>Return the corrected documents promptly; delays restart the queue.</li>
          <li>Keep a copy of the requisition and your response for your records.</li>
        </ol>

        <h3>Commissioning affidavits</h3>
        <ul>
          <li>Do not sign sworn forms at home. Sign in front of a notary or lawyer.</li>
          <li>Bring ID and every page of the form; some commissioners insist you initial each page.</li>
          <li>Check the jurat (bottom) includes city, province, and date.</li>
        </ul>

        {/* SECTION: EXECUTOR DUTIES */}
        <h2 id="executor-duties" className="scroll-mt-24">Executor duties in BC</h2>

        <p>As executor, you must:</p>

        <ul>
          <li>Locate and secure the original will</li>
          <li>Identify and protect estate assets</li>
          <li>Notify beneficiaries and potential heirs</li>
          <li>Apply for probate (if required)</li>
          <li>Pay valid debts and expenses</li>
          <li>File final tax returns for the deceased</li>
          <li>Distribute assets according to the will</li>
          <li>Keep detailed records of all transactions</li>
        </ul>

        <p>
          Executors can be held personally liable for mistakes like distributing assets before 
          paying debts or missing tax obligations.
        </p>

        <p>
          <Link href="/info/guides/executor-duties" className="text-[color:var(--brand)] underline">
            Read the full executor duties guide →
          </Link>
        </p>

        <h3>Risk control checklist</h3>
        <ul>
          <li>Open an estate bank account to avoid mixing funds</li>
          <li>Keep a spreadsheet ledger of every expense and deposit</li>
          <li>Get written releases from beneficiaries at distribution</li>
          <li>Hold back 10-20% until taxes and surprise bills are cleared</li>
        </ul>

        <h3>Working with co-executors</h3>
        <ul>
          <li>Decide early who will be the primary contact for banks and the court.</li>
          <li>Use a shared folder for statements and receipts so everyone sees the same information.</li>
          <li>Require two signatures on withdrawals over an agreed amount.</li>
          <li>If you disagree, document options and seek consensus; courts dislike stalemates.</li>
        </ul>

        <h3>If there are minor or dependent beneficiaries</h3>
        <ul>
          <li>Notify the Public Guardian and Trustee where required (they protect minors' interests).</li>
          <li>Keep funds in trust accounts until the beneficiary turns 19 or the will's age.</li>
          <li>Invest conservatively; executors are expected to preserve capital for minors.</li>
        </ul>

        <h3>If someone is likely to contest</h3>
        <ul>
          <li>Send P1 notices promptly so timelines are clear and on record.</li>
          <li>Keep your communication neutral and factual—avoid commentary on fairness.</li>
          <li>Consider holding back more funds to cover potential legal costs.</li>
          <li>If a notice of dispute is filed, the registry will pause the grant until it is resolved.</li>
        </ul>

        {/* SECTION: INTESTACY */}
        <h2 id="intestacy" className="scroll-mt-24">Probate without a will (intestacy)</h2>

        <p>
          When someone dies without a will, BC's intestacy rules determine who inherits:
        </p>

        <ul>
          <li>Use Form P5 instead of P3/P4</li>
          <li>Distribution follows WESA intestacy rules</li>
          <li>Priority for administrator: spouse → children → parents → siblings</li>
        </ul>

        <h3>BC intestacy distribution (simplified)</h3>
        <ul>
          <li><strong>Spouse only:</strong> spouse gets everything</li>
          <li><strong>Spouse + children of that spouse:</strong> spouse gets everything</li>
          <li><strong>Spouse + children from another relationship:</strong> spouse gets household items + $300,000 + 50% of remainder</li>
          <li><strong>No spouse:</strong> children inherit equally</li>
        </ul>

        <p>
          <Link href="/info/guides/probate-without-will" className="text-[color:var(--brand)] underline">
            Learn more about intestacy in BC →
          </Link>
        </p>

        <h3>Extra paperwork when there's no will</h3>
        <ul>
          <li>Affidavits proving your priority to apply</li>
          <li>Renunciations from others with equal or higher priority</li>
          <li>A detailed family tree to show who must be notified</li>
        </ul>

        <h3>Edge cases to watch</h3>
        <ul>
          <li><strong>Separated but not divorced spouses:</strong> They may still qualify as a spouse depending on facts.</li>
          <li><strong>Common-law partners:</strong> Need at least 2 years living in a marriage-like relationship.</li>
          <li><strong>Multiple relationships:</strong> Two people can both qualify as spouse; distribution becomes more complex.</li>
          <li><strong>Missing heirs:</strong> You may need a genealogist or investigator to prove reasonable search efforts.</li>
        </ul>

        {/* SECTION: AFTER GRANT */}
        <h2 id="after-grant" className="scroll-mt-24">After the grant: estate administration</h2>

        <p>Getting the grant is not the end. Post-grant tasks include:</p>

        <h3>Collecting assets</h3>
        <ul>
          <li>Present grant to banks and brokerages</li>
          <li>Transfer or sell real property</li>
          <li>Collect insurance and pension benefits</li>
          <li>Move funds into an estate account to simplify tracking</li>
        </ul>

        <h3>Paying debts</h3>
        <ul>
          <li>Pay funeral costs</li>
          <li>Settle bills and loans</li>
          <li>Be careful: you're liable if you distribute before paying debts</li>
          <li>Consider publishing a notice to creditors for large estates</li>
        </ul>

        <h3>Taxes</h3>
        <ul>
          <li>File deceased's final tax return</li>
          <li>Consider CRA clearance certificate before final distribution</li>
          <li>Track any capital gains from selling estate property</li>
        </ul>

        <h3>Distribution</h3>
        <ul>
          <li>Follow will instructions exactly</li>
          <li>Get releases from beneficiaries</li>
          <li>Document everything</li>
          <li>Keep receipts and bank records for at least 7 years</li>
        </ul>

        <p>
          <Link href="/info/guides/after-the-grant" className="text-[color:var(--brand)] underline">
            Read the post-grant administration guide →
          </Link>
        </p>

        <h3>Reporting to beneficiaries</h3>
        <ul>
          <li>Share a simple statement: assets in, expenses out, balance remaining</li>
          <li>Offer copies of major receipts if asked</li>
          <li>Explain any holdback and when you expect to release it</li>
        </ul>

        <h3>Common beneficiary questions (and quick answers)</h3>
        <ul>
          <li><strong>“Why is it taking so long?”</strong> Because of the wills search, 21-day notice period, and registry queue.</li>
          <li><strong>“Can I have an advance?”</strong> Only if debts are clearly covered and all beneficiaries agree.</li>
          <li><strong>“How much are the fees?”</strong> Court fees are about 1.4% of probate assets; your expenses are tracked in the ledger.</li>
          <li><strong>“When will I get my share?”</strong> Typically after debts and taxes are paid—often months after the grant.</li>
        </ul>

        <h3>Closing checklist before final cheques</h3>
        <ul>
          <li>☐ All known debts paid and receipts saved</li>
          <li>☐ Taxes filed; clearance certificate requested if estate is sizable</li>
          <li>☐ Distribution schedule reviewed by beneficiaries</li>
          <li>☐ Releases prepared and ready for signature</li>
          <li>☐ Final bank balance reconciled to the penny</li>
        </ul>

        <h3>Sample communication script</h3>
        <p>Keep updates short and factual. For example:</p>
        <p className="text-[color:var(--muted-ink)] italic">“We filed the probate application on March 10. The registry's current processing estimate is 6 weeks. While we wait, I'm collecting asset statements and preparing the estate account. I'll update you when the grant arrives.”</p>

        <h3>Record-keeping template</h3>
        <ul>
          <li>Date, description, amount, and category for every transaction</li>
          <li>Running balance that matches the estate bank statement</li>
          <li>Column for which beneficiary the cost relates to (if specific)</li>
          <li>File names for receipts so you can retrieve proof quickly</li>
        </ul>

        <h3>If the estate might be insolvent</h3>
        <ul>
          <li>Pause distributions immediately and total assets versus debts.</li>
          <li>Pay in priority order: funeral costs, secured debts, taxes, then unsecured debts.</li>
          <li>Do not pay low-priority creditors until you're sure higher-priority claims are covered.</li>
          <li>Keep beneficiaries updated that they may receive nothing if debts exceed assets.</li>
          <li>Consider legal advice; insolvent estates are high-risk for executor liability.</li>
        </ul>

        {/* FAQ */}
        <FAQSection faqs={faqs} />

        {/* CTA */}
        <section className="mt-16 rounded-3xl bg-[color:var(--bg-muted)] p-8 text-center">
          <h2 className="font-serif text-2xl text-[color:var(--brand)]">Need help with BC probate?</h2>
          <p className="mx-auto mt-4 max-w-2xl text-[color:var(--muted-ink)]">
            ProbateDesk prepares all your BC probate forms with flexible service tiers starting at $799.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-4">
            <Link href="/create-account" className="rounded-full bg-[color:var(--brand)] px-6 py-3 font-semibold text-white hover:bg-[color:var(--accent-dark)]">
              Start intake
            </Link>
            <Link href="/how-it-works" className="rounded-full border border-[color:var(--brand)] px-6 py-3 font-semibold text-[color:var(--brand)] hover:bg-[color:var(--brand)] hover:text-white">
              See how it works
            </Link>
          </div>
        </section>
      </InfoPageLayout>
    </>
  );
}
