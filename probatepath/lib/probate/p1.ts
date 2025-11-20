import type { Beneficiary, Executor, Matter } from "@prisma/client";
import { splitName } from "@/lib/name";
import type { IntakeDraft } from "@/lib/intake/types";

export type PostalAddress = {
  line1?: string | null;
  line2?: string | null;
  city?: string | null;
  province?: string | null;
  postalCode?: string | null;
  country?: string | null;
};

export type P1Applicant = {
  fullName: string;
  address: PostalAddress;
  addressLines: string[];
  ordinaryResidence?: string;
  phone?: string;
  email?: string;
};

export type P1Deceased = {
  firstNames: string;
  middleNames: string;
  surname: string;
  addressLines: string[];
  dateOfDeath?: string;
  dateOfBirth?: string;
  placeOfBirth?: string;
};

export type P1ApplicationData = {
  applicants: P1Applicant[];
  signatureLines: number;
  serviceAddress?: PostalAddress;
  serviceEmail?: string;
  servicePhone?: string;
  registryLocation?: string;
  registryName?: string;
  deceased: P1Deceased;
  grantOption: string;
  relatesToPhysicalWill: boolean;
  relatesToElectronicWill: boolean;
  physicalWillDate?: string;
  electronicWillDate?: string;
};

export type MatterForP1 = Matter & {
  executors: Executor[];
  beneficiaries: Beneficiary[];
};

const FALLBACK_COUNTRY = "Canada";

function formatAddressLines(address: PostalAddress, fallbackCountry = FALLBACK_COUNTRY) {
  const lines: string[] = [];
  if (address.line1) lines.push(address.line1.trim());
  if (address.line2) lines.push(address.line2.trim());
  const cityLine = [address.city, address.province, address.postalCode].filter(Boolean).join(", ");
  if (cityLine) {
    lines.push(cityLine);
  }
  const normalizedCountry = address.country?.trim() || fallbackCountry;
  if (normalizedCountry) {
    const alreadyHasCountry = lines[lines.length - 1]?.toLowerCase().includes(normalizedCountry.toLowerCase());
    if (!alreadyHasCountry) {
      lines.push(normalizedCountry);
    }
  }
  return lines.filter(Boolean);
}

export function buildP1ApplicationData({
  matter,
  intakeDraft,
}: {
  matter: MatterForP1;
  intakeDraft?: IntakeDraft;
}): P1ApplicationData {
  const sortedExecutors = [...matter.executors].sort((a, b) => a.orderIndex - b.orderIndex);
  const applicants: P1Applicant[] = sortedExecutors.map((executor) => ({
    fullName: executor.fullName,
    address: {
      line1: executor.addressLine1,
      line2: executor.addressLine2,
      city: executor.city,
      province: executor.province,
      postalCode: executor.postalCode,
      country: executor.country,
    },
    addressLines: formatAddressLines(
      {
        line1: executor.addressLine1,
        line2: executor.addressLine2,
        city: executor.city,
        province: executor.province,
        postalCode: executor.postalCode,
        country: executor.country,
      },
      executor.country ?? FALLBACK_COUNTRY,
    ),
    ordinaryResidence: executor.city ?? intakeDraft?.executor.city ?? undefined,
    phone: executor.phone ?? intakeDraft?.executor.phone ?? undefined,
    email: executor.email ?? intakeDraft?.welcome.email ?? undefined,
  }));

  if (applicants.length === 0 && intakeDraft) {
    const fallbackAddress: PostalAddress = {
      line1: intakeDraft.executor.addressLine1,
      line2: intakeDraft.executor.addressLine2,
      city: intakeDraft.executor.city,
      province: intakeDraft.executor.province,
      postalCode: intakeDraft.executor.postalCode,
      country: FALLBACK_COUNTRY,
    };
    applicants.push({
      fullName: intakeDraft.executor.fullName,
      address: fallbackAddress,
      addressLines: formatAddressLines(fallbackAddress),
      ordinaryResidence: intakeDraft.executor.city,
      phone: intakeDraft.executor.phone,
      email: intakeDraft.welcome.email,
    });
  }

  const signatureLines = Math.max(applicants.length, 1);
  const firstApplicant = applicants[0];
  const serviceAddress = firstApplicant?.address ?? null;

  const deceased = (() => {
    const nameParts = splitName(intakeDraft?.deceased.fullName ?? "");
    const nameTokens = nameParts.givenNames.split(/\s+/).filter(Boolean);
    const first = nameTokens.shift() ?? "";
    const middle = nameTokens.join(" ");
    const addressLines = [intakeDraft?.deceased.residenceAddress, intakeDraft?.deceased.cityProvince]
      .filter(Boolean)
      .map((line) => line!.trim());
    return {
      firstNames: first,
      middleNames: middle,
      surname: nameParts.surname ?? "",
      addressLines,
      dateOfDeath: intakeDraft?.deceased.dateOfDeath || undefined,
      dateOfBirth: intakeDraft?.deceased.birthDate || undefined,
      placeOfBirth: intakeDraft?.deceased.placeOfBirth || undefined,
    };
  })();

  const hasWill = (intakeDraft?.deceased.hadWill ?? "yes") === "yes";
  const grantOption = hasWill ? "grant of probate" : "grant of administration without will annexed";
  const physicalWillDate = intakeDraft?.will.physicalWillDate || undefined;
  const electronicWillDate = intakeDraft?.will.electronicWillDate || undefined;

  return {
    applicants,
    signatureLines,
    serviceAddress: serviceAddress ?? undefined,
    serviceEmail: firstApplicant?.email,
    servicePhone: firstApplicant?.phone,
    registryLocation: intakeDraft?.will.probateRegistry || undefined,
    registryName: intakeDraft?.will.probateRegistry
      ? `${intakeDraft.will.probateRegistry} Supreme Court Registry`
      : undefined,
    deceased,
    grantOption,
    relatesToPhysicalWill: hasWill,
    relatesToElectronicWill: Boolean(electronicWillDate),
    physicalWillDate,
    electronicWillDate,
  };
}
