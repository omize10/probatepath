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
