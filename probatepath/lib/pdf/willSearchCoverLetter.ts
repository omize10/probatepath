import { PDFDocument, StandardFonts } from "pdf-lib";
import { format } from "date-fns";
import { formatIntakeDraftRecord } from "@/lib/intake/format";
import type { IntakeDraft } from "@/lib/intake/types";
import type { Matter, IntakeDraft as IntakeDraftModel } from "@prisma/client";
import { addPdfLetterhead, addPdfFooter } from "@/lib/letterhead";

export type CaseForWillSearchCover = {
  matter: Matter & { draft?: { payload: IntakeDraft["estateIntake"] | unknown } | null };
};

export async function generateWillSearchCoverLetterPdf(caseData: CaseForWillSearchCover): Promise<Uint8Array> {
  const matter = caseData.matter;
  const intake = matter.draft ? formatIntakeDraftRecord(matter.draft as unknown as IntakeDraftModel) : null;

  const decedentName =
    intake?.deceased?.fullName ||
    [intake?.estateIntake?.deceased?.name?.first, intake?.estateIntake?.deceased?.name?.last].filter(Boolean).join(" ") ||
    "the deceased";
  const applicantName =
    intake?.executor?.fullName ||
    [intake?.estateIntake?.applicant?.name?.first, intake?.estateIntake?.applicant?.name?.last].filter(Boolean).join(" ") ||
    "Applicant";
  const applicantAddress =
    [intake?.executor?.city, intake?.executor?.province || "BC"].filter(Boolean).join(", ") ||
    "[Your city, BC]";
  const applicantPhone = intake?.executor?.phone || "[Your phone number]";
  const deathDate =
    intake?.deceased?.dateOfDeath && intake.deceased.dateOfDeath !== ""
      ? format(new Date(intake.deceased.dateOfDeath), "MMMM d, yyyy")
      : "[date of death]";

  const doc = await PDFDocument.create();
  const page = doc.addPage([612, 792]); // US Letter

  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);

  const margin = 72;
  const maxWidth = 612 - margin * 2;

  // Add letterhead and get starting Y position
  let y = await addPdfLetterhead(doc, page, { showTagline: true });

  const addText = (text: string, opts?: { size?: number; font?: typeof font; lineHeight?: number }) => {
    const size = opts?.size ?? 11;
    const lineHeight = opts?.lineHeight ?? size + 5;
    const usedFont = opts?.font ?? font;

    // Simple word-wrap
    const words = text.split(" ");
    let currentLine = "";
    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const testWidth = usedFont.widthOfTextAtSize(testLine, size);
      if (testWidth > maxWidth && currentLine) {
        page.drawText(currentLine, { x: margin, y, size, font: usedFont });
        y -= lineHeight;
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }
    if (currentLine) {
      page.drawText(currentLine, { x: margin, y, size, font: usedFont });
      y -= lineHeight;
    }
  };

  const addBlank = () => { y -= 12; };

  // Date
  addText(format(new Date(), "MMMM d, yyyy"));
  addBlank();

  // Sender info
  addText(applicantName, { font: bold, size: 12 });
  addText(applicantAddress);
  addText(applicantPhone);
  addBlank();

  // Recipient
  addText("BC Vital Statistics Agency", { font: bold });
  addText("Wills Registry");
  addText("PO Box 9657 Stn Prov Govt");
  addText("Victoria, BC V8W 9P3");
  addBlank();

  // Subject line
  addText(`Re: Will Search Request - ${decedentName}`, { font: bold, size: 12 });
  addBlank();

  // Body
  addText("Dear Wills Registry,");
  addBlank();
  addText(
    `I am writing to request a search of the Wills Registry for any wills or codicils filed by ${decedentName}, who passed away on ${deathDate}.`
  );
  addBlank();
  addText(
    "Enclosed please find the completed VSA 532 Wills Search Request form along with the required fee. I am the executor/applicant for this estate and am in the process of applying for a grant of probate in the BC Supreme Court."
  );
  addBlank();
  addText(
    "Please send the search results to the address above. If you require any additional information or documentation, please contact me at the number above."
  );
  addBlank();
  addText(
    "Thank you for your assistance."
  );
  addBlank();
  addBlank();
  addText("Sincerely,");
  addBlank();
  addBlank();
  addText(applicantName, { font: bold });
  addText(`Executor of the Estate of ${decedentName}`);

  // Add footer
  await addPdfFooter(doc, page);

  return await doc.save();
}
