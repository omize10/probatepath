/**
 * Form P32 - Citation
 * Template matches BC Supreme Court Civil Rules exactly
 */

import { P32Data } from '../types';
import {
  formatFullNameCaps,
} from '../utils/formatters';

export function generateP32HTML(data: P32Data): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Form P32 - Citation</title>
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
    
    .citation-to {
      margin-bottom: 12pt;
    }
    
    .citation-label {
      font-weight: bold;
    }
    
    .paragraph {
      margin-bottom: 12pt;
    }
    
    .section-header {
      font-weight: bold;
      margin: 12pt 0 6pt 0;
    }
    
    .instruction {
      font-size: 9pt;
      font-style: italic;
    }
    
    .take-notice {
      font-weight: bold;
      margin-top: 24pt;
      margin-bottom: 6pt;
    }
    
    .compliance-text {
      margin-left: 24pt;
      margin-bottom: 6pt;
      text-indent: -24pt;
    }
    
    .note-text {
      font-size: 9pt;
      font-style: italic;
      margin-top: 24pt;
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
  <div class="form-number">Form P32 (Rule 25-11 (1))</div>
</div>

<!-- Court Header -->
<div class="court-header">
  <div class="court-line">In the Matter of the Estate of <span class="field-value">${formatFullNameCaps(data.deceased)}</span>, deceased</div>
</div>

<div class="form-title">Citation</div>
<div class="rule-note">[Rule 22-3 of the Supreme Court Civil Rules applies to all forms.]</div>

<!-- To -->
<div class="citation-to">
  <span class="citation-label">To:</span> <span class="field-value">${data.citedPersonName || ''}</span> [name and address]
</div>

<!-- Citation Body -->
<div class="paragraph">
  This citation is issued by <span class="field-value">${data.citorName || ''}</span> (the "citor") regarding the estate of:
</div>

<div class="paragraph">
  <span class="field-value">${formatFullNameCaps(data.deceased)}</span> (the "deceased"), who died on <span class="field-line">${data.deceased?.dateOfDeath || ''}</span> .
</div>

<div class="paragraph">
  This citation is issued in relation to the following document that is/is alleged to be a will of the deceased:
</div>

<div class="paragraph">
  <span class="field-line" style="min-width: 400pt;">${data.willDescription || ''}</span> [describe document and its location, if known] .
</div>

<div class="paragraph">
  I believe the document exists because: <span class="field-line" style="min-width: 300pt;">${data.basisForBelief || ''}</span> [set out basis for citor's belief] .
</div>

<div class="paragraph">
  You are required to obtain a grant of probate in relation to the above-noted will and comply with Rule 25-11 (4) in the manner set out below.
</div>

<!-- Address for Service -->
<div class="section-header">The citor's address for service is</div>
<div class="instruction">[You must set out the street address of the address for service. One or both of a fax number and an e-mail address may be given as additional addresses for service.]</div>

<div class="paragraph" style="margin-left: 18pt;">
  Street address for service: <span class="field-line" style="min-width: 300pt;">${data.citorAddressForService?.street || ''}</span>
</div>

<div class="paragraph" style="margin-left: 18pt;">
  Fax number address for service (if any): <span class="field-line">${data.citorAddressForService?.fax || ''}</span>
</div>

<div class="paragraph" style="margin-left: 18pt;">
  E-mail address for service (if any): <span class="field-line">${data.citorAddressForService?.email || ''}</span>
</div>

<div class="paragraph" style="margin-left: 18pt;">
  Telephone number: <span class="field-line">${data.citorAddressForService?.phone || ''}</span>
</div>

<!-- Signature Block -->
<table style="margin-top: 36pt; width: 100%;">
  <tr>
    <td style="width: 50%; vertical-align: bottom;">
      <div>Date: <span class="field-line">${data.submissionDate || ''}</span></div>
    </td>
    <td style="width: 50%; text-align: right; vertical-align: bottom;">
      <div style="border-bottom: 1px solid #000; min-width: 200pt; display: inline-block; margin-bottom: 6pt;">&nbsp;</div>
      <div>Signature of [ ] citor [ ] lawyer for citor</div>
      <div style="margin-top: 12pt; border-bottom: 1px solid #000; min-width: 200pt; display: inline-block;">&nbsp;</div>
      <div>[type or print name]</div>
    </td>
  </tr>
</table>

<!-- Note -->
<div class="note-text">
  [Note that a reference to "will" in this citation includes all documents that are included within the definition of "will" in the <em>Wills, Estates and Succession Act</em>.]
</div>

<!-- TAKE NOTICE -->
<div class="take-notice">TAKE NOTICE THAT</div>

<div class="compliance-text">
  you must comply with Rule 25-11 (4) of the Supreme Court Civil Rules by doing one of the following within 6 months after the date on which this citation is served on you:
</div>

<div class="compliance-text">
  (a) obtain a grant of probate in relation to the will referred to in this citation;
</div>

<div class="compliance-text">
  (b) serve on the citor a notice stating that you refuse to apply for a grant of probate in relation to the will referred to in this citation and understanding that, by this refusal, you are deemed to have renounced executorship;
</div>

<div class="compliance-text">
  (c) serve on the citor a notice stating that you have made application for a grant of probate in relation to the will referred to in this citation and that you will obtain that grant within 6 months after the date on which this citation was served on you or within any longer period that the court may allow.
</div>

</body>
</html>`;
}
