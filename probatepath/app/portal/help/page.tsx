import Link from "next/link";
import { PortalShell } from "@/components/portal/PortalShell";

type HelpSection = {
  id: string;
  eyebrow: string;
  title: string;
  body: string[];
};

const sections: HelpSection[] = [
  {
    id: "probate",
    eyebrow: "How probate works",
    title: "BC probate in plain language",
    body: [
      "Probate is the Supreme Court’s confirmation that the executor (or administrator) has authority to deal with the estate. You verify the will, notify interested parties, swear affidavits, file the packet, and wait for the grant.",
      "Straightforward estates follow a predictable order—confirm the will, deliver notices, swear the paperwork, and file the packet. Our guided flow mirrors that sequence.",
    ],
  },
  {
    id: "portal",
    eyebrow: "Using this portal",
    title: "What ProbateDesk does (and doesn’t) cover",
    body: [
      "We provide document preparation and court-packet guidance only. We’re not a law firm and we don’t give legal advice. If you need bespoke representation, we can connect you with partner firms.",
      "Every answer in the intake wizard flows into the portal, documents, and steps. Update the intake once and regenerate PDFs whenever you need an updated version.",
    ],
  },
  {
    id: "will-search",
    eyebrow: "Will registry search",
    title: "BC wills notice requirements",
    body: [
      "The Vital Statistics Agency requires a VSA 532 request before the court will review your filing. We pre-fill that packet for you under Documents → Will search and guide you through download → sign → fill → mail → track.",
      "Mail or drop off the form—BC no longer accepts email submissions. Use tracked mail or Service BC, and keep the receipt for your records.",
    ],
  },
  {
    id: "signing",
    eyebrow: "Signing affidavits",
    title: "Commissioner / notary checklist",
    body: [
      "Bring the unsigned packet, two pieces of ID, and exhibit tabs to a lawyer, notary, or commissioner for oaths. Only sign when they instruct you.",
      "Initial any corrections, sign every spot flagged in the guided flow, and keep both the original and a scanned copy once the appointment is finished.",
    ],
  },
  {
    id: "filing",
    eyebrow: "Filing at court",
    title: "Assembling and submitting the packet",
    body: [
      "Assemble the packet in the order described in the guided step: tabs, exhibits, original will, certified death certificate, and notarized affidavits.",
      "File in person or send by tracked courier to the registry for the deceased’s residence. Keep the courier receipt, payment proof, and any registry reference numbers so you can follow up.",
    ],
  },
  {
    id: "support",
    eyebrow: "Contact & next steps",
    title: "Need a human?",
    body: [
      "We respond within one business day. We can clarify portal steps and connect you with partner counsel if the estate becomes contested.",
      "Email hello@probatedesk.ca or visit the Contact page for a callback request.",
    ],
  },
];

export default function HelpPage() {
  return (
    <PortalShell
      eyebrow="Help"
      title="Help & guidance"
      description="Bookmark these sections and jump to the relevant anchor while you move through the guided flow."
    >
      <div className="space-y-6">
        {sections.map((section) => (
          <article key={section.id} id={section.id} className="portal-card space-y-3 p-6">
            <p className="text-xs uppercase tracking-[0.3em] text-[color:var(--ink-muted)]">{section.eyebrow}</p>
            <h3 className="font-serif text-2xl text-[color:var(--ink)]">{section.title}</h3>
            {section.body.map((paragraph) => (
              <p key={paragraph} className="text-sm text-[color:var(--ink-muted)]">
                {paragraph}
              </p>
            ))}
            {section.id === "support" ? (
              <div className="pt-2">
                <Link href="mailto:hello@probatedesk.ca" className="text-lg font-semibold text-[color:var(--brand-navy)]">
                  hello@probatedesk.ca
                </Link>
              </div>
            ) : null}
          </article>
        ))}
      </div>
    </PortalShell>
  );
}
