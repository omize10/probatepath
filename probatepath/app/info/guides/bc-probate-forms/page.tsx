/* eslint-disable react/no-unescaped-entities */
import type { Metadata } from "next";
import Link from "next/link";
import { InfoPageLayout } from "@/components/info/InfoPageLayout";
import { FAQSection } from "@/components/info/FAQSection";
import { articleSchema } from "@/lib/info/schema";

export const metadata: Metadata = {
  title: "BC Probate Forms Explained | P1 to P25 Guide",
  description: "Complete guide to BC probate forms. Learn which P-forms you need, what each one does, and how to fill them out correctly.",
  keywords: ["BC probate forms", "form P1", "form P2", "form P3", "probate forms BC"],
};

const toc = [
  { id: "overview", title: "Forms overview", level: 2 },
  { id: "standard-package", title: "Standard application package", level: 2 },
  { id: "p1", title: "P1: Notice", level: 2 },
  { id: "p2", title: "P2: Submission", level: 2 },
  { id: "p3-p4", title: "P3/P4: Affidavit of applicant", level: 2 },
  { id: "p9", title: "P9: Affidavit of delivery", level: 2 },
  { id: "p10-p11", title: "P10/P11: Assets and liabilities", level: 2 },
  { id: "other-forms", title: "Other forms", level: 2 },
  { id: "tips", title: "Form completion tips", level: 2 },
  { id: "faq", title: "FAQ", level: 2 },
];

const faqs = [
  {
    question: "Where do I get the forms?",
    answer: "Official BC probate forms are available on the BC Government website under Court Services. They're PDF files that you fill in, print, and sign. ProbateDesk generates completed forms from your intake data."
  },
  {
    question: "Do I need to use the exact official forms?",
    answer: "Yes. The court requires forms that match the prescribed format exactly. Don't modify the layout or create your own versions."
  },
  {
    question: "What if I make a mistake on a form?",
    answer: "Minor errors can sometimes be corrected with a pen and initialed. Significant errors require reprinting the form. If you've already filed, the court may issue a requisition asking you to correct and resubmit."
  },
];

const schema = articleSchema({
  title: "BC Probate Forms Explained",
  description: "Complete guide to BC probate forms P1 through P25",
  datePublished: "2025-01-01",
  dateModified: "2025-12-13",
  url: "https://probatedesk.ca/info/guides/bc-probate-forms",
});

