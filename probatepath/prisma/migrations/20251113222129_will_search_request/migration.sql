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
