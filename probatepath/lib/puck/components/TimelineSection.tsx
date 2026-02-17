"use client";

import type { ComponentConfig } from "@puckeditor/core";

export type TimelineSectionProps = {
  eyebrow: string;
  headline: string;
  steps: string; // JSON string of {num, title, description}[]
};

export function TimelineSection({ eyebrow, headline, steps }: TimelineSectionProps) {
  let parsed: { num: string; title: string; description: string }[] = [];
  try {
    parsed = JSON.parse(steps);
  } catch {
    parsed = [];
  }

  return (
    <section className="space-y-8">
      <div className="text-center">
        {eyebrow && (
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[color:var(--slate)]">{eyebrow}</p>
        )}
        {headline && (
          <h2 className="mt-3 font-serif text-3xl text-[color:var(--brand)] sm:text-4xl">{headline}</h2>
        )}
      </div>
      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        {parsed.map((step) => (
          <div
            key={step.num}
            className="h-full rounded-2xl border border-[color:var(--border-muted)] bg-white p-6 shadow-[0_25px_60px_-50px_rgba(15,23,42,0.18)] transition hover:-translate-y-1 hover:shadow-[0_30px_80px_-60px_rgba(15,23,42,0.25)]"
          >
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#111827] text-lg font-bold text-white">
                {step.num}
              </div>
              <div>
                <h3 className="font-semibold text-lg text-[color:var(--brand)] leading-snug">{step.title}</h3>
                <p className="mt-1.5 text-sm text-[color:var(--muted-ink)] leading-relaxed">{step.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export const timelineSectionConfig: ComponentConfig<TimelineSectionProps> = {
  label: "Timeline / Steps Section",
  fields: {
    eyebrow: { type: "text", label: "Eyebrow Text" },
    headline: { type: "text", label: "Headline" },
    steps: { type: "textarea", label: "Steps (JSON array of {num, title, description})" },
  },
  defaultProps: {
    eyebrow: "How It Works",
    headline: "Three steps to your grant",
    steps: JSON.stringify([
      { num: "1", title: "Answer a few questions", description: "We check if your estate qualifies. Takes about 2 minutes." },
      { num: "2", title: "We prepare your forms", description: "Your full BC probate filing package, assembled and reviewed." },
      { num: "3", title: "You file with the court", description: "We walk you through signing, filing, and what comes after." },
    ]),
  },
  render: (props) => <TimelineSection {...props} />,
};
