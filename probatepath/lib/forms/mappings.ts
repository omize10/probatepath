import type { Matter, IntakeDraft, Executor, Beneficiary, SupplementalSchedule } from "@prisma/client";

// Type for Matter with relations
export type MatterWithRelations = Matter & {
  draft: IntakeDraft | null;
  executors: Executor[];
  beneficiaries: Beneficiary[];
  schedules: SupplementalSchedule[];
};

// Helper function to format dates
function safeFormatDate(date: Date | null | undefined): string {
  if (!date) return "";
  try {
    return new Date(date).toLocaleDateString('en-CA'); // YYYY-MM-DD
  } catch {
    return "";
  }
}

// Helper to get full address
function formatAddress(executor: Executor): string {
  const parts = [
    executor.addressLine1,
    executor.addressLine2,
    executor.city,
    executor.province,
    executor.postalCode,
    executor.country
  ].filter(Boolean);
  return parts.join(", ");
}

// Helper to split deceased name
function splitDeceasedName(fullName: string) {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) {
    return { first: parts[0], middle: "", last: "" };
  } else if (parts.length === 2) {
    return { first: parts[0], middle: "", last: parts[1] };
  } else {
    return {
      first: parts[0],
      middle: parts.slice(1, -1).join(" "),
      last: parts[parts.length - 1]
    };
  }
}

// Helper to format currency
function formatCurrency(amount: number): string {
  return `$${amount.toLocaleString('en-CA', { minimumFractionDigits: 2 })}`;
}

// Interface for asset items
interface AssetItem {
  description: string;
  location?: string;
  pid?: string;
  legalDescription?: string;
  institution?: string;
  value: number;
  formattedValue: string;
}

// Helper to extract assets from draft payload or schedules
function extractAssets(draft: IntakeDraft | null, schedules: SupplementalSchedule[]) {
  const realProperty: AssetItem[] = [];
  const tangibleProperty: AssetItem[] = [];
  const intangibleProperty: AssetItem[] = [];
  let totalReal = 0;
  let totalTangible = 0;
  let totalIntangible = 0;

  // Try to extract from draft payload if it contains asset data
  if (draft?.payload && typeof draft.payload === 'object') {
    const payload = draft.payload as Record<string, any>;

    // Check for assets in payload
    if (payload.assets) {
      const assets = payload.assets as any[];
      assets.forEach((asset: any) => {
        const value = parseFloat(asset.value || asset.estimatedValue || "0");
        const assetItem: AssetItem = {
          description: asset.description || asset.title || "",
          location: asset.location || asset.address || "",
          pid: asset.pid || "",
          legalDescription: asset.legalDescription || "",
          institution: asset.institution || "",
          value: value,
          formattedValue: formatCurrency(value)
        };

        const assetType = (asset.type || asset.kind || "").toLowerCase();
        if (assetType.includes("real") || assetType.includes("property") || assetType.includes("land") || assetType.includes("house")) {
          realProperty.push(assetItem);
          totalReal += value;
        } else if (assetType.includes("tangible") || assetType.includes("vehicle") || assetType.includes("furniture") || assetType.includes("jewelry")) {
          tangibleProperty.push(assetItem);
          totalTangible += value;
        } else {
          intangibleProperty.push(assetItem);
          totalIntangible += value;
        }
      });
    }
  }

  // Also check schedules for any asset data in their payloads
  schedules.forEach(schedule => {
    if (schedule.payload && typeof schedule.payload === 'object') {
      const payload = schedule.payload as Record<string, any>;
      const value = parseFloat(payload.value || payload.estimatedValue || "0");

      if (value > 0 || payload.description) {
        const assetItem: AssetItem = {
          description: schedule.title || payload.description || "",
          location: payload.location || payload.address || "",
          pid: payload.pid || "",
          legalDescription: payload.legalDescription || "",
          institution: payload.institution || "",
          value: value,
          formattedValue: formatCurrency(value)
        };

        // Categorize based on schedule kind or title
        const kindOrTitle = `${schedule.kind} ${schedule.title}`.toLowerCase();
        if (kindOrTitle.includes("foreign") || schedule.kind === "FOREIGN_ASSETS") {
          intangibleProperty.push(assetItem);
          totalIntangible += value;
        }
      }
    }
  });

  return {
    realProperty,
    tangibleProperty,
    intangibleProperty,
    totalReal,
    totalTangible,
    totalIntangible,
    totalAssets: totalReal + totalTangible + totalIntangible
  };
}

