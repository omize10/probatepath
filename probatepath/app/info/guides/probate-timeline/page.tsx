/* eslint-disable react/no-unescaped-entities */
import type { Metadata } from "next";
import Link from "next/link";
import { InfoPageLayout } from "@/components/info/InfoPageLayout";
import { FAQSection } from "@/components/info/FAQSection";
import { articleSchema } from "@/lib/info/schema";

export const metadata: Metadata = {
  title: "BC Probate Timeline | How Long Each Phase Takes",
  description: "BC probate typically takes 6-12 months total. Learn how long each phase takes: gathering documents, notices, court processing, and estate administration.",
  keywords: ["how long does probate take BC", "probate timeline", "BC probate duration", "probate waiting time"],
};

const toc = [
  { id: "overview", title: "Timeline overview", level: 2 },
  { id: "phase-1", title: "Phase 1: Preparation", level: 2 },
  { id: "phase-2", title: "Phase 2: Notices", level: 2 },
  { id: "phase-3", title: "Phase 3: Filing", level: 2 },
  { id: "phase-4", title: "Phase 4: Court processing", level: 2 },
  { id: "phase-5", title: "Phase 5: Post-grant", level: 2 },
  { id: "delays", title: "What causes delays", level: 2 },
  { id: "speed-up", title: "How to speed things up", level: 2 },
  { id: "faq", title: "FAQ", level: 2 },
];

const faqs = [
  {
    question: "Can I access any money while waiting for probate?",
    answer: "Sometimes. Joint accounts pass immediately. Some banks release small amounts for funeral costs with a death certificate. But most significant assets are frozen until you have the grant."
  },
  {
    question: "What if I need to pay the mortgage during probate?",
    answer: "This is common. You may need to use your own funds temporarily and reimburse yourself from the estate later. Some lenders will work with executors on temporary arrangements. Document everything."
  },
  {
    question: "Can I hire someone to speed up the process?",
    answer: "Professional help (lawyers or services like ProbateDesk) can reduce delays from paperwork errors. But court processing time is fixed - no one can make the registry work faster."
  },
];

const schema = articleSchema({
  title: "BC Probate Timeline",
  description: "How long each phase of BC probate takes",
  datePublished: "2025-01-01",
  dateModified: "2026-01-24",
  url: "https://probatedesk.com/info/guides/probate-timeline",
});

