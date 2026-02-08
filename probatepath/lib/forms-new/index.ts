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
// Core Forms (P1-P10)
export { generateP1, generateP1Preview } from './generators/p1-generator';
export { generateP2, generateP2Preview } from './generators/p2-generator';
export { generateP3, generateP3Preview } from './generators/p3-generator';
export { generateP4, generateP4Preview } from './generators/p4-generator';
export { generateP5, generateP5Preview } from './generators/p5-generator';
export { generateP6, generateP6Preview } from './generators/p6-generator';
export { generateP7, generateP7Preview } from './generators/p7-generator';
export { generateP8, generateP8Preview } from './generators/p8-generator';
export { generateP9, generateP9Preview } from './generators/p9-generator';
export { generateP10, generateP10Preview } from './generators/p10-generator';
export { generateP11, generateP11Preview } from './generators/p11-generator';
export { generateP12, generateP12Preview } from './generators/p12-generator';
export { generateP13, generateP13Preview } from './generators/p13-generator';
export { generateP14, generateP14Preview } from './generators/p14-generator';
export { generateP15, generateP15Preview } from './generators/p15-generator';
export { generateP16, generateP16Preview } from './generators/p16-generator';

// P17-P25 Generators (Resealing and Related Forms)
export { generateP17, generateP17Preview } from './generators/p17-generator';
export { generateP18, generateP18Preview } from './generators/p18-generator';
export { generateP19, generateP19Preview } from './generators/p19-generator';
export { generateP20, generateP20Preview } from './generators/p20-generator';
export { generateP20_1, generateP20_1Preview } from './generators/p20-1-generator';
export { generateP21, generateP21Preview } from './generators/p21-generator';
export { generateP22, generateP22Preview } from './generators/p22-generator';
export { generateP23, generateP23Preview } from './generators/p23-generator';
export { generateP24, generateP24Preview } from './generators/p24-generator';
export { generateP25, generateP25Preview } from './generators/p25-generator';

// P26-P35 Generators
export { generateP26, generateP26Preview } from './generators/p26-generator';
export { generateP27, generateP27Preview } from './generators/p27-generator';
export { generateP28, generateP28Preview } from './generators/p28-generator';
export { generateP29, generateP29Preview } from './generators/p29-generator';
export { generateP30, generateP30Preview } from './generators/p30-generator';
export { generateP31, generateP31Preview } from './generators/p31-generator';
export { generateP32, generateP32Preview } from './generators/p32-generator';
export { generateP33, generateP33Preview } from './generators/p33-generator';
export { generateP34, generateP34Preview } from './generators/p34-generator';
export { generateP35, generateP35Preview } from './generators/p35-generator';

// P36-P46 Generators
export { generateP36, generateP36Preview } from './generators/p36-generator';
export { generateP37, generateP37Preview } from './generators/p37-generator';
export { generateP38, generateP38Preview } from './generators/p38-generator';
export { generateP39, generateP39Preview } from './generators/p39-generator';
export { generateP40, generateP40Preview } from './generators/p40-generator';
export { generateP41, generateP41Preview } from './generators/p41-generator';
export { generateP42, generateP42Preview } from './generators/p42-generator';
export { generateP43, generateP43Preview } from './generators/p43-generator';
export { generateP44, generateP44Preview } from './generators/p44-generator';
export { generateP45, generateP45Preview } from './generators/p45-generator';
export { generateP46, generateP46Preview } from './generators/p46-generator';

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
