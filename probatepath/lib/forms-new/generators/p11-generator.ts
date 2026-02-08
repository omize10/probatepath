/**
 * Form P11 Generator
 * Generates Affidavit of Assets and Liabilities for Non-Domiciled Estate Grant
 */

import { P11Data } from '../types';
import { generateP11HTML } from '../templates/p11-template';
import { generatePDF } from '../utils/pdf-generator';
import { validateEstateData } from '../utils/formatters';

/**
 * Generate Form P11 as PDF
 */
export async function generateP11(data: P11Data): Promise<Buffer> {
  // Validate data
  const errors = validateEstateData(data);
  if (errors.length > 0) {
    throw new Error(`Validation errors: ${errors.join(', ')}`);
  }

  // Generate HTML
  const html = generateP11HTML(data);

  // Generate PDF
  const pdf = await generatePDF(html, {
    width: '8.5in',
    height: '11in',
    margin: {
      top: '0.5in',
      right: '0.75in',
      bottom: '0.5in',
      left: '0.75in',
    },
  });

  return pdf;
}

/**
 * Generate Form P11 as HTML (for preview/debugging)
 */
export function generateP11Preview(data: P11Data): string {
  const errors = validateEstateData(data);
  if (errors.length > 0) {
    console.warn('Validation warnings:', errors);
  }

  return generateP11HTML(data);
}

export default generateP11;
