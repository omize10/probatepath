import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  AlignmentType,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
} from "docx";
import { p, checkbox, fullName, spacer, grantTypeText, checkboxP, formatAddress, EMPTY_APPLICANT } from "./docx-utils";
import type { EstateData } from "./types";

const noBorders = {
  top: { style: BorderStyle.NONE, size: 0 },
  bottom: { style: BorderStyle.NONE, size: 0 },
  left: { style: BorderStyle.NONE, size: 0 },
  right: { style: BorderStyle.NONE, size: 0 },
};

function buildOtherExecutorsSection(data: EstateData): Paragraph[] {
  const otherExecs = data.otherExecutors || [];
  const hasOthersNotApplying = otherExecs.length > 0;
  const paragraphs: Paragraph[] = [];

  if (!hasOthersNotApplying) {
    paragraphs.push(
      checkboxP(true, "No other persons are named in the will as executor.", { indent: 720 })
    );
  } else {
    paragraphs.push(
      checkboxP(false, "No other persons are named in the will as executor.", { indent: 720 })
    );
    paragraphs.push(
      checkboxP(true, "Other persons are named in the will as executor and, of those, the following person(s) is/are not named as an applicant on the submission for estate grant for the reason shown after that person's name:", { indent: 720 })
    );
    for (const exec of otherExecs) {
      const reason = exec.reason === "renounced"
        ? "has renounced executorship"
        : exec.reason === "deceased"
          ? "is deceased"
          : exec.otherReason || "other";
      paragraphs.push(
        p(`${exec.name} \u2014 ${reason}`, { indent: { left: 1080 } })
      );
    }
  }

  return paragraphs;
}

