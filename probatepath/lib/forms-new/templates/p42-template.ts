/**
 * Form P42 - Notice of Application (Spousal Home or Deficiencies in Will)
 * Template matches BC Supreme Court Civil Rules exactly
 */

import { P42Data } from '../types';
import { formatFullName, underline, checkbox } from '../utils/formatters';

export function generateP42HTML(data: P42Data): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Form P42 - Notice of Application (Spousal Home or Deficiencies in Will)</title>
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
    
    .section-header {
      font-weight: bold;
      margin-top: 12pt;
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
    
    .schIndent1 {
      margin-left: 18pt;
      margin-bottom: 6pt;
    }
    
    .instruction {
      font-style: italic;
      font-size: 9pt;
      margin: 6pt 0;
    }
  </style>
</head>
<body>

<!-- Form Header -->
<div class="form-number">Form P42 (Rule 25-14 (2))</div>

<div class="style-of-proceeding">[Style of Proceeding]</div>

<div class="form-title">Notice of Application (Spousal Home or Deficiencies in Will)</div>
<div class="rule-note">[Rule 22-3 of the Supreme Court Civil Rules applies to all forms.]</div>

<div class="paragraph">
  <strong>Name(s) of applicant(s):</strong> <span class="field-value">${data.applicantNames || underline(50)}</span>
</div>

<div class="paragraph">
  To: <span class="field-value">${data.recipientNames || underline(50)}</span>
</div>

<div class="paragraph">
  TAKE NOTICE that an application will be made by the applicant(s) to the presiding judge or associate judge at the courthouse at 
  <span class="field-value">${data.courtAddress || underline(45)}</span> 
  on <span class="field-value">${data.hearingDate || underline(18)}</span> 
  at <span class="field-value">${data.hearingTime || underline(15)}</span> 
  for the order(s) set out in Part 1 below.
</div>

<div class="paragraph">
  The applicant(s) estimate(s) that the application will take <span class="field-value">${data.timeEstimate || underline(25)}</span>.
</div>

<div class="instruction">
  [<em>Check whichever one of the following boxes is correct.</em>]
</div>

<div class="checkbox-item">
  <span class="checkbox">${checkbox(data.associateJudgeJurisdiction === true)}</span>
  <span>This matter is within the jurisdiction of an associate judge.</span>
</div>

<div class="checkbox-item">
  <span class="checkbox">${checkbox(data.associateJudgeJurisdiction === false)}</span>
  <span>This matter is not within the jurisdiction of an associate judge.</span>
</div>

<!-- PART 1 -->
<div class="section-header">PART 1 — ORDER(S) SOUGHT</div>

<div class="instruction">
  [<em>Check whichever one or more of the following boxes are correct and, using sequentially numbered paragraphs, set out the order(s) that will be sought at the application and indicate against which person(s) the order(s) is(are) sought.</em>]
</div>

<div class="checkbox-item">
  <span class="checkbox">${checkbox(data.ordersSought?.section30 || false)}</span>
  <span>The applicant(s) seek(s) the following order(s) under section 30 of the <em>Wills, Estates and Succession Act</em>:</span>
</div>
<div class="schIndent1">1</div>
<div class="schIndent1">2</div>

<div class="checkbox-item">
  <span class="checkbox">${checkbox(data.ordersSought?.section33 || false)}</span>
  <span>The applicant(s) seek(s) the following order(s) under section 33 of the <em>Wills, Estates and Succession Act</em>:</span>
</div>
<div class="schIndent1">3</div>
<div class="schIndent1">4</div>

<div class="checkbox-item">
  <span class="checkbox">${checkbox(data.ordersSought?.section58 || false)}</span>
  <span>The applicant(s) seek(s) the following order(s) under section 58 of the <em>Wills, Estates and Succession Act</em>:</span>
</div>
<div class="schIndent1">5</div>
<div class="schIndent1">6</div>

<div class="checkbox-item">
  <span class="checkbox">${checkbox(data.ordersSought?.section59 || false)}</span>
  <span>The applicant(s) seek(s) the following order(s) under section 59 of the <em>Wills, Estates and Succession Act</em>:</span>
</div>
<div class="schIndent1">7</div>
<div class="schIndent1">8</div>

<!-- PART 2 -->
<div class="section-header">PART 2 — FACTUAL BASIS</div>

<div class="instruction">
  [<em>Using numbered paragraphs, set out a brief summary of the facts supporting the application.</em>]
</div>
<div class="schIndent1">1</div>
<div class="schIndent1">2</div>

<div class="instruction">
  [<em>If any person sues or is sued in a representative capacity, identify the person and describe the representative capacity.</em>]
</div>

<!-- PART 3 -->
<div class="section-header">PART 3 — LEGAL BASIS</div>

<div class="instruction">
  [<em>Using paragraphs numbered sequentially from Part 2 above, specify any rule or other enactment relied on and provide a brief summary of any other legal arguments on which the applicant(s) intend(s) to rely in support of the orders sought. If appropriate, include citation of applicable cases.</em>]
</div>
<div class="schIndent1">3</div>
<div class="schIndent1">4</div>

<!-- PART 4 -->
<div class="section-header">PART 4 — MATERIAL TO BE RELIED ON</div>

<div class="instruction">
  [<em>List the affidavits and other materials that will be relied on.</em>]
</div>
<div class="schIndent1">1</div>
<div class="schIndent1">2</div>

</body>
</html>`;
}
