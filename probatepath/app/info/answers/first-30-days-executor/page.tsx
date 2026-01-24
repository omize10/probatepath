/* eslint-disable react/no-unescaped-entities */
import type { Metadata } from "next";
import Link from "next/link";
import { InfoPageLayout } from "@/components/info/InfoPageLayout";

export const metadata: Metadata = {
  title: "First 30 Days as Executor | BC Checklist",
  description: "What to do in the first month after someone dies. A practical checklist for BC executors.",
};

export default function First30DaysPage() {
  return (
    <InfoPageLayout
      breadcrumbs={[
        { label: "Info Center", href: "/info" },
        { label: "Quick Answers", href: "/info/answers" },
        { label: "First 30 Days" },
      ]}
      eyebrow="Quick Answer"
      title="First 30 Days as Executor"
      description="A practical checklist for what to do immediately."
      lastUpdated="January 2026"
      readingTime="4 min"
      toc={[]}
    >
      <p className="text-lg leading-relaxed">
        <strong>Focus on three things:</strong> secure assets, gather documents, and start the 
        wills notice search. Everything else can wait.
      </p>

      <h2>Week 1: Immediate tasks</h2>
      <ul>
        <li>☐ Arrange the funeral (if not already done)</li>
        <li>☐ Locate the original will</li>
        <li>☐ Secure the deceased's home</li>
        <li>☐ Order death certificates (get 5-10 copies)</li>
        <li>☐ Notify immediate family members</li>
        <li>☐ Find important documents (bank statements, property titles, insurance)</li>
      </ul>

      <h2>Week 2: Administrative setup</h2>
      <ul>
        <li>☐ Notify banks (to freeze accounts from unauthorized access)</li>
        <li>☐ Cancel credit cards</li>
        <li>☐ Redirect mail</li>
        <li>☐ Cancel subscriptions and recurring payments</li>
        <li>☐ Notify employer and stop direct deposits</li>
        <li>☐ Contact any pension administrators</li>
      </ul>

      <h2>Week 3: Start probate process</h2>
      <ul>
        <li>☐ <strong>Submit wills notice search</strong> (don't delay – takes 2-4 weeks)</li>
        <li>☐ Make a list of all assets and estimated values</li>
        <li>☐ Make a list of all debts</li>
        <li>☐ Identify all beneficiaries and their contact info</li>
        <li>☐ Contact financial institutions to ask their probate requirements</li>
      </ul>

      <h2>Week 4: Plan next steps</h2>
      <ul>
        <li>☐ Decide if you need probate (based on asset types and values)</li>
        <li>☐ Decide if you'll handle it yourself or get help</li>
        <li>☐ Start preparing P1 notices if probate is needed</li>
        <li>☐ Open an estate bank account (or plan to once you have authority)</li>
      </ul>

      <div className="rounded-2xl border border-[color:var(--border-muted)] bg-[color:var(--bg-muted)] p-6 my-8">
        <p className="font-semibold text-[color:var(--brand)]">Most important first-month task</p>
        <p className="mt-2 text-[color:var(--muted-ink)]">
          Submit the wills notice search request to Vital Statistics. It takes 2-4 weeks to 
          process, and you can't file for probate without it. Do this in week 2 or 3 at the latest.
        </p>
      </div>

      <h2>What can wait</h2>
      <ul>
        <li>Filing for probate (you need the wills search result first)</li>
        <li>Selling real estate</li>
        <li>Distributing assets</li>
        <li>Final tax returns (not due immediately)</li>
      </ul>

      <p>
        <Link href="/info/guides/executor-duties" className="text-[color:var(--brand)] underline">
          Read the full executor duties guide →
        </Link>
      </p>
      <p>
        <Link href="/info/guides/bc-probate-guide" className="text-[color:var(--brand)] underline">
          Return to the Complete BC Probate Guide →
        </Link>
      </p>
    </InfoPageLayout>
  );
}
