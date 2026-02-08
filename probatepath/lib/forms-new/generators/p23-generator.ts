/**
 * Form P23 Generator
 * Generates Affidavit of Applicant for Resealing of Grant of Administration without Will Annexed
 */

import { P23Data } from '../types';
import { generateP23HTML } from '../templates/p23-template';
import { generatePDF } from '../utils/pdf-generator';
import { validateEstateData } from '../utils/formatters';

/**
 * Generate Form P23 as PDF
 */
export async function generateP23(data: P23Data): Promise<Buffer> {
  // Validate data
  const errors = validateEstateData(data);
  if (errors.length > 0) {
    throw new Error(`Validation errors: ${errors.join(', ')}`);
  }

  // Generate HTML
  const html = generateP23HTML(data);

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
 * Generate Form P23 as HTML (for preview/debugging)
 */
export function generateP23Preview(data: P23Data): string {
  const errors = validateEstateData(data);
  if (errors.length > 0) {
    console.warn('Validation warnings:', errors);
  }

  return generateP23HTML(data);
}

export default generateP23;
