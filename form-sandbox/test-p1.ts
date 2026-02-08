/**
 * Test script for Form P1 generation
 */

import { generateP1, generateP1Preview, EstateData } from '../probatepath/lib/forms-new';
import * as fs from 'fs';
import * as path from 'path';

// Sample test data
const testData: EstateData = {
  registry: 'Vancouver',
  fileNumber: 'V-12345',
  
  deceased: {
    firstName: 'John',
    middleName: 'Robert',
    lastName: 'Smith',
    aliases: ['Johnny Smith', 'J.R. Smith'],
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
    fax: '',
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
    name: 'Mary Jane Smith (deceased)',
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
};

async function testP1() {
  console.log('Testing Form P1 generation...\n');
  
  try {
    // Generate HTML preview
    console.log('1. Generating HTML preview...');
    const html = generateP1Preview(testData);
    const htmlPath = path.join(__dirname, 'p1-test.html');
    fs.writeFileSync(htmlPath, html);
    console.log(`   HTML saved to: ${htmlPath}\n`);
    
    // Generate PDF
    console.log('2. Generating PDF...');
    const pdf = await generateP1(testData);
    const pdfPath = path.join(__dirname, 'p1-test.pdf');
    fs.writeFileSync(pdfPath, pdf);
    console.log(`   PDF saved to: ${pdfPath}`);
    console.log(`   PDF size: ${(pdf.length / 1024).toFixed(2)} KB\n`);
    
    console.log('✅ P1 generation test completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

testP1();
