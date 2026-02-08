/**
 * Form P44 - Notice of Withdrawal of Application
 * Template matches BC Supreme Court Civil Rules exactly
 */

import { P44Data } from '../types';
import { formatFullName, underline } from '../utils/formatters';

export function generateP44HTML(data: P44Data): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Form P44 - Notice of Withdrawal of Application</title>
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
<div class="form-number">Form P44 (Rule 25-3.2)</div>

<div class="style-of-proceeding">[Style of Proceeding]</div>

<div class="form-title">Notice of Withdrawal of Application</div>
<div class="rule-note">[Rule 22-3 of the Supreme Court Civil Rules applies to all forms.]</div>

<div class="paragraph">
  <strong>Filed by:</strong> <span class="field-value">${data.filedBy || underline(50)}</span>
</div>

<div class="paragraph">
  TAKE NOTICE that the applicant(s), <span class="field-value">${data.applicantNames || underline(50)}</span>, 
  withdraw(s) <span class="field-value">${data.withdrawalType || underline(30)}</span> application for estate grant
  <span class="field-value">${data.applicationDetails || underline(40)}</span>.
</div>

<table>
  <tr>
    <td style="width: 40%; vertical-align: top;">
      <div>Date: <span class="field-line">${data.submissionDate || underline(18)}</span></div>
    </td>
    <td style="width: 60%; vertical-align: top;">
      <div style="border-bottom: 1px solid #000; min-width: 250pt; min-height: 36pt;">&nbsp;</div>
      <div style="margin-top: 6pt;">Signature of [  ] applicant [  ] lawyer for applicant(s)</div>
      <div style="margin-top: 12pt;"><span class="field-line">${underline(30)}</span></div>
      <div style="font-size: 9pt;">[<em>type or print name</em>]</div>
    </td>
  </tr>
</table>

</body>
</html>`;
}
