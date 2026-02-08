/**
 * Formatting utilities for BC Probate Forms
 */

import { Address, Person, GrantType } from '../types';

/**
 * Format date to BC Probate format: dd/mmm/yyyy
 * Example: 15/JAN/2025
 */
export function formatBCDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '';
  
  const day = d.getDate().toString().padStart(2, '0');
  const month = d.toLocaleString('en-US', { month: 'short' }).toUpperCase();
  const year = d.getFullYear();
  
  return `${day}/${month}/${year}`;
}

/**
 * Format full name from parts
 */
export function formatFullName(person: Person): string {
  const parts = [person.firstName, person.middleName, person.lastName].filter(Boolean);
  return parts.join(' ');
}

/**
 * Format full name in ALL CAPS
 */
export function formatFullNameCaps(person: Person): string {
  return formatFullName(person).toUpperCase();
}

/**
 * Format address for display
 */
export function formatAddress(address: Address): string {
  const parts: string[] = [];
  
  if (address.poBox) {
    parts.push(`P.O. Box ${address.poBox}`);
  } else {
    const streetParts = [address.streetNumber, address.streetName].filter(Boolean);
    if (streetParts.length > 0) {
      parts.push(streetParts.join(' '));
    }
  }
  
  parts.push(address.city);
  parts.push(address.province);
  parts.push(address.country);
  parts.push(address.postalCode);
  
  return parts.filter(Boolean).join(', ');
}

/**
 * Format address as multi-line for forms
 */
export function formatAddressMultiline(address: Address): string[] {
  const lines: string[] = [];
  
  if (address.poBox) {
    lines.push(`P.O. Box ${address.poBox}`);
  } else {
    const streetParts = [address.streetNumber, address.streetName].filter(Boolean);
    if (streetParts.length > 0) {
      lines.push(streetParts.join(' '));
    }
  }
  
  lines.push(`${address.city}, ${address.province}`);
  lines.push(`${address.country}, ${address.postalCode}`);
  
  return lines;
}

/**
 * Get grant type display text for forms
 */
export function getGrantTypeText(grantType: GrantType): string {
  const map: Record<GrantType, string> = {
    probate: "a grant of probate",
    admin_with_will: "a grant of administration with will annexed",
    admin_without_will: "a grant of administration without will annexed",
    ancillary_probate: "an ancillary grant of probate",
    ancillary_admin_with_will: "an ancillary grant of administration with will annexed",
    ancillary_admin_without_will: "an ancillary grant of administration without will annexed",
    resealing: "the resealing of a foreign grant",
  };
  return map[grantType] || "";
}

/**
 * Check if grant type involves a will
 */
export function grantTypeHasWill(grantType: GrantType): boolean {
  return [
    "probate",
    "admin_with_will",
    "ancillary_probate",
    "ancillary_admin_with_will",
  ].includes(grantType);
}

/**
 * Check if grant type is ancillary
 */
export function isAncillaryGrant(grantType: GrantType): boolean {
  return grantType.startsWith("ancillary_") || grantType === "resealing";
}

/**
 * Format currency for P10/P11
 */
export function formatCurrency(amount: number): string {
  return `$${amount.toLocaleString('en-CA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/**
 * Create underline of specified length
 */
export function underline(length: number = 40): string {
  return '_'.repeat(length);
}

/**
 * Create dotted line of specified length
 */
export function dottedLine(length: number = 40): string {
  return '.'.repeat(length);
}

/**
 * Format checkbox - checked or unchecked
 */
export function checkbox(checked: boolean): string {
  return checked ? '[X]' : '[  ]';
}

/**
 * Format applicant names as list for P1
 */
export function formatApplicantNames(applicants: Person[]): string {
  if (applicants.length === 0) return '';
  if (applicants.length === 1) return formatFullName(applicants[0]);
  
  const names = applicants.map(formatFullName);
  if (names.length === 2) {
    return names.join(' and ');
  }
  return names.slice(0, -1).join(', ') + ' and ' + names[names.length - 1];
}

/**
 * Get ordinal suffix for affidavit number
 */
export function getOrdinal(n: number): string {
  const suffixes = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (suffixes[(v - 20) % 10] || suffixes[v] || suffixes[0]);
}

/**
 * Validate that data has required fields
 */
export function validateEstateData(data: any): string[] {
  const errors: string[] = [];
  
  if (!data.deceased?.firstName) errors.push('Missing deceased first name');
  if (!data.deceased?.lastName) errors.push('Missing deceased last name');
  if (!data.deceased?.dateOfDeath) errors.push('Missing date of death');
  if (!data.applicants?.length) errors.push('Missing applicants');
  if (!data.registry) errors.push('Missing registry');
  
  return errors;
}
