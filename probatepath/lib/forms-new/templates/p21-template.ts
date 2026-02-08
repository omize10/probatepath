/**
 * Form P21 - Submission for Resealing
 * Template matches BC Supreme Court Civil Rules exactly
 */

import { P21Data } from '../types';
import {
  formatFullName,
  formatFullNameCaps,
  formatAddress,
  checkbox,
  underline,
} from '../utils/formatters';

export function generateP21HTML(data: P21Data): string {
  const applicantNames = data.applicants.map(formatFullName).join(', ');
  const foreignGrantType = data.foreignGrant?.grantType;
  const hasWill = foreignGrantType === 'probate' || foreignGrantType === 'admin_with_will';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Form P21 - Submission for Resealing</title>
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
    
    .form-title {
      text-align: center;
      font-weight: bold;
      font-size: 11pt;
      margin-bottom: 6pt;
    }
    
    .form-subtitle {
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
      margin-bottom: 18pt;
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
    
    .section-header {
      font-weight: bold;
      text-transform: uppercase;
      margin-top: 12pt;
      margin-bottom: 6pt;
    }
    
    table {
      width: 100%;
      border-collapse: collapse;
    }
    
    td {
      vertical-align: top;
      padding: 3pt 0;
    }
    
    .file-info {
      margin-bottom: 12pt;
    }
  </style>
</head>
<body>

<!-- Form Header -->
<div class="form-title">Form P21 (Rule 25-6 (2))</div>
<div class="form-subtitle">SUBMISSION FOR RESEALING</div>
<div class="rule-note">[Rule 22-3 of the Supreme Court Civil Rules applies to all forms.]</div>

<!-- File Information -->
<div class="file-info">
  <div class="paragraph">
    <strong>No.</strong> <span class="field-line">${data.fileNumber || underline(20)}</span>
  </div>
  <div class="paragraph">
    <span class="field-line" style="min-width: 200pt;">${data.registry}</span> Registry
  </div>
</div>

<!-- Style of Proceeding -->
<div style="text-align: center; font-style: italic; margin: 12pt 0;">
  In the Supreme Court of British Columbia
</div>

<div style="text-align: center; margin: 12pt 0;">
  In the Matter of the Estate of <span class="field-value">${formatFullNameCaps(data.deceased)}</span>, deceased
</div>

<!-- Submission Statement -->
<div class="paragraph" style="margin-top: 18pt;">
  <strong>This submission for resealing is submitted by/on behalf of:</strong> <span class="field-value">${applicantNames}</span>
</div>

<div class="paragraph">
  I am/We are applying for the resealing of a foreign grant in relation to the estate of the deceased described in Part 1 of this submission for resealing (the "deceased").
</div>

<!-- Grant Type Selection -->
<div class="instruction">[Check whichever one of the immediately following 2 boxes is correct and complete any required information.]</div>

<div class="checkbox-item">
  <span class="checkbox">${checkbox(hasWill)}</span>
  <span>This submission is for the resealing of a grant of probate or grant of administration with will annexed issued by the <span class="field-line">${data.foreignGrant?.courtName || ''}</span> of <span class="field-line">${data.foreignGrant?.jurisdiction || ''}</span> on <span class="field-line">${data.foreignGrant?.dateIssued || ''}</span> (the "foreign grant"), which grant was issued in relation to the will of the deceased dated <span class="field-line">${data.will?.date || ''}</span>.</span>
</div>

<div class="checkbox-item">
  <span class="checkbox">${checkbox(!hasWill)}</span>
  <span>This submission is for the resealing of a grant of administration without will annexed issued by the <span class="field-line">${data.foreignGrant?.courtName || ''}</span> of <span class="field-line">${data.foreignGrant?.jurisdiction || ''}</span> on <span class="field-line">${data.foreignGrant?.dateIssued || ''}</span> (the "foreign grant").</span>
</div>

<!-- Certified Copies Request -->
<div class="section-header">CERTIFIED COPIES REQUESTED</div>

<div class="instruction">[Indicate how many court certified copies of each document you require.]</div>

<div class="paragraph">
  I/We request <span class="field-line" style="min-width: 50pt;">${data.certifiedCopies?.resealedGrant || ''}</span> certified copy(ies) of the resealed grant.
</div>

<div class="paragraph">
  I/We request <span class="field-line" style="min-width: 50pt;">${data.certifiedCopies?.authToObtainInfo || ''}</span> certified copy(ies) of the authorization to obtain resealing information.
</div>

<div class="paragraph">
  I/We request <span class="field-line" style="min-width: 50pt;">${data.certifiedCopies?.affidavitAssets || ''}</span> certified copy(ies) of the affidavit of assets and liabilities for resealing.
</div>

<!-- Part 1 -->
<div class="section-header">PART 1 — INFORMATION ABOUT THE DECEASED</div>

<div class="paragraph">
  <strong>Full legal name of deceased:</strong> <span class="field-value">${formatFullNameCaps(data.deceased)}</span>
</div>

<div class="instruction">[first name] [middle name(s)] [last name/family name]</div>

<div class="paragraph">
  <strong>Other names in which the deceased held or may have held an interest in property:</strong>
</div>

<div class="sub-paragraph">1. ${data.deceased?.aliases?.[0] || ''}</div>
<div class="sub-paragraph">2. ${data.deceased?.aliases?.[1] || ''}</div>
<div class="sub-paragraph">3. ${data.deceased?.aliases?.[2] || 'etc.'}</div>

<div class="paragraph">
  <strong>Last residential address of the deceased:</strong> <span class="field-line">${formatAddress(data.deceased?.lastAddress)}</span>
</div>

<div class="paragraph">
  <strong>Deceased's date of death:</strong> <span class="field-line">${data.deceased?.dateOfDeath || ''}</span>
</div>

<!-- Part 2 -->
<div class="section-header">PART 2 — CONTACT INFORMATION FOR THE APPLICANT(S)</div>

<div class="instruction">[You must set out the street address of the address for service. This may be your lawyer's office if you are represented by a lawyer. One or both of a fax number and an e-mail address may be given as additional addresses for service. If there is more than one applicant, all applicants must share the same address(es) for service.]</div>

<div class="paragraph">
  <strong>Street address for service:</strong> <span class="field-line">${data.addressForService?.street || ''}</span>
</div>

<div class="paragraph">
  <strong>Fax number address for service (if any):</strong> <span class="field-line">${data.addressForService?.fax || ''}</span>
</div>

<div class="paragraph">
  <strong>E-mail address for service (if any):</strong> <span class="field-line">${data.addressForService?.email || ''}</span>
</div>

<div class="paragraph">
  <strong>Telephone number:</strong> <span class="field-line">${data.addressForService?.phone || ''}</span>
</div>

<!-- Part 3 -->
<div class="section-header">PART 3 — DOCUMENTS FILED WITH THIS SUBMISSION FOR RESEALING</div>

<div class="paragraph">
  1 [Check whichever one of the immediately following 3 boxes is correct and file the specified affidavit(s).]
</div>

<div class="checkbox-item">
  <span class="checkbox">${checkbox(data.applicants.length === 1)}</span>
  <span>There is one applicant to this submission for resealing and a P22 or P23 affidavit is filed with this submission for resealing.</span>
</div>

<div class="checkbox-item">
  <span class="checkbox">${checkbox(data.applicants.length > 1 && !!data.affidavit?.isJoint)}</span>
  <span>There are 2 or more applicants to this submission for resealing and a joint P22 or P23 affidavit on behalf of all applicants is filed with this submission for resealing.</span>
</div>

<div class="checkbox-item">
  <span class="checkbox">${checkbox(data.applicants.length > 1 && !data.affidavit?.isJoint)}</span>
  <span>There are 2 or more applicants to this submission for resealing and a P22 or P23 affidavit is filed with this submission for resealing and <span class="field-line">${data.affidavit?.p24Count || ''}</span> affidavit(s) in Form P24 is/are filed with this submission for resealing.</span>
</div>

<div class="paragraph">
  2 Filed with this submission for resealing is/are the following Affidavit(s) of Delivery in Form P9 that confirms/collectively confirm that the documents referred to in Rule 25-2 were delivered to all of the persons to whom, under that rule, the documents were required to be delivered.
</div>

<div class="paragraph">
  3 Filed with this submission for resealing is a copy of the foreign grant certified by the court out of which the grant was issued${hasWill ? ' and, if a copy of the will is not attached to the foreign grant, a copy of the will certified by that court' : ''}.
</div>

<div class="paragraph">
  4 [Check whichever one of the immediately following 2 boxes is correct.]
</div>

<div class="checkbox-item">
  <span class="checkbox">${checkbox(!data.submittingAffidavitOfAssets)}</span>
  <span>I am/We are submitting with this submission for resealing an affidavit of assets and liabilities in Form P25 and therefore do not require an authorization to obtain resealing information.</span>
</div>

<div class="checkbox-item">
  <span class="checkbox">${checkbox(!!data.submittingAffidavitOfAssets)}</span>
  <span>I am/We are seeking an authorization to obtain resealing information so that I/we can secure the information necessary to prepare and submit an affidavit of assets and liabilities for resealing.</span>
</div>

<!-- Date and Signature -->
<table style="margin-top: 36pt; width: 100%;">
  <tr>
    <td style="width: 50%; vertical-align: bottom;">
      <div>Date: <span class="field-line">${data.submissionDate}</span></div>
      <div style="margin-top: 24pt; border-top: 1px solid #000; padding-top: 3pt;">
        Signature of <span style="font-family: monospace;">[${'  '}]</span> applicant <span style="font-family: monospace;">[${'  '}]</span> lawyer for applicant(s)
      </div>
      <div style="margin-top: 24pt; border-top: 1px solid #000; padding-top: 3pt; font-style: italic;">
        ${underline(30)}<br>
        [type or print name]
      </div>
    </td>
    <td style="width: 50%;"></td>
  </tr>
</table>

</body>
</html>`;
}
