-- Migration: 20241010120000_backend_mvp/
-- CreateEnum
CREATE TYPE "MatterStatus" AS ENUM ('DRAFT', 'INTAKE', 'REVIEW', 'PACK_READY', 'MAILED', 'DEFECT', 'DONE');

-- CreateEnum
CREATE TYPE "PackStatus" AS ENUM ('DRAFT', 'READY');

-- CreateEnum
CREATE TYPE "WillSearchStatus" AS ENUM ('READY', 'GENERATED', 'SENT');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Matter" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "clientKey" TEXT NOT NULL,
    "status" "MatterStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Matter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IntakeDraft" (
    "id" TEXT NOT NULL,
    "matterId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "consent" BOOLEAN NOT NULL,
    "exFullName" TEXT NOT NULL,
    "exPhone" TEXT,
    "exCity" TEXT NOT NULL,
    "exRelation" TEXT NOT NULL,
    "decFullName" TEXT NOT NULL,
    "decDateOfDeath" TIMESTAMP(3) NOT NULL,
    "decCityProv" TEXT NOT NULL,
    "hadWill" BOOLEAN NOT NULL,
    "willLocation" TEXT NOT NULL,
    "estateValueRange" TEXT NOT NULL,
    "anyRealProperty" BOOLEAN NOT NULL,
    "multipleBeneficiaries" BOOLEAN NOT NULL,
    "specialCircumstances" TEXT,
    "payload" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IntakeDraft_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WillSearchRequest" (
    "id" TEXT NOT NULL,
    "matterId" TEXT NOT NULL,
    "status" "WillSearchStatus" NOT NULL DEFAULT 'READY',
    "packetUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WillSearchRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GeneratedPack" (
    "id" TEXT NOT NULL,
    "matterId" TEXT NOT NULL,
    "status" "PackStatus" NOT NULL DEFAULT 'DRAFT',
    "zipUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GeneratedPack_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "File" (
    "id" TEXT NOT NULL,
    "matterId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "url" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "File_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmailLog" (
    "id" TEXT NOT NULL,
    "matterId" TEXT,
    "to" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "template" TEXT NOT NULL,
    "meta" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmailLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ResumeToken" (
    "token" TEXT NOT NULL,
    "matterId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ResumeToken_pkey" PRIMARY KEY ("token")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "matterId" TEXT NOT NULL,
    "actorId" TEXT,
    "action" TEXT NOT NULL,
    "meta" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Matter_clientKey_key" ON "Matter"("clientKey");

-- CreateIndex
CREATE UNIQUE INDEX "IntakeDraft_matterId_key" ON "IntakeDraft"("matterId");

-- CreateIndex
CREATE UNIQUE INDEX "GeneratedPack_matterId_key" ON "GeneratedPack"("matterId");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- AddForeignKey
ALTER TABLE "Matter" ADD CONSTRAINT "Matter_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IntakeDraft" ADD CONSTRAINT "IntakeDraft_matterId_fkey" FOREIGN KEY ("matterId") REFERENCES "Matter"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WillSearchRequest" ADD CONSTRAINT "WillSearchRequest_matterId_fkey" FOREIGN KEY ("matterId") REFERENCES "Matter"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GeneratedPack" ADD CONSTRAINT "GeneratedPack_matterId_fkey" FOREIGN KEY ("matterId") REFERENCES "Matter"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "File" ADD CONSTRAINT "File_matterId_fkey" FOREIGN KEY ("matterId") REFERENCES "Matter"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmailLog" ADD CONSTRAINT "EmailLog_matterId_fkey" FOREIGN KEY ("matterId") REFERENCES "Matter"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResumeToken" ADD CONSTRAINT "ResumeToken_matterId_fkey" FOREIGN KEY ("matterId") REFERENCES "Matter"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_matterId_fkey" FOREIGN KEY ("matterId") REFERENCES "Matter"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;


-- Migration: 20250212120000_portal_auth/
-- Add passwordHash column to existing User table
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "passwordHash" TEXT;

-- Create enum for auth audit types
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'AuthAuditType') THEN
    CREATE TYPE "AuthAuditType" AS ENUM ('REGISTER', 'LOGIN', 'LOGOUT');
  END IF;
END$$;

-- Create auth audit log table
CREATE TABLE IF NOT EXISTS "AuthAuditLog" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT,
  "type" "AuthAuditType" NOT NULL,
  "ip" TEXT,
  "userAgent" TEXT,
  "meta" JSONB,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT "AuthAuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL
);

