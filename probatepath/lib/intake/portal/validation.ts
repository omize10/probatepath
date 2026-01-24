import type { IntakeDraft } from "@/lib/intake/types";
import { portalSteps, shouldSkipStep, type PortalStepId } from "@/lib/intake/portal/steps";

export type PortalStepErrors = Record<string, string>;

type Validator = (draft: IntakeDraft) => PortalStepErrors;

const required = (value?: string | null) => typeof value === "string" && value.trim().length > 0;
const validEmail = (value?: string | null) => typeof value === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

const validators: Partial<Record<PortalStepId, Validator>> = {
  "will-upload": (draft) => {
    const errors: PortalStepErrors = {};
    if (!draft.estateIntake.willUpload.hasFiles) {
      errors["willUpload.hasFiles"] = "Please upload the will before continuing.";
    }
    return errors;
  },
  "applicant-name-contact": (draft) => {
    const errors: PortalStepErrors = {};
    const applicant = draft.estateIntake.applicant;
    if (!required(applicant.name.first)) errors["applicant.name.first"] = "Enter your first name.";
    if (!required(applicant.name.last)) errors["applicant.name.last"] = "Enter your last name.";
    if (!required(applicant.contact.email)) {
      errors["applicant.contact.email"] = "Enter your email.";
    } else if (!validEmail(applicant.contact.email)) {
      errors["applicant.contact.email"] = "Enter a valid email address.";
    }
    if (!required(applicant.contact.phone)) errors["applicant.contact.phone"] = "Enter your phone number.";
    return errors;
  },
  "applicant-address-relationship": (draft) => {
    const errors: PortalStepErrors = {};
    const { address, relationship } = draft.estateIntake.applicant;
    if (!required(address.line1)) errors["applicant.address.line1"] = "Enter your address.";
    if (!required(address.city)) errors["applicant.address.city"] = "Enter the city.";
    if (!required(address.region)) errors["applicant.address.region"] = "Enter the province or territory.";
    if (!required(address.postalCode)) errors["applicant.address.postalCode"] = "Enter the postal code.";
    if (!relationship) errors["applicant.relationship"] = "Select a relationship.";
    return errors;
  },
  "applicant-coapp-question": (draft) => {
    const errors: PortalStepErrors = {};
    if (!draft.estateIntake.applicant.isOnlyApplicant) {
      errors["applicant.isOnlyApplicant"] = "Please let us know if you are the only applicant.";
    }
    return errors;
  },
  "applicant-coapp-list": (draft) => {
    const errors: PortalStepErrors = {};
    if (draft.estateIntake.applicant.isOnlyApplicant === "no") {
      if (draft.estateIntake.applicant.coApplicants.length === 0) {
        errors["applicant.coApplicants"] = "Add each co-applicant.";
      }
    }
    return errors;
  },
  "deceased-basics": (draft) => {
    const errors: PortalStepErrors = {};
    const deceased = draft.estateIntake.deceased;
    if (!required(deceased.name.first)) errors["deceased.name.first"] = "Enter their first name.";
    if (!required(deceased.name.last)) errors["deceased.name.last"] = "Enter their last name.";
    if (!required(deceased.dateOfDeath)) errors["deceased.dateOfDeath"] = "Enter the date of death.";
    if (!required(deceased.placeOfDeath.city)) errors["deceased.placeOfDeath.city"] = "Enter the city of death.";
    if (!required(deceased.placeOfDeath.province)) errors["deceased.placeOfDeath.province"] = "Enter the province.";
    if (!required(deceased.placeOfDeath.country)) errors["deceased.placeOfDeath.country"] = "Enter the country.";
    return errors;
  },
  "deceased-birth-address": (draft) => {
    const errors: PortalStepErrors = {};
    const deceased = draft.estateIntake.deceased;
    if (!required(deceased.dateOfBirth)) errors["deceased.dateOfBirth"] = "Enter the date of birth.";
    if (!required(deceased.address.line1)) errors["deceased.address.line1"] = "Enter the last address.";
    if (!required(deceased.address.city)) errors["deceased.address.city"] = "Enter the city.";
    if (!required(deceased.address.region)) errors["deceased.address.region"] = "Enter the province.";
    if (!required(deceased.address.postalCode)) errors["deceased.address.postalCode"] = "Enter the postal code.";
    return errors;
  },
  "deceased-marital": (draft) => {
    const errors: PortalStepErrors = {};
    if (!draft.estateIntake.deceased.maritalStatus) {
      errors["deceased.maritalStatus"] = "Select a marital status.";
    }
    return errors;
  },
  "will-presence": (draft) => {
    const errors: PortalStepErrors = {};
    if (!draft.estateIntake.will.hasWill) {
      errors["will.hasWill"] = "Tell us whether there is a will.";
    }
    return errors;
  },
  "will-details": (draft) => {
    const errors: PortalStepErrors = {};
    if (draft.estateIntake.will.hasWill === "yes") {
      if (!required(draft.estateIntake.will.dateSigned)) {
        errors["will.dateSigned"] = "Enter the date the will was signed.";
      }
      if (!required(draft.estateIntake.will.signingLocation.city)) {
        errors["will.signingLocation.city"] = "Enter the city where it was signed.";
      }
    }
    return errors;
  },
  "will-original": (draft) => {
    const errors: PortalStepErrors = {};
    if (!draft.estateIntake.will.hasOriginal) {
      errors["will.hasOriginal"] = "Select an answer.";
    }
    if (!required(draft.estateIntake.will.storageLocation)) {
      errors["will.storageLocation"] = "Describe where the original is stored.";
    }
    return errors;
  },
  "will-executors": (draft) => {
    const errors: PortalStepErrors = {};
    if (draft.estateIntake.will.namedExecutors.length === 0) {
      errors["will.namedExecutors"] = "List at least one executor named in the will.";
    }
    return errors;
  },
  "will-codicils": (draft) => {
    const errors: PortalStepErrors = {};
    if (!draft.estateIntake.will.hasCodicils) {
      errors["will.hasCodicils"] = "Let us know if there are codicils.";
    }
    if (draft.estateIntake.will.hasCodicils === "yes" && draft.estateIntake.will.codicils.length === 0) {
      errors["will.codicils"] = "Add each codicil or change.";
    }
    return errors;
  },
  "family-spouse": (draft) => {
    const errors: PortalStepErrors = {};
    const { hasSpouse, spouse } = draft.estateIntake.family;
    if (!hasSpouse) {
      errors["family.hasSpouse"] = "Answer yes or no.";
    }
    if (hasSpouse === "yes") {
      if (!required(spouse.name.first)) errors["family.spouse.name.first"] = "Enter the spouse’s name.";
      if (!required(spouse.address.line1)) errors["family.spouse.address.line1"] = "Enter the spouse’s address.";
    }
    return errors;
  },
  "family-children": (draft) => {
    const errors: PortalStepErrors = {};
    const { hasChildren, children } = draft.estateIntake.family;
    if (!hasChildren) {
      errors["family.hasChildren"] = "Answer yes or no.";
    }
    if (hasChildren === "yes" && children.length === 0) {
      errors["family.children"] = "Add each child";
    }
    return errors;
  },
  "beneficiaries-people": (draft) => {
    const errors: PortalStepErrors = {};
    if (draft.estateIntake.beneficiaries.people.length === 0 && draft.estateIntake.beneficiaries.organizations.length === 0) {
      errors["beneficiaries.people"] = "List at least one beneficiary.";
    }
    return errors;
  },
  "assets-realestate": (draft) => {
    const errors: PortalStepErrors = {};
    if (!draft.estateIntake.assets.hasBCRealEstate) {
      errors["assets.hasBCRealEstate"] = "Answer yes or no.";
    }
    if (draft.estateIntake.assets.hasBCRealEstate === "yes" && draft.estateIntake.assets.bcProperties.length === 0) {
      errors["assets.bcProperties"] = "Add each BC property.";
    }
    return errors;
  },
  "assets-accounts": (draft) => {
    const errors: PortalStepErrors = {};
    if (!draft.estateIntake.assets.hasBankOrInvestments) {
      errors["assets.hasBankOrInvestments"] = "Answer yes or no.";
    }
    if (draft.estateIntake.assets.hasBankOrInvestments === "yes" && draft.estateIntake.assets.accounts.length === 0) {
      errors["assets.accounts"] = "List the accounts.";
    }
    return errors;
  },
  "debts-liabilities": (draft) => {
    const errors: PortalStepErrors = {};
    if (draft.estateIntake.debts.liabilities.length === 0) {
      errors["debts.liabilities"] = "List known debts or estimates.";
    }
    return errors;
  },
  "special-prior": (draft) => {
    const errors: PortalStepErrors = {};
    if (!draft.estateIntake.specialIssues.hasPriorGrant) {
      errors["specialIssues.hasPriorGrant"] = "Answer yes or no.";
    }
    if (!draft.estateIntake.specialIssues.hasPotentialDispute) {
      errors["specialIssues.hasPotentialDispute"] = "Answer yes or no.";
    }
    return errors;
  },
  "filing-registry": (draft) => {
    const errors: PortalStepErrors = {};
    if (!required(draft.estateIntake.filing.registryLocation)) {
      errors["filing.registryLocation"] = "Select a registry.";
    }
    const address = draft.estateIntake.filing.returnAddress;
    if (!required(address.line1)) errors["filing.returnAddress.line1"] = "Enter a mailing address.";
    if (!required(address.city)) errors["filing.returnAddress.city"] = "Enter the city.";
    if (!required(address.region)) errors["filing.returnAddress.region"] = "Enter the province.";
    if (!required(address.postalCode)) errors["filing.returnAddress.postalCode"] = "Enter the postal code.";
    return errors;
  },
};

