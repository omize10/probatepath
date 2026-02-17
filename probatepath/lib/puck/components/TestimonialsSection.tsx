"use client";

import type { ComponentConfig } from "@puckeditor/core";

export type TestimonialsSectionProps = {
  eyebrow: string;
  headline: string;
  items: string; // JSON string of {quote, name, role}[]
};

export function PuckTestimonialsSection({ eyebrow, headline, items }: TestimonialsSectionProps) {
  let parsed: { quote: string; name: string; role: string }[] = [];
  try {
    parsed = JSON.parse(items);
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
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {parsed.map((item, i) => (
          <div
            key={i}
            className="rounded-2xl border border-[color:var(--border-muted)] bg-[color:var(--bg-surface)] p-6 shadow-[0_25px_60px_-50px_rgba(15,23,42,0.18)]"
          >
            <blockquote className="text-sm text-[color:var(--muted-ink)] leading-relaxed">
              &ldquo;{item.quote}&rdquo;
            </blockquote>
            <div className="mt-4 border-t border-[color:var(--border-muted)] pt-4">
              <p className="font-semibold text-[color:var(--brand)]">{item.name}</p>
              {item.role && <p className="text-xs text-[color:var(--slate)]">{item.role}</p>}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export const testimonialsSectionConfig: ComponentConfig<TestimonialsSectionProps> = {
  label: "Testimonials Section",
  fields: {
    eyebrow: { type: "text", label: "Eyebrow Text" },
    headline: { type: "text", label: "Headline" },
    items: { type: "textarea", label: "Testimonials (JSON array of {quote, name, role})" },
  },
  defaultProps: {
    eyebrow: "Testimonials",
    headline: "What executors say",
    items: JSON.stringify([
      { quote: "ProbateDesk made a stressful process manageable.", name: "A. Thompson", role: "Vancouver executor" },
      { quote: "Clear instructions, fast turnaround, fair price.", name: "M. Chen", role: "Surrey executor" },
    ]),
  },
  render: (props) => <PuckTestimonialsSection {...props} />,
};
