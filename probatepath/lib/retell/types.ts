/**
 * Types for Retell AI integration
 */

/**
 * Retell webhook payload structure (per docs.retellai.com/features/webhook-overview)
 * Top-level: { event: string, call: { ...call fields } }
 */
export interface RetellWebhookPayload {
  event: "call_started" | "call_ended" | "call_analyzed" | string;
  call: RetellCallObject;
}

export interface RetellCallObject {
  call_id: string;
  call_type?: string;
  from_number?: string;
  to_number?: string;
  direction?: string;
  agent_id?: string;
  call_status?: string;
  metadata?: Record<string, unknown>;
  retell_llm_dynamic_variables?: Record<string, unknown>;
  start_timestamp?: number;
  end_timestamp?: number;
  disconnection_reason?: string;
  transcript?: string;
  transcript_object?: unknown[];
  transcript_with_tool_calls?: unknown[];
  opt_out_sensitive_data_storage?: boolean;
  call_analysis?: Record<string, unknown>;
}

export interface RetellFunctionResponse {
  success: boolean;
  data?: Record<string, unknown>;
  error?: string;
}

export interface CollectedField {
  field: string;
  value: unknown;
  confidence?: number;
}

export interface QualificationFlags {
  expectedDispute?: boolean;
  minorBeneficiaries?: boolean;
  foreignAssets?: boolean;
  businessOwnership?: boolean;
  noOriginalWill?: boolean;
}

export interface QualificationResult {
  result: "fit" | "not_fit" | "needs_review";
  reasons: string[];
  recommendedAction: string;
}

// Legacy tier names (for backwards compatibility)
export type LegacyTier = "basic" | "standard" | "premium";

// New tier names
export type NewTier = "essentials" | "guided" | "full_service";

// Combined tier type
export type Tier = LegacyTier | NewTier;

export interface TierRecommendation {
  tier: Tier;
  price: number;
  reasoning: string[];
}

export const TIER_PRICES: Record<Tier, number> = {
  // Legacy names
  basic: 799,
  standard: 1499,
  premium: 2499,
  // New names
  essentials: 799,
  guided: 1499,
  full_service: 2499,
};

export const AI_CALL_STATUS = {
  INITIATED: "initiated",
  RINGING: "ringing",
  CONNECTED: "connected",
  IN_PROGRESS: "in_progress",
  COMPLETED: "completed",
  FAILED: "failed",
  NO_ANSWER: "no_answer",
  VOICEMAIL: "voicemail",
  ABANDONED: "abandoned",
} as const;

// End reasons from Retell that indicate user didn't answer
export const NO_ANSWER_REASONS = [
  "no_answer",
  "machine_detected",
  "voicemail_detected",
  "voicemail",
  "busy",
  "timeout",
] as const;

// Field mapping from Retell collected fields to IntakeDraft/Matter fields
export const FIELD_MAPPING: Record<string, { table: "intake" | "matter"; field: string }> = {
  deceased_name: { table: "intake", field: "decFullName" },
  deceased_full_name: { table: "intake", field: "decFullName" },
  date_of_death: { table: "intake", field: "decDateOfDeath" },
  deceased_date_of_death: { table: "intake", field: "decDateOfDeath" },
  deceased_city: { table: "intake", field: "decCityProv" },
  has_will: { table: "matter", field: "pathType" },
  estate_value: { table: "intake", field: "estateValueRange" },
  estate_value_range: { table: "intake", field: "estateValueRange" },
  has_property: { table: "intake", field: "anyRealProperty" },
  has_real_property: { table: "intake", field: "anyRealProperty" },
  executor_name: { table: "intake", field: "exFullName" },
  executor_full_name: { table: "intake", field: "exFullName" },
  executor_phone: { table: "intake", field: "exPhone" },
  executor_city: { table: "intake", field: "exCity" },
  executor_email: { table: "intake", field: "email" },
  executor_relation: { table: "intake", field: "exRelation" },
  relationship_to_deceased: { table: "intake", field: "exRelation" },
  multiple_beneficiaries: { table: "intake", field: "multipleBeneficiaries" },
  will_location: { table: "intake", field: "willLocation" },
};
