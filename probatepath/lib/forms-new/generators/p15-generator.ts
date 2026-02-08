/**
 * Form P15 Generator
 * Generates Supplemental Affidavit of Assets and Liabilities for Non-Domiciled Estate Grant
 */

import { P15Data } from '../types';
import { generateP15HTML } from '../templates/p15-template';
import { generatePDF } from '../utils/pdf-generator';
import { validateEstateData } from '../utils/formatters';

/**
 * Generate Form P15 as PDF
 */
export async function generateP15(data: P15Data): Promise<Buffer> {
  // Validate data
  const errors = validateEstateData(data);
  if (errors.length > 0) {
    throw new Error(`Validation errors: ${errors.join(', ')}`);
  }

  // Generate HTML
  const html = generateP15HTML(data);

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
 * Generate Form P15 as HTML (for preview/debugging)
 */
export function generateP15Preview(data: P15Data): string {
  const errors = validateEstateData(data);
  if (errors.length > 0) {
    console.warn('Validation warnings:', errors);
  }

  return generateP15HTML(data);
}

export default generateP15;
