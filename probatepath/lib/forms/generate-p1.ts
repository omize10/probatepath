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
  hasWill,
  isAncillary,
  line,
  signatureBlock,
  spacer,
} from "./docx-utils";

export async function generateP1(data: EstateData): Promise<Buffer> {
  const children: Paragraph[] = [];

  // Form header
  children.push(centered("Form P1 (Rule 25-2 (3))", { bold: true, size: 24 }));
  children.push(spacer(120));
  children.push(centered("NOTICE OF PROPOSED APPLICATION IN RELATION TO ESTATE", { bold: true, size: 24 }));
  children.push(spacer(200));

  // TAKE NOTICE THAT paragraph
  const applicantNames = data.applicants
    .map((a) => fullName(a.firstName, a.middleName, a.lastName))
    .join(", ");

  const grantText = grantTypeText(data.grantType);

  children.push(boldP("TAKE NOTICE THAT:"));
  children.push(spacer(60));

  children.push(
    p([
      new TextRun({ text: "The applicant(s) ", size: 22, font: "Arial" }),
      new TextRun({ text: applicantNames, size: 22, font: "Arial", bold: true }),
      new TextRun({ text: " propose(s) to apply, in the ", size: 22, font: "Arial" }),
      new TextRun({ text: data.registry, size: 22, font: "Arial", bold: true }),
      new TextRun({ text: " court registry, for ", size: 22, font: "Arial" }),
      new TextRun({ text: grantText, size: 22, font: "Arial", bold: true }),
      new TextRun({
        text: ` in relation to the estate of the deceased described below who died on `,
        size: 22,
        font: "Arial",
      }),
      new TextRun({ text: data.deceased.dateOfDeath, size: 22, font: "Arial", bold: true }),
      new TextRun({ text: " .", size: 22, font: "Arial" }),
    ])
  );

  children.push(spacer(120));

  // Deceased info
  children.push(
    p([
      new TextRun({ text: "Full legal name of deceased: ", size: 22, font: "Arial" }),
      new TextRun({
        text: fullName(data.deceased.firstName, data.deceased.middleName, data.deceased.lastName),
        size: 22,
        font: "Arial",
        bold: true,
      }),
    ])
  );

  children.push(spacer(60));

  const deceasedAddress = formatAddress(data.deceased.lastAddress);
  children.push(
    p([
      new TextRun({ text: "Last residential address of the deceased: ", size: 22, font: "Arial" }),
      new TextRun({ text: deceasedAddress, size: 22, font: "Arial", bold: true }),
    ])
  );

  children.push(spacer(200));

  // Will/grant checkboxes - determine which one to check
  const noWillNoForeign =
    data.grantType === "admin_without_will" || data.grantType === "ancillary_admin_without_will";
  const hasPhysicalWill = data.will?.exists && !data.will.isElectronic && hasWill(data.grantType);
  const hasElectronicWill = data.will?.exists && data.will.isElectronic && hasWill(data.grantType);
  const isResealOrAncillary = isAncillary(data.grantType);

  // Checkbox 1: No will, no foreign grant
  children.push(
    checkboxP(
      noWillNoForeign && !isResealOrAncillary,
      "This application does not relate to a will or a foreign grant."
    )
  );

  // Checkbox 2: Physical will
  const willDateText = data.will?.date || line(15);
  children.push(
    checkboxP(
      !!hasPhysicalWill,
      `This application relates to the physical will of the deceased dated ${willDateText}, a copy of which will is provided with this notice.`
    )
  );

  // Checkbox 3: Electronic will
  children.push(
    checkboxP(
      !!hasElectronicWill,
      `This application relates to the electronic will of the deceased dated ${willDateText}, a copy of which will is provided with this notice. You are entitled to the will or access on demand to the will in its original electronic form, using Form P46.`
    )
  );

  // Checkbox 4: Reseal/ancillary with foreign grant
  children.push(
    checkboxP(
      isResealOrAncillary && hasWill(data.grantType),
      "This application is to reseal a foreign grant or for an ancillary grant and a copy of the foreign grant is provided with this notice. If the foreign grant relates to the will of the deceased, and that will does not form part of the foreign grant, a copy of the will is provided with this notice. In addition, if the grant relates to the electronic will of the deceased, you are entitled to the will or access on demand to the will in its original electronic form, using Form P46."
    )
  );

  children.push(spacer(200));

  // AND TAKE NOTICE THAT section
  children.push(boldP("AND TAKE NOTICE THAT:"));
  children.push(spacer(60));

  children.push(
    p(
      "(1) Before obtaining the foregoing grant or resealing, the applicant may be granted an authorization to obtain estate information or an authorization to obtain resealing information, as the case may be, in relation to that grant or resealing for the purposes of obtaining financial information in relation to the grant or resealing.",
      { indent: { left: 360 } }
    )
  );

  children.push(
    p(
      "(2) You have a right to oppose, by filing a notice of dispute in accordance with Rule 25-10 (1),",
      { indent: { left: 360 } }
    )
  );
  children.push(
    p(
      "(a) if the intended application is for an estate grant, the granting of either or both of an authorization to obtain estate information and the estate grant, or",
      { indent: { left: 720 } }
    )
  );
  children.push(
    p(
      "(b) if the intended application is for a resealing, the granting of either or both of an authorization to obtain resealing information and the resealing.",
      { indent: { left: 720 } }
    )
  );

  children.push(
    p(
      "(3) You may or may not be entitled to claim against the estate for relief, including a claim under",
      { indent: { left: 360 } }
    )
  );
  children.push(
    p("(a) the Family Law Act, or", { indent: { left: 720 } })
  );
  children.push(
    p("(b) Division 6 of Part 4 of the Wills, Estates and Succession Act.", { indent: { left: 720 } })
  );

  children.push(
    p(
      "(4) If you choose to take a step referred to in paragraph (2) or (3), you must do so within the time limited by any relevant rule of court or other enactment.",
      { indent: { left: 360 } }
    )
  );

  children.push(
    p(
      "(5) You may consult with your own lawyer concerning your interest in, or rights against, the estate.",
      { indent: { left: 360 } }
    )
  );

  children.push(
    p(
      "(6) After the applicant has filed a submission for estate grant or submission for resealing, you may apply for an order requiring the applicant to provide security unless the applicant is the Public Guardian and Trustee. Filing a notice of dispute will prevent a grant from being issued before you are able to apply for the order requiring security.",
      { indent: { left: 360 } }
    )
  );

  children.push(
    p(
      "(7) An authorization to obtain estate information, an authorization to obtain resealing information or a grant may issue to the applicant, or a foreign grant may be resealed, on any date that is at least 21 days after the date on which this notice is delivered to you or on any earlier date ordered by the court.",
      { indent: { left: 360 } }
    )
  );

  children.push(
    p(
      "(8) If an authorization to obtain estate information issues to the applicant, the applicant may apply for a grant without further notice. If an authorization to obtain resealing information issues to the applicant, the applicant may apply for the resealing of the foreign grant without further notice to you.",
      { indent: { left: 360 } }
    )
  );

  children.push(
    p(
      "(9) If a grant issues to the applicant, the applicant must provide, if there is a will, to the beneficiaries or, if there is no will, to intestate successors of the deceased, an accounting as to how the estate was administered and how the estate assets were distributed, and if a foreign grant is resealed as a result of the application, the intended applicant must provide, if there is a will, to the beneficiaries or, if there is no will, to intestate successors of the deceased, an accounting as to how the estate comprising the assets to which the resealed grant applies was administered and how those assets were distributed.",
      { indent: { left: 360 } }
    )
  );

  children.push(spacer(240));

  // INFORMATION ABOUT EACH APPLICANT
  children.push(boldP("INFORMATION ABOUT EACH APPLICANT"));
  children.push(spacer(120));

  for (const applicant of data.applicants) {
    const appName = fullName(applicant.firstName, applicant.middleName, applicant.lastName);
    const appAddress = formatAddress(applicant.address);

    children.push(fieldRow("Name", appName));
    children.push(fieldRow("Mailing address", appAddress));

    // Individual vs organization
    children.push(
      checkboxP(!applicant.isIndividual, "This applicant is not an individual")
    );
    children.push(
      checkboxP(applicant.isIndividual, "This applicant is an individual and ordinarily lives")
    );

    if (applicant.isIndividual) {
      children.push(
        checkboxP(true, "at the mailing address noted above", { indent: 360 })
      );
    }

    children.push(spacer(200));
  }

  // ADDRESS FOR SERVICE
  children.push(boldP("ADDRESS FOR SERVICE OF APPLICANT(S)"));
  children.push(spacer(120));

  const hasServiceAddress = !!data.addressForService.street;
  children.push(
    checkboxP(!hasServiceAddress, "The applicant's(s') address for service is the mailing address noted above.")
  );
  children.push(
    checkboxP(hasServiceAddress, "The applicant's(s') address for service is")
  );

  if (hasServiceAddress) {
    children.push(fieldRow("Street address for service", data.addressForService.street));
    if (data.addressForService.fax) {
      children.push(fieldRow("Fax number address for service", data.addressForService.fax));
    }
    if (data.addressForService.email) {
      children.push(fieldRow("E-mail address for service", data.addressForService.email));
    }
    children.push(fieldRow("Telephone number", data.addressForService.phone));
  }

  children.push(spacer(240));

  // Date and signature
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
