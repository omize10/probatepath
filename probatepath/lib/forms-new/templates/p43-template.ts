/**
 * Form P43 - Petition to the Court — Estate Proceedings
 * Template matches BC Supreme Court Civil Rules exactly
 */

import { P43Data } from '../types';
import { formatFullName, underline, checkbox } from '../utils/formatters';

export function generateP43HTML(data: P43Data): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Form P43 - Petition to the Court — Estate Proceedings</title>
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
    
    .registry-info {
      text-align: right;
      margin-bottom: 12pt;
    }
    
    .court-header {
      text-align: center;
      margin-bottom: 18pt;
    }
    
    .court-name {
      font-style: italic;
      margin-bottom: 6pt;
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
    
    .sub-paragraph {
      margin-left: 36pt;
      margin-bottom: 3pt;
    }
    
    .sub-sub-paragraph {
      margin-left: 54pt;
      margin-bottom: 3pt;
    }
    
    .style-of-proceeding {
      margin-bottom: 12pt;
    }
    
    .between-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 3pt;
    }
    
    .right-aligned {
      text-align: right;
    }
    
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 12pt;
    }
    
    td {
      vertical-align: top;
      padding: 6pt;
      border: 1px solid #000;
    }
    
    .no-border td {
      border: none;
      padding: 3pt 0;
    }
    
    .warning {
      font-weight: bold;
      margin: 12pt 0;
    }
  </style>
</head>
<body>

<!-- Form Header -->
<div class="form-number">Form P43 (Rule 25-14 (2))</div>

<div class="registry-info">
  No. <span class="field-value">${data.fileNumber || underline(15)}</span><br>
  <span class="field-value">${data.registry || underline(25)}</span> Registry
</div>

<div class="court-header">
  <div class="court-name">In the Supreme Court of British Columbia</div>
</div>

<!-- Style of Proceeding -->
<div class="style-of-proceeding">
  <div class="between-row">
    <span>Between</span>
    <span class="right-aligned"><span class="field-value">${data.petitionerNames || underline(40)}</span>, Petitioner(s)</span>
  </div>
  <div class="between-row">
    <span>and</span>
    <span class="right-aligned"><span class="field-value">${data.respondentNames || underline(40)}</span>, Respondent(s)</span>
  </div>
</div>

<div class="instruction" style="font-style: italic; font-size: 9pt; margin-bottom: 12pt;">
  [<em>or, if there is no person against whom relief is sought:</em>]
</div>

<div class="paragraph">
  Re: <span class="field-value">${data.reliefTarget || underline(50)}</span>
</div>

<div class="form-title">Petition to the Court — Estate Proceedings</div>
<div class="rule-note">[Rule 22-3 of the Supreme Court Civil Rules applies to all forms.]</div>

<div class="section-header">ON NOTICE TO:</div>
<div class="paragraph">
  <span class="field-value">${data.noticeRecipients || underline(80)}</span>
</div>

<div class="paragraph">
  The address of the registry is:<br>
  <span class="field-value">${data.registryAddress || underline(60)}</span>
</div>

<div class="paragraph">
  The petitioner(s) estimate(s) that the hearing of the petition will take <span class="field-value">${data.timeEstimate || underline(25)}</span>.
</div>

<div class="paragraph">
  This proceeding is brought for the relief set out below, by
</div>

<div class="instruction" style="font-style: italic; font-size: 9pt; margin-bottom: 6pt;">
  [<em>Check whichever one of the following boxes is correct and complete any required information.</em>]
</div>

<div class="checkbox-item">
  <span class="checkbox">${checkbox(data.namedInStyle)}</span>
  <span>the person(s) named as petitioner(s) in the style of proceedings above</span>
</div>

<div class="checkbox-item">
  <span class="checkbox">${checkbox(!data.namedInStyle)}</span>
  <span><span class="field-value">${data.petitionerNames || underline(40)}</span> (the petitioner(s))</span>
</div>

<div class="paragraph">
  If you intend to respond to this petition, you or your lawyer must
</div>

<div class="sub-paragraph">
  (a) file a response to petition in Form 67 in the above-named registry of this court within the time for response to petition described below, and
</div>

<div class="sub-paragraph">
  (b) serve on the petitioner(s)
</div>

<div class="sub-sub-paragraph">
  (i) 2 copies of the filed response to petition, and
</div>

<div class="sub-sub-paragraph">
  (ii) 2 copies of each filed affidavit on which you intend to rely at the hearing.
