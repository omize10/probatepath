/**
 * Centralized warning text library for user error prevention
 * Use these consistent messages across the application
 */

export type WarningSeverity = "info" | "warning" | "danger";

export interface WarningDefinition {
  title: string;
  body: string;
  severity: WarningSeverity;
}

export const WARNINGS = {
  // ============================================
  // INTAKE - Deceased Information
  // ============================================
  DECEASED_NAME_MATCH: {
    title: "Name must match death certificate",
    body: "The court compares this to your death certificate. Any mismatch will delay or reject your application.",
    severity: "danger" as const,
  },
  DATE_IN_FUTURE: {
    title: "Date appears to be in the future",
    body: "Please check this date. It cannot be in the future.",
    severity: "danger" as const,
  },
  DATE_VERY_RECENT: {
    title: "Recent death",
    body: "If death occurred less than a week ago, you may not have received the death certificate yet. You'll need the certificate to proceed.",
    severity: "warning" as const,
  },
  DATE_VERY_OLD: {
    title: "Delayed application",
    body: "Applications filed more than 2 years after death may have additional requirements. We'll help you navigate this.",
    severity: "info" as const,
  },

  // ============================================
  // INTAKE - Will Information
  // ============================================
  NO_ORIGINAL_WILL: {
    title: "Missing original will",
    body: "BC courts require the original signed will. Without it, you'll need additional court affidavits proving the will wasn't revoked. This may delay your application by several weeks.",
    severity: "danger" as const,
  },
  WILL_HAS_CODICILS: {
    title: "Will has amendments",
    body: "Codicils (amendments) to the will must be filed together with the original will. Make sure you have all codicils.",
    severity: "warning" as const,
  },
  WILL_NOT_FOUND: {
    title: "No will found",
    body: "If there is no will, this becomes an administration (intestate) case. The court decides who can apply and how assets are distributed.",
    severity: "info" as const,
  },

  // ============================================
  // INTAKE - Estate Information
  // ============================================
  FOREIGN_ASSETS: {
    title: "Foreign assets detected",
    body: "Assets outside Canada may require additional grants in those jurisdictions. This adds complexity and cost to the probate process.",
    severity: "warning" as const,
  },
  HIGH_VALUE_ESTATE: {
    title: "Complex estate",
    body: "Estates over $1 million may have additional reporting requirements and higher court fees.",
    severity: "info" as const,
  },
  ESTATE_VALUE_UNDERESTIMATE: {
    title: "Verify estate value",
    body: "Underestimating the estate value can result in rejected filings and additional fees. Include all assets: property, accounts, vehicles, and valuables.",
    severity: "warning" as const,
  },

  // ============================================
  // INTAKE - Beneficiaries
  // ============================================
  MISSING_BENEFICIARIES: {
    title: "All beneficiaries must be listed",
    body: "Every person entitled to notice must be listed. Missing someone can invalidate your application or cause legal problems later.",
    severity: "danger" as const,
  },
  MINOR_BENEFICIARIES: {
    title: "Minor beneficiaries",
    body: "Beneficiaries under 19 years old have special notice requirements. A guardian or the Public Guardian and Trustee may need to be notified.",
    severity: "warning" as const,
  },
  INCAPABLE_BENEFICIARIES: {
    title: "Incapable beneficiaries",
    body: "Beneficiaries who lack mental capacity have special notice requirements. Their guardian or committee must be notified.",
    severity: "warning" as const,
  },

  // ============================================
  // PORTAL - Will Search Milestone
  // ============================================
  WILL_SEARCH_CONFIRM: {
    title: "Confirm will search mailed",
    body: "This starts your case timeline. Only confirm after you have actually mailed the envelope to Vital Statistics.",
    severity: "warning" as const,
  },
  WILL_SEARCH_CHECKLIST: {
    title: "Before mailing",
    body: "Make sure you've included the signed form and a copy of the death certificate in the envelope.",
    severity: "info" as const,
  },

  // ============================================
  // PORTAL - P1 Notices Milestone
  // ============================================
  P1_NOTICES_21_DAY: {
    title: "21-day waiting period",
    body: "The court requires 21 days for recipients to respond before you can file. This period starts when you confirm all notices have been sent.",
    severity: "warning" as const,
  },
  P1_NOTICES_INCOMPLETE: {
    title: "All notices must be sent",
    body: "You must send a P1 notice to every person entitled to receive one. Missing anyone can delay or invalidate your application.",
    severity: "danger" as const,
  },

  // ============================================
  // PORTAL - Probate Filing Milestone
  // ============================================
  PROBATE_FILED_IRREVERSIBLE: {
    title: "This cannot be undone",
    body: "Once you confirm filing, we record that your application has been submitted to the court. Only confirm after you have physically delivered or mailed your package.",
    severity: "danger" as const,
  },
  PROBATE_FILING_CHECKLIST: {
    title: "Before filing",
    body: "Make sure all forms are signed and notarized, you have the original will, and all required fees are included.",
    severity: "warning" as const,
  },

  // ============================================
  // PORTAL - Grant Received Milestone
  // ============================================
  GRANT_RECEIVED_CONFIRM: {
    title: "Confirm grant received",
    body: "Only confirm after you have the physical Grant of Probate or Administration document from the court.",
    severity: "info" as const,
  },

  // ============================================
  // ONBOARDING - Contact Information
  // ============================================
  SINGLE_WORD_NAME: {
    title: "Is this your complete name?",
    body: "Court forms require full legal names (e.g., 'John William Smith' not just 'John').",
    severity: "info" as const,
  },
  EMAIL_IMPORTANT: {
    title: "Important documents",
    body: "We'll send legal documents and updates to this email. Make sure you can access it and check it regularly.",
    severity: "warning" as const,
  },
  EMAIL_MISMATCH: {
    title: "Emails don't match",
    body: "Please make sure both email fields match exactly.",
    severity: "danger" as const,
  },
  PHONE_CALL_COMING: {
    title: "We'll call you shortly",
    body: "Keep your phone nearby and be ready to answer a call from an unknown number. The call will help us understand your situation.",
    severity: "info" as const,
  },

  // ============================================
  // GENERAL
  // ============================================
  CONFIRM_BEFORE_CONTINUE: {
    title: "Please review",
    body: "Take a moment to verify this information is correct before continuing.",
    severity: "info" as const,
  },
  CANNOT_UNDO: {
    title: "Cannot undo",
    body: "This action cannot be reversed. Please make sure you want to proceed.",
    severity: "warning" as const,
  },
} as const;

export type WarningKey = keyof typeof WARNINGS;

/**
 * Get a warning definition by key
 */
export function getWarning(key: WarningKey): WarningDefinition {
  return WARNINGS[key];
}
