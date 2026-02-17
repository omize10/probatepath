"use client";

import { CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { ComponentConfig } from "@puckeditor/core";

export type FeatureCardsProps = {
  eyebrow: string;
  headline: string;
  cards: string; // JSON string of {title, description, bullets: string[]}[]
  columns: "2" | "3";
};

export function FeatureCards({ eyebrow, headline, cards, columns }: FeatureCardsProps) {
  let parsed: { title: string; description: string; bullets?: string[] }[] = [];
  try {
    parsed = JSON.parse(cards);
  } catch {
    parsed = [];
  }

  const gridCols = columns === "3" ? "md:grid-cols-3" : "md:grid-cols-2";

  return (
    <section className="space-y-8">
      {(eyebrow || headline) && (
        <div className="text-center">
          {eyebrow && (
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[color:var(--slate)]">{eyebrow}</p>
          )}
          {headline && (
            <h2 className="mt-3 font-serif text-3xl text-[color:var(--brand)] sm:text-4xl">{headline}</h2>
          )}
        </div>
      )}
      <div className={`grid gap-6 ${gridCols}`}>
        {parsed.map((card, i) => (
          <Card key={i} className="h-full border-[color:var(--border-muted)] shadow-[0_30px_80px_-70px_rgba(15,23,42,0.25)]">
            <CardHeader className="space-y-3">
              <CardTitle className="text-xl text-[color:var(--brand)]">{card.title}</CardTitle>
              {card.description && (
                <CardDescription className="text-sm text-[color:var(--muted-ink)]">{card.description}</CardDescription>
              )}
            </CardHeader>
            {card.bullets && card.bullets.length > 0 && (
              <CardContent>
                <ul className="space-y-3 text-sm text-[color:var(--brand)]">
                  {card.bullets.map((bullet, j) => (
                    <li key={j} className="flex items-start gap-3">
                      <span className="mt-1 inline-flex h-6 w-6 flex-none items-center justify-center rounded-full bg-[#f0f3f7] text-[color:var(--brand)]">
                        <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
                      </span>
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            )}
          </Card>
        ))}
      </div>
    </section>
  );
}

export const featureCardsConfig: ComponentConfig<FeatureCardsProps> = {
  label: "Feature Cards",
  fields: {
    eyebrow: { type: "text", label: "Eyebrow Text" },
    headline: { type: "text", label: "Headline" },
    cards: { type: "textarea", label: "Cards (JSON array of {title, description, bullets[]})" },
    columns: {
      type: "select",
      label: "Columns",
      options: [
        { label: "2 Columns", value: "2" },
        { label: "3 Columns", value: "3" },
      ],
    },
  },
  defaultProps: {
    eyebrow: "",
    headline: "Features",
    cards: JSON.stringify([
      { title: "Feature 1", description: "Description here", bullets: ["Point A", "Point B"] },
      { title: "Feature 2", description: "Description here", bullets: ["Point C", "Point D"] },
    ]),
    columns: "2",
  },
  render: (props) => <FeatureCards {...props} />,
};
