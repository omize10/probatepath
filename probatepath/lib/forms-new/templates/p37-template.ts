/**
 * Form P37 - Subpoena
 * Template matches BC Supreme Court Civil Rules exactly
 */

import { P37Data } from '../types';
import { formatFullName, formatAddress, underline } from '../utils/formatters';

export function generateP37HTML(data: P37Data): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Form P37 - Subpoena</title>
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
  </style>
</head>
<body>

<!-- Form Header -->
<div class="form-number">Form P37 (Rule 25-12 (3))</div>

<div class="style-of-proceeding">[Style of Proceeding]</div>

<div class="form-title">Subpoena</div>
<div class="rule-note">[Rule 22-3 of the Supreme Court Civil Rules applies to all forms.]</div>

<div class="paragraph">
  To: <span class="field-value">${data.recipient ? formatFullName(data.recipient) : underline(25)}</span> 
  of <span class="field-value">${data.recipient?.address ? formatAddress(data.recipient.address) : underline(45)}</span>
</div>

<div class="paragraph">
  You are ordered to deliver to the probate registry at the courthouse at 
  <span class="field-value">${data.courtLocation || underline(30)}</span> 
  the following: <span class="field-value">${data.documentsRequested || underline(50)}</span>, 
  within 14 days after service of this subpoena on you.
</div>

<div class="paragraph">
  If any of the specified documents are not in your possession or control, you are, within the same time, to deliver to the above-noted probate registry whichever of the specified documents that are in your possession or control and to file in the above-noted probate registry an affidavit indicating which of the specified documents are not in your possession or control and setting out what knowledge you have respecting those documents.
</div>

<table>
  <tr>
    <td style="width: 40%; vertical-align: top;">
      <div>Date: <span class="field-line">${data.submissionDate || underline(20)}</span></div>
    </td>
    <td style="width: 60%; vertical-align: top;">
      <div style="border-bottom: 1px solid #000; min-width: 250pt; min-height: 36pt;">&nbsp;</div>
      <div style="margin-top: 6pt;">Registrar</div>
    </td>
  </tr>
</table>

</body>
</html>`;
}
