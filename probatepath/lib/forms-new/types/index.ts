/**
 * BC Probate Forms - Type Definitions
 * Exact types matching BC Supreme Court Civil Rules
 */

export type GrantType = 
  | "probate"
  | "admin_with_will"
  | "admin_without_will"
  | "ancillary_probate"
  | "ancillary_admin_with_will"
  | "ancillary_admin_without_will"
  | "resealing";

export interface Address {
  streetNumber?: string;
  streetName?: string;
  poBox?: string;
  city: string;
  province: string;
  country: string;
  postalCode: string;
}

export interface Person {
  firstName: string;
  middleName?: string;
  lastName: string;
}

export interface Applicant extends Person {
  address: Address;
  isIndividual: boolean;
  namedInWill: boolean;
  relationship?: string;
  organizationTitle?: string;
  nameInWill?: string; // Name as it appears in the will (for P3)
  wesaParagraph?: string; // WESA paragraph reference (e.g., "(a)", "(b)", etc.)
}

export interface Deceased extends Person {
  aliases: string[];
  dateOfDeath: string; // dd/mmm/yyyy
  lastAddress: Address;
  domiciledInBC: boolean;
  nisgaaCitizen: boolean;
  treatyFirstNation?: string;
}

export interface Will {
  exists: boolean;
  date?: string; // dd/mmm/yyyy
  isElectronic: boolean;
  originalAvailable: boolean;
  hasCodicils: boolean;
  codicilDates?: string[];
  hasHandwrittenChanges: boolean;
  hasOrdersAffecting: boolean;
  refersToDocuments: boolean;
  invalidReason?: string; // Reason why testamentary document is invalid (for P5)
}

export interface ForeignGrant {
  courtName: string;
  jurisdiction: string;
  dateIssued: string;
}

export interface OtherExecutor {
  name: string;
  reason: "renounced" | "deceased" | "other";
  otherReason?: string;
}

export interface Spouse {
  status: "surviving" | "deceased" | "never_married";
  name?: string;
  survivingName?: string;
}

export interface Child {
  name: string;
  status: "surviving" | "deceased";
}

export interface Beneficiary {
  name: string;
  relationship?: string;
  status: "surviving" | "deceased";
}

export interface IntestateSuccessor {
  name: string;
  relationship: string;
}

export interface Delivery {
  recipientName: string;
  deliveryMethod: "mail" | "personal" | "electronic";
  deliveryDate: string; // dd/mmm/yyyy
  onBehalfOf?: {
    name: string;
    capacity: string;
  };
  acknowledgedReceipt?: boolean;
}

export interface Asset {
  description: string;
  value: number;
  securedDebt?: {
    creditor: string;
    amount: number;
  };
}

export interface RealProperty extends Asset {
  address?: string;
  owners?: string;
}

export interface EstateAssets {
  realPropertyBC: RealProperty[];
  tangiblePersonalPropertyBC: Asset[];
  intangibleProperty: Asset[];
  realPropertyOutsideBC?: Asset[];
  tangiblePersonalPropertyOutsideBC?: Asset[];
}

export interface EstateData {
  // Court information
  registry: string;
  fileNumber?: string;

  // Deceased
  deceased: Deceased;

  // Grant type
  grantType: GrantType;

  // Will
  will?: Will;

  // Foreign grant (for ancillary applications)
  foreignGrant?: ForeignGrant;

  // Applicants
  applicants: Applicant[];

  // Other executors
  otherExecutors?: OtherExecutor[];

  // Executors with reserved rights
  executorsWithReservedRights: string[];

  // Lawyer
  lawyer?: {
    name: string;
    firmName?: string;
    address: {
      street: string;
      city: string;
      province: string;
      postalCode: string;
    };
  };

  // Address for service
  addressForService: {
    street: string;
    fax?: string;
    email?: string;
    phone: string;
  };

  // Affidavit information
  affidavit: {
    form: "P3" | "P4" | "P5" | "P6" | "P7";
    isJoint: boolean;
    hasP8Affidavits: boolean;
    p8Count?: number;
  };

  // P9 Affidavits of Delivery
  affidavitsOfDelivery: {
    name: string;
    dateSworn: string;
  }[];
  noDeliveryRequired: boolean;

  // Document language
  allDocumentsInEnglish: boolean;
  translatorAffidavit?: {
    translatorName: string;
    language: string;
    documentTranslated: string;
  };

  // Additional documents
  additionalDocuments: string[];

  // Certified copies requested
  certifiedCopies: {
    estateGrant: number;
    authToObtainInfo: number;
    affidavitDomiciled: number;
    affidavitNonDomiciled: number;
  };

  // P10/P11 submission
  submittingAffidavitOfAssets: boolean;

  // Family information
  spouse: Spouse;
  children: Child[];

  // Beneficiaries
  beneficiaries: Beneficiary[];

  // Intestate successors
  intestateSuccessors: IntestateSuccessor[];

  // Creditors
  creditors?: { name: string }[];

  // Citors
  citors: string[];

  // Attorney General notice
  attorneyGeneralNotice: boolean;

  // Submission date
  submissionDate: string; // dd/mmm/yyyy

  // Assets and Liabilities
  assets?: EstateAssets;

  // Delivery tracking (for P9)
  deliveries?: Delivery[];
  publicGuardianDelivery?: {
    method: "mail" | "personal" | "electronic";
  };
  electronicWillDemanded?: boolean;
  electronicWillProvidedTo?: string[];
}

// Form-specific data types
export interface P1Data extends EstateData {}

export interface P2Data extends EstateData {}

export interface P3Data extends EstateData {
  applicantIndex: number; // Which applicant is swearing this affidavit
}

export interface P4Data extends EstateData {
  applicantIndex: number;
  willExecutionIssues?: {
    noAttestationClause: boolean;
    insufficientAttestationClause: boolean;
    subscribingWitnessUnavailable: boolean;
    willMakerWasBlind: boolean;
    willMakerWasIlliterate: boolean;
    willMakerDidNotUnderstandLanguage: boolean;
    willMakerSignedByMark: boolean;
    willMakerDirectedAnotherToSign: boolean;
  };
}

export interface P5Data extends EstateData {
  applicantIndex: number;
}

export interface P9Data extends EstateData {
  applicantIndex: number;
  affidavitNumber: number;
  deliveries: Delivery[];
  documentsDelivered?: string; // Description of documents delivered with notice (Rule 25-2 (1.1))
}

export interface P10Data extends EstateData {
  applicantIndex: number;
  affidavitNumber: number;
  assets: EstateAssets;
  hasPropertyOutsideBC: boolean;
}

export interface P11Data extends EstateData {
  applicantIndex: number;
  affidavitNumber: number;
  assets: EstateAssets;
}
