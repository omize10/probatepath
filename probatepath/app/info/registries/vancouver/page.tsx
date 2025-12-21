/* eslint-disable react/no-unescaped-entities */
import type { Metadata } from "next";
import Link from "next/link";
import { InfoPageLayout } from "@/components/info/InfoPageLayout";
import { localBusinessSchema } from "@/lib/info/schema";
import { MapPin, Phone, Clock, AlertCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Vancouver Probate Registry | Address, Hours & Filing Guide",
  description: "Vancouver Supreme Court Probate Registry at 800 Smithe St. Hours, contact info, what to bring, parking tips, and filing instructions.",
};

const toc = [
  { id: "location", title: "Location & contact", level: 2 },
  { id: "what-to-bring", title: "What to bring", level: 2 },
  { id: "filing-process", title: "Filing process", level: 2 },
  { id: "parking", title: "Parking & transit", level: 2 },
  { id: "tips", title: "Tips", level: 2 },
];

const schema = localBusinessSchema({
  name: "Vancouver Supreme Court Probate Registry",
  street: "800 Smithe Street",
  city: "Vancouver",
  postalCode: "V6Z 2E1",
  phone: "604-660-2853",
  hours: "Mo-Fr 09:00-16:00",
  lat: 49.2788,
  lng: -123.1215,
});

export default function VancouverRegistryPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />

      <InfoPageLayout
        breadcrumbs={[
          { label: "Info Center", href: "/info" },
          { label: "Registries", href: "/info/registries" },
          { label: "Vancouver" },
        ]}
        eyebrow="Probate Registry"
        title="Vancouver Probate Registry"
        description="The Vancouver Supreme Court Probate Registry handles the highest volume of probate applications in BC. Here's everything you need to know about filing here."
        lastUpdated="December 2025"
        readingTime="5 min"
        toc={toc}
      >
        <p className="text-[color:var(--muted-ink)]">For a full overview of forms and fees, see the <Link href="/info/guides/bc-probate-guide" className="text-[color:var(--brand)] underline">Complete BC Probate Guide</Link>.</p>

        <h2 id="location" className="scroll-mt-24">Location & contact</h2>

        <div className="grid gap-4 sm:grid-cols-2 my-6">
          <div className="rounded-2xl border border-[color:var(--border-muted)] bg-[color:var(--bg-surface)] p-5">
            <div className="flex items-start gap-3">
              <MapPin className="mt-1 h-5 w-5 text-[color:var(--brand)]" />
              <div>
                <p className="font-semibold text-[color:var(--brand)]">Address</p>
                <p className="text-[color:var(--muted-ink)]">800 Smithe Street<br />Vancouver, BC V6Z 2E1</p>
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-[color:var(--border-muted)] bg-[color:var(--bg-surface)] p-5">
            <div className="flex items-start gap-3">
              <Phone className="mt-1 h-5 w-5 text-[color:var(--brand)]" />
              <div>
                <p className="font-semibold text-[color:var(--brand)]">Phone</p>
                <p className="text-[color:var(--muted-ink)]">604-660-2853</p>
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
          <li><strong>Original will</strong> and any codicils</li>
          <li><strong>Complete application:</strong> P2, P3/P4, P9, P10/P11</li>
          <li><strong>Certified death certificate</strong></li>
          <li><strong>Photo ID</strong></li>
          <li><strong>Payment</strong> for filing fee ($200) + probate fees</li>
          <li><strong>Wills notice search result</strong></li>
          <li><strong>Proof of P1 delivery</strong> (registered mail receipts)</li>
        </ul>

        <div className="rounded-2xl border-l-4 border-[color:var(--warning)] bg-[color:var(--bg-muted)] p-5 my-6">
          <div className="flex gap-3">
            <AlertCircle className="h-5 w-5 text-[color:var(--warning)] shrink-0" />
            <div>
              <p className="font-semibold text-[color:var(--brand)]">Important</p>
              <p className="mt-1 text-[color:var(--muted-ink)]">
                All affidavits must be signed and commissioned BEFORE you arrive. Registry staff cannot witness signatures.
              </p>
            </div>
          </div>
        </div>

        <h2 id="filing-process" className="scroll-mt-24">Filing process</h2>

        <ol>
          <li>Enter courthouse at 800 Smithe Street</li>
          <li>Pass through security</li>
          <li>Go to Probate Registry counter</li>
          <li>Take a number and wait</li>
          <li>Present complete application</li>
          <li>Staff reviews for completeness</li>
          <li>Pay fees</li>
          <li>Receive file number</li>
          <li>Wait 4-8 weeks for processing</li>
        </ol>

        <h2 id="parking" className="scroll-mt-24">Parking & transit</h2>

        <h3>Parking</h3>
        <ul>
          <li><strong>Impark:</strong> 818 Richards Street (2-min walk)</li>
          <li><strong>EasyPark:</strong> 833 Homer Street (3-min walk)</li>
          <li>Budget $15-25 for 2-3 hours</li>
        </ul>

        <h3>Transit</h3>
        <ul>
          <li><strong>SkyTrain:</strong> Vancouver City Centre Station (5-min walk)</li>
          <li><strong>Bus:</strong> Multiple routes on Robson/Granville</li>
        </ul>

        <h2 id="tips" className="scroll-mt-24">Tips for filing</h2>

        <ul>
          <li><strong>Arrive early.</strong> Monday mornings are busiest.</li>
          <li><strong>Double-check forms.</strong> Incomplete apps get returned.</li>
          <li><strong>Make copies.</strong> Keep copies of everything.</li>
          <li><strong>Consider courier filing.</strong> You can mail instead of visiting.</li>
        </ul>

        <section className="mt-12 rounded-3xl bg-[color:var(--bg-muted)] p-8 text-center">
          <h2 className="font-serif text-2xl text-[color:var(--brand)]">Filing in Vancouver?</h2>
          <p className="mx-auto mt-4 max-w-2xl text-[color:var(--muted-ink)]">
            ProbatePath prepares your complete filing package for the Vancouver registry.
          </p>
          <Link href="/create-account" className="mt-6 inline-block rounded-full bg-[color:var(--brand)] px-6 py-3 font-semibold text-white hover:bg-[color:var(--accent-dark)]">
            Start intake
          </Link>
        </section>
      </InfoPageLayout>
    </>
  );
}
