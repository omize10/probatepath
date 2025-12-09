import type { IntakeDraft } from "@/lib/intake/types";

export type PortalStepId =
  | "applicant-name-contact"
  | "applicant-address-relationship"
  | "applicant-coapp-question"
  | "applicant-coapp-list"
  | "admin-applicants"
  | "admin-consent"
  | "deceased-basics"
  | "deceased-birth-address"
  | "deceased-marital"
  | "will-presence"
  | "will-details"
  | "will-original"
  | "will-executors"
  | "will-codicils"
  | "will-issues"
  | "family-spouse"
  | "family-children"
  | "family-relatives"
  | "beneficiaries-people"
  | "beneficiaries-organizations"
  | "notice-minors"
  | "assets-realestate"
  | "assets-accounts"
  | "assets-property"
  | "assets-nonestate"
  | "assets-summary"
  | "debts-liabilities"
  | "special-prior"
  | "notice-review"
  | "filing-registry";

export interface PortalStepDefinition {
  id: PortalStepId;
  title: string;
  description: string;
  section: string;
}

export const portalSteps: PortalStepDefinition[] = [
  { id: "applicant-name-contact", title: "Your legal name", description: "Tell us who is applying.", section: "Step 1 · About you" },
  { id: "applicant-address-relationship", title: "Address & relationship", description: "How to reach you and how you’re connected.", section: "Step 1 · About you" },
  { id: "applicant-coapp-question", title: "Are you the only applicant?", description: "Let us know if others are acting with you.", section: "Step 1 · About you" },
  { id: "applicant-coapp-list", title: "Other applicants", description: "Share co-applicant details.", section: "Step 1 · About you" },
  { id: "admin-applicants", title: "Administrator details", description: "Who is applying if there’s no will or executor?", section: "Step 1 · About you" },
  { id: "admin-consent", title: "Consent from other family", description: "Others with priority to apply have agreed.", section: "Step 1 · About you" },
  { id: "deceased-basics", title: "Person who died", description: "Full legal name and death details.", section: "Step 2 · About the person who died" },
  { id: "deceased-birth-address", title: "Birth & last address", description: "Where they were born and lived.", section: "Step 2 · About the person who died" },
  { id: "deceased-marital", title: "Marital status", description: "Helps determine who must be notified.", section: "Step 2 · About the person who died" },
  { id: "will-presence", title: "Is there a will?", description: "Confirm whether a will exists.", section: "Step 3 · The will" },
  { id: "will-details", title: "Will details", description: "Signing date and location.", section: "Step 3 · The will" },
  { id: "will-original", title: "Original will", description: "Where the wet-ink original lives.", section: "Step 3 · The will" },
  { id: "will-executors", title: "Executors named in the will", description: "List everyone appointed.", section: "Step 3 · The will" },
  { id: "will-codicils", title: "Codicils", description: "Record any amendments.", section: "Step 3 · The will" },
  { id: "will-issues", title: "Any issues with the will?", description: "Flags missing signatures or damage.", section: "Step 3 · The will" },
  { id: "family-spouse", title: "Spouse or partner", description: "Tell us about the spouse at death.", section: "Step 4 · Family & beneficiaries" },
  { id: "family-children", title: "Children", description: "List every biological or adopted child.", section: "Step 4 · Family & beneficiaries" },
  { id: "family-relatives", title: "Other close relatives", description: "Capture additional close kin.", section: "Step 4 · Family & beneficiaries" },
  { id: "beneficiaries-people", title: "Beneficiaries in the will", description: "People named to receive gifts.", section: "Step 4 · Family & beneficiaries" },
  { id: "beneficiaries-organizations", title: "Organisations", description: "Charities or other entities in the will.", section: "Step 4 · Family & beneficiaries" },
  { id: "notice-minors", title: "Minors or incapable people", description: "Tell us if anyone needs extra help receiving notice.", section: "Step 4 · Family & beneficiaries" },
  { id: "assets-realestate", title: "Real estate in BC", description: "List each property.", section: "Step 5 · Assets & debts" },
  { id: "assets-accounts", title: "Bank & investment accounts", description: "High-level account list.", section: "Step 5 · Assets & debts" },
  { id: "assets-property", title: "Vehicles & valuables", description: "Other significant assets.", section: "Step 5 · Assets & debts" },
  { id: "assets-nonestate", title: "Joint or designated assets", description: "List things that won’t go through probate.", section: "Step 5 · Assets & debts" },
  { id: "assets-summary", title: "Estimated estate value", description: "We’ll add everything up for court fees.", section: "Step 5 · Assets & debts" },
  { id: "debts-liabilities", title: "Debts & funeral costs", description: "Rough liabilities overview.", section: "Step 5 · Assets & debts" },
  { id: "special-prior", title: "Special issues", description: "Prior grants or disputes.", section: "Step 6 · Special issues & filing" },
  { id: "notice-review", title: "Check who will be notified", description: "Review the full notice list before filing.", section: "Step 6 · Special issues & filing" },
  { id: "filing-registry", title: "Filing details", description: "Registry and return address.", section: "Step 6 · Special issues & filing" },
];

