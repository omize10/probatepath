/**
 * Form P25 Generator
 * Generates Affidavit of Assets and Liabilities for Resealing
 */

import { P25Data } from '../types';
import { generateP25HTML } from '../templates/p25-template';
import { generatePDF } from '../utils/pdf-generator';
import { validateEstateData } from '../utils/formatters';

/**
 * Generate Form P25 as PDF
 */
export async function generateP25(data: P25Data): Promise<Buffer> {
  // Validate data
  const errors = validateEstateData(data);
  if (errors.length > 0) {
    throw new Error(`Validation errors: ${errors.join(', ')}`);
  }

  // Generate HTML
  const html = generateP25HTML(data);

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
 * Generate Form P25 as HTML (for preview/debugging)
 */
export function generateP25Preview(data: P25Data): string {
  const errors = validateEstateData(data);
  if (errors.length > 0) {
    console.warn('Validation warnings:', errors);
  }

  return generateP25HTML(data);
}

export default generateP25;
