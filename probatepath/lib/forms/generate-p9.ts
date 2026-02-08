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
import { p, checkbox, fullName, formatAddress, spacer, EMPTY_APPLICANT } from "./docx-utils";
import { EstateData } from "./types";

export async function generateP9(data: EstateData): Promise<Buffer> {
  const deceasedName = fullName(data.deceased.firstName, data.deceased.middleName, data.deceased.lastName).toUpperCase();
  const applicant = data.applicants[0] || EMPTY_APPLICANT;
  const applicantName = fullName(applicant.firstName, applicant.middleName, applicant.lastName) || "________________________";
  const applicantAddress = formatAddress(applicant.address);
  const formattedSubmissionDate = data.submissionDate ||
    new Date().toLocaleDateString("en-CA", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  const willDocument = data.will?.exists
    ? "a copy of the will"
    : "the documents referred to in the notice";

  const deliveries = data.deliveries || [];
  const mailDeliveries = deliveries.filter(
    (d) => d.deliveryMethod === "mail"
  );
  const personalDeliveries = deliveries.filter(
    (d) => d.deliveryMethod === "personal"
  );
  const electronicDeliveries = deliveries.filter(
    (d) => d.deliveryMethod === "electronic"
  );

  const formatDeliveryDate = (dateStr: string) => {
    if (!dateStr) return formattedSubmissionDate;
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return formattedSubmissionDate;
    return date.toLocaleDateString("en-CA", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const noBorders = {
    top: { style: BorderStyle.NONE, size: 0 },
    bottom: { style: BorderStyle.NONE, size: 0 },
    left: { style: BorderStyle.NONE, size: 0 },
    right: { style: BorderStyle.NONE, size: 0 },
  };

  const fileNum = data.fileNumber || "________";
  const registryDisplay = (data.registry || "________") + " Registry";
  const registryCity = applicant.address.city || data.registry || "_____________";

  const sections: Paragraph[] = [];

  // 1. Form header centered
  sections.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: "Form P9 (Rule 25-3(2))", size: 20 })],
    })
  );

  sections.push(spacer());

  // 2. Affidavit header right-aligned
  sections.push(
    new Paragraph({
      alignment: AlignmentType.RIGHT,
      children: [
        new TextRun({ text: "This is the 2nd affidavit", size: 20 }),
      ],
    })
  );
  sections.push(
    new Paragraph({
      alignment: AlignmentType.RIGHT,
      children: [
        new TextRun({ text: "of " + applicantName, size: 20 }),
      ],
    })
  );
  sections.push(
    new Paragraph({
      alignment: AlignmentType.RIGHT,
      children: [
        new TextRun({
          text: "in this case and was made on " + formattedSubmissionDate,
          size: 20,
        }),
      ],
    })
  );

  sections.push(spacer());

  // 3. No. / Registry right-aligned
  sections.push(
    new Paragraph({
      alignment: AlignmentType.RIGHT,
      children: [
        new TextRun({
          text: "No. " + fileNum,
          size: 24,
        }),
      ],
    })
  );
  sections.push(
    new Paragraph({
      alignment: AlignmentType.RIGHT,
      children: [
        new TextRun({ text: registryDisplay, size: 24 }),
      ],
    })
  );

  sections.push(spacer());

  // 4. Court name centered bold caps size 28
  sections.push(
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
    })
  );

  sections.push(spacer());

  // 5. Estate matter line
  sections.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({ text: "In the Matter of the Estate of ", size: 24 }),
        new TextRun({ text: deceasedName, bold: true, size: 24 }),
        new TextRun({ text: ", Deceased", size: 24 }),
      ],
    })
  );

  sections.push(spacer());

  // 6. Title centered bold
  sections.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: "AFFIDAVIT OF DELIVERY",
          bold: true,
          size: 24,
        }),
      ],
    })
  );

  sections.push(spacer());

  // 7. Opening paragraph
  sections.push(
    new Paragraph({
      children: [
        new TextRun({
          text: "I, " + applicantName + ", of " + applicantAddress + ", AFFIRM THAT:",
          size: 24,
        }),
      ],
    })
  );

  sections.push(spacer());

  // 8. Numbered paragraphs
  // Para 1
  sections.push(
    new Paragraph({
      children: [
        new TextRun({
          text: '1.\tAttached to this affidavit and marked as Exhibit "A" is a copy of a notice of proposed application in Form P1 (the "notice").',
          size: 24,
        }),
      ],
    })
  );

  sections.push(spacer());

  // Para 2
  sections.push(
    new Paragraph({
      children: [
        new TextRun({
          text: "2.\tI delivered a copy of the notice, along with " + willDocument + " to the following persons as follows:",
          size: 24,
        }),
      ],
    })
  );

  sections.push(spacer());

  // Checkbox: by mailing
  const mailChecked = mailDeliveries.length > 0;
  sections.push(
    new Paragraph({
      indent: { left: 720 },
      children: [
        new TextRun({
          text: checkbox(mailChecked) + " by mailing it/them to the following persons by ordinary mail:",
          size: 24,
        }),
      ],
    })
  );

  // Mail delivery list
  for (const delivery of mailDeliveries) {
    sections.push(
      new Paragraph({
        indent: { left: 1440 },
        bullet: { level: 0 },
        children: [
          new TextRun({
            text: delivery.recipientName.toUpperCase() + " on " + formatDeliveryDate(delivery.deliveryDate),
            size: 24,
          }),
        ],
      })
    );
  }

  sections.push(spacer());

  // Checkbox: by handing
  const personalChecked = personalDeliveries.length > 0;
  sections.push(
    new Paragraph({
      indent: { left: 720 },
      children: [
        new TextRun({
          text: checkbox(personalChecked) + " by handing it/them to and leaving it/them with the following persons as follows:",
          size: 24,
        }),
      ],
    })
  );

  // Personal delivery list
  for (const delivery of personalDeliveries) {
    sections.push(
      new Paragraph({
        indent: { left: 1440 },
        bullet: { level: 0 },
        children: [
          new TextRun({
            text: delivery.recipientName.toUpperCase() + " on " + formatDeliveryDate(delivery.deliveryDate),
            size: 24,
          }),
        ],
      })
    );
  }

  sections.push(spacer());

  // Checkbox: by electronic means
  const electronicChecked = electronicDeliveries.length > 0;
  sections.push(
    new Paragraph({
      indent: { left: 720 },
      children: [
        new TextRun({
          text: checkbox(electronicChecked) + " by sending it/them to the following persons by email, fax or other electronic means to that person:",
          size: 24,
        }),
      ],
    })
  );

  // Electronic delivery list
  for (const delivery of electronicDeliveries) {
    sections.push(
      new Paragraph({
        indent: { left: 1440 },
        bullet: { level: 0 },
        children: [
          new TextRun({
            text: delivery.recipientName.toUpperCase() + " on " + formatDeliveryDate(delivery.deliveryDate),
            size: 24,
          }),
        ],
      })
    );
  }

  sections.push(spacer());
  sections.push(spacer());

  // 9. Jurat block (two-column table format as P3)
  const juratTable = new Table({
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
                    text: "AFFIRMED BEFORE ME at",
                    size: 24,
                  }),
                ],
              }),
              new Paragraph({
                children: [
                  new TextRun({
                    text: registryCity + ", British Columbia,",
                    size: 24,
                  }),
                ],
              }),
              new Paragraph({
                children: [
                  new TextRun({
                    text: "on " + formattedSubmissionDate,
                    size: 24,
                  }),
                ],
              }),
              spacer(),
              new Paragraph({
                children: [
                  new TextRun({
                    text: "________________________________________",
                    size: 24,
                  }),
                ],
              }),
              new Paragraph({
                children: [
                  new TextRun({
                    text: "A Commissioner for Taking Affidavits",
                    size: 20,
                    italics: true,
                  }),
                ],
              }),
              new Paragraph({
                children: [
                  new TextRun({
                    text: "for British Columbia",
                    size: 20,
                    italics: true,
                  }),
                ],
              }),
            ],
          }),
          new TableCell({
            width: { size: 50, type: WidthType.PERCENTAGE },
            borders: noBorders,
            children: [
              spacer(),
              spacer(),
              spacer(),
              spacer(),
              new Paragraph({
                children: [
                  new TextRun({
                    text: "________________________________________",
                    size: 24,
                  }),
                ],
              }),
              new Paragraph({
                children: [
                  new TextRun({
                    text: applicantName,
                    size: 24,
                  }),
                ],
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
        children: [...sections, juratTable],
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  return buffer as Buffer;
}
