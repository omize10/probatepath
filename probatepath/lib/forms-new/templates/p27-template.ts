/**
 * Form P27 - Authorization to Obtain Resealing Information
 * Template matches BC Supreme Court Civil Rules exactly
 */

import { P27Data } from '../types';
import {
  formatFullName,
  formatFullNameCaps,
  formatAddress,
  formatApplicantNames,
} from '../utils/formatters';

export function generateP27HTML(data: P27Data): string {
  const applicantNames = formatApplicantNames(data.applicants);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Form P27 - Authorization to Obtain Resealing Information</title>
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
    
    .notice-section {
      margin-bottom: 12pt;
    }
    
    .take-notice {
      font-weight: bold;
      margin-bottom: 6pt;
    }
    
    .paragraph {
      margin-bottom: 12pt;
      margin-left: 24pt;
      text-indent: -24pt;
    }

    .sub-paragraph {
      margin-left: 48pt;
      margin-bottom: 6pt;
      text-indent: -24pt;
    }
    
    .warning-text {
      font-weight: bold;
      text-align: center;
      margin: 18pt 0;
      text-transform: uppercase;
    }
    
    .signature-block {
      margin-top: 36pt;
      text-align: right;
    }
    
    .rule-section {
      margin-top: 36pt;
      padding-top: 12pt;
      border-top: 1px solid #ccc;
      font-size: 10pt;
    }
    
    .rule-title {
      font-weight: bold;
      margin-bottom: 6pt;
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
  <div class="form-number">Form P27 (Rule 25-7 (1))</div>
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

<div class="form-title">Authorization to Obtain Resealing Information</div>
<div class="rule-note">[Rule 22-3 of the Supreme Court Civil Rules applies to all forms.]</div>

<!-- TAKE NOTICE THAT -->
<div class="notice-section">
  <div class="take-notice">TAKE NOTICE THAT</div>
  
  <div class="paragraph">
    1 <span class="field-value">${applicantNames}</span> has/have applied for the resealing of a grant issued by the <span class="field-line">${data.foreignGrant?.courtName || ''}</span> on <span class="field-line">${data.foreignGrant?.dateIssued || ''}</span> in relation to the estate of <span class="field-value">${formatFullNameCaps(data.deceased)}</span>, also known as <span class="field-line">${data.deceased?.aliases?.join(', ') || ''}</span> (the "deceased"), whose last residential address was <span class="field-line">${formatAddress(data.deceased?.lastAddress)}</span> .
  </div>
  
  <div class="paragraph">
    2 is/are recognized as the person(s) for whom the grant will be resealed once the court is satisfied that all remaining filings and fee payments have been made, and
  </div>
  
  <div class="paragraph">
    3 is/are authorized to obtain information about the assets and liabilities of the deceased.
  </div>
</div>

<div class="paragraph">
  AND TAKE NOTICE THAT, unless you provide to the applicant(s), within 30 days after the date on which this authorization to obtain resealing information is delivered to you, information respecting the nature and value of any assets of the estate of the deceased that are in your possession or control, the applicant(s) may make application under Rule 25-8 (2), set out below, for an order requiring delivery of that information and seeking costs from you for that application.
</div>

<div class="warning-text">
  THIS AUTHORIZATION TO OBTAIN RESEALING INFORMATION DOES NOT AUTHORIZE THE APPLICANT(S) TO TAKE DELIVERY OF ANY OF THE ASSETS OF THE DECEASED.
</div>

<!-- Signature Block -->
<div class="signature-block">
  <div style="border-bottom: 1px solid #000; min-width: 200pt; display: inline-block; margin-bottom: 6pt;">&nbsp;</div>
  <div>Registrar</div>
</div>

<!-- Rule Reference -->
<div class="rule-section">
  <div class="rule-title">Rule 25-8 (2) of the Supreme Court Civil Rules states:</div>
  <div style="font-weight: bold; margin-bottom: 6pt;">Order to provide information</div>
  <div class="paragraph" style="margin-left: 0; text-indent: 0;">(2) A person to whom a copy of an authorization to obtain estate information or authorization to obtain resealing information has been delivered under Rule 25-2 may be ordered to provide information, under oath or otherwise, respecting the nature and value of any assets of the estate of the deceased that are in the possession or control of that person.</div>
</div>

</body>
</html>`;
}
