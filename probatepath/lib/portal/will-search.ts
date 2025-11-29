import type { Executor, IntakeDraft as DraftRecord, WillSearchRequest } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { IntakeDraft } from "@/lib/intake/types";
import { splitName } from "@/lib/name";

function parseDate(value?: string | null) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatStructuredName(
  name?: IntakeDraft["estateIntake"]["applicant"]["name"],
  fallback = "",
) {
  if (!name) return fallback;
  const parts = [name.first, name.middle1, name.middle2, name.middle3, name.last, name.suffix]
    .map((part) => (part ?? "").trim())
    .filter((part) => part.length > 0);
  return parts.join(" ").trim() || fallback;
}

function extractApplicant(intake?: IntakeDraft | null) {
  const applicant = intake?.estateIntake?.applicant;
  if (!applicant) return null;
  return {
    name: formatStructuredName(applicant.name),
    email: applicant.contact?.email?.trim() || null,
    phone: applicant.contact?.phone?.trim() || null,
    addressLine1: applicant.address?.line1?.trim() || null,
    addressLine2: applicant.address?.line2?.trim() || null,
    city: applicant.address?.city?.trim() || null,
    region: applicant.address?.region?.trim() || null,
    postalCode: applicant.address?.postalCode?.trim() || null,
    relationship: applicant.relationship?.trim() || null,
  };
}

function extractDeceased(intake?: IntakeDraft | null) {
  const deceased = intake?.estateIntake?.deceased;
  if (!deceased) return null;
  return {
    name: formatStructuredName(deceased.name),
    dateOfDeath: deceased.dateOfDeath?.trim() || null,
    dateOfBirth: deceased.dateOfBirth?.trim() || null,
    city: deceased.placeOfDeath?.city?.trim() || deceased.address?.city?.trim() || null,
    province: deceased.placeOfDeath?.province?.trim() || deceased.address?.region?.trim() || null,
  };
}

type SeedArgs = {
  matterId: string;
  intake?: IntakeDraft | null;
  draft?: DraftRecord | null;
  executors?: Executor[] | null;
  existing?: WillSearchRequest | null;
};

function formatAddressLine({
  line1,
  line2,
  city,
  region,
  postalCode,
}: {
  line1?: string | null;
  line2?: string | null;
  city?: string | null;
  region?: string | null;
  postalCode?: string | null;
}) {
  const parts = [line1, line2, city, region, postalCode].map((part) => (part ?? "").trim()).filter(Boolean);
  return parts.join(", ");
}

function formatRelationshipLabel(value?: string | null) {
  if (!value) return null;
  const normalized = value.replace(/_/g, " ").trim();
  if (!normalized) return null;
  return normalized[0].toUpperCase() + normalized.slice(1);
}

function normalize(value?: string | null) {
  if (!value) return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export async function seedWillSearchFromIntake({
  matterId,
  intake,
  draft,
  executors,
  existing,
}: SeedArgs): Promise<WillSearchRequest | null> {
  const applicant = extractApplicant(intake);
  const deceasedFromEstate = extractDeceased(intake);
  const primaryExecutor =
    executors?.find((executor) => executor.isPrimary) ?? (executors && executors[0]) ?? null;
  const executorName =
    (applicant?.name ?? primaryExecutor?.fullName ?? intake?.executor.fullName ?? draft?.exFullName ?? existing?.executorFullName ?? "")
      .trim() || "Executor";
  const executorEmail =
    (
      applicant?.email ??
      primaryExecutor?.email ??
      intake?.executor.email ??
      intake?.welcome.email ??
      draft?.email ??
      existing?.executorEmail ??
      ""
    )
      .trim()
      .toLowerCase() || `${matterId}@placeholder.local`;
  const deceasedName =
    (deceasedFromEstate?.name ?? intake?.deceased.fullName ?? draft?.decFullName ?? existing?.deceasedFullName ?? "")
      .trim() || "Deceased";

  const executorCity =
    normalize(applicant?.city) ??
    normalize(primaryExecutor?.city) ??
    normalize(intake?.executor.city) ??
    normalize(draft?.exCity) ??
    normalize(existing?.executorCity) ??
    null;
  const executorPhone =
    normalize(applicant?.phone) ??
    normalize(primaryExecutor?.phone) ??
    normalize(intake?.executor.phone) ??
    normalize(draft?.exPhone) ??
    normalize(existing?.executorPhone) ??
    null;
  const executorRelationship =
    formatRelationshipLabel(applicant?.relationship) ??
    normalize(intake?.executor.relationToDeceased ?? draft?.exRelation ?? existing?.executorRelationship ?? "") ??
    null;

  const deceasedCity =
    normalize(deceasedFromEstate?.city) ??
    normalize(intake?.deceased.residenceCity) ??
    normalize(intake?.deceased.cityProvince) ??
    normalize(draft?.decCityProv) ??
    normalize(existing?.deceasedCity) ??
    null;
  const deceasedProvince =
    normalize(deceasedFromEstate?.province) ??
    normalize(intake?.deceased.residenceRegion) ??
    normalize(existing?.deceasedProvince) ??
    null;
  const deceasedPlaceOfBirth =
    normalize(intake?.deceased.placeOfBirth) ?? normalize(existing?.deceasedPlaceOfBirth) ?? null;
  const courierAddress =
    normalize(
      formatAddressLine({
        line1: applicant?.addressLine1 ?? primaryExecutor?.addressLine1 ?? intake?.executor.addressLine1,
        line2: applicant?.addressLine2 ?? primaryExecutor?.addressLine2 ?? intake?.executor.addressLine2,
        city: applicant?.city ?? primaryExecutor?.city ?? intake?.executor.city,
        region: applicant?.region ?? primaryExecutor?.province ?? intake?.executor.province,
        postalCode: applicant?.postalCode ?? primaryExecutor?.postalCode ?? intake?.executor.postalCode,
      }),
    ) ??
    normalize(existing?.courierAddress) ??
    null;
  const deceasedAliases: string[] = [];
  const deceasedParts = splitName(deceasedName);
  const hasWill =
    intake?.deceased.hadWill === "yes"
      ? true
      : intake?.deceased.hadWill === "no"
        ? false
        : draft?.hadWill ?? null;

  const baseData = {
    executorEmail,
    executorFullName: executorName,
    executorPhone,
    executorCity,
    executorRelationship,
    courierAddress,
    deceasedFullName: deceasedName,
    deceasedGivenNames: deceasedParts.givenNames ?? null,
    deceasedSurname: deceasedParts.surname ?? null,
    deceasedDateOfDeath:
      parseDate(deceasedFromEstate?.dateOfDeath) ?? parseDate(intake?.deceased.dateOfDeath) ?? draft?.decDateOfDeath ?? null,
    deceasedCity,
    deceasedProvince,
    deceasedDateOfBirth: parseDate(deceasedFromEstate?.dateOfBirth) ?? parseDate(intake?.deceased.birthDate) ?? null,
    deceasedPlaceOfBirth,
    deceasedMarriedSurname: existing?.deceasedMarriedSurname ?? null,
    deceasedAliases,
    hasWill,
  };

  try {
    if (existing) {
      return await prisma.willSearchRequest.update({
        where: { id: existing.id },
        data: baseData,
      });
    }
    return await prisma.willSearchRequest.create({
      data: {
        matterId,
        ...baseData,
      },
    });
  } catch (error) {
    console.warn("[portal] Failed to seed will search data from intake", error);
    return existing ?? null;
  }
}
