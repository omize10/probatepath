import { Document, Packer, Paragraph, TextRun, AlignmentType, Table } from "docx";
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
  juratBlock,
  line,
  simpleTable,
  spacer,
} from "./docx-utils";

export async function generateP9(data: EstateData): Promise<Buffer> {
  const children: (Paragraph | Table)[] = [];

  const primaryApplicant = data.applicants[0];
  const deponentName = fullName(
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
  children.push(centered("Form P9 (Rule 25-3 (2))", { bold: true, size: 24 }));
  children.push(spacer(80));
  children.push(centered("AFFIDAVIT OF DELIVERY", { bold: true, size: 26 }));
  children.push(spacer(60));

  // Affidavit numbering line
  children.push(
    p([
      new TextRun({ text: "This is the 1st affidavit of ", size: 22, font: "Arial" }),
      new TextRun({ text: deponentName, size: 22, font: "Arial", bold: true }),
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
  const deponentAddress = formatAddress(primaryApplicant.address);
  children.push(
    p([
      new TextRun({ text: "I, ", size: 22, font: "Arial" }),
      new TextRun({ text: deponentName, size: 22, font: "Arial", bold: true }),
      new TextRun({ text: ", of ", size: 22, font: "Arial" }),
      new TextRun({ text: deponentAddress, size: 22, font: "Arial" }),
      new TextRun({ text: ", SWEAR (OR AFFIRM) THAT:", size: 22, font: "Arial" }),
    ])
  );
  children.push(spacer(200));

  // Section 1: Exhibit reference
  children.push(boldP("1."));
  children.push(
    p(
      "I delivered a copy of the notice of proposed application in relation to estate in Form P1 (a copy of which is attached to this affidavit as Exhibit A) together with a copy of the will (if applicable) of the deceased to the persons identified in section 2.",
      { indent: { left: 360 } }
    )
  );
  children.push(spacer(120));

  // Section 2: Delivery details
  children.push(boldP("2. I delivered the notice and documents described in section 1:"));
  children.push(spacer(60));

  // Group deliveries by method
  const deliveries = data.deliveries || [];
  const mailDeliveries = deliveries.filter((d) => d.deliveryMethod === "mail");
  const personalDeliveries = deliveries.filter((d) => d.deliveryMethod === "personal");
  const electronicDeliveries = deliveries.filter((d) => d.deliveryMethod === "electronic");

  // Mail delivery
  children.push(
    checkboxP(
      mailDeliveries.length > 0,
      "by mailing it/them to the following persons by ordinary mail:"
    )
  );
  if (mailDeliveries.length > 0) {
    children.push(
      simpleTable(
        ["Name(s)", "On [date]"],
        mailDeliveries.map((d) => [d.recipientName, d.deliveryDate]),
        [50, 50]
      )
    );
  }
  children.push(spacer(120));

  // Personal delivery
  children.push(
    checkboxP(
      personalDeliveries.length > 0,
      "by handing it/them to and leaving it/them with the following persons:"
    )
  );
  if (personalDeliveries.length > 0) {
    children.push(
      simpleTable(
        ["Name(s)", "On [date]"],
        personalDeliveries.map((d) => [d.recipientName, d.deliveryDate]),
        [50, 50]
      )
    );
  }
  children.push(spacer(120));

  // Electronic delivery
  children.push(
    checkboxP(
      electronicDeliveries.length > 0,
      "by sending it/them to the following persons by e-mail, fax or other electronic means:"
    )
  );
  if (electronicDeliveries.length > 0) {
    children.push(
      simpleTable(
        ["Name(s)", "On [date]"],
        electronicDeliveries.map((d) => [d.recipientName, d.deliveryDate]),
        [50, 50]
      )
    );
    children.push(spacer(60));

    // Electronic delivery acknowledgment checkboxes
    const allAcknowledged = electronicDeliveries.every((d) => d.acknowledgedReceipt);
    children.push(
      checkboxP(
        allAcknowledged,
        "Each of the persons who received delivery by e-mail, fax or other electronic means has, in writing, acknowledged receipt of the document(s) referred to in this section.",
        { indent: 360 }
      )
    );
    children.push(
      checkboxP(
        allAcknowledged,
        "I will retain a copy of those acknowledgements until the personal representative of the deceased is discharged and will produce those acknowledgements promptly after being requested to do so by the registrar.",
        { indent: 360 }
      )
    );
  }
  children.push(spacer(200));

  // Section 3: Delivery on behalf of others
  children.push(boldP("3."));
  const onBehalfDeliveries = deliveries.filter((d) => d.onBehalfOf);
  if (onBehalfDeliveries.length > 0) {
    for (const d of onBehalfDeliveries) {
      children.push(
        p(
          `I delivered the document(s) referred to in section 2 to ${d.onBehalfOf!.name} in the person's capacity as the ${d.onBehalfOf!.capacity} of ${d.recipientName}.`,
          { indent: { left: 360 } }
        )
      );
      children.push(spacer(60));
    }
  } else {
    children.push(
      p("No deliveries were made on behalf of another person under Rule 25-2(8), (10) or (12).", { indent: { left: 360 } })
    );
  }
  children.push(spacer(120));

  // Section 4: Public Guardian and Trustee
  children.push(boldP("4. Delivery to the Public Guardian and Trustee"));
  if (data.publicGuardianDelivery) {
    children.push(
      checkboxP(
        data.publicGuardianDelivery.method === "mail",
        "by mailing it/them to the Public Guardian and Trustee by ordinary mail.",
        { indent: 360 }
      )
    );
    children.push(
      checkboxP(
        data.publicGuardianDelivery.method === "personal",
        "by handing it/them to and leaving it/them with the Public Guardian and Trustee.",
        { indent: 360 }
      )
    );
    children.push(
      checkboxP(
        data.publicGuardianDelivery.method === "electronic",
        "by sending it/them to the Public Guardian and Trustee by e-mail, fax or other electronic means.",
        { indent: 360 }
      )
    );
  } else {
    children.push(
      p("Delivery to the Public Guardian and Trustee was not required.", { indent: { left: 360 } })
    );
  }
  children.push(spacer(120));

  // Section 5: Electronic will
  children.push(boldP("5. Electronic will"));
  if (data.will?.isElectronic) {
    if (!data.electronicWillDemanded) {
      children.push(
        checkboxP(
          true,
          "No person who received notice demanded the will in its original electronic form.",
          { indent: 360 }
        )
      );
    } else {
      children.push(
        checkboxP(
          true,
          `I provided the will or access to the will in its original electronic form to the following person(s): ${(data.electronicWillProvidedTo || []).join(", ")}`,
          { indent: 360 }
        )
      );
    }
  } else {
    children.push(
      p("This section does not apply as the will is not an electronic will.", { indent: { left: 360 } })
    );
  }
  children.push(spacer(240));

  // Jurat
  children.push(...juratBlock(deponentName, data.registry));

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
