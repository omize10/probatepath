/* eslint-disable react/no-unescaped-entities */
import type { Metadata } from "next";
import Link from "next/link";
import { InfoPageLayout } from "@/components/info/InfoPageLayout";
import { FAQSection } from "@/components/info/FAQSection";

export const metadata: Metadata = {
  title: "What If I Can't Find the Original Will? | BC Answer",
  description: "You may still be able to probate a copy, but you'll need to prove the original existed and wasn't revoked. Here's how.",
};

const faqs = [
  {
    question: "Does a photocopy count as a copy?",
    answer: "Yes. Any reproduction – photocopy, scan, photograph – can potentially be used if you can prove it's a true copy of the original that was never revoked."
  },
  {
    question: "What if the deceased destroyed the will intentionally?",
    answer: "If the deceased intentionally destroyed their will, they're considered to have revoked it. The estate would then be distributed under intestacy rules. Proving intent can be complicated."
  },
];

export default function NoOriginalWillPage() {
  return (
    <InfoPageLayout
      breadcrumbs={[
        { label: "Info Center", href: "/info" },
        { label: "Quick Answers", href: "/info/answers" },
        { label: "No Original Will" },
      ]}
      eyebrow="Quick Answer"
      title="What If I Can't Find the Original Will?"
      description="Options when you only have a copy."
      lastUpdated="January 2026"
      readingTime="3 min"
      toc={[]}
    >
      <p className="text-lg leading-relaxed">
        <strong>You may still be able to probate it.</strong> BC courts can accept a copy of a will 
        if you can prove: (1) the original existed and was valid, (2) the copy is accurate, and 
        (3) the will wasn't intentionally revoked. This requires additional evidence and often 
        legal help.
      </p>

      <h2>Where to search for the original</h2>
      <ul>
        <li>The deceased's home (filing cabinets, safes, desk drawers)</li>
        <li>Safety deposit box</li>
        <li>The lawyer who drafted it</li>
        <li>Any notary who might have witnessed it</li>
        <li>The BC Wills Registry (it notes where wills are stored)</li>
        <li>With family members who might be holding it</li>
      </ul>

      <h2>If you only have a copy</h2>
      <p>You'll need to apply for probate using Form P4 (long form) and include:</p>
      <ul>
        <li>The best copy available</li>
        <li>Evidence the copy is accurate (e.g., the lawyer who drafted it confirms it matches)</li>
        <li>Evidence the original wasn't revoked (affidavits from people who knew the deceased)</li>
        <li>An explanation of why the original can't be found</li>
      </ul>

      <div className="rounded-2xl border-l-4 border-[color:var(--warning)] bg-[color:var(--bg-muted)] p-5 my-6">
        <p className="font-semibold text-[color:var(--brand)]">This is complex</p>
        <p className="mt-1 text-[color:var(--muted-ink)]">
          Probating a copy is harder than probating an original. The court may refuse if 
          there's any doubt. Consider getting legal advice for this situation.
        </p>
      </div>

      <h2>If no will exists at all</h2>
      <p>
        If there truly is no will (not just a missing original), the estate is distributed 
        under intestacy rules. See our guide: {" "}
        <Link href="/info/guides/probate-without-will" className="text-[color:var(--brand)] underline">
          Probate Without a Will
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
