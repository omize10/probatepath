/**
 * Form P36 - Warrant After Subpoena
 * Template matches BC Supreme Court Civil Rules exactly
 */

import { P36Data } from '../types';
import { formatFullName, formatAddress, underline } from '../utils/formatters';

export function generateP36HTML(data: P36Data): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Form P36 - Warrant After Subpoena</title>
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
    
    .to-officer {
      font-style: italic;
      margin-bottom: 6pt;
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
    
    .signature-line {
      border-bottom: 1px solid #000;
      min-width: 200pt;
      display: inline-block;
      margin-bottom: 3pt;
    }
    
    .section-title {
      font-weight: bold;
      margin-bottom: 6pt;
    }
  </style>
</head>
<body>

<!-- Form Header -->
<div class="form-number">Form P36 (Rule 25-12 (6))</div>

<div class="registry-info">
  No. <span class="field-value">${data.fileNumber || underline(15)}</span><br>
  <span class="field-value">${data.registry || underline(25)}</span> Registry
</div>

<div class="court-header">
  <div class="court-name">In the Supreme Court of British Columbia</div>
  <div class="estate-title">In the Matter of the Estate of <span class="field-value">${data.deceased ? formatFullName(data.deceased).toUpperCase() : underline(30)}</span>, deceased</div>
</div>

<div class="form-title">Warrant After Subpoena</div>
<div class="rule-note">[Rule 22-3 of the Supreme Court Civil Rules applies to all forms.]</div>

<div class="to-officer">To any Peace Officer</div>

<div class="paragraph">
  WHEREAS <span class="field-value">${data.subpoenaRecipient ? formatFullName(data.subpoenaRecipient) : underline(30)}</span> 
  of <span class="field-value">${data.subpoenaRecipient?.address ? formatAddress(data.subpoenaRecipient.address) : underline(40)}</span> 
  was subpoenaed to deliver to the registry the following document(s) within 14 days after service of the subpoena and failed to comply with the subpoena:
</div>

<div class="paragraph">
  <span class="field-value">${data.documentsRequested || underline(80)}</span><br>
  <span class="field-value">${underline(80)}</span>
</div>

<div class="paragraph">
  THIS COURT ORDERS you to apprehend and bring that person promptly before the court at 
  <span class="field-value">${data.courtLocation || underline(40)}</span> 
  and, after that, to deal with that person as directed.
</div>

<table>
  <tr>
    <td style="width: 40%; vertical-align: top;">
      <div>Date: <span class="field-line">${data.submissionDate || underline(20)}</span></div>
    </td>
    <td style="width: 60%; vertical-align: top;">
      <div style="border-bottom: 1px solid #000; min-width: 250pt; min-height: 36pt;">&nbsp;</div>
      <div style="margin-top: 6pt;">A Judge of the Supreme Court of</div>
      <div>British Columbia</div>
      <div style="margin-top: 6pt;"><span class="field-line">${underline(30)}</span></div>
      <div style="font-size: 9pt;">[<em>type or print name</em>]</div>
    </td>
  </tr>
</table>

</body>
</html>`;
}
