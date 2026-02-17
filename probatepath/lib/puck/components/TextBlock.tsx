"use client";

import type { ComponentConfig } from "@puckeditor/core";

export type TextBlockProps = {
  eyebrow: string;
  headline: string;
  body: string;
  variant: "default" | "card" | "muted";
  align: "left" | "center";
};

export function TextBlock({ eyebrow, headline, body, variant, align }: TextBlockProps) {
  const wrapperClasses =
    variant === "card"
      ? "rounded-[32px] border border-[color:var(--border-muted)] bg-[color:var(--bg-surface)] p-8 shadow-[0_40px_90px_-70px_rgba(15,23,42,0.25)] sm:p-12"
      : variant === "muted"
        ? "rounded-[28px] border border-[color:var(--border-muted)] bg-[color:var(--bg-muted)] p-8"
        : "";

  const alignClass = align === "center" ? "text-center" : "";

  return (
    <section className={`space-y-4 ${wrapperClasses} ${alignClass}`}>
      {eyebrow && (
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[color:var(--slate)]">{eyebrow}</p>
      )}
      {headline && (
        <h2 className="font-serif text-3xl text-[color:var(--brand)] sm:text-4xl">{headline}</h2>
      )}
      {body && (
        <div className="max-w-3xl text-base text-[color:var(--muted-ink)] whitespace-pre-line">
          {body}
        </div>
      )}
    </section>
  );
}

export const textBlockConfig: ComponentConfig<TextBlockProps> = {
  label: "Text Block",
  fields: {
    eyebrow: { type: "text", label: "Eyebrow Text" },
    headline: { type: "text", label: "Headline" },
    body: { type: "textarea", label: "Body Text" },
    variant: {
      type: "select",
      label: "Style",
      options: [
        { label: "Default", value: "default" },
        { label: "Card", value: "card" },
        { label: "Muted", value: "muted" },
      ],
    },
    align: {
      type: "select",
      label: "Alignment",
      options: [
        { label: "Left", value: "left" },
        { label: "Center", value: "center" },
      ],
    },
  },
  defaultProps: {
    eyebrow: "",
    headline: "Section Headline",
    body: "Section body text goes here.",
    variant: "default",
    align: "left",
  },
  render: (props) => <TextBlock {...props} />,
};
