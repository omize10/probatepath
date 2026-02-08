/**
 * Form P14 - Supplemental Affidavit of Assets and Liabilities for Domiciled Estate Grant
 * Template matches BC Supreme Court Civil Rules exactly
 */

import { P14Data } from '../types';
import {
  formatFullName,
  formatFullNameCaps,
  formatAddress,
  formatCurrency,
  underline,
  getOrdinal,
} from '../utils/formatters';

export function generateP14HTML(data: P14Data): string {
  const applicant = data.applicants[data.applicantIndex];
  const applicantName = formatFullName(applicant);
  
  // Determine grant type text
  const grantTypeMap: Record<string, string> = {
    'probate': 'a grant of probate',
    'admin_with_will': 'a grant of administration with will annexed',
    'admin_without_will': 'a grant of administration without will annexed',
    'ancillary_probate': 'an ancillary grant of probate',
    'ancillary_admin_with_will': 'an ancillary grant of administration with will annexed',
    'ancillary_admin_without_will': 'an ancillary grant of administration without will annexed',
  };
  const grantTypeText = grantTypeMap[data.grantType] || 'a grant of probate';
  
  // Calculate totals
  const realPropertyBCTotal = data.assets?.realPropertyBC?.reduce((sum, item) => {
    const value = item.value || 0;
    const debt = item.securedDebt?.amount || 0;
    return sum + (value - debt);
  }, 0) || 0;
  
  const tangiblePropertyBCTotal = data.assets?.tangiblePersonalPropertyBC?.reduce((sum, item) => {
    const value = item.value || 0;
    const debt = item.securedDebt?.amount || 0;
    return sum + (value - debt);
  }, 0) || 0;
  
  const intangiblePropertyTotal = data.assets?.intangibleProperty?.reduce((sum, item) => {
    const value = item.value || 0;
    const debt = item.securedDebt?.amount || 0;
    return sum + (value - debt);
  }, 0) || 0;
  
  const grossValueBC = realPropertyBCTotal + tangiblePropertyBCTotal + intangiblePropertyTotal;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Form P14 - Supplemental Affidavit of Assets and Liabilities for Domiciled Estate Grant</title>
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
    
    .exhibit-section {
      margin-top: 36pt;
      page-break-before: always;
    }
    
    .exhibit-header {
      margin-bottom: 18pt;
    }
    
    .exhibit-mark {
      font-weight: bold;
      margin-bottom: 12pt;
    }
    
    .statement-title {
      font-weight: bold;
      text-align: center;
      margin-bottom: 18pt;
      text-transform: uppercase;
    }
    
    .asset-table {
      width: 100%;
      border-collapse: collapse;
      margin: 12pt 0;
    }
    
    .asset-table th,
    .asset-table td {
      border: 1px solid #000;
      padding: 6pt;
      text-align: left;
      vertical-align: top;
    }
    
    .asset-table th {
      background-color: #f5f5f5;
      font-weight: bold;
    }
    
    .asset-table .value-col {
      text-align: right;
      width: 150pt;
    }
    
    .total-row {
      font-weight: bold;
      background-color: #f5f5f5;
    }
    
    .example-text {
      font-size: 9pt;
      font-style: italic;
      margin: 6pt 0;
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
  <div class="form-number">Form P14 (Rule 25-3 (9))</div>
</div>

<div class="affidavit-header">
  <div class="affidavit-number">This is the <span class="field-line">${getOrdinal(data.affidavitNumber)}</span> affidavit of <span class="field-line">${applicantName}</span> in this case<br>
  and was made on <span class="field-line">${data.submissionDate}</span></div>
</div>

<div class="style-of-proceeding">[Style of Proceeding]</div>

<div class="form-title">Supplemental Affidavit of Assets and Liabilities for Domiciled Estate Grant</div>
<div class="rule-note">[Rule 22-3 of the Supreme Court Civil Rules applies to all forms.]</div>

<!-- Affiant Statement -->
<div class="affiant-block">
  I, <span class="field-line">${applicantName}</span>, of <span class="field-line">${formatAddress(applicant.address)}</span>, <span class="field-line">${applicant.isIndividual ? 'occupation' : applicant.organizationTitle || 'occupation'}</span>, SWEAR (OR AFFIRM) THAT:
</div>

<!-- Paragraph 1 -->
<div class="paragraph">
  1 I am an applicant for <span class="field-line">${grantTypeText}</span> [Set out whichever one of the following 6 choices is correct: a grant of probate/a grant of administration with will annexed/a grant of administration without will annexed/an ancillary grant of probate/an ancillary grant of administration with will annexed/an ancillary grant of administration without will annexed] in relation to the estate of <span class="field-line">${formatFullNameCaps(data.deceased)}</span> (the "deceased").
</div>

<!-- Paragraph 2 -->
<div class="paragraph">
  2 An affidavit of assets and liabilities for estate grant has been filed in this proceeding.
</div>

<!-- Paragraph 3 -->
<div class="paragraph">
  3 Attached to this affidavit as Exhibit A is a Supplemental Statement of Assets, Liabilities and Distribution that discloses
</div>

<div class="sub-paragraph">(a) the real property and tangible personal property within British Columbia, and intangible personal property anywhere in the world, of the deceased that was not disclosed or was inaccurately disclosed in any earlier affidavit of assets and liabilities filed in this proceeding,</div>
<div class="sub-paragraph">(b) the value of that property, and</div>
<div class="sub-paragraph">(c) the liabilities that charge or encumber that property.</div>

<!-- Paragraph 4 -->
<div class="paragraph">
  4 If I determine that there is any property or liability that has not been disclosed in Exhibit A or in any previous affidavit of assets and liabilities in Form P10 or P14 filed in this proceeding or that information contained in this affidavit or in any of those previous affidavits is incorrect or incomplete, I will promptly after learning of the same file a supplemental affidavit of assets and liabilities for domiciled estate grant in Form P14 to disclose the correct and complete information.
</div>

<!-- Paragraph 5 -->
<div class="paragraph">
  5 In addition to the probate fees payable in relation to any property disclosed in Exhibit A, I promise to pay the Minister of Finance the probate fees payable with respect to the value of any property that passes to me as the deceased's personal representative, and that is not disclosed in Exhibit A, on a determination being made as to the value of that asset.
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

<!-- EXHIBIT A -->
<div class="exhibit-section">
  <div class="exhibit-mark">Exhibit A</div>
  
  <div class="exhibit-header">
    <table>
      <tr>
        <td style="border-left: 1px solid #000; padding-left: 12pt;">
          <div>This is Exhibit A referred to in the affidavit of</div>
          <div style="border-bottom: 1px solid #000; min-width: 200pt; margin: 6pt 0;">&nbsp;</div>
          <div>before me on <span style="border-bottom: 1px solid #000; min-width: 120pt; display: inline-block;">&nbsp;</span></div>
          <div style="margin-top: 24pt; border-bottom: 1px solid #000; min-width: 200pt;">&nbsp;</div>
          <div>A commissioner for taking affidavits for</div>
          <div>British Columbia</div>
        </td>
      </tr>
    </table>
  </div>
  
  <div class="statement-title">Supplemental Statement of Assets, Liabilities and Distribution</div>
  
  <div class="paragraph">
    Full legal name of the deceased: <span class="field-line" style="min-width: 300pt;">${formatFullNameCaps(data.deceased)}</span> [first name] [middle name(s)] [last name/family name]
  </div>
  
  <div class="paragraph">
    Other names in which the deceased held or may have held an interest in property:
  </div>
  <div class="instruction">[Include all names that have been listed in Form P2.]</div>
  <div class="sub-paragraph">1. ${data.deceased.aliases[0] || ''}</div>
  <div class="sub-paragraph">2. ${data.deceased.aliases[1] || ''}</div>
  <div class="sub-paragraph">3. ${data.deceased.aliases[2] || 'etc.'}</div>
  
  <!-- Part I - Real Property BC -->
  <div style="margin-top: 18pt; font-weight: bold;">Part I Real Property within British Columbia (including mortgages and vendors' and purchasers' interests in agreements for sale)</div>
  
  <table class="asset-table">
    <thead>
      <tr>
        <th>Description</th>
        <th class="value-col">Value at Death</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td colspan="2" class="example-text">
          List item details and then list secured debt details below those items. List only property that was not disclosed or was inaccurately disclosed in any earlier affidavit of assets and liabilities filed in this proceeding.
        </td>
      </tr>
      ${data.assets?.realPropertyBC?.map(property => `
      <tr>
        <td>
          ${property.address || property.description || ''}<br>
          ${property.owners ? `Registered owners: ${property.owners}` : ''}
          ${property.securedDebt ? `<br><em>Less: ${property.securedDebt.creditor}</em>` : ''}
        </td>
        <td class="value-col">
          ${formatCurrency(property.value || 0)}<br>
          ${property.securedDebt ? `- ${formatCurrency(property.securedDebt.amount)}` : ''}
        </td>
      </tr>
      `).join('') || ''}
      <tr class="total-row">
        <td>TOTAL REAL PROPERTY WITHIN BRITISH COLUMBIA</td>
        <td class="value-col">${formatCurrency(realPropertyBCTotal)}</td>
      </tr>
    </tbody>
  </table>
  
  <!-- Part II - Tangible Personal Property BC -->
  <div style="margin-top: 18pt; font-weight: bold;">Part II Tangible Personal Property within British Columbia (including vehicles, furniture and other physical items)</div>
  
  <table class="asset-table">
    <thead>
      <tr>
        <th>Description</th>
        <th class="value-col">Value at Death</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td colspan="2" class="example-text">List item details and then list secured debt details below those items</td>
      </tr>
      ${data.assets?.tangiblePersonalPropertyBC?.map(item => `
      <tr>
        <td>
          ${item.description}
          ${item.securedDebt ? `<br><em>Less: ${item.securedDebt.creditor}</em>` : ''}
        </td>
        <td class="value-col">
          ${formatCurrency(item.value || 0)}
          ${item.securedDebt ? `<br>- ${formatCurrency(item.securedDebt.amount)}` : ''}
        </td>
      </tr>
      `).join('') || ''}
      <tr class="total-row">
        <td>TOTAL TANGIBLE PERSONAL PROPERTY WITHIN BRITISH COLUMBIA</td>
        <td class="value-col">${formatCurrency(tangiblePropertyBCTotal)}</td>
      </tr>
    </tbody>
  </table>
  
  <!-- Part III - Intangible Personal Property -->
  <div style="margin-top: 18pt; font-weight: bold;">Part III Intangible Personal Property within British Columbia, and Intangible Personal Property outside British Columbia, that is not dealt with by a foreign grant (including bank accounts, intellectual property and other valuable items that cannot be touched by hand)</div>
  
  <table class="asset-table">
    <thead>
      <tr>
        <th>Description</th>
        <th class="value-col">Value at Death</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td colspan="2" class="example-text">List item details and then list secured debt details below those items</td>
      </tr>
      ${data.assets?.intangibleProperty?.map(item => `
      <tr>
        <td>
          ${item.description}
          ${item.securedDebt ? `<br><em>Less: ${item.securedDebt.creditor}</em>` : ''}
        </td>
        <td class="value-col">
          ${formatCurrency(item.value || 0)}
          ${item.securedDebt ? `<br>- ${formatCurrency(item.securedDebt.amount)}` : ''}
        </td>
      </tr>
      `).join('') || ''}
      <tr class="total-row">
        <td>TOTAL INTANGIBLE PERSONAL PROPERTY</td>
        <td class="value-col">${formatCurrency(intangiblePropertyTotal)}</td>
      </tr>
    </tbody>
  </table>
  
  <!-- Gross Value -->
  <table class="asset-table" style="margin-top: 18pt;">
    <tbody>
      <tr class="total-row">
        <td>GROSS VALUE OF ASSETS LESS SECURED DEBTS</td>
        <td class="value-col">${formatCurrency(grossValueBC)}</td>
      </tr>
    </tbody>
  </table>
</div>

</body>
</html>`;
}
