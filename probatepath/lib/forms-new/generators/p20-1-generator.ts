/**
 * Form P20.1 Generator
 * Generates Correction Record for Style of Proceeding
 */

import { P20_1Data } from '../types';
import { generateP20_1HTML } from '../templates/p20-1-template';
import { generatePDF } from '../utils/pdf-generator';
import { validateEstateData } from '../utils/formatters';

/**
 * Generate Form P20.1 as PDF
 */
export async function generateP20_1(data: P20_1Data): Promise<Buffer> {
  // Validate data
  const errors = validateEstateData(data);
  if (errors.length > 0) {
    throw new Error(`Validation errors: ${errors.join(', ')}`);
  }

  // Generate HTML
  const html = generateP20_1HTML(data);

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
 * Generate Form P20.1 as HTML (for preview/debugging)
 */
export function generateP20_1Preview(data: P20_1Data): string {
  const errors = validateEstateData(data);
  if (errors.length > 0) {
    console.warn('Validation warnings:', errors);
  }

  return generateP20_1HTML(data);
}

export default generateP20_1;
