/**
 * Form P38 - Affidavit in Support of Application to Pass Accounts
 * Template matches BC Supreme Court Civil Rules exactly
 */

import { P38Data } from '../types';
import { formatFullName, formatAddress, underline, getOrdinal } from '../utils/formatters';

export function generateP38HTML(data: P38Data): string {
  const affiant = data.affiant;
  const affiantName = affiant ? formatFullName(affiant) : underline(25);
  const affiantAddress = affiant?.address ? formatAddress(affiant.address) : underline(40);
  const occupation = affiant?.occupation || underline(20);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Form P38 - Affidavit in Support of Application to Pass Accounts</title>
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
    
    .affidavit-header {
      text-align: right;
      margin-bottom: 12pt;
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
      min-width: 100pt;
    }
    
    .field-value {
      border-bottom: 1px solid #000;
      min-width: 150pt;
      display: inline-block;
      text-align: center;
      font-weight: bold;
    }
    
    .affiant-block {
      margin-bottom: 12pt;
    }
    
    .paragraph {
      margin-bottom: 6pt;
      margin-left: 18pt;
    }
    
    .sub-paragraph {
      margin-left: 36pt;
      margin-bottom: 3pt;
    }
    
    .jurat-block {
      margin-top: 36pt;
    }
    
    .jurat-line {
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
<div class="form-number">Form P38 (Rule 25-13 (2))</div>

<div class="affidavit-header">
  <div>This is the <span class="field-line">${data.affidavitNumber ? getOrdinal(data.affidavitNumber) : underline(12)}</span> affidavit</div>
  <div>of <span class="field-line">${affiantName}</span> in this case</div>
  <div>and was made on <span class="field-line">${data.submissionDate || underline(18)}</span></div>
</div>

<div class="style-of-proceeding">[Style of Proceeding]</div>

<div class="form-title">Affidavit in Support of Application to Pass Accounts</div>
<div class="rule-note">[Rule 22-3 of the Supreme Court Civil Rules applies to all forms.]</div>

<!-- Affiant Statement -->
<div class="affiant-block">
  I, <span class="field-line">${affiantName}</span>, of <span class="field-line">${affiantAddress}</span>, <span class="field-line">${occupation}</span>, SWEAR (OR AFFIRM) THAT:
</div>

<!-- Paragraph 1 -->
<div class="paragraph">
  1 A <span class="field-line">${data.grantType || underline(40)}</span> of the estate of 
  <span class="field-line">${data.deceased ? formatFullName(data.deceased).toUpperCase() : underline(25)}</span>, 
  deceased, was made to me by this court on <span class="field-line">${data.grantDate || underline(18)}</span>.
</div>

<!-- Paragraph 2 -->
<div class="paragraph">
  2 I have administered the estate to the best of my ability.
</div>

<!-- Paragraph 3 -->
<div class="paragraph">
  3 I have filed with the registrar a full and correct accounting of the estate, showing all property, money and effects and the proceeds from them that have come into my hands as personal representative, and also a full and correct statement of all disbursements, with a full and correct statement of the assets not yet disposed of.
</div>

<!-- Paragraph 4 -->
<div class="paragraph">
  4 I have not been awarded any compensation for my services as personal representative by this or any other court except <span class="field-line">${data.compensationAwarded || underline(40)}</span>.
</div>

<!-- Paragraph 5 -->
<div class="paragraph">
  5 The persons interested in the administration of the estate as beneficiaries of the deceased are as follows: <span class="field-line">${data.beneficiaries || underline(50)}</span>, and all of them are of the full age of 19 years except <span class="field-line">${data.minors || underline(35)}</span>.
</div>

<!-- Paragraph 6 -->
<div class="paragraph">
  6 I know of no creditors of the estate who still have unsettled claims against it that I consider to be valid except <span class="field-line">${data.creditors || underline(50)}</span>.
</div>

<!-- Paragraph 7 -->
<div class="paragraph">
  7 The only portion of the estate that remains unadministered is as follows: <span class="field-line">${data.unadministeredAssets || underline(40)}</span>, and the reason it has not been administered is <span class="field-line">${data.reasonUnadministered || underline(40)}</span>.
</div>

<!-- Jurat -->
<div class="jurat-block">
  <table>
    <tr>
      <td style="width: 60%;">
        <div class="jurat-line">SWORN (OR AFFIRMED) BEFORE</div>
        <div class="jurat-line">)</div>
        <div class="jurat-line">ME at <span class="field-line">${underline(20)}</span>, British Columbia</div>
        <div class="jurat-line">)</div>
        <div class="jurat-line">on <span class="field-line">${data.submissionDate || underline(18)}</span> .</div>
        <div class="jurat-line">)</div>
        <div style="margin-top: 24pt; border-bottom: 1px solid #000; min-width: 200pt;">&nbsp;</div>
        <div style="margin-top: 12pt;">&nbsp;</div>
        <div style="border-bottom: 1px solid #000; min-width: 200pt; display: inline-block;">&nbsp;</div>
        <div>A commissioner for taking</div>
        <div>affidavits for British Columbia</div>
        <div><span class="field-line">${underline(30)}</span></div>
        <div style="font-size: 9pt;">[print name or affix stamp of commissioner]</div>
      </td>
      <td style="width: 40%;"></td>
    </tr>
  </table>
</div>

</body>
</html>`;
}