const indexMap = portalSteps.reduce<Record<PortalStepId, number>>((acc, step, index) => {
  acc[step.id] = index;
  return acc;
}, {} as Record<PortalStepId, number>);

export function getPortalStepIndex(stepId: PortalStepId): number {
  return indexMap[stepId] ?? 0;
}

export function getPortalPreviousStep(stepId: PortalStepId, draft?: IntakeDraft): PortalStepDefinition | null {
  const index = getPortalStepIndex(stepId);
  for (let i = index - 1; i >= 0; i -= 1) {
    const candidate = portalSteps[i];
    if (!shouldSkipStep(candidate.id, draft)) {
      return candidate;
    }
  }
  return null;
}

export function getPortalNextStep(stepId: PortalStepId, draft?: IntakeDraft): PortalStepDefinition | null {
  const index = getPortalStepIndex(stepId);
  for (let i = index + 1; i < portalSteps.length; i += 1) {
    const candidate = portalSteps[i];
    if (!shouldSkipStep(candidate.id, draft)) {
      return candidate;
    }
  }
  return null;
}

const skipConditions: Partial<Record<PortalStepId, (draft?: IntakeDraft) => boolean>> = {
  "applicant-coapp-list": (draft) => draft?.estateIntake.applicant.isOnlyApplicant !== "no",
  "admin-applicants": (draft) => {
    const estateWill = draft?.estateIntake.will;
    const hasWill = estateWill?.hasWill === "yes";
    const executorApplying = estateWill?.namedExecutors?.some((ex) => ex.isApplicant === "yes") ?? false;
    return hasWill && executorApplying;
  },
  "admin-consent": (draft) => {
    const estate = draft?.estateIntake;
    const hasWill = estate?.will.hasWill === "yes";
    const onlyApplicant = estate?.applicant.isOnlyApplicant === "yes";
    return hasWill || onlyApplicant;
  },
  "will-issues": (draft) => draft?.estateIntake.will.hasWill !== "yes",
  "notice-minors": (draft) => {
    const children = draft?.estateIntake.family.children ?? [];
    const people = draft?.estateIntake.beneficiaries.people ?? [];
    const hasMinorChild = children.some((child) => child.isMinor || (child as unknown as { hasDisability?: boolean }).hasDisability);
    const hasVulnerableBeneficiary = people.some(
      (person) => person.isMinorOrIncapable || (person as unknown as { hasDisability?: boolean }).hasDisability,
    );
    return !hasMinorChild && !hasVulnerableBeneficiary;
  },
  "assets-summary": () => false,
  "notice-review": () => false,
};

export function shouldSkipStep(stepId: PortalStepId, draft?: IntakeDraft) {
  const fn = skipConditions[stepId];
  return fn ? fn(draft) : false;
}

export function isPortalStepId(value: unknown): value is PortalStepId {
  if (typeof value !== "string") return false;
  return portalSteps.some((step) => step.id === value);
}

export function normalizePortalStepId(value?: string | null): PortalStepId | null {
  if (!value) return null;
  return isPortalStepId(value) ? (value as PortalStepId) : null;
}
