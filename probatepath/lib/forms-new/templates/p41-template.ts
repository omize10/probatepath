/**
 * Form P41 - Requisition — Estates
 * Template matches BC Supreme Court Civil Rules exactly
 */

import { P41Data } from '../types';
import { formatFullName, underline } from '../utils/formatters';

export function generateP41HTML(data: P41Data): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Form P41 - Requisition — Estates</title>
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
    
    .registry-info {
      text-align: right;
      margin-bottom: 12pt;
    }
    
    .court-header {
      text-align: center;
      margin-bottom: 18pt;
    }
    
    .court-name {
      font-style: italic;
      margin-bottom: 6pt;
    }
    
    .estate-title {
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
      min-width: 200pt;
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
    
    .sub-paragraph {
      margin-left: 18pt;
      margin-bottom: 6pt;
    }
    
    .section-label {
      font-weight: bold;
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
    
    .instruction {
      font-style: italic;
      margin: 6pt 0;
    }
  </style>
</head>
<body>

<!-- Form Header -->
<div class="form-number">Form P41 (Rule 25-14 (1))</div>

<div class="registry-info">
  No. <span class="field-value">${data.fileNumber || underline(15)}</span><br>
  <span class="field-value">${data.registry || underline(25)}</span> Registry
</div>

<div class="court-header">
  <div class="court-name">In the Supreme Court of British Columbia</div>
  <div class="estate-title">In the Matter of the Estate of <span class="field-value">${data.deceased ? formatFullName(data.deceased).toUpperCase() : underline(30)}</span>, deceased</div>
</div>

<div class="form-title">Requisition — Estates</div>
<div class="rule-note">[Rule 22-3 of the Supreme Court Civil Rules applies to all forms.]</div>

<div class="paragraph">
  <span class="section-label">Filed by:</span> <span class="field-value">${data.filedBy || underline(40)}</span>
</div>

<div class="paragraph">
  <span class="section-label">Required:</span>
</div>

<div class="sub-paragraph">
  1 The rule or other enactment relied on is <span class="field-value">${data.ruleReliedOn || underline(45)}</span>.
</div>

<div class="sub-paragraph">
  2 Attached to this requisition is a draft of the order required.
</div>

<div class="sub-paragraph">
  3 The evidence in support of the application is <span class="field-value">${data.evidenceDescription || underline(40)}</span>.
</div>

<div class="instruction">
  [<em>Complete the following if the filing of this requisition starts a proceeding.</em>]
</div>

<div class="paragraph">
  This requisition is filed by <span class="field-value">${data.filerName || underline(30)}</span>, whose address for service is as follows:
</div>

<div class="instruction">
  [<em>You must set out the street address of the address for service. One or both of a fax number and an e-mail address may be given as additional addresses for service.</em>]
</div>

<div class="sub-paragraph">
  Street address for service: <span class="field-value">${data.addressForService?.street || underline(50)}</span>
</div>

<div class="sub-paragraph">
  Fax number address for service (if any): <span class="field-value">${data.addressForService?.fax || underline(25)}</span>
</div>

<div class="sub-paragraph">
  E-mail address for service (if any): <span class="field-value">${data.addressForService?.email || underline(30)}</span>
</div>

<div class="sub-paragraph">
  Telephone number: <span class="field-value">${data.addressForService?.phone || underline(30)}</span>
</div>

<table>
  <tr>
    <td style="width: 40%; vertical-align: top;">
      <div>Date: <span class="field-line">${data.submissionDate || underline(18)}</span></div>
    </td>
    <td style="width: 60%; vertical-align: top;">
      <div style="border-bottom: 1px solid #000; min-width: 250pt; min-height: 36pt;">&nbsp;</div>
      <div style="margin-top: 6pt;">Signature of [  ] filing person(s) [  ] lawyer for filing person(s)</div>
      <div style="margin-top: 12pt;"><span class="field-line">${underline(30)}</span></div>
      <div style="font-size: 9pt;">[<em>type or print name</em>]</div>
    </td>
  </tr>
</table>

</body>
</html>`;
}
