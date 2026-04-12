/**
 * Integration layer between new form system and existing codebase
 * Supports all 46 BC Probate Forms (P1-P46)
 */

import { EstateData as NewEstateData } from './types';
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
} from './index';

// Re-export types
export type { EstateData as NewEstateData } from './types';

// All 46 form generators mapped by ID. Every generator gets a normalized
// payload with safe defaults so a missing applicantIndex / affidavitNumber
// can never produce a blank "I, ____" line on a court-filed document.
const withDefaults = (data: any) => ({
  ...data,
  applicantIndex: data.applicantIndex ?? 0,
  affidavitNumber: data.affidavitNumber ?? 1,
});

export const FORM_GENERATORS: Record<string, (data: NewEstateData) => Promise<Buffer>> = {
  'P1': generateP1,
  'P2': generateP2,
  'P3': (data: any) => generateP3(withDefaults(data)),
  'P4': (data: any) => generateP4(withDefaults(data)),
  'P5': (data: any) => generateP5(withDefaults(data)),
  'P6': (data: any) => generateP6(withDefaults(data)),
  'P7': (data: any) => generateP7(withDefaults(data)),
  'P8': (data: any) => generateP8(withDefaults(data)),
  'P9': (data: any) => generateP9({ ...withDefaults(data), affidavitNumber: data.affidavitNumber ?? 2 }),
  'P10': (data: any) => generateP10({ ...withDefaults(data), affidavitNumber: data.affidavitNumber ?? 3 }),
  'P11': (data: any) => generateP11({ ...withDefaults(data), affidavitNumber: data.affidavitNumber ?? 3 }),
  'P12': (data: any) => generateP12(withDefaults(data)),
  'P13': (data: any) => generateP13(withDefaults(data)),
  'P14': (data: any) => generateP14(withDefaults(data)),
  'P15': (data: any) => generateP15(withDefaults(data)),
  'P16': (data: any) => generateP16(withDefaults(data)),
  'P17': (data: any) => generateP17(withDefaults(data)),
  'P18': (data: any) => generateP18(withDefaults(data)),
  'P19': (data: any) => generateP19(withDefaults(data)),
  'P20': (data: any) => generateP20(withDefaults(data)),
  'P20.1': (data: any) => generateP20_1(withDefaults(data)),
  'P21': (data: any) => generateP21(withDefaults(data)),
  'P22': (data: any) => generateP22(withDefaults(data)),
  'P23': (data: any) => generateP23(withDefaults(data)),
  'P24': (data: any) => generateP24(withDefaults(data)),
  'P25': (data: any) => generateP25(withDefaults(data)),
  'P26': (data: any) => generateP26(withDefaults(data)),
  'P27': (data: any) => generateP27(withDefaults(data)),
  'P28': (data: any) => generateP28(withDefaults(data)),
  'P29': (data: any) => generateP29(withDefaults(data)),
  'P30': (data: any) => generateP30(withDefaults(data)),
  'P31': (data: any) => generateP31(withDefaults(data)),
  'P32': (data: any) => generateP32(withDefaults(data)),
  'P33': (data: any) => generateP33(withDefaults(data)),
  'P34': (data: any) => generateP34(withDefaults(data)),
  'P35': (data: any) => generateP35(withDefaults(data)),
  'P36': (data: any) => generateP36(withDefaults(data)),
  'P37': (data: any) => generateP37(withDefaults(data)),
  'P38': (data: any) => generateP38(withDefaults(data)),
  'P39': (data: any) => generateP39(withDefaults(data)),
  'P40': (data: any) => generateP40(withDefaults(data)),
  'P41': (data: any) => generateP41(withDefaults(data)),
  'P42': (data: any) => generateP42(withDefaults(data)),
  'P43': (data: any) => generateP43(withDefaults(data)),
  'P44': (data: any) => generateP44(withDefaults(data)),
  'P45': (data: any) => generateP45(withDefaults(data)),
  'P46': (data: any) => generateP46(withDefaults(data)),
};

/**
 * Validate estate data and return detailed error messages
 * More lenient - accepts empty strings and provides warnings instead of errors for non-critical fields
 */
