/**
 * Form P39 - Certificate
 * Template matches BC Supreme Court Civil Rules exactly
 */

import { P39Data } from '../types';
import { formatFullName, underline } from '../utils/formatters';

export function generateP39HTML(data: P39Data): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Form P39 - Certificate</title>
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
    
    .paragraph {
      margin-bottom: 6pt;
      margin-left: 18pt;
    }
    
    .sub-paragraph {
      margin-left: 36pt;
      margin-bottom: 3pt;
    }
    
    .checkbox-item {
      margin-left: 36pt;
      margin-bottom: 3pt;
      display: flex;
      align-items: flex-start;
    }
    
    .checkbox {
      font-family: "Courier New", monospace;
      margin-right: 6pt;
      flex-shrink: 0;
    }
    
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 36pt;
    }
    
    td {
      vertical-align: top;
      padding: 6pt;
    }
    
    .note {
      text-align: center;
      font-style: italic;
      font-size: 9pt;
      margin-top: 24pt;
    }
  </style>
</head>
<body>

<!-- Form Header -->
<div class="form-number">Form P39 (Rule 25-13 (5))</div>

<div class="style-of-proceeding">[Style of Proceeding]</div>

<div class="form-title">Certificate</div>
<div class="rule-note">[Rule 22-3 of the Supreme Court Civil Rules applies to all forms.]</div>

<div class="paragraph" style="margin-left: 0;">
  I CERTIFY that the results of the inquiry, assessment or accounting ordered under Rule 25-13 (3) (b) are as follows:
</div>

<!-- Paragraph 1 -->
<div class="paragraph">
  1 The accounts of <span class="field-line">${data.personalRepresentative ? formatFullName(data.personalRepresentative) : underline(25)}</span> 
  being the executor/administrator of the estate of 
  <span class="field-line">${data.deceased ? formatFullName(data.deceased).toUpperCase() : underline(25)}</span>, 
  covering the period <span class="field-line">${data.periodStart || underline(15)}</span> 
  to <span class="field-line">${data.periodEnd || underline(15)}</span>, 
  which accounts are attached to the affidavit of 
  <span class="field-line">${data.affiant ? formatFullName(data.affiant) : underline(25)}</span> 
  sworn <span class="field-line">${data.affidavitDate || underline(15)}</span> are approved
</div>

<div class="checkbox-item">
  <span class="checkbox">${data.approvedAsPresented ? '[X]' : '[  ]'}</span>
  <span>as presented.</span>
</div>

<div class="checkbox-item">
  <span class="checkbox">${data.approvedWithConditions ? '[X]' : '[  ]'}</span>
  <span>subject to <span class="field-line">${data.conditions || underline(35)}</span></span>
</div>

<!-- Paragraph 2 -->
<div class="paragraph">
  2 <span class="field-line">${data.personalRepresentative ? formatFullName(data.personalRepresentative) : underline(25)}</span> 
  receive the sum of $<span class="field-line">${data.remunerationAmount || underline(15)}</span> as remuneration.
</div>

<!-- Paragraph 3 -->
<div class="paragraph">
  3 The costs of the passing of the accounts of 
  <span class="field-line">${data.personalRepresentative ? formatFullName(data.personalRepresentative) : underline(25)}</span> 
  be payable from the estate as <span class="field-line">${data.costsBasis || underline(35)}</span>.
</div>

<!-- Paragraph 4 -->
<div class="paragraph">
  4 This certificate is binding on the beneficiaries without further order of the court.
</div>

<table>
  <tr>
    <td style="width: 40%; vertical-align: top;">
      <div>Date: <span class="field-line">${data.submissionDate || underline(18)}</span></div>
    </td>
    <td style="width: 60%; vertical-align: top;">
      <div style="border-bottom: 1px solid #000; min-width: 250pt; min-height: 36pt;">&nbsp;</div>
      <div style="margin-top: 6pt;">Registrar</div>
    </td>
  </tr>
</table>

<div class="note">
  [<em>This certificate may be set out in a separate document or may be endorsed on the bill of costs.</em>]
</div>

</body>
</html>`;
}
