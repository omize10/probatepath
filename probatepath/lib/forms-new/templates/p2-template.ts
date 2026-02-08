/**
 * Form P2 - Submission for Estate Grant
 * Template matches BC Supreme Court Civil Rules exactly
 */

import { P2Data } from '../types';
import {
  formatBCDate,
  formatFullName,
  formatFullNameCaps,
  formatAddress,
  getGrantTypeText,
  grantTypeHasWill,
  isAncillaryGrant,
  checkbox,
  formatApplicantNames,
  underline,
  getOrdinal,
} from '../utils/formatters';

export function generateP2HTML(data: P2Data): string {
  const applicantNames = formatApplicantNames(data.applicants);
  const hasWill = grantTypeHasWill(data.grantType);
  const isAncillary = isAncillaryGrant(data.grantType);
  const isAdminWithoutWill = data.grantType === 'admin_without_will' || data.grantType === 'ancillary_admin_without_will';
  
  // Determine which grant checkbox to check
  const checkGrantProbate = data.grantType === 'probate';
  const checkGrantAdminWithWill = data.grantType === 'admin_with_will';
  const checkGrantAdminNoWill = data.grantType === 'admin_without_will';
  const checkAncillaryProbate = data.grantType === 'ancillary_probate';
  const checkAncillaryAdminWithWill = data.grantType === 'ancillary_admin_with_will';
  const checkAncillaryAdminNoWill = data.grantType === 'ancillary_admin_without_will';
  
  // Determine P10/P11 vs authorization checkbox
  const submittingP10P11 = data.submittingAffidavitOfAssets;
  const seekingAuth = !data.submittingAffidavitOfAssets;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Form P2 - Submission for Estate Grant</title>
  <style>
    @page {
      size: 8.5in 11in;
      margin: 0.5in 0.75in;
    }
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: "Times New Roman", Times, serif;
      font-size: 11pt;
      line-height: 1.3;
      color: #000;
    }
    
    .form-header {
      margin-bottom: 12pt;
    }
    
    .form-number {
      font-weight: bold;
    }
    
    .court-header {
      text-align: center;
      margin-bottom: 18pt;
    }
    
    .court-name {
      font-weight: bold;
      margin-bottom: 6pt;
    }
    
    .matter-line {
      margin-bottom: 6pt;
    }
    
    .form-title {
      text-align: center;
      font-weight: bold;
      font-size: 11pt;
      margin-bottom: 6pt;
      text-transform: uppercase;
    }
    
    .rule-note {
      text-align: center;
      font-style: italic;
      font-size: 10pt;
      margin-bottom: 12pt;
    }
    
    .section-header {
      font-weight: bold;
      text-transform: uppercase;
      margin-top: 12pt;
      margin-bottom: 6pt;
    }
    
    .field-line {
      border-bottom: 1px solid #000;
      display: inline-block;
      min-width: 150pt;
    }
    
    .field-value {
      border-bottom: 1px solid #000;
      min-width: 150pt;
      display: inline-block;
      text-align: center;
      font-weight: bold;
    }
    
    .checkbox-item {
      margin-left: 18pt;
      margin-bottom: 3pt;
      display: flex;
      align-items: flex-start;
    }
    
    .checkbox {
      font-family: "Courier New", monospace;
      margin-right: 6pt;
      flex-shrink: 0;
    }
    
    .instruction {
      font-size: 9pt;
      font-style: italic;
      margin: 6pt 0;
    }
    
    .paragraph {
      margin-bottom: 6pt;
    }
    
    .sub-paragraph {
      margin-left: 36pt;
      margin-bottom: 3pt;
    }
    
    .signature-block {
      margin-top: 24pt;
      border-left: 1px solid #000;
      padding-left: 12pt;
    }
    
    .signature-line {
      margin-bottom: 12pt;
    }
    
    .part {
      margin-top: 18pt;
    }
    
    .name-fields {
      display: flex;
      margin-left: 12pt;
    }
    
    .name-field {
      border-bottom: 1px solid #000;
      min-width: 150pt;
      margin-right: 12pt;
    }
    
    .name-label {
      font-size: 9pt;
      color: #333;
      margin-left: 12pt;
    }
    
    .schedule-section {
      margin-top: 24pt;
      page-break-before: always;
    }
    
    .schedule-title {
      font-weight: bold;
      text-align: center;
      margin-bottom: 12pt;
    }
    
    table {
      width: 100%;
      border-collapse: collapse;
    }
    
    td {
      vertical-align: top;
      padding: 3pt 0;
    }
  </style>
</head>
<body>

<!-- Form Header -->
<div class="form-header">
  <div class="form-number">Form P2 (Rule 25-3 (2))</div>
  <div>No. <span class="field-line">${data.fileNumber || underline(20)}</span></div>
  <div><span class="field-line">${data.registry}</span> Registry</div>
</div>

<div class="court-header">
  <div class="court-name">In the Supreme Court of British Columbia</div>
  <div class="matter-line">In the Matter of the Estate of <span class="field-value">${formatFullNameCaps(data.deceased)}</span>, deceased</div>
</div>

<div class="form-title">Submission for Estate Grant</div>
<div class="rule-note">[Rule 22-3 of the Supreme Court Civil Rules applies to all forms.]</div>

<!-- Opening Paragraph -->
<div class="paragraph">
  This submission for estate grant is submitted by/on behalf of: <span class="field-value">${applicantNames}</span>
</div>

<div class="paragraph">
  I am/We are/I, <span class="field-line">${data.lawyer?.name || underline(30)}</span>, am applying for the following in relation to the estate of the deceased described in Part 1 of this submission for estate grant (the "deceased"):
