/**
 * Form P33 - Answer to Citation
 * Template matches BC Supreme Court Civil Rules exactly
 */

import { P33Data } from '../types';
import {
  formatFullNameCaps,
  checkbox,
} from '../utils/formatters';

export function generateP33HTML(data: P33Data): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Form P33 - Answer to Citation</title>
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
      margin-bottom: 18pt;
    }
    
    .court-line {
      margin-bottom: 3pt;
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
      margin-bottom: 24pt;
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
    
    .answer-text {
      margin-bottom: 18pt;
    }
    
    .checkbox-item {
      margin-left: 18pt;
      margin-bottom: 12pt;
      display: flex;
      align-items: flex-start;
    }
    
    .checkbox {
      font-family: "Courier New", monospace;
      margin-right: 6pt;
      flex-shrink: 0;
    }
    
    .section-header {
      font-weight: bold;
      margin: 12pt 0 6pt 0;
    }
    
    .instruction {
      font-size: 9pt;
      font-style: italic;
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
  <div class="form-number">Form P33 (Rule 25-11 (4))</div>
</div>

<!-- Court Header -->
<div class="court-header">
  <div class="court-line">In the Matter of the Estate of <span class="field-value">${formatFullNameCaps(data.deceased)}</span>, deceased</div>
</div>

<div class="form-title">Answer to Citation</div>
<div class="rule-note">[Rule 22-3 of the Supreme Court Civil Rules applies to all forms.]</div>

<!-- Answer Text -->
<div class="answer-text">
  In answer to the citation to apply for probate, which citation was issued by <span class="field-line">${data.citorName || ''}</span> [name] and dated <span class="field-line">${data.citationDate || ''}</span>
</div>

<div class="instruction" style="margin-bottom: 12pt;">[Check whichever one of the immediately following 2 boxes is correct.]</div>

<!-- Checkbox Options -->
<div class="checkbox-item">
  <span class="checkbox">${checkbox(data.willApplyForProbate)}</span>
  <span>I will apply for a grant of probate and will obtain that grant within 6 months after the date on which the citation was served or within any longer period that the court may allow.</span>
</div>

<div class="checkbox-item">
  <span class="checkbox">${checkbox(!data.willApplyForProbate)}</span>
  <span>I refuse to apply for a grant of probate in respect of the document referred to in the citation and understand that, by this refusal, I am deemed to have renounced executorship.</span>
</div>

<!-- Address for Service -->
<div class="section-header">The address for service of the executor is</div>
<div class="instruction">[You must set out the street address of the address for service. One or both of a fax number and an e-mail address may be given as additional addresses for service.]</div>

<div class="paragraph" style="margin-left: 18pt; margin-top: 12pt;">
  Street address for service: <span class="field-line" style="min-width: 300pt;">${data.addressForService?.street || ''}</span>
</div>

<div class="paragraph" style="margin-left: 18pt;">
  Fax number address for service (if any): <span class="field-line">${data.addressForService?.fax || ''}</span>
</div>

<div class="paragraph" style="margin-left: 18pt;">
  E-mail address for service (if any): <span class="field-line">${data.addressForService?.email || ''}</span>
</div>

<div class="paragraph" style="margin-left: 18pt;">
  Telephone number: <span class="field-line">${data.addressForService?.phone || ''}</span>
</div>

<!-- Signature Block -->
<table style="margin-top: 36pt; width: 100%;">
  <tr>
    <td style="width: 50%; vertical-align: bottom;">
      <div>Date: <span class="field-line">${data.submissionDate || ''}</span></div>
    </td>
    <td style="width: 50%; text-align: right; vertical-align: bottom;">
      <div style="border-bottom: 1px solid #000; min-width: 200pt; display: inline-block; margin-bottom: 6pt;">&nbsp;</div>
      <div>Signature of [ ] cited person [ ] lawyer for cited person</div>
      <div style="margin-top: 12pt; border-bottom: 1px solid #000; min-width: 200pt; display: inline-block;">&nbsp;</div>
      <div>[type or print name]</div>
    </td>
  </tr>
</table>

</body>
</html>`;
}
