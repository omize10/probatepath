/**
 * Form P37 Generator
 * Generates Subpoena
 */

import { P37Data } from '../types';
import { generateP37HTML } from '../templates/p37-template';
import { generatePDF } from '../utils/pdf-generator';

/**
 * Generate Form P37 as PDF
 */
export async function generateP37(data: P37Data): Promise<Buffer> {
  // Generate HTML
  const html = generateP37HTML(data);

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
 * Generate Form P37 as HTML (for preview/debugging)
 */
export function generateP37Preview(data: P37Data): string {
  return generateP37HTML(data);
}

export default generateP37;
