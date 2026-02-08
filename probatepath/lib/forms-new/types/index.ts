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
  grantType?: 'probate' | 'admin_with_will' | 'admin_without_will';
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
  applicantIndex: number;
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

// P12 - Affidavit of Translator
export interface P12Data extends EstateData {
  applicantIndex: number;
  affidavitNumber: number;
  translator: {
    name: string;
    address: Address;
    occupation: string;
  };
  translations: {
    documentDescription: string;
    sourceLanguage: string;
    exhibitLetter: string;
  }[];
}

// P13 - Direction of Public Guardian and Trustee
export interface P13Data extends EstateData {
  relatedMaterial?: string;
  dateIssued: string;
  signatoryType: 'pgt' | 'authorized';
  signatoryName: string;
}

// P14 - Supplemental Affidavit of Assets and Liabilities for Domiciled Estate Grant
export interface P14Data extends EstateData {
  applicantIndex: number;
  affidavitNumber: number;
  assets: EstateAssets;
}

// P15 - Supplemental Affidavit of Assets and Liabilities for Non-Domiciled Estate Grant
export interface P15Data extends EstateData {
  applicantIndex: number;
  affidavitNumber: number;
  assets: EstateAssets;
}

// P16 - Affidavit of Interlineation, Erasure, Obliteration or Other Alteration
export interface P16Data extends EstateData {
  applicantIndex: number;
  affidavitNumber: number;
  willDate: string;
  alterationLocation: string;
  alterationDescription: string;
  wasPresentAtSigning: boolean;
  alterationWasPresentWhenSigned: boolean;
  alterationMadeAtDirection: boolean;
  alterationMadeWithConsent: boolean;
}

// P26 - Supplemental Affidavit of Assets and Liabilities for Resealing
export interface P26Data extends EstateData {
  applicantIndex: number;
  affidavitNumber: number;
  supplementalAssets?: Asset[];
}

// P27 - Authorization to Obtain Resealing Information
export interface P27Data extends EstateData {}

// P28 - Certificate of Resealing
export interface P28Data extends EstateData {
  resealingDate?: string;
  grantDescription?: string;
}

// P29 - Notice of Dispute
export interface P29Data extends EstateData {
  disputantName?: string;
  courtFile?: {
    isOpen: boolean;
    number?: string;
    registry?: string;
  };
  willStatus: 'none' | 'physical' | 'electronic';
  rule252Paragraph?: string;
  groundsForDispute?: string;
}

// P30 - Withdrawal of Notice of Dispute
export interface P30Data extends EstateData {
  withdrawingPersonName?: string;
  noticeOfDisputeDate?: string;
}

// P31 - Order for Removal of Notice of Dispute
export interface P31Data extends EstateData {
  judgeName?: string;
  associateJudgeName?: string;
  orderDate?: string;
  applicantName?: string;
  hearingLocation?: string;
  hearingDate?: string;
  heardFrom?: string;
  andHeardFrom?: string;
  materialsFrom?: string;
  andMaterialsFrom?: string;
  disputantName?: string;
}

// P32 - Citation
export interface P32Data extends EstateData {
  citorName?: string;
  citedPersonName?: string;
  willDescription?: string;
  basisForBelief?: string;
  citorAddressForService?: {
    street?: string;
    fax?: string;
    email?: string;
    phone?: string;
  };
}

// P33 - Answer to Citation
export interface P33Data extends EstateData {
  citorName?: string;
  citationDate?: string;
  willApplyForProbate: boolean;
}

// P34 - Affidavit of Deemed Renunciation
export interface P34Data extends EstateData {
  applicantIndex: number;
  affidavitNumber: number;
  serviceMethod: 'personal' | 'affidavit';
  serviceDate?: string;
  serviceTime?: string;
  personServed?: string;
  serviceLocation?: string;
  affidavitOfServiceDate?: string;
  affidavitOfServiceName?: string;
  responseStatus: 'no_response' | 'refusal' | 'other';
  rule25114Paragraph?: string;
}

// P35 - Requisition for Subpoena
export interface P35Data extends EstateData {
  filedBy?: string;
  subpoenaTargetName?: string;
  documentsRequired?: string;
  evidenceDescription?: string;
  filingPersonName?: string;
}


// P36 - Warrant After Subpoena
export interface P36Data extends EstateData {
  fileNumber?: string;
  subpoenaRecipient?: {
    firstName: string;
    middleName?: string;
    lastName: string;
    address: Address;
  };
  documentsRequested?: string;
  courtLocation?: string;
}

// P37 - Subpoena
export interface P37Data extends EstateData {
  recipient?: {
    firstName: string;
    middleName?: string;
    lastName: string;
    address: Address;
  };
  courtLocation?: string;
  documentsRequested?: string;
}

// P38 - Affidavit in Support of Application to Pass Accounts
export interface P38Data extends EstateData {
  affiant?: {
    firstName: string;
    middleName?: string;
    lastName: string;
    address: Address;
    occupation: string;
  };
  affidavitNumber?: number;
  grantType?: string;
  grantDate?: string;
  compensationAwarded?: string;
  beneficiaries?: string;
  minors?: string;
  creditors?: string;
  unadministeredAssets?: string;
  reasonUnadministered?: string;
}

