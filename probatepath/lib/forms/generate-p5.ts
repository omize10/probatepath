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
import { p, checkbox, fullName, spacer, checkboxP, formatAddress } from "./docx-utils";
import type { EstateData } from "./types";

const noBorders = {
  top: { style: BorderStyle.NONE, size: 0 },
  bottom: { style: BorderStyle.NONE, size: 0 },
  left: { style: BorderStyle.NONE, size: 0 },
  right: { style: BorderStyle.NONE, size: 0 },
};

// Map relationship to display text
function relationshipText(relationship?: string): string {
  const map: Record<string, string> = {
    spouse: "the surviving spouse",
    child: "a child",
    grandchild: "a grandchild",
    parent: "a parent",
    sibling: "a sibling",
    niece_nephew: "a niece/nephew",
    other_relative: "a relative",
  };
  return map[relationship || ""] || relationship || "a person entitled to apply";
}

// Build the section about priority and renunciations
function buildPrioritySection(data: EstateData): Paragraph[] {
  const paragraphs: Paragraph[] = [];
  const applicant = data.applicants[0];
  const relationship = applicant.relationship || "";

  // Check if applicant is spouse
  if (relationship === "spouse") {
    paragraphs.push(
      p(`2.\tI am the surviving spouse of the deceased and am entitled under Part 10 of the Wills, Estates and Succession Act to apply for a grant of administration of the deceased's estate.`)
    );
  } else if (relationship === "child") {
    // Child applying
    if (data.spouse.status === "surviving") {
      paragraphs.push(
        p(`2.\tI am a child of the deceased. The surviving spouse of the deceased, ${data.spouse.survivingName || "[spouse name]"}, has renounced or consented to my application for a grant of administration.`)
      );
    } else if (data.spouse.status === "deceased") {
      paragraphs.push(
        p(`2.\tI am a child of the deceased. The spouse of the deceased predeceased the deceased, and I am entitled under Part 10 of the Wills, Estates and Succession Act to apply for a grant of administration.`)
      );
    } else {
      paragraphs.push(
        p(`2.\tI am a child of the deceased. The deceased had no surviving spouse, and I am entitled under Part 10 of the Wills, Estates and Succession Act to apply for a grant of administration.`)
      );
    }
  } else if (relationship === "grandchild") {
    paragraphs.push(
      p(`2.\tI am a grandchild of the deceased. All persons with higher priority under Part 10 of the Wills, Estates and Succession Act have either predeceased the deceased, renounced their right to apply, or consented to my application.`)
    );
  } else if (relationship === "parent") {
    paragraphs.push(
      p(`2.\tI am a parent of the deceased. The deceased had no surviving spouse or descendants, and I am entitled under Part 10 of the Wills, Estates and Succession Act to apply for a grant of administration.`)
    );
  } else if (relationship === "sibling") {
    paragraphs.push(
      p(`2.\tI am a sibling of the deceased. The deceased had no surviving spouse, descendants, or parents, and I am entitled under Part 10 of the Wills, Estates and Succession Act to apply for a grant of administration.`)
    );
  } else {
    paragraphs.push(
      p(`2.\tI am ${relationshipText(relationship)} of the deceased and am entitled under Part 10 of the Wills, Estates and Succession Act to apply for a grant of administration of the deceased's estate. All persons with higher priority have either predeceased the deceased, renounced their right to apply, or consented to my application.`)
    );
  }

  return paragraphs;
}

// Build the intestate successors section
function buildSuccessorsSection(data: EstateData): Paragraph[] {
  const paragraphs: Paragraph[] = [];
  const successors = data.intestateSuccessors || [];

  if (successors.length === 0) {
    paragraphs.push(
      p(`4.\tI am not aware of any persons who are entitled to share in the estate of the deceased under Part 10 of the Wills, Estates and Succession Act other than myself.`)
    );
  } else {
    paragraphs.push(
      p(`4.\tThe following persons are entitled to share in the estate of the deceased under Part 10 of the Wills, Estates and Succession Act:`)
    );

    for (const successor of successors) {
      paragraphs.push(
        p(`\t\t• ${successor.name} (${successor.relationship})`, { indent: { left: 720 } })
      );
    }
  }

  return paragraphs;
}

export async function generateP5(data: EstateData): Promise<Buffer> {
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
                text: "Form P5 (Rule 25-3(4))",
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
                text: "AFFIDAVIT OF APPLICANT FOR GRANT OF ADMINISTRATION",
                bold: true,
                size: 24,
                font: "Arial",
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: "(INTESTATE ESTATE)",
                bold: true,
                size: 22,
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

          // Paragraph 1 - No Will Statement
          p(`1.\tI am the applicant referred to in the submission for estate grant in relation to the estate of ${deceasedNameUpper} (the "deceased") and am applying for a grant of administration. The deceased died without having made a will, or any testamentary document of any kind, that has been found after a diligent search in all places where a testamentary document might reasonably be found.`),

          spacer(),

          // Paragraph 2 - Priority/Relationship
          ...buildPrioritySection(data),

          spacer(),

          // Paragraph 3 - Wills Search Certificate
          p("3.\tA certificate from the chief executive officer under the Vital Statistics Act indicating the results of a search for a wills notice filed by or on behalf of the deceased is filed with this application, and the certificate indicates that no will has been filed."),

          spacer(),

          // Paragraph 4 - Intestate Successors
          ...buildSuccessorsSection(data),

          spacer(),

          // Paragraph 5 - Public Guardian
          checkboxP(!data.attorneyGeneralNotice, "5.\tI am not obliged under Rule 25-3 (11) to deliver a filed copy of this submission for estate grant to the Public Guardian and Trustee."),
          checkboxP(!!data.attorneyGeneralNotice, "5.\tI am obliged under Rule 25-3 (11) to deliver a filed copy of this submission for estate grant to the Public Guardian and Trustee."),

          spacer(),

          // Paragraph 6 - Accuracy
          p(
            "6.\tI have read the submission for estate grant and the other documents referred to in that document and I believe that the information contained in that submission for estate grant and those documents is correct and complete."
          ),

          spacer(),

          // Paragraph 7 - Duties
          p(
            "7.\tI will administer according to law all of the deceased's estate, I will prepare an accounting as to how the estate was administered and I acknowledge that, in doing this, I will be subject to the legal responsibility of a personal representative."
          ),

          spacer(),

          // Paragraph 8 - No prior applications
          p(
            "8.\tI am not aware of there being any application for a grant of probate or administration, or any grant of probate or administration, or equivalent, having been issued, in relation to the deceased, in British Columbia or in any other jurisdiction."
          ),

          spacer(),

          // Paragraph 9 - Distribution promise
          p(
            "9.\tI understand that, as administrator, I must distribute the estate of the deceased in accordance with Part 10 of the Wills, Estates and Succession Act, which sets out the rules for intestate succession in British Columbia."
          ),

          spacer(),
          spacer(),

          // 8. Jurat block
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
