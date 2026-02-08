/**
 * Form P4 - Affidavit of Applicant for Grant of Probate or Grant of Administration with Will Annexed (Long Form)
 * Template matches BC Supreme Court Civil Rules exactly
 * Used when short form (P3) cannot be used - e.g., when there are issues with will execution
 */

import { P4Data } from '../types';
import {
  formatFullName,
  formatFullNameCaps,
  formatAddress,
  checkbox,
  underline,
  getOrdinal,
} from '../utils/formatters';

export function generateP4HTML(data: P4Data): string {
  const applicant = data.applicants?.[data.applicantIndex] || { firstName: '', lastName: '', address: { city: '', province: '' } };
  const applicantName = formatFullName(applicant);
  const isProbate = data.grantType === 'probate';
  const hasWillExecutionIssues = data.willExecutionIssues && 
    (data.willExecutionIssues.noAttestationClause ||
     data.willExecutionIssues.insufficientAttestationClause ||
     data.willExecutionIssues.subscribingWitnessUnavailable ||
     data.willExecutionIssues.willMakerWasBlind ||
     data.willExecutionIssues.willMakerWasIlliterate ||
     data.willExecutionIssues.willMakerDidNotUnderstandLanguage ||
     data.willExecutionIssues.willMakerSignedByMark ||
     data.willExecutionIssues.willMakerDirectedAnotherToSign);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Form P4 - Affidavit of Applicant for Grant of Probate (Long Form)</title>
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
  <div class="form-number">Form P4 (Rule 25-3 (2))</div>
</div>

<div class="affidavit-header">
  <div class="affidavit-number">This is the <span class="field-line">${getOrdinal(data.affidavitNumber || 1)}</span> affidavit of <span class="field-line">${applicantName}</span> in this case and was made on <span class="field-line">${data.submissionDate}</span></div>
</div>

<div class="style-of-proceeding">[Style of Proceeding]</div>

<div class="form-title">Affidavit of Applicant for Grant of Probate or Grant of Administration with Will Annexed (Long Form)</div>
<div class="rule-note">[Rule 22-3 of the Supreme Court Civil Rules applies to all forms.]</div>

<!-- Affiant Statement -->
<div class="affiant-block">
  I, <span class="field-line">${applicantName}</span>, of <span class="field-line">${formatAddress(applicant.address)}</span>, <span class="field-line">${applicant.isIndividual ? 'occupation' : applicant.organizationTitle || 'occupation'}</span>, SWEAR (OR AFFIRM) THAT:
</div>

<!-- Paragraph 1 -->
<div class="paragraph">
  1 I am the applicant/one of the applicants referred to in the submission for estate grant in relation to the estate of <span class="field-line">${formatFullNameCaps(data.deceased)}</span> (the "deceased") and in relation to the document that is identified in section 4 of Part 3 of the submission for estate grant as the will (the "will"), and am applying for:
</div>

<div class="instruction">[Check whichever one of the immediately following 2 boxes is correct.]</div>

<div class="checkbox-item">
  <span class="checkbox">${checkbox(isProbate)}</span>
  <span>a grant of probate.</span>
</div>

<div class="checkbox-item">
  <span class="checkbox">${checkbox(!isProbate)}</span>
  <span>a grant of administration with will annexed.</span>
</div>

<!-- Paragraph 2 -->
<div class="paragraph">
  2 <span class="instruction">[Check whichever one of the immediately following 2 boxes is correct and provide any required information.]</span>
</div>

<div class="checkbox-item">
  <span class="checkbox">${checkbox(!applicant.isIndividual)}</span>
  <span>The applicant on whose behalf this affidavit is sworn is not an individual and I am authorized by the applicant to swear this affidavit on the applicant's behalf.</span>
</div>

<div class="checkbox-item">
  <span class="checkbox">${checkbox(applicant.isIndividual)}</span>
  <span>I am an individual and ordinarily live at the following location:</span>
</div>

<div class="sub-paragraph">City/town: <span class="field-line">${applicant.isIndividual ? applicant.address.city : underline(20)}</span></div>
<div class="sub-paragraph">Province/state: <span class="field-line">${applicant.isIndividual ? applicant.address.province : underline(20)}</span></div>
<div class="sub-paragraph">Country: <span class="field-line">${applicant.isIndividual ? applicant.address.country : underline(20)}</span></div>

<!-- Paragraph 3 -->
<div class="paragraph">
  <span class="instruction">[Check the box for whichever one of the immediately following section 3's is correct and provide any required information.]</span>
</div>

<div class="checkbox-item">
  <span class="checkbox">${checkbox(applicant.namedInWill)}</span>
  <span>I am named as an executor or alternate executor as <span class="field-line">${applicant.nameInWill || applicantName}</span> in the will and my appointment has not been revoked under section 56 (2) of the <em>Wills, Estates and Succession Act</em> or by a codicil to the will.</span>
</div>

${applicant.namedInWill ? `
<div class="instruction">[If you checked the immediately preceding box, check whichever one of the immediately following 3 boxes is correct and complete any required information.]</div>

<div class="checkbox-item">
  <span class="checkbox">${checkbox(!data.otherExecutors || data.otherExecutors.length === 0)}</span>
  <span>No other persons are named in the will as executor.</span>
</div>

<div class="checkbox-item">
  <span class="checkbox">${checkbox(false)}</span>
  <span>No other persons are named in the will as executor who are not parties to this application.</span>
</div>

<div class="checkbox-item">
  <span class="checkbox">${checkbox(data.otherExecutors && data.otherExecutors.length > 0)}</span>
  <span>Other persons are named in the will as executor and, of those, the following person(s) is/are not named as an applicant on the submission for estate grant for the reason shown after his/her/their name(s):</span>
</div>

<div class="instruction">[Complete the following for each named person.]</div>

${data.otherExecutors ? data.otherExecutors.map(exe => `
<div class="sub-paragraph">
  <span class="field-line">${exe.name}</span> is not named as an applicant on the submission for estate grant because he/she
  <div class="checkbox-item">
    <span class="checkbox">${checkbox(exe.reason === 'renounced')}</span>
    <span>has renounced executorship</span>
  </div>
  <div class="checkbox-item">
    <span class="checkbox">${checkbox(exe.reason === 'deceased')}</span>
    <span>is deceased</span>
  </div>
  <div class="checkbox-item">
    <span class="checkbox">${checkbox(exe.reason === 'other')}</span>
    <span>other <span class="field-line">${exe.otherReason || ''}</span></span>
  </div>
</div>
`).join('') : ''}
` : ''}

<div class="checkbox-item">
  <span class="checkbox">${checkbox(!applicant.namedInWill && !!applicant.wesaParagraph)}</span>
  <span>I am not named as an executor or alternate executor in the will, and am a person referred to in paragraph <span class="field-line">${applicant.wesaParagraph || ''}</span> of section 131 of the <em>Wills, Estates and Succession Act</em>.</span>
</div>

<div class="checkbox-item">
  <span class="checkbox">${checkbox(false)}</span>
  <span>I am an attorney of a foreign personal representative and am making application under section 139 of the <em>Wills, Estates and Succession Act</em>.</span>
</div>

<!-- Paragraph 4 -->
<div class="paragraph">
  4 <span class="instruction">[Check whichever one of the immediately following 2 boxes is correct.]</span>
</div>

<div class="checkbox-item">
  <span class="checkbox">${checkbox(!data.publicGuardianDelivery)}</span>
  <span>I am not obliged under Rule 25-3 (11) to deliver a filed copy of this submission for estate grant to the Public Guardian and Trustee.</span>
</div>

<div class="checkbox-item">
  <span class="checkbox">${checkbox(!!data.publicGuardianDelivery)}</span>
  <span>I am obliged under Rule 25-3 (11) to deliver a filed copy of this submission for estate grant to the Public Guardian and Trustee.</span>
</div>

<!-- Paragraph 5 -->
<div class="paragraph">
  5 I am satisfied that a diligent search for a testamentary document of the deceased has been made in each place that could reasonably be considered to be a place where a testamentary document may be found, including, without limitation, in all places, both physical and electronic, where the deceased usually kept the deceased's important documents and
</div>

<div class="instruction">[Check whichever one of the immediately following 2 boxes is correct and provide any required information.]</div>

<div class="checkbox-item">
  <span class="checkbox">${checkbox(true)}</span>
  <span>no testamentary document of the deceased dated later than the will has been found.</span>
</div>

<div class="checkbox-item">
  <span class="checkbox">${checkbox(false)}</span>
  <span>one or more testamentary documents dated later than the will have been found. A copy of the testamentary document(s) is attached as an exhibit to the affidavit. I believe that the later testamentary document(s) is/are invalid or otherwise not relevant to this application for the following reasons: <span class="field-line">${underline(40)}</span></span>
</div>

<!-- Paragraph 6 -->
<div class="paragraph">
  6 <span class="instruction">[Check whichever one of the immediately following 2 boxes is correct.]</span>
</div>

<div class="checkbox-item">
  <span class="checkbox">${checkbox(!hasWillExecutionIssues)}</span>
  <span>I am not aware of there being any issues respecting execution of the will. [Go to section 7.]</span>
</div>

<div class="checkbox-item">
  <span class="checkbox">${checkbox(!!hasWillExecutionIssues)}</span>
  <span>I believe that the following issue(s) respecting execution apply(ies) to the will and I am not aware of there being any other issues respecting execution of the will:</span>
</div>

${hasWillExecutionIssues ? `
<div class="instruction">[If you checked the second of the immediately preceding 2 boxes, complete each of the following paragraphs (a) to (d) as required.]</div>

<div class="sub-paragraph">(a) Attestation Clause [the portion of the will that identifies the persons who signed the will as witnesses to the will-maker's signature]</div>

<div class="instruction">[Check whichever one of the immediately following 2 boxes is correct.]</div>

<div class="checkbox-item">
  <span class="checkbox">${checkbox(!data.willExecutionIssues?.noAttestationClause && !data.willExecutionIssues?.insufficientAttestationClause)}</span>
  <span>None of this paragraph (a) applies to the will.</span>
</div>

<div class="checkbox-item">
  <span class="checkbox">${checkbox(!!data.willExecutionIssues?.noAttestationClause || !!data.willExecutionIssues?.insufficientAttestationClause)}</span>
  <span>The will does not contain an attestation clause or contains an attestation clause that is not sufficient to show that the requirements of Division 1 of Part 4 of the <em>Wills, Estates and Succession Act</em> were met when the will was signed.</span>
</div>

<div class="instruction">[If you checked the second of the immediately preceding 2 boxes, check whichever one of the immediately following 5 boxes is correct and provide any required information.]</div>

<div class="checkbox-item">
  <span class="checkbox">${checkbox(!!data.willExecutionIssues?.subscribingWitnessUnavailable)}</span>
  <span>pursuant to Rule 25-3 (15), submitted for filing with the submission for estate grant is an affidavit of <span class="field-line">${underline(25)}</span>, a subscribing witness.</span>
</div>

<div class="checkbox-item">
  <span class="checkbox">${checkbox(!!data.willExecutionIssues?.willMakerWasBlind)}</span>
  <span>pursuant to Rule 25-3 (16) (a), the will-maker was blind.</span>
</div>

<div class="checkbox-item">
  <span class="checkbox">${checkbox(!!data.willExecutionIssues?.willMakerWasIlliterate)}</span>
  <span>pursuant to Rule 25-3 (16) (b), the will-maker was illiterate.</span>
</div>

<div class="checkbox-item">
  <span class="checkbox">${checkbox(!!data.willExecutionIssues?.willMakerDidNotUnderstandLanguage)}</span>
  <span>pursuant to Rule 25-3 (16) (c), the will-maker did not understand the language in which the will was written.</span>
</div>

<div class="checkbox-item">
  <span class="checkbox">${checkbox(false)}</span>
  <span>pursuant to Rule 25-3 (16) (d), <span class="field-line">${underline(30)}</span> [state other reason].</span>
</div>

<div class="sub-paragraph">(b) Signature by mark [a mark made in place of a signature, for example, an "X"]</div>

<div class="instruction">[Check whichever one of the immediately following 2 boxes is correct.]</div>

<div class="checkbox-item">
  <span class="checkbox">${checkbox(!data.willExecutionIssues?.willMakerSignedByMark)}</span>
  <span>None of this paragraph (b) applies to the will.</span>
</div>

<div class="checkbox-item">
  <span class="checkbox">${checkbox(!!data.willExecutionIssues?.willMakerSignedByMark)}</span>
  <span>The will-maker signed the will by mark and pursuant to Rule 25-3 (17), submitted for filing with the submission for estate grant is an affidavit of <span class="field-line">${underline(25)}</span> [name of witness], the witness who signed the will in the place where the will was signed by mark.</span>
</div>

<div class="sub-paragraph">(c) Signature at direction of will-maker</div>

<div class="instruction">[Check whichever one of the immediately following 2 boxes is correct.]</div>

<div class="checkbox-item">
  <span class="checkbox">${checkbox(!data.willExecutionIssues?.willMakerDirectedAnotherToSign)}</span>
  <span>None of this paragraph (c) applies to the will.</span>
</div>

<div class="checkbox-item">
  <span class="checkbox">${checkbox(!!data.willExecutionIssues?.willMakerDirectedAnotherToSign)}</span>
  <span>The will was signed at the direction of the will-maker in accordance with section 40 of the <em>Wills, Estates and Succession Act</em> and pursuant to Rule 25-3 (18), submitted for filing with the submission for estate grant is an affidavit of <span class="field-line">${underline(25)}</span> [name of witness], the witness who was present and witnessed the signing of the will.</span>
</div>

<div class="sub-paragraph">(d) Other issue respecting execution of the will</div>

<div class="instruction">[Check whichever one of the immediately following 2 boxes is correct.]</div>

<div class="checkbox-item">
  <span class="checkbox">${checkbox(true)}</span>
  <span>None of this paragraph (d) applies to the will.</span>
</div>

<div class="checkbox-item">
  <span class="checkbox">${checkbox(false)}</span>
  <span>The following issue respecting execution of the will applies: <span class="field-line">${underline(40)}</span></span>
</div>
` : ''}

<!-- Paragraph 7 -->
<div class="paragraph">
  7 I believe that the will is the last will of the deceased that deals with property in British Columbia.
</div>

<!-- Paragraph 8 -->
<div class="paragraph">
  8 <span class="instruction">[Check whichever one of the immediately following 3 boxes is correct and provide any required information.]</span>
</div>

<div class="checkbox-item">
  <span class="checkbox">${checkbox(true)}</span>
  <span>I am not aware of there being any application for a grant of probate or administration, or any grant of probate or administration, or equivalent, having been issued, in relation to the deceased, in British Columbia or in any other jurisdiction.</span>
</div>

<div class="checkbox-item">
  <span class="checkbox">${checkbox(false)}</span>
  <span>The following grant(s) of probate or administration, or equivalent, has/have been issued in relation to the deceased in British Columbia or in another jurisdiction: <span class="field-line">${underline(40)}</span>. I believe that that grant is/those grants are not relevant to this application for the following reasons: <span class="field-line">${underline(40)}</span></span>
</div>

<div class="checkbox-item">
  <span class="checkbox">${checkbox(false)}</span>
  <span>The following person(s) has/have also applied for a grant of probate or administration: <span class="field-line">${underline(30)}</span></span>
</div>

<!-- Paragraph 9 -->
<div class="paragraph">
  9 I have read the submission for estate grant and the other documents referred to in that document and I believe that the information contained in that submission for estate grant and those documents is correct and complete.
</div>

<!-- Paragraph 10 -->
<div class="paragraph">
  10 I will administer according to law all of the deceased's estate, I will prepare an accounting as to how the estate was administered and I acknowledge that, in doing this, I will be subject to the legal responsibility of a personal representative.
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
