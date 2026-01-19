/* eslint-disable react/no-unescaped-entities */
import type { Metadata } from "next";
import Link from "next/link";
import { InfoPageLayout } from "@/components/info/InfoPageLayout";
import { localBusinessSchema } from "@/lib/info/schema";
import { MapPin, Phone, Clock, AlertCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Surrey Probate Registry | Address, Hours & Filing Guide",
  description: "Surrey Supreme Court Probate Registry at 14340 57 Ave. Address, hours, filing steps, and parking details.",
};

const toc = [
  { id: "location", title: "Location & contact", level: 2 },
  { id: "what-to-bring", title: "What to bring", level: 2 },
  { id: "filing-process", title: "Filing process", level: 2 },
  { id: "parking", title: "Parking & transit", level: 2 },
  { id: "tips", title: "Tips", level: 2 },
];

const schema = localBusinessSchema({
  name: "Surrey Supreme Court Probate Registry",
  street: "14340 57 Avenue",
  city: "Surrey",
  postalCode: "V3X 1B2",
  phone: "604-572-2200",
  hours: "Mo-Fr 09:00-16:00",
  lat: 49.1045,
  lng: -122.8215,
});

export default function SurreyRegistryPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />

      <InfoPageLayout
        breadcrumbs={[
          { label: "Info Center", href: "/info" },
          { label: "Registries", href: "/info/registries" },
          { label: "Surrey" },
        ]}
        eyebrow="Probate Registry"
        title="Surrey Probate Registry"
        description="How to file probate documents at the Surrey registry, including what to bring and where to park."
        lastUpdated="December 2025"
        readingTime="5 min"
        toc={toc}
      >
        <p className="text-[color:var(--muted-ink)]">If you're unsure about forms, see the <Link href="/info/guides/bc-probate-guide" className="text-[color:var(--brand)] underline">Complete BC Probate Guide</Link> first.</p>

        <h2 id="location" className="scroll-mt-24">Location & contact</h2>

        <div className="grid gap-4 sm:grid-cols-2 my-6">
          <div className="rounded-2xl border border-[color:var(--border-muted)] bg-[color:var(--bg-surface)] p-5">
            <div className="flex items-start gap-3">
              <MapPin className="mt-1 h-5 w-5 text-[color:var(--brand)]" />
              <div>
                <p className="font-semibold text-[color:var(--brand)]">Address</p>
                <p className="text-[color:var(--muted-ink)]">14340 57 Avenue<br />Surrey, BC V3X 1B2</p>
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-[color:var(--border-muted)] bg-[color:var(--bg-surface)] p-5">
            <div className="flex items-start gap-3">
              <Phone className="mt-1 h-5 w-5 text-[color:var(--brand)]" />
              <div>
                <p className="font-semibold text-[color:var(--brand)]">Phone</p>
                <p className="text-[color:var(--muted-ink)]">604-572-2200</p>
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-[color:var(--border-muted)] bg-[color:var(--bg-surface)] p-5">
            <div className="flex items-start gap-3">
              <Clock className="mt-1 h-5 w-5 text-[color:var(--brand)]" />
              <div>
                <p className="font-semibold text-[color:var(--brand)]">Hours</p>
                <p className="text-[color:var(--muted-ink)]">Monday to Friday<br />9:00 AM - 4:00 PM</p>
              </div>
            </div>
          </div>
        </div>

        <h2 id="what-to-bring" className="scroll-mt-24">What to bring</h2>
        <ul>
          <li>Original will and codicils</li>
          <li>Completed P2, P3/P4 (or P5), P9, P10/P11</li>
          <li>Death certificate</li>
          <li>Wills notice search result</li>
          <li>Registered mail proofs for P1</li>
          <li>Payment for court fees</li>
          <li>Your ID</li>
        </ul>

        <div className="rounded-2xl border-l-4 border-[color:var(--warning)] bg-[color:var(--bg-muted)] p-5 my-6">
          <div className="flex gap-3">
            <AlertCircle className="h-5 w-5 text-[color:var(--warning)] shrink-0" />
            <div>
              <p className="font-semibold text-[color:var(--brand)]">Reminder</p>
              <p className="mt-1 text-[color:var(--muted-ink)]">Have affidavits sworn before you arrive. Staff cannot commission documents.</p>
            </div>
          </div>
        </div>

        <h2 id="filing-process" className="scroll-mt-24">Filing process</h2>
        <ol>
          <li>Enter the Surrey courthouse at 14340 57 Avenue</li>
          <li>Go upstairs to the probate/estates counter</li>
          <li>Take a number and wait for your turn</li>
          <li>Submit the full package for review</li>
          <li>Pay fees and note your file number</li>
          <li>Expect 4-8 weeks for processing</li>
        </ol>

        <h2 id="parking" className="scroll-mt-24">Parking & transit</h2>
        <h3>Parking</h3>
        <ul>
          <li>Court lot off 57 Avenue (paid; fills early)</li>
          <li>Street parking on 57 Avenue and 144 Street (time-limited)</li>
          <li>Overflow at City Hall lot a short walk away</li>
        </ul>
        <h3>Transit</h3>
        <ul>
          <li>Bus routes on 56 Avenue and King George Blvd</li>
          <li>Plan extra time; buses can be busy during court hours</li>
        </ul>

        <h2 id="tips" className="scroll-mt-24">Tips</h2>
        <ul>
          <li>Arrive with organized copies; the counter space is limited</li>
          <li>Mid-afternoon is often quieter than morning</li>
          <li>Bring a stamped self-addressed envelope if you want the grant mailed</li>
          <li>Keep your file number; it speeds up any phone inquiries</li>
        </ul>

        <section className="mt-12 rounded-3xl bg-[color:var(--bg-muted)] p-8 text-center">
          <h2 className="font-serif text-2xl text-[color:var(--brand)]">Filing in Surrey?</h2>
          <p className="mx-auto mt-4 max-w-2xl text-[color:var(--muted-ink)]">Probate Desk assembles your Surrey-ready forms and checklist.</p>
          <Link href="/create-account" className="mt-6 inline-block rounded-full bg-[color:var(--brand)] px-6 py-3 font-semibold text-white hover:bg-[color:var(--accent-dark)]">
            Start intake
          </Link>
        </section>
      </InfoPageLayout>
    </>
  );
}
