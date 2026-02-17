"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { ComponentConfig } from "@puckeditor/core";

export type LegalTabsProps = {
  headline: string;
  description: string;
  sections: string; // JSON string of {id, label, body: string[]}[]
  disclaimer: string;
};

export function LegalTabs({ headline, description, sections, disclaimer }: LegalTabsProps) {
  let parsed: { id: string; label: string; body: string[] }[] = [];
  try {
    parsed = JSON.parse(sections);
  } catch {
    parsed = [];
  }

  return (
    <section className="space-y-12">
      <header className="space-y-4">
        <h1 className="font-serif text-4xl text-[color:var(--brand)] sm:text-5xl">{headline}</h1>
        {description && (
          <p className="max-w-3xl text-base text-[#333333]">{description}</p>
        )}
      </header>
      {parsed.length > 0 && (
        <Tabs defaultValue={parsed[0]?.id}>
          <TabsList>
            {parsed.map((section) => (
              <TabsTrigger key={section.id} value={section.id}>
                {section.label}
              </TabsTrigger>
            ))}
          </TabsList>
          {parsed.map((section) => (
            <TabsContent key={section.id} value={section.id}>
              {section.body.map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))}
            </TabsContent>
          ))}
        </Tabs>
      )}
      {disclaimer && (
        <div className="rounded-3xl border border-[color:var(--border-muted)] bg-[color:var(--bg-surface)] p-6 text-sm text-[#333333] shadow-[0_20px_60px_-50px_rgba(15,26,42,0.35)]">
          {disclaimer}
        </div>
      )}
    </section>
  );
}

export const legalTabsConfig: ComponentConfig<LegalTabsProps> = {
  label: "Legal / Tabs Section",
  fields: {
    headline: { type: "text", label: "Headline" },
    description: { type: "textarea", label: "Description" },
    sections: { type: "textarea", label: "Sections (JSON array of {id, label, body[]})" },
    disclaimer: { type: "textarea", label: "Disclaimer Footer" },
  },
  defaultProps: {
    headline: "Terms, privacy, and disclaimer",
    description: "Transparency matters. Review how ProbateDesk works, how we handle your information, and important disclaimers.",
    sections: JSON.stringify([
      { id: "terms", label: "Terms", body: ["ProbateDesk provides technology-enabled probate document preparation for British Columbia executors."] },
      { id: "privacy", label: "Privacy", body: ["We collect only the personal information needed to deliver intake, drafting, and support."] },
      { id: "disclaimer", label: "Disclaimer", body: ["ProbateDesk provides document preparation support and general information. We do not provide legal advice or representation."] },
    ]),
    disclaimer: "ProbateDesk provides document preparation support and general information. We do not provide legal advice or representation. Executors remain self-represented.",
  },
  render: (props) => <LegalTabs {...props} />,
};
