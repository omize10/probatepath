/**
 * Form P36 Generator
 * Generates Warrant After Subpoena
 */

import { P36Data } from '../types';
import { generateP36HTML } from '../templates/p36-template';
import { generatePDF } from '../utils/pdf-generator';

/**
 * Generate Form P36 as PDF
 */
export async function generateP36(data: P36Data): Promise<Buffer> {
  // Generate HTML
  const html = generateP36HTML(data);

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
 * Generate Form P36 as HTML (for preview/debugging)
 */
export function generateP36Preview(data: P36Data): string {
  return generateP36HTML(data);
}

export default generateP36;