</div>

<div class="instruction">[Check whichever one of the immediately following 5 boxes is correct and complete and attach the required schedule.]</div>

<div class="checkbox-item">
  <span class="checkbox">${checkbox(checkGrantProbate)}</span>
  <span>Grant of probate [Complete and attach the Schedule for Grant of Probate or Grant of Administration with Will Annexed.]</span>
</div>

<div class="checkbox-item">
  <span class="checkbox">${checkbox(checkGrantAdminWithWill)}</span>
  <span>Grant of administration with will annexed [Complete and attach the Schedule for Grant of Probate or Grant of Administration with Will Annexed.]</span>
</div>

<div class="checkbox-item">
  <span class="checkbox">${checkbox(checkGrantAdminNoWill)}</span>
  <span>Grant of administration without will annexed [Complete and attach the Schedule for Grant of Administration without Will Annexed.]</span>
</div>

<div class="checkbox-item">
  <span class="checkbox">${checkbox(checkAncillaryProbate || checkAncillaryAdminWithWill)}</span>
  <span>Ancillary grant of probate or ancillary grant of administration with will annexed [Complete and attach the Schedule for Ancillary Grant of Probate or Ancillary Grant of Administration with Will Annexed.]</span>
</div>

<div class="checkbox-item">
  <span class="checkbox">${checkbox(checkAncillaryAdminNoWill)}</span>
  <span>Ancillary grant of administration without will annexed [Complete and attach the Schedule for Ancillary Grant of Administration without Will Annexed.]</span>
</div>

<div class="instruction">[Check whichever one of the immediately following 2 boxes is correct.]</div>

<div class="checkbox-item">
  <span class="checkbox">${checkbox(submittingP10P11)}</span>
  <span>I am/We are submitting with this submission for estate grant an affidavit of assets and liabilities in Form P10 or P11 and therefore do not require an authorization to obtain estate information.</span>
</div>

<div class="checkbox-item">
  <span class="checkbox">${checkbox(seekingAuth)}</span>
  <span>I am/We are seeking an authorization to obtain estate information so that I/we can secure the information necessary to prepare and submit an affidavit of assets and liabilities for estate grant.</span>
</div>

<div class="instruction">[Indicate how many court certified copies of the estate grant/authorization to obtain estate information you require.]</div>

<div class="checkbox-item">
  <span class="checkbox">${checkbox(data.certifiedCopies?.estateGrant > 0)}</span>
  <span>I/we request <span class="field-line">${data.certifiedCopies?.estateGrant || ''}</span> certified copy(ies) of the estate grant.</span>
</div>

<div class="checkbox-item">
  <span class="checkbox">${checkbox(data.certifiedCopies?.authToObtainInfo > 0)}</span>
  <span>I/we request <span class="field-line">${data.certifiedCopies?.authToObtainInfo || ''}</span> certified copy(ies) of the authorization to obtain estate information.</span>
</div>

<div class="checkbox-item">
  <span class="checkbox">${checkbox(data.certifiedCopies?.affidavitDomiciled > 0)}</span>
  <span>I/We request <span class="field-line">${data.certifiedCopies?.affidavitDomiciled || ''}</span> certified copy(ies) of the affidavit of assets and liabilities for domiciled estate grant.</span>
</div>

<div class="checkbox-item">
  <span class="checkbox">${checkbox(data.certifiedCopies?.affidavitNonDomiciled > 0)}</span>
  <span>I/We request <span class="field-line">${data.certifiedCopies?.affidavitNonDomiciled || ''}</span> certified copy(ies) of the affidavit of assets and liabilities for non-domiciled estate grant.</span>
</div>

<div class="paragraph">
  This submission for estate grant has 4 Parts:<br>
  Part 1 — Information about the Deceased<br>
  Part 2 — Contact Information for the Applicant(s)<br>
  Part 3 — Documents filed with this submission for estate grant<br>
  Part 4 — Schedule
</div>

<!-- Signature Block -->
<div class="signature-block">
  <div class="signature-line">Date: <span class="field-line">${data.submissionDate || underline(20)}</span></div>
  <div class="signature-line" style="margin-top: 24pt; border-bottom: 1px solid #000; display: inline-block; min-width: 200pt;">&nbsp;</div>
  <div>Signature of <span style="font-family: monospace;">${checkbox(false)}</span> applicant <span style="font-family: monospace;">${checkbox(false)}</span> lawyer for applicant(s)</div>
  <div style="margin-top: 12pt;"><span class="field-line">${underline(40)}</span></div>
  <div style="font-size: 9pt;">[type or print name]</div>
</div>

