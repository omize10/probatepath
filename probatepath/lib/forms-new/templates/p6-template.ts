/**
 * Form P6 - Affidavit of Applicant for Ancillary Grant of Probate or Ancillary Grant of Administration with Will Annexed
 * Template matches BC Supreme Court Civil Rules exactly
 * Used for ancillary grants when a foreign grant with will has been obtained
 */

import { P6Data } from '../types';
import {
  formatFullName,
  formatFullNameCaps,
  formatAddress,
  checkbox,
  underline,
  getOrdinal,
} from '../utils/formatters';

export function generateP6HTML(data: P6Data): string {
  const applicant = data.applicants[data.applicantIndex];
  const applicantName = formatFullName(applicant);
  const isAncillaryProbate = data.grantType === 'ancillary_probate';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Form P6 - Affidavit of Applicant for Ancillary Grant of Probate</title>
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
  <div class="form-number">Form P6 (Rule 25-3 (2))</div>
</div>

<div class="affidavit-header">
  <div class="affidavit-number">This is the <span class="field-line">${getOrdinal(data.affidavitNumber || 1)}</span> affidavit of <span class="field-line">${applicantName}</span> in this case and was made on <span class="field-line">${data.submissionDate}</span></div>
</div>

<div class="style-of-proceeding">[Style of Proceeding]</div>

<div class="form-title">Affidavit of Applicant for Ancillary Grant of Probate or Ancillary Grant of Administration with Will Annexed</div>
<div class="rule-note">[Rule 22-3 of the Supreme Court Civil Rules applies to all forms.]</div>

<!-- Affiant Statement -->
<div class="affiant-block">
  I, <span class="field-line">${applicantName}</span>, of <span class="field-line">${formatAddress(applicant.address)}</span>, <span class="field-line">${applicant.isIndividual ? 'occupation' : applicant.organizationTitle || 'occupation'}</span>, SWEAR (OR AFFIRM) THAT:
</div>

<!-- Paragraph 1 -->
<div class="paragraph">
  1 I am the applicant/one of the applicants referred to in the submission for estate grant in relation to the estate of <span class="field-line">${formatFullNameCaps(data.deceased)}</span> (the "deceased") and in relation to the document that is identified in section 4 of Part 3 of the submission for estate grant as the will (the "will"), and am applying for an ancillary grant of probate or an ancillary grant of administration with will annexed.
</div>

<!-- Paragraph 2 -->
<div class="paragraph">
  2 <span class="instruction">[Check whichever one of the immediately following 2 boxes is correct and provide any required information.]</span>
</div>

<div class="checkbox-item">
  <span class="checkbox">${checkbox(!applicant.isIndividual)}</span>
  <span>The applicant on whose behalf this affidavit is sworn is not an individual and I am authorized by the applicant to swear this affidavit on the applicant's behalf.</span>
</div>

<div class="checkbox-item">
  <span class="checkbox">${checkbox(applicant.isIndividual)}</span>
  <span>I am an individual and ordinarily live at the following location:</span>
</div>

<div class="sub-paragraph">City/town: <span class="field-line">${applicant.isIndividual ? applicant.address.city : underline(20)}</span></div>
<div class="sub-paragraph">Province/state: <span class="field-line">${applicant.isIndividual ? applicant.address.province : underline(20)}</span></div>
<div class="sub-paragraph">Country: <span class="field-line">${applicant.isIndividual ? applicant.address.country : underline(20)}</span></div>

<!-- Paragraph 3 -->
<div class="paragraph">
  3 All of the persons to whom the foreign grant was issued are applicants in the submission for estate grant.
</div>

<!-- Paragraph 4 -->
<div class="paragraph">
  4 <span class="instruction">[Check whichever one of the immediately following 2 boxes is correct.]</span>
</div>

<div class="checkbox-item">
  <span class="checkbox">${checkbox(!data.publicGuardianDelivery)}</span>
  <span>I am not obliged under Rule 25-3 (11) to deliver a filed copy of this submission for estate grant to the Public Guardian and Trustee.</span>
</div>

<div class="checkbox-item">
  <span class="checkbox">${checkbox(!!data.publicGuardianDelivery)}</span>
  <span>I am obliged under Rule 25-3 (11) to deliver a filed copy of this submission for estate grant to the Public Guardian and Trustee.</span>
</div>

<!-- Paragraph 5 -->
<div class="paragraph">
  5 I am satisfied that a diligent search for a testamentary document of the deceased has been made in each place that could reasonably be considered to be a place where a testamentary document may be found, including, without limitation, in all places, both physical and electronic, where the deceased usually kept the deceased's important documents and that no testamentary document that is dated later than the date of the will has been found.
</div>

<!-- Paragraph 6 -->
<div class="paragraph">
  6 I believe that the will is the last will of the deceased that deals with property in British Columbia.
</div>

<!-- Paragraph 7 -->
<div class="paragraph">
  7 I believe that the will complies with the requirements of Division 1 of Part 4 of the <em>Wills, Estates and Succession Act</em> and
</div>

<div class="sub-paragraph">(a) I am not aware of there being any issues that would call into question the validity or contents of the will,</div>
<div class="sub-paragraph">(b) I am not requesting that the will be recognized as a military will executed in accordance with the requirements of section 38 of the <em>Wills, Estates and Succession Act</em>,</div>
<div class="sub-paragraph">(c) I am not aware of there being any interlineations, erasures or obliterations in, or other alterations to, the will, and</div>
<div class="sub-paragraph">(d) I am not aware of there being any issues arising from the appearance of the will.</div>

<!-- Paragraph 8 -->
<div class="paragraph">
  8 A certificate from the chief executive officer under the <em>Vital Statistics Act</em> indicating the results of a search for a wills notice filed by or on behalf of the deceased is filed with this application, and the certificate indicates that no testamentary document that is dated later than the date of the will has been found.
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
  12 I am not aware of there being any application for a grant of probate or administration, or any grant of probate or administration, or equivalent, having been issued, in relation to the deceased, in British Columbia other than the foreign grant.
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
