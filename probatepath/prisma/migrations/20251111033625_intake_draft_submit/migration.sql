-- AlterTable
ALTER TABLE "IntakeDraft" ADD COLUMN     "finalSnapshot" JSONB,
ADD COLUMN     "submittedAt" TIMESTAMPTZ;
