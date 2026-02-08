/**
 * Comprehensive test suite for all probate forms
 */

import {
  generateP1, generateP2, generateP3, generateP5, generateP9, generateP10,
  EstateData
} from '../probatepath/lib/forms-new';

import * as fs from 'fs';
import * as path from 'path';

// Comprehensive test data
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
  
  applicants: [
    {
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
    },
  ],
  
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
  
  affidavitsOfDelivery: [
    { name: 'Robert Johnson', dateSworn: '01/FEB/2024' },
  ],
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
  
  spouse: {
    status: 'deceased',
    name: 'Mary Jane Smith',
  },
  
  children: [
    { name: 'David Smith', status: 'surviving' },
    { name: 'Sarah Smith', status: 'surviving' },
  ],
  
  beneficiaries: [
    { name: 'Robert Johnson', relationship: 'nephew', status: 'surviving' },
  ],
  
  intestateSuccessors: [],
  creditors: [],
  citors: [],
  attorneyGeneralNotice: false,
  submissionDate: '01/FEB/2024',
  
  assets: {
    realPropertyBC: [
      {
        description: '1234 Main Street, Vancouver, BC',
        value: 850000,
      },
    ],
    tangiblePersonalPropertyBC: [
      {
        description: '2018 Honda Accord',
        value: 25000,
      },
    ],
    intangibleProperty: [
      {
        description: 'Bank account at RBC',
        value: 45000,
      },
    ],
  },
  
  deliveries: [
    {
      recipientName: 'David Smith',
      deliveryMethod: 'mail',
      deliveryDate: '20/JAN/2024',
    },
    {
      recipientName: 'Sarah Smith',
      deliveryMethod: 'mail',
      deliveryDate: '20/JAN/2024',
    },
  ],
};

interface TestResult {
  form: string;
  success: boolean;
  pdfPath?: string;
  size?: string;
  error?: string;
  duration: number;
}

async function testForm(
  formName: string,
  generator: (data: EstateData) => Promise<Buffer>,
  data: EstateData
): Promise<TestResult> {
  const start = Date.now();
  try {
    console.log(`  Testing ${formName}...`);
    const pdf = await generator(data);
    const duration = Date.now() - start;
    
    const pdfPath = path.join(__dirname, `${formName.toLowerCase()}-test.pdf`);
    fs.writeFileSync(pdfPath, pdf);
    
    const size = (pdf.length / 1024).toFixed(2);
    console.log(`    ✓ Generated (${size} KB) in ${duration}ms`);
    
    return {
      form: formName,
      success: true,
      pdfPath,
      size: `${size} KB`,
      duration,
    };
  } catch (error) {
    const duration = Date.now() - start;
    console.error(`    ✗ Failed: ${error}`);
    return {
      form: formName,
      success: false,
      error: String(error),
      duration,
    };
  }
}

async function runAllTests() {
  console.log('='.repeat(80));
  console.log('BC PROBATE FORMS - COMPREHENSIVE TEST SUITE');
  console.log('='.repeat(80));
  console.log();
  
  const results: TestResult[] = [];
  
  // Test P1
  results.push(await testForm('P1', generateP1, testData));
  
  // Test P2
  results.push(await testForm('P2', generateP2, testData));
  
  // Test P3
  results.push(await testForm('P3', generateP3, {
    ...testData,
    applicantIndex: 0,
  } as any));
  
  // Test P5 (intestate)
  const intestateData: EstateData = {
    ...testData,
    grantType: 'admin_without_will',
    will: undefined,
    spouse: { status: 'surviving', survivingName: 'Mary Smith' },
  };
  results.push(await testForm('P5', generateP5, {
    ...intestateData,
    applicantIndex: 0,
  } as any));
  
  // Test P9
  results.push(await testForm('P9', generateP9, {
    ...testData,
    applicantIndex: 0,
    affidavitNumber: 2,
  } as any));
  
  // Test P10
  results.push(await testForm('P10', generateP10, {
    ...testData,
    applicantIndex: 0,
    affidavitNumber: 3,
  } as any));
  
  // Summary
  console.log();
  console.log('='.repeat(80));
  console.log('TEST SUMMARY');
  console.log('='.repeat(80));
  
  const passed = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  
  for (const result of results) {
    const status = result.success ? '✓ PASS' : '✗ FAIL';
    const size = result.size ? `(${result.size})` : '';
    console.log(`${status} ${result.form.padEnd(4)} ${size.padEnd(12)} ${result.duration}ms`);
    if (result.error) {
      console.log(`       Error: ${result.error}`);
    }
  }
  
  console.log();
  console.log(`Total: ${results.length} | Passed: ${passed} | Failed: ${failed}`);
  
  if (failed > 0) {
    process.exit(1);
  }
}

runAllTests();