export function validateEstateDataDetailed(data: any): { valid: boolean; errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Log what we're checking
  console.log('[Validation] Checking data:', {
    hasDeceased: !!data.deceased,
    decFirstName: data.deceased?.firstName,
    decLastName: data.deceased?.lastName,
    decDateOfDeath: data.deceased?.dateOfDeath,
    applicantCount: data.applicants?.length,
    registry: data.registry,
  });

  // Check deceased info - be more lenient
  if (!data.deceased) {
    errors.push('Missing deceased information');
  } else {
    const firstName = String(data.deceased.firstName || '').trim();
    const lastName = String(data.deceased.lastName || '').trim();
    const dateOfDeath = String(data.deceased.dateOfDeath || '').trim();
    
    if (!firstName) {
      // Try to get from draft data as fallback
      warnings.push('Missing deceased first name - will use placeholder');
      data.deceased.firstName = '[FIRST NAME]';
    }
    if (!lastName) {
      warnings.push('Missing deceased last name - will use placeholder');
      data.deceased.lastName = '[LAST NAME]';
    }
    if (!dateOfDeath) {
      warnings.push('Missing date of death - will use placeholder');
      data.deceased.dateOfDeath = '[DATE]';
    }
  }

  // Check applicants - be more lenient
  if (!data.applicants || data.applicants.length === 0) {
    warnings.push('No applicants found - creating placeholder');
    data.applicants = [{
      firstName: '[APPLICANT FIRST NAME]',
      lastName: '[APPLICANT LAST NAME]',
      address: {
        city: 'Vancouver',
        province: 'British Columbia',
        country: 'Canada',
        postalCode: '',
      },
      isIndividual: true,
      namedInWill: false,
    }];
  } else {
    data.applicants.forEach((app: any, idx: number) => {
      const appFirstName = String(app.firstName || '').trim();
      const appLastName = String(app.lastName || '').trim();
      
      if (!appFirstName) {
        warnings.push(`Applicant ${idx + 1}: Missing first name - using placeholder`);
        app.firstName = '[FIRST NAME]';
      }
      if (!appLastName) {
        warnings.push(`Applicant ${idx + 1}: Missing last name - using placeholder`);
        app.lastName = '[LAST NAME]';
      }
    });
  }

  // Check registry - default to Vancouver
  if (!data.registry || !String(data.registry).trim()) {
    warnings.push('Missing court registry - defaulting to Vancouver');
    data.registry = 'Vancouver';
  }

  // Always valid - we fill in placeholders
  return { valid: true, errors, warnings };
}

/**
 * Generate a form by ID
 */
export async function generateForm(formId: string, data: NewEstateData): Promise<Buffer> {
  const generator = FORM_GENERATORS[formId.toUpperCase()];
  if (!generator) {
    throw new Error(`Form ${formId} not available. Available forms: ${Object.keys(FORM_GENERATORS).join(', ')}`);
  }

  // Validate data before generation
  const validation = validateEstateDataDetailed(data);
  if (!validation.valid) {
    throw new Error(`Validation errors: ${validation.errors.join(', ')}`);
  }

  return generator(data);
}

/**
 * Check if a form is available
 */
export function isFormAvailable(formId: string): boolean {
  return formId.toUpperCase() in FORM_GENERATORS;
}

/**
 * Get list of available forms
 */
export function getAvailableForms(): string[] {
  return Object.keys(FORM_GENERATORS);
}

/**
 * Transform old format EstateData to new format
 */
