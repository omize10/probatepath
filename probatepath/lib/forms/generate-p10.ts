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
import { p, checkbox, fullName, spacer, grantTypeText } from "./docx-utils";
import { EstateData } from "./types";

export async function generateP10(data: EstateData): Promise<Buffer> {
  const deceasedName = fullName(data.deceased).toUpperCase();
  const applicant = data.applicants[0];
  const applicantName = fullName(applicant);
  const applicantAddress = [
    applicant.address.streetName,
    applicant.address.city,
    applicant.address.province,
    applicant.address.country,
    applicant.address.postalCode,
  ].join(", ");
  const submissionDate = data.submissionDate || new Date().toISOString().split("T")[0];
  const fileNumber = data.fileNumber || "________";
  const registry = data.registry || "________";
  const grant = grantTypeText(data.grantType);

  const hasPropertyOutsideBC = !!(
    data.assets?.realPropertyBC ||
    data.assets?.tangiblePersonalPropertyBC ||
    data.assets?.intangibleProperty
  );

  const noBorder = {
    top: { style: BorderStyle.NONE, size: 0 },
    bottom: { style: BorderStyle.NONE, size: 0 },
    left: { style: BorderStyle.NONE, size: 0 },
    right: { style: BorderStyle.NONE, size: 0 },
  };

  const juratTable = new Table({
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: 50, type: WidthType.PERCENTAGE },
            borders: noBorder,
            children: [
              new Paragraph({
                children: [new TextRun({ text: "AFFIRMED BEFORE ME at" })],
              }),
              new Paragraph({
                children: [
                  new TextRun({
                    text: applicant.address.city + ", " + applicant.address.province,
                  }),
                ],
              }),
              new Paragraph({
                children: [new TextRun({ text: "on " + submissionDate })],
              }),
              spacer(),
              spacer(),
              new Paragraph({
                children: [new TextRun({ text: "___________________________________" })],
              }),
              new Paragraph({
                children: [new TextRun({ text: "A Commissioner for Taking Affidavits" })],
              }),
              new Paragraph({
                children: [new TextRun({ text: "for British Columbia" })],
              }),
            ],
          }),
          new TableCell({
            width: { size: 50, type: WidthType.PERCENTAGE },
            borders: noBorder,
            children: [
              spacer(),
              spacer(),
              spacer(),
              spacer(),
              spacer(),
              new Paragraph({
                children: [new TextRun({ text: "___________________________________" })],
              }),
              new Paragraph({
                children: [new TextRun({ text: applicantName })],
              }),
            ],
          }),
        ],
      }),
    ],
    width: { size: 100, type: WidthType.PERCENTAGE },
  });

  const doc = new Document({
    sections: [
      {
        children: [
          // 1. Form P10 header
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: "Form P10 (Rule 25-3(2))", italics: true })],
          }),

          spacer(),

          // 2. Affidavit header (right-aligned)
          new Paragraph({
            alignment: AlignmentType.RIGHT,
            children: [new TextRun({ text: "This is the 3rd affidavit" })],
          }),
          new Paragraph({
            alignment: AlignmentType.RIGHT,
            children: [new TextRun({ text: "of " + applicantName })],
          }),
          new Paragraph({
            alignment: AlignmentType.RIGHT,
            children: [new TextRun({ text: "in this case and was made on " + submissionDate })],
          }),

          spacer(),

          // 3. No. / Registry (right-aligned)
          new Paragraph({
            alignment: AlignmentType.RIGHT,
            children: [new TextRun({ text: "No. " + fileNumber })],
          }),
          new Paragraph({
            alignment: AlignmentType.RIGHT,
            children: [new TextRun({ text: registry })],
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
              }),
            ],
          }),

          spacer(),

          // 5. In the Matter of the Estate
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({ text: "In the Matter of the Estate of " }),
              new TextRun({ text: deceasedName, bold: true }),
              new TextRun({ text: ", Deceased" }),
            ],
          }),

          spacer(),

          // 6. Title centered bold
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: "AFFIDAVIT OF ASSETS AND LIABILITIES FOR DOMICILED ESTATE GRANT",
                bold: true,
              }),
            ],
          }),

          spacer(),

          // 7. Opening affirmation
          new Paragraph({
            children: [
              new TextRun({
                text: "I, " + applicantName + ", of " + applicantAddress + ", AFFIRM THAT:",
              }),
            ],
          }),

          spacer(),

          // 8. Paragraph 1
          p(
            "1.\t" + applicantName + " is the applicant, for " + grant + " in relation to the estate of " + deceasedName + ' (the "Deceased").'
          ),

          spacer(),

          // Paragraph 2
          p(
            "2.\t" + applicantName + " has made a diligent search and inquiry to find the property and liabilities of the Deceased."
          ),

          spacer(),

          // Paragraph 3
          p(
            '3.\tAttached to this affidavit as Exhibit "A" is a Statement of Assets, Liabilities and Distribution that discloses:'
          ),

          spacer(),

          p(
            "\t(a)\tthe property of the Deceased situated in British Columbia at the date of death with estimated values;"
          ),
          p(
            "\t(b)\tthe liabilities of the Deceased at the date of death with estimated values; and"
          ),
          p(
            "\t(c)\tthe distribution or proposed distribution of the estate."
          ),

          spacer(),

          // Paragraph 4
          new Paragraph({
            children: [
              new TextRun({ text: "4.\t" }),
              ...checkbox(!hasPropertyOutsideBC),
              new TextRun({
                text: " The Deceased did not own any property outside of British Columbia at the date of death.",
              }),
            ],
          }),

          spacer(),

          // Paragraph 5
          p(
            '5.\tIf any property of the Deceased not disclosed in the Statement of Assets, Liabilities and Distribution comes to my knowledge, I will immediately file a Form P14 supplementary affidavit of assets and liabilities disclosing that property.'
          ),

          spacer(),

          // Paragraph 6
          p(
            "6.\tIf any property of the Deceased not disclosed in the Statement of Assets, Liabilities and Distribution comes to my knowledge, I will pay the probate fees payable on that property."
          ),

          spacer(),
          spacer(),

          // 9. Jurat block
          juratTable,
        ],
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  return buffer as Buffer;
}