export default function ProbateTimelinePage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />

      <InfoPageLayout
        breadcrumbs={[
          { label: "Info Center", href: "/info" },
          { label: "Guides", href: "/info/guides" },
          { label: "Probate Timeline" },
        ]}
        eyebrow="Guide"
        title="BC Probate Timeline"
        description="A realistic breakdown of how long each phase of probate takes in British Columbia, from first steps to closing the estate."
        lastUpdated="January 2026"
        readingTime="10 min"
        toc={toc}
      >
        <h2 id="overview" className="scroll-mt-24">Timeline overview</h2>

        <p className="text-lg leading-relaxed">
          <strong>Total time:</strong> Most straightforward BC estates take <strong>6-12 months</strong> from 
          death to final distribution. Court processing alone is typically 4-8 weeks after filing, but 
          the preparation before and administration after take longer.
        </p>

        <div className="overflow-x-auto my-8">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[color:var(--border-muted)]">
                <th className="py-3 text-left font-semibold text-[color:var(--brand)]">Phase</th>
                <th className="py-3 text-left font-semibold text-[color:var(--brand)]">Duration</th>
                <th className="py-3 text-left font-semibold text-[color:var(--brand)]">Cumulative</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-[color:var(--border-muted)]">
                <td className="py-3">1. Preparation (docs, wills search)</td>
                <td className="py-3">2-6 weeks</td>
                <td className="py-3">Week 6</td>
              </tr>
              <tr className="border-b border-[color:var(--border-muted)]">
                <td className="py-3">2. Notices (P1 + waiting period)</td>
                <td className="py-3">3-4 weeks</td>
                <td className="py-3">Week 10</td>
              </tr>
              <tr className="border-b border-[color:var(--border-muted)]">
                <td className="py-3">3. Filing application</td>
                <td className="py-3">1 week</td>
                <td className="py-3">Week 11</td>
              </tr>
              <tr className="border-b border-[color:var(--border-muted)]">
                <td className="py-3">4. Court processing</td>
                <td className="py-3">4-8 weeks</td>
                <td className="py-3">Week 19</td>
              </tr>
              <tr>
                <td className="py-3">5. Post-grant administration</td>
                <td className="py-3">3-9 months</td>
                <td className="py-3">Month 6-12</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h2 id="phase-1" className="scroll-mt-24">Phase 1: Preparation (2-6 weeks)</h2>

        <p>Before you can file anything, you need to:</p>

        <h3>Gather documents</h3>
        <ul>
          <li><strong>Original will:</strong> Search the deceased's home, safety deposit box, lawyer's office</li>
          <li><strong>Death certificate:</strong> Order from Vital Statistics or funeral home</li>
          <li><strong>Asset information:</strong> Bank statements, property titles, investment accounts</li>
          <li><strong>Beneficiary information:</strong> Names, addresses of everyone in the will</li>
        </ul>

        <h3>Wills notice search (2-4 weeks)</h3>
        <p>
          You must search the BC Wills Notice registry to confirm no other will was registered. 
          This requires mailing Form VSA 532 to Vital Statistics. Processing takes 2-4 weeks, 
          and you can't file your application without the result.
        </p>

        <div className="rounded-2xl border border-[color:var(--border-muted)] bg-[color:var(--bg-muted)] p-6 my-8">
          <p className="font-semibold text-[color:var(--brand)]">Tip: Start the wills search immediately</p>
          <p className="mt-2 text-[color:var(--muted-ink)]">
            The wills notice search is often the longest single delay. Mail the request as soon 
            as you have a death certificate. Do other preparation while waiting for results.
          </p>
        </div>

        <h2 id="phase-2" className="scroll-mt-24">Phase 2: Notices (3-4 weeks)</h2>

        <p>
          Before filing, you must send Form P1 (Notice of Proposed Application) to everyone 
          entitled to notice:
        </p>

        <ul>
          <li>All beneficiaries named in the will</li>
          <li>Anyone who would inherit if there was no will (spouse, children)</li>
          <li>Any other executor named in the will</li>
        </ul>

        <p>
          After sending notices, you must wait <strong>at least 21 days</strong> before filing. 
          This gives recipients time to object if they have concerns.
        </p>

        <h3>Timeline breakdown:</h3>
        <ul>
          <li>Prepare and mail P1 notices: 2-3 days</li>
          <li>Mail delivery time: 3-7 days</li>
          <li>Mandatory waiting period: 21 days minimum</li>
          <li><strong>Total: About 4 weeks</strong></li>
        </ul>

        <h2 id="phase-3" className="scroll-mt-24">Phase 3: Filing (1 week)</h2>

        <p>Once the waiting period ends:</p>

        <ul>
          <li>Have affidavits signed before a commissioner/notary</li>
          <li>Assemble the complete application package</li>
          <li>File at the appropriate probate registry</li>
          <li>Pay filing fee ($200) and probate fees</li>
        </ul>

        <p>
          This phase is quick if your paperwork is ready. Most executors can complete it in a 
          few days once the notice period ends.
        </p>

        <h2 id="phase-4" className="scroll-mt-24">Phase 4: Court processing (4-8 weeks)</h2>

        <p>
          After filing, the probate registry reviews your application. This is the "waiting" 
          phase where you have no control over timing.
        </p>

        <h3>What the court checks:</h3>
        <ul>
          <li>Forms are complete and consistent</li>
          <li>Will appears properly executed</li>
          <li>Notices were properly sent</li>
          <li>Fees are correctly calculated</li>
        </ul>

        <h3>Possible outcomes:</h3>
        <ul>
          <li><strong>Grant issued:</strong> Everything is in order. You receive the grant.</li>
          <li><strong>Requisition:</strong> The court has questions or needs corrections. You must respond before they continue processing.</li>
        </ul>

        <div className="rounded-2xl border-l-4 border-[color:var(--warning)] bg-[color:var(--bg-muted)] p-5 my-6">
          <p className="font-semibold text-[color:var(--brand)]">Requisitions add delays</p>
          <p className="mt-1 text-[color:var(--muted-ink)]">
            If the court finds issues, you'll receive a requisition letter. You must fix the 
            problems and respond. Each requisition can add 2-4 weeks to the timeline.
          </p>
        </div>

        <h2 id="phase-5" className="scroll-mt-24">Phase 5: Post-grant administration (3-9 months)</h2>

        <p>
          Getting the grant is not the end. Post-grant work often takes longer than getting 
          the grant itself:
        </p>

        <h3>Collecting assets (1-3 months)</h3>
        <ul>
          <li>Present grant to each financial institution</li>
          <li>Wait for their internal processing</li>
          <li>Transfer or sell real estate</li>
          <li>Close accounts and consolidate funds</li>
        </ul>

        <h3>Paying debts and taxes (1-2 months)</h3>
        <ul>
          <li>Pay outstanding bills</li>
          <li>File deceased's final tax return</li>
          <li>Potentially request CRA clearance certificate (can take 3-6 months)</li>
        </ul>

        <h3>Distribution (1-2 months)</h3>
        <ul>
          <li>Calculate final amounts for each beneficiary</li>
          <li>Prepare distribution statements</li>
          <li>Get releases signed</li>
          <li>Transfer assets to beneficiaries</li>
        </ul>

        <h2 id="delays" className="scroll-mt-24">What causes delays</h2>

        <ul>
          <li><strong>Missing documents:</strong> Can't find original will, death certificate delays</li>
          <li><strong>Incomplete forms:</strong> Errors cause requisitions from the court</li>
          <li><strong>Complex estates:</strong> Business interests, foreign assets, disputes</li>
          <li><strong>Court backlogs:</strong> Some registries are slower than others</li>
          <li><strong>CRA clearance:</strong> If you request one, it can take months</li>
          <li><strong>Real estate sales:</strong> Selling property adds time</li>
        </ul>

        <h2 id="speed-up" className="scroll-mt-24">How to speed things up</h2>

        <ol>
          <li><strong>Start the wills search immediately</strong> - don't wait</li>
          <li><strong>Gather all documents before starting forms</strong> - incomplete info causes errors</li>
          <li><strong>Double-check everything before filing</strong> - requisitions add weeks</li>
          <li><strong>Use professional help</strong> - fewer errors means faster processing</li>
          <li><strong>Respond to requisitions immediately</strong> - don't let them sit</li>
          <li><strong>File in a less busy registry</strong> - if you have a choice</li>
          <li><strong>Check status politely</strong> after a few weeks using your file number; registries sometimes clarify minor items over the phone.</li>
        </ol>

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
