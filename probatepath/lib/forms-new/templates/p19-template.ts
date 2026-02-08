/**
 * Form P19 - Estate Grant (In Probate)
 * Template matches BC Supreme Court Civil Rules exactly
 */

import { P19Data } from '../types';
import {
  formatFullName,
  formatFullNameCaps,
  checkbox,
  underline,
} from '../utils/formatters';

export function generateP19HTML(data: P19Data): string {
  const applicantNames = data.applicants.map(formatFullName).join(', ');
  const grantTypeText = data.grantType === 'probate' ? 'GRANT OF PROBATE' :
    data.grantType === 'admin_with_will' ? 'GRANT OF ADMINISTRATION WITH WILL ANNEXED' :
    data.grantType === 'admin_without_will' ? 'GRANT OF ADMINISTRATION WITHOUT WILL ANNEXED' :
    data.grantType === 'ancillary_probate' ? 'ANCILLARY GRANT OF PROBATE' :
    data.grantType === 'ancillary_admin_with_will' ? 'ANCILLARY GRANT OF ADMINISTRATION WITH WILL ANNEXED' :
    data.grantType === 'ancillary_admin_without_will' ? 'ANCILLARY GRANT OF ADMINISTRATION WITHOUT WILL ANNEXED' :
    'ESTATE GRANT';

  const hasWill = data.grantType === 'probate' || 
    data.grantType === 'admin_with_will' ||
    data.grantType === 'ancillary_probate' || 
    data.grantType === 'ancillary_admin_with_will';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Form P19 - Estate Grant</title>
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
      font-size: 14pt;
      margin-bottom: 6pt;
      text-transform: uppercase;
    }
    
    .probate-title {
      text-align: center;
      font-weight: bold;
      font-size: 18pt;
      margin: 24pt 0;
      text-transform: uppercase;
      letter-spacing: 3pt;
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
    
    .grant-text {
      margin: 24pt 0;
      text-align: justify;
      line-height: 1.5;
    }
    
    .seal-area {
      margin-top: 48pt;
      text-align: center;
    }
    
    .seal-text {
      border: 2px solid #000;
      border-radius: 50%;
      width: 150pt;
      height: 150pt;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      font-size: 10pt;
    }
    
    .signature-block {
      margin-top: 48pt;
    }
    
    table {
      width: 100%;
      border-collapse: collapse;
    }
    
    td {
      vertical-align: top;
      padding: 3pt 0;
    }
    
    .header-info {
      margin-bottom: 24pt;
    }
    
    .header-row {
      margin-bottom: 6pt;
    }
  </style>
</head>
<body>

<!-- Form Header -->
<div class="form-title">Form P19 (Rule 25-3 (4))</div>
<div class="probate-title">IN PROBATE</div>
<div class="form-subtitle">${grantTypeText}</div>
<div class="rule-note">[Rule 22-3 of the Supreme Court Civil Rules applies to all forms.]</div>

<!-- Header Information -->
<div class="header-info">
  <div class="header-row">
    <strong>Registry:</strong> <span class="field-value">${data.registry}</span>
  </div>
  <div class="header-row">
    <strong>No.:</strong> <span class="field-line">${data.fileNumber || underline(20)}</span>
  </div>
</div>

<!-- Grant Text -->
<div class="grant-text">
  <strong>BE IT KNOWN THAT</strong> <span class="field-value">${applicantNames}</span> 
  ${data.applicants.length > 1 ? 'have' : 'has'} applied to the Supreme Court of British Columbia
  for ${grantTypeText.toLowerCase()} in relation to the estate of 
  <span class="field-value">${formatFullNameCaps(data.deceased)}</span>,
  deceased, who died on <span class="field-value">${data.deceased?.dateOfDeath || ''}</span>.
</div>

${hasWill && data.will ? `
<div class="paragraph">
  <strong>AND THAT</strong> the will of the deceased dated <span class="field-value">${data.will.date}</span>
  ${data.will.hasCodicils ? 'and codicil(s) thereto' : ''} 
  has been proved and registered in the court.
</div>
` : ''}

<div class="grant-text">
  <strong>NOW THEREFORE</strong> ${data.applicants.length > 1 ? 'the said applicants are' : 'the said applicant is'}
  granted ${data.applicants.length > 1 ? 'letters' : 'letters'} of ${grantTypeText.toLowerCase()}
  in the said estate and ${data.applicants.length > 1 ? 'are' : 'is'} authorized to administer 
  ${data.applicants.length > 1 ? 'their' : 'the'} duties as ${data.applicants.length > 1 ? 'personal representatives' : 'personal representative'}
  according to law.
</div>

<!-- Seal Area -->
<div class="seal-area">
  <div class="seal-text">
    SEAL OF THE<br>
    SUPREME COURT<br>
    OF BRITISH COLUMBIA
  </div>
</div>

<!-- Date and Signature Block -->
<table style="margin-top: 48pt; width: 100%;">
  <tr>
    <td style="width: 50%; vertical-align: bottom;">
      <div>Date issued: <span class="field-line">${data.issueDate}</span></div>
    </td>
    <td style="width: 50%; text-align: right;">
      <div style="margin-top: 36pt; border-top: 1px solid #000; padding-top: 3pt; display: inline-block; min-width: 200pt; text-align: center;">
        Registrar
      </div>
    </td>
  </tr>
</table>

</body>
</html>`;
}
