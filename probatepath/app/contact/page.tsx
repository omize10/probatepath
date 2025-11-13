import type { Metadata } from "next";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { ContactForm } from "@/components/contact-form";

export const metadata: Metadata = {
  title: "Contact",
  description: "Reach the ProbatePath team with questions about eligibility, timelines, or onboarding.",
};

export default function ContactPage() {
  return (
    <div className="space-y-12 pb-16">
      <header className="space-y-4">
        <Badge variant="outline" className="border-[#1e3a8a] text-[#1e3a8a]">
          Contact
        </Badge>
        <h1 className="font-serif text-4xl text-[#0f172a] sm:text-5xl">We’re here to help executors stay calm</h1>
        <p className="max-w-3xl text-base text-[#495067]">
          Reach out if you have questions about eligibility, timelines, or how ProbatePath fits your estate. We reply within one business day.
        </p>
      </header>

      <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
        <ContactForm />
        <div className="space-y-4">
          <div className="rounded-3xl border border-[#e2e8f0] bg-white p-6 text-sm text-[#495067]">
            <p className="font-semibold text-[#0f172a]">Prefer email?</p>
            <p className="mt-2">
              Email{" "}
              <a href="mailto:hello@probatepath.ca" className="text-[#1e3a8a] underline-offset-4 hover:underline">
                hello@probatepath.ca
              </a>{" "}
              and include the estate name and where you’ll be filing.
            </p>
          </div>
          <div className="rounded-3xl border border-[#e2e8f0] bg-white p-4">
            <Image
              src="/images/abstract-1.jpg"
              alt="Calm abstract placeholder"
              width={700}
              height={520}
              className="rounded-2xl object-cover"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
