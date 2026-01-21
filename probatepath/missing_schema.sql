-- Missing schema elements for ProbateDesk
-- Run this in Supabase SQL Editor

-- New enums
CREATE TYPE "Tier" AS ENUM ('basic', 'standard', 'premium');
CREATE TYPE "CallbackStatus" AS ENUM ('scheduled', 'call_in_progress', 'call_complete', 'intake_complete', 'cancelled', 'no_show');
CREATE TYPE "CallbackFileType" AS ENUM ('pdf', 'image');

-- Add missing PortalStatus enum values
ALTER TYPE "PortalStatus" ADD VALUE IF NOT EXISTS 'probate_filing_ready';
ALTER TYPE "PortalStatus" ADD VALUE IF NOT EXISTS 'probate_filing_in_progress';
ALTER TYPE "PortalStatus" ADD VALUE IF NOT EXISTS 'probate_filed';
ALTER TYPE "PortalStatus" ADD VALUE IF NOT EXISTS 'waiting_for_grant';
ALTER TYPE "PortalStatus" ADD VALUE IF NOT EXISTS 'grant_complete';

-- Add missing User columns
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "selectedTier" "Tier";
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "intakeMethod" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "isPremium" BOOLEAN NOT NULL DEFAULT false;

-- Add missing Matter columns
ALTER TABLE "Matter" ADD COLUMN IF NOT EXISTS "caseCode" TEXT UNIQUE;
ALTER TABLE "Matter" ADD COLUMN IF NOT EXISTS "p1CoverLetterPdfUrl" TEXT;
ALTER TABLE "Matter" ADD COLUMN IF NOT EXISTS "p1Status" TEXT NOT NULL DEFAULT 'not_started';
ALTER TABLE "Matter" ADD COLUMN IF NOT EXISTS "probateStatus" TEXT NOT NULL DEFAULT 'not_started';
ALTER TABLE "Matter" ADD COLUMN IF NOT EXISTS "willSearchStatus" TEXT NOT NULL DEFAULT 'not_started';
ALTER TABLE "Matter" ADD COLUMN IF NOT EXISTS "grantIssuedAt" TIMESTAMP(3);
ALTER TABLE "Matter" ADD COLUMN IF NOT EXISTS "p1PacketPdfUrl" TEXT;
ALTER TABLE "Matter" ADD COLUMN IF NOT EXISTS "registryAddress" TEXT;
ALTER TABLE "Matter" ADD COLUMN IF NOT EXISTS "registryName" TEXT;
ALTER TABLE "Matter" ADD COLUMN IF NOT EXISTS "formsPackageGeneratedAt" TIMESTAMP(3);
ALTER TABLE "Matter" ADD COLUMN IF NOT EXISTS "formsPackageUrl" TEXT;
ALTER TABLE "Matter" ADD COLUMN IF NOT EXISTS "formsGenerated" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- Add missing WillExtraction columns
ALTER TABLE "WillExtraction" ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "WillExtraction" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Add missing WillUpload columns
ALTER TABLE "WillUpload" ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "WillUpload" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Make DisclaimerAcceptance.userId optional (if not already)
ALTER TABLE "DisclaimerAcceptance" ALTER COLUMN "userId" DROP NOT NULL;

-- Create TierSelection table
CREATE TABLE IF NOT EXISTS "TierSelection" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "selectedTier" "Tier" NOT NULL,
    "tierPrice" INTEGER NOT NULL,
    "screeningFlags" JSONB NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TierSelection_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "TierSelection_userId_idx" ON "TierSelection"("userId");
ALTER TABLE "TierSelection" ADD CONSTRAINT "TierSelection_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Create BetaPayment table
CREATE TABLE IF NOT EXISTS "BetaPayment" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tierSelectionId" TEXT NOT NULL,
    "cardNumberPartial" TEXT,
    "cardholderName" TEXT,
    "billingAddress" TEXT,
    "city" TEXT,
    "province" TEXT,
    "postalCode" TEXT,
    "skipped" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "BetaPayment_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "BetaPayment_userId_idx" ON "BetaPayment"("userId");
