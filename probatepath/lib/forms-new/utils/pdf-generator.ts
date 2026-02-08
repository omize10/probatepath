/**
 * PDF Generation Service using Puppeteer
 * Generates pixel-perfect court forms from HTML templates
 * Optimized for Vercel serverless environment
 */

import puppeteer from 'puppeteer-core';

// chrome-aws-lambda is only available in production
let chromium: any;
if (process.env.NODE_ENV === 'production' || process.env.VERCEL === '1') {
  chromium = require('chrome-aws-lambda');
}

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
  preferCSSPageSize?: boolean;
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
  preferCSSPageSize: false,
};

/**
 * Generate PDF from HTML content
 * Works in both local dev and Vercel serverless environments
 */
export async function generatePDF(
  html: string,
  options: PDFGenerationOptions = {}
): Promise<Buffer> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  
  let browser;
  try {
    // Check if we're in production (Vercel)
    const isProduction = process.env.NODE_ENV === 'production';
    const isVercel = process.env.VERCEL === '1';
    
    if ((isProduction || isVercel) && chromium) {
      // Use chrome-aws-lambda for serverless environments
      browser = await puppeteer.launch({
        args: chromium.args,
        executablePath: await chromium.executablePath,
        headless: chromium.headless,
      });
    } else {
      // Use local Chrome for development
      browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu',
        ],
        executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || 
          (process.platform === 'darwin' ? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' :
           process.platform === 'win32' ? 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe' :
           '/usr/bin/google-chrome'),
      });
    }

    const page = await browser.newPage();
    
    // Set content
    await page.setContent(html, {
      waitUntil: ['networkidle0', 'domcontentloaded'],
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
      preferCSSPageSize: opts.preferCSSPageSize,
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
    const isProduction = process.env.NODE_ENV === 'production';
    const isVercel = process.env.VERCEL === '1';
    
    if ((isProduction || isVercel) && chromium) {
      browser = await puppeteer.launch({
        args: chromium.args,
        executablePath: await chromium.executablePath,
        headless: chromium.headless,
      });
    } else {
      browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
        ],
        executablePath: process.env.PUPPETEER_EXECUTABLE_PATH ||
          (process.platform === 'darwin' ? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' :
           process.platform === 'win32' ? 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe' :
           '/usr/bin/google-chrome'),
      });
    }

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    await page.evaluate(() => document.fonts.ready);

    const pdfOptions: any = {
      width: opts.width,
      height: opts.height,
      margin: opts.margin,
      printBackground: opts.printBackground,
    };

    if (headerHtml) {
      pdfOptions.displayHeaderFooter = true;
      pdfOptions.headerTemplate = headerHtml;
    }

    if (footerHtml) {
      pdfOptions.displayHeaderFooter = true;
      pdfOptions.footerTemplate = footerHtml;
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
