import type { PortalStepId } from "./steps";

type InfoBlock = {
  title: string;
  body: string;
  tips: string[];
};

const defaultBlock: InfoBlock = {
  title: "Need a hand?",
  body: "Answer each question in plain language. We autosave everything and you can always return later.",
  tips: ["If you are missing details, add a short note so we can follow up."],
};

export const portalStepInfo: Record<PortalStepId, InfoBlock> = {
  "applicant-name-contact": {
    title: "Why we ask",
    body: "Your full legal name, email, and phone appear on every court form and in correspondence with banks.",
    tips: ["Use the exact name that appears on your government ID.", "Provide contact details you check daily."],
  },
  "applicant-address-relationship": {
    title: "Official mailing address",
    body: "The court sends notices and returned documents to this address, so it needs to be accurate.",
    tips: ["Use your current home address.", "Explain how you’re related in everyday terms (e.g., daughter, friend)."],
  },
  "applicant-coapp-question": {
    title: "Multiple applicants",
    body: "If anyone else is applying with you we must list them, otherwise the court will reject the filing.",
    tips: ["Check the will to see who was appointed.", "If someone is renouncing their role, add a note later."],
  },
  "applicant-coapp-list": {
    title: "Co‑applicant details",
    body: "We need the same level of detail for every applicant so the grant can be issued correctly.",
    tips: ["Use the name and contact details they use elsewhere.", "Include a quick note if someone lives outside BC."],
  },
  "deceased-basics": {
    title: "Name and death details",
    body: "The registry compares the name and death data across every schedule, so we need it exactly as on the certificate.",
    tips: ["If the death certificate spelling differs from the will, note it in the next steps.", "Include hyphenated or multiple surnames."],
  },
  "deceased-birth-address": {
    title: "Birth & residence",
    body: "Birth date confirms identity, and the last usual address determines the proper registry.",
    tips: ["Use the address where they mainly lived, not a vacation property.", "If they were in care, list the facility plus a note."],
  },
  "deceased-marital": {
    title: "Marital status",
    body: "Spouses and former spouses have certain rights, and we must know who may require notice.",
    tips: ["If separated but not divorced, choose “separated”.", "Common-law counts if they lived together in a marriage-like relationship."],
  },
  "will-presence": {
    title: "Will on hand",
    body: "The process differs depending on whether there is a will. Even if you’re unsure, we can help plan next steps.",
    tips: ["Search safes, law firms, and safety deposit boxes.", "If you truly can’t find a will, choose “No”."]},
  "will-details": {
    title: "Will signing details",
    body: "The court needs to know which will is the last valid one and when it was signed.",
    tips: ["You’ll usually find the date near the signature block.", "If the will was signed outside BC, include that location."],
  },
  "will-original": {
    title: "Original document",
    body: "Probate requires the wet-ink original. Knowing where it is lets us plan filings and couriers.",
    tips: ["If a law firm holds it, write their name.", "If you only have a copy, explain who has the original."],
  },
  "will-executors": {
    title: "Executors appointed",
    body: "We must identify everyone the will names, even if they aren’t applying, so the court understands your authority.",
    tips: ["Look near the start of the will for the appointment clause.", "Include alternates and replacement executors."],
  },
  "will-codicils": {
    title: "Codicils and updates",
    body: "Amendments can change gifts or executors. Recording them now avoids surprises later.",
    tips: ["A codicil is usually titled “Codicil” or “Supplementary Will”.", "If unsure, note anything that looks like an update."],
  },
  "family-spouse": {
    title: "Spouse or partner",
    body: "Spouses must usually receive notice and can have their own claims.",
    tips: ["Spouse includes married or long-term common-law partners.", "If there was a separation agreement, mention it in notes."],
  },
  "family-children": {
    title: "Children",
    body: "Children—even adults—often have to be notified or mentioned in the application.",
    tips: ["Include legally adopted children.", "Mark anyone under 19 so we can plan guardian notices."],
  },
  "family-relatives": {
    title: "Other close relatives",
    body: "If there’s no spouse or children, the closest relatives usually need notice.",
    tips: ["Think of parents, siblings, nieces, and nephews.", "Add anyone you expect the court might ask about."],
  },
  "beneficiaries-people": {
    title: "Beneficiaries",
    body: "Everyone receiving something under the will must be listed so notices and schedules stay accurate.",
    tips: ["Use the name written in the will.", "Describe the gift in plain language if it isn’t obvious."],
  },
  "beneficiaries-organizations": {
    title: "Charities & organisations",
    body: "Charities often require particular wording and registered numbers.",
    tips: ["Check the charity’s CRA listing for the official name.", "If the will uses an outdated name, mention it in notes."],
  },
  "assets-realestate": {
    title: "Real estate",
    body: "Property information feeds directly into the Affidavit of Assets and Liabilities.",
    tips: ["Use civic addresses from tax notices.", "Include co-owner names if the property is joint."],
  },
  "assets-accounts": {
    title: "Bank & investments",
    body: "Account summaries help us value the estate and complete the probate schedules.",
    tips: ["Group similar small accounts together if easier.", "An approximate balance is fine at this stage."],
  },
  "assets-property": {
    title: "Vehicles & valuables",
    body: "High-value items often need to be singled out when valuing the estate.",
    tips: ["Think of cars, boats, jewellery, art, or collections.", "Give a reasonable estimate if you can."],
  },
  "debts-liabilities": {
    title: "Debts",
    body: "Understanding liabilities helps calculate the net estate and plan payouts.",
    tips: ["Include credit cards, loans, taxes owing, or other obligations.", "Funeral costs can be reimbursed from the estate."],
  },
  "special-prior": {
    title: "Prior filings or disputes",
    body: "Existing grants or expected disputes change how we approach the file.",
    tips: ["Mention any lawyer already involved.", "Add a short summary if you anticipate conflict."],
  },
  "filing-registry": {
    title: "Registry & mailing",
    body: "We file in a specific BC Supreme Court registry and need to know where to return documents.",
    tips: ["Choose the registry closest to the deceased’s residence.", "Use an address where important documents can be received safely."],
  },
} as any;

export function getPortalStepInfo(stepId: PortalStepId): InfoBlock {
  return portalStepInfo[stepId] ?? defaultBlock;
}
