export type PersonName = {
  first: string;
  middle1: string;
  middle2: string;
  middle3: string;
  last: string;
  suffix?: string;
};

export type Address = {
  line1: string;
  line2: string;
  city: string;
  region: string;
  postalCode: string;
  country: string;
};

export type Relationship =
  | "spouse"
  | "child"
  | "sibling"
  | "other_family"
  | "friend"
  | "professional"
  | "other";

export type ApplicantContact = {
  email: string;
  phone: string;
};

export type CoApplicant = {
  id: string;
  name: PersonName;
  relationship: string;
  email: string;
  phone: string;
  address: Address;
};

export type FamilyMember = {
  id: string;
  name: PersonName;
  dateOfBirth: string;
  isMinor: boolean;
  relationship: string;
  address: Address;
};

export type BeneficiaryPerson = {
  id: string;
  name: PersonName;
  type: "person";
  address: Address;
  giftDescription: string;
  isMinorOrIncapable: boolean;
};

export type BeneficiaryOrganization = {
  id: string;
  type: "organization";
  legalName: string;
  registeredNumber: string;
  address: Address;
  giftDescription: string;
};

export type BcProperty = {
  id: string;
  address: Address;
  ownershipType: "sole" | "joint-tenancy" | "tenants-in-common" | "unknown";
  coOwners: string;
  estimatedValue: string;
  mortgageBalance: string;
};

export type FinancialAccount = {
  id: string;
  institutionName: string;
  accountType: string;
  approxBalance: string;
  ownership: "sole" | "joint" | "unknown";
};

export type VehicleAsset = {
  id: string;
  description: string;
  approxValue: string;
};

export type ValuableItem = {
  id: string;
  description: string;
  approxValue: string;
};

export type LiabilityEntry = {
  id: string;
  type: "credit_card" | "loan" | "line_of_credit" | "tax" | "other";
  creditorName: string;
  approxBalance: string;
};

// Intestate relationship priority (WESA order)
export type IntestateRelationshipType =
  | "spouse"
  | "child"
  | "grandchild"
  | "parent"
  | "sibling"
  | "niece_nephew"
  | "other_relative";

// Person who needs to renounce priority
export type RenunciationPerson = {
  id: string;
  name: PersonName;
  relationship: IntestateRelationshipType;
  status: "pending" | "received" | "refused";
};

// Intestate heir for distribution calculation
export type IntestateHeirEntry = {
  id: string;
  name: PersonName;
  relationship: IntestateRelationshipType;
  isApplicant: boolean;
  sharePercent: number;
  address: Address;
  isDeceased: boolean;
  deceasedDate: string;
};

