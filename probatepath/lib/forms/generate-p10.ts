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
import { p, checkbox, checkboxP, fullName, spacer, grantTypeText } from "./docx-utils";
import { EstateData } from "./types";

export async function generateP10(data: EstateData): Promise<Buffer> {
  const deceasedName = fullName(data.deceased.firstName, data.deceased.middleName, data.deceased.lastName).toUpperCase();
  const applicant = data.applicants[0];
  const applicantName = fullName(applicant.firstName, applicant.middleName, applicant.lastName);
  const applicantAddress = [
    applicant.address.streetName,
    applicant.address.city,
    applicant.address.province,
    applicant.address.country,
    applicant.address.postalCode,
  ].filter(Boolean).join(", ");
  const submissionDate = data.submissionDate || new Date().toISOString().split("T")[0];
  const fileNumber = data.fileNumber || "________";
  const registryDisplay = (data.registry || "________") + " Registry";
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
            children: [new TextRun({ text: registryDisplay })],
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

          // Paragraph 1
          p(
            "1.\tI am an applicant for " + grant + " in relation to the estate of " + deceasedName + ' (the "deceased").'
          ),

          spacer(),

          // Paragraph 2
          p(
            "2.\tI have made a diligent search and inquiry to find the property and liabilities of the deceased."
          ),

          spacer(),

          // Paragraph 3
          p(
            '3.\tAttached to this affidavit as Exhibit "A" is a Statement of Assets, Liabilities and Distribution that discloses'
          ),

          spacer(),

          p(
            "(a) the real property and tangible personal property within British Columbia, and intangible personal property anywhere in the world, that passes to the applicant in the applicant's capacity as the deceased's personal representative,",
            { indent: { left: 720 } }
          ),
          p(
            "(b) the value of that property, and",
            { indent: { left: 720 } }
          ),
          p(
            "(c) the liabilities that charge or encumber that property.",
            { indent: { left: 720 } }
          ),

          spacer(),

          // Paragraph 4
          p("4."),
          checkboxP(!hasPropertyOutsideBC,
            "There is no real property or tangible personal property outside of British Columbia that passes to the applicant in the applicant's capacity as the deceased's personal representative.",
            { indent: 720 }
          ),
          checkboxP(hasPropertyOutsideBC,
            'Attached to this affidavit as Exhibit "B" is a Statement of Real and Tangible Property Outside of British Columbia that discloses the real property and tangible personal property outside of British Columbia that passes to the applicant in the applicant\'s capacity as the deceased\'s personal representative.',
            { indent: 720 }
          ),

          spacer(),

          // Paragraph 5
          p(
            "5.\tIf I determine that there is any property or liability that has not been disclosed in Exhibit A, or that information contained in this affidavit is incorrect or incomplete, I will promptly after learning of the same file an affidavit of assets and liabilities in Form P14 to disclose the correct and complete information."
          ),

          spacer(),

          // Paragraph 6
          p(
            "6.\tIn addition to the probate fees payable in relation to any property disclosed in Exhibit A, I promise to pay the Minister of Finance the probate fees payable with respect to the value of any property that passes to me as the deceased's personal representative, and that is not disclosed in Exhibit A, on a determination being made as to the value of that asset."
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