export function validatePortalStep(stepId: PortalStepId, draft: IntakeDraft) {
  if (shouldSkipStep(stepId, draft)) {
    return { valid: true, errors: {} as PortalStepErrors };
  }
  const validator = validators[stepId];
  if (!validator) {
    return { valid: true, errors: {} as PortalStepErrors };
  }
  const errors = validator(draft);
  return { valid: Object.keys(errors).length === 0, errors };
}

export function isPortalStepComplete(stepId: PortalStepId, draft: IntakeDraft) {
  return validatePortalStep(stepId, draft).valid;
}

export function findFirstIncompletePortalStep(draft: IntakeDraft): PortalStepId {
  for (const step of portalSteps) {
    if (shouldSkipStep(step.id, draft)) continue;
    if (!isPortalStepComplete(step.id, draft)) {
      return step.id;
    }
  }
  return portalSteps[portalSteps.length - 1].id;
}

type PortalProgressCheck = {
  id: PortalStepId;
};

const progressChecks: PortalProgressCheck[] = portalSteps.map((step) => ({ id: step.id }));

export function calculatePortalProgress(draft: IntakeDraft | null | undefined) {
  if (!draft) return 0;
  const completed = progressChecks.filter((entry) => isPortalStepComplete(entry.id, draft)).length;
  return Math.round((completed / progressChecks.length) * 100);
}