export type EstateIntake = {
  // Prerequisites - gates that must be passed before proceeding
  prerequisites: {
    hasDeathCertificate: "yes" | "no" | null;
    deathCertificateConfirmedAt: string;
  };
  applicant: {
    name: PersonName;
    contact: ApplicantContact;
    address: Address;
    relationship: Relationship | "";
    isOnlyApplicant: "yes" | "no" | null;
    coApplicants: CoApplicant[];
  };
  deceased: {
    name: PersonName;
    dateOfDeath: string;
    placeOfDeath: {
      city: string;
      province: string;
      country: string;
    };
    dateOfBirth: string;
    address: Address;
    maritalStatus: "single" | "married" | "common-law" | "separated" | "divorced" | "widowed" | "";
  };
  will: {
    hasWill: "yes" | "no" | "unknown";
    dateSigned: string;
    signingLocation: {
      city: string;
      province: string;
      country: string;
    };
    hasOriginal: "yes" | "no" | "unknown";
    storageLocation: string;
    namedExecutors: {
      id: string;
      name: PersonName;
      isApplicant: "yes" | "no" | null;
    }[];
    hasCodicils: "yes" | "no";
    codicils: {
      id: string;
      dateSigned: string;
      notes: string;
    }[];
  };
  willUpload: {
    hasFiles: boolean;
    lastUploadedAt: string;
  };
  // Administration path (intestate - no will)
  administration: {
    applicantRelationship: IntestateRelationshipType | "";
    // Spouse priority check
    spouseExists: "yes" | "no" | "deceased" | null;
    spouseDeathDate: string;
    spouseConsents: "yes" | "no" | "applying" | null;
    spouseName: PersonName;
    // Children priority check (if applicant is not spouse/child)
    childrenExist: "yes" | "no" | null;
    childrenConsent: "yes" | "no" | null;
    // Renunciations needed from higher-priority people
    renunciationsNeeded: RenunciationPerson[];
    // Co-applicants for administration
    coApplicants: CoApplicant[];
    // Calculated intestate heirs (for P1 notices and distribution)
    intestateHeirs: IntestateHeirEntry[];
    // Confirmation checkboxes
    understandsAdministratorRole: boolean;
    confirmedHeirCalculation: boolean;
  };
  family: {
    hasSpouse: "yes" | "no" | null;
    spouse: {
      name: PersonName;
      dateOfBirth: string;
      address: Address;
    };
    hasChildren: "yes" | "no" | null;
    children: FamilyMember[];
    otherRelatives: FamilyMember[];
  };
  beneficiaries: {
    people: BeneficiaryPerson[];
    organizations: BeneficiaryOrganization[];
  };
  assets: {
    hasBCRealEstate: "yes" | "no" | null;
    bcProperties: BcProperty[];
    hasBankOrInvestments: "yes" | "no" | null;
    accounts: FinancialAccount[];
    vehicles: VehicleAsset[];
    valuableItems: ValuableItem[];
  };
  debts: {
    liabilities: LiabilityEntry[];
    funeralCostsAmount: string;
    funeralCostsPaidBy: string;
  };
  specialIssues: {
    hasPriorGrant: "yes" | "no" | null;
    priorGrantDetails: string;
    hasPotentialDispute: "yes" | "no" | null;
    disputeSummary: string;
  };
  filing: {
    registryLocation: string;
    returnAddress: Address;
  };
};

const emptyAddress: Address = {
  line1: "",
  line2: "",
  city: "",
  region: "",
  postalCode: "",
  country: "Canada",
};

const emptyName: PersonName = {
  first: "",
  middle1: "",
  middle2: "",
  middle3: "",
  last: "",
  suffix: "",
};

export const emptyEstateIntake: EstateIntake = {
  prerequisites: {
    hasDeathCertificate: null,
    deathCertificateConfirmedAt: "",
  },
  applicant: {
    name: emptyName,
    contact: { email: "", phone: "" },
    address: emptyAddress,
    relationship: "",
    isOnlyApplicant: null,
    coApplicants: [],
  },
  deceased: {
    name: emptyName,
    dateOfDeath: "",
    placeOfDeath: { city: "", province: "", country: "Canada" },
    dateOfBirth: "",
    address: emptyAddress,
    maritalStatus: "",
  },
  will: {
    hasWill: "yes",
    dateSigned: "",
    signingLocation: { city: "", province: "", country: "Canada" },
    hasOriginal: "unknown",
    storageLocation: "",
    namedExecutors: [],
    hasCodicils: "no",
    codicils: [],
  },
  willUpload: {
    hasFiles: false,
    lastUploadedAt: "",
  },
  administration: {
    applicantRelationship: "",
    spouseExists: null,
    spouseDeathDate: "",
    spouseConsents: null,
    spouseName: emptyName,
    childrenExist: null,
    childrenConsent: null,
    renunciationsNeeded: [],
    coApplicants: [],
    intestateHeirs: [],
    understandsAdministratorRole: false,
    confirmedHeirCalculation: false,
  },
  family: {
    hasSpouse: null,
    spouse: {
      name: emptyName,
      dateOfBirth: "",
      address: emptyAddress,
    },
    hasChildren: null,
    children: [],
    otherRelatives: [],
  },
  beneficiaries: {
    people: [],
    organizations: [],
  },
  assets: {
    hasBCRealEstate: null,
    bcProperties: [],
    hasBankOrInvestments: null,
    accounts: [],
    vehicles: [],
    valuableItems: [],
  },
  debts: {
    liabilities: [],
    funeralCostsAmount: "",
    funeralCostsPaidBy: "",
  },
  specialIssues: {
    hasPriorGrant: null,
    priorGrantDetails: "",
    hasPotentialDispute: null,
    disputeSummary: "",
  },
  filing: {
    registryLocation: "",
    returnAddress: emptyAddress,
  },
};

export type EligibilityGateStatus = "unknown" | "eligible" | "not_fit";
