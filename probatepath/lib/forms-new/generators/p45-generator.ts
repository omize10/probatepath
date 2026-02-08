/**
 * Form P45 Generator
 * Generates Affidavit of Electronic Will
 */

import { P45Data } from '../types';
import { generateP45HTML } from '../templates/p45-template';
import { generatePDF } from '../utils/pdf-generator';

/**
 * Generate Form P45 as PDF
 */
export async function generateP45(data: P45Data): Promise<Buffer> {
  // Generate HTML
  const html = generateP45HTML(data);

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
 * Generate Form P45 as HTML (for preview/debugging)
 */
export function generateP45Preview(data: P45Data): string {
  return generateP45HTML(data);
}

export default generateP45;
