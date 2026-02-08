/**
 * Form P16 Generator
 * Generates Affidavit of Interlineation, Erasure, Obliteration or Other Alteration
 */

import { P16Data } from '../types';
import { generateP16HTML } from '../templates/p16-template';
import { generatePDF } from '../utils/pdf-generator';
import { validateEstateData } from '../utils/formatters';

/**
 * Generate Form P16 as PDF
 */
export async function generateP16(data: P16Data): Promise<Buffer> {
  // Validate data
  const errors = validateEstateData(data);
  if (errors.length > 0) {
    throw new Error(`Validation errors: ${errors.join(', ')}`);
  }

  // Generate HTML
  const html = generateP16HTML(data);

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
 * Generate Form P16 as HTML (for preview/debugging)
 */
export function generateP16Preview(data: P16Data): string {
  const errors = validateEstateData(data);
  if (errors.length > 0) {
    console.warn('Validation warnings:', errors);
  }

  return generateP16HTML(data);
}

export default generateP16;
