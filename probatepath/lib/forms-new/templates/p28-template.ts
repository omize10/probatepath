/**
 * Form P28 - Certificate of Resealing
 * Template matches BC Supreme Court Civil Rules exactly
 */

import { P28Data } from '../types';
import {
  formatFullNameCaps,
} from '../utils/formatters';

export function generateP28HTML(data: P28Data): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Form P28 - Certificate of Resealing</title>
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
    
    .certificate-text {
      margin: 24pt 0;
      text-align: justify;
    }
    
    .seal-placeholder {
      height: 120pt;
      width: 120pt;
      border: 2px solid #000;
      border-radius: 50%;
      margin: 24pt auto;
      display: flex;
      align-items: center;
      justify-content: center;
      font-style: italic;
      font-size: 10pt;
    }
    
    .signature-block {
      margin-top: 36pt;
      text-align: right;
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
  <div class="form-number">Form P28 (Rule 25-7 (2))</div>
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

<div class="form-title">In Probate</div>
<div class="rule-note">[Rule 22-3 of the Supreme Court Civil Rules applies to all forms.]</div>

<!-- Certificate Text -->
<div class="certificate-text">
  The <span class="field-line">${data.grantDescription || ''}</span> attached to this certificate has been resealed by the Supreme Court of British Columbia on <span class="field-line">${data.resealingDate || ''}</span> .
</div>

<!-- Seal Placeholder -->
<div style="text-align: center; margin: 24pt 0;">
  <div>(Place seal below)</div>
  <div class="seal-placeholder">
    Seal
  </div>
</div>

<!-- Signature Block -->
<div class="signature-block">
  <div>By the Court.</div>
  <div style="margin-top: 24pt; border-bottom: 1px solid #000; min-width: 200pt; display: inline-block;">&nbsp;</div>
  <div>Registrar</div>
</div>

</body>
</html>`;
}
