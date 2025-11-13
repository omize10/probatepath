import type { Metadata } from "next";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const metadata: Metadata = {
  title: "Legal",
  description: "Review ProbatePath terms, privacy commitments, and disclaimer.",
};

const sections = [
  {
    id: "terms",
    label: "Terms",
    body: [
      "ProbatePath provides technology-enabled probate document preparation for British Columbia executors. By using this service you authorise us to collect the information required to generate filing-ready documents.",
      "You remain responsible for reviewing the materials, ensuring accuracy, signing, filing, and complying with the Supreme Court of British Columbia.",
      "Fees are fixed once scope is confirmed. We may decline or pause engagements that fall outside our process or introduce conflicts of interest.",
    ],
  },
  {
    id: "privacy",
    label: "Privacy",
    body: [
      "We collect only the personal information needed to deliver intake, drafting, and support. Data is encrypted in transit and at rest on Canadian infrastructure.",
      "Access is limited to team members involved in preparing your documents. Files remain available in your secure vault for twelve months unless you request deletion sooner.",
      "Contact privacy@probatepath.ca to request access, correction, or deletion of your information.",
    ],
  },
  {
    id: "disclaimer",
    label: "Disclaimer",
    body: [
      "ProbatePath provides document preparation support and general information. We do not provide legal advice or representation. Executors remain self-represented.",
      "Court rules and requirements may change; you are responsible for verifying current procedures with the Supreme Court of British Columbia.",
      "If your matter becomes complex or contested, we encourage you to seek independent legal counsel.",
    ],
  },
];

export default function LegalPage() {
  return (
    <div className="space-y-12 pb-16">
      <header className="space-y-4">
        <Badge variant="outline" className="border-[#1e3a8a] text-[#1e3a8a]">
          Legal
        </Badge>
        <h1 className="font-serif text-4xl text-[#0f172a] sm:text-5xl">Terms, privacy, and disclaimer</h1>
        <p className="max-w-3xl text-base text-[#495067]">
          Transparency matters. Review how ProbatePath works, how we handle your information, and important disclaimers.
        </p>
      </header>

      <Tabs defaultValue="terms">
        <TabsList>
          {sections.map((section) => (
            <TabsTrigger key={section.id} value={section.id}>
              {section.label}
            </TabsTrigger>
          ))}
        </TabsList>
        {sections.map((section) => (
          <TabsContent key={section.id} value={section.id}>
            {section.body.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </TabsContent>
        ))}
      </Tabs>

      <div className="rounded-3xl border border-[#e2e8f0] bg-white p-6 text-sm text-[#495067]">
        ProbatePath provides document preparation support and general information. We do not provide legal advice or representation. Executors remain self-represented.
      </div>
    </div>
  );
}
