/**
 * Onboarding state management
 * Stores progress in localStorage with URL param backup
 */

// Relationship to deceased options
export type RelationshipType =
  | 'parent'
  | 'spouse'
  | 'child'
  | 'sibling'
  | 'grandparent'
  | 'aunt'
  | 'uncle'
  | 'friend'
  | 'other';

// Communication preference
export type CommunicationPreference = 'text' | 'email' | 'either';

// Fit question answers
export interface FitAnswers {
  hasWill?: 'yes' | 'no' | 'not_sure';
  willProperlyWitnessed?: 'yes' | 'no' | 'not_sure';
  willPreparedInBC?: 'yes' | 'no' | 'not_sure';
  hasOriginalWill?: boolean;
  beneficiariesAware?: 'yes' | 'no' | 'partial';
  potentialDisputes?: 'yes' | 'no' | 'not_sure';
  assetsOutsideBC?: 'none' | 'other_provinces' | 'international';
}

export type GrantType = "probate" | "administration";
export type Tier = "essentials" | "guided" | "full_service";

// Referral source (moved to payment, but keep for backwards compatibility)
export type ReferralSource = "funeral_home" | "google" | "friend" | "other" | null;

export interface OnboardState {
  // Step 1: Executor check
  isExecutor?: boolean;

  // Step 2: Relationship to deceased
  relationshipToDeceased?: RelationshipType;

  // Step 3: Email
  email?: string;

  // Step 4: Phone + communication preference
  phone?: string;
  communicationPreference?: CommunicationPreference;

  // Step 5: Call scheduling
  scheduledCall?: boolean;
  callDatetime?: string;

  // Fit questions (replaces old screening)
  fitAnswers?: FitAnswers;

  // Calculated results
  grantType?: GrantType;
  recommendedTier?: Tier;
  selectedTier?: Tier;
  redFlags?: string[];
  redirectedToSpecialist?: boolean;
  fitCheckPassed?: boolean;

  // Legacy fields (for backwards compatibility during transition)
  name?: string;
  referralSource?: ReferralSource;
  referralFuneralHome?: string;
  aiCallId?: string;

  // Tracking
  createdAt?: string;
  updatedAt?: string;
}

const STORAGE_KEY = "probatedesk_onboard";

/**
 * Get current onboarding state from localStorage
 */
export function getOnboardState(): OnboardState {
  if (typeof window === "undefined") return {};

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error("[onboard] Failed to read state:", e);
  }

  return {};
}

/**
 * Save onboarding state to localStorage
 */
export function saveOnboardState(data: Partial<OnboardState>): OnboardState {
  if (typeof window === "undefined") return data as OnboardState;

  try {
    const current = getOnboardState();
    const updated: OnboardState = {
      ...current,
      ...data,
      updatedAt: new Date().toISOString(),
    };

    if (!updated.createdAt) {
      updated.createdAt = updated.updatedAt;
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error("[onboard] Failed to save state:", e);
    return data as OnboardState;
  }
}

/**
 * Clear onboarding state
 */
export function clearOnboardState(): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.error("[onboard] Failed to clear state:", e);
  }
}

/**
 * Check if user should be redirected to specialist
 */
export function shouldRedirectToSpecialist(fitAnswers: FitAnswers): boolean {
  // Disputes = YES is a red flag
  if (fitAnswers.potentialDisputes === 'yes') {
    return true;
  }
  // International assets is a red flag
  if (fitAnswers.assetsOutsideBC === 'international') {
    return true;
  }
  return false;
}

/**
 * Calculate grant type and tier from fit answers
 */
export function calculateResult(fitAnswers: FitAnswers): {
  grantType: GrantType;
  recommendedTier: Tier;
  redFlags: string[];
  fitCheckPassed: boolean;
} {
  const redFlags: string[] = [];

  // Check for red flags (route to specialist)
  if (fitAnswers.potentialDisputes === 'yes') {
    redFlags.push("dispute");
  }
  if (fitAnswers.assetsOutsideBC === 'international') {
    redFlags.push("international_assets");
  }

  // If there are red flags, they shouldn't proceed
  const fitCheckPassed = redFlags.length === 0;

  // Determine grant type based on will
  const hasWill = fitAnswers.hasWill === 'yes';
  const grantType: GrantType = hasWill ? "probate" : "administration";

  // Calculate recommended tier based on complexity
  let recommendedTier: Tier = "essentials";

  // Administration (no will) is more complex - recommend guided
  if (grantType === "administration") {
    recommendedTier = "guided";
  }

  // No original will - recommend guided for the extra support
  if (hasWill && !fitAnswers.hasOriginalWill) {
    recommendedTier = "guided";
  }

  // Will issues (not properly witnessed or not BC) - recommend guided
  if (hasWill) {
    if (fitAnswers.willProperlyWitnessed === 'no' || fitAnswers.willProperlyWitnessed === 'not_sure') {
      recommendedTier = "guided";
    }
    if (fitAnswers.willPreparedInBC === 'no') {
      recommendedTier = "guided";
    }
  }

  // Assets in other provinces adds complexity
  if (fitAnswers.assetsOutsideBC === 'other_provinces') {
    recommendedTier = "guided";
  }

  return { grantType, recommendedTier, redFlags, fitCheckPassed };
}

