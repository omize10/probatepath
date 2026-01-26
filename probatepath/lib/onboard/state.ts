/**
 * Onboarding state management
 * Stores progress in localStorage with URL param backup
 */

export interface ScreeningAnswers {
  hasWill?: boolean;
  hasOriginal?: boolean;
  expectsDispute?: boolean;
  foreignAssets?: boolean;
  estateValue?: string;
}

export type GrantType = "probate" | "administration";
export type Tier = "essentials" | "guided" | "full_service";

export type ReferralSource = "funeral_home" | "google" | "friend" | "other" | null;

export interface OnboardState {
  name?: string;
  referralSource?: ReferralSource;
  referralFuneralHome?: string;
  email?: string;
  phone?: string;
  screening?: ScreeningAnswers;
  grantType?: GrantType;
  recommendedTier?: Tier;
  selectedTier?: Tier;
  aiCallId?: string;
  redFlags?: string[];
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
 * Calculate grant type and tier from screening answers
 */
export function calculateResult(screening: ScreeningAnswers): {
  grantType: GrantType;
  recommendedTier: Tier;
  redFlags: string[];
} {
  const redFlags: string[] = [];

  // Check for red flags (route to Open Door Law)
  if (screening.expectsDispute) {
    redFlags.push("dispute");
  }
  if (screening.foreignAssets) {
    redFlags.push("foreign_assets");
  }

  // Determine grant type
  const grantType: GrantType = screening.hasWill ? "probate" : "administration";

  // Calculate recommended tier based on value and complexity
  let recommendedTier: Tier = "essentials";

  // Estate value thresholds
  const value = screening.estateValue;
  if (value === "over_500k") {
    recommendedTier = "full_service";
  } else if (value === "150k_500k" || value === "50k_150k") {
    recommendedTier = "guided";
  }

  // Administration is more complex - bump tier
  if (grantType === "administration" && recommendedTier === "essentials") {
    recommendedTier = "guided";
  }

  // No original will - bump tier
  if (screening.hasWill && !screening.hasOriginal && recommendedTier === "essentials") {
    recommendedTier = "guided";
  }

  return { grantType, recommendedTier, redFlags };
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
  if (!state.name) return "/onboard/name";
  if (state.referralSource === undefined) return "/onboard/referral";
  if (!state.email) return "/onboard/email";
  if (!state.phone) return "/onboard/phone";
  if (!state.aiCallId) return "/onboard/call";
  if (!state.screening?.estateValue) return "/onboard/screening";
  if (!state.recommendedTier) return "/onboard/result";
  if (!state.selectedTier) return "/onboard/pricing";
  return "/pay";
}

/**
 * Get progress percentage (0-100)
 */
export function getProgress(currentStep: string): number {
  const steps = [
    "/onboard/name",
    "/onboard/referral",
    "/onboard/email",
    "/onboard/phone",
    "/onboard/call",
    "/onboard/screening",
    "/onboard/result",
    "/onboard/pricing",
    "/pay",
  ];

  const index = steps.indexOf(currentStep);
  if (index === -1) return 0;

  return Math.round(((index + 1) / steps.length) * 100);
}