export const formMappings = {
  // P2 - Submission for Estate Grant
  P2: (matter: MatterWithRelations) => {
    const primaryExecutor = matter.executors.find(e => e.isPrimary) || matter.executors[0];
    const deceasedName = splitDeceasedName(matter.draft?.decFullName || "");
    const assets = extractAssets(matter.draft, matter.schedules);

    // Build applicants list from executors
    const applicants = matter.executors
      .filter(e => !e.isRenouncing && !e.isDeceased)
      .map(e => ({
        fullName: e.fullName,
        address: formatAddress(e),
        capacity: e.isPrimary ? "Executor" : "Co-Executor"
      }));

    return {
      registryName: matter.registryName || "Vancouver Registry",
      fileNumber: matter.caseCode || "",
      isGrantOfProbate: true,
      isAdminWithWill: false,
      isAdminNoWill: false,
      isResealing: false,
      deceasedFirstName: deceasedName.first,
      deceasedMiddleNames: deceasedName.middle,
      deceasedLastName: deceasedName.last,
      deceasedAliases: "",
      deceasedDateOfDeath: safeFormatDate(matter.draft?.decDateOfDeath),
      deceasedLastAddress: matter.draft?.decCityProv || "",
      deceasedPlaceOfDeath: matter.draft?.decCityProv || "",
      willDate: "",
      hasCodicils: false,
      numberOfCodicils: 0,
      codicilDates: "",
      applicants,
      applicantName: primaryExecutor?.fullName || matter.draft?.exFullName || "",
      applicantAddress: primaryExecutor ? formatAddress(primaryExecutor) : matter.draft?.exCity || "",
      totalRealProperty: formatCurrency(assets.totalReal),
      totalPersonalProperty: formatCurrency(assets.totalTangible + assets.totalIntangible),
      totalEstateValue: formatCurrency(assets.totalAssets),
      submittedDocuments: [
        "Original Will",
        "Death Certificate",
        "Form P1 - Notice of Proposed Application",
        "Form P3 - Affidavit of Applicant",
        "Form P9 - Affidavit of Delivery",
        "Form P10 - Affidavit of Assets and Liabilities"
      ],
      generatedDate: safeFormatDate(new Date())
    };
  },

  // P3 - Affidavit of Applicant (Short Form)
  P3: (matter: MatterWithRelations) => {
    const primaryExecutor = matter.executors.find(e => e.isPrimary) || matter.executors[0];
    const deceasedName = splitDeceasedName(matter.draft?.decFullName || "");

    // Get other executors (not the primary applicant)
    const otherExecutors = matter.executors
      .filter(e => !e.isPrimary && e.id !== primaryExecutor?.id)
      .map(e => ({
        name: e.fullName,
        renounced: e.isRenouncing,
        deceased: e.isDeceased,
        other: false,
        otherReason: ""
      }));

    return {
      affidavitNumber: "1st",
      applicantName: primaryExecutor?.fullName || matter.draft?.exFullName || "",
      affidavitDate: "",
      commissionerLocation: matter.registryName || "British Columbia",
      registryName: matter.registryName || "Vancouver Registry",
      fileNumber: matter.caseCode || "",
      applicantAddress: primaryExecutor ? formatAddress(primaryExecutor) : matter.draft?.exCity || "",
      applicantOccupation: "Executor",
      grantType: "a grant of probate",
      isNamedExecutor: true,
      executorNameInWill: primaryExecutor?.fullName || matter.draft?.exFullName || "",
      hasOtherExecutors: otherExecutors.length > 0,
      otherExecutors,
      deceasedFirstName: deceasedName.first,
      deceasedMiddleNames: deceasedName.middle,
      deceasedLastName: deceasedName.last,
      requiresPGT: matter.beneficiaries.some(b => b.isMinor),
      additionalInfo: "",
      generatedDate: safeFormatDate(new Date())
    };
  },

  // P4 - Affidavit of Applicant (Long Form) - used when will has alterations
  P4: (matter: MatterWithRelations) => {
    const primaryExecutor = matter.executors.find(e => e.isPrimary) || matter.executors[0];
    const deceasedName = splitDeceasedName(matter.draft?.decFullName || "");

    const otherExecutors = matter.executors
      .filter(e => !e.isPrimary && e.id !== primaryExecutor?.id)
      .map(e => ({
        name: e.fullName,
        renounced: e.isRenouncing,
        deceased: e.isDeceased,
        other: false,
        otherReason: ""
      }));

    return {
      affidavitNumber: "1st",
      applicantName: primaryExecutor?.fullName || matter.draft?.exFullName || "",
      affidavitDate: "",
      commissionerLocation: matter.registryName || "British Columbia",
      registryName: matter.registryName || "Vancouver Registry",
      fileNumber: matter.caseCode || "",
      applicantAddress: primaryExecutor ? formatAddress(primaryExecutor) : matter.draft?.exCity || "",
      applicantOccupation: "Executor",
      grantType: "a grant of probate",
      isNamedExecutor: true,
      executorNameInWill: primaryExecutor?.fullName || matter.draft?.exFullName || "",
      hasOtherExecutors: otherExecutors.length > 0,
      otherExecutors,
      deceasedFirstName: deceasedName.first,
      deceasedMiddleNames: deceasedName.middle,
      deceasedLastName: deceasedName.last,
      hasAlterations: false,
      alterations: [],
      requiresPGT: matter.beneficiaries.some(b => b.isMinor),
      additionalInfo: "",
      generatedDate: safeFormatDate(new Date())
    };
  },

  // P5 - Affidavit of Applicant for Grant of Administration (intestate)
  P5: (matter: MatterWithRelations) => {
    const primaryExecutor = matter.executors.find(e => e.isPrimary) || matter.executors[0];
    const deceasedName = splitDeceasedName(matter.draft?.decFullName || "");

    return {
      affidavitNumber: "1st",
      applicantName: primaryExecutor?.fullName || matter.draft?.exFullName || "",
      affidavitDate: "",
      commissionerLocation: matter.registryName || "British Columbia",
      registryName: matter.registryName || "Vancouver Registry",
      fileNumber: matter.caseCode || "",
      applicantAddress: primaryExecutor ? formatAddress(primaryExecutor) : matter.draft?.exCity || "",
      applicantOccupation: "",
      deceasedFirstName: deceasedName.first,
      deceasedMiddleNames: deceasedName.middle,
      deceasedLastName: deceasedName.last,
      diedIntestate: true,
      noKnownWill: true,
      relationshipToDeceased: matter.draft?.exRelation || "Spouse",
      isSpouse: (matter.draft?.exRelation || "").toLowerCase().includes("spouse"),
      isChild: (matter.draft?.exRelation || "").toLowerCase().includes("child"),
      isParent: (matter.draft?.exRelation || "").toLowerCase().includes("parent"),
      isSibling: (matter.draft?.exRelation || "").toLowerCase().includes("sibling"),
      isOtherRelative: false,
      otherRelationship: "",
      hasPersonsWithPriority: false,
      personsWithPriority: [],
      requiresPGT: matter.beneficiaries.some(b => b.isMinor),
      additionalInfo: "",
      generatedDate: safeFormatDate(new Date())
    };
  },

  // P9 - Affidavit of Delivery
  P9: (matter: MatterWithRelations) => {
    const primaryExecutor = matter.executors.find(e => e.isPrimary) || matter.executors[0];
    const deceasedName = splitDeceasedName(matter.draft?.decFullName || "");

    // Map beneficiaries to delivery recipients
    const deliveryByMail = matter.beneficiaries.map(b => ({
      name: b.fullName,
      date: safeFormatDate(new Date())
    }));

    return {
      affidavitNumber: "1st",
      applicantName: primaryExecutor?.fullName || matter.draft?.exFullName || "",
      affidavitDate: "",
      commissionerLocation: matter.registryName || "Vancouver, BC",
      registryName: matter.registryName || "Vancouver Registry",
      fileNumber: matter.caseCode || "",
      delivererName: primaryExecutor?.fullName || matter.draft?.exFullName || "",
      delivererAddress: primaryExecutor ? formatAddress(primaryExecutor) : matter.draft?.exCity || "",
      delivererOccupation: "Executor",
      documentsDelivered: "Notice of Proposed Application (Form P1), Will (if applicable)",
      deceasedFirstName: deceasedName.first,
      deceasedMiddleNames: deceasedName.middle,
      deceasedLastName: deceasedName.last,
      deliveryByMail: deliveryByMail.length > 0 ? deliveryByMail : [],
      deliveryByHand: [],
      deliveryByEmail: [],
      additionalInfo: "",
      generatedDate: safeFormatDate(new Date())
    };
  },

  // P10 - Affidavit of Assets and Liabilities (Domiciled)
  P10: (matter: MatterWithRelations) => {
    const primaryExecutor = matter.executors.find(e => e.isPrimary) || matter.executors[0];
    const deceasedName = splitDeceasedName(matter.draft?.decFullName || "");
    const assets = extractAssets(matter.draft, matter.schedules);

    return {
      affidavitNumber: "1st",
      applicantName: primaryExecutor?.fullName || matter.draft?.exFullName || "",
      applicantAddress: primaryExecutor ? formatAddress(primaryExecutor) : matter.draft?.exCity || "",
      applicantOccupation: "Executor",
      affidavitDate: "",
      commissionerLocation: matter.registryName || "Vancouver, BC",
      registryName: matter.registryName || "Vancouver Registry",
      fileNumber: matter.caseCode || "",
      grantOption: "Grant of Probate",
      deceasedFirstName: deceasedName.first,
      deceasedMiddleNames: deceasedName.middle,
      deceasedLastName: deceasedName.last,
      realProperty: assets.realProperty,
      totalRealProperty: formatCurrency(assets.totalReal),
      tangibleProperty: assets.tangibleProperty,
      totalTangibleProperty: formatCurrency(assets.totalTangible),
      intangibleProperty: assets.intangibleProperty,
      totalIntangibleProperty: formatCurrency(assets.totalIntangible),
      grossValueAssets: formatCurrency(assets.totalAssets),
      totalLiabilities: formatCurrency(0),
      netEstateValue: formatCurrency(assets.totalAssets),
      generatedDate: safeFormatDate(new Date())
    };
  },

  // P11 - Affidavit of Assets and Liabilities (Non-Domiciled)
  P11: (matter: MatterWithRelations) => {
    const primaryExecutor = matter.executors.find(e => e.isPrimary) || matter.executors[0];
    const deceasedName = splitDeceasedName(matter.draft?.decFullName || "");
    const assets = extractAssets(matter.draft, matter.schedules);

    return {
      affidavitNumber: "1st",
      applicantName: primaryExecutor?.fullName || matter.draft?.exFullName || "",
      applicantAddress: primaryExecutor ? formatAddress(primaryExecutor) : matter.draft?.exCity || "",
      applicantOccupation: "Executor",
      affidavitDate: "",
      commissionerLocation: matter.registryName || "Vancouver, BC",
      registryName: matter.registryName || "Vancouver Registry",
      fileNumber: matter.caseCode || "",
      deceasedFirstName: deceasedName.first,
      deceasedMiddleNames: deceasedName.middle,
      deceasedLastName: deceasedName.last,
      domicileLocation: "",
      domicileJurisdiction: "",
      grantOption: "Resealing",
      realProperty: assets.realProperty,
      totalRealProperty: formatCurrency(assets.totalReal),
      tangibleProperty: assets.tangibleProperty,
      totalTangibleProperty: formatCurrency(assets.totalTangible),
      intangibleProperty: assets.intangibleProperty,
      totalIntangibleProperty: formatCurrency(assets.totalIntangible),
      grossValueAssets: formatCurrency(assets.totalAssets),
      generatedDate: safeFormatDate(new Date())
    };
  },
};