</div>

<div class="warning">
  Orders, including orders granting the relief claimed, may be made against you, without any further notice to you, if you fail to file the response to petition within the time for response.
</div>

<div class="section-header">Time for response to petition</div>

<div class="paragraph">
  A response to petition must be filed and served on the petitioner(s),
</div>

<div class="sub-paragraph">
  (a) if you were served with the petition anywhere in Canada, within 21 days after that service,
</div>

<div class="sub-paragraph">
  (b) if you were served with the petition anywhere in the United States of America, within 35 days after that service,
</div>

<div class="sub-paragraph">
  (c) if you were served with the petition anywhere else, within 49 days after that service, or
</div>

<div class="sub-paragraph">
  (d) if the time for response has been set by order of the court, within that time.
</div>

<!-- Address for Service Table -->
<table>
  <tr>
    <td style="width: 5%;">(1)</td>
    <td style="width: 95%;">
      <div>The ADDRESS FOR SERVICE of the petitioner(s) is: <span class="field-value">${data.addressForService?.street || underline(45)}</span></div>
      <div style="font-size: 9pt; font-style: italic; margin-top: 6pt;">
        [<em>Set out the street address of the address for service for each petitioner. One or both of a fax number and an e-mail address may be given as additional addresses for service.</em>]
      </div>
      <div style="margin-top: 12pt;">Fax number address for service (if any) of the petitioner(s): <span class="field-value">${data.addressForService?.fax || underline(30)}</span></div>
      <div style="margin-top: 6pt;">E-mail address for service (if any) of the petitioner(s): <span class="field-value">${data.addressForService?.email || underline(30)}</span></div>
    </td>
  </tr>
  <tr>
    <td>(2)</td>
    <td>
      <div>The name and office address of the petitioner's(s') lawyer is:</div>
      <div style="margin-top: 12pt;"><span class="field-value">${data.lawyerInfo || underline(50)}</span></div>
    </td>
  </tr>
</table>

<div class="section-header" style="text-align: center; margin-top: 24pt;">Claim of the Petitioner(s)</div>

<div class="section-header">Part 1: ORDER(S) SOUGHT</div>

<div class="paragraph">
  [<em>Check whichever one or more of the following boxes are correct and, using sequentially numbered paragraphs, set out the order(s) being sought and indicate against which person(s) the order(s) is(are) sought.</em>]
</div>

<div class="checkbox-item">
  <span class="checkbox">${checkbox(data.ordersSought?.section30 || false)}</span>
  <span>The applicant(s) seek(s) the following order(s) under section 30 of the <em>Wills, Estates and Succession Act</em>:</span>
</div>
<div class="sub-paragraph">1</div>
<div class="sub-paragraph">2</div>

<div class="checkbox-item">
  <span class="checkbox">${checkbox(data.ordersSought?.section33 || false)}</span>
  <span>The applicant(s) seek(s) the following order(s) under section 33 of the <em>Wills, Estates and Succession Act</em>:</span>
</div>
<div class="sub-paragraph">3</div>
<div class="sub-paragraph">4</div>

<div class="checkbox-item">
  <span class="checkbox">${checkbox(data.ordersSought?.section58 || false)}</span>
  <span>The applicant(s) seek(s) the following order(s) under section 58 of the <em>Wills, Estates and Succession Act</em>:</span>
</div>
<div class="sub-paragraph">5</div>
<div class="sub-paragraph">6</div>

<div class="checkbox-item">
  <span class="checkbox">${checkbox(data.ordersSought?.section59 || false)}</span>
  <span>The applicant(s) seek(s) the following order(s) under section 59 of the <em>Wills, Estates and Succession Act</em>:</span>
</div>
<div class="sub-paragraph">7</div>
<div class="sub-paragraph">8</div>

<div class="section-header">Part 2: FACTUAL BASIS</div>

<div class="paragraph">
  [<em>Using numbered paragraphs, set out the material facts on which this petition is based.</em>]
</div>
<div class="sub-paragraph">1</div>
<div class="sub-paragraph">2</div>

<div class="section-header">Part 3: LEGAL BASIS</div>

<div class="paragraph">
  [<em>Using paragraphs numbered sequentially from Part 2 above, specify any rule or other enactment relied on and provide a brief summary of any other legal bases on which the petitioner(s) intend(s) to rely in support of the orders sought.</em>]
</div>
<div class="sub-paragraph">3</div>
<div class="sub-paragraph">4</div>

</body>
</html>`;
}
