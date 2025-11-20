-- AlterTable
ALTER TABLE "WillSearchRequest" ALTER COLUMN "deceasedFullName" DROP NOT NULL,
ALTER COLUMN "executorEmail" DROP NOT NULL,
ALTER COLUMN "executorFullName" DROP NOT NULL;
