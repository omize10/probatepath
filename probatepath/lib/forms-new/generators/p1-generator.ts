/**
 * Form P1 Generator
 * Generates Notice of Proposed Application in Relation to Estate
 */

import { P1Data } from '../types';
import { generateP1HTML } from '../templates/p1-template';
import { generatePDF } from '../utils/pdf-generator';
import { validateEstateData } from '../utils/formatters';

/**
 * Generate Form P1 as PDF
 */
export async function generateP1(data: P1Data): Promise<Buffer> {
  // Validate data
  const errors = validateEstateData(data);
  if (errors.length > 0) {
    throw new Error(`Validation errors: ${errors.join(', ')}`);
  }

  // Generate HTML
  const html = generateP1HTML(data);

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
 * Generate Form P1 as HTML (for preview/debugging)
 */
export function generateP1Preview(data: P1Data): string {
  const errors = validateEstateData(data);
  if (errors.length > 0) {
    console.warn('Validation warnings:', errors);
  }

  return generateP1HTML(data);
}

export default generateP1;