CREATE INDEX IF NOT EXISTS "BetaPayment_tierSelectionId_idx" ON "BetaPayment"("tierSelectionId");
ALTER TABLE "BetaPayment" ADD CONSTRAINT "BetaPayment_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "BetaPayment" ADD CONSTRAINT "BetaPayment_tierSelectionId_fkey"
    FOREIGN KEY ("tierSelectionId") REFERENCES "TierSelection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Create CallbackSchedule table
CREATE TABLE IF NOT EXISTS "CallbackSchedule" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tierSelectionId" TEXT NOT NULL,
    "scheduledDate" DATE NOT NULL,
    "scheduledTime" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "status" "CallbackStatus" NOT NULL DEFAULT 'scheduled',
    "manualIntakeSelected" BOOLEAN NOT NULL DEFAULT false,
    "assignedWorker" TEXT,
    "callNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CallbackSchedule_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "CallbackSchedule_userId_idx" ON "CallbackSchedule"("userId");
CREATE INDEX IF NOT EXISTS "CallbackSchedule_tierSelectionId_idx" ON "CallbackSchedule"("tierSelectionId");
CREATE INDEX IF NOT EXISTS "CallbackSchedule_status_idx" ON "CallbackSchedule"("status");
CREATE INDEX IF NOT EXISTS "CallbackSchedule_scheduledDate_idx" ON "CallbackSchedule"("scheduledDate");
ALTER TABLE "CallbackSchedule" ADD CONSTRAINT "CallbackSchedule_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CallbackSchedule" ADD CONSTRAINT "CallbackSchedule_tierSelectionId_fkey"
    FOREIGN KEY ("tierSelectionId") REFERENCES "TierSelection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Create CallbackWillUpload table
CREATE TABLE IF NOT EXISTS "CallbackWillUpload" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "callbackScheduleId" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "fileType" "CallbackFileType" NOT NULL,
    "originalUrl" TEXT NOT NULL,
    "processedUrl" TEXT,
    "thumbnailUrl" TEXT,
    "qualityScore" INTEGER,
    "qualityWarnings" JSONB NOT NULL DEFAULT '[]',
    "fileSize" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CallbackWillUpload_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "CallbackWillUpload_userId_idx" ON "CallbackWillUpload"("userId");
CREATE INDEX IF NOT EXISTS "CallbackWillUpload_callbackScheduleId_idx" ON "CallbackWillUpload"("callbackScheduleId");
ALTER TABLE "CallbackWillUpload" ADD CONSTRAINT "CallbackWillUpload_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CallbackWillUpload" ADD CONSTRAINT "CallbackWillUpload_callbackScheduleId_fkey"
    FOREIGN KEY ("callbackScheduleId") REFERENCES "CallbackSchedule"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Create RetellIntake table
CREATE TABLE IF NOT EXISTS "RetellIntake" (
    "id" TEXT NOT NULL,
    "callbackScheduleId" TEXT NOT NULL,
    "retellCallId" TEXT,
    "callDuration" INTEGER,
    "recordingUrl" TEXT,
    "transcriptUrl" TEXT,
    "intakeData" JSONB NOT NULL,
    "confidenceScore" INTEGER,
    "flaggedFields" JSONB NOT NULL DEFAULT '[]',
    "pushedToEstate" BOOLEAN NOT NULL DEFAULT false,
    "estateId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "RetellIntake_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "RetellIntake_callbackScheduleId_key" ON "RetellIntake"("callbackScheduleId");
CREATE INDEX IF NOT EXISTS "RetellIntake_callbackScheduleId_idx" ON "RetellIntake"("callbackScheduleId");
ALTER TABLE "RetellIntake" ADD CONSTRAINT "RetellIntake_callbackScheduleId_fkey"
    FOREIGN KEY ("callbackScheduleId") REFERENCES "CallbackSchedule"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Create AvailabilitySlot table (for callback scheduling calendar)
CREATE TABLE IF NOT EXISTS "AvailabilitySlot" (
    "id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "time" TEXT NOT NULL,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AvailabilitySlot_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "AvailabilitySlot_date_time_key" ON "AvailabilitySlot"("date", "time");
CREATE INDEX IF NOT EXISTS "AvailabilitySlot_date_idx" ON "AvailabilitySlot"("date");
