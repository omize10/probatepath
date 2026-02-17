"use client";

import { ContactForm } from "@/components/contact-form";
import type { ComponentConfig } from "@puckeditor/core";

export type ContactSectionProps = {
  headline: string;
  description: string;
  emailLabel: string;
  emailAddress: string;
  emailHint: string;
};

export function ContactSection({ headline, description, emailLabel, emailAddress, emailHint }: ContactSectionProps) {
  return (
    <section className="space-y-12">
      <header className="space-y-4">
        <h1 className="font-serif text-4xl text-[color:var(--brand)] sm:text-5xl">{headline}</h1>
        {description && (
          <p className="max-w-3xl text-base text-[#333333]">{description}</p>
        )}
      </header>
      <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
        <ContactForm />
        <div className="space-y-4">
          <div className="rounded-3xl border border-[color:var(--border-muted)] bg-[color:var(--bg-surface)] p-6 text-sm text-[#333333] shadow-[0_20px_60px_-45px_rgba(15,26,42,0.2)]">
            <p className="font-semibold text-[color:var(--brand)]">{emailLabel}</p>
            <p className="mt-2">
              Email{" "}
              <a href={`mailto:${emailAddress}`} className="text-[color:var(--brand)] underline-offset-4 hover:underline">
                {emailAddress}
              </a>{" "}
              {emailHint}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export const contactSectionConfig: ComponentConfig<ContactSectionProps> = {
  label: "Contact Section",
  fields: {
    headline: { type: "text", label: "Headline" },
    description: { type: "textarea", label: "Description" },
    emailLabel: { type: "text", label: "Email Card Label" },
    emailAddress: { type: "text", label: "Email Address" },
    emailHint: { type: "text", label: "Email Hint Text" },
  },
  defaultProps: {
    headline: "We're here to help executors stay calm",
    description: "Reach out if you have questions about eligibility, timelines, or how ProbateDesk fits your estate. We reply within one business day.",
    emailLabel: "Prefer email?",
    emailAddress: "hello@probatedesk.com",
    emailHint: "and include the estate name and where you'll be filing.",
  },
  render: (props) => <ContactSection {...props} />,
};
