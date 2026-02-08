/**
 * Form P16 - Affidavit of Interlineation, Erasure, Obliteration or Other Alteration
 * Template matches BC Supreme Court Civil Rules exactly
 */

import { P16Data } from '../types';
import {
  formatFullName,
  formatFullNameCaps,
  formatAddress,
  checkbox,
  underline,
  getOrdinal,
} from '../utils/formatters';

export function generateP16HTML(data: P16Data): string {
  const applicant = data.applicants[data.applicantIndex];
  const applicantName = formatFullName(applicant);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Form P16 - Affidavit of Interlineation, Erasure, Obliteration or Other Alteration</title>
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
      text-align: right;
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
  <div class="form-number">Form P16 (Rule 25-3 (20))</div>
</div>

<div class="affidavit-header">
  <div class="affidavit-number">This is the <span class="field-line">${getOrdinal(data.affidavitNumber)}</span> affidavit of <span class="field-line">${applicantName}</span> in this case<br>
  and was made on <span class="field-line">${data.submissionDate}</span></div>
</div>

<div class="style-of-proceeding">[Style of Proceeding]</div>

<div class="form-title">Affidavit of Interlineation, Erasure, Obliteration or Other Alteration</div>
<div class="rule-note">[Rule 22-3 of the Supreme Court Civil Rules applies to all forms.]</div>

<!-- Affiant Statement -->
<div class="affiant-block">
  I, <span class="field-line">${applicantName}</span>, of <span class="field-line">${formatAddress(applicant.address)}</span>, <span class="field-line">${applicant.isIndividual ? 'occupation' : applicant.organizationTitle || 'occupation'}</span>, SWEAR (OR AFFIRM) THAT:
</div>

<!-- Paragraph 1 -->
<div class="paragraph">
  1 The will of <span class="field-line">${formatFullNameCaps(data.deceased)}</span>, deceased (the "will-maker"), dated <span class="field-line">${data.willDate || underline(15)}</span> contains an interlineation, erasure, obliteration or other alteration at <span class="field-line">${data.alterationLocation || underline(30)}</span> [describe the location of the interlineation, erasure, obliteration or other alteration in the text of the will by reference to page number and line number or by other exact reference].
</div>

<!-- Paragraph 2 -->
<div class="paragraph">
  2 <span class="instruction">[Check whichever one of the immediately following 4 boxes is correct and provide any required information.]</span>
</div>

<div class="checkbox-item">
  <span class="checkbox">${checkbox(data.wasPresentAtSigning && data.alterationWasPresentWhenSigned)}</span>
  <span>I was present when the will was signed and the will contained the interlineation, erasure, obliteration or other alteration at that time and the will-maker</span>
</div>

<div class="sub-paragraph">
  <span class="checkbox">${checkbox(data.alterationMadeAtDirection)}</span>
  made the interlineation, erasure, obliteration or other alteration
</div>

<div class="sub-paragraph">
  <span class="checkbox">${checkbox(data.alterationMadeWithConsent)}</span>
  directed another person to make the interlineation, erasure, obliteration or other alteration in the presence of the will-maker and that other person made the interlineation, erasure, obliteration or other alteration in the manner directed by the will-maker
</div>

<div class="checkbox-item">
  <span class="checkbox">${checkbox(!data.wasPresentAtSigning)}</span>
  <span>I was not present when the will was signed but the interlineation, erasure, obliteration or other alteration was made after the will was signed and the will-maker</span>
</div>

<div class="sub-paragraph">
  <span class="checkbox">${checkbox(!data.wasPresentAtSigning && data.alterationMadeAtDirection)}</span>
  made the interlineation, erasure, obliteration or other alteration
</div>

<div class="sub-paragraph">
  <span class="checkbox">${checkbox(!data.wasPresentAtSigning && data.alterationMadeWithConsent)}</span>
  directed another person to make the interlineation, erasure, obliteration or other alteration in the presence of the will-maker and that other person made the interlineation, erasure, obliteration or other alteration in the manner directed by the will-maker
</div>

<div class="checkbox-item">
  <span class="checkbox">${checkbox(false)}</span>
  <span>The interlineation, erasure, obliteration or other alteration was made by a person other than the will-maker and was not made at the direction of the will-maker.</span>
</div>

<div class="checkbox-item">
  <span class="checkbox">${checkbox(false)}</span>
  <span>The following are the circumstances respecting the interlineation, erasure, obliteration or other alteration:</span>
</div>

<div class="paragraph" style="margin-left: 36pt;">
  <span class="field-line" style="min-width: 400pt; display: block;">${underline(80)}</span>
  <span class="field-line" style="min-width: 400pt; display: block; margin-top: 6pt;">${underline(80)}</span>
  <span class="field-line" style="min-width: 400pt; display: block; margin-top: 6pt;">${underline(80)}</span>
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
