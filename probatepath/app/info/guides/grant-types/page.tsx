/* eslint-disable react/no-unescaped-entities */
import type { Metadata } from "next";
import Link from "next/link";
import { InfoPageLayout } from "@/components/info/InfoPageLayout";
import { FAQSection } from "@/components/info/FAQSection";
import { articleSchema } from "@/lib/info/schema";

export const metadata: Metadata = {
  title: "Grant of Probate vs Administration | BC Grant Types Explained",
  description: "Learn the difference between grant of probate and grant of administration in BC. Which type of grant you need depends on whether there's a will.",
  keywords: ["grant of probate", "grant of administration", "letters of administration BC", "probate vs administration"],
};

const toc = [
  { id: "overview", title: "Overview", level: 2 },
  { id: "grant-probate", title: "Grant of probate", level: 2 },
  { id: "grant-admin-will", title: "Grant of administration with will", level: 2 },
  { id: "grant-admin", title: "Grant of administration", level: 2 },
  { id: "which-need", title: "Which do you need?", level: 2 },
  { id: "differences", title: "Key differences", level: 2 },
  { id: "faq", title: "FAQ", level: 2 },
];

const faqs = [
  {
    question: "Does the type of grant affect probate fees?",
    answer: "No. Probate fees are based on estate value, not the type of grant. The process and fees are similar regardless of which grant type you're applying for."
  },
  {
    question: "Can I change from one grant type to another?",
    answer: "No. You apply for the grant type that matches your situation. If circumstances change (e.g., a will is found after applying for administration), you may need legal advice on how to proceed."
  },
  {
    question: "Which grant type is faster?",
    answer: "Processing time is similar. Grant of probate may be slightly simpler because the will clearly establishes authority. Administration applications require more documentation about who has priority to act."
  },
];

const schema = articleSchema({
  title: "Grant of Probate vs Grant of Administration",
  description: "Understanding the different types of estate grants in British Columbia",
  datePublished: "2025-01-01",
  dateModified: "2025-12-13",
  url: "https://probatepath.ca/info/guides/grant-types",
});

