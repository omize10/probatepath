import { Document, Packer, Paragraph, TextRun, AlignmentType } from "docx";
import type { EstateData } from "./types";
import {
  p,
  boldP,
  centered,
  checkboxP,
  fullName,
  spacer,
  underline,
} from "./docx-utils";

/**
 * Generate Notary Cover Letter
 * "Dear Notary, please commission these affidavits for [Applicant Name]
 * in connection with [Deceased Name] estate. Documents enclosed: P3, P2."
 */
export async function generateNotaryCoverLetter(data: EstateData): Promise<Buffer> {
  const children: Paragraph[] = [];

  // Header
  children.push(centered("NOTARY COVER LETTER", { bold: true, size: 28 }));
  children.push(spacer(200));

  // Date
  const today = new Date().toLocaleDateString("en-CA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  children.push(p(`Date: ${today}`));
  children.push(spacer(200));

  // Greeting
  children.push(p("Dear Notary,"));
  children.push(spacer(120));

  // Applicant and deceased names
  const applicantNames = data.applicants
    .map((a) => fullName(a.firstName, a.middleName, a.lastName))
    .join(" and ");
  const deceasedName = fullName(
    data.deceased.firstName,
    data.deceased.middleName,
    data.deceased.lastName
  );

  // Main body
  children.push(
    p([
      new TextRun({
        text: "Please commission the enclosed affidavits for ",
        size: 22,
        font: "Arial",
      }),
      new TextRun({
        text: applicantNames,
        size: 22,
        font: "Arial",
        bold: true,
      }),
      new TextRun({
        text: " in connection with the estate of ",
        size: 22,
        font: "Arial",
      }),
      new TextRun({
        text: deceasedName,
        size: 22,
        font: "Arial",
        bold: true,
      }),
      new TextRun({
        text: ".",
        size: 22,
        font: "Arial",
      }),
    ])
  );

  children.push(spacer(200));

  // Documents enclosed
  children.push(boldP("Documents enclosed for commissioning:"));
  children.push(spacer(60));

  // P3 - Affidavit of Applicant
  children.push(
    p("1. Form P3 - Affidavit of Applicant for Grant of Probate", { indent: { left: 360 } })
  );

  // P2 - Submission for Estate Grant
  children.push(
    p("2. Form P2 - Submission for Estate Grant", { indent: { left: 360 } })
  );

  // P10 if submitting
  if (data.submittingAffidavitOfAssets) {
    children.push(
      p("3. Form P10 - Affidavit of Assets and Liabilities", { indent: { left: 360 } })
    );
  }

  children.push(spacer(200));

  // Instructions
  children.push(boldP("Instructions:"));
  children.push(spacer(60));
  children.push(
    p("Each affidavit requires the applicant's signature to be witnessed by a Notary Public or Commissioner for Taking Affidavits for British Columbia. Please ensure:")
  );
  children.push(spacer(60));
  children.push(
    p("- The applicant signs in your presence", { indent: { left: 360 } })
  );
  children.push(
    p("- Your notarial stamp/seal is clearly applied", { indent: { left: 360 } })
  );
  children.push(
    p("- The jurat is completed with the date and location", { indent: { left: 360 } })
  );

  children.push(spacer(300));

  // Closing
  children.push(p("Thank you for your assistance."));
  children.push(spacer(200));

  children.push(p("Sincerely,"));
  children.push(spacer(120));
  children.push(
    new Paragraph({
      children: [new TextRun({ text: underline(40), size: 22, font: "Arial" })],
      spacing: { after: 60 },
    })
  );
  children.push(p(applicantNames));

  const doc = new Document({
    sections: [{ properties: {}, children }],
  });

  const buffer = await Packer.toBuffer(doc);
  return Buffer.from(buffer);
}

/**
 * Generate Court Cover Letter
 * "Dear Registry Clerk, please find enclosed documents for Grant of Probate
 * in the estate of [Deceased Name]..."
 */
export async function generateCourtCoverLetter(data: EstateData): Promise<Buffer> {
  const children: Paragraph[] = [];

  // Header
  children.push(centered("COURT FILING COVER LETTER", { bold: true, size: 28 }));
  children.push(spacer(200));

  // Date
  const today = new Date().toLocaleDateString("en-CA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  children.push(p(`Date: ${today}`));
  children.push(spacer(120));

  // Registry address
  children.push(boldP(`${data.registry} Court Registry`));
  children.push(p("Supreme Court of British Columbia"));
  children.push(spacer(200));

  // Re line
  const deceasedName = fullName(
    data.deceased.firstName,
    data.deceased.middleName,
    data.deceased.lastName
  );
  children.push(
    p([
      new TextRun({ text: "Re: ", size: 22, font: "Arial", bold: true }),
      new TextRun({
        text: `Application for Grant of Probate - Estate of ${deceasedName}`,
        size: 22,
        font: "Arial",
      }),
    ])
  );
  children.push(spacer(200));

  // Greeting
  children.push(p("Dear Registry Clerk,"));
  children.push(spacer(120));

  // Applicant names
  const applicantNames = data.applicants
    .map((a) => fullName(a.firstName, a.middleName, a.lastName))
    .join(" and ");

  // Main body
  const grantTypeMap: Record<string, string> = {
    probate: "Grant of Probate",
    admin_with_will: "Grant of Administration with Will Annexed",
    admin_without_will: "Grant of Administration",
    ancillary_probate: "Ancillary Grant of Probate",
    ancillary_admin_with_will: "Ancillary Grant of Administration with Will Annexed",
    ancillary_admin_without_will: "Ancillary Grant of Administration",
  };
  const grantTypeName = grantTypeMap[data.grantType] || "Grant of Probate";

  children.push(
    p([
      new TextRun({
        text: "Please find enclosed the application documents for ",
        size: 22,
        font: "Arial",
      }),
      new TextRun({
        text: grantTypeName,
        size: 22,
        font: "Arial",
        bold: true,
      }),
      new TextRun({
        text: " in the estate of ",
        size: 22,
        font: "Arial",
      }),
      new TextRun({
        text: deceasedName,
        size: 22,
        font: "Arial",
        bold: true,
      }),
      new TextRun({
        text: ", deceased.",
        size: 22,
        font: "Arial",
      }),
    ])
  );

  children.push(spacer(200));

  // Deceased information
  children.push(boldP("Deceased Information:"));
  children.push(spacer(60));
  children.push(p(`Full Legal Name: ${deceasedName}`, { indent: { left: 360 } }));
  children.push(p(`Date of Death: ${data.deceased.dateOfDeath}`, { indent: { left: 360 } }));

  children.push(spacer(200));

  // Applicant information
  children.push(boldP("Applicant(s):"));
  children.push(spacer(60));
  children.push(p(applicantNames, { indent: { left: 360 } }));

  children.push(spacer(200));

  // Documents enclosed
  children.push(boldP("Documents enclosed:"));
  children.push(spacer(60));

  const documents = [
    "Form P1 - Notice of Proposed Application",
    "Form P2 - Submission for Estate Grant",
    "Form P3 - Affidavit of Applicant",
  ];

  if (data.affidavitsOfDelivery.length > 0 || !data.noDeliveryRequired) {
    documents.push("Form P9 - Affidavit of Delivery");
  }

  if (data.submittingAffidavitOfAssets) {
    documents.push("Form P10 - Affidavit of Assets and Liabilities");
  }

  if (data.will?.exists) {
    documents.push("Original Will (and codicils if any)");
  }

  documents.push("Death Certificate");
  documents.push("Wills Search Certificate from BC Vital Statistics");

  documents.forEach((doc, i) => {
    children.push(p(`${i + 1}. ${doc}`, { indent: { left: 360 } }));
  });

  children.push(spacer(200));

  // Fee information
  children.push(boldP("Filing Fee:"));
  children.push(spacer(60));
  children.push(
    p("Enclosed is a cheque for the probate filing fee payable to the Minister of Finance.", {
      indent: { left: 360 },
    })
  );

  children.push(spacer(200));

  // Certified copies
  if (
    data.certifiedCopies.estateGrant > 0 ||
    data.certifiedCopies.authToObtainInfo > 0
  ) {
    children.push(boldP("Certified Copies Requested:"));
    children.push(spacer(60));
    if (data.certifiedCopies.estateGrant > 0) {
      children.push(
        p(`Estate Grant: ${data.certifiedCopies.estateGrant} copy/copies`, {
          indent: { left: 360 },
        })
      );
    }
    if (data.certifiedCopies.authToObtainInfo > 0) {
      children.push(
        p(
          `Certificate of Pending Litigation/Authority to Obtain Information: ${data.certifiedCopies.authToObtainInfo} copy/copies`,
          { indent: { left: 360 } }
        )
      );
    }
    children.push(spacer(200));
  }

  // Contact information
  children.push(boldP("Contact Information:"));
  children.push(spacer(60));
  children.push(p(`Address: ${data.addressForService.street}`, { indent: { left: 360 } }));
  children.push(p(`Phone: ${data.addressForService.phone}`, { indent: { left: 360 } }));
  if (data.addressForService.email) {
    children.push(p(`Email: ${data.addressForService.email}`, { indent: { left: 360 } }));
  }

  children.push(spacer(300));

  // Closing
  children.push(p("Thank you for your assistance in processing this application."));
  children.push(spacer(200));

  children.push(p("Respectfully submitted,"));
  children.push(spacer(120));
  children.push(
    new Paragraph({
      children: [new TextRun({ text: underline(40), size: 22, font: "Arial" })],
      spacing: { after: 60 },
    })
  );
  children.push(p(applicantNames));

  const doc = new Document({
    sections: [{ properties: {}, children }],
  });

  const buffer = await Packer.toBuffer(doc);
  return Buffer.from(buffer);
}

/**
 * Generate Filing Checklist
 * A one-page checklist the user physically signs confirming they've included:
 * Original will, Death certificate, P1-P10 as required, Affidavits, Fee cheque.
 */
export async function generateFilingChecklist(data: EstateData): Promise<Buffer> {
  const children: Paragraph[] = [];

  // Header
  children.push(centered("PROBATE FILING CHECKLIST", { bold: true, size: 28 }));
  children.push(spacer(120));

  const deceasedName = fullName(
    data.deceased.firstName,
    data.deceased.middleName,
    data.deceased.lastName
  );
  children.push(centered(`Estate of ${deceasedName}`, { size: 24 }));
  children.push(spacer(200));

  // Instructions
  children.push(
    p(
      "Before submitting your probate application, verify that all required documents are included. Check each item below and sign at the bottom to confirm completeness.",
      { italic: true }
    )
  );
  children.push(spacer(200));

  // Required documents section
  children.push(boldP("REQUIRED DOCUMENTS", { spacing: { after: 120 } }));

  // Court forms
  children.push(
    p("Court Forms:", { bold: true, spacing: { before: 120, after: 60 } })
  );
  children.push(checkboxP(false, "Form P1 - Notice of Proposed Application (served to all beneficiaries)"));
  children.push(checkboxP(false, "Form P2 - Submission for Estate Grant (notarized)"));
  children.push(checkboxP(false, "Form P3 - Affidavit of Applicant for Grant of Probate (notarized)"));

  if (data.affidavitsOfDelivery.length > 0 || !data.noDeliveryRequired) {
    children.push(checkboxP(false, "Form P9 - Affidavit of Delivery (notarized)"));
  }

  if (data.submittingAffidavitOfAssets) {
    children.push(checkboxP(false, "Form P10 - Affidavit of Assets and Liabilities (notarized)"));
  }

  children.push(spacer(120));

  // Original documents
  children.push(
    p("Original Documents:", { bold: true, spacing: { before: 120, after: 60 } })
  );

  if (data.will?.exists) {
    children.push(checkboxP(false, "Original Will (signed and witnessed)"));
    if (data.will.hasCodicils) {
      children.push(checkboxP(false, "Original Codicil(s)"));
    }
  }

  children.push(checkboxP(false, "Original or certified copy of Death Certificate"));
  children.push(checkboxP(false, "Wills Search Certificate from BC Vital Statistics"));

  children.push(spacer(120));

  // Fees
  children.push(
    p("Fees:", { bold: true, spacing: { before: 120, after: 60 } })
  );
  children.push(
    checkboxP(false, "Probate filing fee cheque payable to 'Minister of Finance'")
  );
  children.push(
    checkboxP(false, "Certified copy fees (if requesting additional certified copies)")
  );

  children.push(spacer(120));

  // Additional requirements
  children.push(
    p("Additional Requirements:", { bold: true, spacing: { before: 120, after: 60 } })
  );
  children.push(
    checkboxP(false, "All affidavits have been properly commissioned by a Notary Public")
  );
  children.push(
    checkboxP(false, "21-day notice period has elapsed since mailing P1 notices")
  );
  children.push(
    checkboxP(false, "All pages are numbered and exhibits are properly marked")
  );

  children.push(spacer(300));

  // Confirmation signature
  children.push(boldP("APPLICANT CONFIRMATION", { spacing: { after: 120 } }));
  children.push(
    p(
      "I confirm that I have reviewed this checklist and all required documents are included in my probate application package."
    )
  );

  children.push(spacer(200));

  // Signature lines
  children.push(
    new Paragraph({
      children: [
        new TextRun({ text: "Signature: ", size: 22, font: "Arial" }),
        new TextRun({ text: underline(40), size: 22, font: "Arial" }),
      ],
      spacing: { after: 120 },
    })
  );

  children.push(
    new Paragraph({
      children: [
        new TextRun({ text: "Print Name: ", size: 22, font: "Arial" }),
        new TextRun({ text: underline(38), size: 22, font: "Arial" }),
      ],
      spacing: { after: 120 },
    })
  );

  children.push(
    new Paragraph({
      children: [
        new TextRun({ text: "Date: ", size: 22, font: "Arial" }),
        new TextRun({ text: underline(20), size: 22, font: "Arial" }),
      ],
      spacing: { after: 120 },
    })
  );

  children.push(spacer(200));

  // Registry info
  children.push(
    p(`Filing at: ${data.registry} Court Registry`, {
      italic: true,
      alignment: AlignmentType.CENTER,
    })
  );

  const doc = new Document({
    sections: [{ properties: {}, children }],
  });

  const buffer = await Packer.toBuffer(doc);
  return Buffer.from(buffer);
}
