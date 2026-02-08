/**
 * Form P13 - Direction of Public Guardian and Trustee
 * Template matches BC Supreme Court Civil Rules exactly
 */

import { P13Data } from '../types';
import {
  checkbox,
  underline,
} from '../utils/formatters';

export function generateP13HTML(data: P13Data): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Form P13 - Direction of Public Guardian and Trustee</title>
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
      margin-bottom: 12pt;
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
    
    .instruction {
      font-size: 9pt;
      font-style: italic;
      margin: 6pt 0;
    }
    
    .paragraph {
      margin-bottom: 6pt;
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
      margin-top: 24pt;
    }
    
    td {
      vertical-align: top;
      padding: 6pt;
    }
    
    .signature-line {
      border-top: 1px solid #000;
      margin-top: 36pt;
      padding-top: 3pt;
    }
  </style>
</head>
<body>

<!-- Form Header -->
<div class="form-header">
  <div class="form-number">Form P13 (Rule 25-3 (13))</div>
</div>

<div class="style-of-proceeding">[Style of Proceeding]</div>

<div class="form-title">Direction of Public Guardian and Trustee</div>
<div class="rule-note">[Rule 22-3 of the Supreme Court Civil Rules applies to all forms.]</div>

<!-- Direction Text -->
<div class="paragraph">
  Pursuant to Rule 25-3 (13) of the Supreme Court Civil Rules, the Public Guardian and Trustee hereby directs that the court file in this proceeding <span class="instruction">[add, if required:</span> including the following related material <span class="field-line">${data.relatedMaterial || underline(25)}</span> <span class="field-line">${underline(25)}</span> <span class="instruction">identify]</span> be sealed in the manner and for the period referred to in section 125 of the <em>Wills, Estates and Succession Act</em>.
</div>

<!-- Signature Block -->
<table>
  <tr>
    <td style="width: 35%; vertical-align: top;">
      <div>Date: <span class="field-line">${data.dateIssued || underline(18)}</span></div>
    </td>
    <td style="width: 65%; vertical-align: top;">
      <div style="margin-bottom: 36pt;">.......................................................................</div>
      <div style="margin-left: 18pt; margin-bottom: 12pt;">
        <span class="checkbox">${checkbox(data.signatoryType === 'pgt')}</span> Public Guardian and Trustee
      </div>
      <div style="margin-left: 18pt; margin-bottom: 24pt;">
        <span class="checkbox">${checkbox(data.signatoryType === 'authorized')}</span> authorized signatory for the Public Guardian and Trustee
      </div>
      <div style="border-top: 1px solid #000; padding-top: 3pt;">
        <span class="field-line">${data.signatoryName || underline(35)}</span>
      </div>
      <div style="font-size: 9pt; font-style: italic;">[type or print name]</div>
    </td>
  </tr>
</table>

</body>
</html>`;
}
