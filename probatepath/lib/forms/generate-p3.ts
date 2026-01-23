import { Document, Packer, Paragraph, TextRun, AlignmentType } from "docx";
import type { EstateData } from "./types";
import {
  p,
  boldP,
  centered,
  checkbox,
  checkboxP,
  fieldRow,
  formatAddress,
  fullName,
  grantTypeText,
  juratBlock,
  line,
  spacer,
} from "./docx-utils";

export async function generateP3(data: EstateData): Promise<Buffer> {
  const children: Paragraph[] = [];

  const primaryApplicant = data.applicants[0];
  const applicantName = fullName(
    primaryApplicant.firstName,
    primaryApplicant.middleName,
    primaryApplicant.lastName
  );
  const deceasedName = fullName(
    data.deceased.firstName,
    data.deceased.middleName,
    data.deceased.lastName
  );

  // Form header
  children.push(centered("Form P3 (Rule 25-3 (2))", { bold: true, size: 24 }));
  children.push(spacer(80));
  children.push(
    centered(
      "AFFIDAVIT OF APPLICANT FOR GRANT OF PROBATE OR GRANT OF ADMINISTRATION WITH WILL ANNEXED (SHORT FORM)",
      { bold: true, size: 22 }
    )
  );
  children.push(spacer(60));

  // Affidavit numbering line
  children.push(
    p([
      new TextRun({ text: "This is the 1st affidavit of ", size: 22, font: "Arial" }),
      new TextRun({ text: applicantName, size: 22, font: "Arial", bold: true }),
      new TextRun({ text: " in this case and was made on ", size: 22, font: "Arial" }),
      new TextRun({ text: line(15), size: 22, font: "Arial" }),
    ])
  );
  children.push(spacer(60));

  // Registry info
  children.push(fieldRow("No.", data.fileNumber || ""));
  children.push(centered("In the Supreme Court of British Columbia", { size: 22 }));
  children.push(spacer(60));
  children.push(
    p([
      new TextRun({ text: "In the matter of the estate of ", size: 22, font: "Arial" }),
      new TextRun({ text: deceasedName, size: 22, font: "Arial", bold: true }),
      new TextRun({ text: ", deceased", size: 22, font: "Arial" }),
    ])
  );
  children.push(spacer(120));

  // Deponent intro
  const applicantAddress = formatAddress(primaryApplicant.address);
  children.push(
    p([
      new TextRun({ text: "I, ", size: 22, font: "Arial" }),
      new TextRun({ text: applicantName, size: 22, font: "Arial", bold: true }),
      new TextRun({ text: ", of ", size: 22, font: "Arial" }),
      new TextRun({ text: applicantAddress, size: 22, font: "Arial" }),
      new TextRun({ text: ", SWEAR (OR AFFIRM) THAT:", size: 22, font: "Arial" }),
    ])
  );
  children.push(spacer(200));

  // Paragraph 1: Applicant identification and grant type
  children.push(
    p([
      new TextRun({ text: "1. ", size: 22, font: "Arial", bold: true }),
      new TextRun({
        text: `I am the applicant for ${grantTypeText(data.grantType)} in relation to the estate of `,
        size: 22,
        font: "Arial",
      }),
      new TextRun({ text: deceasedName, size: 22, font: "Arial", bold: true }),
      new TextRun({
        text: `, who died on ${data.deceased.dateOfDeath}, and whose last residential address was ${formatAddress(data.deceased.lastAddress)}.`,
        size: 22,
        font: "Arial",
      }),
    ])
  );
  children.push(spacer(120));

  // Paragraph 2: Executor status
  children.push(boldP("2. "));
  if (primaryApplicant.namedInWill) {
    children.push(
      checkboxP(
        true,
        "I am named as an executor or alternate executor in the will and my appointment has not been revoked under section 56 (2) of the Wills, Estates and Succession Act or by a codicil to the will.",
        { indent: 360 }
      )
    );
  } else {
    children.push(
      checkboxP(
        true,
        `I am not named as an executor in the will. I am applying in the capacity of ${primaryApplicant.relationship || line(20)}.`,
        { indent: 360 }
      )
    );
  }

  // Other executors not applying
  if (data.otherExecutors && data.otherExecutors.length > 0) {
    children.push(spacer(60));
    children.push(
      p(
        "Other persons named in the will as executor who are not named as an applicant on the submission for estate grant:",
        { indent: { left: 360 } }
      )
    );
    for (const exec of data.otherExecutors) {
      let reasonText = "";
      if (exec.reason === "renounced") {
        reasonText = "has renounced executorship";
      } else if (exec.reason === "deceased") {
        reasonText = "is deceased";
      } else {
        reasonText = exec.otherReason || "other";
      }
      children.push(
        p(`${exec.name} -- ${reasonText}`, { indent: { left: 720 } })
      );
    }
  }
  children.push(spacer(120));

  // Paragraph 3: Public Guardian obligation
  children.push(
    p([
      new TextRun({ text: "3. ", size: 22, font: "Arial", bold: true }),
      new TextRun({ text: checkbox(data.attorneyGeneralNotice), size: 22, font: "Arial" }),
      new TextRun({
        text: " I am obliged under Rule 25-3 (11) to deliver a filed copy of this submission for estate grant to the Public Guardian and Trustee.",
        size: 22,
        font: "Arial",
      }),
    ])
  );
  children.push(
    p([
      new TextRun({ text: "   ", size: 22, font: "Arial" }),
      new TextRun({ text: checkbox(!data.attorneyGeneralNotice), size: 22, font: "Arial" }),
      new TextRun({
        text: " I am not obliged under Rule 25-3 (11) to deliver a filed copy of this submission for estate grant to the Public Guardian and Trustee.",
        size: 22,
        font: "Arial",
      }),
    ], { indent: { left: 360 } })
  );
  children.push(spacer(120));

  // Paragraph 4: Diligent search
  children.push(
    p([
      new TextRun({ text: "4. ", size: 22, font: "Arial", bold: true }),
      new TextRun({
        text: "I have made a diligent search and inquiry to inform myself of the testamentary documents executed by the deceased.",
        size: 22,
        font: "Arial",
      }),
    ])
  );
  children.push(spacer(120));

  // Paragraph 5: Last will belief
  children.push(
    p([
      new TextRun({ text: "5. ", size: 22, font: "Arial", bold: true }),
      new TextRun({
        text: `I believe the document dated ${data.will?.date || line(15)} now produced and shown to me and marked as Exhibit A to this my affidavit is the last will of the deceased.`,
        size: 22,
        font: "Arial",
      }),
    ])
  );
  children.push(spacer(120));

  // Paragraph 6: Will validity (WESA compliance)
  children.push(
    p([
      new TextRun({ text: "6. ", size: 22, font: "Arial", bold: true }),
      new TextRun({
        text: "I believe the will complies with the requirements of section 37 of the Wills, Estates and Succession Act, in that it appears to be:",
        size: 22,
        font: "Arial",
      }),
    ])
  );
  children.push(
    p("(a) in writing,", { indent: { left: 720 } })
  );
  children.push(
    p("(b) signed at its end by the testator, or the signature at the end is acknowledged by the testator as his or hers, in the presence of 2 or more witnesses present at the same time, and", { indent: { left: 720 } })
  );
  children.push(
    p("(c) signed by 2 or more of the witnesses in the presence of the testator.", { indent: { left: 720 } })
  );
  children.push(spacer(120));

  // Paragraph 7: No interlineations/alterations
  children.push(
    p([
      new TextRun({ text: "7. ", size: 22, font: "Arial", bold: true }),
      new TextRun({
        text: "The will has no interlineations, erasures or other alterations.",
        size: 22,
        font: "Arial",
      }),
    ])
  );
  children.push(spacer(120));

  // Paragraph 8: Original will filed
  children.push(
    p([
      new TextRun({ text: "8. ", size: 22, font: "Arial", bold: true }),
      new TextRun({
        text: "The originally signed will, referred to in paragraph 5, is being filed with this submission for estate grant.",
        size: 22,
        font: "Arial",
      }),
    ])
  );
  children.push(spacer(120));

  // Paragraph 9: Wills notice certificate
  children.push(
    p([
      new TextRun({ text: "9. ", size: 22, font: "Arial", bold: true }),
      new TextRun({
        text: "The certificate filed with the submission for estate grant shows that a wills notice in relation to the deceased was not filed at the Vital Statistics Agency after the date of the will referred to in paragraph 5.",
        size: 22,
        font: "Arial",
      }),
    ])
  );
  children.push(spacer(120));

  // Paragraph 10: Documents referred to in will
  children.push(
    p([
      new TextRun({ text: "10. ", size: 22, font: "Arial", bold: true }),
      new TextRun({ text: checkbox(!data.will?.refersToDocuments), size: 22, font: "Arial" }),
      new TextRun({
        text: " The will does not refer to any document or refers only to documents that are attached to the will.",
        size: 22,
        font: "Arial",
      }),
    ])
  );
  if (data.will?.refersToDocuments && data.will.documentsReferred?.length) {
    children.push(
      p([
        new TextRun({ text: "   ", size: 22, font: "Arial" }),
        new TextRun({ text: checkbox(true), size: 22, font: "Arial" }),
        new TextRun({
          text: " The will refers to one or more documents and those documents have been filed with the submission for estate grant.",
          size: 22,
          font: "Arial",
        }),
      ], { indent: { left: 360 } })
    );
  }
  children.push(spacer(120));

  // Paragraph 11: Administration promise
  children.push(
    p([
      new TextRun({ text: "11. ", size: 22, font: "Arial", bold: true }),
      new TextRun({
        text: "I will faithfully administer the estate of the deceased, according to law, and I acknowledge that I may be held personally accountable for any failure to do so.",
        size: 22,
        font: "Arial",
      }),
    ])
  );
  children.push(spacer(120));

  // Paragraph 12: No competing applications
  children.push(
    p([
      new TextRun({ text: "12. ", size: 22, font: "Arial", bold: true }),
      new TextRun({
        text: "To my knowledge, no application for a grant of probate, a grant of administration or a resealing has been made in relation to the estate of the deceased.",
        size: 22,
        font: "Arial",
      }),
    ])
  );
  children.push(spacer(240));

  // Jurat
  children.push(...juratBlock(applicantName, data.registry));

  // Build document
  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: { top: 720, bottom: 720, left: 1080, right: 1080 },
          },
        },
        children,
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  return Buffer.from(buffer);
}