export default function GrantTypesPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />

      <InfoPageLayout
        breadcrumbs={[
          { label: "Info Center", href: "/info" },
          { label: "Guides", href: "/info/guides" },
          { label: "Grant Types" },
        ]}
        eyebrow="Guide"
        title="Grant of Probate vs Grant of Administration"
        description="BC issues different types of grants depending on whether there's a will and who is applying. Here's which one applies to your situation."
        lastUpdated="December 2025"
        readingTime="8 min"
        toc={toc}
      >
        <h2 id="overview" className="scroll-mt-24">Overview</h2>

        <p className="text-lg leading-relaxed">
          There are three main types of estate grants in BC: <strong>grant of probate</strong> (when there's a will and the named executor applies), <strong>grant of administration with will annexed</strong> (when there's a will but someone other than the named executor applies), and <strong>grant of administration</strong> (when there's no will). All three give the applicant legal authority to manage the estate.
        </p>

        <h2 id="grant-probate" className="scroll-mt-24">Grant of probate</h2>

        <p><strong>When it applies:</strong> There is a valid will AND the executor named in the will is applying.</p>

        <p><strong>What it does:</strong></p>
        <ul>
          <li>Confirms the will is the deceased's last valid will</li>
          <li>Confirms the executor's authority to act</li>
          <li>Attaches a certified copy of the will to the grant</li>
        </ul>

        <p><strong>Key forms:</strong> P1, P2, P3 or P4, P9, P10 or P11</p>

        <p><strong>Who can apply:</strong> Only the executor(s) named in the will.</p>

        <p>This is the most common type of grant. If the deceased had a will and named you as executor, this is what you're applying for.</p>

        <h2 id="grant-admin-will" className="scroll-mt-24">Grant of administration with will annexed</h2>

        <p><strong>When it applies:</strong> There is a valid will BUT the named executor cannot or will not act.</p>

        <p><strong>Common situations:</strong></p>
        <ul>
          <li>Named executor has died</li>
          <li>Named executor renounces (declines to act)</li>
          <li>Named executor lacks capacity</li>
          <li>Named executor can't be found</li>
          <li>Will doesn't name an executor</li>
        </ul>

        <p><strong>Who can apply:</strong> Priority goes to:</p>
        <ol>
          <li>Residuary beneficiary named in the will</li>
          <li>Other beneficiaries</li>
          <li>Next of kin</li>
        </ol>

        <p><strong>Key difference:</strong> The will still controls how assets are distributed, but a different person administers the estate.</p>

        <h2 id="grant-admin" className="scroll-mt-24">Grant of administration (intestacy)</h2>

        <p><strong>When it applies:</strong> There is NO valid will (the person died "intestate").</p>

        <p><strong>What it does:</strong></p>
        <ul>
          <li>Appoints an administrator to manage the estate</li>
          <li>Does NOT attach a will (there isn't one)</li>
          <li>Estate is distributed according to BC's intestacy rules, not the deceased's wishes</li>
        </ul>

        <p><strong>Who can apply:</strong> Priority order:</p>
        <ol>
          <li>Spouse or common-law partner</li>
          <li>Children</li>
          <li>Grandchildren</li>
          <li>Parents</li>
          <li>Siblings</li>
          <li>More distant relatives</li>
        </ol>

        <p><strong>Key form:</strong> P5 replaces P3/P4</p>

        <p><strong>Key difference:</strong> The administrator doesn't follow a will. They follow BC's intestacy rules under WESA, which specify who gets what based on family relationships.</p>

        <h2 id="which-need" className="scroll-mt-24">Which do you need?</h2>

        <div className="space-y-4 my-8">
          <div className="rounded-2xl border border-[color:var(--border-muted)] bg-[color:var(--bg-surface)] p-6">
            <p className="font-semibold text-[color:var(--brand)]">Is there a valid will?</p>
            <p className="mt-2 text-[color:var(--muted-ink)]">
              <strong>Yes →</strong> Are you the named executor?<br />
              <strong>No →</strong> Grant of administration (intestacy)
            </p>
          </div>

          <div className="rounded-2xl border border-[color:var(--border-muted)] bg-[color:var(--bg-surface)] p-6">
            <p className="font-semibold text-[color:var(--brand)]">Are you the named executor?</p>
            <p className="mt-2 text-[color:var(--muted-ink)]">
              <strong>Yes →</strong> Grant of probate<br />
              <strong>No →</strong> Grant of administration with will annexed
            </p>
          </div>
        </div>

        <h2 id="differences" className="scroll-mt-24">Key differences at a glance</h2>

        <div className="overflow-x-auto my-8">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[color:var(--border-muted)]">
                <th className="py-3 text-left font-semibold text-[color:var(--brand)]">Aspect</th>
                <th className="py-3 text-left font-semibold text-[color:var(--brand)]">Probate</th>
                <th className="py-3 text-left font-semibold text-[color:var(--brand)]">Admin w/ Will</th>
                <th className="py-3 text-left font-semibold text-[color:var(--brand)]">Admin (Intestacy)</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-[color:var(--border-muted)]">
                <td className="py-3">Will exists?</td>
                <td className="py-3">Yes</td>
                <td className="py-3">Yes</td>
                <td className="py-3">No</td>
              </tr>
              <tr className="border-b border-[color:var(--border-muted)]">
                <td className="py-3">Who applies?</td>
                <td className="py-3">Named executor</td>
                <td className="py-3">Someone else</td>
                <td className="py-3">Priority relative</td>
              </tr>
              <tr className="border-b border-[color:var(--border-muted)]">
                <td className="py-3">Distribution follows?</td>
                <td className="py-3">The will</td>
                <td className="py-3">The will</td>
                <td className="py-3">Intestacy rules</td>
              </tr>
              <tr>
                <td className="py-3">Main affidavit form</td>
                <td className="py-3">P3 or P4</td>
                <td className="py-3">P3 or P4</td>
                <td className="py-3">P5</td>
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
