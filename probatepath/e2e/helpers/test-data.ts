/** Generate unique test user credentials */
export function generateTestUser() {
  const ts = Date.now();
  return {
    name: `Test User ${ts}`,
    email: `test+${ts}@probatedesk-e2e.test`,
    password: "TestPassword123!",
  };
}

/** Realistic BC probate intake data for form-filling */
export const PROBATE_INTAKE = {
  applicant: {
    firstName: "Jane",
    middleName: "Marie",
    lastName: "Smith",
    email: "jane.smith@example.com",
    phone: "604-555-0101",
    address: {
      street: "123 Main Street",
      city: "Vancouver",
      province: "BC",
      postalCode: "V6A 1A1",
    },
    relationship: "daughter" as const,
    isOnlyApplicant: "yes" as const,
  },
  deceased: {
    firstName: "Robert",
    middleName: "James",
    lastName: "Smith",
    dateOfDeath: "2025-11-15",
    placeOfDeath: "Vancouver, BC",
    dateOfBirth: "1945-03-22",
    lastAddress: {
      street: "456 Oak Avenue",
      city: "Vancouver",
      province: "BC",
      postalCode: "V6B 2B2",
    },
    maritalStatus: "widowed" as const,
  },
  will: {
    hasWill: "yes" as const,
    willDate: "2020-06-15",
    hasOriginal: "yes" as const,
    storageLocation: "Safety deposit box at TD Bank, Vancouver Main Branch",
    executors: [
      { firstName: "Jane", lastName: "Smith", relationship: "Daughter" },
    ],
    hasCodicils: "no" as const,
  },
  family: {
    spouseLiving: "no" as const,
    children: [
      { firstName: "Jane", lastName: "Smith", isMinor: false },
      { firstName: "Michael", lastName: "Smith", isMinor: false },
    ],
  },
  beneficiaries: {
    people: [
      { firstName: "Jane", lastName: "Smith", relationship: "Daughter" },
      { firstName: "Michael", lastName: "Smith", relationship: "Son" },
    ],
    organizations: [],
  },
  assets: {
    realEstate: [
      {
        address: "456 Oak Avenue, Vancouver, BC V6B 2B2",
        estimatedValue: "850000",
        hasMortgage: "no" as const,
      },
    ],
    bankAccounts: [
      { institution: "TD Bank", accountType: "Chequing", estimatedValue: "25000" },
    ],
    estimatedTotal: "900000",
  },
  debts: {
    funeralCosts: "8000",
    otherDebts: [],
  },
  filing: {
    registryId: "vancouver",
  },
};

/** Realistic BC administration (no will) intake data */
export const ADMIN_INTAKE = {
  ...PROBATE_INTAKE,
  will: {
    hasWill: "no" as const,
  },
  beneficiaries: {
    people: [],
    organizations: [],
  },
};
