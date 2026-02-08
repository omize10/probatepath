/**
 * Form P10 Generator
 * Generates Affidavit of Assets and Liabilities for Domiciled Estate Grant
 */

import { P10Data } from '../types';
import { generateP10HTML } from '../templates/p10-template';
import { generatePDF } from '../utils/pdf-generator';
import { validateEstateData } from '../utils/formatters';

/**
 * Generate Form P10 as PDF
 */
export async function generateP10(data: P10Data): Promise<Buffer> {
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
  const html = generateP10HTML(data);

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
 * Generate Form P10 as HTML (for preview/debugging)
 */
export function generateP10Preview(data: P10Data): string {
  const errors = validateEstateData(data);
  if (errors.length > 0) {
    console.warn('Validation warnings:', errors);
  }

  return generateP10HTML(data);
}

export default generateP10;
