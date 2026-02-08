/**
 * Form P42 Generator
 * Generates Notice of Application (Spousal Home or Deficiencies in Will)
 */

import { P42Data } from '../types';
import { generateP42HTML } from '../templates/p42-template';
import { generatePDF } from '../utils/pdf-generator';

/**
 * Generate Form P42 as PDF
 */
export async function generateP42(data: P42Data): Promise<Buffer> {
  // Generate HTML
  const html = generateP42HTML(data);

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
 * Generate Form P42 as HTML (for preview/debugging)
 */
export function generateP42Preview(data: P42Data): string {
  return generateP42HTML(data);
}

export default generateP42;
