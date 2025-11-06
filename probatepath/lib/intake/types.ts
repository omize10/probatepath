export type RelationToDeceased = "spouse" | "child" | "relative" | "friend" | "other";

export type YesNo = "yes" | "no";

export type EstateValueRange = "<$100k" | "$100k-$500k" | "$500k-$1M" | ">$1M";

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
  };
  deceased: {
    fullName: string;
    dateOfDeath: string;
    cityProvince: string;
    hadWill: YesNo;
  };
  will: {
    willLocation: string;
    estateValueRange: EstateValueRange;
    anyRealProperty: YesNo;
    multipleBeneficiaries: YesNo;
    specialCircumstances: string;
  };
  confirmation: {
    confirmed: boolean;
  };
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
    relationToDeceased: "spouse",
  },
  deceased: {
    fullName: "",
    dateOfDeath: "",
    cityProvince: "",
    hadWill: "yes",
  },
  will: {
    willLocation: "",
    estateValueRange: "<$100k",
    anyRealProperty: "no",
    multipleBeneficiaries: "yes",
    specialCircumstances: "",
  },
  confirmation: {
    confirmed: false,
  },
};
