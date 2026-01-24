export interface EstateData {
  // Court information
  registry: string;
  fileNumber?: string;

  // Deceased information
  deceased: {
    firstName: string;
    middleName?: string;
    lastName: string;
    aliases: string[];
    dateOfDeath: string; // dd/mmm/yyyy
    lastAddress: {
      streetNumber?: string;
      streetName?: string;
      poBox?: string;
      city: string;
      province: string;
      country: string;
      postalCode: string;
    };
    domiciledInBC: boolean;
    nisgaaCitizen: boolean;
    treatyFirstNation?: string;
  };

  // Grant type
  grantType:
    | "probate"
    | "admin_with_will"
    | "admin_without_will"
    | "ancillary_probate"
    | "ancillary_admin_with_will"
    | "ancillary_admin_without_will";

  // Will information
  will?: {
    exists: boolean;
    date?: string;
    isElectronic: boolean;
    originalAvailable: boolean;
    hasCodicils: boolean;
    codicilDates?: string[];
    hasHandwrittenChanges: boolean;
    hasOrdersAffecting: boolean;
    ordersAffectingWill?: Array<{
      date: string;
      filedInProceeding: boolean;
    }>;
    refersToDocuments: boolean;
    documentsReferred?: Array<{
      name: string;
      attached: boolean;
      cannotObtain: boolean;
      notTestamentary: boolean;
      notTestamentaryReason?: string;
    }>;
  };

  // Foreign grant (for ancillary applications)
  foreignGrant?: {
    courtName: string;
    jurisdiction: string;
    dateIssued: string;
  };

  // Applicants
  applicants: Array<{
    firstName: string;
    middleName?: string;
    lastName: string;
    address: {
      streetNumber?: string;
      streetName?: string;
      poBox?: string;
      city: string;
      province: string;
      country: string;
      postalCode: string;
    };
    isIndividual: boolean;
    organizationTitle?: string;
    namedInWill: boolean;
    relationship?: string;
  }>;

  // Other executors not applying
  otherExecutors?: Array<{
    name: string;
    reason: "renounced" | "deceased" | "other";
    otherReason?: string;
  }>;

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
  affidavitsOfDelivery: Array<{
    name: string;
    dateSworn: string;
  }>;
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
  spouse: {
    status: "surviving" | "deceased" | "never_married";
    name?: string;
    survivingName?: string;
  };

  children: Array<{
    name: string;
    status: "surviving" | "deceased";
  }>;

  // Beneficiaries
  beneficiaries: Array<{
    name: string;
    relationship?: string;
    status: "surviving" | "deceased";
  }>;

  // Intestate successors
  intestateSuccessors: Array<{
    name: string;
    relationship: string;
  }>;

  // Creditors
  creditors?: Array<{
    name: string;
  }>;

  // Citors
  citors: string[];

  // Attorney General notice
  attorneyGeneralNotice: boolean;

  // Submission date
  submissionDate: string;

  // Assets and Liabilities
  assets?: {
    realPropertyBC: Array<{
      description: string;
      owners?: string;
      marketValue: number;
      securedDebt?: {
        creditor: string;
        amount: number;
      };
    }>;
    tangiblePersonalPropertyBC: Array<{
      description: string;
      value: number;
      securedDebt?: {
        creditor: string;
        amount: number;
      };
    }>;
    intangibleProperty: Array<{
      description: string;
      value: number;
    }>;
    realPropertyOutsideBC?: Array<{
      description: string;
      value: number;
    }>;
    tangiblePersonalPropertyOutsideBC?: Array<{
      description: string;
      value: number;
    }>;
  };

  // Delivery tracking (for P9)
  deliveries?: Array<{
    recipientName: string;
    deliveryMethod: "mail" | "personal" | "electronic";
    deliveryDate: string;
    onBehalfOf?: {
      name: string;
      capacity: string;
    };
    acknowledgedReceipt?: boolean;
  }>;
  publicGuardianDelivery?: {
    method: "mail" | "personal" | "electronic";
  };
  electronicWillDemanded?: boolean;
  electronicWillProvidedTo?: string[];
}
