/**
 * BC Probate Forms Generation Library
 * 
 * This library provides pixel-perfect generation of BC Supreme Court
 * probate forms (P1-P46) as PDF documents.
 * 
 * Usage:
 *   import { generateP1, generateP2, EstateData } from '@/lib/forms-new';
 *   
 *   const pdf = await generateP1(data);
 *   // pdf is a Buffer containing the PDF
 */

// Types
export * from './types';

// Generators
export { generateP1, generateP1Preview } from './generators/p1-generator';
export { generateP2, generateP2Preview } from './generators/p2-generator';
export { generateP3, generateP3Preview } from './generators/p3-generator';
export { generateP5, generateP5Preview } from './generators/p5-generator';
export { generateP9, generateP9Preview } from './generators/p9-generator';
export { generateP10, generateP10Preview } from './generators/p10-generator';

// Utilities
export {
  formatBCDate,
  formatFullName,
  formatFullNameCaps,
  formatAddress,
  formatAddressMultiline,
  getGrantTypeText,
  grantTypeHasWill,
  isAncillaryGrant,
  formatCurrency,
  checkbox,
  formatApplicantNames,
  getOrdinal,
  validateEstateData,
} from './utils/formatters';

export { generatePDF, generatePDFWithHeaderFooter, mergePDFs } from './utils/pdf-generator';