<!-- PART 1 -->
<div class="part">
  <div class="section-header">Part 1 — Information about the Deceased</div>
  
  <div class="paragraph">Full legal name of deceased:</div>
  <div class="name-fields">
    <div>
      <div class="name-field">${data.deceased.firstName}</div>
      <div class="name-label">[first name]</div>
    </div>
    <div>
      <div class="name-field">${data.deceased.middleName || ''}</div>
      <div class="name-label">[middle name(s)]</div>
    </div>
    <div>
      <div class="name-field">${data.deceased.lastName}</div>
      <div class="name-label">[last name/family name]</div>
    </div>
  </div>
  
  <div class="paragraph">Other names in which the deceased held or may have held an interest in property:</div>
  <div class="sub-paragraph">1. ${data.deceased?.aliases?.[0] || ''}</div>
  <div class="sub-paragraph">2. ${data.deceased?.aliases?.[1] || ''}</div>
  <div class="sub-paragraph">3. ${data.deceased?.aliases?.[2] || 'etc.'}</div>
  
  <div class="paragraph">Last residential address of the deceased:</div>
  <div class="sub-paragraph">Street number and street name: <span class="field-line">${data.deceased?.lastAddress?.streetNumber || ''} ${data.deceased?.lastAddress?.streetName || ''}</span></div>
  <div class="sub-paragraph">&nbsp;&nbsp;[OR]</div>
  <div class="sub-paragraph">Post office box: <span class="field-line">${data.deceased?.lastAddress?.poBox || ''}</span></div>
  <div class="sub-paragraph">City/Town: <span class="field-line">${data.deceased?.lastAddress?.city || ''}</span></div>
  <div class="sub-paragraph">Province: <span class="field-line">${data.deceased?.lastAddress?.province || ''}</span></div>
  <div class="sub-paragraph">Country: <span class="field-line">${data.deceased?.lastAddress?.country || ''}</span></div>
  <div class="sub-paragraph">Postal Code: <span class="field-line">${data.deceased?.lastAddress?.postalCode || ''}</span></div>
  
  <div class="paragraph">Deceased's date of death: <span class="field-line">${data.deceased?.dateOfDeath || ''}</span></div>
  
  <div class="instruction">[Check whichever one of the immediately following 3 boxes is correct and provide any required information.]</div>
  
  <div class="checkbox-item">
    <span class="checkbox">${checkbox(!data.deceased?.nisgaaCitizen && !data.deceased?.treatyFirstNation)}</span>
    <span>The deceased was neither a Nisga'a citizen nor a member of a treaty first nation.</span>
  </div>
  
  <div class="checkbox-item">
    <span class="checkbox">${checkbox(data.deceased?.nisgaaCitizen)}</span>
    <span>The deceased was a Nisga'a citizen.</span>
  </div>
  
  <div class="checkbox-item">
    <span class="checkbox">${checkbox(!!data.deceased?.treatyFirstNation)}</span>
    <span>The deceased was a member of the <span class="field-line">${data.deceased?.treatyFirstNation || ''}</span> treaty first nation.</span>
  </div>
</div>

