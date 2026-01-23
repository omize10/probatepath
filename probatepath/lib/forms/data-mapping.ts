import type {
  Matter,
  IntakeDraft,
  Executor,
  Beneficiary,
  SupplementalSchedule,
} from "@prisma/client";
import type { EstateData } from "./types";

export type MatterWithRelations = Matter & {
  draft: IntakeDraft | null;
  executors: Executor[];
  beneficiaries: Beneficiary[];
  schedules: SupplementalSchedule[];
};

/**
 * Maps Prisma Matter data + formData JSON into the EstateData interface
 * used by all form generators.
 *
 * Priority: formData JSON fields override derived values from Prisma relations.
 * This allows ops team to populate formData with precise form-generation data
 * while falling back to whatever can be derived from existing intake data.
 */
export function mapToEstateData(matter: MatterWithRelations): EstateData {
  const formData = (matter.formData as Partial<EstateData>) || {};
  const draft = matter.draft;
  const payload = (draft?.payload as Record<string, any>) || {};

  // Parse deceased name from IntakeDraft
  const deceasedNameParts = splitName(draft?.decFullName || "");

  // Parse executor name
  const primaryExecutor =
    matter.executors.find((e) => e.isPrimary) || matter.executors[0];

  // Build applicants from executors
  const applicants: EstateData["applicants"] =
    formData.applicants ||
    matter.executors
      .filter((e) => !e.isRenouncing && !e.isDeceased)
      .map((e) => ({
        firstName: e.givenNames || splitName(e.fullName).first,
        middleName: splitName(e.fullName).middle || undefined,
        lastName: e.surname || splitName(e.fullName).last,
        address: {
          streetName: [e.addressLine1, e.addressLine2].filter(Boolean).join(", "),
          city: e.city || "",
          province: e.province || "British Columbia",
          country: e.country || "Canada",
          postalCode: e.postalCode || "",
        },
        isIndividual: true,
        namedInWill: e.isPrimary || e.isAlternate,
        relationship: undefined,
      }));

  // Build other executors (renounced/deceased)
  const otherExecutors: EstateData["otherExecutors"] =
    formData.otherExecutors ||
    matter.executors
      .filter((e) => e.isRenouncing || e.isDeceased)
      .map((e) => ({
        name: e.fullName,
        reason: e.isDeceased ? "deceased" as const : "renounced" as const,
      }));

  // Build children from beneficiaries
  const childBeneficiaries = matter.beneficiaries.filter(
    (b) => b.type === "CHILD" || b.type === "STEPCHILD"
  );
  const children: EstateData["children"] =
    formData.children ||
    childBeneficiaries.map((b) => ({
      name: b.fullName,
      status: b.status === "ALIVE" ? "surviving" as const : "deceased" as const,
    }));

  // Build spouse
  const spouseBeneficiary = matter.beneficiaries.find((b) => b.type === "SPOUSE");
  const spouse: EstateData["spouse"] = formData.spouse || {
    status: spouseBeneficiary
      ? spouseBeneficiary.status === "ALIVE"
        ? "surviving"
        : "deceased"
      : "never_married",
    name: spouseBeneficiary?.fullName,
    survivingName:
      spouseBeneficiary?.status === "ALIVE" ? spouseBeneficiary.fullName : undefined,
  };

  // Build beneficiaries (non-spouse, non-children)
  const otherBeneficiaries = matter.beneficiaries.filter(
    (b) => b.type !== "SPOUSE" && b.type !== "CHILD" && b.type !== "STEPCHILD"
  );
  const beneficiaries: EstateData["beneficiaries"] =
    formData.beneficiaries ||
    otherBeneficiaries.map((b) => ({
      name: b.fullName,
      status: b.status === "ALIVE" ? "surviving" as const : "deceased" as const,
    }));

  // Extract assets from schedules or formData
  const assets = formData.assets || extractAssetsFromSchedules(matter.schedules, payload);

  // Build delivery data
  const deliveries = formData.deliveries || buildDeliveries(matter.beneficiaries);

  // Determine grant type from payload or default
  const grantType: EstateData["grantType"] =
    formData.grantType ||
    (draft?.hadWill ? "probate" : "admin_without_will");

  // Build address for service
  const addressForService: EstateData["addressForService"] = formData.addressForService || {
    street: primaryExecutor
      ? [primaryExecutor.addressLine1, primaryExecutor.addressLine2, primaryExecutor.city, primaryExecutor.province, primaryExecutor.postalCode]
          .filter(Boolean)
          .join(", ")
      : "",
    email: primaryExecutor?.email || draft?.email || "",
    phone: primaryExecutor?.phone || draft?.exPhone || "",
  };

  return {
    registry: formData.registry || matter.registryName || "Vancouver",
    fileNumber: formData.fileNumber || matter.caseCode || undefined,

    deceased: formData.deceased || {
      firstName: deceasedNameParts.first,
      middleName: deceasedNameParts.middle || undefined,
      lastName: deceasedNameParts.last,
      aliases: payload.deceasedAliases || [],
      dateOfDeath: formatDate(draft?.decDateOfDeath),
      lastAddress: {
        streetName: payload.deceasedAddress || draft?.decCityProv || "",
        city: payload.deceasedCity || extractCity(draft?.decCityProv),
        province: payload.deceasedProvince || "British Columbia",
        country: "Canada",
        postalCode: payload.deceasedPostalCode || "",
      },
      domiciledInBC: payload.domiciledInBC !== false,
      nisgaaCitizen: payload.nisgaaCitizen || false,
      treatyFirstNation: payload.treatyFirstNation || undefined,
    },

    grantType,

    will: formData.will || (draft?.hadWill
      ? {
          exists: true,
          date: payload.willDate || undefined,
          isElectronic: payload.willIsElectronic || false,
          originalAvailable: payload.willOriginalAvailable !== false,
          hasCodicils: payload.hasCodicils || false,
          codicilDates: payload.codicilDates || [],
          hasHandwrittenChanges: payload.hasHandwrittenChanges || false,
          hasOrdersAffecting: payload.hasOrdersAffecting || false,
          ordersAffectingWill: payload.ordersAffectingWill || [],
          refersToDocuments: payload.refersToDocuments || false,
          documentsReferred: payload.documentsReferred || [],
        }
      : undefined),

    foreignGrant: formData.foreignGrant,

    applicants,
    otherExecutors,
    executorsWithReservedRights: formData.executorsWithReservedRights || [],

    lawyer: formData.lawyer,
    addressForService,

    affidavit: formData.affidavit || {
      form: "P3",
      isJoint: applicants.length > 1,
      hasP8Affidavits: false,
    },

    affidavitsOfDelivery: formData.affidavitsOfDelivery || [
      {
        name: primaryExecutor?.fullName || draft?.exFullName || "",
        dateSworn: "",
      },
    ],
    noDeliveryRequired: formData.noDeliveryRequired || false,

    allDocumentsInEnglish: formData.allDocumentsInEnglish !== false,
    translatorAffidavit: formData.translatorAffidavit,

    additionalDocuments: formData.additionalDocuments || [],

    certifiedCopies: formData.certifiedCopies || {
      estateGrant: 2,
      authToObtainInfo: 0,
      affidavitDomiciled: 0,
      affidavitNonDomiciled: 0,
    },

    submittingAffidavitOfAssets: formData.submittingAffidavitOfAssets !== false,

    spouse,
    children,
    beneficiaries,

    intestateSuccessors: formData.intestateSuccessors || [],
    creditors: formData.creditors,
    citors: formData.citors || [],
    attorneyGeneralNotice: formData.attorneyGeneralNotice || false,

    submissionDate: formData.submissionDate || formatDate(new Date()),

    assets,
    deliveries,
    publicGuardianDelivery: formData.publicGuardianDelivery,
    electronicWillDemanded: formData.electronicWillDemanded,
    electronicWillProvidedTo: formData.electronicWillProvidedTo,
  };
}

