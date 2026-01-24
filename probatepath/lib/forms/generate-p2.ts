import { Document, Packer, Paragraph, TextRun, AlignmentType } from "docx";
import type { EstateData } from "./types";
import {
  p,
  boldP,
  centered,
  checkbox,
  checkboxP,
  fieldRow,
  fullName,
  grantTypeText,
  hasWill,
  line,
  signatureBlock,
  spacer,
} from "./docx-utils";

export async function generateP2(data: EstateData): Promise<Buffer> {
  const children: Paragraph[] = [];

  // --- Form Header ---
  children.push(centered("Form P2 (Rule 25-3(2))", { bold: true }));
  children.push(spacer(120));

  // No. and Registry - right aligned
  const fileNum = data.fileNumber || "________";
  children.push(
    p([
      new TextRun({ text: "No. " + fileNum, size: 22, font: "Arial" }),
    ], { alignment: AlignmentType.RIGHT })
  );
  children.push(
    p([
      new TextRun({ text: data.registry + " Registry", size: 22, font: "Arial" }),
    ], { alignment: AlignmentType.RIGHT })
  );
  children.push(spacer(200));

  // Court title
  children.push(centered("IN THE SUPREME COURT OF BRITISH COLUMBIA", { bold: true, size: 28 }));
  children.push(spacer(200));

  // Estate of deceased
  const deceasedFullName = fullName(
    data.deceased.firstName,
    data.deceased.middleName,
    data.deceased.lastName
  ).toUpperCase();
  children.push(
    p([
      new TextRun({ text: "In the Matter of the Estate of ", size: 22, font: "Arial" }),
      new TextRun({ text: deceasedFullName, size: 22, font: "Arial", bold: true }),
      new TextRun({ text: ", Deceased", size: 22, font: "Arial" }),
    ], { alignment: AlignmentType.CENTER })
  );
  children.push(spacer(200));

  // Form title
  children.push(centered("SUBMISSION FOR ESTATE GRANT", { bold: true }));
  children.push(spacer(200));

  // --- Introductory paragraph ---
  const applicantNames = data.applicants
    .map((a) => fullName(a.firstName, a.middleName, a.lastName))
    .join(" and ");
  children.push(
    p([
      new TextRun({ text: "This submission for estate grant is submitted by: ", size: 22, font: "Arial" }),
      new TextRun({ text: applicantNames + ".", size: 22, font: "Arial", bold: true }),
    ])
  );
  children.push(spacer(120));

  // --- Grant type checkboxes ---
  children.push(boldP("The applicant(s) apply for:"));
  children.push(spacer(60));

  children.push(
    checkboxP(data.grantType === "probate", "a grant of probate")
  );
  children.push(
    checkboxP(data.grantType === "admin_with_will", "a grant of administration with will annexed")
  );
  children.push(
    checkboxP(data.grantType === "admin_without_will", "a grant of administration without will annexed")
  );
  children.push(
    checkboxP(
      data.grantType === "ancillary_probate" || data.grantType === "ancillary_admin_with_will",
      "an ancillary grant of probate / administration with will annexed"
    )
  );
  children.push(
    checkboxP(
      data.grantType === "ancillary_admin_without_will",
      "an ancillary grant of administration without will annexed"
    )
  );
  children.push(spacer(120));

  // --- Submitting affidavit checkbox ---
  const affidavitFormText = data.affidavit.isJoint
    ? "a joint affidavit (Form " + data.affidavit.form + ")"
    : "an affidavit (Form " + data.affidavit.form + ")";
  children.push(
    checkboxP(true, "The applicant(s) are submitting " + affidavitFormText + " in support of this submission for estate grant.")
  );
  children.push(spacer(120));

  // --- Certified copies checkboxes ---
  children.push(boldP("The applicant(s) request certified copies of the following:"));
  children.push(spacer(60));

  const egCount = data.certifiedCopies.estateGrant;
  const aoiCount = data.certifiedCopies.authToObtainInfo;
  const adCount = data.certifiedCopies.affidavitDomiciled;
  const andCount = data.certifiedCopies.affidavitNonDomiciled;

  children.push(
    checkboxP(
      egCount > 0,
      (egCount || "___") + " certified cop" + (egCount === 1 ? "y" : "ies") + " of the estate grant"
    )
  );
  children.push(
    checkboxP(
      aoiCount > 0,
      (aoiCount || "___") + " certified cop" + (aoiCount === 1 ? "y" : "ies") + " of the authorization to obtain estate information"
    )
  );
  children.push(
    checkboxP(
      adCount > 0,
      (adCount || "___") + " certified cop" + (adCount === 1 ? "y" : "ies") + " of the affidavit (domiciled in British Columbia)"
    )
  );
  children.push(
    checkboxP(
      andCount > 0,
      (andCount || "___") + " certified cop" + (andCount === 1 ? "y" : "ies") + " of the affidavit (not domiciled in British Columbia)"
    )
  );
  children.push(spacer(200));

  // --- Parts description ---
  children.push(boldP("This submission for estate grant has 4 Parts:"));
  children.push(spacer(60));
  children.push(p("Part 1 - Information about the deceased", { indent: { left: 360 } }));
  children.push(p("Part 2 - Contact information for the applicant(s)", { indent: { left: 360 } }));
  children.push(p("Part 3 - Documents filed with this submission for estate grant", { indent: { left: 360 } }));
  children.push(p("Part 4 - Schedule", { indent: { left: 360 } }));
  children.push(spacer(200));

  // --- Date and signature block ---
  children.push(
    p([
      new TextRun({ text: "Date: ", size: 22, font: "Arial" }),
      new TextRun({ text: data.submissionDate || line(20), size: 22, font: "Arial" }),
    ])
  );
  children.push(...signatureBlock({ showDate: false }));
  children.push(spacer(300));

  // ===================================================================
  // PART 1: INFORMATION ABOUT THE DECEASED
  // ===================================================================
  children.push(centered("Part 1: INFORMATION ABOUT THE DECEASED", { bold: true, size: 24 }));
  children.push(spacer(200));

  // Full legal name in CAPS
  children.push(
    p([
      new TextRun({ text: "Full legal name of the deceased: ", size: 22, font: "Arial" }),
      new TextRun({ text: deceasedFullName, size: 22, font: "Arial", bold: true }),
    ])
  );
  children.push(spacer(120));

  // Aliases
  if (data.deceased.aliases.length > 0) {
    children.push(boldP("Also known as:"));
    data.deceased.aliases.forEach((alias, idx) => {
      children.push(p((idx + 1) + ". " + alias, { indent: { left: 360 } }));
    });
  } else {
    children.push(p("Also known as: N/A"));
  }
  children.push(spacer(120));

  // Address with labeled fields
  children.push(boldP("Last address of the deceased:"));
  children.push(spacer(60));

  const addr = data.deceased.lastAddress;
  const streetDisplay = [addr.streetNumber, addr.streetName].filter(Boolean).join(" ");
  children.push(fieldRow("Street number and street name", streetDisplay || undefined));
  children.push(fieldRow("City/Town", addr.city));
  children.push(fieldRow("Province", addr.province));
  children.push(fieldRow("Country", addr.country));
  children.push(fieldRow("Postal Code", addr.postalCode));
  children.push(spacer(120));

  // Date of death
  children.push(
    p([
      new TextRun({ text: "Date of death: ", size: 22, font: "Arial" }),
      new TextRun({ text: data.deceased.dateOfDeath, size: 22, font: "Arial", bold: true }),
    ])
  );
  children.push(spacer(120));

  // Nisga'a citizen checkboxes
  children.push(boldP("Was the deceased a Nisga'a citizen?"));
  children.push(spacer(60));
  children.push(checkboxP(data.deceased.nisgaaCitizen === true, "Yes"));
  children.push(checkboxP(data.deceased.nisgaaCitizen === false, "No"));
  children.push(
    checkboxP(
      !!data.deceased.treatyFirstNation,
      "The deceased was a member of a treaty first nation: " + (data.deceased.treatyFirstNation || line(20))
    )
  );
  children.push(spacer(300));

  // ===================================================================
  // PART 2: CONTACT INFORMATION FOR THE APPLICANT(S)
  // ===================================================================
  children.push(centered("Part 2: CONTACT INFORMATION FOR THE APPLICANT(S)", { bold: true, size: 24 }));
  children.push(spacer(200));

  children.push(fieldRow("Street address for service", data.addressForService.street));
  if (data.addressForService.fax) {
    children.push(fieldRow("Fax number address for service", data.addressForService.fax));
  }
  if (data.addressForService.email) {
    children.push(fieldRow("E-mail address for service", data.addressForService.email));
  }
  children.push(fieldRow("Telephone number", data.addressForService.phone));
  children.push(spacer(300));

  // ===================================================================
  // PART 3: DOCUMENTS FILED WITH THIS SUBMISSION FOR ESTATE GRANT
  // ===================================================================
  children.push(centered("Part 3: DOCUMENTS FILED WITH THIS SUBMISSION FOR ESTATE GRANT", { bold: true, size: 24 }));
  children.push(spacer(200));

  // Item 1: Affidavit of applicant
  const affidavitDesc = data.affidavit.isJoint
    ? "Joint affidavit of applicant(s) (Form " + data.affidavit.form + ")"
    : "Affidavit of applicant (Form " + data.affidavit.form + ")";
  children.push(
    p([
      new TextRun({ text: "1. " + checkbox(true) + " ", size: 22, font: "Arial" }),
      new TextRun({ text: affidavitDesc, size: 22, font: "Arial" }),
    ])
  );

  // Item 2: Original will
  const willExists = hasWill(data.grantType) && data.will?.exists;
  children.push(
    p([
      new TextRun({ text: "2. " + checkbox(!!willExists) + " ", size: 22, font: "Arial" }),
      new TextRun({ text: "Original will (and codicil(s), if applicable)", size: 22, font: "Arial" }),
    ])
  );

  // Item 3: P8 affidavit(s)
  children.push(
    p([
      new TextRun({ text: "3. " + checkbox(data.affidavit.hasP8Affidavits) + " ", size: 22, font: "Arial" }),
      new TextRun({ text: "Affidavit(s) (Form P8) of witness(es) to the will", size: 22, font: "Arial" }),
    ])
  );

  // Item 4: P9 Affidavit(s) of delivery
  const hasDeliveries = data.affidavitsOfDelivery.length > 0;
  children.push(
    p([
      new TextRun({ text: "4. " + checkbox(hasDeliveries) + " ", size: 22, font: "Arial" }),
      new TextRun({ text: "Affidavit(s) of delivery (Form P9)", size: 22, font: "Arial" }),
    ])
  );

  // Item 5: P10/P11 Affidavit of assets
  children.push(
    p([
      new TextRun({ text: "5. " + checkbox(data.submittingAffidavitOfAssets) + " ", size: 22, font: "Arial" }),
      new TextRun({ text: "Affidavit of assets and liabilities (Form P10 or P11)", size: 22, font: "Arial" }),
    ])
  );

  // Item 6: Translation affidavit
  const hasTranslation = !data.allDocumentsInEnglish && !!data.translatorAffidavit;
  children.push(
    p([
      new TextRun({ text: "6. " + checkbox(!!hasTranslation) + " ", size: 22, font: "Arial" }),
      new TextRun({ text: "Affidavit of translator", size: 22, font: "Arial" }),
    ])
  );

  // Item 7: Renunciation(s)
  const hasRenunciations = (data.otherExecutors || []).some((e) => e.reason === "renounced");
  children.push(
    p([
      new TextRun({ text: "7. " + checkbox(hasRenunciations) + " ", size: 22, font: "Arial" }),
      new TextRun({ text: "Renunciation(s)", size: 22, font: "Arial" }),
    ])
  );

  // Item 8: Foreign grant
  const hasForeignGrant = !!data.foreignGrant;
  children.push(
    p([
      new TextRun({ text: "8. " + checkbox(hasForeignGrant) + " ", size: 22, font: "Arial" }),
      new TextRun({ text: "Certified copy of the foreign grant (and will, if applicable)", size: 22, font: "Arial" }),
    ])
  );
  children.push(spacer(300));

  // ===================================================================
  // PART 4: SCHEDULE
  // ===================================================================
  children.push(centered("Part 4: SCHEDULE", { bold: true, size: 24 }));
  children.push(spacer(200));

  children.push(
    p("The attached schedule contains information relevant to this submission for estate grant.")
  );
  children.push(spacer(300));

  // ===================================================================
  // SCHEDULE (for probate / admin with will)
  // ===================================================================
  if (data.grantType === "probate" || data.grantType === "admin_with_will") {
    children.push(centered("SCHEDULE", { bold: true, size: 24 }));
    children.push(spacer(200));

    // --- Section 1: Executors with reserved rights ---
    children.push(boldP("Section 1: Executors with reserved rights"));
    children.push(spacer(60));

    if (data.executorsWithReservedRights.length > 0) {
      children.push(
        p("The following executor(s) have had their rights reserved (i.e. they are named as executors in the will but are not applying and have not renounced):")
      );
      children.push(spacer(60));

      children.push(p("Each person listed below meets the following criteria:", { italic: true }));
      children.push(
        p("(a) is named as an executor in the will;", { indent: { left: 720 } })
      );
      children.push(
        p("(b) is not a person to whom the estate grant is to issue;", { indent: { left: 720 } })
      );
      children.push(
        p("(c) has not renounced as executor;", { indent: { left: 720 } })
      );
      children.push(
        p("(d) has not been removed as executor by order of the court.", { indent: { left: 720 } })
      );
      children.push(spacer(60));

      data.executorsWithReservedRights.forEach((name, idx) => {
        children.push(p((idx + 1) + ". " + name, { indent: { left: 360 } }));
      });
    } else {
      children.push(p("None."));
    }
    children.push(spacer(200));

    // --- Section 2: Persons entitled to notice ---
    children.push(boldP("Section 2: Persons entitled to notice"));
    children.push(spacer(120));

    // (a) Spouse
    children.push(boldP("(a) Spouse of the deceased:"));
    children.push(spacer(60));
    if (data.spouse.status === "surviving" && data.spouse.survivingName) {
      children.push(p(data.spouse.survivingName, { indent: { left: 360 } }));
    } else if (data.spouse.status === "deceased" && data.spouse.name) {
      children.push(p(data.spouse.name + " (deceased)", { indent: { left: 360 } }));
    } else if (data.spouse.status === "never_married") {
      children.push(p("The deceased was never married / had no spouse.", { indent: { left: 360 } }));
    } else {
      children.push(p("N/A", { indent: { left: 360 } }));
    }
    children.push(spacer(120));

    // (b) Children of the deceased
    children.push(boldP("(b) Children of the deceased:"));
    children.push(spacer(60));
    if (data.children.length > 0) {
      data.children.forEach((child, idx) => {
        const statusText = child.status === "deceased" ? " (deceased)" : "";
        children.push(p((idx + 1) + ". " + child.name + statusText, { indent: { left: 360 } }));
      });
    } else {
      children.push(p("None.", { indent: { left: 360 } }));
    }
    children.push(spacer(120));

    // (c) Beneficiaries named in the will
    children.push(boldP("(c) Beneficiaries named in the will:"));
    children.push(spacer(60));
    if (data.beneficiaries.length > 0) {
      data.beneficiaries.forEach((b, idx) => {
        const statusText = b.status === "deceased" ? " (deceased)" : "";
        children.push(
          p((idx + 1) + ". " + b.name + " (Relationship, status)" + statusText, { indent: { left: 360 } })
        );
      });
    } else {
      children.push(p("None.", { indent: { left: 360 } }));
    }
    children.push(spacer(120));

    // (d) Intestate successors
    children.push(boldP("(d) Intestate successors (if partial intestacy):"));
    children.push(spacer(60));
    if (data.intestateSuccessors.length > 0) {
      data.intestateSuccessors.forEach((s, idx) => {
        const display = s.name
          ? s.name + (s.relationship ? " (" + s.relationship + ")" : "")
          : s.relationship || "N/A";
        children.push(p((idx + 1) + ". " + display, { indent: { left: 360 } }));
      });
    } else {
      children.push(p("None.", { indent: { left: 360 } }));
    }
    children.push(spacer(120));

    // (e) Citors
    children.push(boldP("(e) Citors:"));
    children.push(spacer(60));
    if (data.citors.length > 0) {
      data.citors.forEach((citor, idx) => {
        children.push(p((idx + 1) + ". " + citor, { indent: { left: 360 } }));
      });
    } else {
      children.push(p("None.", { indent: { left: 360 } }));
    }
    children.push(spacer(200));
  }

  // ===================================================================
  // Build Document
  // ===================================================================
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
