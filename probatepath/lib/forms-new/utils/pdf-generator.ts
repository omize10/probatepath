/**
 * PDF Generation Service
 * Uses puppeteer-core with @sparticuz/chromium for Vercel compatibility
 */

import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';

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
 * Generate PDF from HTML content
 * Works on Vercel using @sparticuz/chromium
 */
export async function generatePDF(
  html: string,
  options: PDFGenerationOptions = {}
): Promise<Buffer> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  
  let browser;
  try {
    // Launch with @sparticuz/chromium (works on Vercel)
    browser = await puppeteer.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
    });

    const page = await browser.newPage();
    
    await page.setContent(html, {
      waitUntil: 'networkidle0',
      timeout: 30000,
    });

    await page.evaluate(() => document.fonts.ready);

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
 * Merge multiple PDFs into one
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
