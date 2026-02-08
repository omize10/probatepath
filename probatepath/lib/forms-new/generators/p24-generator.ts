/**
 * Form P24 Generator
 * Generates Affidavit in Support of Application for Resealing
 */

import { P24Data } from '../types';
import { generateP24HTML } from '../templates/p24-template';
import { generatePDF } from '../utils/pdf-generator';
import { validateEstateData } from '../utils/formatters';

/**
 * Generate Form P24 as PDF
 */
export async function generateP24(data: P24Data): Promise<Buffer> {
  // Validate data
  const errors = validateEstateData(data);
  if (errors.length > 0) {
    throw new Error(`Validation errors: ${errors.join(', ')}`);
  }

  // Generate HTML
  const html = generateP24HTML(data);

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
 * Generate Form P24 as HTML (for preview/debugging)
 */
export function generateP24Preview(data: P24Data): string {
  const errors = validateEstateData(data);
  if (errors.length > 0) {
    console.warn('Validation warnings:', errors);
  }

  return generateP24HTML(data);
}

export default generateP24;
