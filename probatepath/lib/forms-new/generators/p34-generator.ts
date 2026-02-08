/**
 * Form P34 Generator
 * Generates Affidavit of Deemed Renunciation
 */

import { P34Data } from '../types';
import { generateP34HTML } from '../templates/p34-template';
import { generatePDF } from '../utils/pdf-generator';
import { validateEstateData } from '../utils/formatters';

/**
 * Generate Form P34 as PDF
 */
export async function generateP34(data: P34Data): Promise<Buffer> {
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
  const html = generateP34HTML(data);

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
 * Generate Form P34 as HTML (for preview/debugging)
 */
export function generateP34Preview(data: P34Data): string {
  const errors = validateEstateData(data);
  if (errors.length > 0) {
    console.warn('Validation warnings:', errors);
  }

  return generateP34HTML(data);
}

export default generateP34;
