/**
 * Map AI call collected data to IntakeDraft format for pre-filling
 */

interface CollectedData {
  // Executor/Applicant fields
  executor_name?: string;
  executor_full_name?: string;
  executor_email?: string;
  executor_phone?: string;
  executor_city?: string;
  executor_relation?: string;
  relationship_to_deceased?: string;

  // Deceased fields
  deceased_name?: string;
  deceased_full_name?: string;
  date_of_death?: string;
  deceased_date_of_death?: string;
  deceased_city?: string;
  deceased_province?: string;

  // Will fields
  has_will?: boolean;
  will_date?: string;
  will_location?: string;
  has_original_will?: boolean;
  has_codicils?: boolean;

  // Estate fields
  estate_value?: string;
  estate_value_range?: string;
  has_property?: boolean;
  has_real_property?: boolean;
  multiple_beneficiaries?: boolean;

  // Qualification flags
  has_minors?: boolean;
  has_foreign_assets?: boolean;
  has_business?: boolean;
  expects_dispute?: boolean;

  // Other
  [key: string]: unknown;
}

interface IntakeDraftPrefill {
  // Welcome step
  email?: string;
  consent?: boolean;

  // Executor step
  exFullName?: string;
  exPhone?: string;
  exCity?: string;
  exRelation?: string;

  // Deceased step
  decFullName?: string;
  decDateOfDeath?: Date;
  decCityProv?: string;
  hadWill?: boolean;

  // Will step
  willLocation?: string;
  estateValueRange?: string;
  anyRealProperty?: boolean;
  multipleBeneficiaries?: boolean;
  specialCircumstances?: string;

  // Nested payload for advanced intake
  payload?: {
    welcome?: { email?: string; consent?: boolean };
    executor?: {
      fullName?: string;
      phone?: string;
      city?: string;
      relation?: string;
    };
    deceased?: {
      fullName?: string;
      dateOfDeath?: string;
      city?: string;
      hadWill?: "yes" | "no";
    };
    will?: {
      willLocation?: string;
      willDate?: string;
      hasCodicils?: boolean;
      hasOriginal?: boolean;
      estateValueRange?: string;
      anyRealProperty?: boolean;
      multipleBeneficiaries?: boolean;
    };
    estateIntake?: {
      applicant?: {
        fullName?: string;
        email?: string;
        phone?: string;
        city?: string;
        relationship?: string;
      };
      deceased?: {
        fullName?: string;
        dateOfDeath?: string;
        cityProvince?: string;
      };
      will?: {
        hasWill?: "yes" | "no";
        location?: string;
        date?: string;
      };
      estate?: {
        valueRange?: string;
        hasRealProperty?: boolean;
      };
    };
  };
}

/**
 * Map AI call collected data to IntakeDraft format
 */
