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

  // Section 1: Affidavit filing
  children.push(boldP("1"));
  children.push(spacer(60));

  const isSingleApplicant = data.applicants.length === 1;
  const affidavitForm = data.affidavit.form;

  children.push(
    checkboxP(isSingleApplicant && !data.affidavit.isJoint,
      `There is one applicant to this submission for estate grant and a Form ${affidavitForm} affidavit is filed with this submission for estate grant.`,
      { indent: 720 })
  );
  children.push(
    checkboxP(!isSingleApplicant && data.affidavit.isJoint,
      `There are 2 or more applicants to this submission for estate grant and a joint Form ${affidavitForm} affidavit on behalf of all applicants is filed with this submission for estate grant.`,
      { indent: 720 })
  );
  children.push(
    checkboxP(!isSingleApplicant && !data.affidavit.isJoint && data.affidavit.hasP8Affidavits,
      `There are 2 or more applicants to this submission for estate grant and a Form ${affidavitForm} affidavit is filed with this submission for estate grant and ${data.affidavit.p8Count || "___"} affidavit(s) in Form P8 is/are filed with this submission for estate grant.`,
      { indent: 720 })
  );
  children.push(spacer(120));

  // Section 2: Affidavits of delivery
  children.push(boldP("2"));
  children.push(spacer(60));

  const hasDeliveries = data.affidavitsOfDelivery.length > 0 && !data.noDeliveryRequired;
  children.push(
    checkboxP(hasDeliveries,
      "Filed with this submission for estate grant is/are the following Affidavit(s) of Delivery in Form P9 that confirms/collectively confirm that the documents referred to in Rule 25-2 were delivered to all of the persons to whom, under that rule, the documents were required to be delivered:",
      { indent: 720 })
  );
  if (hasDeliveries) {
    for (const aff of data.affidavitsOfDelivery) {
      children.push(
        p(`Affidavit of ${aff.name} sworn ${aff.dateSworn || "________________"}`, { indent: { left: 1080 } })
      );
    }
  }
  children.push(spacer(60));
  children.push(
    checkboxP(data.noDeliveryRequired,
      "No affidavit of delivery is attached. In accordance with Rule 25-2, no one, other than the applicant(s), is entitled to notice.",
      { indent: 720 })
  );
  children.push(spacer(120));

  // Section 3: Vital Statistics certificate
  children.push(boldP("3"));
  children.push(spacer(60));
  children.push(
    p("Filed with this submission for estate grant are 2 copies of the certificate of the chief executive officer under the Vital Statistics Act indicating the results of a search for a wills notice filed by or on behalf of the deceased.")
  );
  children.push(spacer(120));

  // Section 4: Will / Grant type
  children.push(boldP("4"));
  children.push(spacer(60));

  const willDate = data.will?.date || "________________";
  const willExists = hasWill(data.grantType) && data.will?.exists;
  const originalAvailable = data.will?.originalAvailable !== false;

  children.push(
    checkboxP(data.grantType === "probate" && willExists && originalAvailable,
      `This application is for a grant of probate, or a grant of administration with will annexed, in relation to the will of the deceased dated ${willDate}, and filed with this submission for estate grant is the originally signed version of the will and 2 copies of the will.`,
      { indent: 720 })
  );
  children.push(
    checkboxP(data.grantType === "probate" && willExists && !originalAvailable,
      `This application is for a grant of probate, or a grant of administration with will annexed, in relation to the will of the deceased dated ${willDate}, and, because the originally signed version of the will is not available, filed with this submission for estate grant are 3 copies of the will.`,
      { indent: 720 })
  );
  children.push(
    checkboxP(data.grantType === "admin_without_will",
      "This application is for a grant of administration without will annexed.",
      { indent: 720 })
  );
  children.push(spacer(120));

  // Section 5: Assets affidavit
  children.push(boldP("5"));
  children.push(spacer(60));
  children.push(
    checkboxP(data.submittingAffidavitOfAssets,
      "Filed with this submission for estate grant is an affidavit of assets and liabilities (Form P10 or P11).",
      { indent: 720 })
  );
  children.push(spacer(120));

  // Section 6: Translation
  const hasTranslation = !data.allDocumentsInEnglish && !!data.translatorAffidavit;
  children.push(boldP("6"));
  children.push(spacer(60));
  children.push(
    checkboxP(!!hasTranslation,
      "Filed with this submission for estate grant is an affidavit of a translator.",
      { indent: 720 })
  );
  children.push(
    checkboxP(!hasTranslation,
      "All documents filed with this submission for estate grant are in the English language.",
      { indent: 720 })
  );
  children.push(spacer(120));

  // Section 7: Renunciations
  const hasRenunciations = (data.otherExecutors || []).some((e) => e.reason === "renounced");
  children.push(boldP("7"));
  children.push(spacer(60));
  children.push(
    checkboxP(hasRenunciations,
      "Filed with this submission for estate grant is/are renunciation(s) of executorship.",
      { indent: 720 })
  );
  children.push(
    checkboxP(!hasRenunciations,
      "No renunciation of executorship is filed with this submission for estate grant.",
      { indent: 720 })
  );
  children.push(spacer(120));

  // Section 8: Foreign grant
  const hasForeignGrant = !!data.foreignGrant;
  children.push(boldP("8"));
  children.push(spacer(60));
  children.push(
    checkboxP(hasForeignGrant,
      "Filed with this submission for estate grant is a certified copy of the foreign grant (and will, if applicable).",
      { indent: 720 })
  );
  children.push(
    checkboxP(!hasForeignGrant,
      "No foreign grant is applicable to this submission for estate grant.",
      { indent: 720 })
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
    children.push(boldP("Section 1"));
    children.push(spacer(60));

    children.push(p("Indicate if there is any person, other than the applicant, who meets all of the following criteria and therefore is an executor whose right should be reserved on the grant.", { italic: true }));
    children.push(spacer(60));

    children.push(boldP("Criteria"));
    children.push(spacer(60));
    children.push(p("(a) the person is named in the will as executor or alternate executor;", { indent: { left: 720 } }));
    children.push(p("(b) the person is a co-executor with the applicant(s) (i.e. has a right to make an application for an estate grant that is equal to the applicant's(s') right to make that application);", { indent: { left: 720 } }));
    children.push(p("(c) the person has not renounced executorship;", { indent: { left: 720 } }));
    children.push(p("(d) the person is alive at the date of this submission for estate grant;", { indent: { left: 720 } }));
    children.push(p("(e) the person has not become incapable of managing the person's affairs.", { indent: { left: 720 } }));
    children.push(spacer(120));

    const hasReservedRights = data.executorsWithReservedRights.length > 0;
    children.push(
      checkboxP(!hasReservedRights, "There is no person who meets all of the foregoing criteria.")
    );
    children.push(
      checkboxP(hasReservedRights, "The following person(s) meet(s) all of the foregoing criteria:")
    );
    if (hasReservedRights) {
      children.push(spacer(60));
      data.executorsWithReservedRights.forEach((name, idx) => {
        children.push(p((idx + 1) + ". " + name.toUpperCase(), { indent: { left: 360 } }));
      });
    }
    children.push(spacer(200));

    // --- Section 2: Persons entitled to notice ---
    children.push(boldP("Section 2"));
    children.push(spacer(120));

    // (a) Spouse
    children.push(p("(a) spouse, if any, of the deceased [see section 2 of the Wills, Estates and Succession Act]", { bold: true }));
    children.push(spacer(60));
    if (data.spouse.status === "surviving" && data.spouse.survivingName) {
      children.push(p(data.spouse.survivingName.toUpperCase() + " (surviving)", { indent: { left: 360 } }));
    } else if (data.spouse.status === "deceased" && data.spouse.name) {
      children.push(p(data.spouse.name.toUpperCase() + " (deceased)", { indent: { left: 360 } }));
    } else if (data.spouse.status === "never_married") {
      children.push(p("Never married.", { indent: { left: 360 } }));
    } else {
      children.push(p("N/A", { indent: { left: 360 } }));
    }
    children.push(spacer(120));

    // (b) Children
    children.push(p("(b) child(ren), if any, of the deceased", { bold: true }));
    children.push(spacer(60));
    if (data.children.length > 0) {
      data.children.forEach((child, idx) => {
        const statusText = child.status === "deceased" ? " (deceased)" : " (surviving)";
        children.push(p((idx + 1) + ". " + child.name.toUpperCase() + statusText, { indent: { left: 360 } }));
      });
    } else {
      children.push(p("None.", { indent: { left: 360 } }));
    }
    children.push(spacer(120));

    // (c) Beneficiaries named in will
    children.push(p("(c) each person, if any, who is a beneficiary under the will and is not named in paragraph (a) or (b)", { bold: true }));
    children.push(spacer(60));
    if (data.beneficiaries.length > 0) {
      data.beneficiaries.forEach((b, idx) => {
        const statusText = b.status === "deceased" ? " (deceased)" : " (surviving)";
        children.push(
          p((idx + 1) + ". " + b.name.toUpperCase() + statusText, { indent: { left: 360 } })
        );
      });
    } else {
      children.push(p("None.", { indent: { left: 360 } }));
    }
    children.push(spacer(120));

    // (d) Intestate successors
    children.push(p("(d) each person, if any, who would be entitled to a share of the estate if the deceased had died without a will", { bold: true }));
    children.push(spacer(60));
    if (data.intestateSuccessors.length > 0) {
      data.intestateSuccessors.forEach((s, idx) => {
        const display = s.name
          ? s.name.toUpperCase() + (s.relationship ? " (" + s.relationship + ")" : "")
          : s.relationship || "N/A";
        children.push(p((idx + 1) + ". " + display, { indent: { left: 360 } }));
      });
    } else {
      children.push(p("None.", { indent: { left: 360 } }));
    }
    children.push(spacer(120));

    // (e) Citors
    children.push(p("(e) each person, if any, who has filed a citation", { bold: true }));
    children.push(spacer(60));
    if (data.citors.length > 0) {
      data.citors.forEach((citor, idx) => {
        children.push(p((idx + 1) + ". " + citor.toUpperCase(), { indent: { left: 360 } }));
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
