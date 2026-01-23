import { Document, Packer, Paragraph, TextRun, AlignmentType } from "docx";
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
  grantTypeText,
  hasWill as grantHasWill,
  isAncillary,
  line,
  sectionHeader,
  signatureBlock,
  spacer,
} from "./docx-utils";

export async function generateP2(data: EstateData): Promise<Buffer> {
  const children: Paragraph[] = [];

  // Form header
  children.push(centered("Form P2 (Rule 25-3 (2))", { bold: true, size: 24 }));
  children.push(spacer(80));
  children.push(centered("SUBMISSION FOR ESTATE GRANT", { bold: true, size: 26 }));
  children.push(spacer(60));

  // Registry and file number
  children.push(fieldRow("No.", data.fileNumber || ""));
  children.push(centered("In the Supreme Court of British Columbia", { size: 22 }));
  children.push(spacer(60));

  // Matter heading
  const deceasedFullName = fullName(data.deceased.firstName, data.deceased.middleName, data.deceased.lastName);
  children.push(
    p([
      new TextRun({ text: "In the matter of the estate of ", size: 22, font: "Arial" }),
      new TextRun({ text: deceasedFullName, size: 22, font: "Arial", bold: true }),
      new TextRun({ text: ", deceased", size: 22, font: "Arial" }),
    ])
  );
  children.push(spacer(120));

  // Opening statement
  const applicantNames = data.applicants
    .map((a) => fullName(a.firstName, a.middleName, a.lastName))
    .join(", ");
  children.push(
    p(`This submission for estate grant is submitted by/on behalf of: ${applicantNames}`)
  );
  children.push(spacer(120));

  // Application type selection (5 options)
  const gt = data.grantType;
  children.push(
    checkboxP(
      gt === "probate",
      `${grantTypeText("probate")} and the Schedule for Grant of Probate or Grant of Administration with Will Annexed is completed.`
    )
  );
  children.push(
    checkboxP(
      gt === "admin_with_will",
      `${grantTypeText("admin_with_will")} and the Schedule for Grant of Probate or Grant of Administration with Will Annexed is completed.`
    )
  );
  children.push(
    checkboxP(
      gt === "admin_without_will",
      `${grantTypeText("admin_without_will")} and the Schedule for Grant of Administration without Will Annexed is completed.`
    )
  );
  children.push(
    checkboxP(
      gt === "ancillary_probate" || gt === "ancillary_admin_with_will",
      `an ancillary grant of probate or an ancillary grant of administration with will annexed and the Schedule for Ancillary Grant of Probate or Ancillary Grant of Administration with Will Annexed is completed.`
    )
  );
  children.push(
    checkboxP(
      gt === "ancillary_admin_without_will",
      `an ancillary grant of administration without will annexed and the Schedule for Ancillary Grant of Administration without Will Annexed is completed.`
    )
  );
  children.push(spacer(120));

  // P10/P11 submission vs authorization
  children.push(
    checkboxP(
      data.submittingAffidavitOfAssets,
      "submitting with this submission for estate grant an affidavit of assets and liabilities in Form P10 or P11."
    )
  );
  children.push(
    checkboxP(
      !data.submittingAffidavitOfAssets,
      "seeking an authorization to obtain estate information."
    )
  );
  children.push(spacer(120));

  // Certified copies
  if (data.certifiedCopies) {
    children.push(boldP("Certified copies requested:"));
    if (data.certifiedCopies.estateGrant > 0) {
      children.push(
        checkboxP(true, `${data.certifiedCopies.estateGrant} certified copy(ies) of the estate grant.`)
      );
    }
    if (data.certifiedCopies.authToObtainInfo > 0) {
      children.push(
        checkboxP(true, `${data.certifiedCopies.authToObtainInfo} certified copy(ies) of the authorization to obtain estate information.`)
      );
    }
    if (data.certifiedCopies.affidavitDomiciled > 0) {
      children.push(
        checkboxP(true, `${data.certifiedCopies.affidavitDomiciled} certified copy(ies) of the affidavit of assets and liabilities (domiciled).`)
      );
    }
    if (data.certifiedCopies.affidavitNonDomiciled > 0) {
      children.push(
        checkboxP(true, `${data.certifiedCopies.affidavitNonDomiciled} certified copy(ies) of the affidavit of assets and liabilities (non-domiciled).`)
      );
    }
  }
  children.push(spacer(200));

  // ===== PART 1 =====
  children.push(sectionHeader("PART 1 -- INFORMATION ABOUT THE DECEASED"));
  children.push(spacer(60));

  children.push(fieldRow("First name", data.deceased.firstName));
  children.push(fieldRow("Middle name(s)", data.deceased.middleName || ""));
  children.push(fieldRow("Last name/family name", data.deceased.lastName));
  children.push(spacer(60));

  // Aliases
  if (data.deceased.aliases.length > 0) {
    children.push(
      p(`Other names in which the deceased held or may have held an interest in property: ${data.deceased.aliases.join(", ")}`)
    );
  } else {
    children.push(
      p("Other names in which the deceased held or may have held an interest in property: None")
    );
  }
  children.push(spacer(60));

  // Last address
  children.push(
    p(`Last residential address of the deceased: ${formatAddress(data.deceased.lastAddress)}`)
  );
  children.push(spacer(60));

  // Date of death
  children.push(fieldRow("Deceased's date of death", data.deceased.dateOfDeath));
  children.push(spacer(120));

  // First Nations status
  children.push(
    p("The deceased was, at the time of death:")
  );
  children.push(
    checkboxP(
      !data.deceased.nisgaaCitizen && !data.deceased.treatyFirstNation,
      "neither a Nisga'a citizen nor a member of a treaty first nation."
    )
  );
  children.push(
    checkboxP(
      data.deceased.nisgaaCitizen,
      "a Nisga'a citizen."
    )
  );
  children.push(
    checkboxP(
      !!data.deceased.treatyFirstNation,
      `a member of the ${data.deceased.treatyFirstNation || line(20)} treaty first nation.`
    )
  );
  children.push(spacer(200));

  // ===== PART 2 =====
  children.push(sectionHeader("PART 2 -- CONTACT INFORMATION FOR THE APPLICANT(S)"));
  children.push(spacer(60));

  children.push(fieldRow("Street address for service", data.addressForService.street));
  children.push(fieldRow("Fax number (if any)", data.addressForService.fax || ""));
  children.push(fieldRow("E-mail address (if any)", data.addressForService.email || ""));
  children.push(fieldRow("Telephone number", data.addressForService.phone));
  children.push(spacer(200));

  // ===== PART 3 =====
  children.push(sectionHeader("PART 3 -- DOCUMENTS FILED WITH THIS SUBMISSION FOR ESTATE GRANT"));
  children.push(spacer(60));

  // Section 1: Applicant Affidavits
  children.push(boldP("1. Affidavit of applicant"));
  const affForm = data.affidavit.form;
  const singleApplicant = data.applicants.length === 1;

  children.push(
    checkboxP(
      singleApplicant && !data.affidavit.hasP8Affidavits,
      `There is one applicant for this estate grant and a Form ${affForm} affidavit is filed.`
    )
  );
  children.push(
    checkboxP(
      !singleApplicant && data.affidavit.isJoint && !data.affidavit.hasP8Affidavits,
      `There are 2 or more applicants for this estate grant and a joint Form ${affForm} affidavit is filed on behalf of all applicants.`
    )
  );
  children.push(
    checkboxP(
      data.affidavit.hasP8Affidavits,
      `There are 2 or more applicants for this estate grant and a Form ${affForm} affidavit is filed and ${data.affidavit.p8Count || line(3)} affidavit(s) in Form P8 are filed.`
    )
  );
  children.push(spacer(120));

  // Section 2: Affidavits of Delivery
  children.push(boldP("2. Affidavit(s) of delivery"));
  if (!data.noDeliveryRequired && data.affidavitsOfDelivery.length > 0) {
    children.push(
      checkboxP(
        true,
        "The following affidavit(s) of delivery are filed confirming delivery in accordance with Rule 25-2:"
      )
    );
    for (const aff of data.affidavitsOfDelivery) {
      children.push(
        p(`   Affidavit of ${aff.name}, sworn ${aff.dateSworn}`, { indent: { left: 720 } })
      );
    }
  } else {
    children.push(
      checkboxP(
        data.noDeliveryRequired,
        "No affidavit of delivery is attached. In accordance with Rule 25-2, no one, other than the applicant(s), is entitled to notice."
      )
    );
  }
  children.push(spacer(120));

  // Section 3: Vital Statistics Certificate
  children.push(boldP("3. Certificate under the Vital Statistics Act"));
  children.push(
    checkboxP(
      true,
      "2 copies of the certificate of the chief executive officer under the Vital Statistics Act are filed."
    )
  );
  children.push(spacer(120));

  // Section 4: Will or Foreign Grant
  children.push(boldP("4. Will and/or foreign grant"));
  buildSection4(children, data);
  children.push(spacer(120));

  // Section 5: Orders affecting will
  children.push(boldP("5. Orders affecting the will"));
  buildSection5(children, data);
  children.push(spacer(120));

  // Section 6: Documents referred to in will
  children.push(boldP("6. Documents referred to in the will"));
  buildSection6(children, data);
  children.push(spacer(120));

  // Section 7: Additional documents
  children.push(boldP("7. Additional documents"));
  if (data.additionalDocuments.length === 0) {
    children.push(
      checkboxP(true, "No documents other than those described in sections 1 to 6 are filed with this submission for estate grant.")
    );
  } else {
    children.push(
      checkboxP(true, "The following documents are filed with this submission for estate grant:")
    );
    for (const doc of data.additionalDocuments) {
      children.push(p(`   - ${doc}`, { indent: { left: 720 } }));
    }
  }
  children.push(spacer(120));

  // Section 8: Translation
  children.push(boldP("8. Translation"));
  children.push(
    checkboxP(
      data.allDocumentsInEnglish,
      "All documents filed with this submission for estate grant are written in the English language."
    )
  );
  if (!data.allDocumentsInEnglish && data.translatorAffidavit) {
    children.push(
      checkboxP(
        true,
        `An affidavit of translator in Form P12 of ${data.translatorAffidavit.translatorName} who has translated ${data.translatorAffidavit.documentTranslated} from ${data.translatorAffidavit.language} to English is filed.`
      )
    );
  }
  children.push(spacer(200));

  // ===== PART 4 =====
  children.push(sectionHeader("PART 4 -- SCHEDULE"));
  children.push(spacer(60));

  // Build appropriate schedule
  buildSchedule(children, data);

  // Signature
  children.push(spacer(240));
  children.push(
    p([
      new TextRun({ text: `Date: `, size: 22, font: "Arial" }),
      new TextRun({ text: data.submissionDate || line(20), size: 22, font: "Arial" }),
    ])
  );
  children.push(...signatureBlock({ showDate: false }));

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

function buildSection4(children: Paragraph[], data: EstateData): void {
  const gt = data.grantType;

  if (gt === "probate" || gt === "admin_with_will") {
    if (data.will?.originalAvailable) {
      children.push(
        checkboxP(
          true,
          `This application is for a grant of probate or a grant of administration with will annexed and the originally signed will and 2 copies of it are filed with this submission for estate grant.`
        )
      );
    } else {
      children.push(
        checkboxP(
          true,
          `This application is for a grant of probate or a grant of administration with will annexed and 3 copies of the will are filed. The original will is not available.`
        )
      );
    }
  } else if (gt === "admin_without_will") {
    children.push(
      checkboxP(true, "This application is for a grant of administration without will annexed.")
    );
  } else if (gt === "ancillary_probate" || gt === "ancillary_admin_with_will") {
    children.push(
      checkboxP(
        true,
        "This application is for an ancillary grant of probate or an ancillary grant of administration with will annexed and a certified copy of the foreign grant and a certified copy of the will (if it does not form part of the foreign grant) are filed."
      )
    );
  } else if (gt === "ancillary_admin_without_will") {
    children.push(
      checkboxP(
        true,
        "This application is for an ancillary grant of administration without will annexed and a certified copy of the foreign grant is filed."
      )
    );
  }
}

function buildSection5(children: Paragraph[], data: EstateData): void {
  const gt = data.grantType;

  if (gt === "admin_without_will" || gt === "ancillary_admin_without_will") {
    children.push(
      checkboxP(
        true,
        "This application is for a grant of administration without will annexed or an ancillary grant of administration without will annexed."
      )
    );
  } else if (gt === "ancillary_probate" || gt === "ancillary_admin_with_will") {
    if (data.will?.hasOrdersAffecting && data.will.ordersAffectingWill?.length) {
      children.push(
        checkboxP(
          true,
          "This application is for an ancillary grant of probate or an ancillary grant of administration with will annexed and the following order(s) affect(s) the validity or content of the will referred to in section 4:"
        )
      );
      for (const order of data.will.ordersAffectingWill) {
        const filedText = order.filedInProceeding
          ? " (filed in the proceeding to which this submission relates)"
          : "";
        children.push(
          p(`   Order dated ${order.date}${filedText}`, { indent: { left: 720 } })
        );
      }
    } else {
      children.push(
        checkboxP(
          true,
          "This application is for an ancillary grant of probate or an ancillary grant of administration with will annexed and there are no orders affecting the validity or content of the will referred to in section 4."
        )
      );
    }
  } else {
    // Regular probate or admin with will
    if (data.will?.hasOrdersAffecting && data.will.ordersAffectingWill?.length) {
      children.push(
        checkboxP(
          true,
          "This application is for a grant of probate or a grant of administration with will annexed and the following order(s) affect(s) the validity or content of the will referred to in section 4:"
        )
      );
      for (const order of data.will.ordersAffectingWill) {
        const filedText = order.filedInProceeding
          ? " (filed in the proceeding to which this submission relates)"
          : "";
        children.push(
          p(`   Order dated ${order.date}${filedText}`, { indent: { left: 720 } })
        );
      }
    } else {
      children.push(
        checkboxP(
          true,
          "This application is for a grant of probate or a grant of administration with will annexed and there are no orders affecting the validity or content of the will referred to in section 4."
        )
      );
    }
  }
}

function buildSection6(children: Paragraph[], data: EstateData): void {
  const gt = data.grantType;

  if (gt === "admin_without_will" || gt === "ancillary_admin_without_will") {
    children.push(
      checkboxP(
        true,
        "This application is for a grant of administration without will annexed or an ancillary grant of administration without will annexed."
      )
    );
    return;
  }

  if (!data.will?.refersToDocuments) {
    children.push(
      checkboxP(
        true,
        "The will does not refer to any documents or refers only to documents attached to the will."
      )
    );
    return;
  }

  // Will refers to documents
  const docs = data.will.documentsReferred || [];
  const attachedDocs = docs.filter((d) => d.attached);
  const cannotObtainDocs = docs.filter((d) => d.cannotObtain);
  const notTestamentaryDocs = docs.filter((d) => d.notTestamentary);

  if (attachedDocs.length > 0) {
    children.push(
      checkboxP(
        true,
        "The will refers to one or more documents and the following document(s) are filed with this submission for estate grant:"
      )
    );
    for (const doc of attachedDocs) {
      children.push(p(`   - ${doc.name}`, { indent: { left: 720 } }));
    }
  }

  if (cannotObtainDocs.length > 0) {
    children.push(
      checkboxP(
        true,
        "The will refers to one or more documents that cannot be obtained:"
      )
    );
    for (const doc of cannotObtainDocs) {
      children.push(p(`   - ${doc.name}`, { indent: { left: 720 } }));
    }
  }

  if (notTestamentaryDocs.length > 0) {
    children.push(
      checkboxP(
        true,
        "The will refers to one or more documents not attached to this submission because the document(s) referred to are not testamentary in nature:"
      )
    );
    for (const doc of notTestamentaryDocs) {
      const reason = doc.notTestamentaryReason ? ` (${doc.notTestamentaryReason})` : "";
      children.push(p(`   - ${doc.name}${reason}`, { indent: { left: 720 } }));
    }
  }
}

function buildSchedule(children: Paragraph[], data: EstateData): void {
  const gt = data.grantType;

  if (gt === "probate" || gt === "admin_with_will") {
    buildScheduleProbate(children, data);
  } else if (gt === "admin_without_will") {
    buildScheduleAdminNoWill(children, data);
  } else if (gt === "ancillary_probate" || gt === "ancillary_admin_with_will") {
    buildScheduleAncillaryProbate(children, data);
  } else if (gt === "ancillary_admin_without_will") {
    buildScheduleAncillaryAdminNoWill(children, data);
  }
}

function buildScheduleProbate(children: Paragraph[], data: EstateData): void {
  children.push(
    boldP("SCHEDULE FOR GRANT OF PROBATE OR GRANT OF ADMINISTRATION WITH WILL ANNEXED", {
      spacing: { before: 120, after: 200 },
    })
  );

  // Section 1: Executors with reserved rights
  children.push(boldP("Section 1 -- Executors with reserved rights"));
  if (data.executorsWithReservedRights.length > 0) {
    children.push(
      p("The following executor(s) have reserved rights to apply for a grant at a later date:")
    );
    for (const name of data.executorsWithReservedRights) {
      children.push(p(`   ${name}`, { indent: { left: 720 } }));
    }
  } else {
    children.push(p("There are no executors with reserved rights."));
  }
  children.push(spacer(120));

  // Section 2: Listed persons
  buildSection2Persons(children, data, true);

  // Section 3: Attorney General
  buildSection3AG(children, data);
}

function buildScheduleAdminNoWill(children: Paragraph[], data: EstateData): void {
  children.push(
    boldP("SCHEDULE FOR GRANT OF ADMINISTRATION WITHOUT WILL ANNEXED", {
      spacing: { before: 120, after: 200 },
    })
  );

  // Section 1: Listed persons (slightly different categories)
  buildSection2Persons(children, data, false);

  // Section 2: Attorney General
  buildSection3AG(children, data);
}

function buildScheduleAncillaryProbate(children: Paragraph[], data: EstateData): void {
  children.push(
    boldP("SCHEDULE FOR ANCILLARY GRANT OF PROBATE OR ANCILLARY GRANT OF ADMINISTRATION WITH WILL ANNEXED", {
      spacing: { before: 120, after: 200 },
    })
  );

  // Section 1: Foreign grant holders
  children.push(boldP("Section 1 -- Foreign grant holders"));
  children.push(
    p("Each person to whom the foreign grant was issued is an applicant on this submission for estate grant or is represented by an attorney.")
  );
  children.push(spacer(120));

  // Section 2: Listed persons
  buildSection2Persons(children, data, true);

  // Section 3: Attorney General
  buildSection3AG(children, data);
}

function buildScheduleAncillaryAdminNoWill(children: Paragraph[], data: EstateData): void {
  children.push(
    boldP("SCHEDULE FOR ANCILLARY GRANT OF ADMINISTRATION WITHOUT WILL ANNEXED", {
      spacing: { before: 120, after: 200 },
    })
  );

  // Section 1: Foreign grant holders
  children.push(boldP("Section 1 -- Foreign grant holders"));
  children.push(
    p("Each person to whom the foreign grant was issued is an applicant on this submission for estate grant or is represented by an attorney.")
  );
  children.push(spacer(120));

  // Section 2: Listed persons
  buildSection2Persons(children, data, false);

  // Section 3: Attorney General
  buildSection3AG(children, data);
}

function buildSection2Persons(children: Paragraph[], data: EstateData, includesBeneficiaries: boolean): void {
  children.push(boldP("Section 2 -- List of persons entitled to notice"));
  children.push(spacer(60));

  // (a) Spouse
  children.push(boldP("(a) Spouse:"));
  if (data.spouse.status === "surviving") {
    children.push(p(`The deceased's spouse is ${data.spouse.survivingName || data.spouse.name || line(20)} (surviving).`));
  } else if (data.spouse.status === "deceased") {
    children.push(p(`The deceased had no currently surviving spouse. ${data.spouse.name || line(20)} (deceased).`));
  } else {
    children.push(p("The deceased never married."));
  }
  children.push(spacer(120));

  // (b) Children
  children.push(boldP("(b) Children:"));
  if (data.children.length === 0) {
    children.push(p("The deceased had no children."));
  } else {
    const surviving = data.children.filter((c) => c.status === "surviving");
    const deceased = data.children.filter((c) => c.status === "deceased");

    if (surviving.length > 0) {
      children.push(p("Surviving child(ren):"));
      for (const child of surviving) {
        children.push(p(`   ${child.name} (surviving)`, { indent: { left: 720 } }));
      }
    }
    if (deceased.length > 0) {
      children.push(p("Child(ren) who did not survive the deceased:"));
      for (const child of deceased) {
        children.push(p(`   ${child.name} (deceased)`, { indent: { left: 720 } }));
      }
    }
  }
  children.push(spacer(120));

  if (includesBeneficiaries) {
    // (c) Beneficiaries (for will-based grants)
    children.push(boldP("(c) Beneficiaries named in the will:"));
    if (data.beneficiaries.length === 0) {
      children.push(p("There are no other beneficiaries named in the will."));
    } else {
      for (const ben of data.beneficiaries) {
        children.push(p(`   ${ben.name} (${ben.status})`, { indent: { left: 720 } }));
      }
    }
    children.push(spacer(120));

    // (d) Intestate successors (if partial intestacy)
    children.push(boldP("(d) Persons who would be entitled to inherit on intestacy:"));
    if (data.intestateSuccessors.length === 0) {
      children.push(p("There are no additional persons who would be entitled to inherit on intestacy."));
    } else {
      for (const suc of data.intestateSuccessors) {
        children.push(p(`   ${suc.name} (${suc.relationship})`, { indent: { left: 720 } }));
      }
    }
  } else {
    // (c) Intestate successors (for no-will grants)
    children.push(boldP("(c) Persons who would be entitled to inherit on intestacy:"));
    if (data.intestateSuccessors.length === 0) {
      children.push(p("There are no additional persons who would be entitled to inherit on intestacy."));
    } else {
      for (const suc of data.intestateSuccessors) {
        children.push(p(`   ${suc.name} (${suc.relationship})`, { indent: { left: 720 } }));
      }
    }
    children.push(spacer(120));

    // (d) Creditors (admin without will only)
    children.push(boldP("(d) Creditors with claims exceeding $10,000:"));
    if (!data.creditors || data.creditors.length === 0) {
      children.push(p("There are no known creditors with claims exceeding $10,000."));
    } else {
      for (const cred of data.creditors) {
        children.push(p(`   ${cred.name}`, { indent: { left: 720 } }));
      }
    }
  }
  children.push(spacer(120));

  // (e) Citors
  children.push(boldP("(e) Citors:"));
  if (data.citors.length === 0) {
    children.push(p("No citation has been received."));
  } else {
    for (const citor of data.citors) {
      children.push(p(`   ${citor}`, { indent: { left: 720 } }));
    }
  }
  children.push(spacer(120));
}

function buildSection3AG(children: Paragraph[], data: EstateData): void {
  children.push(boldP("Section 3 -- Attorney General"));
  if (data.attorneyGeneralNotice) {
    children.push(
      checkboxP(
        true,
        "The Attorney General has received notice because the government is entitled to all or part of the estate."
      )
    );
  } else {
    children.push(
      p("The Attorney General is not entitled to notice in relation to this estate.")
    );
  }
}
