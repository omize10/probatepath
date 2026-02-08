/**
 * Form P41 Generator
 * Generates Requisition — Estates
 */

import { P41Data } from '../types';
import { generateP41HTML } from '../templates/p41-template';
import { generatePDF } from '../utils/pdf-generator';

/**
 * Generate Form P41 as PDF
 */
export async function generateP41(data: P41Data): Promise<Buffer> {
  // Generate HTML
  const html = generateP41HTML(data);

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
 * Generate Form P41 as HTML (for preview/debugging)
 */
export function generateP41Preview(data: P41Data): string {
  return generateP41HTML(data);
}

export default generateP41;
