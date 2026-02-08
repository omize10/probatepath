/**
 * Form P18 - Authorization to Obtain Estate Information
 * Template matches BC Supreme Court Civil Rules exactly
 */

import { P18Data } from '../types';
import {
  formatFullName,
  formatFullNameCaps,
  formatBCDate,
  checkbox,
  underline,
} from '../utils/formatters';

export function generateP18HTML(data: P18Data): string {
  const applicantNames = data.applicants.map(formatFullName).join(', ');
  const grantText = data.grantType === 'probate' ? 'a grant of probate' :
    data.grantType === 'admin_with_will' ? 'a grant of administration with will annexed' :
    data.grantType === 'admin_without_will' ? 'a grant of administration without will annexed' :
    data.grantType === 'ancillary_probate' ? 'an ancillary grant of probate' :
    data.grantType === 'ancillary_admin_with_will' ? 'an ancillary grant of administration with will annexed' :
    data.grantType === 'ancillary_admin_without_will' ? 'an ancillary grant of administration without will annexed' :
    'an estate grant';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Form P18 - Authorization to Obtain Estate Information</title>
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
      font-size: 11pt;
      margin-bottom: 18pt;
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
    
    .authorization-text {
      margin: 18pt 0;
      text-align: justify;
    }
    
    .authorization-box {
      border: 2px solid #000;
      padding: 24pt;
      margin: 24pt 0;
      text-align: center;
    }
    
    .authorization-title {
      font-weight: bold;
      font-size: 14pt;
      text-transform: uppercase;
      margin-bottom: 12pt;
    }
    
    .warning-text {
      font-size: 9pt;
      font-style: italic;
      margin: 12pt 0;
      border: 1px solid #ccc;
      padding: 6pt;
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
<div class="form-title">Form P18 (Rule 25-4 (1) (a))</div>
<div class="form-subtitle">AUTHORIZATION TO OBTAIN ESTATE INFORMATION</div>
<div class="rule-note">[Rule 22-3 of the Supreme Court Civil Rules applies to all forms.]</div>

<!-- Authorization Box -->
<div class="authorization-box">
  <div class="authorization-title">AUTHORIZATION</div>
  
  <div style="text-align: left; margin-bottom: 12pt;">
    <strong>File No.:</strong> <span class="field-line">${data.fileNumber || underline(20)}</span>
  </div>
  
  <div style="text-align: left; margin-bottom: 12pt;">
    <strong>Registry:</strong> <span class="field-value">${data.registry}</span>
  </div>
  
  <div style="text-align: left; margin-bottom: 12pt;">
    This authorization is issued to: <span class="field-value">${applicantNames}</span>
  </div>
  
  <div style="text-align: left; margin-bottom: 12pt;">
    in relation to the estate of: <span class="field-value">${formatFullNameCaps(data.deceased)}</span>
  </div>
  
  <div style="text-align: left; margin-bottom: 12pt;">
    who died on: <span class="field-value">${data.deceased?.dateOfDeath || ''}</span>
  </div>
  
  <div style="text-align: left;">
    This authorization entitles the bearer to obtain financial information in relation to the application for ${grantText}.
  </div>
</div>

<!-- Purpose Statement -->
<div class="paragraph">
  This authorization is issued for the purpose of enabling the applicant(s) to obtain estate information
  necessary to complete an affidavit of assets and liabilities for estate grant.
</div>

<div class="paragraph">
  This authorization does not constitute a grant of probate, a grant of administration or any other estate grant.
  This authorization may be revoked by the court at any time.
</div>

<!-- Warning -->
<div class="warning-text">
  <strong>IMPORTANT:</strong> Financial institutions and other persons who provide information pursuant to this
  authorization are protected from liability in respect of the disclosure of that information.
</div>

<!-- Date Block -->
<table style="margin-top: 36pt; width: 100%;">
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
