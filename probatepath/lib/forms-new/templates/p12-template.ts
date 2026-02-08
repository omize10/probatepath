/**
 * Form P12 - Affidavit of Translator
 * Template matches BC Supreme Court Civil Rules exactly
 */

import { P12Data } from '../types';
import {
  formatFullName,
  formatAddress,
  underline,
  getOrdinal,
} from '../utils/formatters';

export function generateP12HTML(data: P12Data): string {
  const applicant = data.applicants?.[data.applicantIndex] || { firstName: '', lastName: '', address: { city: '', province: '' } };
  const applicantName = formatFullName(applicant);
  const translator = data.translator || { name: '', address: { city: '', province: '' }, occupation: '' };

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Form P12 - Affidavit of Translator</title>
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
      text-align: right;
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
  <div class="form-number">Form P12 (Rule 25-3 (2))</div>
</div>

<div class="affidavit-header">
  <div class="affidavit-number">This is the <span class="field-line">${getOrdinal(data.affidavitNumber)}</span> affidavit of <span class="field-line">${applicantName}</span> in this case<br>
  and was made on <span class="field-line">${data.submissionDate}</span></div>
</div>

<div class="style-of-proceeding">[Style of Proceeding]</div>

<div class="form-title">Affidavit of Translator</div>
<div class="rule-note">[Rule 22-3 of the Supreme Court Civil Rules applies to all forms.]</div>

<!-- Affiant Statement -->
<div class="affiant-block">
  I, <span class="field-line">${translator.name || formatFullName(translator as any)}</span>, of <span class="field-line">${formatAddress(translator.address)}</span>, <span class="field-line">${translator.occupation}</span>, SWEAR (OR AFFIRM) THAT:
</div>

<!-- Paragraph 1 -->
<div class="paragraph">
  1 I have a knowledge of the English and <span class="field-line">${data.translations?.[0]?.sourceLanguage || underline(20)}</span> languages and I am competent to translate from one to the other.
</div>

<!-- Paragraph 2 - Repeat for each translation -->
${data.translations?.map((translation, index) => `
<div class="paragraph">
  ${index + 2} Attached to this affidavit as Exhibit ${translation.exhibitLetter} is a <span class="field-line">${translation.documentDescription}</span> which document is written in the <span class="field-line">${translation.sourceLanguage}</span> language and attached to this affidavit as Exhibit ${String.fromCharCode(translation.exhibitLetter.charCodeAt(0) + 1)} is my translation of Exhibit ${translation.exhibitLetter} which, to the best of my ability, accurately translates Exhibit ${translation.exhibitLetter} into the English language.
</div>
`).join('') || `
<div class="paragraph">
  2 Attached to this affidavit as Exhibit A is a <span class="field-line">${underline(30)}</span> [identify document] which document is written in the <span class="field-line">${underline(20)}</span> language and attached to this affidavit as Exhibit B is my translation of Exhibit A which, to the best of my ability, accurately translates Exhibit A into the English language.
</div>
`}

<div class="instruction">[Repeat this section for each document for which a translation has been prepared by this deponent, providing new Exhibit letters as required.]</div>

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
