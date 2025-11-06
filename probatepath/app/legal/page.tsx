import type { Metadata } from "next";
import { Section } from "@/components/section";
import { CTAPanel } from "@/components/cta-panel";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const metadata: Metadata = {
  title: "Legal information",
  description:
    "Read the ProbatePath terms, privacy commitments, and disclaimer. Executors remain self-represented and in control.",
};

const termsContent = [
  "ProbatePath provides technology-enabled probate document preparation for executors in British Columbia. By engaging us you authorise the collection and use of information required to prepare your filing-ready package. You remain responsible for reviewing the materials, ensuring accuracy, signing, filing, and complying with the Supreme Court of British Columbia.",
  "Fees are fixed once scoping is complete and become non-refundable after drafting begins. We may decline or pause engagements that fall outside our automation scope, introduce conflicts of interest, or involve contested estates. ProbatePath does not attend the courthouse on your behalf.",
  "ProbatePath is not a law firm. Engaging us does not create a lawyer-client relationship. When matters require court advocacy, we recommend speaking with an independent lawyer.",
];

const privacyContent = [
  "We collect only the personal information needed to deliver intake, drafting, and support. Data is encrypted in transit and at rest on Canadian infrastructure. Access is limited to team members directly involved in preparing your documents and each is bound by confidentiality obligations.",
  "Documents remain available in your secure portal for twelve months unless you request earlier deletion. We never sell or trade personal information. We may contact you with ProbatePath updates relevant to your engagement, and you can opt out at any time.",
  "Requests for data access, correction, or deletion can be sent to privacy@probatepath.ca. We respond within thirty days and confirm once actions are complete.",
];

const disclaimerContent = [
  "Materials provided by ProbatePath are for information and document preparation purposes. Court rules and requirements may change; you are responsible for verifying current procedures with the Supreme Court of British Columbia.",
  "ProbatePath is not responsible for delays caused by the court, beneficiaries, commissioners, or other external parties. Any reliance on the information and documents you receive is at your discretion.",
  "If a dispute arises or your matter becomes complex, we encourage you to work with an independent lawyer who can represent you in legal proceedings. We can introduce trusted partners on request.",
];

export default function LegalPage() {
  return (
    <div className="space-y-20 pb-16">
      <header className="space-y-6">
        <Badge variant="outline">Legal</Badge>
        <h1 className="font-serif text-4xl text-white sm:text-5xl">Terms, privacy, and disclaimer</h1>
        <p className="max-w-3xl text-base text-slate-300">
          ProbatePath pairs modern intake with careful document preparation. Review the details below to understand how we work and how your information is handled.
        </p>
        <div className="rounded-3xl border border-white/15 bg-[#111217]/80 p-5 text-sm text-slate-200">
          ProbatePath provides document preparation support and general information. We are not your lawyers. Executors remain self-represented and in control of filing decisions.
        </div>
      </header>

      <Section className="space-y-10">
        <Tabs defaultValue="terms">
          <TabsList>
            <TabsTrigger value="terms">Terms</TabsTrigger>
            <TabsTrigger value="privacy">Privacy</TabsTrigger>
            <TabsTrigger value="disclaimer">Disclaimer</TabsTrigger>
          </TabsList>
          <TabsContent value="terms">
            <ul className="space-y-4">
              {termsContent.map((paragraph) => (
                <li key={paragraph}>{paragraph}</li>
              ))}
            </ul>
          </TabsContent>
          <TabsContent value="privacy">
            <ul className="space-y-4">
              {privacyContent.map((paragraph) => (
                <li key={paragraph}>{paragraph}</li>
              ))}
            </ul>
          </TabsContent>
          <TabsContent value="disclaimer">
            <ul className="space-y-4">
              {disclaimerContent.map((paragraph) => (
                <li key={paragraph}>{paragraph}</li>
              ))}
            </ul>
          </TabsContent>
        </Tabs>
      </Section>

      <Section>
        <CTAPanel
          eyebrow="Need clarification?"
          title="We’re happy to answer questions about our scope or data practices."
          description="Email hello@probatepath.ca and we’ll provide clear, written answers so you can make confident decisions."
          primaryAction={{ label: "Contact", href: "/contact" }}
          secondaryAction={{ label: "Start intake", href: "/start", variant: "ghost" }}
        />
      </Section>
    </div>
  );
}
