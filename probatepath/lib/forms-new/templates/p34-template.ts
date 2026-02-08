/**
 * Form P34 - Affidavit of Deemed Renunciation
 * Template matches BC Supreme Court Civil Rules exactly
 */

import { P34Data } from '../types';
import {
  formatFullName,
  formatFullNameCaps,
  formatAddress,
  checkbox,
  underline,
  getOrdinal,
} from '../utils/formatters';

export function generateP34HTML(data: P34Data): string {
  const citor = data.applicants?.[data.applicantIndex] || { firstName: '', lastName: '', address: { city: '', province: '' } };
  const citorName = formatFullName(citor);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Form P34 - Affidavit of Deemed Renunciation</title>
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
      margin-bottom: 6pt;
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
    
    .option-or {
      text-align: center;
      font-style: italic;
      margin: 12pt 0;
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
  <div class="form-number">Form P34 (Rule 25-11 (7))</div>
</div>

<div class="affidavit-header">
  <div class="affidavit-number">This is the <span class="field-line">${getOrdinal(data.affidavitNumber)}</span> affidavit of <span class="field-line">${citorName}</span> in this case and was made on <span class="field-line">${data.submissionDate}</span></div>
</div>

<div class="style-of-proceeding">[Style of Proceeding]</div>

<div class="form-title">Affidavit of Deemed Renunciation</div>
<div class="rule-note">[Rule 22-3 of the Supreme Court Civil Rules applies to all forms.]</div>

<!-- Affiant Statement -->
<div class="affiant-block">
  I, <span class="field-line">${citorName}</span>, of <span class="field-line">${formatAddress(citor.address)}</span>, <span class="field-line">${citor.isIndividual ? 'occupation' : citor.organizationTitle || 'occupation'}</span>, SWEAR (OR AFFIRM) THAT:
</div>

<!-- Paragraph 1 -->
<div class="paragraph">
  1 Attached to this affidavit and marked as Exhibit A is a copy of the citation I prepared (the "citation") in relation to the estate of <span class="field-line">${formatFullNameCaps(data.deceased)}</span>, deceased.
</div>

<!-- Paragraph 2 -->
<div class="paragraph">
  2 <span class="instruction">[Check whichever one of the immediately following 2 boxes is correct.]</span>
</div>

<div class="checkbox-item">
  <span class="checkbox">${checkbox(data.serviceMethod === 'personal')}</span>
  <span>On <span class="field-line">${data.serviceDate || ''}</span>, at <span class="field-line">${data.serviceTime || ''}</span> [time of day], I served <span class="field-line">${data.personServed || ''}</span> [name of person served] with the citation by handing it to and leaving it with that person at <span class="field-line">${data.serviceLocation || ''}</span> [city and country].</span>
</div>

<div class="option-or">OR</div>

<div class="checkbox-item">
  <span class="checkbox">${checkbox(data.serviceMethod === 'affidavit')}</span>
  <span>In support of this affidavit is filed the affidavit of service dated <span class="field-line">${data.affidavitOfServiceDate || ''}</span> of <span class="field-line">${data.affidavitOfServiceName || ''}</span> [name of person swearing affidavit of service] in which that person swears that the citation was served on <span class="field-line">${data.personServed || ''}</span> [name of person served].</span>
</div>

<!-- Paragraph 3 -->
<div class="paragraph">
  3 <span class="instruction">[Check whichever one of the immediately following 3 boxes is correct.]</span>
</div>

<div class="checkbox-item">
  <span class="checkbox">${checkbox(data.responseStatus === 'no_response')}</span>
  <span>I have not received service of any of the documents referred to in Rule 25-11 (4) and at least 14 days have elapsed since the citation was served on <span class="field-line">${data.personServed || ''}</span> [name of person served].</span>
</div>

<div class="option-or">OR</div>

<div class="checkbox-item">
  <span class="checkbox">${checkbox(data.responseStatus === 'refusal')}</span>
  <span><span class="field-line">${data.personServed || ''}</span> [name of person served] served on me, under Rule 25-11 (4) (b) (iii) (B), the answer to citation that is attached to this affidavit and marked as Exhibit B.</span>
</div>

<div class="option-or">OR</div>

<div class="checkbox-item">
  <span class="checkbox">${checkbox(data.responseStatus === 'other')}</span>
  <span><span class="field-line">${data.personServed || ''}</span> [name of person served] served on me the document referred to in Rule 25-11 (4) <span class="field-line">${data.rule25114Paragraph || ''}</span> [Set out whichever one of the following 3 choices is correct — (b) (i)/(b) (ii)/(b) (iii) (A)] and has not, alone or with others, obtained a grant of probate.</span>
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