export async function generateP3(data: EstateData): Promise<Buffer> {
  const applicant = data.applicants[0] || EMPTY_APPLICANT;
  const applicantName = fullName(applicant.firstName, applicant.middleName, applicant.lastName) || "________________________";
  const deceasedName = fullName(data.deceased.firstName, data.deceased.middleName, data.deceased.lastName);
  const deceasedNameUpper = deceasedName.toUpperCase();
  const applicantAddress = formatAddress(applicant.address);

  const submissionDate = data.submissionDate
    ? new Date(data.submissionDate).toLocaleDateString("en-CA", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "________________________";

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1440,
              bottom: 1440,
              left: 1440,
              right: 1440,
            },
          },
        },
        children: [
          // 1. Form title centered
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: "Form P3 (Rule 25-3(2))",
                size: 24,
                font: "Arial",
              }),
            ],
          }),

          spacer(),

          // 2. Affidavit header block (right-aligned)
          new Paragraph({
            alignment: AlignmentType.RIGHT,
            children: [
              new TextRun({
                text: "This is the 1st affidavit",
                size: 24,
                font: "Arial",
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.RIGHT,
            children: [
              new TextRun({
                text: `of ${applicantName}`,
                size: 24,
                font: "Arial",
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.RIGHT,
            children: [
              new TextRun({
                text: `in this case and was made on ${submissionDate}`,
                size: 24,
                font: "Arial",
              }),
            ],
          }),

          spacer(),

          // 3. No. / Registry (right-aligned)
          new Paragraph({
            alignment: AlignmentType.RIGHT,
            children: [
              new TextRun({
                text: `No. ${data.fileNumber || "________"}`,
                size: 24,
                font: "Arial",
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.RIGHT,
            children: [
              new TextRun({
                text: (data.registry || "________________________") + " Registry",
                size: 24,
                font: "Arial",
              }),
            ],
          }),

          spacer(),

          // 4. Court name centered bold caps size 28
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: "IN THE SUPREME COURT OF BRITISH COLUMBIA",
                bold: true,
                size: 28,
                allCaps: true,
                font: "Arial",
              }),
            ],
          }),

          spacer(),

          // 5. Estate of deceased
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: "In the Matter of the Estate of ",
                size: 24,
                font: "Arial",
              }),
              new TextRun({
                text: deceasedNameUpper,
                bold: true,
                size: 24,
                font: "Arial",
              }),
              new TextRun({
                text: ", deceased",
                size: 24,
                font: "Arial",
              }),
            ],
          }),

          spacer(),

          // 6. Affidavit title centered bold
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: "AFFIDAVIT OF APPLICANT FOR GRANT OF PROBATE OR GRANT OF ADMINISTRATION WITH WILL ANNEXED (SHORT FORM)",
                bold: true,
                size: 24,
                font: "Arial",
              }),
            ],
          }),

          spacer(),

          // 7. Opening statement
          new Paragraph({
            children: [
              new TextRun({
                text: `I, ${applicantName}, of ${applicantAddress}, AFFIRM THAT:`,
                size: 24,
                font: "Arial",
              }),
            ],
          }),

          spacer(),

          // Paragraph 1
          p(`1.\tI am the applicant referred to in the submission for estate grant in relation to the estate of ${deceasedNameUpper} (the "deceased") and in relation to the document that is identified in section 4 of Part 3 of the submission for estate grant as the will (the "will"), and am applying for:`),

          spacer(60),
          checkboxP(data.grantType === "probate", "a grant of probate.", { indent: 720 }),
          checkboxP(data.grantType === "admin_with_will", "a grant of administration with will annexed.", { indent: 720 }),

          spacer(),

          // Paragraph 2
          p("2.\tI am named as an executor or alternate executor in the will and my appointment has not been revoked under section 56 (2) of the Wills, Estates and Succession Act or by a codicil to the will."),

          spacer(60),

          ...buildOtherExecutorsSection(data),

          spacer(),

          // Paragraph 3
          checkboxP(!data.attorneyGeneralNotice, "3.\tI am not obliged under Rule 25-3 (11) to deliver a filed copy of this submission for estate grant to the Public Guardian and Trustee."),
          checkboxP(!!data.attorneyGeneralNotice, "3.\tI am obliged under Rule 25-3 (11) to deliver a filed copy of this submission for estate grant to the Public Guardian and Trustee."),

          spacer(),

          // Paragraph 4
          p(
            "4.\tI am satisfied that a diligent search for a testamentary document of the deceased has been made in each place that could reasonably be considered to be a place where a testamentary document may be found, including, without limitation, in all places, both physical and electronic, where the deceased usually kept important documents and that no testamentary document that is dated later than the date of the will has been found."
          ),

          spacer(),

          // Paragraph 5
          p(
            "5.\tI believe that the will is the last will of the deceased that deals with property in British Columbia."
          ),

          spacer(),

          // Paragraph 6
          p(
            "6.\tI believe that the will complies with the requirements of Division 1 of Part 4 of the Wills, Estates and Succession Act and"
          ),
          p("(a) I am not aware of there being any issues that would call into question the validity or contents of the will,", { indent: { left: 720 } }),
          p("(b) I am not requesting that the will be recognized as a military will executed in accordance with the requirements of section 38 of the Wills, Estates and Succession Act,", { indent: { left: 720 } }),
          p("(c) I am not aware of there being any interlineations, erasures or obliterations in, or other alterations to, the will, and", { indent: { left: 720 } }),
          p("(d) I am not aware of there being any issues arising from the appearance of the will.", { indent: { left: 720 } }),

          spacer(),

          // Paragraph 7
          p(
            "7.\tAn originally signed version of the will is being filed with the submission for estate grant."
          ),

          spacer(),

          // Paragraph 8
          p(
            "8.\tA certificate from the chief executive officer under the Vital Statistics Act indicating the results of a search for a wills notice filed by or on behalf of the deceased is filed with this application, and the certificate indicates that no testamentary document that is dated later than the date of the will has been found."
          ),

          spacer(),

          // Paragraph 9
          p(
            `9.\tAll documents referred to in the will ${data.will?.refersToDocuments ? "are attached to the will" : "\u2014 there are no documents referred to in the will"}.`
          ),

          spacer(),

          // Paragraph 10
          p(
            "10.\tI have read the submission for estate grant and the other documents referred to in that document and I believe that the information contained in that submission for estate grant and those documents is correct and complete."
          ),

          spacer(),

          // Paragraph 11
          p(
            "11.\tI will administer according to law all of the deceased's estate, I will prepare an accounting as to how the estate was administered and I acknowledge that, in doing this, I will be subject to the legal responsibility of a personal representative."
          ),

          spacer(),

          // Paragraph 12
          p(
            "12.\tI am not aware of there being any application for a grant of probate or administration, or any grant of probate or administration, or equivalent, having been issued, in relation to the deceased, in British Columbia or in any other jurisdiction."
          ),

          spacer(),
          spacer(),

          // 9. Jurat block
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    width: { size: 50, type: WidthType.PERCENTAGE },
                    borders: noBorders,
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "AFFIRMED before me at",
                            size: 24,
                            font: "Arial",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: { size: 5, type: WidthType.PERCENTAGE },
                    borders: noBorders,
                    children: [
                      new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [
                          new TextRun({ text: ")", size: 24, font: "Arial" }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: { size: 45, type: WidthType.PERCENTAGE },
                    borders: noBorders,
                    children: [
                      new Paragraph({ children: [] }),
                    ],
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    borders: noBorders,
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: `${applicant.address.city || "________________________"}, ${applicant.address.province || "British Columbia"}`,
                            size: 24,
                            font: "Arial",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    borders: noBorders,
                    children: [
                      new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [
                          new TextRun({ text: ")", size: 24, font: "Arial" }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    borders: noBorders,
                    children: [
                      new Paragraph({ children: [] }),
                    ],
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    borders: noBorders,
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: `on ${submissionDate}`,
                            size: 24,
                            font: "Arial",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    borders: noBorders,
                    children: [
                      new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [
                          new TextRun({ text: ")", size: 24, font: "Arial" }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    borders: noBorders,
                    children: [
                      new Paragraph({ children: [] }),
                    ],
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    borders: noBorders,
                    children: [
                      new Paragraph({ children: [] }),
                    ],
                  }),
                  new TableCell({
                    borders: noBorders,
                    children: [
                      new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [
                          new TextRun({ text: ")", size: 24, font: "Arial" }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    borders: noBorders,
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "________________________________________",
                            size: 24,
                            font: "Arial",
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    borders: noBorders,
                    children: [
                      new Paragraph({ children: [] }),
                    ],
                  }),
                  new TableCell({
                    borders: noBorders,
                    children: [
                      new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [
                          new TextRun({ text: ")", size: 24, font: "Arial" }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    borders: noBorders,
                    children: [
                      new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [
                          new TextRun({
                            text: applicantName,
                            size: 24,
                            font: "Arial",
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    borders: noBorders,
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "________________________________________",
                            size: 24,
                            font: "Arial",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    borders: noBorders,
                    children: [
                      new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [
                          new TextRun({ text: ")", size: 24, font: "Arial" }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    borders: noBorders,
                    children: [
                      new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [
                          new TextRun({
                            text: "Deponent",
                            size: 24,
                            font: "Arial",
                            italics: true,
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    borders: noBorders,
                    children: [
                      new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [
                          new TextRun({
                            text: "A Commissioner for taking Affidavits",
                            size: 24,
                            font: "Arial",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    borders: noBorders,
                    children: [
                      new Paragraph({ children: [] }),
                    ],
                  }),
                  new TableCell({
                    borders: noBorders,
                    children: [
                      new Paragraph({ children: [] }),
                    ],
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    borders: noBorders,
                    children: [
                      new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [
                          new TextRun({
                            text: "for British Columbia",
                            size: 24,
                            font: "Arial",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    borders: noBorders,
                    children: [
                      new Paragraph({ children: [] }),
                    ],
                  }),
                  new TableCell({
                    borders: noBorders,
                    children: [
                      new Paragraph({ children: [] }),
                    ],
                  }),
                ],
              }),
            ],
          }),
        ],
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  return Buffer.from(buffer);
}
