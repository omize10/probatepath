-- AlterTable
ALTER TABLE "WillSearchRequest" ADD COLUMN     "aliases" TEXT[] DEFAULT ARRAY[]::TEXT[];
