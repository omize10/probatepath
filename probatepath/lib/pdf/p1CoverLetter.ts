import { PDFDocument, StandardFonts } from "pdf-lib";
import { format } from "date-fns";
import { formatIntakeDraftRecord } from "@/lib/intake/format";
import type { IntakeDraft } from "@/lib/intake/types";
import type { Matter } from "@prisma/client";
import { addPdfLetterhead, addPdfFooter } from "@/lib/letterhead";

export type CaseForCoverLetter = {
  matter: Matter & { draft?: { payload: IntakeDraft["estateIntake"] | any } | null };
};

export async function generateP1CoverLetterPdf(caseData: CaseForCoverLetter): Promise<Uint8Array> {
  const matter = caseData.matter;
  const intake = matter.draft ? formatIntakeDraftRecord(matter.draft as any) : null;
  const decedentName =
    intake?.deceased?.fullName ||
    [intake?.estateIntake?.deceased?.name?.first, intake?.estateIntake?.deceased?.name?.last].filter(Boolean).join(" ");
  const applicantName =
    intake?.executor?.fullName ||
    [intake?.estateIntake?.applicant?.name?.first, intake?.estateIntake?.applicant?.name?.last].filter(Boolean).join(" ");
  const deathDate =
    intake?.deceased?.dateOfDeath && intake.deceased.dateOfDeath !== "" ? format(new Date(intake.deceased.dateOfDeath), "MMM d, yyyy") : "";

  const doc = await PDFDocument.create();
  const page = doc.addPage([612, 792]); // US Letter

  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);

  const margin = 72;

  // Add letterhead and get starting Y position
  let y = await addPdfLetterhead(doc, page, { showTagline: true });

  const addText = (text: string, opts?: { size?: number; font?: typeof font; lineHeight?: number }) => {
    const size = opts?.size ?? 12;
    const lineHeight = opts?.lineHeight ?? size + 4;
    const usedFont = opts?.font ?? font;
    const lines = text.split("\n");
    lines.forEach((line) => {
      page.drawText(line, { x: margin, y, size, font: usedFont });
      y -= lineHeight;
    });
  };

  // Date
  addText(format(new Date(), "MMMM d, yyyy"));
  addText(" ");

  // Sender info
  addText(applicantName || "Applicant name", { font: bold });
  addText("[Your address]");
  addText(" ");

  // Salutation
  addText("To whom it may concern,", { font: bold });
  addText(" ");

  // Body
  addText(
    [
      "I am applying for probate of the will of " + (decedentName || "the deceased"),
      deathDate ? ` (date of death ${deathDate}).` : ".",
    ].join(""),
  );
  addText(
    "Enclosed is a copy of the P1 Notice of Proposed Application in Relation to Estate and the will (if applicable), as required by the Supreme Court Civil Rules.",
  );
  addText("This letter is to provide you with notice of the application.");
  addText(" ");
  addText("If you have any questions or require additional information, please contact me.");
  addText(" ");

  // Closing
  addText("Sincerely,");
  addText(" ");
  addText(applicantName || "Applicant", { font: bold });

  // Add footer
  await addPdfFooter(doc, page);

  return await doc.save();
}
