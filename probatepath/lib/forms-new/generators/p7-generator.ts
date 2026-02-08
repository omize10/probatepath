/**
 * Form P7 Generator
 * Generates Affidavit of Applicant for Ancillary Grant of Administration without Will Annexed
 * Used for ancillary grants when a foreign grant without will has been obtained
 */

import { P7Data } from '../types';
import { generateP7HTML } from '../templates/p7-template';
import { generatePDF } from '../utils/pdf-generator';
import { validateEstateData } from '../utils/formatters';

/**
 * Generate Form P7 as PDF
 */
export async function generateP7(data: P7Data): Promise<Buffer> {
  // Validate data
  const errors = validateEstateData(data);
  if (errors.length > 0) {
    throw new Error(`Validation errors: ${errors.join(', ')}`);
  }

  // Validate applicant index
  if (data.applicantIndex < 0 || data.applicantIndex >= data.applicants.length) {
    throw new Error('Invalid applicant index');
  }

  // Validate foreign grant exists for P7
  if (!data.foreignGrant) {
    throw new Error('Form P7 requires foreign grant information');
  }

  // Generate HTML
  const html = generateP7HTML(data);

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
 * Generate Form P7 as HTML (for preview/debugging)
 */
export function generateP7Preview(data: P7Data): string {
  const errors = validateEstateData(data);
  if (errors.length > 0) {
    console.warn('Validation warnings:', errors);
  }

  return generateP7HTML(data);
}

export default generateP7;
