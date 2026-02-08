/**
 * Form P44 Generator
 * Generates Notice of Withdrawal of Application
 */

import { P44Data } from '../types';
import { generateP44HTML } from '../templates/p44-template';
import { generatePDF } from '../utils/pdf-generator';

/**
 * Generate Form P44 as PDF
 */
export async function generateP44(data: P44Data): Promise<Buffer> {
  // Generate HTML
  const html = generateP44HTML(data);

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
 * Generate Form P44 as HTML (for preview/debugging)
 */
export function generateP44Preview(data: P44Data): string {
  return generateP44HTML(data);
}

export default generateP44;
