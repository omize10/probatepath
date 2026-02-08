/**
 * Form P46 - Demand for Electronic Will
 * Template matches BC Supreme Court Civil Rules exactly
 */

import { P46Data } from '../types';
import { formatFullName, formatAddress, underline } from '../utils/formatters';

export function generateP46HTML(data: P46Data): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Form P46 - Demand for Electronic Will</title>
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
      min-width: 150pt;
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
    
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 36pt;
    }
    
    td {
      vertical-align: top;
      padding: 6pt;
    }
  </style>
</head>
<body>

<!-- Form Header -->
<div class="form-number">Form P46 (Rule 25-2 (1.1))</div>

<div class="style-of-proceeding">[Style of Proceeding]</div>

<div class="form-title">Demand for Electronic Will</div>
<div class="rule-note">[Rule 22-3 of the Supreme Court Civil Rules applies to all forms.]</div>

<div class="paragraph">
  I, <span class="field-value">${data.demandantName || underline(30)}</span>, 
  of <span class="field-value">${data.demandantAddress ? formatAddress(data.demandantAddress) : underline(45)}</span>, 
  in accordance with Rule 25-2 (1.1), require you, 
  <span class="field-value">${data.applicantName || underline(35)}</span> 
  to provide me with either the will of 
  <span class="field-value">${data.deceased ? formatFullName(data.deceased).toUpperCase() : underline(30)}</span> 
  in its original electronic form or access to the third-party electronic repository where the will of 
  <span class="field-value">${data.deceased ? formatFullName(data.deceased).toUpperCase() : underline(30)}</span> 
  is stored, if this is where the sole copy of the will in its original electronic form can be accessed.
</div>

<div class="paragraph">
  If there are expenses in order to access the third-party electronic repository where the will of 
  <span class="field-value">${data.deceased ? formatFullName(data.deceased).toUpperCase() : underline(30)}</span> 
  is stored for the purpose of viewing the will, then, in accordance with Rule 25-15, you must reimburse me for those expenses.
</div>

<div class="paragraph">
  You have 7 days to comply with this demand.
</div>

<div class="paragraph">
  If I am concerned about the validity of the will, I am entitled to file a Notice of Dispute at any time and may choose to do so before the expiry of the 21-day notice period referred to in Form P1 Notice of Proposed Application in Relation to Estate, in order to prevent a grant from issuing to you, so that I have time to assess the electronic will. A Notice of Dispute filed must not be removed until it expires or is withdrawn by me or by order of the court.
</div>

<table>
  <tr>
    <td style="width: 40%; vertical-align: top;">
      <div>Date: <span class="field-line">${data.submissionDate || underline(18)}</span></div>
    </td>
    <td style="width: 60%; vertical-align: top;">
      <div style="border-bottom: 1px solid #000; min-width: 250pt; min-height: 36pt;">&nbsp;</div>
      <div style="margin-top: 6pt;">Signature of notice recipient</div>
      <div style="margin-top: 12pt;"><span class="field-line">${underline(30)}</span></div>
      <div style="font-size: 9pt;">[<em>type or print name</em>]</div>
    </td>
  </tr>
</table>

</body>
</html>`;
}
