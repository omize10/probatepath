/**
 * Form P9 - Affidavit of Delivery
 * Template matches BC Supreme Court Civil Rules exactly
 */

import { P9Data } from '../types';
import {
  formatFullName,
  formatFullNameCaps,
  formatAddress,
  checkbox,
  underline,
  getOrdinal,
} from '../utils/formatters';

export function generateP9HTML(data: P9Data): string {
  const applicant = data.applicants?.[data.applicantIndex] || { firstName: '', lastName: '', address: { city: '', province: '' } };
  const applicantName = formatFullName(applicant);
  
  // Group deliveries by method
  const mailDeliveries = data.deliveries?.filter(d => d.deliveryMethod === 'mail') || [];
  const personalDeliveries = data.deliveries?.filter(d => d.deliveryMethod === 'personal') || [];
  const electronicDeliveries = data.deliveries?.filter(d => d.deliveryMethod === 'electronic') || [];
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Form P9 - Affidavit of Delivery</title>
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
    
    .affidavit-header {
      margin-bottom: 18pt;
    }
    
    .affidavit-number {
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
      margin-bottom: 12pt;
    }
    
    .affiant-block {
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
    
    .instruction {
      font-size: 9pt;
      font-style: italic;
      margin: 6pt 0;
    }
    
    .paragraph {
      margin-bottom: 6pt;
    }
    
    .sub-paragraph {
      margin-left: 36pt;
      margin-bottom: 3pt;
    }
    
    .delivery-entry {
      margin-left: 36pt;
      margin-bottom: 3pt;
    }
    
    .jurat-block {
      margin-top: 36pt;
      border-left: 1px solid #000;
      padding-left: 12pt;
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
<div class="form-header">
  <div class="form-number">Form P9 (Rule 25-3 (2))</div>
</div>

<div class="affidavit-header">
  <div class="affidavit-number">This is the <span class="field-line">${getOrdinal(data.affidavitNumber)}</span> affidavit of <span class="field-line">${applicantName}</span> in this case and was made on <span class="field-line">${data.submissionDate}</span></div>
</div>

<div class="style-of-proceeding">[Style of Proceeding]</div>

<div class="form-title">Affidavit of Delivery</div>
<div class="rule-note">[Rule 22-3 of the Supreme Court Civil Rules applies to all forms.]</div>

<!-- Affiant Statement -->
<div class="affiant-block">
  I, <span class="field-line">${applicantName}</span>, of <span class="field-line">${formatAddress(applicant.address)}</span>, <span class="field-line">${applicant.isIndividual ? 'occupation' : applicant.organizationTitle || 'occupation'}</span>, SWEAR (OR AFFIRM) THAT:
</div>

<!-- Paragraph 1 -->
<div class="paragraph">
  1 Attached to this affidavit and marked as Exhibit A is a copy of a notice of proposed application in Form P1 (the "notice").
</div>

<!-- Paragraph 2 -->
<div class="paragraph">
  2 I delivered a copy of the notice, along with <span class="field-line">${data.documentsDelivered || underline(40)}</span> [identify the document(s), if any, that the applicant is required to deliver under Rule 25-2 (1.1)] to the following persons as follows:
</div>

<div class="instruction">[Check whichever one or more of the immediately following 3 boxes are correct and provide the required information.]</div>

<!-- Mail Delivery -->
<div class="checkbox-item">
  <span class="checkbox">${checkbox(mailDeliveries.length > 0)}</span>
  <span>by mailing it/them to the following persons by ordinary mail:</span>
</div>
${mailDeliveries.length > 0 ? mailDeliveries.map(d => `
<div class="delivery-entry"><span class="field-line">${d.recipientName}</span> on <span class="field-line">${d.deliveryDate}</span></div>
`).join('') : '<div class="delivery-entry"><span class="field-line">${underline(30)}</span> on <span class="field-line">${underline(15)}</span></div>'}

<!-- Personal Delivery -->
<div class="checkbox-item">
  <span class="checkbox">${checkbox(personalDeliveries.length > 0)}</span>
  <span>by handing it/them to and leaving it/them with the following persons:</span>
</div>
${personalDeliveries.length > 0 ? personalDeliveries.map(d => `
<div class="delivery-entry"><span class="field-line">${d.recipientName}</span> on <span class="field-line">${d.deliveryDate}</span></div>
`).join('') : '<div class="delivery-entry"><span class="field-line">${underline(30)}</span> on <span class="field-line">${underline(15)}</span></div>'}

<!-- Electronic Delivery -->
<div class="checkbox-item">
  <span class="checkbox">${checkbox(electronicDeliveries.length > 0)}</span>
  <span>by sending it/them to the following persons by e-mail, fax or other electronic means to that person:</span>
</div>
${electronicDeliveries.length > 0 ? electronicDeliveries.map(d => `
<div class="delivery-entry"><span class="field-line">${d.recipientName}</span> on <span class="field-line">${d.deliveryDate}</span></div>
`).join('') : '<div class="delivery-entry"><span class="field-line">${underline(30)}</span> on <span class="field-line">${underline(15)}</span></div>'}

<!-- Electronic Delivery Acknowledgment Note -->
<div class="instruction">[If you checked the third of the immediately preceding 3 boxes, check both of the immediately following boxes. If you cannot check both of the immediately following boxes in relation to any person to whom the notice was sent by e-mail, fax or other electronic means because the person has not provided the required acknowledgement, you must re-deliver the notice and Rule 25-2 (1.1) documents by mail or personal delivery and swear to that delivery under the first or second of the boxes in this section 2.]</div>

<div class="checkbox-item">
  <span class="checkbox">${checkbox(electronicDeliveries.length > 0)}</span>
  <span>Each of the persons who received delivery by e-mail, fax or other electronic means has, in writing, acknowledged receipt of the document(s) referred to in this section.</span>
</div>

<div class="checkbox-item">
  <span class="checkbox">${checkbox(electronicDeliveries.length > 0)}</span>
  <span>I will retain a copy of those acknowledgements until the personal representative of the deceased is discharged and will produce those acknowledgements promptly after being requested to do so by the registrar.</span>
</div>

<!-- Paragraph 3 -->
<div class="paragraph">
  3 <span class="instruction">[Complete the following phrase for each person referred to in section 2 who received delivery of the notice on behalf of another person under Rule 25-2 (8), (10) or (12).]</span>
</div>

<div class="sub-paragraph">
  I delivered the document(s) referred to in section 2 to <span class="field-line">${data.deliveries?.find(d => d.onBehalfOf)?.recipientName || underline(25)}</span> in his/her capacity as the <span class="field-line">${data.deliveries?.find(d => d.onBehalfOf)?.onBehalfOf?.capacity || underline(20)}</span> [identify capacity, e.g. parent, guardian, committee, etc.] of <span class="field-line">${data.deliveries?.find(d => d.onBehalfOf)?.onBehalfOf?.name || underline(25)}</span> [name of person to whom, under Rule 25-2 (2), the document(s) referred to in section 2 was (were) required to be delivered and on whose behalf the person referred to in this section received delivery of the document(s)].
</div>

<!-- Paragraph 4 - Public Guardian and Trustee -->
<div class="instruction">[Include the following sections if applicable.]</div>

<div class="paragraph">
  4 In accordance with Rule 25-2, I delivered a copy of the document(s) referred to in section 2 to the Public Guardian and Trustee as follows:
</div>

<div class="instruction">[Check whichever one or more of the immediately following 3 boxes are correct.]</div>

<div class="checkbox-item">
  <span class="checkbox">${checkbox(data.publicGuardianDelivery?.method === 'mail')}</span>
  <span>by mailing it/them to the Public Guardian and Trustee by ordinary mail.</span>
</div>

<div class="checkbox-item">
  <span class="checkbox">${checkbox(data.publicGuardianDelivery?.method === 'personal')}</span>
  <span>by handing it/them to and leaving it/them with the Public Guardian and Trustee.</span>
</div>

<div class="checkbox-item">
  <span class="checkbox">${checkbox(data.publicGuardianDelivery?.method === 'electronic')}</span>
  <span>by sending it/them to the Public Guardian and Trustee by e-mail, fax or other electronic means to that person.</span>
</div>

<!-- Paragraph 5 - Electronic Will -->
<div class="paragraph">
  5 In accordance with Rule 25-2 (1.1) (b):
</div>

<div class="checkbox-item">
  <span class="checkbox">${checkbox(!data.electronicWillDemanded)}</span>
  <span>No person who received notice demanded the will in its original electronic form.</span>
</div>

<div class="checkbox-item">
  <span class="checkbox">${checkbox(!!data.electronicWillDemanded)}</span>
  <span>I provided the will or access to the will in its original electronic form to the following person(s) <span class="field-line">${data.electronicWillProvidedTo?.join(', ') || ''}</span> .</span>
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
        <div class="jurat-line">on <span class="field-line">${data.submissionDate}</span> .</div>
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
