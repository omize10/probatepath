/**
 * Form P45 - Affidavit of Electronic Will
 * Template matches BC Supreme Court Civil Rules exactly
 */

import { P45Data } from '../types';
import { formatFullName, formatAddress, underline, checkbox } from '../utils/formatters';

export function generateP45HTML(data: P45Data): string {
  const affiant = data.affiant;
  const affiantName = affiant ? formatFullName(affiant) : underline(25);
  const affiantAddress = affiant?.address ? formatAddress(affiant.address) : underline(40);
  const occupation = affiant?.occupation || underline(20);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Form P45 - Affidavit of Electronic Will</title>
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
      margin-bottom: 12pt;
      margin-left: 18pt;
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
    
    .instruction {
      font-style: italic;
      font-size: 9pt;
      margin: 6pt 0;
    }
  </style>
</head>
<body>

<!-- Form Header -->
<div class="form-number">Form P45 (Rule 25-3 (3))</div>

<div class="style-of-proceeding">[Style of Proceeding]</div>

<div class="form-title">Affidavit of Electronic Will</div>
<div class="rule-note">[Rule 22-3 of the Supreme Court Civil Rules applies to all forms.]</div>

<!-- Affiant Statement -->
<div class="affiant-block">
  I, <span class="field-line">${affiantName}</span>, of <span class="field-line">${affiantAddress}</span>, 
  <span class="field-line">${occupation}</span>, SWEAR (OR AFFIRM) THAT:
</div>

<div class="instruction">
  [<em>Use whichever of the immediately following 2 statements is correct and provide the required information.</em>]
</div>

<div class="checkbox-item">
  <span class="checkbox">${checkbox(data.verificationMethod === 'editDate')}</span>
  <span>I confirm that the original electronic form of the will is <span class="field-value">${data.willFormat || underline(35)}</span>. 
  Before creating a physical copy or creating a digital reproduction of the will in a Portable Document Format (PDF) to submit to the court registry as part of this application, I ensured that the last date the original electronic form of the will was edited is the same date that the electronic will was signed and witnessed, by checking in the following manner <span class="field-value">${data.editDateVerification || underline(35)}</span>.</span>
</div>

<div class="checkbox-item">
  <span class="checkbox">${checkbox(data.verificationMethod === 'locked')}</span>
  <span>I confirm that the original electronic form of the will is <span class="field-value">${data.willFormat || underline(35)}</span>. 
  Before creating a physical copy or creating a digital reproduction of the will in a Portable Document Format (PDF) to submit to the court registry as part of this application, I ensured that the original electronic form of the will was locked to prevent editing in the following manner <span class="field-value">${data.lockingMethod || underline(35)}</span>.</span>
</div>

<!-- Jurat -->
<div class="jurat-block">
  <table>
    <tr>
      <td style="width: 60%;">
        <div class="jurat-line">SWORN (OR AFFIRMED) BEFORE ME</div>
        <div class="jurat-line">)</div>
        <div class="jurat-line">at <span class="field-line">${underline(20)}</span>, British Columbia</div>
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

</body>
</html>`;
}
