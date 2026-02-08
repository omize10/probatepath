/**
 * Form P22 Generator
 * Generates Affidavit of Applicant for Resealing of Grant of Probate or Grant of Administration with Will Annexed
 */

import { P22Data } from '../types';
import { generateP22HTML } from '../templates/p22-template';
import { generatePDF } from '../utils/pdf-generator';
import { validateEstateData } from '../utils/formatters';

/**
 * Generate Form P22 as PDF
 */
export async function generateP22(data: P22Data): Promise<Buffer> {
  // Validate data
  const errors = validateEstateData(data);
  if (errors.length > 0) {
    throw new Error(`Validation errors: ${errors.join(', ')}`);
  }

  // Generate HTML
  const html = generateP22HTML(data);

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
 * Generate Form P22 as HTML (for preview/debugging)
 */
export function generateP22Preview(data: P22Data): string {
  const errors = validateEstateData(data);
  if (errors.length > 0) {
    console.warn('Validation warnings:', errors);
  }

  return generateP22HTML(data);
}

export default generateP22;