export function mapAICallToIntakeDraft(collectedData: CollectedData): IntakeDraftPrefill {
  const result: IntakeDraftPrefill = {};

  // Executor/Applicant
  const executorName = collectedData.executor_name || collectedData.executor_full_name;
  const executorEmail = collectedData.executor_email;
  const executorPhone = collectedData.executor_phone;
  const executorCity = collectedData.executor_city;
  const executorRelation = collectedData.executor_relation || collectedData.relationship_to_deceased;

  if (executorEmail) result.email = executorEmail;
  if (executorName) result.exFullName = executorName;
  if (executorPhone) result.exPhone = executorPhone;
  if (executorCity) result.exCity = executorCity;
  if (executorRelation) result.exRelation = executorRelation;

  // Deceased
  const deceasedName = collectedData.deceased_name || collectedData.deceased_full_name;
  const dateOfDeath = collectedData.date_of_death || collectedData.deceased_date_of_death;
  const deceasedCity = collectedData.deceased_city;
  const deceasedProvince = collectedData.deceased_province || "BC";

  if (deceasedName) result.decFullName = deceasedName;
  if (dateOfDeath) {
    try {
      result.decDateOfDeath = new Date(dateOfDeath);
    } catch {
      // Invalid date, skip
    }
  }
  if (deceasedCity) {
    result.decCityProv = `${deceasedCity}, ${deceasedProvince}`;
  }

  // Will
  if (typeof collectedData.has_will === "boolean") {
    result.hadWill = collectedData.has_will;
  }
  if (collectedData.will_location) {
    result.willLocation = collectedData.will_location;
  }

  // Estate
  const estateValue = collectedData.estate_value || collectedData.estate_value_range;
  if (estateValue) {
    result.estateValueRange = normalizeEstateValue(estateValue);
  }

  const hasProperty = collectedData.has_property || collectedData.has_real_property;
  if (typeof hasProperty === "boolean") {
    result.anyRealProperty = hasProperty;
  }

  if (typeof collectedData.multiple_beneficiaries === "boolean") {
    result.multipleBeneficiaries = collectedData.multiple_beneficiaries;
  }

  // Special circumstances from flags
  const specialCircumstances: string[] = [];
  if (collectedData.has_minors) specialCircumstances.push("Minor beneficiaries");
  if (collectedData.has_business) specialCircumstances.push("Business interests");
  if (collectedData.has_original_will === false) specialCircumstances.push("No original will");
  if (specialCircumstances.length > 0) {
    result.specialCircumstances = specialCircumstances.join(", ");
  }

  // Build nested payload for advanced intake
  result.payload = {
    welcome: {
      email: executorEmail,
      consent: true,
    },
    executor: {
      fullName: executorName,
      phone: executorPhone,
      city: executorCity,
      relation: executorRelation,
    },
    deceased: {
      fullName: deceasedName,
      dateOfDeath: dateOfDeath,
      city: deceasedCity,
      hadWill: collectedData.has_will ? "yes" : "no",
    },
    will: {
      willLocation: collectedData.will_location,
      willDate: collectedData.will_date,
      hasCodicils: collectedData.has_codicils,
      hasOriginal: collectedData.has_original_will,
      estateValueRange: estateValue,
      anyRealProperty: hasProperty,
      multipleBeneficiaries: collectedData.multiple_beneficiaries,
    },
    estateIntake: {
      applicant: {
        fullName: executorName,
        email: executorEmail,
        phone: executorPhone,
        city: executorCity,
        relationship: executorRelation,
      },
      deceased: {
        fullName: deceasedName,
        dateOfDeath: dateOfDeath,
        cityProvince: deceasedCity ? `${deceasedCity}, ${deceasedProvince}` : undefined,
      },
      will: {
        hasWill: collectedData.has_will ? "yes" : "no",
        location: collectedData.will_location,
        date: collectedData.will_date,
      },
      estate: {
        valueRange: estateValue,
        hasRealProperty: hasProperty,
      },
    },
  };

  return result;
}

/**
 * Normalize estate value strings to standard format
 */
function normalizeEstateValue(value: unknown): string {
  if (typeof value !== "string") return "";

  const lower = value.toLowerCase();

  // Map various formats to standard ranges
  if (lower.includes("<") || lower.includes("under") || lower.includes("less than")) {
    if (lower.includes("25")) return "<$25k";
    if (lower.includes("50")) return "<$50k";
    if (lower.includes("100")) return "<$100k";
  }

  if (lower.includes(">") || lower.includes("over") || lower.includes("more than")) {
    if (lower.includes("500")) return ">$500k";
    if (lower.includes("1m") || lower.includes("million")) return ">$1M";
  }

  if (lower.includes("-") || lower.includes("to")) {
    if (lower.includes("25") && lower.includes("100")) return "$25k-$100k";
    if (lower.includes("100") && lower.includes("500")) return "$100k-$500k";
    if (lower.includes("500") && lower.includes("1m")) return "$500k-$1M";
  }

  // Return as-is if no match
  return value;
}

/**
 * Check if matter has AI call data available for prefill
 */
export async function getAICallPrefillData(matterId: string) {
  const { prisma } = await import("@/lib/prisma");

  const matter = await prisma.matter.findUnique({
    where: { id: matterId },
    select: {
      aiCallId: true,
      aiCall: {
        select: {
          collectedData: true,
          grantType: true,
          recommendedTier: true,
        },
      },
    },
  });

  if (!matter?.aiCall?.collectedData) {
    return null;
  }

  return {
    prefill: mapAICallToIntakeDraft(matter.aiCall.collectedData as CollectedData),
    grantType: matter.aiCall.grantType,
    recommendedTier: matter.aiCall.recommendedTier,
  };
}
