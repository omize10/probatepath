/**
 * Form P40 Generator
 * Generates Statement of Account Affidavit
 */

import { P40Data } from '../types';
import { generateP40HTML } from '../templates/p40-template';
import { generatePDF } from '../utils/pdf-generator';

/**
 * Generate Form P40 as PDF
 */
export async function generateP40(data: P40Data): Promise<Buffer> {
  // Generate HTML
  const html = generateP40HTML(data);

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
 * Generate Form P40 as HTML (for preview/debugging)
 */
export function generateP40Preview(data: P40Data): string {
  return generateP40HTML(data);
}

export default generateP40;
