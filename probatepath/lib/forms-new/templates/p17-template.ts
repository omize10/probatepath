/**
 * Form P17 - Notice of Renunciation
 * Template matches BC Supreme Court Civil Rules exactly
 */

import { P17Data } from '../types';
import {
  formatFullName,
  formatFullNameCaps,
  formatAddress,
  checkbox,
  underline,
} from '../utils/formatters';

export function generateP17HTML(data: P17Data): string {
  const executor = data.executor || { firstName: '', lastName: '', address: { city: '', province: '' } };
  const executorName = formatFullName(executor);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Form P17 - Notice of Renunciation</title>
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
    
    .form-title {
      text-align: center;
      font-weight: bold;
      font-size: 11pt;
      margin-bottom: 6pt;
    }
    
    .form-subtitle {
      text-align: center;
      font-weight: bold;
      font-size: 11pt;
      margin-bottom: 18pt;
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
    
    .renunciation-text {
      margin: 18pt 0;
      text-align: justify;
    }
    
    .warning-text {
      font-weight: bold;
      margin: 18pt 0;
    }
    
    .signature-block {
      margin-top: 36pt;
    }
    
    .signature-line {
      border-top: 1px solid #000;
      margin-top: 24pt;
      padding-top: 3pt;
      font-size: 10pt;
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
<div class="form-title">Form P17 (Rule 25-1 (4))</div>
<div class="form-subtitle">NOTICE OF RENUNCIATION</div>
<div class="rule-note">[Rule 22-3 of the Supreme Court Civil Rules applies to all forms.]</div>

<!-- Registry Information -->
<div class="paragraph">
  <strong>Registry:</strong> <span class="field-value">${data.registry}</span>
</div>

<div class="paragraph">
  <strong>No.:</strong> <span class="field-line">${data.fileNumber || underline(20)}</span>
</div>

<!-- Style of Proceeding -->
<div style="text-align: center; font-style: italic; margin: 18pt 0;">
  [Style of Proceeding]
</div>

<!-- Renunciation Statement -->
<div class="renunciation-text">
  I, <span class="field-value">${executorName}</span>, of <span class="field-value">${formatAddress(executor.address)}</span>,
  acknowledge that I was named as an executor in the will dated <span class="field-value">${data.willDate || ''}</span>
  of <span class="field-value">${formatFullNameCaps(data.deceased)}</span> (the "deceased").
</div>

<div class="warning-text">
  AND I HEREBY RENOUNCE ALL MY RIGHTS AND TITLE AS EXECUTOR OF THE ESTATE OF THE DECEASED.
</div>

<div class="paragraph">
  I acknowledge that, having renounced executorship, I may not act as executor of the estate of the deceased
  unless the court orders otherwise under Rule 25-14 (9) of the Supreme Court Civil Rules.
</div>

<!-- Signature Block -->
<table style="margin-top: 48pt; width: 100%;">
  <tr>
    <td style="width: 50%; vertical-align: bottom;">
      <div>Date: <span class="field-line">${data.renunciationDate}</span></div>
      <div style="margin-top: 36pt; border-top: 1px solid #000; padding-top: 3pt;">
        Signature of person renouncing
      </div>
      <div style="margin-top: 24pt; border-top: 1px solid #000; padding-top: 3pt; font-style: italic;">
        ${underline(30)}<br>
        [type or print name]
      </div>
    </td>
    <td style="width: 50%;"></td>
  </tr>
</table>

</body>
</html>`;
}
