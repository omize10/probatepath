/* eslint-disable react/no-unescaped-entities */
import type { Metadata } from "next";
import Link from "next/link";
import { InfoPageLayout } from "@/components/info/InfoPageLayout";
import { localBusinessSchema } from "@/lib/info/schema";
import { MapPin, Phone, Clock, AlertCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Victoria Probate Registry | Address, Hours & Filing Guide",
  description: "Victoria Supreme Court Probate Registry at 850 Burdett Ave. Address, contact, filing checklist, parking, and transit tips.",
};

const toc = [
  { id: "location", title: "Location & contact", level: 2 },
  { id: "what-to-bring", title: "What to bring", level: 2 },
  { id: "filing-process", title: "Filing process", level: 2 },
  { id: "parking", title: "Parking & transit", level: 2 },
  { id: "tips", title: "Tips", level: 2 },
];

const schema = localBusinessSchema({
  name: "Victoria Supreme Court Probate Registry",
  street: "850 Burdett Avenue",
  city: "Victoria",
  postalCode: "V8W 1B4",
  phone: "250-356-1478",
  hours: "Mo-Fr 09:00-16:00",
  lat: 48.4226,
  lng: -123.3657,
});

export default function VictoriaRegistryPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />

      <InfoPageLayout
        breadcrumbs={[
          { label: "Info Center", href: "/info" },
          { label: "Registries", href: "/info/registries" },
          { label: "Victoria" },
        ]}
        eyebrow="Probate Registry"
        title="Victoria Probate Registry"
        description="Everything you need to file probate documents at the Victoria registry: address, hours, checklist, and parking."
        lastUpdated="December 2025"
        readingTime="5 min"
        toc={toc}
      >
        <p className="text-[color:var(--muted-ink)]">Need the full process first? Read the <Link href="/info/guides/bc-probate-guide" className="text-[color:var(--brand)] underline">Complete BC Probate Guide</Link>.</p>

        <h2 id="location" className="scroll-mt-24">Location & contact</h2>

        <div className="grid gap-4 sm:grid-cols-2 my-6">
          <div className="rounded-2xl border border-[color:var(--border-muted)] bg-[color:var(--bg-surface)] p-5">
            <div className="flex items-start gap-3">
              <MapPin className="mt-1 h-5 w-5 text-[color:var(--brand)]" />
              <div>
                <p className="font-semibold text-[color:var(--brand)]">Address</p>
                <p className="text-[color:var(--muted-ink)]">850 Burdett Avenue<br />Victoria, BC V8W 1B4</p>
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-[color:var(--border-muted)] bg-[color:var(--bg-surface)] p-5">
            <div className="flex items-start gap-3">
              <Phone className="mt-1 h-5 w-5 text-[color:var(--brand)]" />
              <div>
                <p className="font-semibold text-[color:var(--brand)]">Phone</p>
                <p className="text-[color:var(--muted-ink)]">250-356-1478</p>
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
          <li>P2, P3/P4 (or P5), P9, P10/P11 completed</li>
          <li>Certified death certificate</li>
          <li>Wills notice search result</li>
          <li>Proof of P1 delivery</li>
          <li>Payment for $200 filing fee + probate fees</li>
          <li>Photo ID</li>
        </ul>

        <div className="rounded-2xl border-l-4 border-[color:var(--warning)] bg-[color:var(--bg-muted)] p-5 my-6">
          <div className="flex gap-3">
            <AlertCircle className="h-5 w-5 text-[color:var(--warning)] shrink-0" />
            <div>
              <p className="font-semibold text-[color:var(--brand)]">Before you go</p>
              <p className="mt-1 text-[color:var(--muted-ink)]">Have every affidavit sworn beforehand. Staff cannot witness your signature.</p>
            </div>
          </div>
        </div>

        <h2 id="filing-process" className="scroll-mt-24">Filing process</h2>
        <ol>
          <li>Enter the courthouse lobby at 850 Burdett Avenue</li>
          <li>Proceed to the Probate/Estates counter</li>
          <li>Take a number and wait to be called</li>
          <li>Submit your full application package</li>
          <li>Pay fees at the cashier window</li>
          <li>Receive your file number for status updates</li>
        </ol>

        <h2 id="parking" className="scroll-mt-24">Parking & transit</h2>
        <h3>Parking</h3>
        <ul>
          <li>Robbins Parking at 850 Burdett (lot beside courthouse)</li>
          <li>Parkade at 900 Broughton Street (5-min walk)</li>
          <li>Metered street parking on Burdett and Quadra</li>
        </ul>
        <h3>Transit</h3>
        <ul>
          <li>BC Transit routes on Douglas and Blanshard (short walk)</li>
          <li>Bike racks available near the main entrance</li>
        </ul>

        <h2 id="tips" className="scroll-mt-24">Tips</h2>
        <ul>
          <li>Lines are shortest mid-week between 10 AM and noon</li>
          <li>Bring two copies of your P2; staff may stamp one for your records</li>
          <li>Use a folder; the registry dislikes stapled bundles</li>
          <li>If mailing, include a prepaid return envelope for the grant</li>
        </ul>

        <section className="mt-12 rounded-3xl bg-[color:var(--bg-muted)] p-8 text-center">
          <h2 className="font-serif text-2xl text-[color:var(--brand)]">Filing in Victoria?</h2>
          <p className="mx-auto mt-4 max-w-2xl text-[color:var(--muted-ink)]">ProbatePath prepares and organizes your package so you can file in one trip.</p>
          <Link href="/create-account" className="mt-6 inline-block rounded-full bg-[color:var(--brand)] px-6 py-3 font-semibold text-white hover:bg-[color:var(--accent-dark)]">
            Start intake
          </Link>
        </section>
      </InfoPageLayout>
    </>
  );
}
