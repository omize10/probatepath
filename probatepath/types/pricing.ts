// Pricing flow type definitions

export type Tier = 'basic' | 'standard' | 'premium';

export type CallbackStatus =
  | 'scheduled'
  | 'call_in_progress'
  | 'call_complete'
  | 'intake_complete'
  | 'cancelled'
  | 'no_show';

export type CallbackFileType = 'pdf' | 'image';

export interface TierSelection {
  id: string;
  userId: string;
  selectedTier: Tier;
  tierPrice: number;
  screeningFlags: string[];
  createdAt: Date;
}

export interface BetaPayment {
  id: string;
  userId: string;
  tierSelectionId: string;
  cardNumberPartial?: string;
  cardholderName?: string;
  billingAddress?: string;
  city?: string;
  province?: string;
  postalCode?: string;
  skipped: boolean;
  createdAt: Date;
}

export interface CallbackSchedule {
  id: string;
  userId: string;
  tierSelectionId: string;
  scheduledDate: string;
  scheduledTime: string;
  phoneNumber: string;
  status: CallbackStatus;
  manualIntakeSelected: boolean;
  assignedWorker?: string;
  callNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CallbackWillUpload {
  id: string;
  userId: string;
  callbackScheduleId: string;
  filename: string;
  fileType: CallbackFileType;
  originalUrl: string;
  processedUrl?: string;
  thumbnailUrl?: string;
  qualityScore?: number;
  qualityWarnings: string[];
  fileSize: number;
  createdAt: Date;
}

export interface RetellIntakeOutput {
  callId: string;
  callDuration: number;
  recordingUrl?: string;
  transcriptUrl?: string;
  intakeData: {
    deceased: {
      fullName: string;
      aliases?: string[];
      dateOfBirth: string;
      dateOfDeath: string;
      lastAddress: string;
      city: string;
      province: string;
      postalCode: string;
      maritalStatus: string;
      occupation?: string;
    };
    executor: {
      fullName: string;
      relationship: string;
      address: string;
      city: string;
      province: string;
      postalCode: string;
      phone: string;
      email: string;
    };
    will: {
      hasOriginal: boolean;
      dateSigned?: string;
      hasCodicils: boolean;
      codicilCount?: number;
      hasAlterations: boolean;
    };
    beneficiaries: Array<{
      name: string;
      relationship: string;
      address?: string;
      isMinor: boolean;
    }>;
    assets: Array<{
      type: string;
      description: string;
      estimatedValue?: number;
      location?: string;
    }>;
    liabilities: Array<{
      type: string;
      creditor: string;
      amount?: number;
    }>;
    flags: {
      foreignAssets: boolean;
      businessInterests: boolean;
      minorBeneficiaries: boolean;
      disabledBeneficiaries: boolean;
      expectedDisputes: boolean;
    };
  };
  confidence: {
    overall: number;
    flaggedFields: string[];
  };
}

export interface RetellIntake {
  id: string;
  callbackScheduleId: string;
  retellCallId?: string;
  callDuration?: number;
  recordingUrl?: string;
  transcriptUrl?: string;
  intakeData: RetellIntakeOutput['intakeData'];
  confidenceScore?: number;
  flaggedFields: string[];
  pushedToEstate: boolean;
  estateId?: string;
  createdAt: Date;
}

// Tier configuration
export interface TierFeature {
  name: string;
  included: boolean;
  note?: string;
}

export interface TierConfig {
  name: string;
  price: number;
  description: string;
  recommended: boolean;
  features: TierFeature[];
  cta: string;
}

export const TIER_PRICES: Record<Tier, number> = {
  basic: 799,
  standard: 1499,
  premium: 2499,
};

export const TIER_CONFIGS: TierConfig[] = [
  {
    name: 'Basic',
    price: 799,
    description: 'For tech-savvy executors with simple estates',
    recommended: false,
    features: [
      { name: 'Online intake questionnaire', included: true },
      { name: 'Automated probate form generation', included: true },
      { name: 'PDF filing instructions', included: true },
      { name: 'Email support (48-hour response)', included: true },
      { name: 'Human document review', included: false },
      { name: 'Phone/video support', included: false },
      { name: 'Requisition assistance', included: false },
      { name: 'Post-grant guidance', included: false },
    ],
    cta: 'Get Started',
  },
  {
    name: 'Standard',
    price: 1499,
    description: 'Most executors choose this for peace of mind',
    recommended: true,
    features: [
      { name: 'Everything in Basic', included: true },
      { name: 'Human review of all documents', included: true },
      { name: 'Phone/video support (scheduled calls)', included: true },
      { name: 'Free notarization in Vancouver', included: true, note: 'or $50 credit elsewhere' },
      { name: 'Post-grant checklist and templates', included: true },
      { name: 'One requisition response included', included: true },
      { name: 'Concierge support services', included: true },
      { name: 'Priority same-day response', included: false },
    ],
    cta: 'Get Started',
  },
  {
    name: 'Premium',
    price: 2499,
    description: 'White-glove service for complex estates',
    recommended: false,
    features: [
      { name: 'Everything in Standard', included: true },
      { name: 'Priority support (same-day response)', included: true },
      { name: 'Dedicated case coordinator', included: true },
      { name: 'Unlimited requisition assistance', included: true },
      { name: 'Post-grant administration guidance', included: true },
      { name: 'Tax filing reminders and CRA clearance guidance', included: true },
      { name: 'Distribution templates and calculations', included: true },
      { name: 'Comparable to lawyer at discounted price', included: true },
    ],
    cta: 'Get Started',
  },
];

// Canadian provinces for dropdown
export const PROVINCES = [
  { value: 'BC', label: 'British Columbia' },
  { value: 'AB', label: 'Alberta' },
  { value: 'SK', label: 'Saskatchewan' },
  { value: 'MB', label: 'Manitoba' },
  { value: 'ON', label: 'Ontario' },
  { value: 'QC', label: 'Quebec' },
  { value: 'NB', label: 'New Brunswick' },
  { value: 'NS', label: 'Nova Scotia' },
  { value: 'PE', label: 'Prince Edward Island' },
  { value: 'NL', label: 'Newfoundland and Labrador' },
  { value: 'YT', label: 'Yukon' },
  { value: 'NT', label: 'Northwest Territories' },
  { value: 'NU', label: 'Nunavut' },
];

// Time slots for callback scheduling (9 AM to 9 PM PST, 30-minute intervals)
export const TIME_SLOTS = [
  '9:00 AM', '9:30 AM',
  '10:00 AM', '10:30 AM',
  '11:00 AM', '11:30 AM',
  '12:00 PM', '12:30 PM',
  '1:00 PM', '1:30 PM',
  '2:00 PM', '2:30 PM',
  '3:00 PM', '3:30 PM',
  '4:00 PM', '4:30 PM',
  '5:00 PM', '5:30 PM',
  '6:00 PM', '6:30 PM',
  '7:00 PM', '7:30 PM',
  '8:00 PM', '8:30 PM',
  '9:00 PM',
];

// Accepted file types for will upload
export const ACCEPTED_FILE_TYPES = {
  'application/pdf': ['.pdf'],
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/heic': ['.heic'],
  'image/heif': ['.heif'],
};

export const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB
export const MAX_FILES = 10;
