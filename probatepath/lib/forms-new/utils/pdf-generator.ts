/**
 * PDF Generation Service using Playwright
 * Generates pixel-perfect court forms from HTML templates
 * Works on Vercel serverless environment
 */

import { chromium } from 'playwright';

export interface PDFGenerationOptions {
  width?: string;
  height?: string;
  margin?: {
    top?: string;
    right?: string;
    bottom?: string;
    left?: string;
  };
  printBackground?: boolean;
}

const DEFAULT_OPTIONS: PDFGenerationOptions = {
  width: '8.5in',
  height: '11in',
  margin: {
    top: '0.5in',
    right: '0.75in',
    bottom: '0.5in',
    left: '0.75in',
  },
  printBackground: true,
};

/**
 * Generate PDF from HTML content using Playwright
 * Works in both local dev and Vercel serverless environments
 */
export async function generatePDF(
  html: string,
  options: PDFGenerationOptions = {}
): Promise<Buffer> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  
  let browser;
  try {
    // Launch browser - Playwright automatically handles serverless environments
    browser = await chromium.launch({
      headless: true,
    });

    const page = await browser.newPage();
    
    // Set content
    await page.setContent(html, {
      waitUntil: 'networkidle',
      timeout: 30000,
    });

    // Wait for fonts to load
    await page.evaluate(() => document.fonts.ready);

    // Generate PDF
    const pdfBuffer = await page.pdf({
      width: opts.width,
      height: opts.height,
      margin: opts.margin,
      printBackground: opts.printBackground,
    });

    return Buffer.from(pdfBuffer);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

/**
 * Generate PDF with header/footer
 */
export async function generatePDFWithHeaderFooter(
  html: string,
  headerHtml?: string,
  footerHtml?: string,
  options: PDFGenerationOptions = {}
): Promise<Buffer> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  
  let browser;
  try {
    browser = await chromium.launch({
      headless: true,
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);

    const pdfOptions: any = {
      width: opts.width,
      height: opts.height,
      margin: opts.margin,
      printBackground: opts.printBackground,
    };

    if (headerHtml || footerHtml) {
      pdfOptions.displayHeaderFooter = true;
      if (headerHtml) pdfOptions.headerTemplate = headerHtml;
      if (footerHtml) pdfOptions.footerTemplate = footerHtml;
    }

    const pdfBuffer = await page.pdf(pdfOptions);
    return Buffer.from(pdfBuffer);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

/**
 * Merge multiple PDFs into one
 * Note: Requires pdf-lib
 */
export async function mergePDFs(pdfs: Buffer[]): Promise<Buffer> {
  const { PDFDocument } = await import('pdf-lib');
  
  const mergedDoc = await PDFDocument.create();
  
  for (const pdf of pdfs) {
    const doc = await PDFDocument.load(pdf);
    const pages = await mergedDoc.copyPages(doc, doc.getPageIndices());
    pages.forEach(page => mergedDoc.addPage(page));
  }
  
  return Buffer.from(await mergedDoc.save());
}
