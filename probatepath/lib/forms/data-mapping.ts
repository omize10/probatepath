import type {
  Matter,
  IntakeDraft,
  Executor,
  Beneficiary,
  IntestateHeir,
  SupplementalSchedule,
} from "@prisma/client";
import type { EstateData } from "./types";

export type MatterWithRelations = Matter & {
  draft: IntakeDraft | null;
  executors: Executor[];
  beneficiaries: Beneficiary[];
  intestateHeirs?: IntestateHeir[];
  schedules: SupplementalSchedule[];
};

/**
 * Maps Prisma Matter data + payload.estateIntake JSON into the EstateData
 * interface used by all form generators.
 *
 * Priority:
 *  1. formData JSON (explicit overrides from ops)
 *  2. payload.estateIntake (detailed intake form data)
 *  3. IntakeDraft flat fields (legacy fallback)
 *  4. Executor/Beneficiary Prisma relations (if populated)
 */
export function mapToEstateData(matter: MatterWithRelations): EstateData {
  const formData = (matter.formData as Partial<EstateData>) || {};
  const draft = matter.draft;
  const payload = (draft?.payload as Record<string, any>) || {};
  const intake = payload.estateIntake || {};

  // ===== DECEASED =====
  const intakeDeceased = intake.deceased || {};
  const decName = intakeDeceased.name || {};
  const decAddress = intakeDeceased.address || {};

  const decFirstName = decName.first || splitName(draft?.decFullName || "").first || "";
  const decMiddleName = [decName.middle1, decName.middle2, decName.middle3].filter(Boolean).join(" ") || splitName(draft?.decFullName || "").middle || "";
  const decLastName = decName.last || splitName(draft?.decFullName || "").last || "";

  // ===== APPLICANT(S) =====
  const intakeApplicant = intake.applicant || {};
  const appName = intakeApplicant.name || {};
  const appAddress = intakeApplicant.address || {};
  const appContact = intakeApplicant.contact || {};

  // Named executors from will section
  const namedExecutors: any[] = intake.will?.namedExecutors || [];

  // Build applicants list: primary applicant + co-applicants
  const applicants: EstateData["applicants"] = formData.applicants || buildApplicants(intakeApplicant, namedExecutors, matter.executors);

  // ===== WILL =====
  const intakeWill = intake.will || {};
  const hasWill = intakeWill.hasWill === "yes" || draft?.hadWill === true;

  // ===== FAMILY =====
  const intakeFamily = intake.family || {};
  const intakeChildren: any[] = intakeFamily.children || [];

  // ===== ASSETS =====
  const intakeAssets = intake.assets || {};

  // ===== FILING =====
  const intakeFiling = intake.filing || {};
  const returnAddress = intakeFiling.returnAddress || {};

  // ===== BENEFICIARIES =====
  const intakeBeneficiaries = intake.beneficiaries || {};
  const intakePeople: any[] = intakeBeneficiaries.people || [];

  // Build spouse
  const spouse: EstateData["spouse"] = formData.spouse || buildSpouse(intakeFamily, matter.beneficiaries);

  // Build children
  const children: EstateData["children"] = formData.children || buildChildren(intakeChildren, matter.beneficiaries);

  // Build beneficiaries (named in will)
  const beneficiaries: EstateData["beneficiaries"] = formData.beneficiaries || buildBeneficiaries(intakePeople, matter.beneficiaries);

  // Build assets
  const assets = formData.assets || buildAssets(intakeAssets, matter.schedules, payload);

  // Determine grant type
  const grantType: EstateData["grantType"] =
    formData.grantType || (hasWill ? "probate" : "admin_without_will");

  // Build other executors (renounced/deceased)
  const otherExecutors: EstateData["otherExecutors"] =
    formData.otherExecutors ||
    matter.executors
      .filter((e) => e.isRenouncing || e.isDeceased)
      .map((e) => ({
        name: e.fullName,
        reason: e.isDeceased ? "deceased" as const : "renounced" as const,
      }));

  // Build address for service from filing data or applicant
  const addressForService: EstateData["addressForService"] = formData.addressForService || {
    street: [returnAddress.line1, returnAddress.line2, returnAddress.city, returnAddress.region, returnAddress.postalCode]
      .filter(Boolean)
      .join(", ") ||
      [appAddress.line1, appAddress.line2, appAddress.city, appAddress.region, appAddress.postalCode]
        .filter(Boolean)
        .join(", ") || "",
    email: appContact.email || draft?.email || "",
    phone: appContact.phone || draft?.exPhone || "",
  };

  // Build deliveries from beneficiaries + family
  const deliveries = formData.deliveries || buildDeliveries(intakeFamily, intakePeople, matter.beneficiaries);

  return {
    registry: formData.registry || intakeFiling.registryLocation || matter.registryName || "Vancouver",
    fileNumber: formData.fileNumber || matter.caseCode || undefined,

    deceased: formData.deceased || {
      firstName: decFirstName,
      middleName: decMiddleName || undefined,
      lastName: decLastName,
      aliases: intakeDeceased.aliases || [],
      dateOfDeath: formatDate(intakeDeceased.dateOfDeath || draft?.decDateOfDeath),
      lastAddress: {
        streetName: [decAddress.line1, decAddress.line2].filter(Boolean).join(", ") || draft?.decCityProv || "",
        city: decAddress.city || extractCity(draft?.decCityProv),
        province: decAddress.region || "British Columbia",
        country: (decAddress.country || "Canada").replace(/[^a-zA-Z\s]/g, ""),
        postalCode: decAddress.postalCode || "",
      },
      domiciledInBC: intakeDeceased.domiciledInBC !== false,
      nisgaaCitizen: intakeDeceased.nisgaaCitizen || false,
      treatyFirstNation: intakeDeceased.treatyFirstNation || undefined,
    },

    grantType,

    will: formData.will || (hasWill
      ? {
          exists: true,
          date: intakeWill.dateSigned || undefined,
          isElectronic: intakeWill.isElectronic || false,
          originalAvailable: intakeWill.hasOriginal !== "no",
          hasCodicils: intakeWill.hasCodicils === "yes",
          codicilDates: intakeWill.codicils || [],
          hasHandwrittenChanges: intakeWill.hasHandwrittenChanges || false,
          hasOrdersAffecting: intakeWill.hasOrdersAffecting || false,
          ordersAffectingWill: intakeWill.ordersAffectingWill || [],
          refersToDocuments: intakeWill.refersToDocuments || false,
          documentsReferred: intakeWill.documentsReferred || [],
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
        name: buildFullName(appName) || draft?.exFullName || "",
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

    intestateSuccessors: formData.intestateSuccessors || buildIntestateSuccessors(intake, matter.intestateHeirs || []),
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

// ===== Builder functions =====

function buildApplicants(
  intakeApplicant: any,
  namedExecutors: any[],
  dbExecutors: Executor[]
): EstateData["applicants"] {
  const applicants: EstateData["applicants"] = [];

  // Primary applicant from intake
  if (intakeApplicant.name && Object.keys(intakeApplicant.name).length > 0) {
    const appName = intakeApplicant.name;
    const appAddress = intakeApplicant.address || {};
    applicants.push({
      firstName: appName.first || "",
      middleName: [appName.middle1, appName.middle2, appName.middle3].filter(Boolean).join(" ") || undefined,
      lastName: appName.last || "",
      address: {
        streetName: [appAddress.line1, appAddress.line2].filter(Boolean).join(", "),
        city: appAddress.city || "",
        province: appAddress.region || "British Columbia",
        country: appAddress.country || "Canada",
        postalCode: appAddress.postalCode || "",
      },
      isIndividual: true,
      namedInWill: true,
      relationship: intakeApplicant.relationship || undefined,
    });
  }

  // Co-applicants
  const coApplicants: any[] = intakeApplicant.coApplicants || [];
  for (const co of coApplicants) {
    const coName = co.name || {};
    const coAddress = co.address || {};
    applicants.push({
      firstName: coName.first || "",
      middleName: [coName.middle1, coName.middle2, coName.middle3].filter(Boolean).join(" ") || undefined,
      lastName: coName.last || "",
      address: {
        streetName: [coAddress.line1, coAddress.line2].filter(Boolean).join(", "),
        city: coAddress.city || "",
        province: coAddress.region || "British Columbia",
        country: coAddress.country || "Canada",
        postalCode: coAddress.postalCode || "",
      },
      isIndividual: true,
      namedInWill: true,
      relationship: co.relationship || undefined,
    });
  }

  // Fallback to DB executors if no intake applicant data
  if (applicants.length === 0 && dbExecutors.length > 0) {
    for (const e of dbExecutors.filter((ex) => !ex.isRenouncing && !ex.isDeceased)) {
      applicants.push({
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
      });
    }
  }

  return applicants;
}

function buildSpouse(intakeFamily: any, dbBeneficiaries: Beneficiary[]): EstateData["spouse"] {
  if (intakeFamily.hasSpouse === "yes" && intakeFamily.spouse) {
    const sp = intakeFamily.spouse;
    const spName = sp.name || {};
    const fullName = buildFullName(spName);
    return {
      status: "surviving",
      name: fullName,
      survivingName: fullName,
    };
  }

  if (intakeFamily.hasSpouse === "no") {
    return { status: "never_married" };
  }

  // Fallback to DB beneficiaries
  const spouseBen = dbBeneficiaries.find((b) => b.type === "SPOUSE");
  if (spouseBen) {
    return {
      status: spouseBen.status === "ALIVE" ? "surviving" : "deceased",
      name: spouseBen.fullName,
      survivingName: spouseBen.status === "ALIVE" ? spouseBen.fullName : undefined,
    };
  }

  return { status: "never_married" };
}

function buildChildren(intakeChildren: any[], dbBeneficiaries: Beneficiary[]): EstateData["children"] {
  if (intakeChildren.length > 0) {
    return intakeChildren.map((c: any) => ({
      name: buildFullName(c.name || {}),
      status: "surviving" as const,
    }));
  }

  // Fallback to DB
  const childBens = dbBeneficiaries.filter((b) => b.type === "CHILD" || b.type === "STEPCHILD");
  return childBens.map((b) => ({
    name: b.fullName,
    status: b.status === "ALIVE" ? "surviving" as const : "deceased" as const,
  }));
}

function buildBeneficiaries(intakePeople: any[], dbBeneficiaries: Beneficiary[]): EstateData["beneficiaries"] {
  const otherDbBens = dbBeneficiaries.filter(
    (b) => b.type !== "SPOUSE" && b.type !== "CHILD" && b.type !== "STEPCHILD"
  );

  if (intakePeople.length > 0) {
    return intakePeople.map((p: any) => {
      const name = buildFullName(p.name || {});
      // Cross-reference DB to get relationshipLabel
      const dbMatch = otherDbBens.find(
        (b) => b.fullName.toLowerCase() === name.toLowerCase()
      );
      return {
        name,
        relationship: p.relationship || dbMatch?.relationshipLabel || undefined,
        status: "surviving" as const,
      };
    });
  }

  // Fallback to DB
  return otherDbBens.map((b) => ({
    name: b.fullName,
    relationship: b.relationshipLabel || (b.type ? formatRelationshipLabel(b.type.toLowerCase()) : undefined),
    status: b.status === "ALIVE" ? "surviving" as const : "deceased" as const,
  }));
}

type AssetData = NonNullable<EstateData["assets"]>;

function buildAssets(
  intakeAssets: any,
  schedules: SupplementalSchedule[],
  payload: Record<string, any>
): EstateData["assets"] {
  const realPropertyBC: AssetData["realPropertyBC"] = [];
  const tangiblePersonalPropertyBC: AssetData["tangiblePersonalPropertyBC"] = [];
  const intangibleProperty: AssetData["intangibleProperty"] = [];

  // BC real estate from intake
  const bcProperties: any[] = intakeAssets.bcProperties || [];
  for (const prop of bcProperties) {
    realPropertyBC.push({
      description: prop.description || prop.address || "",
      owners: prop.owners,
      marketValue: parseFloat(prop.approxValue || prop.marketValue || "0"),
      securedDebt: prop.mortgage
        ? { creditor: prop.mortgage.lender || "", amount: parseFloat(prop.mortgage.amount || "0") }
        : undefined,
    });
  }

  // Vehicles + valuable items = tangible personal property
  const vehicles: any[] = intakeAssets.vehicles || [];
  const valuableItems: any[] = intakeAssets.valuableItems || [];
  for (const item of [...vehicles, ...valuableItems]) {
    tangiblePersonalPropertyBC.push({
      description: item.description || "",
      value: parseFloat(item.approxValue || "0"),
    });
  }

  // Bank/investment accounts = intangible property
  const accounts: any[] = intakeAssets.accounts || [];
  for (const acct of accounts) {
    intangibleProperty.push({
      description: acct.description || `${acct.institution || ""} ${acct.accountType || ""}`.trim(),
      value: parseFloat(acct.approxValue || acct.balance || "0"),
    });
  }

  return {
    realPropertyBC,
    tangiblePersonalPropertyBC,
    intangibleProperty,
  };
}

function buildDeliveries(
  intakeFamily: any,
  intakePeople: any[],
  dbBeneficiaries: Beneficiary[]
): EstateData["deliveries"] {
  const deliveries: NonNullable<EstateData["deliveries"]> = [];

  // Spouse
  if (intakeFamily.hasSpouse === "yes" && intakeFamily.spouse) {
    const spName = intakeFamily.spouse.name || {};
    deliveries.push({
      recipientName: buildFullName(spName),
      deliveryMethod: "mail",
      deliveryDate: "",
      acknowledgedReceipt: false,
    });
  }

  // Children
  const intakeChildren: any[] = intakeFamily.children || [];
  for (const child of intakeChildren) {
    deliveries.push({
      recipientName: buildFullName(child.name || {}),
      deliveryMethod: "mail",
      deliveryDate: "",
      acknowledgedReceipt: false,
    });
  }

  // Other beneficiaries
  for (const p of intakePeople) {
    deliveries.push({
      recipientName: buildFullName(p.name || {}),
      deliveryMethod: "mail",
      deliveryDate: "",
      acknowledgedReceipt: false,
    });
  }

  // Fallback to DB beneficiaries
  if (deliveries.length === 0) {
    for (const b of dbBeneficiaries.filter((b) => b.status === "ALIVE")) {
      deliveries.push({
        recipientName: b.fullName,
        deliveryMethod: "mail",
        deliveryDate: "",
        acknowledgedReceipt: false,
      });
    }
  }

  return deliveries;
}

// ===== Helper functions =====

function buildFullName(name: any): string {
  if (!name) return "";
  const parts = [name.first, name.middle1, name.last].filter(Boolean);
  return parts.join(" ");
}

function splitName(fullName: string): { first: string; middle: string; last: string } {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 0 || (parts.length === 1 && parts[0] === "")) {
    return { first: "", middle: "", last: "" };
  } else if (parts.length === 1) {
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
  const parts = cityProv.split(",");
  return parts[0]?.trim() || cityProv;
}

function buildIntestateSuccessors(intake: any, dbIntestateHeirs: IntestateHeir[]): EstateData["intestateSuccessors"] {
  const successors: EstateData["intestateSuccessors"] = [];

  // Get heirs from administration section (for intestate estates)
  const administration = intake.administration || {};
  const intestateHeirs: any[] = administration.intestateHeirs || [];

  for (const heir of intestateHeirs) {
    const heirName = heir.name || {};
    const fullName = [heirName.first, heirName.middle1, heirName.last].filter(Boolean).join(" ");
    if (fullName) {
      successors.push({
        name: fullName,
        relationship: formatRelationshipLabel(heir.relationship),
      });
    }
  }

  // Fallback: use DB IntestateHeir records if no intake data
  if (successors.length === 0 && dbIntestateHeirs.length > 0) {
    for (const heir of dbIntestateHeirs) {
      if (heir.fullName) {
        successors.push({
          name: heir.fullName,
          relationship: formatRelationshipLabel(heir.relationship.toLowerCase()),
        });
      }
    }
  }

  // Second fallback: if no heirs but we have family data and it's an intestate case
  if (successors.length === 0) {
    const family = intake.family || {};
    const hasWill = intake.will?.hasWill;

    // Only build from family if this is an intestate case (no will)
    if (hasWill === "no") {
      // Add spouse if exists
      if (family.hasSpouse === "yes" && family.spouse) {
        const spName = family.spouse.name || {};
        const spouseName = [spName.first, spName.middle1, spName.last].filter(Boolean).join(" ");
        if (spouseName) {
          successors.push({ name: spouseName, relationship: "Spouse" });
        }
      }

      // Add children
      const children: any[] = family.children || [];
      for (const child of children) {
        const childName = child.name || {};
        const cName = [childName.first, childName.middle1, childName.last].filter(Boolean).join(" ");
        if (cName) {
          successors.push({ name: cName, relationship: "Child" });
        }
      }
    }
  }

  return successors;
}

function formatRelationshipLabel(relationship?: string): string {
  const labels: Record<string, string> = {
    spouse: "Spouse",
    child: "Child",
    grandchild: "Grandchild",
    parent: "Parent",
    sibling: "Sibling",
    niece_nephew: "Niece/Nephew",
    other_relative: "Other Relative",
  };
  return labels[relationship || ""] || relationship || "Unknown";
}
