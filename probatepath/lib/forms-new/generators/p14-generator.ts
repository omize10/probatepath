/**
 * Form P14 Generator
 * Generates Supplemental Affidavit of Assets and Liabilities for Domiciled Estate Grant
 */

import { P14Data } from '../types';
import { generateP14HTML } from '../templates/p14-template';
import { generatePDF } from '../utils/pdf-generator';
import { validateEstateData } from '../utils/formatters';

/**
 * Generate Form P14 as PDF
 */
export async function generateP14(data: P14Data): Promise<Buffer> {
  // Validate data
  const errors = validateEstateData(data);
  if (errors.length > 0) {
    throw new Error(`Validation errors: ${errors.join(', ')}`);
  }

  // Generate HTML
  const html = generateP14HTML(data);

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
 * Generate Form P14 as HTML (for preview/debugging)
 */
export function generateP14Preview(data: P14Data): string {
  const errors = validateEstateData(data);
  if (errors.length > 0) {
    console.warn('Validation warnings:', errors);
  }

  return generateP14HTML(data);
}

export default generateP14;
