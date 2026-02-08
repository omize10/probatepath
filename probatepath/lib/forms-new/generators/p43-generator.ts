/**
 * Form P43 Generator
 * Generates Petition to the Court — Estate Proceedings
 */

import { P43Data } from '../types';
import { generateP43HTML } from '../templates/p43-template';
import { generatePDF } from '../utils/pdf-generator';

/**
 * Generate Form P43 as PDF
 */
export async function generateP43(data: P43Data): Promise<Buffer> {
  // Generate HTML
  const html = generateP43HTML(data);

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
 * Generate Form P43 as HTML (for preview/debugging)
 */
export function generateP43Preview(data: P43Data): string {
  return generateP43HTML(data);
}

export default generateP43;
