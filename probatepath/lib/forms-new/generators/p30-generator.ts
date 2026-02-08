/**
 * Form P30 Generator
 * Generates Withdrawal of Notice of Dispute
 */

import { P30Data } from '../types';
import { generateP30HTML } from '../templates/p30-template';
import { generatePDF } from '../utils/pdf-generator';
import { validateEstateData } from '../utils/formatters';

/**
 * Generate Form P30 as PDF
 */
export async function generateP30(data: P30Data): Promise<Buffer> {
  // Validate data
  const errors = validateEstateData(data);
  if (errors.length > 0) {
    throw new Error(`Validation errors: ${errors.join(', ')}`);
  }

  // Generate HTML
  const html = generateP30HTML(data);

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
 * Generate Form P30 as HTML (for preview/debugging)
 */
export function generateP30Preview(data: P30Data): string {
  const errors = validateEstateData(data);
  if (errors.length > 0) {
    console.warn('Validation warnings:', errors);
  }

  return generateP30HTML(data);
}

export default generateP30;
