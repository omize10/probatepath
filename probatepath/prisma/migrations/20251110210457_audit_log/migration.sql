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
