/**
 * Form P3 Generator
 * Generates Affidavit of Applicant for Grant of Probate or Grant of Administration with Will Annexed (Short Form)
 */

import { P3Data } from '../types';
import { generateP3HTML } from '../templates/p3-template';
import { generatePDF } from '../utils/pdf-generator';
import { validateEstateData } from '../utils/formatters';

/**
 * Generate Form P3 as PDF
 */
export async function generateP3(data: P3Data): Promise<Buffer> {
  // Validate data
  const errors = validateEstateData(data);
  if (errors.length > 0) {
    throw new Error(`Validation errors: ${errors.join(', ')}`);
  }

  // Validate applicant index
  if (data.applicantIndex < 0 || data.applicantIndex >= data.applicants.length) {
    throw new Error('Invalid applicant index');
  }

  // Generate HTML
  const html = generateP3HTML(data);

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
 * Generate Form P3 as HTML (for preview/debugging)
 */
export function generateP3Preview(data: P3Data): string {
  const errors = validateEstateData(data);
  if (errors.length > 0) {
    console.warn('Validation warnings:', errors);
  }

  return generateP3HTML(data);
}

export default generateP3;
