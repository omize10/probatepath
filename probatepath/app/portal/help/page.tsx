import Link from "next/link";
import { PortalShell } from "@/components/portal/PortalShell";

const helpSections = [
  {
    id: "probate",
    title: "How probate works",
    body: [
      "Probate is the BC Supreme Court’s way of confirming the executor’s authority. You gather the will, inventory the estate, deliver notices, swear affidavits, and file the packet with the registry.",
      "Most uncontested estates follow the same order: confirm the will, send notices, swear affidavits, and wait for the grant.",
    ],
  },
  {
    id: "process",
    title: "How our process works",
    body: [
      "ProbatePath guides you through the court packet only—we do not manage asset distribution or act as your lawyer.",
      "Every answer in the intake flows into the documents. Update information once and re-download any form.",
    ],
  },
  {
    id: "signing",
    title: "How to sign affidavits",
    body: [
      "Bring unsigned originals and two pieces of ID to a lawyer, notary, or commissioner for oaths.",
      "Only sign or initial when the commissioner instructs you. They will witness your signature and stamp each affidavit.",
    ],
  },
  {
    id: "filing",
    title: "How to file with the court",
    body: [
      "Assemble the packet with tabs and exhibits in the required order. Include the original will and death certificate.",
      "File in person or send by tracked courier to the registry for the deceased’s residence. Keep copies of everything you submit.",
    ],
  },
];

export default function HelpPage() {
  return (
    <PortalShell
      title="Help & guidance"
      description="Plain-language explanations for the BC probate journey. We cover the packet from start to finish—no legal advice, just clear steps."
      eyebrow="Help"
    >
      <div className="space-y-6">
        {helpSections.map((section) => (
          <article key={section.id} id={section.id} className="portal-card space-y-3 p-6">
            <p className="text-xs uppercase tracking-[0.3em] text-[color:var(--ink-muted)]">{section.title}</p>
            {section.body.map((paragraph) => (
              <p key={paragraph} className="text-sm text-[color:var(--ink-muted)]">
                {paragraph}
              </p>
            ))}
          </article>
        ))}
        <div className="portal-card space-y-3 p-6">
          <p className="text-xs uppercase tracking-[0.3em] text-[color:var(--ink-muted)]">Need a human?</p>
          <h3 className="font-serif text-2xl text-[color:var(--ink)]">Contact support</h3>
          <p className="text-sm text-[color:var(--ink-muted)]">
            We respond within one business day. We provide document preparation guidance only and do not represent you.
          </p>
          <Link href="mailto:hello@probatepath.ca" className="text-lg font-semibold text-[color:var(--brand-navy)]">
            hello@probatepath.ca
          </Link>
        </div>
      </div>
    </PortalShell>
  );
}
