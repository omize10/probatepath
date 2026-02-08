/**
 * Test all 46 BC Probate Forms
 */

import {
  generateP1, generateP2, generateP3, generateP4, generateP5,
  generateP6, generateP7, generateP8, generateP9, generateP10,
  generateP11, generateP12, generateP13, generateP14, generateP15,
  generateP16, generateP17, generateP18, generateP19, generateP20,
  generateP20_1, generateP21, generateP22, generateP23, generateP24,
  generateP25, generateP26, generateP27, generateP28, generateP29,
  generateP30, generateP31, generateP32, generateP33, generateP34,
  generateP35, generateP36, generateP37, generateP38, generateP39,
  generateP40, generateP41, generateP42, generateP43, generateP44,
  generateP45, generateP46,
  EstateData
} from '../probatepath/lib/forms-new';

import * as fs from 'fs';
import * as path from 'path';

// Test data
const testData: EstateData = {
  registry: 'Vancouver',
  fileNumber: 'V-12345',
  deceased: {
    firstName: 'John',
    middleName: 'Robert',
    lastName: 'Smith',
    aliases: ['Johnny Smith'],
    dateOfDeath: '15/JAN/2024',
    lastAddress: {
      streetNumber: '1234',
      streetName: 'Main Street',
      city: 'Vancouver',
      province: 'British Columbia',
      country: 'Canada',
      postalCode: 'V6A 1A1',
    },
    domiciledInBC: true,
    nisgaaCitizen: false,
  },
  grantType: 'probate',
  will: {
    exists: true,
    date: '10/MAR/2019',
    isElectronic: false,
    originalAvailable: true,
    hasCodicils: false,
    hasHandwrittenChanges: false,
    hasOrdersAffecting: false,
    refersToDocuments: false,
  },
  applicants: [{
    firstName: 'Mary',
    middleName: 'Jane',
    lastName: 'Smith',
    address: {
      streetNumber: '567',
      streetName: 'Broadway',
      city: 'Vancouver',
      province: 'British Columbia',
      country: 'Canada',
      postalCode: 'V5N 1B1',
    },
    isIndividual: true,
    namedInWill: true,
    relationship: 'spouse',
  }],
  otherExecutors: [],
  executorsWithReservedRights: [],
  addressForService: {
    street: '567 Broadway, Vancouver, BC V5N 1B1',
    email: 'mary.smith@email.com',
    phone: '604-555-1234',
  },
  affidavit: {
    form: 'P3',
    isJoint: false,
    hasP8Affidavits: false,
  },
  affidavitsOfDelivery: [{ name: 'Robert Johnson', dateSworn: '01/FEB/2024' }],
  noDeliveryRequired: false,
  allDocumentsInEnglish: true,
  additionalDocuments: [],
  certifiedCopies: {
    estateGrant: 2,
    authToObtainInfo: 0,
    affidavitDomiciled: 0,
    affidavitNonDomiciled: 0,
  },
  submittingAffidavitOfAssets: true,
  spouse: { status: 'deceased', name: 'Mary Jane Smith' },
  children: [
    { name: 'David Smith', status: 'surviving' },
    { name: 'Sarah Smith', status: 'surviving' },
  ],
  beneficiaries: [{ name: 'Robert Johnson', relationship: 'nephew', status: 'surviving' }],
  intestateSuccessors: [],
  creditors: [],
  citors: [],
  attorneyGeneralNotice: false,
  submissionDate: '01/FEB/2024',
  assets: {
    realPropertyBC: [{ description: '1234 Main Street, Vancouver, BC', value: 850000 }],
    tangiblePersonalPropertyBC: [{ description: '2018 Honda Accord', value: 25000 }],
    intangibleProperty: [{ description: 'Bank account at RBC', value: 45000 }],
  },
  deliveries: [
    { recipientName: 'David Smith', deliveryMethod: 'mail', deliveryDate: '20/JAN/2024' },
    { recipientName: 'Sarah Smith', deliveryMethod: 'mail', deliveryDate: '20/JAN/2024' },
  ],
};