/**
 * Tier details for display
 */
export const TIER_INFO = {
  essentials: {
    name: "Essentials",
    price: 799,
    tagline: "You file, we guide",
    features: [
      "All court forms prepared",
      "Step-by-step instructions",
      "You review and file yourself",
      "Email support for questions",
    ],
    bestFor: "Confident people who want to save money",
  },
  guided: {
    name: "Guided",
    price: 1499,
    tagline: "We check, you file",
    features: [
      "All court forms prepared",
      "Step-by-step filing instructions",
      "We review everything before you file",
      "Catch mistakes before the court does",
      "Email support throughout",
    ],
    bestFor: "Most people - peace of mind without the cost",
  },
  full_service: {
    name: "Full Service",
    price: 2499,
    tagline: "We handle everything",
    features: [
      "One 30-min call with our lawyer",
      "We collect all information",
      "We prepare all court forms",
      "We handle all filing",
      "We deal with court if issues arise",
      "We guide you through distribution",
    ],
    bestFor: "People who don't want to think about it",
  },
} as const;

/**
 * Get the next step in onboarding based on current state
 */
export function getNextStep(state: OnboardState): string {
  // Step 1: Executor check
  if (state.isExecutor === undefined) return "/onboard/executor";
  if (state.isExecutor === false) return "/onboard/non-executor";

  // Step 2: Relationship
  if (!state.relationshipToDeceased) return "/onboard/relationship";

  // Step 3: Email
  if (!state.email) return "/onboard/email";

  // Step 4: Phone
  if (!state.phone) return "/onboard/phone";

  // Step 5: Call choice (calls happen instantly via Retell API, no scheduling)
  if (state.scheduledCall === undefined) return "/onboard/call-choice";

  // Fit questions
  if (!state.fitAnswers || !isFitComplete(state.fitAnswers)) return "/onboard/screening";

  // Check if redirected to specialist
  if (state.redirectedToSpecialist) return "/onboard/specialist";

  // Results
  if (!state.recommendedTier) return "/onboard/result";
  if (!state.selectedTier) return "/onboard/pricing";

  return "/pay";
}

/**
 * Check if fit questions are complete
 */
function isFitComplete(fitAnswers: FitAnswers): boolean {
  // Required questions for all
  if (fitAnswers.hasWill === undefined) return false;
  if (fitAnswers.hasOriginalWill === undefined) return false;
  if (fitAnswers.beneficiariesAware === undefined) return false;
  if (fitAnswers.potentialDisputes === undefined) return false;
  if (fitAnswers.assetsOutsideBC === undefined) return false;

  // Conditional questions (only if hasWill = yes)
  if (fitAnswers.hasWill === 'yes') {
    if (fitAnswers.willProperlyWitnessed === undefined) return false;
    if (fitAnswers.willPreparedInBC === undefined) return false;
  }

  return true;
}

/**
 * Get progress percentage (0-100)
 */
export function getProgress(currentStep: string): number {
  const steps = [
    "/onboard/executor",
    "/onboard/relationship",
    "/onboard/email",
    "/onboard/phone",
    "/onboard/call-choice",
    "/onboard/screening",
    "/onboard/result",
    "/onboard/pricing",
    "/pay",
  ];

  const index = steps.indexOf(currentStep);
  if (index === -1) return 0;

  return Math.round(((index + 1) / steps.length) * 100);
}

/**
 * Relationship labels for display
 */
export const RELATIONSHIP_LABELS: Record<RelationshipType, string> = {
  parent: "Parent",
  spouse: "Spouse",
  child: "Child",
  sibling: "Sibling",
  grandparent: "Grandparent",
  aunt: "Aunt",
  uncle: "Uncle",
  friend: "Friend",
  other: "Other",
};
