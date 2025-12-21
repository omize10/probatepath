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
