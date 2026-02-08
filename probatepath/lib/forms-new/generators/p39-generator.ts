/**
 * Form P39 Generator
 * Generates Certificate
 */

import { P39Data } from '../types';
import { generateP39HTML } from '../templates/p39-template';
import { generatePDF } from '../utils/pdf-generator';

/**
 * Generate Form P39 as PDF
 */
export async function generateP39(data: P39Data): Promise<Buffer> {
  // Generate HTML
  const html = generateP39HTML(data);

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
 * Generate Form P39 as HTML (for preview/debugging)
 */
export function generateP39Preview(data: P39Data): string {
  return generateP39HTML(data);
}

export default generateP39;
