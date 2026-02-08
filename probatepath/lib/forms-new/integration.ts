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

// All 46 form generators mapped by ID
export const FORM_GENERATORS: Record<string, (data: NewEstateData) => Promise<Buffer>> = {
  'P1': generateP1,
  'P2': generateP2,
  'P3': (data: any) => generateP3({ ...data, applicantIndex: data.applicantIndex ?? 0 }),
  'P4': (data: any) => generateP4({ ...data, applicantIndex: data.applicantIndex ?? 0 }),
  'P5': (data: any) => generateP5({ ...data, applicantIndex: data.applicantIndex ?? 0 }),
  'P6': (data: any) => generateP6({ ...data, applicantIndex: data.applicantIndex ?? 0 }),
  'P7': (data: any) => generateP7({ ...data, applicantIndex: data.applicantIndex ?? 0 }),
  'P8': (data: any) => generateP8({ ...data, applicantIndex: data.applicantIndex ?? 0 }),
  'P9': (data: any) => generateP9({ ...data, applicantIndex: data.applicantIndex ?? 0, affidavitNumber: data.affidavitNumber ?? 2 }),
  'P10': (data: any) => generateP10({ ...data, applicantIndex: data.applicantIndex ?? 0, affidavitNumber: data.affidavitNumber ?? 3 }),
  'P11': (data: any) => generateP11({ ...data, applicantIndex: data.applicantIndex ?? 0, affidavitNumber: data.affidavitNumber ?? 3 }),
  'P12': generateP12,
  'P13': generateP13,
  'P14': generateP14,
  'P15': generateP15,
  'P16': generateP16,
  'P17': generateP17,
  'P18': generateP18,
  'P19': generateP19,
  'P20': generateP20,
  'P20.1': generateP20_1,
  'P21': generateP21,
  'P22': generateP22,
  'P23': generateP23,
  'P24': generateP24,
  'P25': generateP25,
  'P26': generateP26,
  'P27': generateP27,
  'P28': generateP28,
  'P29': generateP29,
  'P30': generateP30,
  'P31': generateP31,
  'P32': generateP32,
  'P33': generateP33,
  'P34': generateP34,
  'P35': generateP35,
  'P36': generateP36,
  'P37': generateP37,
  'P38': generateP38,
  'P39': generateP39,
  'P40': generateP40,
  'P41': generateP41,
  'P42': generateP42,
  'P43': generateP43,
  'P44': generateP44,
  'P45': generateP45,
  'P46': generateP46,
};

/**
 * Generate a form by ID
 */
export async function generateForm(formId: string, data: NewEstateData): Promise<Buffer> {
  const generator = FORM_GENERATORS[formId.toUpperCase()];
  if (!generator) {
    throw new Error(`Form ${formId} not available. Available forms: ${Object.keys(FORM_GENERATORS).join(', ')}`);
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
  // Default structure
  const newData: NewEstateData = {
    registry: oldData.registry || '',
    fileNumber: oldData.fileNumber,
    deceased: {
      firstName: oldData.deceased?.firstName || oldData.decFirstName || '',
      middleName: oldData.deceased?.middleName || oldData.decMiddleName,
      lastName: oldData.deceased?.lastName || oldData.decLastName || '',
      aliases: oldData.deceased?.aliases || oldData.decAliases || [],
      dateOfDeath: oldData.deceased?.dateOfDeath || oldData.decDateOfDeath || '',
      lastAddress: {
        streetNumber: oldData.deceased?.lastAddress?.streetNumber || '',
        streetName: oldData.deceased?.lastAddress?.streetName || '',
        poBox: oldData.deceased?.lastAddress?.poBox,
        city: oldData.deceased?.lastAddress?.city || oldData.decCity || '',
        province: oldData.deceased?.lastAddress?.province || oldData.decProvince || 'British Columbia',
        country: oldData.deceased?.lastAddress?.country || 'Canada',
        postalCode: oldData.deceased?.lastAddress?.postalCode || oldData.decPostalCode || '',
      },
      domiciledInBC: oldData.deceased?.domiciledInBC ?? true,
      nisgaaCitizen: oldData.deceased?.nisgaaCitizen ?? false,
      treatyFirstNation: oldData.deceased?.treatyFirstNation,
    },
    grantType: oldData.grantType || 'probate',
    will: oldData.will ? {
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
    foreignGrant: oldData.foreignGrant,
    applicants: (oldData.applicants || []).map((a: any) => ({
      firstName: a.firstName || a.firstname || '',
      middleName: a.middleName || a.middlename,
      lastName: a.lastName || a.lastname || '',
      address: {
        streetNumber: a.address?.streetNumber || '',
        streetName: a.address?.streetName || '',
        poBox: a.address?.poBox,
        city: a.address?.city || '',
        province: a.address?.province || 'British Columbia',
        country: a.address?.country || 'Canada',
        postalCode: a.address?.postalCode || '',
      },
      isIndividual: a.isIndividual ?? true,
      namedInWill: a.namedInWill ?? false,
      relationship: a.relationship,
      organizationTitle: a.organizationTitle,
    })),
    otherExecutors: oldData.otherExecutors || [],
    executorsWithReservedRights: oldData.executorsWithReservedRights || [],
    lawyer: oldData.lawyer,
    addressForService: {
      street: oldData.addressForService?.street || '',
      fax: oldData.addressForService?.fax,
      email: oldData.addressForService?.email,
      phone: oldData.addressForService?.phone || '',
    },
    affidavit: {
      form: oldData.affidavit?.form || 'P3',
      isJoint: oldData.affidavit?.isJoint ?? false,
      hasP8Affidavits: oldData.affidavit?.hasP8Affidavits ?? false,
      p8Count: oldData.affidavit?.p8Count,
    },
    affidavitsOfDelivery: oldData.affidavitsOfDelivery || [],
    noDeliveryRequired: oldData.noDeliveryRequired ?? false,
    allDocumentsInEnglish: oldData.allDocumentsInEnglish ?? true,
    translatorAffidavit: oldData.translatorAffidavit,
    additionalDocuments: oldData.additionalDocuments || [],
    certifiedCopies: {
      estateGrant: oldData.certifiedCopies?.estateGrant || 1,
      authToObtainInfo: oldData.certifiedCopies?.authToObtainInfo || 0,
      affidavitDomiciled: oldData.certifiedCopies?.affidavitDomiciled || 0,
      affidavitNonDomiciled: oldData.certifiedCopies?.affidavitNonDomiciled || 0,
    },
    submittingAffidavitOfAssets: oldData.submittingAffidavitOfAssets ?? true,
    spouse: {
      status: oldData.spouse?.status || 'never_married',
      name: oldData.spouse?.name,
      survivingName: oldData.spouse?.survivingName,
    },
    children: oldData.children || [],
    beneficiaries: oldData.beneficiaries || [],
    intestateSuccessors: oldData.intestateSuccessors || [],
    creditors: oldData.creditors || [],
    citors: oldData.citors || [],
    attorneyGeneralNotice: oldData.attorneyGeneralNotice ?? false,
    submissionDate: oldData.submissionDate || new Date().toISOString().split('T')[0],
    assets: oldData.assets,
    deliveries: oldData.deliveries,
    publicGuardianDelivery: oldData.publicGuardianDelivery,
    electronicWillDemanded: oldData.electronicWillDemanded,
    electronicWillProvidedTo: oldData.electronicWillProvidedTo,
  };

  return newData;
}
