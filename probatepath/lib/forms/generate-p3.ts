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
import { p, checkbox, fullName, spacer, grantTypeText, checkboxP, formatAddress } from "./docx-utils";
import type { EstateData } from "./types";

const noBorders = {
  top: { style: BorderStyle.NONE, size: 0 },
  bottom: { style: BorderStyle.NONE, size: 0 },
  left: { style: BorderStyle.NONE, size: 0 },
  right: { style: BorderStyle.NONE, size: 0 },
};

export async function generateP3(data: EstateData): Promise<Buffer> {
  const applicant = data.applicants[0];
  const applicantName = fullName(applicant.firstName, applicant.middleName, applicant.lastName);
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
                text: data.registry || "________________________",
                size: 24,
                font: "Arial",
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.RIGHT,
            children: [
              new TextRun({
                text: "Registry",
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

          // Paragraph 1: Applicant reference + grant type checkbox
          p("1.      I am an applicant for a"),
          checkboxP(data.grantType === "probate", "Grant of Probate", { indent: 720 }),
          checkboxP(data.grantType === "admin_with_will", "Grant of Administration with Will Annexed", { indent: 720 }),
          new Paragraph({
            indent: { left: 720 },
            children: [
              new TextRun({
                text: `of the estate of ${deceasedNameUpper}, deceased.`,
                size: 22,
                font: "Arial",
              }),
            ],
          }),

          spacer(),

          // Paragraph 2: Named as executor + no other persons
          p("2.      In the will or codicil of the deceased:"),
          checkboxP(true, "I am named as executor.", { indent: 720 }),
          checkboxP(true, "No other persons are named as executor who have not already renounced or predeceased the deceased.", { indent: 720 }),

          spacer(),

          // Paragraph 3: Not obliged to deliver to PGT
          p("3.      Notification to the Public Guardian and Trustee:"),
          checkboxP(!data.attorneyGeneralNotice, "I am not obliged to deliver a notice to the Public Guardian and Trustee under section 116(2) of WESA.", { indent: 720 }),

          spacer(),

          // Paragraph 4: Diligent search (no checkbox)
          p(
            "4.      I have made a diligent search and inquiry for any will, codicil or other testamentary document of the deceased and I do not know of any will, codicil or other testamentary document other than the testamentary document(s) referred to above."
          ),

          spacer(),

          // Paragraph 5: Last will belief (no checkbox)
          p(
            "5.      I believe the testamentary document(s) referred to above represent(s) the last will of the deceased."
          ),

          spacer(),

          // Paragraph 6: Will complies with WESA + sub-items
          p(
            '6.      The will of the deceased complies with section 37 of the Wills, Estates and Succession Act ("WESA") in that:'
          ),
          new Paragraph({
            indent: { left: 1080 },
            spacing: { after: 120 },
            children: [
              new TextRun({
                text: "(a) it is in writing;",
                size: 22,
                font: "Arial",
              }),
            ],
          }),
          new Paragraph({
            indent: { left: 1080 },
            spacing: { after: 120 },
            children: [
              new TextRun({
                text: "(b) it is signed at its end by the will-maker or the signature at the end is acknowledged by the will-maker as his or hers;",
                size: 22,
                font: "Arial",
              }),
            ],
          }),
          new Paragraph({
            indent: { left: 1080 },
            spacing: { after: 120 },
            children: [
              new TextRun({
                text: "(c) the will-maker made or acknowledged the signature in the presence of 2 or more witnesses present at the same time; and",
                size: 22,
                font: "Arial",
              }),
            ],
          }),
          new Paragraph({
            indent: { left: 1080 },
            spacing: { after: 120 },
            children: [
              new TextRun({
                text: "(d) 2 or more of the witnesses subscribed the will in the presence of the will-maker.",
                size: 22,
                font: "Arial",
              }),
            ],
          }),

          spacer(),

          // Paragraph 7: Originally signed version filed
          p(
            `7.      The originally signed version of the will${data.will?.hasCodicils ? " and codicil(s)" : ""} has been filed with this court.`
          ),

          spacer(),

          // Paragraph 8: Vital Statistics certificate filed
          p(
            "8.      A certificate issued by the Director of Vital Statistics or the equivalent from the relevant jurisdiction, or a certified copy of the registration of death, with respect to the deceased has been filed with this court."
          ),

          spacer(),

          // Paragraph 9: All documents referred to attached
          p(
            `9.      All documents referred to in the will${data.will?.hasCodicils ? " or codicil(s)" : ""} of the deceased${data.will?.refersToDocuments ? " are attached to this affidavit" : " \u2014 there are no documents referred to in the will"}.`
          ),

          spacer(),

          // Paragraph 10: Read submission and believe correct
          p(
            "10.    I have read the submission filed herein and I believe its contents to be correct."
          ),

          spacer(),

          // Paragraph 11: Will administer according to law
          p(
            "11.    I will administer the estate of the deceased according to law and will render a just and true account of my administration when lawfully required."
          ),

          spacer(),

          // Paragraph 12: Not aware of other grant applications
          p(
            "12.    I am not aware of any application for a grant in respect of the estate of the deceased in any jurisdiction."
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
