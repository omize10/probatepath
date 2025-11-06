import type { Metadata } from "next";
import Image from "next/image";
import { ContactForm } from "@/components/contact-form";
import { Section } from "@/components/section";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Reach the ProbatePath team with questions about eligibility, timelines, or the fixed-fee probate package.",
};

export default function ContactPage() {
  return (
    <div className="space-y-20 pb-16">
      <header className="space-y-6">
        <Badge variant="outline">Contact</Badge>
        <h1 className="font-serif text-4xl text-white sm:text-5xl">We’re here to support your probate filing</h1>
        <p className="max-w-3xl text-base text-slate-300">
          Reach out with questions about eligibility, timing, or scope. A ProbatePath specialist will respond promptly with calm, clear guidance.
        </p>
      </header>

      <Section className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr]">
        <ContactForm />
        <aside className="space-y-6">
          <div className="rounded-3xl border border-white/10 bg-[#111217]/80 p-6 text-sm text-slate-300">
            <p className="text-base font-semibold text-white">Contact details</p>
            <div className="mt-4 space-y-3">
              <p>
                Email:{" "}
                <a
                  href="mailto:hello@probatepath.ca"
                  className="text-white underline decoration-white/40 underline-offset-4 hover:decoration-white"
                >
                  hello@probatepath.ca
                </a>
              </p>
              <p>Office hours: Monday to Friday, 9am – 5pm Pacific</p>
              <p>Location: Vancouver, British Columbia (virtual service province-wide)</p>
            </div>
          </div>
          <div className="relative overflow-hidden rounded-3xl border border-white/10">
            <Image
              src="/images/contact-map.svg"
              alt="Map illustration highlighting British Columbia"
              width={520}
              height={320}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-black/25 via-transparent to-black/40" />
          </div>
        </aside>
      </Section>
    </div>
  );
}
