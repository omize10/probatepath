"use client";

import { PortalShell } from "@/components/portal/PortalShell";
import { InteractiveChecklist } from "@/components/portal/checklists/InteractiveChecklist";
import { CommonMistakes } from "@/components/portal/checklists/CommonMistakes";
import { AssemblyGuide } from "@/components/portal/checklists/AssemblyGuide";

const PRINT_CHECKLIST = [
  { id: "single-sided", label: "I printed everything single-sided", description: "Courts require single-sided printing for all probate documents.", critical: true },
  { id: "letter-size", label: "I used letter-size paper (8.5 x 11 inches)", description: "Do not use legal size or A4 paper.", critical: true },
  { id: "no-staples", label: "I did NOT staple any pages together", description: "Leave all pages loose. The court will bind them.", critical: true },
  { id: "all-pages", label: "I printed all pages, including blank ones", description: "Some forms have intentionally blank pages. Print them all." },
  { id: "black-ink", label: "I used black ink only", description: "No color printing needed for probate forms." },
  { id: "quality", label: "Print quality is clear and readable", description: "Check for smudges, cut-off text, or faded areas." },
  { id: "copies", label: "I printed the correct number of copies", description: "You need originals for the court plus copies for your records." },
];

const MAILING_CHECKLIST = [
  { id: "registered", label: "I'm using registered mail (or courier with signature)", description: "You need proof of delivery for each recipient.", critical: true },
  { id: "tracking", label: "I wrote down each tracking number", description: "Save tracking numbers in the P1 Tracker page." },
  { id: "return-address", label: "I included a return address on each envelope", description: "Use your home address as the return address." },
  { id: "correct-addresses", label: "I verified each recipient's address", description: "Double-check addresses against your intake answers." },
  { id: "p1-copy", label: "Each envelope has a copy of the P1 notice", description: "Each beneficiary gets their own copy." },
  { id: "kept-copy", label: "I kept a copy of each notice for my records", description: "You'll need these if there's a dispute." },
  { id: "date-noted", label: "I noted today's date for the 21-day countdown", description: "Your waiting period starts from the date you mail." },
];

const SIGNING_CHECKLIST = [
  { id: "no-pre-sign", label: "I did NOT sign anything yet", description: "Affidavits must be signed in front of a notary. Signing early invalidates them.", critical: true },
  { id: "notary-booked", label: "I have a notary appointment booked", description: "You can find a notary at any notary public office in BC." },
  { id: "bring-id", label: "I'll bring government-issued photo ID", description: "Driver's license or passport." },
  { id: "bring-docs", label: "I'll bring all unsigned documents to the appointment", description: "The notary needs to witness your signature." },
  { id: "blue-ink", label: "I'll sign in blue ink", description: "Blue ink distinguishes originals from photocopies.", critical: true },
  { id: "initial-changes", label: "I understand I cannot make changes after signing", description: "Any corrections must be done before the notary appointment." },
];

export default function ChecklistsPage() {
  return (
    <PortalShell
      title="Checklists and guides"
      description="Use these checklists to make sure you don't miss any steps. Check off each item as you complete it."
      eyebrow="Preparation"
    >
      <div className="space-y-6">
        <CommonMistakes />

        <InteractiveChecklist
          title="Printing checklist"
          description="Confirm each item before sending your documents."
          items={PRINT_CHECKLIST}
          storageKey="pd-checklist-print"
        />

        <InteractiveChecklist
          title="Signing and notary checklist"
          description="Confirm before your notary appointment."
          items={SIGNING_CHECKLIST}
          storageKey="pd-checklist-signing"
        />

        <InteractiveChecklist
          title="Mailing checklist"
          description="Confirm before mailing your P1 notices."
          items={MAILING_CHECKLIST}
          storageKey="pd-checklist-mailing"
        />

        <AssemblyGuide />
      </div>
    </PortalShell>
  );
}
