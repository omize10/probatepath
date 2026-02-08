/**
 * Form P31 - Order for Removal of Notice of Dispute
 * Template matches BC Supreme Court Civil Rules exactly
 */

import { P31Data } from '../types';
import {
  formatFullNameCaps,
} from '../utils/formatters';

export function generateP31HTML(data: P31Data): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Form P31 - Order for Removal of Notice of Dispute</title>
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
    
    .order-preamble {
      margin-bottom: 12pt;
    }
    
    .order-option {
      margin-left: 24pt;
      margin-bottom: 12pt;
      text-indent: -24pt;
    }
    
    .order-text {
      font-weight: bold;
      margin: 24pt 0;
    }
    
    .signature-block {
      margin-top: 36pt;
      text-align: right;
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
  <div class="form-number">Form P31 (Rule 25-10 (11))</div>
</div>

<!-- Style of Proceeding -->
<div class="style-of-proceeding">[Style of Proceeding]</div>

<div class="form-title">Order for Removal of Notice of Dispute</div>
<div class="rule-note">[Rule 22-3 of the Supreme Court Civil Rules applies to all forms.]</div>

<!-- Order Preamble -->
<div class="order-preamble">
  BEFORE THE HONOURABLE JUSTICE <span class="field-line">${data.judgeName || ''}</span> or<br>
  A JUDGE OF THE COURT<br>
  or<br>
  ASSOCIATE JUDGE <span class="field-line">${data.associateJudgeName || ''}</span><br>
  or<br>
  AN ASSOCIATE JUDGE OF THE COURT
</div>

<div style="margin-bottom: 24pt;">
  <span class="field-line">${data.orderDate || ''}</span>
</div>

<div style="margin-bottom: 12pt; font-style: italic;">
  [Set out whichever one of the immediately following 3 provisions is correct, complete the selected provision and remove the provisions that have not been selected so that they do not appear in the form when the form is filed.]
</div>

<!-- Order Options -->
<div class="order-option">
  ON THE APPLICATION of <span class="field-line">${data.applicantName || ''}</span> [person(s)] coming on for hearing at <span class="field-line">${data.hearingLocation || ''}</span> on <span class="field-line">${data.hearingDate || ''}</span> and on hearing <span class="field-line">${data.heardFrom || ''}</span> [name of person/lawyer] and <span class="field-line">${data.andHeardFrom || ''}</span> [name of person/lawyer];
</div>

<div class="order-option">
  ON THE APPLICATION of <span class="field-line">${data.applicantName || ''}</span> [person(s)] without notice coming on for hearing at <span class="field-line">${data.hearingLocation || ''}</span> on <span class="field-line">${data.hearingDate || ''}</span> and on hearing <span class="field-line">${data.heardFrom || ''}</span> [name of person/lawyer];
</div>

<div class="order-option">
  ON THE APPLICATION of <span class="field-line">${data.applicantName || ''}</span> [person(s)] without a hearing and on reading the materials filed by <span class="field-line">${data.materialsFrom || ''}</span> [name of person/lawyer] and <span class="field-line">${data.andMaterialsFrom || ''}</span> [name of person/lawyer];
</div>

<!-- Order Text -->
<div class="order-text">
  THIS COURT ORDERS that the notice of dispute filed in relation to the estate of <span class="field-line">${formatFullNameCaps(data.deceased)}</span>, deceased, by <span class="field-line">${data.disputantName || ''}</span> is removed.
</div>

<!-- Signature Block -->
<div class="signature-block">
  <div>By the Court.</div>
  <div style="margin-top: 24pt; border-bottom: 1px solid #000; min-width: 200pt; display: inline-block;">&nbsp;</div>
  <div>Registrar</div>
</div>

</body>
</html>`;
}
