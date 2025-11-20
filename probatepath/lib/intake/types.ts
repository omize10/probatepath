export type RelationToDeceased = "partner" | "child" | "relative" | "friend" | "other";

export type YesNo = "yes" | "no";

export type EstateValueRange = "<$100k" | "$100k-$500k" | "$500k-$1M" | ">$1M";

import { emptyEstateIntake, type EstateIntake } from "@/lib/intake/case-blueprint";

export type IntakeDraft = {
  welcome: {
    email: string;
    consent: boolean;
  };
  executor: {
    fullName: string;
    email: string;
    phone: string;
    city: string;
    relationToDeceased: RelationToDeceased;
    addressLine1: string;
    addressLine2: string;
    province: string;
    postalCode: string;
    preferredPronouns: string;
    communicationPreference: "email" | "phone" | "either";
    availabilityWindow: string;
    timeZone: string;
    employer: string;
    supportContacts: string;
    emergencyContactName: string;
    emergencyContactPhone: string;
    alternateExecutor: YesNo;
    alternateExecutorDetails: string;
  };
  deceased: {
    fullName: string;
    firstName: string;
    middleName1: string;
    middleName2: string;
    middleName3: string;
    lastName: string;
    suffix: string;
    dateOfDeath: string;
    cityProvince: string;
    hadWill: YesNo;
    birthDate: string;
    placeOfBirth: string;
    maritalStatus: string;
    occupation: string;
    residenceAddress: string;
    residenceLine1: string;
    residenceLine2: string;
    residenceCity: string;
    residenceRegion: string;
    residencePostalCode: string;
    residenceCountry: string;
    residenceType: string;
    yearsLivedInBC: string;
    hadPriorUnions: YesNo;
    childrenCount: string;
    assetsOutsideCanada: YesNo;
    assetsOutsideDetails: string;
    digitalEstateNotes: string;
  };
  will: {
    willLocation: string;
    estateValueRange: EstateValueRange;
    anyRealProperty: YesNo;
    multipleBeneficiaries: YesNo;
    specialCircumstances: string;
    hasCodicils: YesNo;
    codicilDetails: string;
    notaryNeeded: YesNo;
    probateRegistry: string;
    expectedFilingDate: string;
    physicalWillDate: string;
    electronicWillDate: string;
    realPropertyDetails: string;
    liabilities: string;
    bankAccounts: string;
    investmentAccounts: string;
    insurancePolicies: string;
    businessInterests: string;
    charitableGifts: string;
    digitalAssets: string;
    documentDeliveryPreference: string;
    specialRequests: string;
  };
  confirmation: {
    confirmed: boolean;
  };
  estateIntake: EstateIntake;
};

export const defaultIntakeDraft: IntakeDraft = {
  welcome: {
    email: "",
    consent: false,
  },
  executor: {
    fullName: "",
    email: "",
    phone: "",
    city: "",
    relationToDeceased: "partner",
    addressLine1: "",
    addressLine2: "",
    province: "",
    postalCode: "",
    preferredPronouns: "",
    communicationPreference: "email",
    availabilityWindow: "",
    timeZone: "",
    employer: "",
    supportContacts: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
    alternateExecutor: "no",
    alternateExecutorDetails: "",
  },
  deceased: {
    fullName: "",
    firstName: "",
    middleName1: "",
    middleName2: "",
    middleName3: "",
    lastName: "",
    suffix: "",
    dateOfDeath: "",
    cityProvince: "",
    hadWill: "yes",
    birthDate: "",
    placeOfBirth: "",
    maritalStatus: "",
    occupation: "",
    residenceAddress: "",
    residenceLine1: "",
    residenceLine2: "",
    residenceCity: "",
    residenceRegion: "",
    residencePostalCode: "",
    residenceCountry: "Canada",
    residenceType: "",
    yearsLivedInBC: "",
    hadPriorUnions: "no",
    childrenCount: "",
    assetsOutsideCanada: "no",
    assetsOutsideDetails: "",
    digitalEstateNotes: "",
  },
  will: {
    willLocation: "",
    estateValueRange: "<$100k",
    anyRealProperty: "no",
    multipleBeneficiaries: "yes",
    specialCircumstances: "",
    hasCodicils: "no",
    codicilDetails: "",
    notaryNeeded: "yes",
    probateRegistry: "",
    expectedFilingDate: "",
    physicalWillDate: "",
    electronicWillDate: "",
    realPropertyDetails: "",
    liabilities: "",
    bankAccounts: "",
    investmentAccounts: "",
    insurancePolicies: "",
    businessInterests: "",
    charitableGifts: "",
    digitalAssets: "",
    documentDeliveryPreference: "",
    specialRequests: "",
  },
  confirmation: {
    confirmed: false,
  },
  estateIntake: emptyEstateIntake,
};