<!-- PART 2 -->
<div class="part">
  <div class="section-header">Part 2 — Contact Information for the Applicant(s)</div>
  
  <div class="instruction">[You must set out the street address of the address for service. This may be your lawyer's office if you are represented by a lawyer. One or both of a fax number and an e-mail address may be given as additional addresses for service. If there is more than one applicant, all applicants must share the same address(es) for service.]</div>
  
  <div class="paragraph">Street address for service: <span class="field-line">${data.addressForService.street}</span></div>
  <div class="paragraph">Fax number address for service (if any): <span class="field-line">${data.addressForService.fax || ''}</span></div>
  <div class="paragraph">E-mail address for service (if any): <span class="field-line">${data.addressForService.email || ''}</span></div>
  <div class="paragraph">Telephone number: <span class="field-line">${data.addressForService.phone}</span></div>
</div>

<!-- PART 3 -->
<div class="part">
  <div class="section-header">Part 3 — Documents filed with this submission for estate grant</div>
  
  <div class="paragraph">1. <span class="instruction">[Check whichever one of the immediately following 3 boxes is correct and file the specified affidavit(s).]</span></div>
  
  <div class="checkbox-item">
    <span class="checkbox">${checkbox(data.applicants.length === 1 && !data.affidavit.hasP8Affidavits)}</span>
    <span>There is one applicant to this submission for estate grant and a <span class="field-line">${data.affidavit.form}</span> affidavit is filed with this submission for estate grant.</span>
  </div>
  
  <div class="checkbox-item">
    <span class="checkbox">${checkbox(data.applicants.length > 1 && data.affidavit.isJoint && !data.affidavit.hasP8Affidavits)}</span>
    <span>There are 2 or more applicants to this submission for estate grant and a joint <span class="field-line">${data.affidavit.form}</span> affidavit on behalf of all applicants is filed with this submission for estate grant.</span>
  </div>
  
  <div class="checkbox-item">
    <span class="checkbox">${checkbox(data.applicants.length > 1 && !data.affidavit.isJoint)}</span>
    <span>There are 2 or more applicants to this submission for estate grant and a <span class="field-line">${data.affidavit.form}</span> affidavit is filed with this submission for estate grant and <span class="field-line">${data.affidavit.p8Count || ''}</span> affidavit(s) in Form P8 is/are filed with this submission for estate grant.</span>
  </div>
  
  <div class="paragraph">2. <span class="instruction">[Check the box for whichever one of the immediately following section 2's is correct and provide any required information.]</span></div>
  
  ${data.noDeliveryRequired ? `
  <div class="checkbox-item">
    <span class="checkbox">${checkbox(false)}</span>
    <span>Filed with this submission for estate grant is/are the following Affidavit(s) of Delivery in Form P9 that confirms/collectively confirm that the documents referred to in Rule 25-2 were delivered to all of the persons to whom, under that rule, the documents were required to be delivered:</span>
  </div>
  <div class="sub-paragraph">Affidavit of ${underline(20)} sworn ${underline(15)}</div>
  ` : `
  <div class="checkbox-item">
    <span class="checkbox">${checkbox(true)}</span>
    <span>Filed with this submission for estate grant is/are the following Affidavit(s) of Delivery in Form P9 that confirms/collectively confirm that the documents referred to in Rule 25-2 were delivered to all of the persons to whom, under that rule, the documents were required to be delivered:</span>
  </div>
  ${data.affidavitsOfDelivery.map(aff => `
  <div class="sub-paragraph">Affidavit of ${aff.name} sworn ${aff.dateSworn}</div>
  `).join('')}
  `}
  
  <div class="checkbox-item">
    <span class="checkbox">${checkbox(data.noDeliveryRequired)}</span>
    <span>No affidavit of delivery is attached. In accordance with Rule 25-2, no one, other than the applicant(s), is entitled to notice.</span>
  </div>
  
  <div class="paragraph">3. Filed with this submission for estate grant are 2 copies of the certificate of the chief executive officer under the Vital Statistics Act indicating the results of a search for a wills notice filed by or on behalf of the deceased.</div>
  
  <div class="paragraph">4. <span class="instruction">[Check whichever one of the immediately following 5 boxes is correct, provide any required information and file any specified documents.]</span></div>
  
  ${hasWill && !isAncillary ? `
  <div class="checkbox-item">
    <span class="checkbox">${checkbox(true)}</span>
    <span>This application is for a grant of probate, or a grant of administration with will annexed, in relation to the will of the deceased dated <span class="field-line">${data.will?.date || ''}</span>, and filed with this submission for estate grant is the originally signed version of the will and 2 copies of the will.</span>
  </div>
  ` : ''}
  
  ${hasWill && !isAncillary && !data.will?.originalAvailable ? `
  <div class="checkbox-item">
    <span class="checkbox">${checkbox(true)}</span>
    <span>This application is for a grant of probate, or a grant of administration with will annexed, in relation to the will of the deceased dated <span class="field-line">${data.will?.date || ''}</span>, and, because the originally signed version of the will is not available, filed with this submission for estate grant are 3 copies of the will.</span>
  </div>
  ` : ''}
  
  ${isAdminWithoutWill && !isAncillary ? `
  <div class="checkbox-item">
    <span class="checkbox">${checkbox(true)}</span>
    <span>This application is for a grant of administration without will annexed.</span>
  </div>
  ` : ''}
  
  ${isAncillary && hasWill ? `
  <div class="checkbox-item">
    <span class="checkbox">${checkbox(true)}</span>
    <span>This application is for an ancillary grant of probate, or an ancillary grant of administration with will annexed, in relation to the grant issued by the <span class="field-line">${data.foreignGrant?.courtName || ''}</span> of <span class="field-line">${data.foreignGrant?.jurisdiction || ''}</span> on <span class="field-line">${data.foreignGrant?.dateIssued || ''}</span> (the "foreign grant"), which grant was issued in relation to the will of the deceased dated <span class="field-line">${data.will?.date || ''}</span>, and filed with this submission for estate grant is a copy of the following, each of which is certified by the court out of which probate or administration with will annexed has been granted:</span>
  </div>
  <div class="sub-paragraph">(a) the foreign grant;</div>
  <div class="sub-paragraph">(b) if a copy of the will to which the foreign grant relates is not attached to the foreign grant, a copy of the will.</div>
  ` : ''}
  
  ${isAncillary && isAdminWithoutWill ? `
  <div class="checkbox-item">
    <span class="checkbox">${checkbox(true)}</span>
    <span>This application is for an ancillary grant of administration without will annexed in relation to the grant issued by the <span class="field-line">${data.foreignGrant?.courtName || ''}</span> of <span class="field-line">${data.foreignGrant?.jurisdiction || ''}</span> on <span class="field-line">${data.foreignGrant?.dateIssued || ''}</span> (the "foreign grant"), and filed with this submission for estate grant is a copy of the foreign grant certified by the court out of which administration without will annexed has been granted.</span>
  </div>
  ` : ''}
  
  <div class="paragraph">5. <span class="instruction">[Check the box for whichever one of the immediately following section 5's is correct and provide any required information.]</span></div>
  
  ${hasWill && !isAncillary ? `
  <div class="checkbox-item">
    <span class="checkbox">${checkbox(!data.will?.hasOrdersAffecting)}</span>
    <span>This application is for a grant of probate or a grant of administration with will annexed and there are no orders affecting the validity or content of the will referred to in section 4.</span>
  </div>
  
  <div class="checkbox-item">
    <span class="checkbox">${checkbox(data.will?.hasOrdersAffecting)}</span>
    <span>This application is for a grant of probate or a grant of administration with will annexed and the following order(s) affect(s) the validity or content of the will referred to in section 4:</span>
  </div>
  ` : ''}
  
  ${isAncillary && hasWill ? `
  <div class="checkbox-item">
    <span class="checkbox">${checkbox(!data.will?.hasOrdersAffecting)}</span>
    <span>This application is for an ancillary grant of probate or an ancillary grant of administration with will annexed and there are no orders affecting the validity or content of the will referred to in section 4.</span>
  </div>
  
  <div class="checkbox-item">
    <span class="checkbox">${checkbox(data.will?.hasOrdersAffecting)}</span>
    <span>This application is for an ancillary grant of probate or an ancillary grant of administration with will annexed and the following order(s) affect(s) the validity or content of the will referred to in section 4:</span>
  </div>
  ` : ''}
  
  ${isAdminWithoutWill ? `
  <div class="checkbox-item">
    <span class="checkbox">${checkbox(true)}</span>
    <span>This application is for a grant of administration without will annexed or an ancillary grant of administration without will annexed.</span>
  </div>
  ` : ''}
  
  <div class="paragraph">6. <span class="instruction">[Check whichever one or more of the immediately following 5 boxes is correct and provide any required information.]</span></div>
  
  ${hasWill ? `
  <div class="checkbox-item">
    <span class="checkbox">${checkbox(!data.will?.refersToDocuments)}</span>
    <span>This application is for a grant of probate, a grant of administration with will annexed, an ancillary grant of probate or an ancillary grant of administration with will annexed and the will referred to in section 4 does not refer to any documents or refers only to documents attached to the will.</span>
  </div>
  
  <div class="checkbox-item">
    <span class="checkbox">${checkbox(data.will?.refersToDocuments)}</span>
    <span>This application is for a grant of probate, a grant of administration with will annexed, an ancillary grant of probate or an ancillary grant of administration with will annexed and filed with this submission for estate grant is/are the following document(s), which document(s) is/are all of the documents referred to in, but not attached to, the will referred to in section 4:</span>
  </div>
  ` : `
  <div class="checkbox-item">
    <span class="checkbox">${checkbox(true)}</span>
    <span>This application is for a grant of administration without will annexed or an ancillary grant of administration without will annexed.</span>
  </div>
  `}
  
  <div class="paragraph">7. <span class="instruction">[Check whichever one of the immediately following 2 boxes is correct and describe and file any specified documents.]</span></div>
  
  <div class="checkbox-item">
    <span class="checkbox">${checkbox(data.additionalDocuments.length === 0)}</span>
    <span>No documents other than those described elsewhere in this submission for estate grant are filed with this submission for estate grant.</span>
  </div>
  
  <div class="checkbox-item">
    <span class="checkbox">${checkbox(data.additionalDocuments.length > 0)}</span>
    <span>In addition to the documents described elsewhere in this submission for estate grant, the following documents are filed with this submission for estate grant:</span>
  </div>
  ${data.additionalDocuments.map((doc, i) => `
  <div class="sub-paragraph">${i + 1}. ${doc}</div>
  `).join('')}
  
  <div class="paragraph">8. <span class="instruction">[Check whichever one of the immediately following 2 boxes is correct, provide any required information and file any specified documents.]</span></div>
  
  <div class="checkbox-item">
    <span class="checkbox">${checkbox(data.allDocumentsInEnglish)}</span>
    <span>All documents filed with this submission for estate grant are written in the English language.</span>
  </div>
  
  <div class="checkbox-item">
    <span class="checkbox">${checkbox(!data.allDocumentsInEnglish)}</span>
    <span>Filed with this submission for estate grant is an affidavit of translator in Form P12 of <span class="field-line">${data.translatorAffidavit?.translatorName || ''}</span>, who translated the <span class="field-line">${data.translatorAffidavit?.documentTranslated || ''}</span> filed with this submission for estate grant.</span>
  </div>
</div>

<!-- PART 4 - SCHEDULE -->
<div class="part">
  <div class="section-header">Part 4 — Schedule</div>
  
  <div class="paragraph">1. <span class="instruction">[Check whichever one of the immediately following 4 boxes is correct and attach the specified Schedule.]</span></div>
  
  <div class="checkbox-item">
    <span class="checkbox">${checkbox(hasWill && !isAncillary)}</span>
    <span>Attached to this submission for estate grant is a Schedule for Grant of Probate or Grant of Administration with Will Annexed.</span>
  </div>
  
  <div class="checkbox-item">
    <span class="checkbox">${checkbox(isAdminWithoutWill && !isAncillary)}</span>
    <span>Attached to this submission for estate grant is a Schedule for Grant of Administration without Will Annexed.</span>
  </div>
  
  <div class="checkbox-item">
    <span class="checkbox">${checkbox(hasWill && isAncillary)}</span>
    <span>Attached to this submission for estate grant is a Schedule for Ancillary Grant of Probate or Ancillary Grant of Administration with Will Annexed.</span>
  </div>
  
  <div class="checkbox-item">
    <span class="checkbox">${checkbox(isAdminWithoutWill && isAncillary)}</span>
    <span>Attached to this submission for estate grant is a Schedule for Ancillary Grant of Administration without Will Annexed.</span>
  </div>
</div>

<!-- SCHEDULES -->
${generateSchedule(data, hasWill, isAncillary, isAdminWithoutWill)}

</body>
</html>`;
}

function generateSchedule(data: P2Data, hasWill: boolean, isAncillary: boolean, isAdminWithoutWill: boolean): string {
  // Schedule for Grant of Probate or Grant of Administration with Will Annexed
  if (hasWill && !isAncillary) {
    return `
<div class="schedule-section">
  <div class="instruction">[This Schedule is to be completed and attached to the submission for estate grant only if the application is for a grant of probate or a grant of administration with will annexed.]</div>
  
  <div class="schedule-title">Schedule for Grant of Probate or Grant of Administration with Will Annexed</div>
  
  <div class="paragraph">1. <span class="instruction">[Indicate if there is any person, other than the applicant, who meets all of the following criteria and therefore is an executor whose right should be reserved on the grant.]</span></div>
  
  <div class="instruction">Criteria<br>
  (a) the person is named in the will as executor or alternate executor;<br>
  (b) the person is a co-executor with the applicant(s) (i.e. has a right to make an application for an estate grant that is equal to the applicant's(s') right to make that application);<br>
  (c) the person has not renounced executorship;<br>
  (d) the person is alive at the date of this submission for estate grant;<br>
  (e) the person has not become incapable of managing the person's affairs.</div>
  
  <div class="checkbox-item">
    <span class="checkbox">${checkbox(data.executorsWithReservedRights.length === 0)}</span>
    <span>There is no person who meets all of the foregoing criteria.</span>
  </div>
  
  <div class="checkbox-item">
    <span class="checkbox">${checkbox(data.executorsWithReservedRights.length > 0)}</span>
    <span>The following person(s) meet(s) all of the foregoing criteria:</span>
  </div>
  ${data.executorsWithReservedRights.map((name, i) => `
  <div class="sub-paragraph">${i + 1}. ${name}</div>
  `).join('')}
  
  <div class="paragraph">2. Listed in each of the following paragraphs is every person who falls within the class of persons identified by that paragraph:</div>
  
  <div class="instruction">[Provide under each of the following paragraphs the full name of each person to whom the paragraph applies, whether or not that person is named elsewhere in this submission for estate grant.]<br>
  [List each named person on a separate line. Do not leave any paragraph blank or indicate "Not applicable"; clearly state why a paragraph does not apply.]<br>
  [A person who does not survive a deceased person by 5 days, or a longer period provided in an instrument, is conclusively deemed to have died before the deceased. If a person survives a deceased person by 5 days, or longer if required by the will, for the purposes of this Form, the person is referred to as "surviving".]</div>
  
  <div class="paragraph">(a) spouse, if any, of the deceased [see section 2 of the Wills, Estates and Succession Act] <span class="instruction">[Provide the appropriate response(s), as applicable: spouse [provide name of spouse]/no currently surviving spouse as defined by section 2 of the Wills, Estates and Succession Act [provide name of spouse and indicate "(deceased)"]/never married.]:</span></div>
  <div class="sub-paragraph">${data.spouse.status === 'never_married' ? 'Never married' : data.spouse.status === 'surviving' ? `Spouse: ${data.spouse.survivingName || data.spouse.name}` : `No currently surviving spouse as defined by section 2 of the Wills, Estates and Succession Act: ${data.spouse.name} (deceased)`}</div>
  
  <div class="paragraph">(b) child(ren), if any, of the deceased <span class="instruction">[Provide the appropriate response(s), as applicable: surviving child(ren) of deceased [provide name(s) of child(ren)]/any child(ren) of the deceased who did not survive the deceased [provide name(s) of child(ren) and indicate "(deceased)"]/no children.]:</span></div>
  ${data.children.length > 0 ? data.children.map(child => `
  <div class="sub-paragraph">${child.name} (${child.status})</div>
  `).join('') : '<div class="sub-paragraph">No children</div>'}
  
  <div class="paragraph">(c) each person, if any, who is a beneficiary under the will and is not named in paragraph (a) or (b) <span class="instruction">[List each surviving beneficiary and all beneficiaries who did not survive the deceased in this application and indicate "(surviving)" or "(deceased)", as applicable.]:</span></div>
  ${data.beneficiaries.length > 0 ? data.beneficiaries.map(ben => `
  <div class="sub-paragraph">${ben.name}${ben.relationship ? ` - ${ben.relationship}` : ''} (${ben.status})</div>
  `).join('') : '<div class="sub-paragraph">No additional beneficiaries</div>'}
  
  <div class="paragraph">(d) each person, if any, who would have been an intestate successor if the deceased had not left a will and who is not named in paragraph (a), (b) or (c) <span class="instruction">[List all surviving persons who would be entitled to inherit on intestacy and their relationship to the deceased.]:</span></div>
  ${data.intestateSuccessors.length > 0 ? data.intestateSuccessors.map(succ => `
  <div class="sub-paragraph">${succ.name} - ${succ.relationship}</div>
  `).join('') : '<div class="sub-paragraph">No intestate successors (all beneficiaries named in will)</div>'}
  
  <div class="paragraph">(e) each citor, if any, not named in paragraph (a), (b), (c) or (d) [see Rule 25-11] <span class="instruction">[List anyone who has filed a citation or indicate that no citation has been received.]:</span></div>
  ${data.citors.length > 0 ? data.citors.map(citor => `
  <div class="sub-paragraph">${citor}</div>
  `).join('') : '<div class="sub-paragraph">No citations received</div>'}
  
  ${data.attorneyGeneralNotice ? `
  <div class="paragraph">3. The Attorney General has received notice because the government is entitled to all or part of the estate of the deceased.</div>
  ` : ''}
</div>
`;
  }
  
  // Schedule for Grant of Administration without Will Annexed
  if (isAdminWithoutWill && !isAncillary) {
    return `
<div class="schedule-section">
  <div class="instruction">[This Schedule is to be completed and attached to the submission for estate grant only if the application is for a grant of administration without will annexed.]</div>
  
  <div class="schedule-title">Schedule for Grant of Administration without Will Annexed</div>
  
  <div class="paragraph">1. Listed in each of the following paragraphs is every person who falls within the class of persons identified by that paragraph:</div>
  
  <div class="instruction">[Provide under each of the following paragraphs the full name of each person to whom the paragraph applies, whether or not that person is named elsewhere in this submission for estate grant.]<br>
  [List each named person on a separate line. Do not leave any paragraph blank or indicate "Not applicable"; clearly state why a paragraph does not apply.]<br>
  [A person who does not survive a deceased person by 5 days is conclusively deemed to have died before the deceased. If a person survives a deceased person by 5 days, for the purposes of this Form, the person is referred to as "surviving".]</div>
  
  <div class="paragraph">(a) spouse, if any, of the deceased [see section 2 of the Wills, Estates and Succession Act] <span class="instruction">[Provide the appropriate response(s), as applicable: spouse [provide name of spouse]/no currently surviving spouse as defined by section 2 of the Wills, Estates and Succession Act [provide name of spouse and indicate "(deceased)"]/never married.]:</span></div>
  <div class="sub-paragraph">${data.spouse.status === 'never_married' ? 'Never married' : data.spouse.status === 'surviving' ? `Spouse: ${data.spouse.survivingName || data.spouse.name}` : `No currently surviving spouse as defined by section 2 of the Wills, Estates and Succession Act: ${data.spouse.name} (deceased)`}</div>
  
  <div class="paragraph">(b) child(ren), if any, of the deceased <span class="instruction">[Provide the appropriate response(s), as applicable: surviving child(ren) of deceased [provide name(s) of child(ren)]/any child(ren) of the deceased who did not survive the deceased [provide name(s) of child(ren) and indicate "(deceased)"]/no children.]:</span></div>
  ${data.children.length > 0 ? data.children.map(child => `
  <div class="sub-paragraph">${child.name} (${child.status})</div>
  `).join('') : '<div class="sub-paragraph">No children</div>'}
  
  <div class="paragraph">(c) each person, if any, not named in paragraph (a) or (b), who is entitled to receive all or part of the estate of a person who dies without a will [see section 23 of the Wills, Estates and Succession Act] <span class="instruction">[List all surviving persons who would be entitled to inherit on intestacy and their relationship to the deceased.]:</span></div>
  ${data.intestateSuccessors.length > 0 ? data.intestateSuccessors.map(succ => `
  <div class="sub-paragraph">${succ.name} - ${succ.relationship}</div>
  `).join('') : '<div class="sub-paragraph">No other intestate successors</div>'}
  
  <div class="paragraph">(d) each creditor of the deceased, if any, not named in paragraph (a), (b) or (c) whose claim exceeds $10 000:</div>
  ${data.creditors && data.creditors.length > 0 ? data.creditors.map(cred => `
  <div class="sub-paragraph">${cred.name}</div>
  `).join('') : '<div class="sub-paragraph">No creditors with claims exceeding $10,000</div>'}
  
  <div class="paragraph">(e) each citor, if any, not named in paragraph (a), (b), (c) or (d) [see Rule 25-11] <span class="instruction">[List anyone who has filed a citation or indicate that no citation has been received.]:</span></div>
  ${data.citors.length > 0 ? data.citors.map(citor => `
  <div class="sub-paragraph">${citor}</div>
  `).join('') : '<div class="sub-paragraph">No citations received</div>'}
  
  ${data.attorneyGeneralNotice ? `
  <div class="paragraph">2. The Attorney General has received notice because the government is entitled to the estate of the deceased.</div>
  ` : ''}
</div>
`;
  }
  
  // Schedule for Ancillary Grant of Probate or Ancillary Grant of Administration with Will Annexed
  if (hasWill && isAncillary) {
    return `
<div class="schedule-section">
  <div class="instruction">[This Schedule is to be completed and attached to the submission for estate grant only if the application is for an ancillary grant of probate or an ancillary grant of administration with will annexed.]</div>
  
  <div class="schedule-title">Schedule for Ancillary Grant of Probate or Ancillary Grant of Administration with Will Annexed</div>
  
  <div class="paragraph">1. Each person to whom the foreign grant was issued is an applicant under this submission for estate grant or is represented by an attorney who is an applicant under this submission for estate grant.</div>
  
  <div class="paragraph">2. Listed in each of the following paragraphs is every person who falls within the class of persons identified by that paragraph:</div>
  
  <div class="instruction">[Provide under each of the following paragraphs the full name of each person to whom the paragraph applies, whether or not that person is named elsewhere in this submission for estate grant.]<br>
  [List each named person on a separate line. Do not leave any paragraph blank or indicate "Not applicable"; clearly state why a paragraph does not apply.]<br>
  [A person who does not survive a deceased person by 5 days, or a longer period provided in an instrument, is conclusively deemed to have died before the deceased. If a person survives a deceased person by 5 days, or longer if required by the will, for the purposes of this Form, the person is referred to as "surviving".]</div>
  
  <div class="paragraph">(a) spouse, if any, of the deceased [see section 2 of the Wills, Estates and Succession Act] <span class="instruction">[Provide the appropriate response(s), as applicable: spouse [provide name of spouse]/no currently surviving spouse as defined by section 2 of the Wills, Estates and Succession Act [provide name of spouse and indicate "(deceased)"]/never married.]:</span></div>
  <div class="sub-paragraph">${data.spouse.status === 'never_married' ? 'Never married' : data.spouse.status === 'surviving' ? `Spouse: ${data.spouse.survivingName || data.spouse.name}` : `No currently surviving spouse as defined by section 2 of the Wills, Estates and Succession Act: ${data.spouse.name} (deceased)`}</div>
  
  <div class="paragraph">(b) child(ren), if any, of the deceased <span class="instruction">[Provide the appropriate response(s), as applicable: surviving child(ren) of deceased [provide name(s) of child(ren)]/any child(ren) of the deceased who did not survive the deceased [provide name(s) of child(ren) and indicate "(deceased)"]/no children.]:</span></div>
  ${data.children.length > 0 ? data.children.map(child => `
  <div class="sub-paragraph">${child.name} (${child.status})</div>
  `).join('') : '<div class="sub-paragraph">No children</div>'}
  
  <div class="paragraph">(c) each person, if any, who is a beneficiary under the will and is not named in paragraph (a) or (b) <span class="instruction">[List each surviving beneficiary and all beneficiaries who did not survive the deceased in this application and indicate "(surviving)" or "(deceased)", as applicable.]:</span></div>
  ${data.beneficiaries.length > 0 ? data.beneficiaries.map(ben => `
  <div class="sub-paragraph">${ben.name}${ben.relationship ? ` - ${ben.relationship}` : ''} (${ben.status})</div>
  `).join('') : '<div class="sub-paragraph">No additional beneficiaries</div>'}
  
  <div class="paragraph">(d) each person, if any, who would have been an intestate successor if the deceased had not left a will and who is not named in paragraph (a), (b) or (c) <span class="instruction">[List all surviving persons who would be entitled to inherit on intestacy and their relationship to the deceased.]:</span></div>
  ${data.intestateSuccessors.length > 0 ? data.intestateSuccessors.map(succ => `
  <div class="sub-paragraph">${succ.name} - ${succ.relationship}</div>
  `).join('') : '<div class="sub-paragraph">No intestate successors (all beneficiaries named in will)</div>'}
  
  <div class="paragraph">(e) each citor, if any, not named in paragraph (a), (b), (c) or (d) [see Rule 25-11] <span class="instruction">[List anyone who has filed a citation or indicate that no citation has been received.]:</span></div>
  ${data.citors.length > 0 ? data.citors.map(citor => `
  <div class="sub-paragraph">${citor}</div>
  `).join('') : '<div class="sub-paragraph">No citations received</div>'}
  
  ${data.attorneyGeneralNotice ? `
  <div class="paragraph">3. The Attorney General has received notice because the government is entitled to all or part of the estate of the deceased.</div>
  ` : ''}
</div>
`;
  }
  
  // Schedule for Ancillary Grant of Administration without Will Annexed
  if (isAdminWithoutWill && isAncillary) {
    return `
<div class="schedule-section">
  <div class="instruction">[This Schedule is to be completed and attached to the submission for estate grant only if the application is for an ancillary grant of administration without will annexed.]</div>
  
  <div class="schedule-title">Schedule for Ancillary Grant of Administration without Will Annexed</div>
  
  <div class="paragraph">1. Each person to whom the foreign grant was issued is an applicant under this submission for estate grant or is represented by an attorney who is an applicant under this submission for estate grant.</div>
  
  <div class="paragraph">2. Listed in each of the following paragraphs is every person who falls within the class of persons identified by that paragraph:</div>
  
  <div class="instruction">[Provide under each of the following paragraphs the full name of each person to whom the paragraph applies, whether or not that person is named elsewhere in this submission for estate grant.]<br>
  [List each named person on a separate line. Do not leave any paragraph blank or indicate "Not applicable"; clearly state why a paragraph does not apply.]<br>
  [A person who does not survive a deceased person by 5 days is conclusively deemed to have died before the deceased. If a person survives a deceased person by 5 days, for the purposes of this Form, the person is referred to as "surviving".]</div>
  
  <div class="paragraph">(a) spouse, if any, of the deceased [see section 2 of the Wills, Estates and Succession Act] <span class="instruction">[Provide the appropriate response(s), as applicable: spouse [provide name of spouse]/no currently surviving spouse as defined by section 2 of the Wills, Estates and Succession Act [provide name of spouse and indicate "(deceased)"]/never married.]:</span></div>
  <div class="sub-paragraph">${data.spouse.status === 'never_married' ? 'Never married' : data.spouse.status === 'surviving' ? `Spouse: ${data.spouse.survivingName || data.spouse.name}` : `No currently surviving spouse as defined by section 2 of the Wills, Estates and Succession Act: ${data.spouse.name} (deceased)`}</div>
  
  <div class="paragraph">(b) child(ren), if any, of the deceased <span class="instruction">[Provide the appropriate response(s), as applicable: surviving child(ren) of deceased [provide name(s) of child(ren)]/any child(ren) of the deceased who did not survive the deceased [provide name(s) of child(ren) and indicate "(deceased)"]/no children.]:</span></div>
  ${data.children.length > 0 ? data.children.map(child => `
  <div class="sub-paragraph">${child.name} (${child.status})</div>
  `).join('') : '<div class="sub-paragraph">No children</div>'}
  
  <div class="paragraph">(c) each person, if any, not named in paragraph (a) or (b), who is entitled to receive all or part of the estate of a person who dies without a will [see section 23 of the Wills, Estates and Succession Act] <span class="instruction">[List all surviving persons who would be entitled to inherit on intestacy and their relationship to the deceased.]:</span></div>
  ${data.intestateSuccessors.length > 0 ? data.intestateSuccessors.map(succ => `
  <div class="sub-paragraph">${succ.name} - ${succ.relationship}</div>
  `).join('') : '<div class="sub-paragraph">No other intestate successors</div>'}
  
  <div class="paragraph">(d) each creditor of the deceased, if any, not named in paragraph (a), (b) or (c) whose claim exceeds $10 000:</div>
  ${data.creditors && data.creditors.length > 0 ? data.creditors.map(cred => `
  <div class="sub-paragraph">${cred.name}</div>
  `).join('') : '<div class="sub-paragraph">No creditors with claims exceeding $10,000</div>'}
  
  <div class="paragraph">(e) each citor, if any, not named in paragraph (a), (b), (c) or (d) [see Rule 25-11] <span class="instruction">[List anyone who has filed a citation or indicate that no citation has been received.]:</span></div>
  ${data.citors.length > 0 ? data.citors.map(citor => `
  <div class="sub-paragraph">${citor}</div>
  `).join('') : '<div class="sub-paragraph">No citations received</div>'}
  
  ${data.attorneyGeneralNotice ? `
  <div class="paragraph">3. The Attorney General has received notice because the government is entitled to the estate of the deceased.</div>
  ` : ''}
</div>
`;
  }
  
  return '';
}
