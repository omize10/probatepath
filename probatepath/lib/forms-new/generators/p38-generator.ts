/**
 * Form P38 Generator
 * Generates Affidavit in Support of Application to Pass Accounts
 */

import { P38Data } from '../types';
import { generateP38HTML } from '../templates/p38-template';
import { generatePDF } from '../utils/pdf-generator';

/**
 * Generate Form P38 as PDF
 */
export async function generateP38(data: P38Data): Promise<Buffer> {
  // Generate HTML
  const html = generateP38HTML(data);

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
 * Generate Form P38 as HTML (for preview/debugging)
 */
export function generateP38Preview(data: P38Data): string {
  return generateP38HTML(data);
}

export default generateP38;
