/**
 * Integration layer between new form system and existing codebase
 * Maintains backward compatibility while using new PDF generation
 */

import { EstateData as NewEstateData } from './types';
import { generateP1, generateP2, generateP3, generateP5, generateP9, generateP10 } from './generators';

// Re-export types
export type { EstateData as NewEstateData } from './types';

// Form generation functions mapped to form IDs
export const FORM_GENERATORS: Record<string, (data: NewEstateData) => Promise<Buffer>> = {
  'P1': generateP1,
  'P2': generateP2,
  'P3': generateP3,
  'P5': generateP5,
  'P9': generateP9,
  'P10': generateP10,
};

/**
 * Generate a form by ID
 */
export async function generateForm(formId: string, data: NewEstateData): Promise<Buffer> {
  const generator = FORM_GENERATORS[formId.toUpperCase()];
  if (!generator) {
    throw new Error(`Form ${formId} not yet implemented. Available forms: ${Object.keys(FORM_GENERATORS).join(', ')}`);
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
 * This allows gradual migration from old system
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
