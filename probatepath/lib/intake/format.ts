import type { IntakeDraft as IntakeDraftModel } from "@prisma/client";
import { defaultIntakeDraft, type EstateValueRange, type IntakeDraft, type RelationToDeceased } from "@/lib/intake/types";

function cloneDraft(): IntakeDraft {
  return JSON.parse(JSON.stringify(defaultIntakeDraft)) as IntakeDraft;
}

function mergePayload(base: IntakeDraft, payload?: Partial<IntakeDraft> | null) {
  if (!payload) return base;
  base.welcome = { ...base.welcome, ...payload.welcome };
  base.executor = { ...base.executor, ...payload.executor };
  base.deceased = { ...base.deceased, ...payload.deceased };
  base.will = { ...base.will, ...payload.will };
  base.confirmation = { ...base.confirmation, ...payload.confirmation };
  if (payload.estateIntake) {
    base.estateIntake = {
      ...base.estateIntake,
      ...payload.estateIntake,
      applicant: { ...base.estateIntake.applicant, ...payload.estateIntake.applicant },
      deceased: { ...base.estateIntake.deceased, ...payload.estateIntake.deceased },
      will: { ...base.estateIntake.will, ...payload.estateIntake.will },
      family: { ...base.estateIntake.family, ...payload.estateIntake.family },
      beneficiaries: { ...base.estateIntake.beneficiaries, ...payload.estateIntake.beneficiaries },
      assets: { ...base.estateIntake.assets, ...payload.estateIntake.assets },
      debts: { ...base.estateIntake.debts, ...payload.estateIntake.debts },
      specialIssues: { ...base.estateIntake.specialIssues, ...payload.estateIntake.specialIssues },
      filing: { ...base.estateIntake.filing, ...payload.estateIntake.filing },
    };
  }
  return base;
}

function formatDate(value?: Date | null): string {
  if (!value) return "";
  return value.toISOString().slice(0, 10);
}

function toYesNo(value: boolean | null | undefined, fallback: "yes" | "no"): "yes" | "no" {
  if (value === undefined || value === null) {
    return fallback;
  }
  return value ? "yes" : "no";
}

export function formatIntakeDraftRecord(record: IntakeDraftModel): IntakeDraft {
  const payload = (record.payload as Partial<IntakeDraft> | null) ?? null;
  const merged = mergePayload(cloneDraft(), payload);

  merged.welcome.email = record.email ?? merged.welcome.email;
  merged.welcome.consent = record.consent ?? merged.welcome.consent;

  merged.executor.fullName = record.exFullName ?? merged.executor.fullName;
  merged.executor.phone = record.exPhone ?? merged.executor.phone;
  merged.executor.city = record.exCity ?? merged.executor.city;
  merged.executor.addressLine1 = merged.executor.addressLine1 || "";
  merged.executor.relationToDeceased =
    (record.exRelation as RelationToDeceased | null) ?? merged.executor.relationToDeceased;

  merged.deceased.fullName = record.decFullName ?? merged.deceased.fullName;
  merged.deceased.dateOfDeath = record.decDateOfDeath ? formatDate(record.decDateOfDeath) : merged.deceased.dateOfDeath;
  merged.deceased.cityProvince = record.decCityProv ?? merged.deceased.cityProvince;
  merged.deceased.hadWill = toYesNo(record.hadWill, merged.deceased.hadWill);
  if (merged.deceased.fullName && !merged.deceased.firstName) {
    const tokens = merged.deceased.fullName.split(" ").filter(Boolean);
    if (tokens.length) {
      merged.deceased.firstName = tokens[0];
      merged.deceased.lastName = tokens.length > 1 ? tokens[tokens.length - 1] : "";
      const middle = tokens.slice(1, -1);
      merged.deceased.middleName1 = middle[0] ?? "";
      merged.deceased.middleName2 = middle[1] ?? "";
      merged.deceased.middleName3 = middle[2] ?? "";
    }
  }

  merged.will.willLocation = record.willLocation ?? merged.will.willLocation;
  if (record.estateValueRange) {
    merged.will.estateValueRange = record.estateValueRange as EstateValueRange;
  }
  merged.will.anyRealProperty = toYesNo(record.anyRealProperty, merged.will.anyRealProperty);
  merged.will.multipleBeneficiaries = toYesNo(record.multipleBeneficiaries, merged.will.multipleBeneficiaries);
  merged.will.specialCircumstances = record.specialCircumstances ?? merged.will.specialCircumstances;

  return merged;
}