-- Migration: 20251109020950_portal_credentials/
-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');

-- DropForeignKey
ALTER TABLE "AuthAuditLog" DROP CONSTRAINT "AuthAuditLog_userId_fkey";

-- AlterTable
ALTER TABLE "AuthAuditLog" ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'USER';

-- AddForeignKey
ALTER TABLE "AuthAuditLog" ADD CONSTRAINT "AuthAuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Migration: 20251109053058_email_verification_and_password_reset/
/*
  Warnings:

  - You are about to drop the column `identifier` on the `VerificationToken` table. All the data in the column will be lost.
  - The required column `id` was added to the `VerificationToken` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - Added the required column `userId` to the `VerificationToken` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "VerificationToken_identifier_token_key";

-- AlterTable
ALTER TABLE "VerificationToken" DROP COLUMN "identifier",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "id" TEXT NOT NULL,
ADD COLUMN     "userId" TEXT NOT NULL,
ADD CONSTRAINT "VerificationToken_pkey" PRIMARY KEY ("id");

-- CreateTable
CREATE TABLE "NextAuthVerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "PasswordResetToken" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PasswordResetToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "NextAuthVerificationToken_token_key" ON "NextAuthVerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "NextAuthVerificationToken_identifier_token_key" ON "NextAuthVerificationToken"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "PasswordResetToken_token_key" ON "PasswordResetToken"("token");

-- Migration: 20251109065238_add_auth_tokens/
/*
  Warnings:

  - You are about to drop the column `sessionToken` on the `Session` table. All the data in the column will be lost.
  - You are about to drop the `NextAuthVerificationToken` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "EmailActivityType" AS ENUM ('reset_password', 'verify_email');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "AuthAuditType" ADD VALUE 'VERIFY';
ALTER TYPE "AuthAuditType" ADD VALUE 'PASSWORD_RESET';

-- DropIndex
DROP INDEX "Session_sessionToken_key";

-- AlterTable
ALTER TABLE "Session" DROP COLUMN "sessionToken";

-- DropTable
DROP TABLE "NextAuthVerificationToken";

-- CreateTable
CREATE TABLE "EmailActivity" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "EmailActivityType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmailActivity_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "EmailActivity" ADD CONSTRAINT "EmailActivity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VerificationToken" ADD CONSTRAINT "VerificationToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PasswordResetToken" ADD CONSTRAINT "PasswordResetToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Migration: 20251110210457_audit_log/
/*
  Warnings:

  - The values [VERIFY,PASSWORD_RESET] on the enum `AuthAuditType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `emailVerified` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `EmailActivity` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PasswordResetToken` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `VerificationToken` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[sessionToken]` on the table `Session` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `sessionToken` to the `Session` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "AuthAuditType_new" AS ENUM ('REGISTER', 'LOGIN', 'LOGOUT');
ALTER TABLE "AuthAuditLog" ALTER COLUMN "type" TYPE "AuthAuditType_new" USING ("type"::text::"AuthAuditType_new");
ALTER TYPE "AuthAuditType" RENAME TO "AuthAuditType_old";
ALTER TYPE "AuthAuditType_new" RENAME TO "AuthAuditType";
DROP TYPE "public"."AuthAuditType_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "AuditLog" DROP CONSTRAINT "AuditLog_matterId_fkey";

-- DropForeignKey
ALTER TABLE "EmailActivity" DROP CONSTRAINT "EmailActivity_userId_fkey";

-- DropForeignKey
ALTER TABLE "PasswordResetToken" DROP CONSTRAINT "PasswordResetToken_userId_fkey";

-- DropForeignKey
ALTER TABLE "VerificationToken" DROP CONSTRAINT "VerificationToken_userId_fkey";

-- AlterTable
ALTER TABLE "AuditLog" ADD COLUMN     "ip" TEXT,
ADD COLUMN     "ua" TEXT,
ADD COLUMN     "userId" TEXT,
ALTER COLUMN "matterId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Session" ADD COLUMN     "sessionToken" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "emailVerified";

-- DropTable
DROP TABLE "EmailActivity";

-- DropTable
DROP TABLE "PasswordResetToken";

-- DropTable
DROP TABLE "VerificationToken";

-- DropEnum
DROP TYPE "EmailActivityType";

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_matterId_fkey" FOREIGN KEY ("matterId") REFERENCES "Matter"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Migration: 20251111033625_intake_draft_submit/
-- AlterTable
ALTER TABLE "IntakeDraft" ADD COLUMN     "finalSnapshot" JSONB,
ADD COLUMN     "submittedAt" TIMESTAMPTZ;

-- Migration: 20251113050956_matter_and_nuance_models/
/*
  Warnings:

  - Added the required column `deceasedFullName` to the `WillSearchRequest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `executorEmail` to the `WillSearchRequest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `executorFullName` to the `WillSearchRequest` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "BeneficiaryType" AS ENUM ('SPOUSE', 'CHILD', 'STEPCHILD', 'GRANDCHILD', 'PARENT', 'SIBLING', 'OTHER_FAMILY', 'CHARITY', 'OTHER');

-- CreateEnum
CREATE TYPE "BeneficiaryStatus" AS ENUM ('ALIVE', 'DECEASED_BEFORE_WILL', 'DECEASED_AFTER_WILL', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "ScheduleKind" AS ENUM ('EXECUTORS', 'BENEFICIARIES', 'MINORS', 'DECEASED_BENEFICIARIES', 'FOREIGN_ASSETS', 'IRREGULARITIES', 'NOTICES', 'OTHER');

-- AlterTable
ALTER TABLE "WillSearchRequest" ADD COLUMN     "courierAddress" TEXT,
ADD COLUMN     "deceasedCity" TEXT,
ADD COLUMN     "deceasedDateOfDeath" TIMESTAMP(3),
ADD COLUMN     "deceasedFullName" TEXT NOT NULL,
ADD COLUMN     "deceasedGivenNames" TEXT,
ADD COLUMN     "deceasedProvince" TEXT,
ADD COLUMN     "deceasedSurname" TEXT,
ADD COLUMN     "executorCity" TEXT,
ADD COLUMN     "executorEmail" TEXT NOT NULL,
ADD COLUMN     "executorFullName" TEXT NOT NULL,
ADD COLUMN     "executorGivenNames" TEXT,
ADD COLUMN     "executorPhone" TEXT,
ADD COLUMN     "executorRelationship" TEXT,
ADD COLUMN     "executorSurname" TEXT,
ADD COLUMN     "hasWill" BOOLEAN,
ADD COLUMN     "mailingPreference" TEXT,
ADD COLUMN     "searchNotes" TEXT;

-- CreateTable
CREATE TABLE "Executor" (
    "id" TEXT NOT NULL,
    "matterId" TEXT NOT NULL,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "isAlternate" BOOLEAN NOT NULL DEFAULT false,
    "orderIndex" INTEGER NOT NULL DEFAULT 0,
    "fullName" TEXT NOT NULL,
    "givenNames" TEXT,
    "surname" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "addressLine1" TEXT,
    "addressLine2" TEXT,
    "city" TEXT,
    "province" TEXT,
    "postalCode" TEXT,
    "country" TEXT,
    "isRenouncing" BOOLEAN NOT NULL DEFAULT false,
    "isMinor" BOOLEAN NOT NULL DEFAULT false,
    "isDeceased" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Executor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Beneficiary" (
    "id" TEXT NOT NULL,
    "matterId" TEXT NOT NULL,
    "type" "BeneficiaryType" NOT NULL,
    "status" "BeneficiaryStatus" NOT NULL DEFAULT 'ALIVE',
    "fullName" TEXT NOT NULL,
    "givenNames" TEXT,
    "surname" TEXT,
    "relationshipLabel" TEXT,
    "isMinor" BOOLEAN NOT NULL DEFAULT false,
    "dateOfBirth" TIMESTAMP(3),
    "addressLine1" TEXT,
    "addressLine2" TEXT,
    "city" TEXT,
    "province" TEXT,
    "postalCode" TEXT,
    "country" TEXT,
    "shareDescription" TEXT,
    "notes" TEXT,
    "representedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Beneficiary_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SupplementalSchedule" (
    "id" TEXT NOT NULL,
    "matterId" TEXT NOT NULL,
    "kind" "ScheduleKind" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "payload" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SupplementalSchedule_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Executor" ADD CONSTRAINT "Executor_matterId_fkey" FOREIGN KEY ("matterId") REFERENCES "Matter"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Beneficiary" ADD CONSTRAINT "Beneficiary_matterId_fkey" FOREIGN KEY ("matterId") REFERENCES "Matter"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Beneficiary" ADD CONSTRAINT "Beneficiary_representedById_fkey" FOREIGN KEY ("representedById") REFERENCES "Beneficiary"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupplementalSchedule" ADD CONSTRAINT "SupplementalSchedule_matterId_fkey" FOREIGN KEY ("matterId") REFERENCES "Matter"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Migration: 20251113051553_optional_willsearch_fields/
-- AlterTable
ALTER TABLE "WillSearchRequest" ALTER COLUMN "deceasedFullName" DROP NOT NULL,
ALTER COLUMN "executorEmail" DROP NOT NULL,
ALTER COLUMN "executorFullName" DROP NOT NULL;

-- Migration: 20251113222129_will_search_request/
/*
  Warnings:

  - You are about to drop the column `executorGivenNames` on the `WillSearchRequest` table. All the data in the column will be lost.
  - You are about to drop the column `executorSurname` on the `WillSearchRequest` table. All the data in the column will be lost.
  - You are about to drop the column `packetUrl` on the `WillSearchRequest` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `WillSearchRequest` table. All the data in the column will be lost.
  - Made the column `deceasedFullName` on table `WillSearchRequest` required. This step will fail if there are existing NULL values in that column.
  - Made the column `executorEmail` on table `WillSearchRequest` required. This step will fail if there are existing NULL values in that column.
  - Made the column `executorFullName` on table `WillSearchRequest` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "WillSearchRequest" DROP COLUMN "executorGivenNames",
DROP COLUMN "executorSurname",
DROP COLUMN "packetUrl",
DROP COLUMN "status",
ALTER COLUMN "deceasedFullName" SET NOT NULL,
ALTER COLUMN "executorEmail" SET NOT NULL,
ALTER COLUMN "executorFullName" SET NOT NULL;

-- Migration: 20251114025728_will_search_aliases/
-- AlterTable
ALTER TABLE "WillSearchRequest" ADD COLUMN     "aliases" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- Migration: 20251114055000_will_search_section_c/
ALTER TABLE "WillSearchRequest"
  ADD COLUMN "deceasedAliases" TEXT[] DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN "deceasedDateOfBirth" TIMESTAMPTZ,
  ADD COLUMN "deceasedPlaceOfBirth" TEXT,
  ADD COLUMN "deceasedMarriedSurname" TEXT;

UPDATE "WillSearchRequest"
SET "deceasedAliases" = COALESCE("aliases", ARRAY[]::TEXT[]);

ALTER TABLE "WillSearchRequest" DROP COLUMN "aliases";

-- Migration: 20251119070736_journey_status/
ALTER TABLE "Matter" ADD COLUMN     "journeyStatus" JSONB;

-- Migration: 20251120090000_right_fit_status/
CREATE TYPE "RightFitStatus" AS ENUM ('UNKNOWN', 'ELIGIBLE', 'NOT_FIT');

ALTER TABLE "Matter"
  ADD COLUMN "rightFitStatus" "RightFitStatus" NOT NULL DEFAULT 'UNKNOWN',
  ADD COLUMN "rightFitCompletedAt" TIMESTAMP(3),
  ADD COLUMN "rightFitAnswers" JSONB;

-- Migration: 20251127064750_add_matter_step_progress/
-- AlterTable
ALTER TABLE "WillSearchRequest" ALTER COLUMN "deceasedDateOfBirth" SET DATA TYPE TIMESTAMP(3);

-- CreateTable
CREATE TABLE "MatterStepProgress" (
    "id" TEXT NOT NULL,
    "matterId" TEXT NOT NULL,
    "stepKey" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'not_started',
    "pageIndex" INTEGER NOT NULL DEFAULT 0,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MatterStepProgress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MatterStepProgress_matterId_stepKey_key" ON "MatterStepProgress"("matterId", "stepKey");

-- AddForeignKey
ALTER TABLE "MatterStepProgress" ADD CONSTRAINT "MatterStepProgress_matterId_fkey" FOREIGN KEY ("matterId") REFERENCES "Matter"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Migration: 20251201045805_portal_case_reminders/
-- CreateEnum
CREATE TYPE "PortalStatus" AS ENUM ('intake_complete', 'docs_in_progress', 'waiting_on_client', 'waiting_on_court', 'finished');

-- AlterTable
ALTER TABLE "Matter" ADD COLUMN     "p1Mailed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "p1MailedAt" TIMESTAMP(3),
ADD COLUMN     "p1NoticesReady" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "portalStatus" "PortalStatus" NOT NULL DEFAULT 'intake_complete',
ADD COLUMN     "standardProbatePackageReady" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "willSearchPackageReady" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "Reminder" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "channel" TEXT NOT NULL,
    "dueAt" TIMESTAMP(3) NOT NULL,
    "sentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Reminder_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Reminder_dueAt_sentAt_idx" ON "Reminder"("dueAt", "sentAt");

-- CreateIndex
CREATE UNIQUE INDEX "Reminder_caseId_type_key" ON "Reminder"("caseId", "type");

-- AddForeignKey
ALTER TABLE "Reminder" ADD CONSTRAINT "Reminder_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Matter"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Migration: 20251201060000_portal_status_upgrade/
-- AlterEnum
BEGIN;
CREATE TYPE "PortalStatus_new" AS ENUM ('intake_complete', 'will_search_prepping', 'will_search_ready', 'will_search_sent', 'notices_in_progress', 'notices_waiting_21_days', 'probate_package_prepping', 'probate_package_ready', 'done');
ALTER TABLE "public"."Matter" ALTER COLUMN "portalStatus" DROP DEFAULT;
ALTER TABLE "Matter" ALTER COLUMN "portalStatus" TYPE "PortalStatus_new" USING ("portalStatus"::text::"PortalStatus_new");
ALTER TYPE "PortalStatus" RENAME TO "PortalStatus_old";
ALTER TYPE "PortalStatus_new" RENAME TO "PortalStatus";
DROP TYPE "public"."PortalStatus_old";
ALTER TABLE "Matter" ALTER COLUMN "portalStatus" SET DEFAULT 'intake_complete';
COMMIT;

-- AlterTable
ALTER TABLE "Matter" ADD COLUMN     "noticesMailedAt" TIMESTAMP(3),
ADD COLUMN     "noticesPreparedAt" TIMESTAMP(3),
ADD COLUMN     "probateFiledAt" TIMESTAMP(3),
ADD COLUMN     "probatePackagePreparedAt" TIMESTAMP(3),
ADD COLUMN     "willSearchMailedAt" TIMESTAMP(3),
ADD COLUMN     "willSearchPreparedAt" TIMESTAMP(3);


-- Migration: 20251201070000_portal_pdf_fields/
-- AlterTable
ALTER TABLE "Matter" ADD COLUMN     "p1NoticePdfUrl" TEXT,
ADD COLUMN     "probatePackagePdfUrl" TEXT,
ADD COLUMN     "willSearchPdfUrl" TEXT;


-- Migration: 20251209045000_add_will_tables/
-- CreateTable
CREATE TABLE IF NOT EXISTS "WillUpload" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "estateId" TEXT,
    "fileName" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "storagePath" TEXT NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "WillUpload_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "WillExtraction" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "uploadId" TEXT NOT NULL,
    "testatorName" TEXT,
    "willDate" TEXT,
    "executors" JSONB,
    "beneficiaries" JSONB,
    "hasCodicils" BOOLEAN,
    "handwrittenChanges" BOOLEAN,
    "issues" JSONB,
    "rawText" TEXT,
    "extractedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WillExtraction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "DisclaimerAcceptance" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "disclaimerType" TEXT NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "acceptedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DisclaimerAcceptance_pkey" PRIMARY KEY ("id")
);

-- Add columns to AuditLog (skip if table doesn't exist)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'AuditLog') THEN
        ALTER TABLE "AuditLog" ADD COLUMN IF NOT EXISTS "resourceType" TEXT;
        ALTER TABLE "AuditLog" ADD COLUMN IF NOT EXISTS "resourceId" TEXT;
        ALTER TABLE "AuditLog" ADD COLUMN IF NOT EXISTS "metadata" JSONB;
        ALTER TABLE "AuditLog" ADD COLUMN IF NOT EXISTS "ipAddress" TEXT;
        ALTER TABLE "AuditLog" ADD COLUMN IF NOT EXISTS "userAgent" TEXT;
    END IF;
END $$;

-- CreateIndex
CREATE INDEX IF NOT EXISTS "WillUpload_userId_idx" ON "WillUpload"("userId");
CREATE INDEX IF NOT EXISTS "WillUpload_expiresAt_idx" ON "WillUpload"("expiresAt");
CREATE INDEX IF NOT EXISTS "WillExtraction_userId_idx" ON "WillExtraction"("userId");
CREATE INDEX IF NOT EXISTS "WillExtraction_uploadId_idx" ON "WillExtraction"("uploadId");
CREATE INDEX IF NOT EXISTS "DisclaimerAcceptance_userId_idx" ON "DisclaimerAcceptance"("userId");
CREATE INDEX IF NOT EXISTS "AuditLog_userId_idx" ON "AuditLog"("userId");
CREATE INDEX IF NOT EXISTS "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- Migration: 20251212090000_will_files_per_matter/
-- CreateEnum
CREATE TYPE "WillFileType" AS ENUM ('pdf', 'image');

-- CreateTable
CREATE TABLE "WillFile" (
    "id" TEXT NOT NULL,
    "matterId" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileType" "WillFileType" NOT NULL,
    "originalFilename" TEXT NOT NULL,
    "pageIndex" INTEGER,
    "uploadedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WillFile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "WillFile_matterId_idx" ON "WillFile"("matterId");
CREATE INDEX "WillFile_matterId_fileType_idx" ON "WillFile"("matterId", "fileType");

-- AddForeignKey
ALTER TABLE "WillFile" ADD CONSTRAINT "WillFile_matterId_fkey" FOREIGN KEY ("matterId") REFERENCES "Matter"("id") ON DELETE CASCADE ON UPDATE CASCADE;

