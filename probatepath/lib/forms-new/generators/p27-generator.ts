/**
 * Form P27 Generator
 * Generates Authorization to Obtain Resealing Information
 */

import { P27Data } from '../types';
import { generateP27HTML } from '../templates/p27-template';
import { generatePDF } from '../utils/pdf-generator';
import { validateEstateData } from '../utils/formatters';

/**
 * Generate Form P27 as PDF
 */
export async function generateP27(data: P27Data): Promise<Buffer> {
  // Validate data
  const errors = validateEstateData(data);
  if (errors.length > 0) {
    throw new Error(`Validation errors: ${errors.join(', ')}`);
  }

  // Generate HTML
  const html = generateP27HTML(data);

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
 * Generate Form P27 as HTML (for preview/debugging)
 */
export function generateP27Preview(data: P27Data): string {
  const errors = validateEstateData(data);
  if (errors.length > 0) {
    console.warn('Validation warnings:', errors);
  }

  return generateP27HTML(data);
}

export default generateP27;
