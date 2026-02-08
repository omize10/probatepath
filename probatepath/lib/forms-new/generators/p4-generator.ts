/**
 * Form P4 Generator
 * Generates Affidavit of Applicant for Grant of Probate or Grant of Administration with Will Annexed (Long Form)
 * Used when short form (P3) cannot be used
 */

import { P4Data } from '../types';
import { generateP4HTML } from '../templates/p4-template';
import { generatePDF } from '../utils/pdf-generator';
import { validateEstateData } from '../utils/formatters';

/**
 * Generate Form P4 as PDF
 */
export async function generateP4(data: P4Data): Promise<Buffer> {
  // Validate data
  const errors = validateEstateData(data);
  if (errors.length > 0) {
    throw new Error(`Validation errors: ${errors.join(', ')}`);
  }

  // Validate applicant index
  if (data.applicantIndex < 0 || data.applicantIndex >= data.applicants.length) {
    throw new Error('Invalid applicant index');
  }

  // Validate will exists for P4
  if (!data.will || !data.will.exists) {
    throw new Error('Form P4 requires a will to exist');
  }

  // Generate HTML
  const html = generateP4HTML(data);

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
 * Generate Form P4 as HTML (for preview/debugging)
 */
export function generateP4Preview(data: P4Data): string {
  const errors = validateEstateData(data);
  if (errors.length > 0) {
    console.warn('Validation warnings:', errors);
  }

  return generateP4HTML(data);
}

export default generateP4;
