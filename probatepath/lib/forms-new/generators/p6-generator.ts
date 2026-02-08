/**
 * Form P6 Generator
 * Generates Affidavit of Applicant for Ancillary Grant of Probate or Ancillary Grant of Administration with Will Annexed
 * Used for ancillary grants when a foreign grant with will has been obtained
 */

import { P6Data } from '../types';
import { generateP6HTML } from '../templates/p6-template';
import { generatePDF } from '../utils/pdf-generator';
import { validateEstateData } from '../utils/formatters';

/**
 * Generate Form P6 as PDF
 */
export async function generateP6(data: P6Data): Promise<Buffer> {
  // Validate data
  const errors = validateEstateData(data);
  if (errors.length > 0) {
    throw new Error(`Validation errors: ${errors.join(', ')}`);
  }

  // Validate applicant index
  if (data.applicantIndex < 0 || data.applicantIndex >= data.applicants.length) {
    throw new Error('Invalid applicant index');
  }

  // Validate foreign grant exists for P6
  if (!data.foreignGrant) {
    throw new Error('Form P6 requires foreign grant information');
  }

  // Generate HTML
  const html = generateP6HTML(data);

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
 * Generate Form P6 as HTML (for preview/debugging)
 */
export function generateP6Preview(data: P6Data): string {
  const errors = validateEstateData(data);
  if (errors.length > 0) {
    console.warn('Validation warnings:', errors);
  }

  return generateP6HTML(data);
}

export default generateP6;