// ===== Helper functions =====

function splitName(fullName: string): { first: string; middle: string; last: string } {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) {
    return { first: parts[0], middle: "", last: "" };
  } else if (parts.length === 2) {
    return { first: parts[0], middle: "", last: parts[1] };
  } else {
    return {
      first: parts[0],
      middle: parts.slice(1, -1).join(" "),
      last: parts[parts.length - 1],
    };
  }
}

function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "";
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];
  const day = d.getDate().toString().padStart(2, "0");
  const month = months[d.getMonth()];
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

function extractCity(cityProv?: string | null): string {
  if (!cityProv) return "";
  // Try to extract city from "City, Province" format
  const parts = cityProv.split(",");
  return parts[0]?.trim() || cityProv;
}

type AssetData = NonNullable<EstateData["assets"]>;

function extractAssetsFromSchedules(
  schedules: SupplementalSchedule[],
  payload: Record<string, any>
): EstateData["assets"] {
  const realPropertyBC: AssetData["realPropertyBC"] = [];
  const tangiblePersonalPropertyBC: AssetData["tangiblePersonalPropertyBC"] = [];
  const intangibleProperty: AssetData["intangibleProperty"] = [];

  // Extract from payload.assets if available
  if (payload.assets && Array.isArray(payload.assets)) {
    for (const asset of payload.assets) {
      const value = parseFloat(asset.value || asset.estimatedValue || "0");
      const type = (asset.type || asset.kind || "").toLowerCase();

      if (type.includes("real") || type.includes("property") || type.includes("land") || type.includes("house")) {
        realPropertyBC.push({
          description: asset.description || asset.title || "",
          owners: asset.owners,
          marketValue: value,
          securedDebt: asset.securedDebt
            ? { creditor: asset.securedDebt.creditor || "", amount: parseFloat(asset.securedDebt.amount || "0") }
            : undefined,
        });
      } else if (type.includes("tangible") || type.includes("vehicle") || type.includes("furniture")) {
        tangiblePersonalPropertyBC.push({
          description: asset.description || asset.title || "",
          value,
          securedDebt: asset.securedDebt
            ? { creditor: asset.securedDebt.creditor || "", amount: parseFloat(asset.securedDebt.amount || "0") }
            : undefined,
        });
      } else {
        intangibleProperty.push({
          description: asset.description || asset.title || "",
          value,
        });
      }
    }
  }

  return {
    realPropertyBC,
    tangiblePersonalPropertyBC,
    intangibleProperty,
  };
}

function buildDeliveries(beneficiaries: Beneficiary[]): EstateData["deliveries"] {
  return beneficiaries
    .filter((b) => b.status === "ALIVE")
    .map((b) => ({
      recipientName: b.fullName,
      deliveryMethod: "mail" as const,
      deliveryDate: "",
      acknowledgedReceipt: false,
    }));
}