// P39 - Certificate
export interface P39Data extends EstateData {
  personalRepresentative?: {
    firstName: string;
    middleName?: string;
    lastName: string;
  };
  periodStart?: string;
  periodEnd?: string;
  affiant?: {
    firstName: string;
    middleName?: string;
    lastName: string;
  };
  affidavitDate?: string;
  approvedAsPresented?: boolean;
  approvedWithConditions?: boolean;
  conditions?: string;
  remunerationAmount?: string;
  costsBasis?: string;
}

// P40 - Statement of Account Affidavit
export interface P40Data extends EstateData {
  affiant?: {
    firstName: string;
    middleName?: string;
    lastName: string;
    address: Address;
    occupation: string;
  };
  affidavitNumber?: number;
}

// P41 - Requisition — Estates
export interface P41Data extends EstateData {
  fileNumber?: string;
  filedBy?: string;
  ruleReliedOn?: string;
  evidenceDescription?: string;
  filerName?: string;
  addressForService?: {
    street?: string;
    fax?: string;
    email?: string;
    phone?: string;
  };
}

// P42 - Notice of Application (Spousal Home or Deficiencies in Will)
export interface P42Data extends EstateData {
  applicantNames?: string;
  recipientNames?: string;
  courtAddress?: string;
  hearingDate?: string;
  hearingTime?: string;
  timeEstimate?: string;
  associateJudgeJurisdiction?: boolean;
  ordersSought?: {
    section30?: boolean;
    section33?: boolean;
    section58?: boolean;
    section59?: boolean;
  };
}

// P43 - Petition to the Court — Estate Proceedings
export interface P43Data extends EstateData {
  fileNumber?: string;
  petitionerNames?: string;
  respondentNames?: string;
  reliefTarget?: string;
  noticeRecipients?: string;
  registryAddress?: string;
  timeEstimate?: string;
  namedInStyle?: boolean;
  addressForService?: {
    street?: string;
    fax?: string;
    email?: string;
  };
  lawyerInfo?: string;
  ordersSought?: {
    section30?: boolean;
    section33?: boolean;
    section58?: boolean;
    section59?: boolean;
  };
}

// P44 - Notice of Withdrawal of Application
export interface P44Data extends EstateData {
  filedBy?: string;
  applicantNames?: string;
  withdrawalType?: string;
  applicationDetails?: string;
}

// P45 - Affidavit of Electronic Will
export interface P45Data extends EstateData {
  affiant?: {
    firstName: string;
    middleName?: string;
    lastName: string;
    address: Address;
    occupation: string;
  };
  willFormat?: string;
  verificationMethod?: 'editDate' | 'locked';
  editDateVerification?: string;
  lockingMethod?: string;
}

// P46 - Demand for Electronic Will
export interface P46Data extends EstateData {
  demandantName?: string;
  demandantAddress?: Address;
  applicantName?: string;
}

// P17 - Notice of Renunciation
export interface P17Data extends EstateData {
  executor: Applicant;
  willDate: string;
  renunciationDate: string;
}

// P18 - Authorization to Obtain Estate Information
export interface P18Data extends EstateData {
  issueDate: string;
  fileNumber?: string;
}

// P19 - Estate Grant (In Probate)
export interface P19Data extends EstateData {
  issueDate: string;
  fileNumber?: string;
  grantType: GrantType;
}

// P20 - Correction Record
export interface P20Data extends EstateData {
  correctionDate: string;
  documentsToCorrect?: string[];
  otherDocument?: string;
  corrections?: {
    item: string;
    originalText: string;
    correctedText: string;
  }[];
  explanation?: string;
}

// P20.1 - Correction Record for Style of Proceeding
export interface P20_1Data extends EstateData {
  correctionDate: string;
  correctedDeceasedName?: string;
  explanation?: string;
}

// P21 - Submission for Resealing
export interface P21Data extends Omit<EstateData, 'affidavit'> {
  submissionDate: string;
  submittingAffidavitOfAssets: boolean;
  affidavit?: {
    isJoint: boolean;
    p24Count?: number;
  };
  certifiedCopies?: {
    resealedGrant: number;
    authToObtainInfo: number;
    affidavitAssets: number;
  };
}

// P22 - Affidavit of Applicant for Resealing (with Will)
export interface P22Data extends EstateData {
  applicantIndex: number;
  affidavitNumber: number;
}

// P23 - Affidavit of Applicant for Resealing (without Will)
export interface P23Data extends EstateData {
  applicantIndex: number;
  affidavitNumber: number;
}

// P24 - Affidavit in Support of Application for Resealing
export interface P24Data extends EstateData {
  applicantIndex: number;
  affidavitNumber: number;
  isAlsoSwornP22?: boolean;
  isAlsoSwornP23?: boolean;
}

// P25 - Affidavit of Assets and Liabilities for Resealing
export interface P25Data extends EstateData {
  applicantIndex: number;
  affidavitNumber: number;
  assets: EstateAssets;
}
