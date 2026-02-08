/**
 * Form P30 - Withdrawal of Notice of Dispute
 * Template matches BC Supreme Court Civil Rules exactly
 */

import { P30Data } from '../types';
import {
  formatFullNameCaps,
} from '../utils/formatters';

export function generateP30HTML(data: P30Data): string {
  const styleOfProceeding = data.fileNumber 
    ? `[Style of Proceeding]`
    : `[OR use the following title as the style of proceeding if the person filing this withdrawal of notice of dispute has no knowledge of any proceeding having been brought in relation to the estate of the deceased]`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Form P30 - Withdrawal of Notice of Dispute</title>
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
    
    .alternative-title {
      text-align: center;
      font-style: italic;
      font-size: 10pt;
      margin-bottom: 18pt;
    }
    
    .court-line {
      text-align: center;
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
    
    .withdrawal-text {
      margin: 24pt 0;
    }
    
    .paragraph {
      margin-bottom: 12pt;
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
  <div class="form-number">Form P30 (Rule 25-10 (9))</div>
</div>

<!-- Style of Proceeding -->
<div class="style-of-proceeding">${styleOfProceeding}</div>

<!-- Alternative Title for Style -->
${!data.fileNumber ? `
<div class="alternative-title">
  In the Matter of the Estate of <span class="field-value">${formatFullNameCaps(data.deceased)}</span>, deceased
</div>
` : `
<div class="court-line">In the Matter of the Estate of <span class="field-value">${formatFullNameCaps(data.deceased)}</span>, deceased</div>
`}

<div class="form-title">Withdrawal of Notice of Dispute</div>
<div class="rule-note">[Rule 22-3 of the Supreme Court Civil Rules applies to all forms.]</div>

<!-- Withdrawal Text -->
<div class="withdrawal-text">
  <div class="paragraph">
    I, <span class="field-value">${data.withdrawingPersonName || ''}</span> withdraw the notice of dispute filed by me with this court registry on <span class="field-line">${data.noticeOfDisputeDate || ''}</span> in relation to the estate of <span class="field-value">${formatFullNameCaps(data.deceased)}</span>, deceased, who died on <span class="field-line">${data.deceased?.dateOfDeath || ''}</span> .
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
      <div>Signature of [ ] person filing withdrawal of notice [ ] lawyer for person filing withdrawal of notice</div>
      <div style="margin-top: 12pt; border-bottom: 1px solid #000; min-width: 200pt; display: inline-block;">&nbsp;</div>
      <div>[type or print name]</div>
    </td>
  </tr>
</table>

</body>
</html>`;
}
