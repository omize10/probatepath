/**
 * Form P3 - Affidavit of Applicant for Grant of Probate or Grant of Administration with Will Annexed (Short Form)
 * Template matches BC Supreme Court Civil Rules exactly
 */

import { P3Data } from '../types';
import {
  formatFullName,
  formatFullNameCaps,
  formatAddress,
  checkbox,
  underline,
  getOrdinal,
} from '../utils/formatters';

export function generateP3HTML(data: P3Data): string {
  const applicant = data.applicants?.[data.applicantIndex] || { firstName: '', lastName: '', address: { city: '', province: '' } };
  const applicantName = formatFullName(applicant);
  const hasWill = data.grantType === 'probate' || data.grantType === 'admin_with_will';
  const isProbate = data.grantType === 'probate';
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Form P3 - Affidavit of Applicant for Grant of Probate</title>
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
    
    .affidavit-header {
      margin-bottom: 18pt;
    }
    
    .affidavit-number {
      margin-bottom: 6pt;
    }
    
    .style-of-proceeding {
      text-align: center;
      font-style: italic;
      margin-bottom: 12pt;
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
    
    .affiant-block {
      margin-bottom: 12pt;
    }
    
    .field-line {
      border-bottom: 1px solid #000;
      display: inline-block;
      min-width: 100pt;
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
    
    .jurat-block {
      margin-top: 36pt;
      border-left: 1px solid #000;
      padding-left: 12pt;
    }
    
    .jurat-line {
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
  </style>
</head>
<body>

<!-- Form Header -->
<div class="form-header">
  <div class="form-number">Form P3 (Rule 25-3 (2))</div>
</div>

<div class="affidavit-header">
  <div class="affidavit-number">This is the <span class="field-line">${getOrdinal(data.affidavitNumber)}</span> affidavit of <span class="field-line">${applicantName}</span> in this case and was made on <span class="field-line">${data.submissionDate}</span></div>
</div>

<div class="style-of-proceeding">[Style of Proceeding]</div>

<div class="form-title">Affidavit of Applicant for Grant of Probate or Grant of Administration with Will Annexed (Short Form)</div>
<div class="rule-note">[Rule 22-3 of the Supreme Court Civil Rules applies to all forms.]</div>

<!-- Affiant Statement -->
<div class="affiant-block">
  I, <span class="field-line">${applicantName}</span>, of <span class="field-line">${formatAddress(applicant.address)}</span>, <span class="field-line">${applicant.isIndividual ? 'occupation' : applicant.organizationTitle || 'occupation'}</span>, SWEAR (OR AFFIRM) THAT:
</div>

<!-- Paragraph 1 -->
<div class="paragraph">
  1 I am the applicant/one of the applicants referred to in the submission for estate grant in relation to the estate of <span class="field-line">${formatFullNameCaps(data.deceased)}</span> (the "deceased") and in relation to the document that is identified in section 4 of Part 3 of the submission for estate grant as the will (the "will"), and am applying for:
</div>

<div class="instruction">[Check whichever one of the following 2 boxes is correct.]</div>

<div class="checkbox-item">
  <span class="checkbox">${checkbox(isProbate)}</span>
  <span>a grant of probate.</span>
</div>

<div class="checkbox-item">
  <span class="checkbox">${checkbox(!isProbate && hasWill)}</span>
  <span>a grant of administration with will annexed.</span>
</div>

<!-- Paragraph 2 -->
<div class="paragraph">
  <span class="instruction">[Check the box for whichever one of the following section 2's is best and provide any required information. The first four section 2's provide a guided response for the most common situations and the last two section 2's provide a more flexible alternative.]</span>
</div>

${applicant.namedInWill ? `
<div class="checkbox-item">
  <span class="checkbox">${checkbox(true)}</span>
  <span>I am named as an executor or alternate executor as <span class="field-line">${applicant.nameInWill || applicantName}</span> in the will and my appointment has not been revoked under section 56 (2) of the Wills, Estates and Succession Act or by a codicil to the will.</span>
</div>
` : ''}

${!applicant.namedInWill && applicant.isIndividual ? `
<div class="checkbox-item">
  <span class="checkbox">${checkbox(true)}</span>
  <span>I am not named as an executor or alternate executor in the will, and am a person referred to in paragraph <span class="field-line">${applicant.wesaParagraph || ''}</span> of section 131 of the Wills, Estates and Succession Act.</span>
</div>
` : ''}

<div class="instruction">[If you checked the immediately preceding boxes, check whichever one of the immediately following 3 boxes is correct and complete any required information.]</div>

<div class="checkbox-item">
  <span class="checkbox">${checkbox(!data.otherExecutors || data.otherExecutors.length === 0)}</span>
  <span>No other persons are named in the will as executor.</span>
</div>

<div class="checkbox-item">
  <span class="checkbox">${checkbox(false)}</span>
  <span>No other persons are named in the will as executor who are not parties to this application.</span>
</div>

<div class="checkbox-item">
  <span class="checkbox">${checkbox(data.otherExecutors && data.otherExecutors.length > 0)}</span>
  <span>Other persons are named in the will as executor and, of those, the following person(s) is/are not named as an applicant on the submission for estate grant for the reason shown after that/those person('s/s') name(s):</span>
</div>

<div class="instruction">[Complete the following for each named person.]</div>

${data.otherExecutors ? data.otherExecutors.map(exe => `
<div class="sub-paragraph">
  <span class="field-line">${exe.name}</span> is not named as an applicant on the submission for estate grant because that person
  <div class="checkbox-item">
    <span class="checkbox">${checkbox(exe.reason === 'renounced')}</span>
    <span>has renounced executorship</span>
  </div>
  <div class="checkbox-item">
    <span class="checkbox">${checkbox(exe.reason === 'deceased')}</span>
    <span>is deceased</span>
  </div>
  <div class="checkbox-item">
    <span class="checkbox">${checkbox(exe.reason === 'other')}</span>
    <span>other <span class="field-line">${exe.otherReason || ''}</span></span>
  </div>
</div>
`).join('') : ''}

<!-- Paragraph 3 -->
<div class="paragraph">
  3 <span class="instruction">[Check whichever one of the immediately following 2 boxes is correct.]</span>
</div>

<div class="checkbox-item">
  <span class="checkbox">${checkbox(!data.publicGuardianDelivery)}</span>
  <span>I am not obliged under Rule 25-3 (11) to deliver a filed copy of this submission for estate grant to the Public Guardian and Trustee.</span>
</div>

<div class="checkbox-item">
  <span class="checkbox">${checkbox(!!data.publicGuardianDelivery)}</span>
  <span>I am obliged under Rule 25-3 (11) to deliver a filed copy of this submission for estate grant to the Public Guardian and Trustee.</span>
</div>

<!-- Paragraph 4 -->
<div class="paragraph">
  4 I am satisfied that a diligent search for a testamentary document of the deceased has been made in each place that could reasonably be considered to be a place where a testamentary document may be found, including, without limitation, in all places, both physical and electronic, where the deceased usually kept important documents and that no testamentary document that is dated later than the date of the will has been found.
</div>

<!-- Paragraph 5 -->
<div class="paragraph">
  5 I believe that the will is the last will of the deceased that deals with property in British Columbia.
</div>

<!-- Paragraph 6 -->
<div class="paragraph">
  6 I believe that the will complies with the requirements of Division 1 of Part 4 of the Wills, Estates and Succession Act and
</div>

<div class="sub-paragraph">(a) I am not aware of there being any issues that would call into question the validity or contents of the will,</div>
<div class="sub-paragraph">(b) I am not requesting that the will be recognized as a military will executed in accordance with the requirements of section 38 of the Wills, Estates and Succession Act,</div>
<div class="sub-paragraph">(c) I am not aware of there being any interlineations, erasures or obliterations in, or other alterations to, the will, and</div>
<div class="sub-paragraph">(d) I am not aware of there being any issues arising from the appearance of the will.</div>

<!-- Paragraph 7 -->
<div class="paragraph">
  7 An originally signed version of the will is being filed with the submission for estate grant.
</div>

<!-- Paragraph 8 -->
<div class="paragraph">
  8 A certificate from the chief executive officer under the Vital Statistics Act indicating the results of a search for a wills notice filed by or on behalf of the deceased is filed with this application, and the certificate indicates that no testamentary document that is dated later than the date of the will has been found.
</div>

<!-- Paragraph 9 -->
<div class="paragraph">
  9 All documents referred to in the will are attached to the will.
</div>

<!-- Paragraph 10 -->
<div class="paragraph">
  10 I have read the submission for estate grant and the other documents referred to in that document and I believe that the information contained in that submission for estate grant and those documents is correct and complete.
</div>

<!-- Paragraph 11 -->
<div class="paragraph">
  11 I will administer according to law all of the deceased's estate, I will prepare an accounting as to how the estate was administered and I acknowledge that, in doing this, I will be subject to the legal responsibility of a personal representative.
</div>

<!-- Paragraph 12 -->
<div class="paragraph">
  12 I am not aware of there being any application for a grant of probate or administration, or any grant of probate or administration, or equivalent, having been issued, in relation to the deceased, in British Columbia or in any other jurisdiction.
</div>

<!-- Jurat -->
<div class="jurat-block">
  <table>
    <tr>
      <td style="width: 60%;">
        <div class="jurat-line">SWORN (OR AFFIRMED) BEFORE</div>
        <div class="jurat-line">)</div>
        <div class="jurat-line">ME at <span class="field-line">${underline(20)}</span>, British Columbia</div>
        <div class="jurat-line">)</div>
        <div class="jurat-line">on <span class="field-line">${data.submissionDate}</span> .</div>
        <div class="jurat-line">)</div>
        <div style="margin-top: 24pt; border-bottom: 1px solid #000; min-width: 200pt;">&nbsp;</div>
        <div style="margin-top: 12pt;">&nbsp;</div>
        <div style="border-bottom: 1px solid #000; min-width: 200pt; display: inline-block;">&nbsp;</div>
        <div>A commissioner for taking</div>
        <div>affidavits for British Columbia</div>
        <div><span class="field-line">${underline(30)}</span></div>
        <div style="font-size: 9pt;">[print name or affix stamp of commissioner]</div>
      </td>
      <td style="width: 40%;"></td>
    </tr>
  </table>
</div>

</body>
</html>`;
}
