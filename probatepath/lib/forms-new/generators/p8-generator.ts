/**
 * Form P8 Generator
 * Generates Affidavit in Support of Application for Estate Grant
 * Used when there are multiple applicants and additional affidavits are required
 */

import { P8Data } from '../types';
import { generateP8HTML } from '../templates/p8-template';
import { generatePDF } from '../utils/pdf-generator';
import { validateEstateData } from '../utils/formatters';

/**
 * Generate Form P8 as PDF
 */
export async function generateP8(data: P8Data): Promise<Buffer> {
  // Validate data
  const errors = validateEstateData(data);
  if (errors.length > 0) {
    throw new Error(`Validation errors: ${errors.join(', ')}`);
  }

  // Validate applicant index
  if (data.applicantIndex < 0 || data.applicantIndex >= data.applicants.length) {
    throw new Error('Invalid applicant index');
  }

  // Validate primary affidavit info exists
  if (!data.primaryAffidavit) {
    throw new Error('Form P8 requires primary affidavit information');
  }

  // Generate HTML
  const html = generateP8HTML(data);

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
 * Generate Form P8 as HTML (for preview/debugging)
 */
export function generateP8Preview(data: P8Data): string {
  const errors = validateEstateData(data);
  if (errors.length > 0) {
    console.warn('Validation warnings:', errors);
  }

  return generateP8HTML(data);
}

export default generateP8;
