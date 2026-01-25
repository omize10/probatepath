/**
 * BC Probate Fee Calculator
 * Based on BC probate fee schedule
 *
 * Fee schedule (as of 2024):
 * - $0 - $25,000: No fee ($0)
 * - $25,001 - $50,000: $208
 * - $50,001 - $300,000: $208 + $6 per $1,000 over $50,000
 * - Over $300,000: $1,708 + $14 per $1,000 over $300,000
 *
 * Note: This is for the gross value of the estate in BC.
 * Joint assets, life insurance with named beneficiaries, and
 * assets with right of survivorship may not be included.
 */

export interface ProbateFeeBreakdown {
  grossValue: number;
  fee: number;
  tier: "zero" | "flat" | "mid" | "high";
  tierDescription: string;
}

/**
 * Calculate BC probate filing fee based on gross estate value
 */
export function calculateProbateFee(grossValue: number): ProbateFeeBreakdown {
  if (grossValue <= 0) {
    return {
      grossValue: 0,
      fee: 0,
      tier: "zero",
      tierDescription: "No probate fee applies",
    };
  }

  // Under $25,000: No fee
  if (grossValue <= 25000) {
    return {
      grossValue,
      fee: 0,
      tier: "zero",
      tierDescription: "Estates under $25,000 - no fee",
    };
  }

  // $25,001 - $50,000: Flat $208
  if (grossValue <= 50000) {
    return {
      grossValue,
      fee: 208,
      tier: "flat",
      tierDescription: "$25,001 - $50,000 - flat fee",
    };
  }

  // $50,001 - $300,000: $208 + $6 per $1,000 over $50,000
  if (grossValue <= 300000) {
    const overAmount = grossValue - 50000;
    const additionalFee = Math.ceil(overAmount / 1000) * 6;
    return {
      grossValue,
      fee: 208 + additionalFee,
      tier: "mid",
      tierDescription: "$50,001 - $300,000 - $6 per $1,000 over $50,000",
    };
  }

  // Over $300,000: $1,708 + $14 per $1,000 over $300,000
  const overAmount = grossValue - 300000;
  const additionalFee = Math.ceil(overAmount / 1000) * 14;
  return {
    grossValue,
    fee: 1708 + additionalFee,
    tier: "high",
    tierDescription: "Over $300,000 - $14 per $1,000 over $300,000",
  };
}

/**
 * Format currency for display
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Parse a currency string to a number
 * Handles formats like "$1,234", "1234", "$1234.56"
 */
export function parseCurrency(value: string): number {
  if (!value) return 0;
  // Remove currency symbols, commas, and other non-numeric characters except decimal point
  const cleaned = value.replace(/[^0-9.-]/g, "");
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Calculate total estate value from intake assets
 */
export interface EstateAssets {
  bcProperties: Array<{
    estimatedValue: string;
    mortgageBalance: string;
  }>;
  accounts: Array<{
    approxBalance: string;
    ownership: string;
  }>;
  vehicles: Array<{
    approxValue: string;
  }>;
  valuableItems: Array<{
    approxValue: string;
  }>;
}

export interface EstateValueBreakdown {
  realEstate: number;
  accounts: number;
  vehicles: number;
  valuables: number;
  totalGross: number;
  totalNet: number; // After deducting mortgages for real estate
}

export function calculateEstateValue(assets: EstateAssets): EstateValueBreakdown {
  // Real estate (gross value, not net of mortgage for fee calculation)
  let realEstate = 0;
  let mortgages = 0;
  for (const property of assets.bcProperties) {
    realEstate += parseCurrency(property.estimatedValue);
    mortgages += parseCurrency(property.mortgageBalance);
  }

  // Bank and investment accounts (sole ownership only for probate)
  let accounts = 0;
  for (const account of assets.accounts) {
    // Only count sole ownership accounts for probate value
    if (account.ownership !== "joint") {
      accounts += parseCurrency(account.approxBalance);
    }
  }

  // Vehicles
  let vehicles = 0;
  for (const vehicle of assets.vehicles) {
    vehicles += parseCurrency(vehicle.approxValue);
  }

  // Valuable items
  let valuables = 0;
  for (const item of assets.valuableItems) {
    valuables += parseCurrency(item.approxValue);
  }

  const totalGross = realEstate + accounts + vehicles + valuables;
  const totalNet = totalGross - mortgages;

  return {
    realEstate,
    accounts,
    vehicles,
    valuables,
    totalGross,
    totalNet,
  };
}
