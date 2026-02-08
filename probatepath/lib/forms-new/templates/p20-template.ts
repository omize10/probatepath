/**
 * Form P20 - Correction Record
 * Template matches BC Supreme Court Civil Rules exactly
 */

import { P20Data } from '../types';
import {
  formatFullNameCaps,
  checkbox,
  underline,
} from '../utils/formatters';

export function generateP20HTML(data: P20Data): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Form P20 - Correction Record</title>
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
    
    .correction-table {
      width: 100%;
      border-collapse: collapse;
      margin: 18pt 0;
    }
    
    .correction-table th,
    .correction-table td {
      border: 1px solid #000;
      padding: 8pt;
      text-align: left;
      vertical-align: top;
    }
    
    .correction-table th {
      background-color: #f5f5f5;
      font-weight: bold;
    }
    
    .checkbox-item {
      margin-left: 18pt;
      margin-bottom: 3pt;
      display: flex;
      align-items: flex-start;
    }
    
    .checkbox {
      font-family: "Courier New", monospace;
      margin-right: 6pt;
      flex-shrink: 0;
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
<div class="form-title">Form P20 (Rule 25-3 (9))</div>
<div class="form-subtitle">CORRECTION RECORD</div>
<div class="rule-note">[Rule 22-3 of the Supreme Court Civil Rules applies to all forms.]</div>

<!-- Registry Information -->
<div class="paragraph">
  <strong>Registry:</strong> <span class="field-value">${data.registry}</span>
</div>

<div class="paragraph">
  <strong>No.:</strong> <span class="field-line">${data.fileNumber}</span>
</div>

<!-- Style of Proceeding -->
<div style="text-align: center; font-style: italic; margin: 18pt 0;">
  In the Matter of the Estate of <span class="field-value">${formatFullNameCaps(data.deceased)}</span>, deceased
</div>

<!-- Correction Statement -->
<div class="paragraph">
  <strong>This correction record is filed to correct information in the following document(s):</strong>
</div>

<div class="instruction">[Check all boxes that apply.]</div>

<div class="checkbox-item">
  <span class="checkbox">${checkbox(data.documentsToCorrect?.includes('P1') || false)}</span>
  <span>Notice of Proposed Application in Relation to Estate (Form P1)</span>
</div>

<div class="checkbox-item">
  <span class="checkbox">${checkbox(data.documentsToCorrect?.includes('P2') || false)}</span>
  <span>Submission for Estate Grant (Form P2)</span>
</div>

<div class="checkbox-item">
  <span class="checkbox">${checkbox(data.documentsToCorrect?.includes('P3') || false)}</span>
  <span>Affidavit of Applicant (Form P3, P4, P5, P6 or P7)</span>
</div>

<div class="checkbox-item">
  <span class="checkbox">${checkbox(data.documentsToCorrect?.includes('P10') || false)}</span>
  <span>Affidavit of Assets and Liabilities (Form P10 or P11)</span>
</div>

<div class="checkbox-item">
  <span class="checkbox">${checkbox(data.documentsToCorrect?.includes('other') || false)}</span>
  <span>Other: <span class="field-line">${data.otherDocument || ''}</span></span>
</div>

<!-- Correction Details Table -->
<table class="correction-table">
  <thead>
    <tr>
      <th style="width: 30%;">Item/Paragraph to be Corrected</th>
      <th style="width: 35%;">Information as Originally Stated</th>
      <th style="width: 35%;">Corrected Information</th>
    </tr>
  </thead>
  <tbody>
    ${data.corrections?.map((corr, index) => `
    <tr>
      <td>${corr.item || ''}</td>
      <td>${corr.originalText || ''}</td>
      <td>${corr.correctedText || ''}</td>
    </tr>
    `).join('') || `
    <tr>
      <td>&nbsp;</td>
      <td>&nbsp;</td>
      <td>&nbsp;</td>
    </tr>
    <tr>
      <td>&nbsp;</td>
      <td>&nbsp;</td>
      <td>&nbsp;</td>
    </tr>
    <tr>
      <td>&nbsp;</td>
      <td>&nbsp;</td>
      <td>&nbsp;</td>
    </tr>
    `}
  </tbody>
</table>

<!-- Explanation -->
<div class="paragraph">
  <strong>Explanation of correction(s):</strong>
</div>

<div class="paragraph" style="border: 1px solid #000; min-height: 60pt; padding: 6pt;">
  ${data.explanation || ''}
</div>

<div class="instruction">
  [If additional space is required, attach a separate sheet.]
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
