/**
 * Form P23 - Affidavit of Applicant for Resealing of Grant of Administration without Will Annexed
 * Template matches BC Supreme Court Civil Rules exactly
 */

import { P23Data } from '../types';
import {
  formatFullName,
  formatFullNameCaps,
  formatAddress,
  checkbox,
  underline,
  getOrdinal,
} from '../utils/formatters';

export function generateP23HTML(data: P23Data): string {
  const applicant = data.applicants[data.applicantIndex];
  const applicantName = formatFullName(applicant);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Form P23 - Affidavit of Applicant for Resealing (without Will)</title>
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
  <div class="form-number">Form P23 (Rule 25-6 (2))</div>
</div>

<div class="affidavit-header">
  <div class="affidavit-number">This is the <span class="field-line">${getOrdinal(data.affidavitNumber)}</span> affidavit of <span class="field-line">${applicantName}</span> in this case and was made on <span class="field-line">${data.submissionDate}</span></div>
</div>

<div class="style-of-proceeding">[Style of Proceeding]</div>

<div class="form-title">Affidavit of Applicant for Resealing of Grant of Administration without Will Annexed</div>
<div class="rule-note">[Rule 22-3 of the Supreme Court Civil Rules applies to all forms.]</div>

<!-- Affiant Statement -->
<div class="affiant-block">
  I, <span class="field-line">${applicantName}</span>, of <span class="field-line">${formatAddress(applicant.address)}</span>, <span class="field-line">${applicant.isIndividual ? 'occupation' : applicant.organizationTitle || 'occupation'}</span>, SWEAR (OR AFFIRM) THAT:
</div>

<!-- Paragraph 1 -->
<div class="paragraph">
  1 I am the applicant/one of the applicants referred to in the submission for resealing in relation to the estate of <span class="field-line">${formatFullNameCaps(data.deceased)}</span> (the "deceased").
</div>

<!-- Paragraph 2 -->
<div class="paragraph">
  2 <span class="instruction">[Check the box for whichever one of the following section 2's is best and provide any required information.]</span>
</div>

<div class="checkbox-item">
  <span class="checkbox">${checkbox(applicant.wesaParagraph === '(a)')}</span>
  <span>I am a person referred to in paragraph (a) of section 131 of the <em>Wills, Estates and Succession Act</em>.</span>
</div>

<div class="checkbox-item">
  <span class="checkbox">${checkbox(applicant.wesaParagraph === '(b)')}</span>
  <span>I am a person referred to in paragraph (b) of section 131 of the <em>Wills, Estates and Succession Act</em>.</span>
</div>

<div class="checkbox-item">
  <span class="checkbox">${checkbox(applicant.wesaParagraph === '(c)')}</span>
  <span>I am a person referred to in paragraph (c) of section 131 of the <em>Wills, Estates and Succession Act</em>.</span>
</div>

<div class="checkbox-item">
  <span class="checkbox">${checkbox(applicant.wesaParagraph === '(d)')}</span>
  <span>I am a person referred to in paragraph (d) of section 131 of the <em>Wills, Estates and Succession Act</em>.</span>
</div>

<div class="checkbox-item">
  <span class="checkbox">${checkbox(applicant.wesaParagraph === '(e)')}</span>
  <span>I am a person referred to in paragraph (e) of section 131 of the <em>Wills, Estates and Succession Act</em>.</span>
</div>

<div class="checkbox-item">
  <span class="checkbox">${checkbox(applicant.wesaParagraph === '(f)')}</span>
  <span>I am a person referred to in paragraph (f) of section 131 of the <em>Wills, Estates and Succession Act</em>.</span>
</div>

<!-- Paragraph 3 -->
<div class="paragraph">
  3 A grant of administration without will annexed (the "foreign grant") was issued to me by the <span class="field-line">${data.foreignGrant?.courtName || ''}</span> of <span class="field-line">${data.foreignGrant?.jurisdiction || ''}</span> on <span class="field-line">${data.foreignGrant?.dateIssued || ''}</span>.
</div>

<!-- Paragraph 4 -->
<div class="paragraph">
  4 <span class="instruction">[Check whichever one of the immediately following 2 boxes is correct.]</span>
</div>

<div class="checkbox-item">
  <span class="checkbox">${checkbox(!data.publicGuardianDelivery)}</span>
  <span>I am not obliged under Rule 25-6 (11) to deliver a filed copy of this submission for resealing to the Public Guardian and Trustee.</span>
</div>

<div class="checkbox-item">
  <span class="checkbox">${checkbox(!!data.publicGuardianDelivery)}</span>
  <span>I am obliged under Rule 25-6 (11) to deliver a filed copy of this submission for resealing to the Public Guardian and Trustee.</span>
</div>

<!-- Paragraph 5 -->
<div class="paragraph">
  5 I will administer according to law all of the deceased's estate to which the resealed grant applies, I will prepare an accounting as to how the estate comprising the assets to which the resealed grant applies was administered and how those assets were distributed, and I acknowledge that, in doing this, I will be subject to the legal responsibility of a personal representative.
</div>

<!-- Paragraph 6 -->
<div class="paragraph">
  6 I am not aware of there being any application for a grant of probate or administration, or any grant of probate or administration, or equivalent, having been issued, in relation to the deceased, in British Columbia other than the application for resealing to which this affidavit relates.
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
