/**
 * Form P29 - Notice of Dispute
 * Template matches BC Supreme Court Civil Rules exactly
 */

import { P29Data } from '../types';
import {
  formatFullNameCaps,
  checkbox,
} from '../utils/formatters';

export function generateP29HTML(data: P29Data): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Form P29 - Notice of Dispute</title>
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
      min-width: 100pt;
    }
    
    .field-value {
      border-bottom: 1px solid #000;
      min-width: 150pt;
      display: inline-block;
      text-align: center;
      font-weight: bold;
    }
    
    .take-notice {
      font-weight: bold;
      margin-bottom: 6pt;
    }
    
    .paragraph {
      margin-bottom: 12pt;
    }
    
    .checkbox-item {
      margin-left: 18pt;
      margin-bottom: 6pt;
      display: flex;
      align-items: flex-start;
    }
    
    .checkbox {
      font-family: "Courier New", monospace;
      margin-right: 6pt;
      flex-shrink: 0;
    }
    
    .instruction {
      font-size: 9pt;
      font-style: italic;
      margin: 6pt 0;
    }
    
    .section-header {
      font-weight: bold;
      margin: 12pt 0 6pt 0;
    }
    
    .signature-block {
      margin-top: 36pt;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
    }
    
    .signature-left {
      width: 45%;
    }
    
    .signature-right {
      width: 45%;
      text-align: right;
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
<div class="form-header">
  <div class="form-number">Form P29 (Rule 25-10 (3))</div>
</div>

<!-- Court Header -->
<div class="court-header">
  <div class="court-line">In the Matter of the Estate of <span class="field-value">${formatFullNameCaps(data.deceased)}</span>, deceased</div>
</div>

<div class="form-title">Notice of Dispute</div>
<div class="rule-note">[Rule 22-3 of the Supreme Court Civil Rules applies to all forms.]</div>

<!-- TAKE NOTICE THAT -->
<div class="take-notice">TAKE NOTICE THAT</div>

<div class="paragraph">
  I, <span class="field-value">${data.disputantName || ''}</span> (the "disputant"), oppose the taking of any action in relation to the estate of the deceased identified below who died on <span class="field-line">${data.deceased?.dateOfDeath || ''}</span> .
</div>

<div class="paragraph">
  Full legal name of the deceased: <span class="field-value">${formatFullNameCaps(data.deceased)}</span>
</div>

<div class="instruction" style="margin-left: 36pt;">[first name] &nbsp;&nbsp;&nbsp;&nbsp; [middle name(s)] &nbsp;&nbsp;&nbsp;&nbsp; [last name/family name]</div>

<div class="paragraph">
  Other names in which the deceased held or may have held an interest in property:
</div>
<div style="margin-left: 36pt;">
  <div>1. ${data.deceased?.aliases?.[0] || ''}</div>
  <div>2. ${data.deceased?.aliases?.[1] || ''}</div>
  <div>3. ${data.deceased?.aliases?.[2] || 'etc.'}</div>
</div>

<div class="instruction">[Check whichever one of the immediately following 2 boxes is correct and provide any required information.]</div>

<div class="checkbox-item">
  <span class="checkbox">${checkbox(!!data.courtFile?.isOpen)}</span>
  <span>A court file has been opened in relation to the deceased's estate under court file <span class="field-line">${data.courtFile?.number || ''}</span> at the <span class="field-line">${data.courtFile?.registry || ''}</span> courthouse.</span>
</div>

<div class="checkbox-item">
  <span class="checkbox">${checkbox(!data.courtFile?.isOpen || data.courtFile === undefined)}</span>
  <span>The disputant does not know if a court file has been opened in relation to the deceased's estate.</span>
</div>

<div class="instruction">[Check whichever one of the immediately following 3 boxes is correct.]</div>

<div class="checkbox-item">
  <span class="checkbox">${checkbox(data.willStatus === 'none')}</span>
  <span>The dispute does not relate to a will.</span>
</div>

<div class="checkbox-item">
  <span class="checkbox">${checkbox(data.willStatus === 'physical')}</span>
  <span>The dispute relates to a physical will.</span>
</div>

<div class="checkbox-item">
  <span class="checkbox">${checkbox(data.willStatus === 'electronic')}</span>
  <span>The dispute relates to an electronic will.</span>
</div>

<div class="paragraph">
  The disputant is a person referred to in Rule 25-2 (2) <span class="field-line">${data.rule252Paragraph || ''}</span> [indicate paragraph of Rule 25-2 (2) that applies to the disputant] .
</div>

<div class="paragraph">
  The disputant is filing this notice of dispute because <span class="field-line" style="min-width: 300pt;">${data.groundsForDispute || ''}</span> [state the grounds for the notice of dispute] .
</div>

<!-- Address for Service -->
<div class="section-header">Address for service of the disputant:</div>
<div class="instruction">[You must set out the street address of the address for service. One or both of a fax number and an e-mail address may be given as additional addresses for service.]</div>

<div class="paragraph" style="margin-left: 18pt;">
  Street address for service: <span class="field-line" style="min-width: 300pt;">${data.addressForService?.street || ''}</span>
</div>

<div class="paragraph" style="margin-left: 18pt;">
  Fax number address for service (if any): <span class="field-line">${data.addressForService?.fax || ''}</span>
</div>

<div class="paragraph" style="margin-left: 18pt;">
  E-mail address for service (if any): <span class="field-line">${data.addressForService?.email || ''}</span>
</div>

<div class="paragraph" style="margin-left: 18pt;">
  Telephone number: <span class="field-line">${data.addressForService?.phone || ''}</span>
</div>

<!-- Signature Block -->
<table style="margin-top: 36pt; width: 100%;">
  <tr>
    <td style="width: 50%; vertical-align: bottom;">
      <div>Date: <span class="field-line">${data.submissionDate || ''}</span></div>
    </td>
    <td style="width: 50%; text-align: right; vertical-align: bottom;">
      <div style="border-bottom: 1px solid #000; min-width: 200pt; display: inline-block; margin-bottom: 6pt;">&nbsp;</div>
      <div>Signature of [ ] disputant [ ] lawyer for disputant</div>
      <div style="margin-top: 12pt; border-bottom: 1px solid #000; min-width: 200pt; display: inline-block;">&nbsp;</div>
      <div>[type or print name]</div>
    </td>
  </tr>
</table>

</body>
</html>`;
}
