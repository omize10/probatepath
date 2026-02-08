/**
 * Form P35 - Requisition for Subpoena
 * Template matches BC Supreme Court Civil Rules exactly
 */

import { P35Data } from '../types';
import {
  formatFullNameCaps,
  checkbox,
} from '../utils/formatters';

export function generateP35HTML(data: P35Data): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Form P35 - Requisition for Subpoena</title>
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
    
    .registry-line {
      display: flex;
      justify-content: space-between;
      margin-bottom: 12pt;
    }
    
    .registry-box {
      border-bottom: 1px solid #000;
      min-width: 150pt;
      display: inline-block;
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
    
    .paragraph {
      margin-bottom: 12pt;
    }
    
    .instruction {
      font-size: 9pt;
      font-style: italic;
      margin: 6pt 0;
    }
    
    .section-header {
      font-weight: bold;
      margin: 12pt 0 6pt 0;
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
  <div class="form-number">Form P35 (Rule 25-12 (2))</div>
</div>

<!-- Court Header -->
<div class="court-header">
  <div class="registry-line">
    <div>No. <span class="registry-box">${data.fileNumber || ''}</span></div>
    <div><span class="registry-box">${data.registry}</span> Registry</div>
  </div>
  <div class="court-line">In the Supreme Court of British Columbia</div>
  <div class="court-line">In the Matter of the Estate of <span class="field-value">${formatFullNameCaps(data.deceased)}</span>, deceased</div>
</div>

<div class="form-title">Requisition for Subpoena</div>
<div class="rule-note">[Rule 22-3 of the Supreme Court Civil Rules applies to all forms.]</div>

<!-- Filed By -->
<div class="paragraph">
  <strong>Filed by:</strong> <span class="field-line">${data.filedBy || ''}</span> [person(s)]
</div>

<!-- Required -->
<div class="paragraph">
  <strong>Required:</strong> A subpoena requiring <span class="field-line">${data.subpoenaTargetName || ''}</span> [name] to deliver to the registrar the following document(s):
</div>

<div class="paragraph" style="margin-left: 18pt;">
  <span class="field-line" style="min-width: 400pt; display: block; margin-bottom: 6pt;">${data.documentsRequired || ''}</span>
</div>

<!-- Paragraph 1 -->
<div class="paragraph">
  1 This requisition for subpoena is filed under Rule 25-12 (2).
</div>

<!-- Paragraph 2 -->
<div class="paragraph">
  2 Attached to this requisition for subpoena is a draft of the subpoena required.
</div>

<!-- Paragraph 3 -->
<div class="paragraph">
  3 The evidence in support of the application is <span class="field-line" style="min-width: 300pt;">${data.evidenceDescription || ''}</span> .
</div>

<div class="instruction" style="margin-left: 36pt;">[If the evidence is an affidavit, describe that affidavit by reference to the name of the person who swore that affidavit and the date on which it was sworn, and file that affidavit with this requisition.]</div>

<!-- Conditional Section -->
<div style="margin-top: 24pt;">
  <div class="instruction">[Complete the following if the filing of this requisition starts a proceeding.]</div>
  
  <div class="paragraph">
    This requisition for subpoena is filed by <span class="field-line">${data.filingPersonName || ''}</span> [name], whose address for service is as follows:
  </div>
  
  <div class="instruction">[You must set out the street address of the address for service. One or both of a fax number and an e-mail address may be given as additional addresses for service.]</div>
  
  <div class="paragraph" style="margin-left: 18pt;">
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
</div>

<!-- Signature Block -->
<table style="margin-top: 36pt; width: 100%;">
  <tr>
    <td style="width: 50%; vertical-align: bottom;">
      <div>Date: <span class="field-line">${data.submissionDate || ''}</span></div>
    </td>
    <td style="width: 50%; text-align: right; vertical-align: bottom;">
      <div style="border-bottom: 1px solid #000; min-width: 200pt; display: inline-block; margin-bottom: 6pt;">&nbsp;</div>
      <div>Signature of [ ] filing person(s) [ ] lawyer for filing person(s)</div>
      <div style="margin-top: 12pt; border-bottom: 1px solid #000; min-width: 200pt; display: inline-block;">&nbsp;</div>
      <div>[type or print name]</div>
    </td>
  </tr>
</table>

</body>
</html>`;
}
