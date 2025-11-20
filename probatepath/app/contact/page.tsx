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
        <Badge variant="outline">
          Contact
        </Badge>
        <h1 className="font-serif text-4xl text-[color:var(--brand)] sm:text-5xl">We’re here to help executors stay calm</h1>
        <p className="max-w-3xl text-base text-[#333333]">
          Reach out if you have questions about eligibility, timelines, or how ProbatePath fits your estate. We reply within one business day.
        </p>
      </header>

      <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
        <ContactForm />
        <div className="space-y-4">
          <div className="rounded-3xl border border-[color:var(--border-muted)] bg-[color:var(--bg-surface)] p-6 text-sm text-[#333333] shadow-[0_20px_60px_-45px_rgba(15,26,42,0.2)]">
            <p className="font-semibold text-[color:var(--brand)]">Prefer email?</p>
            <p className="mt-2">
              Email{" "}
              <a href="mailto:hello@probatepath.ca" className="text-[color:var(--brand)] underline-offset-4 hover:underline">
                hello@probatepath.ca
              </a>{" "}
              and include the estate name and where you’ll be filing.
            </p>
          </div>
          <div className="rounded-3xl border border-[color:var(--border-muted)] bg-[color:var(--bg-surface)] p-4 shadow-[0_20px_60px_-50px_rgba(15,26,42,0.2)]">
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
