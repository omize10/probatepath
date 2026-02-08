/**
 * Form P40 - Statement of Account Affidavit
 * Template matches BC Supreme Court Civil Rules exactly
 */

import { P40Data } from '../types';
import { formatFullName, underline, getOrdinal } from '../utils/formatters';

export function generateP40HTML(data: P40Data): string {
  const affiant = data.affiant;
  const affiantName = affiant ? formatFullName(affiant) : underline(25);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Form P40 - Statement of Account Affidavit</title>
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
    
    .form-number {
      font-weight: bold;
      margin-bottom: 6pt;
    }
    
    .affidavit-header {
      text-align: right;
      margin-bottom: 12pt;
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
      margin-bottom: 18pt;
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
    
    .affiant-block {
      margin-bottom: 12pt;
    }
    
    .paragraph {
      margin-bottom: 6pt;
      margin-left: 18pt;
    }
    
    .jurat-block {
      margin-top: 36pt;
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
    
    .exhibit-block {
      margin-top: 48pt;
      page-break-before: always;
    }
    
    .exhibit-label {
      text-align: center;
      font-weight: bold;
      margin-bottom: 12pt;
    }
  </style>
</head>
<body>

<!-- Form Header -->
<div class="form-number">Form P40 (Rule 25-13 (6))</div>

<div class="affidavit-header">
  <div>This is the <span class="field-line">${data.affidavitNumber ? getOrdinal(data.affidavitNumber) : underline(12)}</span> affidavit</div>
  <div>of <span class="field-line">${affiantName}</span> in this case</div>
  <div>and was made on <span class="field-line">${data.submissionDate || underline(18)}</span></div>
</div>

<div class="style-of-proceeding">[Style of Proceeding]</div>

<div class="form-title">Statement of Account Affidavit</div>
<div class="rule-note">[Rule 22-3 of the Supreme Court Civil Rules applies to all forms.]</div>

<!-- Affiant Statement -->
<div class="affiant-block">
  I, <span class="field-line">${affiantName}</span>, of <span class="field-line">${data.affiant?.address ? formatFullName(data.affiant.address) : underline(40)}</span>, 
  <span class="field-line">${data.affiant?.occupation || underline(20)}</span>, SWEAR (OR AFFIRM) THAT:
</div>

<!-- Paragraph 1 -->
<div class="paragraph">
  1 Attached and marked as Exhibit A is a Statement of Account for the Estate of 
  <span class="field-line">${data.deceased ? formatFullName(data.deceased).toUpperCase() : underline(30)}</span>.
</div>

<!-- Paragraph 2 -->
<div class="paragraph">
  2 The information set out in this statement of account is true and complete to the best of my knowledge.
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
        <div class="jurat-line">on <span class="field-line">${data.submissionDate || underline(18)}</span> .</div>
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

<!-- Exhibit A -->
<div class="exhibit-block">
  <div class="exhibit-label">EXHIBIT A</div>
  <div style="text-align: center; margin-bottom: 24pt;">
    <div>This is Exhibit A referred to in the affidavit of</div>
    <div><span class="field-line">${affiantName}</span>, sworn (or affirmed)</div>
    <div>before me on <span class="field-line">${data.submissionDate || underline(18)}</span></div>
  </div>
  
  <div style="margin-top: 36pt;">
    <div style="border-bottom: 1px solid #000; min-width: 250pt; min-height: 36pt; display: inline-block;">&nbsp;</div>
    <div style="margin-top: 6pt;">A commissioner for taking affidavits for British Columbia</div>
  </div>
</div>

</body>
</html>`;
}
