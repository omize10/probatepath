import { PDFDocument, rgb } from "pdf-lib";
import { Paragraph, TextRun, AlignmentType, ImageRun, Header, Document as DocxDocument } from "docx";
import fs from "fs";
import path from "path";

// Brand colors
const BRAND_NAVY = rgb(0.067, 0.125, 0.267); // #112244
const BRAND_GOLD = rgb(0.804, 0.686, 0.467); // #cdaf77

/**
 * Get the logo image buffer for embedding in documents
 */
export async function getLogoBuffer(): Promise<Buffer | null> {
  try {
    // Try to load the logo from public/images
    const logoPath = path.join(process.cwd(), "public", "images", "PPlogo.png");
    if (fs.existsSync(logoPath)) {
      return fs.readFileSync(logoPath);
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Add letterhead to a PDF document
 * Call this after creating the PDFDocument and page, before adding content
 */
export async function addPdfLetterhead(
  doc: PDFDocument,
  page: ReturnType<PDFDocument["addPage"]>,
  options?: { showTagline?: boolean }
): Promise<number> {
  const { width, height } = page.getSize();
  const margin = 72;
  let y = height - 50;

  // Try to embed logo
  const logoBuffer = await getLogoBuffer();
  if (logoBuffer) {
    try {
      const logoImage = await doc.embedPng(logoBuffer);
      const logoWidth = 120;
      const logoHeight = (logoImage.height / logoImage.width) * logoWidth;
      page.drawImage(logoImage, {
        x: margin,
        y: y - logoHeight,
        width: logoWidth,
        height: logoHeight,
      });
      y -= logoHeight + 10;
    } catch {
      // If PNG embedding fails, use text fallback
      y = await addTextLetterhead(doc, page, y, margin, options);
    }
  } else {
    // Use text fallback if no logo file
    y = await addTextLetterhead(doc, page, y, margin, options);
  }

  // Add separator line
  y -= 10;
  page.drawLine({
    start: { x: margin, y },
    end: { x: width - margin, y },
    thickness: 1,
    color: BRAND_GOLD,
  });

  y -= 25; // Space after header

  return y;
}

/**
 * Text-based letterhead fallback for PDF
 */
async function addTextLetterhead(
  doc: PDFDocument,
  page: ReturnType<PDFDocument["addPage"]>,
  startY: number,
  margin: number,
  options?: { showTagline?: boolean }
): Promise<number> {
  const { StandardFonts } = await import("pdf-lib");
  const boldFont = await doc.embedFont(StandardFonts.HelveticaBold);
  const regularFont = await doc.embedFont(StandardFonts.Helvetica);

  let y = startY;

  // Brand name
  page.drawText("ProbateDesk.Com", {
    x: margin,
    y,
    size: 20,
    font: boldFont,
    color: BRAND_NAVY,
  });
  y -= 18;

  // Tagline
  if (options?.showTagline !== false) {
    page.drawText("Guided Probate Document Preparation", {
      x: margin,
      y,
      size: 10,
      font: regularFont,
      color: rgb(0.4, 0.4, 0.4),
    });
    y -= 14;
  }

  return y;
}

/**
 * Create DOCX letterhead paragraphs to add at the top of a document
 */
export async function createDocxLetterhead(options?: {
  showTagline?: boolean;
  showContact?: boolean;
}): Promise<Paragraph[]> {
  const paragraphs: Paragraph[] = [];

  // Try to load logo for DOCX
  const logoBuffer = await getLogoBuffer();

  if (logoBuffer) {
    // Logo image
    paragraphs.push(
      new Paragraph({
        children: [
          new ImageRun({
            data: logoBuffer,
            transformation: {
              width: 140,
              height: 45,
            },
            type: "png",
          }),
        ],
        spacing: { after: 100 },
      })
    );
  } else {
    // Text fallback
    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: "ProbateDesk.Com",
            bold: true,
            size: 36,
            font: "Arial",
            color: "112244",
          }),
        ],
        spacing: { after: 40 },
      })
    );
  }

  // Tagline
  if (options?.showTagline !== false) {
    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: "Guided Probate Document Preparation",
            size: 18,
            font: "Arial",
            color: "666666",
            italics: true,
          }),
        ],
        spacing: { after: 80 },
      })
    );
  }

  // Contact info (optional)
  if (options?.showContact) {
    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: "www.probatedesk.com  |  support@probatedesk.com",
            size: 16,
            font: "Arial",
            color: "888888",
          }),
        ],
        spacing: { after: 80 },
      })
    );
  }

  // Separator line (using border on paragraph)
  paragraphs.push(
    new Paragraph({
      children: [],
      border: {
        bottom: {
          color: "CDAF77",
          size: 8,
          style: "single" as const,
        },
      },
      spacing: { after: 300 },
    })
  );

  return paragraphs;
}

/**
 * Create a standard document footer for DOCX
 */
export function createDocxFooter(): Paragraph[] {
  return [
    new Paragraph({
      children: [],
      border: {
        top: {
          color: "CDAF77",
          size: 4,
          style: "single" as const,
        },
      },
      spacing: { before: 400 },
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: "Prepared by ProbateDesk.Com  |  www.probatedesk.com",
          size: 16,
          font: "Arial",
          color: "888888",
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { before: 100 },
    }),
  ];
}

/**
 * Add footer to PDF page
 */
export async function addPdfFooter(
  doc: PDFDocument,
  page: ReturnType<PDFDocument["addPage"]>
): Promise<void> {
  const { StandardFonts } = await import("pdf-lib");
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const { width } = page.getSize();
  const margin = 72;
  const footerY = 40;

  // Separator line
  page.drawLine({
    start: { x: margin, y: footerY + 15 },
    end: { x: width - margin, y: footerY + 15 },
    thickness: 0.5,
    color: BRAND_GOLD,
  });

  // Footer text
  const footerText = "Prepared by ProbateDesk.Com  |  www.probatedesk.com";
  const textWidth = font.widthOfTextAtSize(footerText, 8);
  page.drawText(footerText, {
    x: (width - textWidth) / 2,
    y: footerY,
    size: 8,
    font,
    color: rgb(0.5, 0.5, 0.5),
  });
}
