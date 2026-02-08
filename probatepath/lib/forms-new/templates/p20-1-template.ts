/**
 * Form P20.1 - Correction Record for Style of Proceeding
 * Template matches BC Supreme Court Civil Rules exactly
 */

import { P20_1Data } from '../types';
import {
  formatFullNameCaps,
  underline,
} from '../utils/formatters';

export function generateP20_1HTML(data: P20_1Data): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Form P20.1 - Correction Record for Style of Proceeding</title>
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
    
    .instruction {
      font-size: 9pt;
      font-style: italic;
      margin: 6pt 0;
    }
    
    .style-box {
      border: 2px solid #000;
      padding: 18pt;
      margin: 18pt 0;
    }
    
    .style-title {
      font-weight: bold;
      text-align: center;
      margin-bottom: 12pt;
      text-transform: uppercase;
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
<div class="form-title">Form P20.1 (Rule 25-3 (9.1))</div>
<div class="form-subtitle">CORRECTION RECORD FOR STYLE OF PROCEEDING</div>
<div class="rule-note">[Rule 22-3 of the Supreme Court Civil Rules applies to all forms.]</div>

<!-- Registry Information -->
<div class="paragraph">
  <strong>Registry:</strong> <span class="field-value">${data.registry}</span>
</div>

<div class="paragraph">
  <strong>No.:</strong> <span class="field-line">${data.fileNumber}</span>
</div>

<!-- Original Style of Proceeding -->
<div class="style-box">
  <div class="style-title">ORIGINAL STYLE OF PROCEEDING</div>
  
  <div style="text-align: center; margin: 12pt 0;">
    In the Supreme Court of British Columbia
  </div>
  
  <div style="text-align: center; margin: 12pt 0;">
    In the Matter of the Estate of<br>
    <span class="field-value" style="min-width: 300pt;">${formatFullNameCaps(data.deceased)}</span>,<br>
    deceased
  </div>
</div>

<!-- Correction Statement -->
<div class="paragraph">
  <strong>The following correction(s) is/are made to the style of proceeding:</strong>
</div>

<div class="instruction">
  [Set out the corrected style of proceeding in full.]
</div>

<!-- Corrected Style of Proceeding -->
<div class="style-box">
  <div class="style-title">CORRECTED STYLE OF PROCEEDING</div>
  
  <div style="text-align: center; margin: 12pt 0;">
    In the Supreme Court of British Columbia
  </div>
  
  <div style="text-align: center; margin: 12pt 0;">
    In the Matter of the Estate of<br>
    <span class="field-value" style="min-width: 300pt;">${data.correctedDeceasedName ? formatFullNameCaps({ firstName: '', lastName: data.correctedDeceasedName }) : formatFullNameCaps(data.deceased)}</span>,<br>
    deceased
  </div>
</div>

<!-- Explanation -->
<div class="paragraph">
  <strong>Explanation of correction(s) to the style of proceeding:</strong>
</div>

<div class="instruction">
  [Provide a brief explanation of why the correction is being made.]
</div>

<div class="paragraph" style="border: 1px solid #000; min-height: 60pt; padding: 6pt;">
  ${data.explanation || ''}
</div>

<!-- Signature Block -->
<table style="margin-top: 36pt; width: 100%;">
  <tr>
    <td style="width: 50%; vertical-align: bottom;">
      <div>Date: <span class="field-line">${data.correctionDate}</span></div>
      <div style="margin-top: 24pt; border-top: 1px solid #000; padding-top: 3pt;">
        Signature of <span style="font-family: monospace;">[${'  '}]</span> applicant <span style="font-family: monospace;">[${'  '}]</span> lawyer for applicant(s)
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
