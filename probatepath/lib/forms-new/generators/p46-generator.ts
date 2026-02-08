/**
 * Form P46 Generator
 * Generates Demand for Electronic Will
 */

import { P46Data } from '../types';
import { generateP46HTML } from '../templates/p46-template';
import { generatePDF } from '../utils/pdf-generator';

/**
 * Generate Form P46 as PDF
 */
export async function generateP46(data: P46Data): Promise<Buffer> {
  // Generate HTML
  const html = generateP46HTML(data);

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
 * Generate Form P46 as HTML (for preview/debugging)
 */
export function generateP46Preview(data: P46Data): string {
  return generateP46HTML(data);
}

export default generateP46;
