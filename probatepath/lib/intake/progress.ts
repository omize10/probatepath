import type { IntakeDraft as IntakeDraftModel } from "@prisma/client";
import type { IntakeDraft as ClientIntakeDraft } from "@/lib/intake/types";

const TOTAL_STEPS = 5;

type IntakeProgressSource = IntakeDraftModel | ClientIntakeDraft;

function isClientDraft(draft: IntakeProgressSource | null | undefined): draft is ClientIntakeDraft {
  if (!draft || typeof draft !== "object") {
    return false;
  }
  return "welcome" in draft;
}

function isWelcomeComplete(draft?: IntakeProgressSource | null) {
  if (!draft) return false;
  if (isClientDraft(draft)) {
    return Boolean(draft.welcome.email && draft.welcome.consent);
  }
  return Boolean(draft.email && draft.consent);
}

function isExecutorComplete(draft?: IntakeProgressSource | null) {
  if (!draft) return false;
  if (isClientDraft(draft)) {
    return Boolean(draft.executor.fullName && draft.executor.city && draft.executor.relationToDeceased);
  }
  return Boolean(draft.exFullName && draft.exCity && draft.exRelation);
}

function isDeceasedComplete(draft?: IntakeProgressSource | null) {
  if (!draft) return false;
  if (isClientDraft(draft)) {
    return Boolean(draft.deceased.fullName && draft.deceased.dateOfDeath && draft.deceased.cityProvince);
  }
  return Boolean(draft.decFullName && draft.decDateOfDeath && draft.decCityProv);
}

function normalizeBoolean(value: unknown): boolean | null {
  if (typeof value === "boolean") {
    return value;
  }
  if (typeof value === "string") {
    const lower = value.toLowerCase();
    if (lower === "yes") return true;
    if (lower === "no") return false;
  }
  return null;
}

function isWillComplete(draft?: IntakeProgressSource | null) {
  if (!draft) return false;
  if (isClientDraft(draft)) {
    const hasLocation = Boolean(draft.will.willLocation);
    const hasRange = Boolean(draft.will.estateValueRange);
    const realProperty = normalizeBoolean(draft.will.anyRealProperty);
    const multipleBeneficiaries = normalizeBoolean(draft.will.multipleBeneficiaries);
    return hasLocation && hasRange && realProperty !== null && multipleBeneficiaries !== null;
  }
  const basicsPresent =
    Boolean(draft.willLocation && draft.estateValueRange && draft.willLocation.length > 0) &&
    normalizeBoolean(draft.anyRealProperty) !== null &&
    normalizeBoolean(draft.multipleBeneficiaries) !== null;
  return basicsPresent;
}

function isReviewComplete(draft?: IntakeProgressSource | null) {
  if (!draft) return false;
  if (isClientDraft(draft)) {
    return Boolean(draft.confirmation.confirmed);
  }
  return Boolean(draft.submittedAt);
}

export function calculateIntakeProgress(draft?: IntakeProgressSource | null) {
  if (!draft) return 0;
  const checks = [
    isWelcomeComplete(draft),
    isExecutorComplete(draft),
    isDeceasedComplete(draft),
    isWillComplete(draft),
    isReviewComplete(draft),
  ];
  const completed = checks.filter(Boolean).length;
  return Math.round((completed / TOTAL_STEPS) * 100);
}