const forms = [
  { name: 'P1', gen: (d: any) => generateP1(d) },
  { name: 'P2', gen: (d: any) => generateP2(d) },
  { name: 'P3', gen: (d: any) => generateP3({ ...d, applicantIndex: 0 }) },
  { name: 'P4', gen: (d: any) => generateP4({ ...d, applicantIndex: 0 }) },
  { name: 'P5', gen: (d: any) => generateP5({ ...d, applicantIndex: 0 }) },
  { name: 'P6', gen: (d: any) => generateP6({ ...d, applicantIndex: 0 }) },
  { name: 'P7', gen: (d: any) => generateP7({ ...d, applicantIndex: 0 }) },
  { name: 'P8', gen: (d: any) => generateP8({ ...d, applicantIndex: 0 }) },
  { name: 'P9', gen: (d: any) => generateP9({ ...d, applicantIndex: 0, affidavitNumber: 2 }) },
  { name: 'P10', gen: (d: any) => generateP10({ ...d, applicantIndex: 0, affidavitNumber: 3 }) },
  { name: 'P11', gen: (d: any) => generateP11({ ...d, applicantIndex: 0, affidavitNumber: 3 }) },
  { name: 'P12', gen: (d: any) => generateP12(d) },
  { name: 'P13', gen: (d: any) => generateP13(d) },
  { name: 'P14', gen: (d: any) => generateP14({ ...d, applicantIndex: 0, affidavitNumber: 4 }) },
  { name: 'P15', gen: (d: any) => generateP15({ ...d, applicantIndex: 0, affidavitNumber: 4 }) },
  { name: 'P16', gen: (d: any) => generateP16(d) },
  { name: 'P17', gen: (d: any) => generateP17(d) },
  { name: 'P18', gen: (d: any) => generateP18(d) },
  { name: 'P19', gen: (d: any) => generateP19(d) },
  { name: 'P20', gen: (d: any) => generateP20(d) },
  { name: 'P20.1', gen: (d: any) => generateP20_1(d) },
  { name: 'P21', gen: (d: any) => generateP21(d) },
  { name: 'P22', gen: (d: any) => generateP22({ ...d, applicantIndex: 0 }) },
  { name: 'P23', gen: (d: any) => generateP23({ ...d, applicantIndex: 0 }) },
  { name: 'P24', gen: (d: any) => generateP24(d) },
  { name: 'P25', gen: (d: any) => generateP25({ ...d, applicantIndex: 0, affidavitNumber: 3 }) },
  { name: 'P26', gen: (d: any) => generateP26({ ...d, applicantIndex: 0, affidavitNumber: 4 }) },
  { name: 'P27', gen: (d: any) => generateP27(d) },
  { name: 'P28', gen: (d: any) => generateP28(d) },
  { name: 'P29', gen: (d: any) => generateP29(d) },
  { name: 'P30', gen: (d: any) => generateP30(d) },
  { name: 'P31', gen: (d: any) => generateP31(d) },
  { name: 'P32', gen: (d: any) => generateP32(d) },
  { name: 'P33', gen: (d: any) => generateP33(d) },
  { name: 'P34', gen: (d: any) => generateP34(d) },
  { name: 'P35', gen: (d: any) => generateP35(d) },
  { name: 'P36', gen: (d: any) => generateP36(d) },
  { name: 'P37', gen: (d: any) => generateP37(d) },
  { name: 'P38', gen: (d: any) => generateP38({ ...d, applicantIndex: 0 }) },
  { name: 'P39', gen: (d: any) => generateP39(d) },
  { name: 'P40', gen: (d: any) => generateP40({ ...d, applicantIndex: 0 }) },
  { name: 'P41', gen: (d: any) => generateP41(d) },
  { name: 'P42', gen: (d: any) => generateP42(d) },
  { name: 'P43', gen: (d: any) => generateP43({ ...d, applicantIndex: 0 }) },
  { name: 'P44', gen: (d: any) => generateP44(d) },
  { name: 'P45', gen: (d: any) => generateP45({ ...d, applicantIndex: 0 }) },
  { name: 'P46', gen: (d: any) => generateP46(d) },
];

async function runTests() {
  console.log('='.repeat(80));
  console.log('TESTING ALL 46 BC PROBATE FORMS');
  console.log('='.repeat(80));
  console.log();

  const results: { form: string; success: boolean; error?: string; size?: string; duration: number }[] = [];

  for (const form of forms) {
    const start = Date.now();
    try {
      process.stdout.write(`Testing ${form.name}... `);
      const pdf = await form.gen(testData);
      const duration = Date.now() - start;
      const size = (pdf.length / 1024).toFixed(1);
      
      // Save PDF
      const pdfPath = path.join(__dirname, `output-${form.name}.pdf`);
      fs.writeFileSync(pdfPath, pdf);
      
      console.log(`✓ (${size} KB) ${duration}ms`);
      results.push({ form: form.name, success: true, size: `${size} KB`, duration });
    } catch (error) {
      const duration = Date.now() - start;
      console.log(`✗ FAILED: ${error}`);
      results.push({ form: form.name, success: false, error: String(error), duration });
    }
  }

  console.log();
  console.log('='.repeat(80));
  console.log('SUMMARY');
  console.log('='.repeat(80));

  const passed = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;

  for (const r of results) {
    const status = r.success ? '✓' : '✗';
    const size = r.size || 'N/A';
    console.log(`${status} ${r.form.padEnd(6)} ${size.padEnd(10)} ${r.duration}ms`);
  }

  console.log();
  console.log(`Total: ${results.length} | Passed: ${passed} | Failed: ${failed}`);
  
  if (failed > 0) {
    console.log('\nFailed forms:');
    results.filter(r => !r.success).forEach(r => console.log(`  - ${r.form}: ${r.error}`));
    process.exit(1);
  }
}

runTests();