export default function BCProbateFormsPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />

      <InfoPageLayout
        breadcrumbs={[
          { label: "Info Center", href: "/info" },
          { label: "Guides", href: "/info/guides" },
          { label: "BC Probate Forms" },
        ]}
        eyebrow="Guide"
        title="BC Probate Forms Explained"
        description="Every BC probate form broken down: which ones you need, what they do, and how to complete them correctly."
        lastUpdated="December 2025"
        readingTime="15 min"
        toc={toc}
      >
        <h2 id="overview" className="scroll-mt-24">Forms overview</h2>

        <p className="text-lg leading-relaxed">
          BC uses standardized forms <strong>P1 through P25</strong> for probate applications. 
          A standard "with will" application needs 5-6 forms: <strong>P1, P2, P3 (or P4), P9, 
          and P10 (or P11)</strong>. Other forms handle special situations like renunciations, 
          foreign wills, or corrections.
        </p>

        <h2 id="standard-package" className="scroll-mt-24">Standard application package</h2>

        <p>For a straightforward BC estate with a will, you typically file:</p>

        <div className="overflow-x-auto my-8">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[color:var(--border-muted)]">
                <th className="py-3 text-left font-semibold text-[color:var(--brand)]">Form</th>
                <th className="py-3 text-left font-semibold text-[color:var(--brand)]">Name</th>
                <th className="py-3 text-left font-semibold text-[color:var(--brand)]">Sworn?</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-[color:var(--border-muted)]">
                <td className="py-3 font-medium">P1</td>
                <td className="py-3">Notice of proposed application</td>
                <td className="py-3">No</td>
              </tr>
              <tr className="border-b border-[color:var(--border-muted)]">
                <td className="py-3 font-medium">P2</td>
                <td className="py-3">Submission for estate grant</td>
                <td className="py-3">No</td>
              </tr>
              <tr className="border-b border-[color:var(--border-muted)]">
                <td className="py-3 font-medium">P3 or P4</td>
                <td className="py-3">Affidavit of applicant</td>
                <td className="py-3">Yes</td>
              </tr>
              <tr className="border-b border-[color:var(--border-muted)]">
                <td className="py-3 font-medium">P9</td>
                <td className="py-3">Affidavit of delivery</td>
                <td className="py-3">Yes</td>
              </tr>
              <tr>
                <td className="py-3 font-medium">P10 or P11</td>
                <td className="py-3">Affidavit of assets and liabilities</td>
                <td className="py-3">Yes</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p>
          "Sworn" means you sign in front of a commissioner, notary, or lawyer who watches 
          you sign and confirms your identity. Don't sign sworn forms in advance.
        </p>

        <h2 id="p1" className="scroll-mt-24">P1: Notice of proposed application</h2>

        <p><strong>Purpose:</strong> Notify everyone entitled to know about the probate application before you file.</p>

        <p><strong>Who gets P1:</strong></p>
        <ul>
          <li>Every beneficiary named in the will</li>
          <li>Anyone who would inherit if there was no will (spouse, children, parents)</li>
          <li>Any co-executors named in the will</li>
          <li>Anyone who might have a claim against the estate</li>
        </ul>

        <p><strong>Key information included:</strong></p>
        <ul>
          <li>Deceased's name and death date</li>
          <li>Applicant's name and contact</li>
          <li>Type of grant being applied for</li>
          <li>Deadline to respond (21 days from delivery)</li>
        </ul>

        <p><strong>How to send:</strong> Use registered mail or personal delivery. Keep proof of delivery for P9.</p>

        <div className="rounded-2xl border border-[color:var(--border-muted)] bg-[color:var(--bg-muted)] p-6 my-8">
          <p className="font-semibold text-[color:var(--brand)]">Important timing</p>
          <p className="mt-2 text-[color:var(--muted-ink)]">
            You must wait at least 21 days after ALL P1 notices are delivered before filing 
            your application. This gives recipients time to object.
          </p>
        </div>

        <h2 id="p2" className="scroll-mt-24">P2: Submission for estate grant</h2>

        <p><strong>Purpose:</strong> The "cover sheet" for your application. Summarizes what you're applying for.</p>

        <p><strong>Key information:</strong></p>
        <ul>
          <li>Type of grant requested (probate, administration, etc.)</li>
          <li>Deceased's details</li>
          <li>Applicant's details</li>
          <li>List of all documents being filed</li>
          <li>Estate value and probate fee calculation</li>
          <li>Which registry you're filing in</li>
        </ul>

        <p><strong>Not sworn:</strong> This is a submission form, not an affidavit. Just sign and date it.</p>

        <h2 id="p3-p4" className="scroll-mt-24">P3/P4: Affidavit of applicant</h2>

        <p><strong>Purpose:</strong> Your sworn statement about the will, the deceased, and your authority to act.</p>

        <p><strong>P3 (short form) vs P4 (long form):</strong></p>
        <ul>
          <li><strong>P3:</strong> For simple cases. Clean will, no issues, straightforward facts.</li>
          <li><strong>P4:</strong> For complex cases. Will has alterations, witnessing issues, foreign elements, or other complications.</li>
        </ul>

        <p><strong>Key statements you're swearing to:</strong></p>
        <ul>
          <li>The will attached is the original last will</li>
          <li>You are the executor named in the will</li>
          <li>The deceased died on [date] at [location]</li>
          <li>The deceased was domiciled in BC</li>
          <li>You will administer the estate according to law</li>
        </ul>

        <p><strong>Must be sworn:</strong> Sign only in front of a commissioner/notary. Bring ID.</p>

        <h2 id="p9" className="scroll-mt-24">P9: Affidavit of delivery</h2>

        <p><strong>Purpose:</strong> Prove you sent P1 notices to everyone required.</p>

        <p><strong>What you list:</strong></p>
        <ul>
          <li>Each person who received P1</li>
          <li>Their address</li>
          <li>How you delivered it (registered mail, personal delivery)</li>
          <li>Date of delivery</li>
        </ul>

        <p><strong>Attach proof:</strong> Canada Post tracking confirmations, signed delivery receipts.</p>

        <p><strong>Must be sworn:</strong> Sign in front of a commissioner/notary.</p>

        <h2 id="p10-p11" className="scroll-mt-24">P10/P11: Affidavit of assets and liabilities</h2>

        <p><strong>Purpose:</strong> List everything the deceased owned and owed. Used to calculate probate fees.</p>

        <p><strong>P10 vs P11:</strong></p>
        <ul>
          <li><strong>P10:</strong> Deceased was domiciled (primarily lived) in BC</li>
          <li><strong>P11:</strong> Deceased was domiciled outside BC but had BC assets</li>
        </ul>

        <p><strong>Assets to include:</strong></p>
        <ul>
          <li>Real estate (address, estimated value)</li>
          <li>Bank accounts (institution, balance at death)</li>
          <li>Investments (broker, value)</li>
          <li>Vehicles (description, value)</li>
          <li>Personal property of significant value</li>
        </ul>

        <p><strong>Do NOT include:</strong></p>
        <ul>
          <li>Joint assets (these pass outside the estate)</li>
          <li>RRSPs/TFSAs/insurance with named beneficiaries</li>
          <li>Assets outside BC (for P10)</li>
        </ul>

        <p><strong>Must be sworn:</strong> Sign in front of a commissioner/notary.</p>

        <h2 id="other-forms" className="scroll-mt-24">Other forms (when needed)</h2>

        <div className="overflow-x-auto my-8">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[color:var(--border-muted)]">
                <th className="py-3 text-left font-semibold text-[color:var(--brand)]">Form</th>
                <th className="py-3 text-left font-semibold text-[color:var(--brand)]">When needed</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-[color:var(--border-muted)]">
                <td className="py-3 font-medium">P5</td>
                <td className="py-3">Intestacy (no will) - replaces P3/P4</td>
              </tr>
              <tr className="border-b border-[color:var(--border-muted)]">
                <td className="py-3 font-medium">P6</td>
                <td className="py-3">Affidavit of foreign law (foreign will)</td>
              </tr>
              <tr className="border-b border-[color:var(--border-muted)]">
                <td className="py-3 font-medium">P7</td>
                <td className="py-3">Renunciation (executor declining to act)</td>
              </tr>
              <tr className="border-b border-[color:var(--border-muted)]">
                <td className="py-3 font-medium">P8</td>
                <td className="py-3">Affidavit of witness to will</td>
              </tr>
              <tr className="border-b border-[color:var(--border-muted)]">
                <td className="py-3 font-medium">P16</td>
                <td className="py-3">Affidavit explaining alterations to will</td>
              </tr>
              <tr>
                <td className="py-3 font-medium">P17</td>
                <td className="py-3">Proof of service (alternative to P9)</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h2 id="tips" className="scroll-mt-24">Form completion tips</h2>

        <ol>
          <li><strong>Type, don't handwrite.</strong> Fill forms electronically before printing. Handwriting causes errors and readability issues.</li>
          <li><strong>Match names exactly.</strong> Use the deceased's name exactly as it appears on the will and death certificate. If they differ, you may need to address this.</li>
          <li><strong>Don't sign sworn forms early.</strong> Affidavits must be signed in front of the commissioner. Bring them unsigned.</li>
          <li><strong>Double-check math.</strong> Probate fee calculations must be accurate. Errors cause requisitions.</li>
          <li><strong>Keep copies of everything.</strong> Before filing, make copies of all forms for your records.</li>
          <li><strong>Use current forms.</strong> Forms are updated occasionally. Always download fresh copies from the BC Government website.</li>
          <li><strong>Label exhibits clearly.</strong> If you attach statements or ID, mark them as Exhibit A, B, C, and reference those labels inside the affidavit text.</li>
          <li><strong>Sign in blue ink.</strong> It helps the registry distinguish originals from copies.</li>
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