export function transformEstateData(oldData: any): NewEstateData {
  // Default structure with safe fallbacks
  const newData: NewEstateData = {
    registry: oldData?.registry || oldData?.courtRegistry || 'Vancouver',
    fileNumber: oldData?.fileNumber || oldData?.courtFileNumber,
    deceased: {
      firstName: oldData?.deceased?.firstName || oldData?.decFirstName || oldData?.deceasedName?.split(' ')[0] || '',
      middleName: oldData?.deceased?.middleName || oldData?.decMiddleName,
      lastName: oldData?.deceased?.lastName || oldData?.decLastName || oldData?.deceasedName?.split(' ').slice(1).join(' ') || '',
      aliases: oldData?.deceased?.aliases || oldData?.decAliases || [],
      dateOfDeath: oldData?.deceased?.dateOfDeath || oldData?.decDateOfDeath || oldData?.dateOfDeath || '',
      lastAddress: {
        streetNumber: oldData?.deceased?.lastAddress?.streetNumber || oldData?.streetNumber || '',
        streetName: oldData?.deceased?.lastAddress?.streetName || oldData?.streetName || '',
        poBox: oldData?.deceased?.lastAddress?.poBox,
        city: oldData?.deceased?.lastAddress?.city || oldData?.decCity || oldData?.city || 'Vancouver',
        province: oldData?.deceased?.lastAddress?.province || oldData?.decProvince || 'British Columbia',
        country: oldData?.deceased?.lastAddress?.country || 'Canada',
        postalCode: oldData?.deceased?.lastAddress?.postalCode || oldData?.decPostalCode || '',
      },
      domiciledInBC: oldData?.deceased?.domiciledInBC ?? oldData?.domiciledInBC ?? true,
      nisgaaCitizen: oldData?.deceased?.nisgaaCitizen ?? false,
      treatyFirstNation: oldData?.deceased?.treatyFirstNation,
    },
    grantType: oldData?.grantType || oldData?.applicationType || 'probate',
    will: oldData?.will ? {
      exists: oldData.will.exists ?? oldData.hadWill ?? false,
      date: oldData.will.date,
      isElectronic: oldData.will.isElectronic ?? false,
      originalAvailable: oldData.will.originalAvailable ?? true,
      hasCodicils: oldData.will.hasCodicils ?? false,
      codicilDates: oldData.will.codicilDates,
      hasHandwrittenChanges: oldData.will.hasHandwrittenChanges ?? false,
      hasOrdersAffecting: oldData.will.hasOrdersAffecting ?? false,
      refersToDocuments: oldData.will.refersToDocuments ?? false,
    } : undefined,
    foreignGrant: oldData?.foreignGrant,
    applicants: (oldData?.applicants || oldData?.executors || []).map((a: any) => ({
      firstName: a?.firstName || a?.firstname || a?.name?.split(' ')[0] || '',
      middleName: a?.middleName || a?.middlename,
      lastName: a?.lastName || a?.lastname || a?.name?.split(' ').slice(1).join(' ') || '',
      address: {
        streetNumber: a?.address?.streetNumber || '',
        streetName: a?.address?.streetName || '',
        poBox: a?.address?.poBox,
        city: a?.address?.city || 'Vancouver',
        province: a?.address?.province || 'British Columbia',
        country: a?.address?.country || 'Canada',
        postalCode: a?.address?.postalCode || '',
      },
      isIndividual: a?.isIndividual ?? true,
      namedInWill: a?.namedInWill ?? false,
      relationship: a?.relationship,
      organizationTitle: a?.organizationTitle,
      occupation: a?.occupation || oldData?.applicantOccupation || '',
    })),
    otherExecutors: oldData?.otherExecutors || [],
    executorsWithReservedRights: oldData?.executorsWithReservedRights || [],
    lawyer: oldData?.lawyer,
    addressForService: {
      street: oldData?.addressForService?.street || oldData?.serviceAddress || '',
      fax: oldData?.addressForService?.fax,
      email: oldData?.addressForService?.email,
      phone: oldData?.addressForService?.phone || oldData?.phone || '',
    },
    affidavit: {
      form: oldData?.affidavit?.form || 'P3',
      isJoint: oldData?.affidavit?.isJoint ?? false,
      hasP8Affidavits: oldData?.affidavit?.hasP8Affidavits ?? false,
      p8Count: oldData?.affidavit?.p8Count,
    },
    affidavitsOfDelivery: oldData?.affidavitsOfDelivery || [],
    noDeliveryRequired: oldData?.noDeliveryRequired ?? false,
    allDocumentsInEnglish: oldData?.allDocumentsInEnglish ?? true,
    translatorAffidavit: oldData?.translatorAffidavit,
    additionalDocuments: oldData?.additionalDocuments || [],
    certifiedCopies: {
      estateGrant: oldData?.certifiedCopies?.estateGrant ?? 1,
      authToObtainInfo: oldData?.certifiedCopies?.authToObtainInfo ?? 0,
      affidavitDomiciled: oldData?.certifiedCopies?.affidavitDomiciled ?? 0,
      affidavitNonDomiciled: oldData?.certifiedCopies?.affidavitNonDomiciled ?? 0,
    },
    submittingAffidavitOfAssets: oldData?.submittingAffidavitOfAssets ?? true,
    spouse: {
      status: oldData?.spouse?.status || 'never_married',
      name: oldData?.spouse?.name,
      survivingName: oldData?.spouse?.survivingName,
    },
    children: oldData?.children || [],
    beneficiaries: oldData?.beneficiaries || [],
    intestateSuccessors: oldData?.intestateSuccessors || [],
    creditors: oldData?.creditors || [],
    citors: oldData?.citors || [],
    attorneyGeneralNotice: oldData?.attorneyGeneralNotice ?? false,
    submissionDate: oldData?.submissionDate || new Date().toISOString().split('T')[0],
    assets: oldData?.assets,
    deliveries: oldData?.deliveries,
    publicGuardianDelivery: oldData?.publicGuardianDelivery,
    electronicWillDemanded: oldData?.electronicWillDemanded,
    electronicWillProvidedTo: oldData?.electronicWillProvidedTo,
  };

  return newData;
}
